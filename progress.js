(() => {
  const API_ROOT = "https://gemini-proxy.scrrhdvp7v.workers.dev/api/progress";
  const STORAGE_KEY = "decsi.learningProgress";
  const PAGE_STORAGE_KEY = "decsi.learningPageProgress";
  const token = () => sessionStorage.getItem("decsi.sessionToken");

  function readLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  }

  function key(trackId, topicId) {
    return `${trackId}:${topicId}`;
  }

  function saveLocal(progress) {
    const entries = readLocal();
    entries[key(progress.trackId, progress.topicId)] = progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function readLocalPages() {
    try {
      const saved = JSON.parse(localStorage.getItem(PAGE_STORAGE_KEY) || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  }

  function pageKey(trackId, topicId, pageId) {
    return `${trackId}:${topicId}:${pageId}`;
  }

  function saveLocalPage(page) {
    const pages = readLocalPages();
    pages[pageKey(page.trackId, page.topicId, page.pageId)] = page;
    localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(pages));
  }

  async function getAll(topicsByTrack) {
    const sessionToken = token();
    if (sessionToken) {
      try {
        const response = await fetch(API_ROOT, {
          headers: { Authorization: `Bearer ${sessionToken}` },
          cache: "no-store",
        });
        if (response.ok) {
          const result = await response.json();
          return {
            topics: Array.isArray(result.progress) ? result.progress : [],
            pages: Array.isArray(result.pages) ? result.pages : [],
          };
        }
      } catch {
        // Keep a usable local fallback if the service is temporarily unavailable.
      }
    }

    const entries = readLocal();
    const progress = Object.values(entries);
    for (const [trackId, topics] of Object.entries(topicsByTrack || {})) {
      for (const topic of topics) {
        const oldCompletionKey = `decsi-learning:${trackId}:${topic.id}:concluido`;
        if (localStorage.getItem(oldCompletionKey) === "true" && !entries[key(trackId, topic.id)]) {
          progress.push({
            trackId,
            topicId: topic.id,
            status: "completed",
            lastAccessedAt: "1970-01-01T00:00:00.000Z",
            completedAt: "",
          });
        }
      }
    }
    return { topics: progress, pages: Object.values(readLocalPages()) };
  }

  function calculateTrack(trackId, topics, progressState) {
    const progressByTopic = new Map((progressState.topics || []).map((record) => [
      `${record.trackId}:${record.topicId}`,
      record,
    ]));
    const pagesByTopic = new Map();
    for (const page of progressState.pages || []) {
      if (page.trackId !== trackId) continue;
      const topicKey = `${page.trackId}:${page.topicId}`;
      if (!pagesByTopic.has(topicKey)) pagesByTopic.set(topicKey, new Set());
      pagesByTopic.get(topicKey).add(page.pageId);
    }

    let completedPages = 0;
    let totalPages = 0;
    const items = topics.map((topic) => {
      const pageIds = Array.isArray(topic.pages) && topic.pages.length
        ? topic.pages.map((page) => page.id || topic.id)
        : [topic.id];
      const topicProgress = progressByTopic.get(`${trackId}:${topic.id}`);
      const visited = pagesByTopic.get(`${trackId}:${topic.id}`) || new Set();
      const visitedPages = topicProgress?.status === "completed"
        ? pageIds.length
        : pageIds.filter((pageId) => visited.has(pageId)).length;
      const displayVisitedPages = visitedPages === 0 && topicProgress?.status === "in_progress"
        ? 1
        : visitedPages;
      const countedPages = Math.min(pageIds.length, displayVisitedPages);
      const percent = pageIds.length ? Math.round((countedPages / pageIds.length) * 100) : 0;
      completedPages += countedPages;
      totalPages += pageIds.length;
      return {
        topicId: topic.id,
        completedPages: countedPages,
        totalPages: pageIds.length,
        percent,
        status: topicProgress?.status || "not_started",
      };
    });

    return {
      completedPages,
      totalPages,
      percent: totalPages ? Math.round((completedPages / totalPages) * 100) : 0,
      items,
    };
  }

  async function mark(trackId, topicId, pageId, status) {
    const existing = readLocal()[key(trackId, topicId)];
    const progress = {
      trackId,
      topicId,
      status: existing?.status === "completed" ? "completed" : status,
      lastAccessedAt: new Date().toISOString(),
      completedAt: status === "completed" ? new Date().toISOString() : (existing?.completedAt || null),
    };
    saveLocal(progress);
    const accessedAt = new Date().toISOString();
    saveLocalPage({ trackId, topicId, pageId, lastAccessedAt: accessedAt });
    if (status === "completed") {
      localStorage.setItem(`decsi-learning:${trackId}:${topicId}:concluido`, "true");
    }

    const sessionToken = token();
    if (!sessionToken) return;
    try {
      await fetch(API_ROOT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ trackId, topicId, pageId, status }),
      });
    } catch {
      // The local copy remains available if the service is temporarily unavailable.
    }
  }

  window.decsiProgress = { getAll, mark, calculateTrack };
})();
