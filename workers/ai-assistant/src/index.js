import * as jwt from '@tsndr/cloudflare-worker-jwt';

const json = (body, status, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
});

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    // IMPORTANTE: Adicionado 'Authorization' para permitir o envio do token
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function extractAnswer(interaction) {
  if (typeof interaction.output_text === "string") return interaction.output_text.trim();
  const outputs = (interaction.steps || []).filter((step) => step.type === "model_output");
  return outputs.flatMap((step) => step.content || [])
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text).join("\n").trim();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Rota de Health Check
    if (request.method === "GET" && url.pathname === "/") {
      return json({ service: "decsi-learning-ai-assistant", status: "ok" }, 200);
    }

    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);
    if (!cors) return json({ error: "Origem não autorizada." }, 403);
    
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405, cors);

    // ==========================================
    // 1. ROTA DE LOGIN (Para gerar o token)
    // ==========================================
    if (url.pathname === "/login") {
      try {
        const { email, password } = await request.json();
        
        // Consulta o usuário no D1
        const stmt = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND password = ?").bind(email, password).first();
        if (!stmt) return json({ error: "Credenciais inválidas" }, 401, cors);

        // Gera token válido por 24h
        const token = await jwt.sign({ sub: stmt.id, exp: Math.floor(Date.now() / 1000) + (24 * 3600) }, env.JWT_SECRET);
        return json({ token }, 200, cors);
      } catch (e) {
        return json({ error: "Solicitação inválida no login." }, 400, cors);
      }
    }

    // ==========================================
    // 2. ROTA DE CHAT (O seu código original protegido e com D1)
    // ==========================================
    if (url.pathname === "/chat" || url.pathname === "/") {
      
      // Validação do Token JWT
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return json({ error: "Token ausente ou formato inválido." }, 401, cors);
      }
      const token = authHeader.split(" ")[1];
      const isValid = await jwt.verify(token, env.JWT_SECRET);
      if (!isValid) return json({ error: "Token inválido ou expirado." }, 401, cors);

      // Descobre o ID do usuário logado
      const { payload: jwtPayload } = jwt.decode(token);
      const userId = jwtPayload.sub;

      if (!env.GEMINI_API_KEY) return json({ error: "A chave do assistente ainda não foi configurada." }, 503, cors);
      const contentLength = Number(request.headers.get("Content-Length") || 0);
      if (contentLength > 30000) return json({ error: "A solicitação é muito grande." }, 413, cors);

      let payload;
      try { payload = await request.json(); }
      catch { return json({ error: "Solicitação inválida." }, 400, cors); }
      const question = typeof payload.question === "string" ? payload.question.trim() : "";
      if (!question || question.length > 1500) return json({ error: "A pergunta deve ter entre 1 e 1.500 caracteres." }, 400, cors);

      try {
        const models = ["gemini-3.5-flash-lite"];
        for (const [index, model] of models.entries()) {
          const upstream = await fetch("https://generativelanguage.googleapis.com/v1/interactions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
            body: JSON.stringify({
              model,
              input: question,
              store: false,
              generation_config: { thinking_level: "low", max_output_tokens: 1200 }
            })
          });
          
          if (upstream.ok) {
            const interaction = await upstream.json();
            const answer = extractAnswer(interaction);
            if (!answer) return json({ error: "O serviço de IA retornou uma resposta vazia." }, 502, cors);
            
            // Grava a pergunta e a resposta no banco D1 associadas a este usuário
            try {
              await env.DB.prepare(
                "INSERT INTO messages (user_id, prompt, reply) VALUES (?, ?, ?)"
              ).bind(userId, question, answer).run();
            } catch (dbError) {
              console.error("Erro ao salvar no banco de dados D1:", dbError);
            }

            return json({ answer, model }, 200, cors);
          }

          const details = await upstream.json().catch(() => ({}));
          const providerMessage = typeof details.error?.message === "string"
            ? details.error.message.slice(0, 600)
            : "sem detalhes retornados pelo provedor";
          console.error("Gemini API error", model, upstream.status, providerMessage);
          if (upstream.status === 503 && index < models.length - 1) continue;
          const status = upstream.status === 429 ? 429 : 502;
          return json({ error: `Gemini API (${model}) respondeu HTTP ${upstream.status}: ${providerMessage}` }, status, cors);
        }
        return json({ error: "Os modelos de IA estão temporariamente indisponíveis." }, 502, cors);
      } catch (error) {
        const reason = error instanceof Error ? error.message.slice(0, 300) : "erro de rede desconhecido";
        console.error("Gemini request failed", reason);
        return json({ error: `Falha ao chamar a Gemini API: ${reason}` }, 502, cors);
      }
    }

    return json({ error: "Rota não encontrada." }, 404, cors);
  }
};