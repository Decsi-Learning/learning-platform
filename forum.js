(() => {
  const API = "https://gemini-proxy.scrrhdvp7v.workers.dev/api";
  const token = () => sessionStorage.getItem("decsi.sessionToken") || "";
  const $ = (selector, root = document) => root.querySelector(selector);
  const feed = $("#forum-feed");
  const status = $("#forum-status");
  const dialog = $("#post-dialog");
  const form = $("#post-form");
  const moderationDialog = $("#moderation-dialog");
  const moderationForm = $("#moderation-form");
  const trackFilter = $("#track-filter");
  const topicFilter = $("#topic-filter");
  const postTrack = $("#post-track");
  const postTopic = $("#post-topic");
  let tracks = [];
  let posts = [];

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Não foi possível concluir esta ação.");
    return result;
  }

  function nameFor(user) {
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || "Estudante";
  }

  function formatDate(value) {
    const date = new Date(`${value}${value?.endsWith("Z") ? "" : "Z"}`);
    return Number.isNaN(date.getTime()) ? "agora" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function buildOptions(select, options, placeholder) {
    select.replaceChildren(new Option(placeholder, ""));
    for (const item of options) select.add(new Option(item.label, item.value));
  }

  async function loadCatalogs() {
    try {
      tracks = (await (await fetch("content/trilhas.json", { cache: "no-cache" })).json()).tracks || [];
      buildOptions(trackFilter, tracks.map((track) => ({ label: track.title, value: track.id })), "Todas as trilhas");
      buildOptions($("#post-track"), tracks.map((track) => ({ label: track.title, value: track.id })), "Geral");
      populateTopics(trackFilter.value, topicFilter, "Todos os conteúdos");
      populateTopics(postTrack.value, postTopic, "Sem conteúdo específico");
    } catch { /* O fórum geral continua disponível se o catálogo falhar. */ }
  }

  async function populateTopics(trackId, select, placeholder) {
    const track = tracks.find((item) => item.id === trackId);
    if (!track) { buildOptions(select, [], placeholder); return; }
    try {
      const response = await fetch(track.catalog || `content/${track.id}/topicos.json`, { cache: "no-cache" });
      const catalog = await response.json();
      const topics = (catalog.topics || []).flatMap((topic) => topic.pages?.length ? topic.pages.map((page) => ({ id: page.id, title: `${topic.title} · ${page.title}` })) : [topic]);
      buildOptions(select, topics.map((topic) => ({ label: topic.title, value: topic.id })), placeholder);
    } catch { buildOptions(select, [], placeholder); }
  }

  function button(text, className, action, label = text) {
    const element = document.createElement("button");
    element.type = "button"; element.className = className; element.dataset.action = action; element.textContent = text; element.setAttribute("aria-label", label);
    return element;
  }

  function appendMenuActions(container, kind, item, owner) {
    const admin = sessionStorage.getItem("decsi.sessionRole") === "admin";
    if (owner) {
      container.append(button("Editar", "text-button", `edit-${kind}`));
      if (!admin) container.append(button("Excluir", "text-button danger", `delete-${kind}`));
    } else container.append(button("Denunciar", "text-button", `report-${kind}`, `Denunciar ${kind === "post" ? "publicação" : "resposta"}`));
    if (admin) container.append(button("Remover", "text-button danger", `moderate-${kind}`, `Remover ${kind === "post" ? "publicação" : "resposta"} como administrador`));
  }

  function appendAdminBadge(nameContainer, role) {
    if (role !== "admin") return;
    const badge = document.createElement("span");
    badge.className = "admin-author-badge";
    badge.textContent = "Admin";
    badge.setAttribute("aria-label", "Administrador");
    nameContainer.append(badge);
  }

  function renderReply(reply, post) {
    const article = document.createElement("article");
    article.className = "reply"; article.dataset.replyId = reply.id;
    const head = document.createElement("div"); head.className = "reply-head";
    const authorLine = document.createElement("div"); authorLine.className = "author-line";
    const author = document.createElement("strong"); author.textContent = nameFor(reply); authorLine.append(author); appendAdminBadge(authorLine, reply.author_role);
    const date = document.createElement("time"); date.dateTime = reply.created_at; date.textContent = formatDate(reply.created_at);
    head.append(authorLine, date);
    const body = document.createElement("p"); body.className = "content-text"; body.textContent = reply.body;
    const actions = document.createElement("div"); actions.className = "content-actions";
    const helpful = button(`Útil · ${reply.helpful_count || 0}`, `helpful-button${reply.helpful_by_me ? " is-helpful" : ""}`, "helpful", "Marcar resposta como útil");
    const heart = document.createElement("span"); heart.dataset.lucide = "heart"; heart.className = "helpful-icon";
    helpful.prepend(heart);
    helpful.disabled = !token(); actions.append(helpful);
    appendMenuActions(actions, "reply", reply, Boolean(reply.is_mine));
    article.append(head, body, actions);
    return article;
  }

  function renderPost(post) {
    const article = document.createElement("article");
    article.className = "post-card"; article.dataset.postId = post.id;
    const head = document.createElement("div"); head.className = "post-head";
    const main = document.createElement("div"); main.className = "post-author";
    const initials = document.createElement("span"); initials.className = "author-avatar"; initials.textContent = nameFor(post).split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    const byline = document.createElement("div"); const authorLine = document.createElement("div"); authorLine.className = "author-line"; const author = document.createElement("strong"); author.textContent = nameFor(post); authorLine.append(author); appendAdminBadge(authorLine, post.author_role);
    const date = document.createElement("time"); date.dateTime = post.created_at; date.textContent = formatDate(post.created_at);
    byline.append(authorLine, date); main.append(initials, byline);
    const actions = document.createElement("div"); actions.className = "content-actions"; appendMenuActions(actions, "post", post, Boolean(post.is_mine));
    head.append(main, actions);
    const title = document.createElement("h2"); title.textContent = post.title;
    const body = document.createElement("p"); body.className = "content-text"; body.textContent = post.body;
    const tags = document.createElement("div"); tags.className = "post-meta";
    if (post.track_id) { const track = tracks.find((item) => item.id === post.track_id); const tag = document.createElement("span"); tag.textContent = track?.title || post.track_id; tags.append(tag); }
    if (post.topic_id) { const topic = document.createElement("span"); topic.textContent = post.topic_id.replaceAll("-", " "); tags.append(topic); }
    const replies = document.createElement("section"); replies.className = "replies"; replies.setAttribute("aria-label", "Respostas");
    const repliesTitle = document.createElement("h3"); repliesTitle.textContent = `Respostas (${post.replies.length})`; replies.append(repliesTitle);
    for (const reply of post.replies) replies.append(renderReply(reply, post));
    const replyForm = document.createElement("form"); replyForm.className = "reply-form"; replyForm.dataset.action = "reply-form";
    const replyInput = document.createElement("textarea"); replyInput.name = "body"; replyInput.rows = 2; replyInput.maxLength = 5000; replyInput.placeholder = token() ? "Escreva uma resposta…" : "Entre na sua conta para responder"; replyInput.required = true; replyInput.disabled = !token();
    const submit = document.createElement("button"); submit.type = "submit"; submit.className = "secondary-button"; submit.textContent = "Responder"; submit.disabled = !token();
    replyForm.append(replyInput, submit);
    replies.append(replyForm);
    article.append(head, title, body, tags, replies);
    return article;
  }

  async function loadPosts() {
    status.hidden = false; status.textContent = "Carregando publicações…"; feed.replaceChildren();
    const params = new URLSearchParams({ order: $("#sort-filter").value });
    if (trackFilter.value) params.set("track", trackFilter.value);
    if (topicFilter.value) params.set("topic", topicFilter.value);
    try {
      posts = (await request(`/forum/posts?${params}`)).posts || [];
      for (const post of posts) feed.append(renderPost(post));
      status.hidden = !posts.length;
      status.textContent = posts.length ? `${posts.length} publicação${posts.length === 1 ? "" : "ões"}` : "";
      if (!posts.length && (trackFilter.value || topicFilter.value)) {
        feed.innerHTML = `<div class="forum-error-state"><strong>Nenhuma publicação encontrada com esses filtros</strong><p>Experimente selecionar outra trilha ou conteúdo.</p></div>`;
      } else if (!posts.length) {
        feed.innerHTML = `<article class="forum-empty">
          <div class="forum-empty-copy">
            <span class="forum-empty-kicker">Fórum de estudos</span>
            <h2>Qual dúvida você trouxe hoje?</h2>
            <p>Abra a conversa, compartilhe sua pergunta e aprenda junto com a comunidade.</p>
            <button class="button" type="button" data-forum-create-first><span data-lucide="plus"></span> Criar publicação</button>
          </div>
        </article>`;
      }
      const selected = new URLSearchParams(location.search).get("post");
      if (selected) document.querySelector(`[data-post-id="${CSS.escape(selected)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      const message = error.message.includes("Entre na sua conta")
        ? "Entre na sua conta para participar do fórum."
        : error.message === "Método não permitido."
          ? "O serviço do fórum ainda precisa ser atualizado. Aplique a migração do banco e publique o Worker para carregar as publicações."
          : error.message;
      status.hidden = false; status.textContent = message;
      feed.innerHTML = `<div class="forum-error-state"><span data-lucide="circle-alert"></span><strong>Não foi possível carregar o fórum</strong><p>${escapeText(message)}</p></div>`;
    }
  }

  function escapeText(value) { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }

  function openNewPost() {
    if (!token()) { location.href = "login.html?next=forum.html"; return; }
    $("#post-dialog-title").textContent = "Criar publicação"; form.dataset.mode = "create"; form.dataset.id = ""; form.reset(); $("#post-error").textContent = ""; dialog.showModal();
  }
  $("#new-post-button").addEventListener("click", openNewPost);
  feed.addEventListener("click", (event) => {
    if (event.target.closest("[data-forum-create-first]")) openNewPost();
  });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  document.querySelectorAll("[data-close-moderation]").forEach((button) => button.addEventListener("click", () => moderationDialog.close()));
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); const data = new FormData(form); const error = $("#post-error"); error.textContent = "";
    const payload = { title: String(data.get("title") || "").trim(), body: String(data.get("body") || "").trim(), trackId: String(data.get("trackId") || ""), topicId: String(data.get("topicId") || "") };
    try {
      if (form.dataset.mode === "edit") await request(`/forum/posts/${form.dataset.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await request("/forum/posts", { method: "POST", body: JSON.stringify(payload) });
      dialog.close(); await loadPosts();
    } catch (failure) { error.textContent = failure.message; }
  });

  feed.addEventListener("submit", async (event) => {
    const formElement = event.target.closest('[data-action="reply-form"]'); if (!formElement) return;
    event.preventDefault(); const postId = formElement.closest("[data-post-id]").dataset.postId; const textarea = formElement.querySelector("textarea");
    try { await request(`/forum/posts/${postId}/replies`, { method: "POST", body: JSON.stringify({ body: textarea.value.trim() }) }); await loadPosts(); }
    catch (error) { textarea.setCustomValidity(error.message); textarea.reportValidity(); textarea.addEventListener("input", () => textarea.setCustomValidity(""), { once: true }); }
  });

  feed.addEventListener("click", async (event) => {
    const control = event.target.closest("[data-action]"); if (!control) return;
    const action = control.dataset.action; const postCard = control.closest("[data-post-id]"); const replyCard = control.closest("[data-reply-id]");
    const kind = action.endsWith("post") ? "post" : "reply"; const id = kind === "post" ? postCard?.dataset.postId : replyCard?.dataset.replyId;
    try {
      if (action === "helpful") { await request(`/forum/replies/${id}/helpful`, { method: "POST", body: "{}" }); await loadPosts(); }
      if (action.startsWith("report-")) { const reason = prompt("Conte brevemente por que este conteúdo deve ser analisado:", "Conteúdo inadequado"); if (reason === null) return; const result = await request(`/forum/${kind === "post" ? `posts/${id}` : `replies/${id}`}/report`, { method: "POST", body: JSON.stringify({ reason }) }); alert(`${result.message}\n${result.aiSummary || ""}`); }
      if (action.startsWith("delete-")) { if (!confirm("Excluir este conteúdo? Essa ação não pode ser desfeita.")) return; await request(`/forum/${kind === "post" ? `posts/${id}` : `replies/${id}`}`, { method: "DELETE" }); await loadPosts(); }
      if (action.startsWith("moderate-")) {
        moderationForm.dataset.kind = kind; moderationForm.dataset.id = id; moderationForm.reset(); $("#moderation-error").textContent = "";
        $("#moderation-title").textContent = kind === "post" ? "Remover publicação" : "Remover resposta";
        $("#moderation-explanation").textContent = kind === "post" && postCard.querySelectorAll("[data-reply-id]").length
          ? "A publicação e suas respostas serão removidas. O motivo será enviado a cada pessoa autora afetada."
          : "Informe o motivo da remoção. Ele será enviado à pessoa autora.";
        moderationDialog.showModal(); moderationForm.elements.reason.focus();
      }
      if (action.startsWith("edit-")) {
        if (kind === "reply") { const body = prompt("Edite sua resposta:", $(".content-text", replyCard).textContent); if (body === null) return; await request(`/forum/replies/${id}`, { method: "PUT", body: JSON.stringify({ body }) }); await loadPosts(); }
        else { const post = posts.find((item) => String(item.id) === String(id)); form.dataset.mode = "edit"; form.dataset.id = id; $("#post-dialog-title").textContent = "Editar publicação"; form.elements.title.value = post.title; form.elements.body.value = post.body; form.elements.trackId.value = post.track_id || ""; await populateTopics(post.track_id || "", postTopic, "Sem conteúdo específico"); form.elements.topicId.value = post.topic_id || ""; $("#post-error").textContent = ""; dialog.showModal(); }
      }
    } catch (error) { alert(error.message); }
  });

  moderationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const save = moderationForm.querySelector('button[type="submit"]');
    const kind = moderationForm.dataset.kind;
    const id = moderationForm.dataset.id;
    save.disabled = true; $("#moderation-error").textContent = "";
    try {
      await request(`/admin/forum/${kind === "post" ? `posts/${id}` : `replies/${id}`}`, { method: "DELETE", body: JSON.stringify({ reason: moderationForm.elements.reason.value.trim() }) });
      moderationDialog.close(); await loadPosts();
    } catch (error) { $("#moderation-error").textContent = error.message; }
    finally { save.disabled = false; }
  });

  trackFilter.addEventListener("change", async () => { await populateTopics(trackFilter.value, topicFilter, "Todos os conteúdos"); loadPosts(); });
  topicFilter.addEventListener("change", loadPosts); $("#sort-filter").addEventListener("change", loadPosts);
  postTrack.addEventListener("change", async () => { await populateTopics(postTrack.value, postTopic, "Sem conteúdo específico"); });
  loadCatalogs().then(loadPosts);
})();
