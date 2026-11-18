(() => {
  const homeTracks = document.querySelector(".tracks");
  const dashboard = document.querySelector(".dashboard-summary");
  const resumeAction = document.getElementById("resume-study");
  const heroTitle = document.getElementById("hero-title");
  const heroDescription = document.getElementById("hero-description");

  const topicUrl = (trackId, topic, pageId) => {
    const params = new URLSearchParams({ trilha: trackId, id: topic.id });
    const page = pageId || (Array.isArray(topic.pages) && topic.pages.length ? topic.pages[0].id : "");
    if (page) params.set("pagina", page);
    return `topico.html?${params.toString()}`;
  };

  const planUrl = (track) => track.plan || `trilha.html?id=${encodeURIComponent(track.id)}`;

  function textElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function createTrackCard(track, topics, available, index) {
    const card = document.createElement("a");
    card.className = "track";
    card.href = planUrl(track);
    card.setAttribute("aria-label", `Abrir trilha ${track.title || track.id}`);

    const image = document.createElement("img");
    image.className = "track-visual";
    image.src = track.image || "assets/trilha-generica.svg";
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.addEventListener("error", () => {
      image.src = "assets/trilha-generica.svg";
    }, { once: true });
    card.append(image);

    const body = textElement("span", "track-body");
    body.append(
      textElement("span", "track-kicker", `Trilha ${String(index + 1).padStart(2, "0")}`),
      textElement("h3", "", track.title || track.id),
      textElement("span", "track-description", track.description || "Explore os conteúdos desta trilha de aprendizagem.")
    );
    const count = !available
      ? "Conteúdo indisponível"
      : topics.length
        ? `${topics.length} ${topics.length === 1 ? "tópico" : "tópicos"} disponíveis`
        : "Trilha sem conteúdo cadastrado";
    body.append(textElement("span", "track-count", count));
    const open = textElement("span", "track-open", "Explorar trilha");
    const openIcon = textElement("span", "arrow");
    openIcon.dataset.lucide = "arrow-up-right";
    open.append(openIcon);
    body.append(open);
    card.append(body);
    return card;
  }

  function renderHomeTracks(tracks, dataById) {
    if (!homeTracks) return;
    homeTracks.replaceChildren();
    tracks.forEach((track, index) => {
      const data = dataById.get(track.id);
      homeTracks.append(createTrackCard(track, data.topics, data.available, index));
    });
    if (!tracks.length) homeTracks.append(textElement("p", "tracks-message", "Nenhuma trilha cadastrada ainda."));
  }

  function renderDashboard(tracks, dataById, progressState) {
    if (!dashboard) return;
    dashboard.replaceChildren();
    const records = new Map(progressState.topics.map((item) => [`${item.trackId}:${item.topicId}`, item]));

    for (const track of tracks) {
      const { topics, available } = dataById.get(track.id);
      const card = textElement("article", "dashboard-card");
      card.id = `${track.id}-dashboard`;
      const heading = textElement("div", "dashboard-card-head");
      const headingId = `${track.id}-dashboard-title`;
      const title = textElement("h2", "", track.title || track.id);
      title.id = headingId;
      heading.append(title);
      card.setAttribute("aria-labelledby", headingId);

      if (!available || topics.length === 0) {
        const empty = textElement("p", "dashboard-empty", !available
          ? "Não foi possível carregar o conteúdo desta trilha."
          : "Esta trilha ainda está sem conteúdo.");
        card.append(heading, empty);
      } else {
        const completed = topics.filter((topic) => records.get(`${track.id}:${topic.id}`)?.status === "completed").length;
        const active = topics.filter((topic) => records.get(`${track.id}:${topic.id}`)?.status === "in_progress").length;
        const pending = topics.length - completed - active;
        const percent = Math.round((completed / topics.length) * 100);
        heading.append(textElement("span", "dashboard-percent", `${percent}%`));
        card.append(heading);
        card.append(textElement("p", "dashboard-completion", `${completed} de ${topics.length} ${topics.length === 1 ? "tópico concluído" : "tópicos concluídos"}`));
        const bar = document.createElement("progress");
        bar.max = 100;
        bar.value = percent;
        bar.setAttribute("aria-label", `Percentual de tópicos concluídos em ${track.title || track.id}`);
        card.append(bar);
        const breakdown = textElement("ul", "dashboard-breakdown");
        for (const [label, value] of [["Em andamento", active], ["Não iniciados", pending]]) {
          const item = textElement("li", "", label);
          item.append(textElement("strong", "", String(value)));
          breakdown.append(item);
        }
        card.append(breakdown);
      }

      const link = document.createElement("a");
      link.className = "dashboard-card-link";
      link.href = planUrl(track);
      link.append(document.createTextNode("Abrir trilha "));
      const arrow = textElement("span", "dashboard-link-icon");
      arrow.dataset.lucide = "arrow-right";
      link.append(arrow);
      card.append(link);
      dashboard.append(card);
    }
  }

  function configureResume(tracks, dataById, progressState) {
    if (!resumeAction || !heroTitle || !heroDescription) return;
    const allTopics = tracks.flatMap((track) => (dataById.get(track.id)?.topics || []).map((topic) => ({ track, topic })));
    if (!allTopics.length) {
      heroTitle.textContent = "Suas trilhas estão sendo preparadas.";
      heroDescription.textContent = "Volte em breve para começar seus estudos.";
      resumeAction.hidden = true;
      resumeAction.style.display = "none";
      return;
    }

    resumeAction.hidden = false;
    resumeAction.style.display = "";

    const byTopic = new Map(progressState.topics.map((record) => [`${record.trackId}:${record.topicId}`, record]));
    const inProgress = progressState.topics
      .filter((record) => record.status === "in_progress")
      .sort((a, b) => Date.parse(b.lastAccessedAt || "") - Date.parse(a.lastAccessedAt || ""));
    const latest = inProgress.find((record) => allTopics.some(({ track, topic }) => track.id === record.trackId && topic.id === record.topicId));
    if (latest) {
      const entry = allTopics.find(({ track, topic }) => track.id === latest.trackId && topic.id === latest.topicId);
      const lastPage = progressState.pages
        .filter((page) => page.trackId === latest.trackId && page.topicId === latest.topicId)
        .sort((a, b) => Date.parse(b.lastAccessedAt || "") - Date.parse(a.lastAccessedAt || ""))[0];
      heroTitle.textContent = "Sua jornada continua.";
      heroDescription.textContent = `Continue ${entry.track.title} pelo tópico “${entry.topic.title}”, acessado mais recentemente.`;
      resumeAction.href = topicUrl(entry.track.id, entry.topic, lastPage?.pageId);
      resumeAction.firstChild.textContent = "Continuar estudando ";
      return;
    }

    const next = allTopics.find(({ track, topic }) => byTopic.get(`${track.id}:${topic.id}`)?.status !== "completed");
    if (next) {
      const started = progressState.topics.length > 0;
      heroTitle.textContent = started ? "Pronto para o próximo tópico?" : "Vamos começar a estudar.";
      heroDescription.textContent = started
        ? `O próximo tópico disponível é “${next.topic.title}”, em ${next.track.title}.`
        : `Comece pela trilha ${next.track.title}, no tópico “${next.topic.title}”.`;
      resumeAction.href = topicUrl(next.track.id, next.topic);
      resumeAction.firstChild.textContent = started ? "Começar próximo tópico " : "Começar a estudar ";
      return;
    }

    heroTitle.textContent = "Trilhas concluídas!";
    heroDescription.textContent = "Você concluiu todos os tópicos disponíveis. Parabéns pela sua jornada!";
    resumeAction.hidden = true;
    resumeAction.style.display = "none";
  }

  async function initialize() {
    const response = await fetch("content/trilhas.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Não foi possível carregar as trilhas.");
    const manifest = await response.json();
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    const entries = await Promise.all(tracks.map(async (track) => {
      try {
        const catalogPath = track.catalog || `content/${track.id}/topicos.json`;
        const result = await fetch(catalogPath, { cache: "no-cache" });
        if (!result.ok) throw new Error("Catálogo indisponível");
        const catalog = await result.json();
        return [track.id, { topics: Array.isArray(catalog.topics) ? catalog.topics : [], available: true }];
      } catch {
        return [track.id, { topics: [], available: false }];
      }
    }));
    const dataById = new Map(entries);
    const topicsByTrack = Object.fromEntries(entries.map(([id, data]) => [id, data.topics]));
    const progressState = window.decsiProgress
      ? await window.decsiProgress.getAll(topicsByTrack)
      : { topics: [], pages: [] };

    renderHomeTracks(tracks, dataById);
    renderDashboard(tracks, dataById, progressState);
    configureResume(tracks, dataById, progressState);
  }

  initialize().catch(() => {
    if (homeTracks) homeTracks.replaceChildren(textElement("p", "tracks-message", "Não foi possível carregar as trilhas. Atualize a página para tentar novamente."));
    if (dashboard) dashboard.replaceChildren(textElement("p", "dashboard-empty", "Não foi possível carregar o conteúdo das trilhas."));
    if (heroTitle && heroDescription) {
      heroTitle.textContent = "Não foi possível carregar seu progresso.";
      heroDescription.textContent = "Atualize a página para continuar seus estudos.";
    }
    if (resumeAction) {
      resumeAction.hidden = true;
      resumeAction.style.display = "none";
    }
  });
})();
