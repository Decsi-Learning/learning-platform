(() => {
  const endpoint = "https://gemini-proxy.scrrhdvp7v.workers.dev/";
  document.body.insertAdjacentHTML("beforeend", `
    <div class="assistant-widget">
      <section class="assistant-panel" id="site-assistant-panel" aria-labelledby="site-assistant-title" hidden>
        <header class="assistant-head">
          <div><h2 id="site-assistant-title">Assistente de estudos</h2><p>Somente sua mensagem é enviada à IA.</p></div>
          <button class="assistant-close" id="site-assistant-close" type="button" aria-label="Fechar assistente">×</button>
        </header>
        <div class="assistant-transcript" id="site-assistant-transcript" aria-live="polite"></div>
        <p class="assistant-status" id="site-assistant-status" role="status" aria-live="polite">O assistente está pronto para responder.</p>
        <form class="assistant-form" id="site-assistant-form">
          <label class="assistant-sr-only" for="site-assistant-question">Sua pergunta</label>
          <textarea id="site-assistant-question" maxlength="1500" rows="2" placeholder="Escreva sua pergunta…" required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </section>
      <button class="assistant-launcher" id="site-assistant-launcher" type="button" aria-label="Abrir assistente de estudos" aria-expanded="false" aria-controls="site-assistant-panel">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.3-3.3A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 11.5h7M8.5 14.5h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    </div>
  `);

  const panel = document.getElementById("site-assistant-panel");
  const launcher = document.getElementById("site-assistant-launcher");
  const close = document.getElementById("site-assistant-close");
  const form = document.getElementById("site-assistant-form");
  const questionField = document.getElementById("site-assistant-question");
  const transcript = document.getElementById("site-assistant-transcript");
  const status = document.getElementById("site-assistant-status");

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "Assistente aberto" : "Abrir assistente de estudos");
    if (open) questionField.focus();
    else launcher.focus();
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  questionField.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = questionField.value.trim();
    if (!question) return;

    const submitButton = form.querySelector("button");
    const userMessage = document.createElement("div");
    userMessage.className = "assistant-message user";
    userMessage.textContent = question;
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "assistant-message typing";
    typingIndicator.setAttribute("aria-hidden", "true");
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    transcript.append(userMessage);
    transcript.append(typingIndicator);
    transcript.scrollTop = transcript.scrollHeight;
    questionField.value = "";
    submitButton.disabled = true;
    status.textContent = "O assistente está digitando…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const result = await response.json();
      if (!response.ok) {
        const message = typeof result.error === "string" ? result.error : result.error?.message;
        throw new Error(message || "Não foi possível obter uma resposta.");
      }
      const answer = document.createElement("div");
      answer.className = "assistant-message markdown";
      answer.innerHTML = renderAssistantMarkdown(result.answer);
      transcript.append(answer);
      status.textContent = "Resposta gerada por IA. Confira informações importantes.";
    } catch (error) {
      const errorMessage = document.createElement("div");
      errorMessage.className = "assistant-message error";
      errorMessage.textContent = error.message || "O assistente está indisponível no momento.";
      transcript.append(errorMessage);
      status.textContent = "Tente novamente em instantes.";
    } finally {
      typingIndicator.remove();
      transcript.scrollTop = transcript.scrollHeight;
      submitButton.disabled = false;
      questionField.focus();
    }
  });
})();

function escapeAssistantHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderAssistantInline(value) {
  return escapeAssistantHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderAssistantMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const output = [];
  let paragraph = [];
  let listType = "";
  let inCode = false;
  let code = [];

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${renderAssistantInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = "";
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph(); closeList();
      if (inCode) {
        output.push(`<pre><code>${escapeAssistantHtml(code.join("\n"))}</code></pre>`);
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) { code.push(line); continue; }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const item = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
    const quote = line.match(/^>\s?(.*)$/);
    if (!line.trim()) { flushParagraph(); closeList(); }
    else if (/^\s*---+\s*$/.test(line)) { flushParagraph(); closeList(); output.push("<hr>"); }
    else if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderAssistantInline(heading[2])}</h${level}>`);
    } else if (item) {
      flushParagraph();
      const nextType = /^\d/.test(item[1]) ? "ol" : "ul";
      if (listType !== nextType) { closeList(); output.push(`<${nextType}>`); listType = nextType; }
      output.push(`<li>${renderAssistantInline(item[2])}</li>`);
    } else if (quote) {
      flushParagraph(); closeList();
      output.push(`<blockquote>${renderAssistantInline(quote[1])}</blockquote>`);
    } else {
      closeList(); paragraph.push(line.trim());
    }
  }
  flushParagraph(); closeList();
  if (inCode) output.push(`<pre><code>${escapeAssistantHtml(code.join("\n"))}</code></pre>`);
  return output.join("\n");
}
