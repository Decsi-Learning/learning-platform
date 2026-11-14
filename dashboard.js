(() => {
  const tracks = [
    { id: "aeds-i", title: "AEDS I", label: "Plano de ensino · ", element: document.getElementById("aeds-i-count") },
    { id: "aeds-ii", title: "AEDS II", label: "", element: document.getElementById("aeds-ii-count") },
  ];
  const action = document.getElementById("resume-study");
  const title = document.getElementById("hero-title");
  const description = document.getElementById("hero-description");

  function topicUrl(trackId, topic, pageId) {
    const params = new URLSearchParams({ trilha: trackId, id: topic.id });
    const targetPageId = pageId || (Array.isArray(topic.pages) && topic.pages.length ? topic.pages[0].id : "");
    if (targetPageId) {
      params.set("pagina", targetPageId);
    }
    return `topico.html?${params.toString()}`;
  }

  function setAction(href, label) {
    action.href = href;
    action.innerHTML = `${label} <span aria-hidden="true">→</span>`;
    action.hidden = false;
    action.style.display = "inline-flex";
  }

  function hideAction() {
    action.hidden = true;
    action.style.display = "none";
  }

  async function initialize() {
    const topicsByTrack = {};
    const catalogAvailable = {};
    await Promise.all(tracks.map(async (track) => {
      try {
        const response = await fetch(`content/${track.id}/topicos.json`);
        if (!response.ok) throw new Error("Catalog unavailable");
        const data = await response.json();
        const topics = Array.isArray(data.topics) ? data.topics : [];
        topicsByTrack[track.id] = topics;
        catalogAvailable[track.id] = true;
      } catch {
        topicsByTrack[track.id] = [];
        catalogAvailable[track.id] = false;
        if (track.element) track.element.textContent = "Conteúdo indisponível";
      }
    }));

    const allTopics = tracks.flatMap((track) => (topicsByTrack[track.id] || []).map((topic) => ({ track, topic })));
    const progressState = allTopics.length
      ? await window.decsiProgress.getAll(topicsByTrack)
      : { topics: [], pages: [] };
    const progressByTopic = new Map(progressState.topics.map((record) => [
      `${record.trackId}:${record.topicId}`,
      record,
    ]));

    for (const track of tracks) {
      const topics = topicsByTrack[track.id] || [];
      const card = document.getElementById(`${track.id}-dashboard`);

      if (!catalogAvailable[track.id]) {
        if (track.element) track.element.textContent = "Conteúdo indisponível";
        if (card) {
          card.querySelector("[data-dashboard-percent]").textContent = "";
          card.querySelector("[data-dashboard-completion]").textContent = "";
          card.querySelector("[data-dashboard-bar]").hidden = true;
          card.querySelector("[data-dashboard-breakdown]").hidden = true;
          const empty = card.querySelector("[data-dashboard-empty]");
          empty.hidden = false;
          empty.textContent = "Não foi possível carregar o conteúdo da trilha.";
        }
        continue;
      }

      if (topics.length === 0) {
        if (track.element) track.element.textContent = `${track.label}Trilha sem conteúdo cadastrado`;
        if (card) {
          card.querySelector("[data-dashboard-percent]").textContent = "";
          card.querySelector("[data-dashboard-completion]").textContent = "";
          card.querySelector("[data-dashboard-bar]").hidden = true;
          card.querySelector("[data-dashboard-breakdown]").hidden = true;
          const empty = card.querySelector("[data-dashboard-empty]");
          empty.hidden = false;
          empty.textContent = "Esta trilha ainda está sem conteúdo.";
        }
        continue;
      }

      const completed = topics.filter((topic) => progressByTopic.get(`${track.id}:${topic.id}`)?.status === "completed").length;
      const active = topics.filter((topic) => progressByTopic.get(`${track.id}:${topic.id}`)?.status === "in_progress").length;
      const pending = topics.length - completed - active;
      const percentage = Math.round((completed / topics.length) * 100);
      const countLabel = `${topics.length} ${topics.length === 1 ? "tópico" : "tópicos"}`;
      if (track.element) track.element.textContent = `${track.label}${countLabel} · Conteúdo disponível`;
      if (card) {
        card.querySelector("[data-dashboard-percent]").textContent = `${percentage}%`;
        card.querySelector("[data-dashboard-completion]").textContent = `${completed} de ${topics.length} ${topics.length === 1 ? "tópico concluído" : "tópicos concluídos"}`;
        const bar = card.querySelector("[data-dashboard-bar]");
        bar.value = percentage;
        bar.hidden = false;
        const breakdown = card.querySelector("[data-dashboard-breakdown]");
        breakdown.querySelector("[data-dashboard-active]").textContent = active;
        breakdown.querySelector("[data-dashboard-pending]").textContent = pending;
        breakdown.hidden = false;
        card.querySelector("[data-dashboard-empty]").hidden = true;
      }
    }

    if (!title || !description || !action) return;

    if (!allTopics.length) {
      title.textContent = "Suas trilhas estão sendo preparadas.";
      description.textContent = "Volte em breve para começar seus estudos.";
      hideAction();
      return;
    }

    const progress = progressState.topics;
    const recordsByTopic = progressByTopic;
    const inProgress = progress
      .filter((record) => record.status === "in_progress")
      .sort((left, right) => Date.parse(right.lastAccessedAt || "") - Date.parse(left.lastAccessedAt || ""));
    const latest = inProgress.find((record) => allTopics.some(({ track, topic }) => track.id === record.trackId && topic.id === record.topicId));

    if (latest) {
      const { track, topic } = allTopics.find(({ track, topic }) => track.id === latest.trackId && topic.id === latest.topicId);
      const lastPage = progressState.pages
        .filter((page) => page.trackId === latest.trackId && page.topicId === latest.topicId)
        .sort((left, right) => Date.parse(right.lastAccessedAt || "") - Date.parse(left.lastAccessedAt || ""))[0];
      title.textContent = "Sua jornada continua.";
      description.textContent = `Continue ${track.title} pelo tópico “${topic.title}”, acessado mais recentemente.`;
      setAction(topicUrl(track.id, topic, lastPage?.pageId), "Continuar estudando");
      return;
    }

    const next = allTopics.find(({ track, topic }) => recordsByTopic.get(`${track.id}:${topic.id}`)?.status !== "completed");
    if (next) {
      const hasAnyProgress = progress.length > 0;
      title.textContent = hasAnyProgress ? "Pronto para o próximo tópico?" : "Vamos começar a estudar.";
      description.textContent = hasAnyProgress
        ? `O próximo tópico disponível é “${next.topic.title}”, em ${next.track.title}.`
        : `Comece pela trilha ${next.track.title}, no tópico “${next.topic.title}”.`;
      setAction(topicUrl(next.track.id, next.topic), hasAnyProgress ? "Começar próximo tópico" : "Começar a estudar");
      return;
    }

    title.textContent = "Trilhas concluídas!";
    description.textContent = "Você concluiu todos os tópicos disponíveis. Parabéns pela sua jornada!";
    hideAction();
  }

  initialize().catch(() => {
    if (!title || !description || !action) return;
    title.textContent = "Não foi possível carregar seu progresso.";
    description.textContent = "Tente atualizar a página para continuar seus estudos.";
    hideAction();
  });
})();
