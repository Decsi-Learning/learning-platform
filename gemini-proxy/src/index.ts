const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/interactions";
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const PASSWORD_ITERATIONS = 100_000;

function json(body: unknown, status: number, headers: HeadersInit = {}): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json; charset=utf-8", ...Object.fromEntries(new Headers(headers)) },
	});
}

function corsHeaders(origin: string | null, env: Env): Headers | null {
	const allowed = (env.ALLOWED_ORIGINS || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
	if (!origin || !allowed.includes(origin)) return null;

	return new Headers({
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	});
}

function withCors(headers: Headers, cors: Headers): Headers {
	const result = new Headers(headers);
	cors.forEach((value, key) => result.set(key, value));
	return result;
}

function base64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
	return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function encodeJson(value: unknown): string {
	return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const derived = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS },
		key,
		256,
	);
	return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${base64Url(salt)}$${base64Url(new Uint8Array(derived))}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
	try {
		const [algorithm, iterationValue, saltValue, hashValue] = encoded.split("$");
		const iterations = Number(iterationValue);
		if (algorithm !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < 1 || iterations > PASSWORD_ITERATIONS) return false;
		const salt = fromBase64Url(saltValue);
		const expected = fromBase64Url(hashValue);
		if (salt.length !== 16 || expected.length !== 32) return false;
		const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
		const actual = new Uint8Array(await crypto.subtle.deriveBits(
			{ name: "PBKDF2", hash: "SHA-256", salt, iterations },
			key,
			256,
		));
		let difference = 0;
		for (let index = 0; index < expected.length; index++) difference |= expected[index] ^ actual[index];
		return difference === 0;
	} catch {
		return false;
	}
}

async function signSession(payload: Record<string, unknown>, secret: string): Promise<string> {
	const header = encodeJson({ alg: "HS256", typ: "JWT" });
	const body = encodeJson(payload);
	const content = `${header}.${body}`;
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(content)));
	return `${content}.${base64Url(signature)}`;
}

async function verifySession(token: string, secret: string): Promise<{ id: number; email: string; firstName?: string; lastName?: string } | null> {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) return null;
		const header = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0]))) as { alg?: string; typ?: string };
		const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1]))) as {
			iss?: string; sub?: string; email?: string; firstName?: string; lastName?: string; iat?: number; exp?: number;
		};
		if (header.alg !== "HS256" || header.typ !== "JWT" || payload.iss !== "decsi-learning") return null;
		if (!payload.sub || !/^\d+$/.test(payload.sub) || !payload.email || !Number.isInteger(payload.exp)) return null;
		const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
		const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
		if (!valid || (payload.exp as number) <= Math.floor(Date.now() / 1000)) return null;
		return { id: Number(payload.sub), email: payload.email, firstName: payload.firstName || "", lastName: payload.lastName || "" };
	} catch {
		return null;
	}
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
	try {
		const value: unknown = await request.json();
		return value && typeof value === "object" && !Array.isArray(value)
			? (value as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

async function registerUser(request: Request, env: Env, cors: Headers): Promise<Response> {
	if (!env.chat_db) return json({ error: "O banco D1 ainda não está vinculado ao Worker." }, 503, cors);
	const contentLength = Number(request.headers.get("Content-Length") || 0);
	if (contentLength > 4096) return json({ error: "A solicitação é muito grande." }, 413, cors);

	const payload = await readJson(request);
	if (!payload) return json({ error: "Envie os dados do cadastro em formato JSON." }, 400, cors);
	const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
	const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
	const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
	const password = typeof payload.password === "string" ? payload.password : "";
	if (!firstName || firstName.length > 80) return json({ error: "Informe um nome de até 80 caracteres." }, 400, cors);
	if (!lastName || lastName.length > 80) return json({ error: "Informe um sobrenome de até 80 caracteres." }, 400, cors);
	if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: "Informe um endereço de e-mail válido." }, 400, cors);
	}
	if (password.length < 12 || password.length > 128) {
		return json({ error: "A senha deve ter entre 12 e 128 caracteres." }, 400, cors);
	}

	try {
		const passwordHash = await hashPassword(password);
		await env.chat_db.prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)")
			.bind(firstName, lastName, email, passwordHash)
			.run();
		return json({ message: "Cadastro realizado com sucesso." }, 201, cors);
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/UNIQUE constraint failed:\s*users\.email/i.test(message)) {
			return json({ error: "Já existe uma conta cadastrada com esse e-mail." }, 409, cors);
		}
		if (/no such table:\s*users/i.test(message)) {
			return json({ error: "A tabela users ainda não existe no D1. Aplique schema.sql ao banco chat-db." }, 503, cors);
		}
		if (/no such column/i.test(message)) {
			return json({ error: "A estrutura da tabela users no D1 não corresponde a schema.sql." }, 503, cors);
		}
		console.error("Registration storage error", message.slice(0, 300));
		return json({ error: "Não foi possível salvar o cadastro. Tente novamente." }, 500, cors);
	}
}

