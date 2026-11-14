(() => {
  const input = document.querySelector("[data-content-search]");
  const results = document.querySelector("[data-search-results]");
  if (!input || !results) return;

  const MAX_RESULTS = 8;
  let indexPromise;
  let debounceTimer;

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function plainText(markdown) {
    return String(markdown || "")
      .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```[^\n]*\n?|```$/g, " "))
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .replace(/[`*_>#~]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function topicUrl(trackId, topic, page, hasPages) {
    const params = new URLSearchParams({ trilha: trackId, id: topic.id });
    if (hasPages && page.id) params.set("pagina", page.id);
    return `topico.html?${params.toString()}`;
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
    return response.json();
  }

  async function fetchMarkdown(path) {
    try {
      const response = await fetch(path, { cache: "no-cache" });
      return response.ok ? plainText(await response.text()) : "";
    } catch {
      return "";
    }
  }

  async function buildIndex() {
    const manifest = await fetchJson("content/trilhas.json");
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    const catalogs = await Promise.all(tracks.map(async (track) => {
      try {
        const catalog = await fetchJson(track.catalog);
        return { track, topics: Array.isArray(catalog.topics) ? catalog.topics : [] };
      } catch {
        return { track, topics: [] };
      }
    }));

    const records = [];
    for (const { track, topics } of catalogs) {
      const contentDirectory = track.contentDirectory || `content/${track.id}/topicos/`;
      for (const topic of topics) {
        const hasPages = Array.isArray(topic.pages) && topic.pages.length > 0;
        const pages = hasPages ? topic.pages : [topic];
        for (const page of pages) {
          const file = page.file || (!hasPages ? topic.file : "");
          records.push({
            trackId: track.id,
            trackTitle: track.title || track.id,
            topic,
            page,
            hasPages,
            title: page.title || topic.title || topic.id,
            summary: [topic.summary, page.summary].filter(Boolean).join(" "),
            bodyPath: file ? `${contentDirectory.replace(/\/?$/, "/")}${encodeURI(file)}` : "",
            href: topicUrl(track.id, topic, page, hasPages),
          });
        }
      }
    }

    let nextRecord = 0;
    const workers = Array.from({ length: Math.min(6, records.length) }, async () => {
      while (nextRecord < records.length) {
        const record = records[nextRecord++];
        record.body = record.bodyPath ? await fetchMarkdown(record.bodyPath) : "";
        record.searchText = normalize([
          record.trackTitle,
          record.topic.title,
          record.topic.id,
          record.topic.summary,
          record.title,
          record.page.id,
          record.page.summary,
          record.body,
        ].join(" "));
      }
    });
    await Promise.all(workers);
    return records;
  }

  function getIndex() {
    if (!indexPromise) {
      indexPromise = buildIndex().catch((error) => {
        indexPromise = null;
        throw error;
      });
    }
    return indexPromise;
  }

  function showMessage(message) {
    results.innerHTML = `<p class="search-message">${escapeHtml(message)}</p>`;
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function excerpt(record, tokens) {
    const normalizedBody = normalize(record.body);
    const matchAt = tokens.map((token) => normalizedBody.indexOf(token)).filter((position) => position >= 0).sort((a, b) => a - b)[0];
    if (matchAt === undefined) return (record.summary || record.body).slice(0, 170);
    const start = Math.max(0, matchAt - 65);
    return `${start ? "…" : ""}${record.body.slice(start, start + 170)}${start + 170 < record.body.length ? "…" : ""}`;
  }

  function score(record, fullQuery, tokens) {
    const title = normalize(record.title);
    const topicTitle = normalize(record.topic.title);
    const summary = normalize(record.summary);
    let value = title.includes(fullQuery) ? 100 : 0;
    for (const token of tokens) {
      if (title.includes(token)) value += 30;
      else if (topicTitle.includes(token)) value += 20;
      else if (summary.includes(token)) value += 10;
      else value += 1;
    }
    return value;
  }

  async function search() {
    const query = normalize(input.value).trim();
    if (!query) {
      results.hidden = true;
      input.setAttribute("aria-expanded", "false");
      return;
    }

    const tokens = query.match(/[\p{L}\p{N}]+/gu) || [];
    if (!tokens.length) {
      showMessage("Digite um termo para buscar.");
      return;
    }
    const fullQuery = tokens.join(" ");
    showMessage("Buscando no conteúdo das trilhas…");
    try {
      const records = await getIndex();
      if (normalize(input.value).trim() !== query) return;
      const matches = records
        .filter((record) => tokens.every((token) => record.searchText.includes(token)))
        .map((record) => ({ record, score: score(record, fullQuery, tokens) }))
        .sort((left, right) => right.score - left.score || left.record.title.localeCompare(right.record.title, "pt-BR"));

      if (!matches.length) {
        showMessage("Nenhum conteúdo encontrado. Tente outro termo.");
        return;
      }

      const shown = matches.slice(0, MAX_RESULTS);
      const links = shown.map(({ record }) => `<a class="search-result" role="option" href="${escapeHtml(record.href)}"><span class="search-result-title">${escapeHtml(record.title)}</span><span class="search-result-track">${escapeHtml(record.trackTitle)}${record.topic.title && record.topic.title !== record.title ? ` · ${escapeHtml(record.topic.title)}` : ""}</span><span class="search-result-snippet">${escapeHtml(excerpt(record, tokens))}</span></a>`).join("");
      const count = matches.length > shown.length
        ? `<p class="search-count">Mostrando ${shown.length} de ${matches.length} resultados</p>`
        : "";
      results.innerHTML = `${links}${count}`;
      results.hidden = false;
      input.setAttribute("aria-expanded", "true");
    } catch {
      showMessage("Não foi possível carregar a busca. Tente novamente.");
    }
  }

  input.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(search, 180);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      const first = results.querySelector("a[role='option']");
      if (first) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === "Enter") {
      const first = results.querySelector("a[role='option']");
      if (first) {
        event.preventDefault();
        first.click();
      }
    } else if (event.key === "Escape") {
      results.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
  });
  input.addEventListener("focus", () => {
    if (input.value.trim()) search();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".global-search")) {
      results.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
  });
})();