async function loginUser(request: Request, env: Env, cors: Headers): Promise<Response> {
	if (!env.chat_db) return json({ error: "O banco D1 ainda não está vinculado ao Worker." }, 503, cors);
	if (!env.SESSION_SECRET || new TextEncoder().encode(env.SESSION_SECRET).length < 32) {
		return json({ error: "A chave de sessão ainda não está configurada." }, 503, cors);
	}
	const contentLength = Number(request.headers.get("Content-Length") || 0);
	if (contentLength > 4096) return json({ error: "A solicitação é muito grande." }, 413, cors);
	const payload = await readJson(request);
	if (!payload) return json({ error: "Envie os dados de login em formato JSON." }, 400, cors);
	const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
	const password = typeof payload.password === "string" ? payload.password : "";
	if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length === 0 || password.length > 128) {
		return json({ error: "E-mail ou senha incorretos." }, 401, cors);
	}

	try {
		const user = await env.chat_db.prepare("SELECT id, first_name, last_name, email, password FROM users WHERE email = ? LIMIT 1")
			.bind(email)
			.first<{ id: number; first_name: string; last_name: string; email: string; password: string }>();
		const passwordMatches = user
			? await verifyPassword(password, user.password)
			: (await hashPassword(password), false);
		if (!user || !passwordMatches) return json({ error: "E-mail ou senha incorretos." }, 401, cors);

		const now = Math.floor(Date.now() / 1000);
		const expiresAt = now + 60 * 60 * 24;
		const firstName = user.first_name || "";
		const lastName = user.last_name || "";
		const token = await signSession({ iss: "decsi-learning", sub: String(user.id), email: user.email, firstName, lastName, iat: now, exp: expiresAt }, env.SESSION_SECRET);
		return json({ token, expiresAt, user: { id: user.id, email: user.email, firstName, lastName } }, 200, cors);
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/no such table:\s*users/i.test(message)) {
			return json({ error: "A tabela users ainda não existe no D1." }, 503, cors);
		}
		console.error("Login storage error", message.slice(0, 300));
		return json({ error: "Não foi possível validar o login. Tente novamente." }, 500, cors);
	}
}

async function currentUser(request: Request, env: Env, cors: Headers): Promise<Response> {
	if (!env.SESSION_SECRET) return json({ error: "A chave de sessão não está configurada." }, 503, cors);
	const authorization = request.headers.get("Authorization") || "";
	const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
	const user = token ? await verifySession(token, env.SESSION_SECRET) : null;
	return user
		? json({ user }, 200, cors)
		: json({ error: "Sua sessão expirou. Entre novamente." }, 401, cors);
}

async function progressUser(request: Request, env: Env): Promise<{ id: number; email: string; firstName?: string; lastName?: string } | null> {
	if (!env.SESSION_SECRET) return null;
	const authorization = request.headers.get("Authorization") || "";
	const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
	return token ? verifySession(token, env.SESSION_SECRET) : null;
}

async function readProgress(request: Request, env: Env, cors: Headers): Promise<Response> {
	const user = await progressUser(request, env);
	if (!user) return json({ error: "Entre na sua conta para acessar seu progresso." }, 401, cors);
	try {
		const result = await env.chat_db.prepare(
			"SELECT track_id, topic_id, status, last_accessed_at, completed_at FROM learning_progress WHERE user_id = ? ORDER BY last_accessed_at DESC",
		).bind(user.id).all<{ track_id: string; topic_id: string; status: string; last_accessed_at: string; completed_at: string | null }>();
		const pageResult = await env.chat_db.prepare(
			"SELECT track_id, topic_id, page_id, last_accessed_at FROM learning_page_progress WHERE user_id = ?",
		).bind(user.id).all<{ track_id: string; topic_id: string; page_id: string; last_accessed_at: string }>();
		const progress = (result.results || []).map((row) => ({
			trackId: row.track_id,
			topicId: row.topic_id,
			status: row.status,
			lastAccessedAt: row.last_accessed_at,
			completedAt: row.completed_at,
		}));
		const pages = (pageResult.results || []).map((row) => ({
			trackId: row.track_id,
			topicId: row.topic_id,
			pageId: row.page_id,
			lastAccessedAt: row.last_accessed_at,
		}));
		return json({ progress, pages }, 200, cors);
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/no such table:\s*learning_(?:page_)?progress/i.test(message)) {
			return json({ error: "A tabela de progresso ainda não existe no D1. Aplique as migrações do banco." }, 503, cors);
		}
		console.error("Progress read error", message.slice(0, 300));
		return json({ error: "Não foi possível carregar seu progresso." }, 500, cors);
	}
}

async function saveProgress(request: Request, env: Env, cors: Headers): Promise<Response> {
	const user = await progressUser(request, env);
	if (!user) return json({ error: "Entre na sua conta para salvar seu progresso." }, 401, cors);
	const payload = await readJson(request);
	if (!payload) return json({ error: "Envie os dados do progresso em formato JSON." }, 400, cors);
	const trackId = typeof payload.trackId === "string" ? payload.trackId : "";
	const topicId = typeof payload.topicId === "string" ? payload.topicId : "";
	const pageId = typeof payload.pageId === "string" ? payload.pageId : "";
	const status = payload.status === "completed" || payload.status === "in_progress" ? payload.status : "";
	if (!["aeds-i", "aeds-ii"].includes(trackId) || !/^[a-z0-9-]{1,100}$/.test(topicId) || !/^[a-z0-9-]{1,100}$/.test(pageId) || !status) {
		return json({ error: "Os dados do tópico ou do progresso são inválidos." }, 400, cors);
	}
	try {
		const accessedAt = new Date().toISOString();
		const topicStatement = env.chat_db.prepare(`
			INSERT INTO learning_progress (user_id, track_id, topic_id, status, last_accessed_at, completed_at)
			VALUES (?, ?, ?, ?, ?, CASE WHEN ? = 'completed' THEN ? ELSE NULL END)
			ON CONFLICT (user_id, track_id, topic_id) DO UPDATE SET
				status = CASE WHEN learning_progress.status = 'completed' THEN 'completed' ELSE excluded.status END,
				last_accessed_at = excluded.last_accessed_at,
				completed_at = CASE
					WHEN excluded.status = 'completed' THEN COALESCE(learning_progress.completed_at, excluded.completed_at)
					ELSE learning_progress.completed_at
				END
		`).bind(user.id, trackId, topicId, status, accessedAt, status, accessedAt);
		const pageStatement = env.chat_db.prepare(`
			INSERT INTO learning_page_progress (user_id, track_id, topic_id, page_id, last_accessed_at)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT (user_id, track_id, topic_id, page_id) DO UPDATE SET last_accessed_at = excluded.last_accessed_at
		`).bind(user.id, trackId, topicId, pageId, accessedAt);
		await env.chat_db.batch([topicStatement, pageStatement]);
		return json({ message: "Progresso salvo." }, 200, cors);
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/no such table:\s*learning_(?:page_)?progress/i.test(message)) {
			return json({ error: "A tabela de progresso ainda não existe no D1. Aplique as migrações do banco." }, 503, cors);
		}
		console.error("Progress save error", message.slice(0, 300));
		return json({ error: "Não foi possível salvar seu progresso." }, 500, cors);
	}
}

function extractAnswer(interaction: Record<string, unknown>): string {
	if (typeof interaction.output_text === "string") return interaction.output_text.trim();
	const steps = Array.isArray(interaction.steps) ? interaction.steps as Array<Record<string, unknown>> : [];
	return steps
		.filter((step) => step.type === "model_output")
		.flatMap((step) => Array.isArray(step.content) ? step.content as Array<Record<string, unknown>> : [])
		.filter((part) => part.type === "text" && typeof part.text === "string")
		.map((part) => part.text as string)
		.join("\n")
		.trim();
}

async function askGemini(request: Request, env: Env, cors: Headers): Promise<Response> {
	if (!env.GEMINI_API_KEY) return json({ error: "A chave da Gemini API não está configurada." }, 503, cors);
	const contentLength = Number(request.headers.get("Content-Length") || 0);
	if (contentLength > 4096) return json({ error: "A pergunta é muito longa." }, 413, cors);
	const payload = await readJson(request);
	const question = typeof payload?.question === "string" ? payload.question.trim() : "";
	if (!question || question.length > 1500) {
		return json({ error: "A pergunta deve ter entre 1 e 1.500 caracteres." }, 400, cors);
	}

	try {
		const upstream = await fetch(GEMINI_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
			body: JSON.stringify({
				model: GEMINI_MODEL,
				input: question,
				store: false,
				generation_config: { thinking_level: "low", max_output_tokens: 1200 },
			}),
		});
		if (!upstream.ok) {
			const details = await upstream.json().catch(() => ({})) as { error?: { message?: string } };
			const providerMessage = typeof details.error?.message === "string"
				? details.error.message.slice(0, 600)
				: "sem detalhes retornados pelo provedor";
			console.error("Gemini API error", upstream.status, providerMessage);
			return json({ error: `Gemini API respondeu HTTP ${upstream.status}: ${providerMessage}` }, upstream.status === 429 ? 429 : 502, cors);
		}

		const interaction = await upstream.json() as Record<string, unknown>;
		const answer = extractAnswer(interaction);
		if (!answer) return json({ error: "O serviço de IA retornou uma resposta vazia." }, 502, cors);
		return json({ answer }, 200, cors);
	} catch (error) {
		const message = error instanceof Error ? error.message.slice(0, 300) : "erro de rede desconhecido";
		console.error("Gemini request failed", message);
		return json({ error: `Falha ao chamar a Gemini API: ${message}` }, 502, cors);
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (request.method === "GET" && url.pathname === "/") {
			return json({ service: "decsi-learning-ai-assistant", status: "ok" }, 200);
		}

		const cors = corsHeaders(request.headers.get("Origin"), env);
		if (!cors) return json({ error: "Origem não autorizada." }, 403);
		if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
		if (url.pathname === "/api/progress" && request.method === "GET") return readProgress(request, env, cors);
		if (url.pathname === "/api/progress" && request.method === "POST") return saveProgress(request, env, cors);
		if (url.pathname === "/api/me" && request.method === "GET") return currentUser(request, env, cors);
		if (request.method !== "POST") return json({ error: "Método não permitido." }, 405, cors);

		if (url.pathname === "/api/register") return registerUser(request, env, cors);
		if (url.pathname === "/api/login") return loginUser(request, env, cors);
		if (url.pathname === "/" || url.pathname === "/api/chat") return askGemini(request, env, cors);
		return json({ error: "Rota não encontrada." }, 404, cors);
	},
} satisfies ExportedHandler<Env>;
