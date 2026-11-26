(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LessonRenderer = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function renderInline(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function stepIndex(current, delta, count) {
    if (count <= 0) return 0;
    return Math.min(Math.max(current + delta, 0), count - 1);
  }

  const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
  const FENCE_CLASSES = { estrutura: "estrutura", pseudocodigo: "pseudocodigo" };

  function parseRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function renderTable(rows) {
    const cols = Math.max(...rows.map((row) => row.length));
    const cells = (row, tag) => {
      const padded = row.concat(Array(cols - row.length).fill(""));
      return "<tr>" + padded.map((cell) => `<${tag}>${renderInline(cell)}</${tag}>`).join("") + "</tr>";
    };
    const [head, ...body] = rows;
    return `<div class="table-wrap"><table><thead>${cells(head, "th")}</thead><tbody>${body.map((row) => cells(row, "td")).join("")}</tbody></table></div>`;
  }

  const VIDEO_PREFIXES = [
    "https://www.youtube.com/embed/",
    "https://www.youtube-nocookie.com/embed/",
    "https://player.vimeo.com/video/"
  ];

  function parseJson(source) {
    try { return JSON.parse(source); } catch { return null; }
  }

  function blockError(message) {
    return `<p class="quiz-error">${escapeHtml(message)}</p>`;
  }

  function isAllowedEmbed(url) {
    return typeof url === "string" && VIDEO_PREFIXES.some((prefix) => url.startsWith(prefix));
  }

  // options.defer: em vez do <iframe> (que o DOMPurify remove), emite um "slot" com data-*;
  // hydrateVideoEmbeds() cria o iframe depois da sanitização, revalidando o endereço.
  function renderVideo(source, options = {}) {
    const data = parseJson(source);
    if (!data || typeof data !== "object") return blockError("Este bloco de vídeo tem um erro de formato.");
    const title = escapeHtml(data.title || "Vídeo explicativo");
    const url = typeof data.url === "string" ? data.url : "";
    if (isAllowedEmbed(url)) {
      if (options.defer) {
        return `<div class="video-frame"><div class="video-embed-slot" data-embed-src="${escapeHtml(url)}" data-embed-title="${title}"></div></div>`;
      }
      return `<div class="video-frame"><iframe class="video-embed" src="${escapeHtml(url)}" title="${title}" allowfullscreen loading="lazy"></iframe></div>`;
    }
    return `<div class="video-frame"><div class="video-placeholder"><strong>${title}</strong><span>Vídeo explicativo em breve</span></div></div>`;
  }

  function renderStepper(kind, label, headingHtml, panels) {
    const count = panels.length;
    const panelHtml = panels.map((panel, i) => `<div class="stepper-panel" data-step="${i}"${i ? " hidden" : ""}>${panel}</div>`).join("");
    return `<section class="stepper" data-kind="${kind}" data-count="${count}" tabindex="0" aria-label="${escapeHtml(label)}">${headingHtml}<div class="stepper-panels">${panelHtml}</div><div class="stepper-controls"><button type="button" data-stepper="prev" disabled>‹ Anterior</button><span class="stepper-counter" aria-live="polite">1 / ${count}</span><button type="button" data-stepper="next"${count < 2 ? " disabled" : ""}>Próximo ›</button></div></section>`;
  }

  function renderSlides(source) {
    const data = parseJson(source);
    if (!data || !Array.isArray(data.slides)) return blockError("Este bloco de slides tem um erro de formato.");
    if (data.slides.length < 1) return blockError("Os slides precisam de pelo menos um item.");
    const panels = data.slides.map((slide) => {
      const item = slide || {};
      const bullets = Array.isArray(item.bullets) ? item.bullets : [];
      return `<h4>${renderInline(String(item.title || ""))}</h4>` + (bullets.length ? `<ul>${bullets.map((b) => `<li>${renderInline(String(b))}</li>`).join("")}</ul>` : "");
    });
    return renderStepper("slides", "Slides", '<p class="stepper-title">Slides</p>', panels);
  }

  function renderLessonVisual(slide, sourceUrl) {
    const v = slide.visual;
    if (!v) return "";
    const list = items => `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    switch (slide.layout) {
      case "diagrama": {
        if (!/^[\w/-]+\.(svg|png|webp|jpe?g)$/i.test(v.figura)) return "";
        const src = sourceUrl ? new URL(v.figura, sourceUrl).href : v.figura;
        return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(v.legenda)}"><figcaption>${escapeHtml(v.legenda)}</figcaption></figure>`;
      }
      case "codigo":
        return `<pre><code>${v.trecho.split("\n").map((line, i) => `<span data-line="${i+1}">${escapeHtml(line)}</span>`).join("\n")}</code></pre>`;
      case "comparativo":
      case "tabela":
        return `<div class="table-wrap"><table><thead><tr>${v.colunas.map(col => `<th>${escapeHtml(col)}</th>`).join("")}</tr></thead><tbody>${v.linhas.map((row,i) => `<tr data-line="${i+1}">${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "quiz":
        return `<strong>${escapeHtml(v.pergunta)}</strong>${list(v.opcoes)}<details class="lesson-answer"><summary>Conferir resposta</summary>${escapeHtml(v.opcoes[v.correta])}</details>`;
      case "aplicacao":
        return list(v.itens.map(item => item.nome + " — " + item.detalhe));
      default:
        return list(v.topicos || v.pontos || []);
    }
  }

  function renderNarratedLesson(source, options = {}) {
    const lesson = parseJson(source);
    const slides = lesson?.slides;
    if (!Array.isArray(slides) || !slides.length || slides.some(slide => !slide?.title || !(slide.speech || (Array.isArray(slide.clips) && slide.clips.length && slide.clips.every(c => c?.speech))))) {
      return blockError("Cada slide da aula precisa de um título e uma narração.");
    }
    const folder = lesson.videoFolder;
    const hasVideos = typeof folder === "string" && /^[\w-]+(?:\/[\w-]+)*$/.test(folder);
    const panels = slides.map((slide, index) => {
      const path = hasVideos ? `${folder}/${index + 1}.mp4` : "";
      const video = path && options.sourceUrl ? new URL(path, options.sourceUrl).href : path;
      const books = Array.isArray(slide.stack) ? slide.stack.map(book => `<li>${escapeHtml(book)}</li>`).join("") : "";
      return `<article class="narrated-slide${slide.visual ? " lesson-layout" : ""}" data-speech="${escapeHtml(slide.speech || "")}"${slide.clips ? ` data-clips="${escapeHtml(JSON.stringify(slide.clips))}"` : ""}${video ? ` data-avatar-video="${escapeHtml(video)}"` : ""}>
        <div><h4>${renderInline(slide.title)}</h4><p>${renderInline(slide.body || "")}</p></div>
        ${renderLessonVisual(slide, options.sourceUrl)}
        ${books ? `<figure><figcaption>Topo ↓</figcaption><ol>${books}</ol></figure>` : ""}
      </article>`;
    });
    const presenter = `<div class="lesson-views" role="group" aria-label="Visualização da aula">
      <button type="button" data-view="slide" aria-pressed="true">Slide</button>
      <button type="button" data-view="avatar" aria-pressed="false">Avatar</button>
    </div><aside class="narrator"><span aria-hidden="true" class="narrator-portrait"></span>
      <button type="button" class="narration-glass" data-narrate>Ouvir aula</button><small role="status"></small></aside>`;
    const rows = slides.map((slide, index) => {
      const seconds = slide.durationSeconds;
      const planned = Number.isFinite(seconds) && seconds > 0 ? seconds.toLocaleString("pt-BR") + " s" : "—";
      return `<tr><th scope="row">${index + 1}. ${escapeHtml(slide.title)}</th><td>${planned}</td><td data-measured="${index}">—</td></tr>`;
    }).join("");
    const timing = `<details><summary>Tempos da narração</summary><div class="table-wrap"><table>
      <thead><tr><th>Slide</th><th>Planejado</th><th>Última fala completa</th></tr></thead>
      <tbody>${rows}</tbody></table></div></details>`;
    return `<div class="narrated-lesson">${renderStepper("narrada", "Aula narrada", presenter, panels)}${timing}</div>`;
  }

  let activeSpeech = null;

  function stopNarration() {
    if (!activeSpeech) return;
    const { button, video, timeline } = activeSpeech;
    activeSpeech = null;
    if (video) { video.pause(); video.remove(); timeline.remove(); }
    else window.speechSynthesis?.cancel();
    button.textContent = "Ouvir aula";
  }

  if (typeof window !== "undefined") window.addEventListener("pagehide", stopNarration);

  function narrate(stepper) {
    const button = stepper.querySelector("[data-narrate]");
    const status = stepper.querySelector('[role="status"]');
    const wasPlaying = activeSpeech?.button === button;
    if (wasPlaying && activeSpeech.video) {
      const { video } = activeSpeech;
      if (video.paused) {
        video.play().catch(() => {
          if (activeSpeech?.video === video) status.textContent = "Toque em Continuar para retomar o vídeo.";
        });
      } else {
        video.pause();
      }
      return;
    }
    stopNarration();
    if (wasPlaying) return;
    status.textContent = "";
    if (stepper.dataset.finished) showStep(stepper, -Number(stepper.dataset.count));
    delete stepper.dataset.finished;
    function speakSlide() {
      const slide = stepper.querySelector(".stepper-panel:not([hidden]) .narrated-slide");
      button.textContent = "Parar narração";
      function finish(seconds) {
        if (seconds > 0) {
          const index = slide.closest(".stepper-panel").dataset.step;
          const cell = stepper.parentElement.querySelector(`[data-measured="${index}"]`);
          cell.textContent = seconds.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " s";
        }
        if (stepper.isConnected && !stepper.querySelector('[data-stepper="next"]').disabled) {
          showStep(stepper, 1);
          speakSlide();
        } else {
          activeSpeech = null;
          stepper.dataset.finished = "true";
          button.textContent = "Ouvir novamente";
        }
      }
      function unavailable() {
        activeSpeech = null;
        button.textContent = "Tentar narração";
        status.textContent = "Voz indisponível. Você pode avançar os slides manualmente.";
      }
      const clips = slide.dataset.clips ? JSON.parse(slide.dataset.clips) : [{ speech: slide.dataset.speech }];
      let clipIndex = 0;
      let spokenSeconds = 0;
      function speakText() {
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { unavailable(); return; }
        const clip = clips[clipIndex];
        const lines = clip.focus?.linhas || [];
        slide.querySelectorAll("[data-line]").forEach(line => {
          line.classList.toggle("lesson-focus", line.dataset.line >= lines[0] && line.dataset.line <= lines[1]);
        });
        const answer = slide.querySelector(".lesson-answer");
        if (answer) answer.open = clip.focus?.mostrar === "opção correta";
        const utterance = new window.SpeechSynthesisUtterance(clip.speech);
        utterance.lang = "pt-BR";
        activeSpeech = { button, utterance };
        let startedAt;
        utterance.onstart = () => { startedAt = performance.now(); };
        utterance.onend = event => {
          if (activeSpeech?.utterance !== utterance) return;
          spokenSeconds += event.elapsedTime || (startedAt === undefined ? 0 : (performance.now() - startedAt) / 1000);
          clipIndex++;
          if (clipIndex < clips.length) speakText();
          else finish(spokenSeconds);
        };
        utterance.onerror = () => { if (activeSpeech?.utterance === utterance) unavailable(); };
        window.speechSynthesis.speak(utterance);
      }
      if (!slide.dataset.avatarVideo) { speakText(); return; }
      const video = document.createElement("video");
      video.className = "narrator-video";
      video.playsInline = true;
      video.setAttribute("aria-label", "Vídeo do avatar");
      const timeline = document.createElement("label");
      timeline.className = "narration-timeline";
      timeline.innerHTML = '<span>Tempo do slide</span><input type="range" min="0" step="0.1" value="0" disabled><span class="video-clock" aria-hidden="true"></span>';
      stepper.querySelector(".stepper-controls").before(timeline);
      const seek = timeline.querySelector("input");
      const clock = timeline.querySelector(".video-clock");
      const formatTime = value => Math.floor(value / 60) + ":" + String(Math.floor(value % 60)).padStart(2, "0");
      function updateTime() {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        seek.disabled = false;
        seek.max = video.duration;
        seek.value = video.currentTime;
        const time = formatTime(video.currentTime) + " / " + formatTime(video.duration);
        seek.setAttribute("aria-valuetext", time);
        clock.textContent = time;
      }
      seek.oninput = () => { video.currentTime = Number(seek.value); updateTime(); };
      video.ontimeupdate = video.ondurationchange = updateTime;
      video.onplay = () => { if (activeSpeech?.video === video) button.textContent = "Pausar"; };
      video.onpause = () => { if (activeSpeech?.video === video) button.textContent = "Continuar"; };
      activeSpeech = { button, video, timeline };
      const fallback = () => {
        if (activeSpeech?.video !== video) return;
        activeSpeech = null;
        video.pause();
        video.remove();
        timeline.remove();
        button.textContent = "Parar narração";
        speakText();
      };
      video.onerror = fallback;
      video.onended = () => {
        if (activeSpeech?.video !== video) return;
        const seconds = video.currentTime;
        video.remove();
        timeline.remove();
        finish(seconds);
      };
      button.before(video);
      video.src = slide.dataset.avatarVideo;
      video.play().catch(fallback);
    }
    speakSlide();
  }

  function renderDemo(source) {
    const data = parseJson(source);
    if (!data || !Array.isArray(data.steps)) return blockError("Esta demonstração tem um erro de formato.");
    if (data.steps.length < 1) return blockError("A demonstração precisa de pelo menos um passo.");
    const title = String(data.title || "Demonstração");
    const panels = data.steps.map((step) => {
      const item = step || {};
      return `<p class="demo-caption">${renderInline(String(item.caption || ""))}</p><pre class="demo-state"><code>${escapeHtml(String(item.state || ""))}</code></pre>`;
    });
    return renderStepper("demo", title, `<p class="stepper-title">${escapeHtml(title)}</p>`, panels);
  }


  // ---- Bloco "codigo": código em C de um lado e, do outro, o que acontece a cada linha ----
  const C_TIPOS = new Set(["int", "char", "void", "long", "short", "float", "double", "unsigned", "signed", "size_t", "FILE", "struct"]);
  const C_PALAVRAS = new Set(["if", "else", "while", "for", "do", "return", "break", "continue", "sizeof", "typedef", "static", "const", "switch", "case", "default", "define", "include"]);
  const C_TOKEN = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|<[a-z_.]+\.h>)|(#\s*\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g;

  // Devolve uma lista com o HTML (já colorido) de cada linha do código.
  function highlightC(source) {
    const lines = [""];
    const put = (text, cls) => {
      text.split("\n").forEach((piece, i) => {
        if (i) lines.push("");
        if (piece) lines[lines.length - 1] += cls ? '<span class="' + cls + '">' + escapeHtml(piece) + "</span>" : escapeHtml(piece);
      });
    };
    let m;
    C_TOKEN.lastIndex = 0;
    while ((m = C_TOKEN.exec(source)) !== null) {
      if (m[1] !== undefined) put(m[1], "tk-c");
      else if (m[2] !== undefined) put(m[2], "tk-s");
      else if (m[3] !== undefined) put(m[3], "tk-p");
      else if (m[4] !== undefined) put(m[4], "tk-n");
      else if (m[5] !== undefined) {
        const next = source.slice(C_TOKEN.lastIndex).match(/^\s*\(/);
        put(m[5], C_TIPOS.has(m[5]) ? "tk-t" : C_PALAVRAS.has(m[5]) ? "tk-k" : next ? "tk-f" : "");
      } else put(m[6], "");
    }
    return lines;
  }

  // value: número ou texto (ex.: uma letra); flag: "c" comparando, "p" escolhido; color: 0 a 11 (opcional, senão depende do valor)
  function renderSprite(value, flag, color) {
    const n = Number(value);
    const isNumber = String(value).trim() !== "" && Number.isFinite(n);
    const seed = isNumber ? Math.abs(Math.round(n)) : String(value).charCodeAt(0) || 0;
    const shade = Number.isInteger(color) ? ((color % 12) + 12) % 12 : seed % 12;
    const cls = "sp c" + shade + " f" + (shade % 4) + (flag === "c" ? " cmp" : flag === "p" ? " pick" : flag === "g" ? " ghost" : "");
    const text = String(isNumber ? n : value);
    // rótulo comprido (mais de 3 caracteres): o bichinho se alarga para o texto não invadir o vizinho
    const wide = text.length > 3 ? ' wide" style="--len:' + Math.min(text.length, 10) : "";
    return '<span class="' + cls + wide + '"><b>' + escapeHtml(text) + "</b></span>";
  }

  function renderGroup(group) {
    const items = Array.isArray(group) ? group : (Array.isArray(group.i) ? group.i : []);
    const sprites = items.map((it) => Array.isArray(it) ? renderSprite(it[0], it[1], it[2]) : renderSprite(it)).join("");
    const positioned = !Array.isArray(group) && Number.isFinite(group.s) && Number.isFinite(group.n);
    const style = positioned ? ' style="--s:' + group.s + ";--n:" + group.n + '"' : "";
    const label = !Array.isArray(group) && group.l ? '<span class="cg-label">' + escapeHtml(String(group.l)) + "</span>" : "";
    return '<div class="cg' + (positioned ? " pos" : "") + (!Array.isArray(group) && group.a ? " on" : "") + '"' + style + ">" + label + '<div class="cb">' + sprites + "</div></div>";
  }

  function renderRows(rows) {
    return rows.map((row) => '<div class="cr">' + row.map(renderGroup).join("") + "</div>").join("");
  }

  function renderCodigo(source) {
    const data = parseJson(source);
    // "code" pode ser um texto com quebras de linha ou uma lista de linhas (mais fácil de ler e editar no editor de código)
    const code = Array.isArray(data && data.code) && data.code.every((l) => typeof l === "string") ? data.code.join("\n") : data && data.code;
    if (!data || typeof code !== "string" || !Array.isArray(data.steps)) return blockError("Este bloco de código tem um erro de formato.");
    if (data.steps.length < 1) return blockError("O bloco de código precisa de pelo menos um passo.");
    const codeLines = highlightC(code);
    for (const step of data.steps) {
      if (!step || typeof step !== "object") return blockError("Um dos passos do código tem um erro de formato.");
      if (step.line !== undefined && !(Number.isInteger(step.line) && step.line >= 1 && step.line <= codeLines.length)) {
        return blockError("Um passo aponta para uma linha que não existe no código.");
      }
    }
    let cols = Number(data.cols) || 0;
    if (!cols) {
      for (const step of data.steps) for (const row of step.rows || []) for (const g of row) {
        if (!Array.isArray(g) && Number.isFinite(g.s) && Number.isFinite(g.n)) cols = Math.max(cols, g.s + g.n);
      }
    }
    const maxRows = Math.max(1, ...data.steps.map((step) => (Array.isArray(step.rows) ? step.rows.length : 0)));
    const title = String(data.title || "Código passo a passo");
    const first = data.steps[0].line;
    const codeHtml = codeLines.map((html, i) =>
      '<div class="cline' + (first === i + 1 ? " on" : "") + '"><span class="ln">' + (i + 1) + '</span><span class="lc">' + (html || " ") + "</span></div>").join("");
    const panels = data.steps.map((step, i) => {
      const vars = step.vars && typeof step.vars === "object" ? Object.entries(step.vars) : [];
      const varsHtml = vars.length ? '<p class="cv-vars">' + vars.map(([k, v]) => "<span><em>" + escapeHtml(k) + "</em> = " + escapeHtml(String(v)) + "</span>").join("") + "</p>" : "";
      const stack = step.stack ? '<p class="cv-stack">Chamadas ativas: ' + escapeHtml(String(step.stack)) + "</p>" : "";
      return '<div class="stepper-panel cv-panel" data-step="' + i + '" data-line="' + (step.line || "") + '"' + (i ? " hidden" : "") + ">" +
        '<div class="cv-rows">' + renderRows(Array.isArray(step.rows) ? step.rows : []) + "</div>" +
        '<p class="cv-caption">' + renderInline(String(step.caption || "")) + "</p>" + varsHtml + stack + "</div>";
    }).join("");
    const count = data.steps.length;
    return '<section class="stepper codigo" data-kind="codigo" data-count="' + count + '" tabindex="0" aria-label="' + escapeHtml(title) + '"' + (cols > 10 ? ' data-layout="stack"' : cols > 8 ? ' data-layout="wide"' : "") + ' style="--cols:' + (cols || 8) + ";--rows:" + maxRows + '">' +
      '<p class="stepper-title">' + escapeHtml(title) + "</p>" +
      '<div class="codigo-body"><div class="codigo-screen"><div class="stepper-panels">' + panels + "</div></div>" +
      '<pre class="codigo-code" aria-label="Código em C"><code>' + codeHtml + "</code></pre></div>" +
      '<div class="stepper-controls"><button type="button" data-stepper="prev" disabled>‹ Anterior</button><button type="button" data-stepper="play" class="play">▶ Executar</button><span class="stepper-counter" aria-live="polite">1 / ' + count + '</span><button type="button" data-stepper="next"' + (count < 2 ? " disabled" : "") + ">Próximo ›</button></div></section>";
  }

  function renderExercise(source) {
    const data = parseJson(source);
    if (!data || typeof data.title !== "string" || typeof data.statement !== "string" || typeof data.answer !== "string" || !data.answer.trim()) {
      return blockError("Este exercício precisa de title, statement e answer.");
    }
    return `<section class="exercise"><h4>${escapeHtml(data.title)}</h4><p class="exercise-statement">${escapeHtml(data.statement)}</p><details class="exercise-solution"><summary>Ver gabarito</summary><div class="exercise-answer">${escapeHtml(data.answer)}</div></details></section>`;
  }

  // ---- Bloco "carrossel": um passo por imagem (caminho relativo ao .md ou URL https) ----
  function isAllowedImageSrc(src) {
    if (typeof src !== "string" || !src.trim()) return false;
    const scheme = src.trim().match(/^([a-z][a-z0-9+.-]*):/i);
    return !scheme || scheme[1].toLowerCase() === "https";
  }

  function renderCarrossel(source) {
    const data = parseJson(source);
    if (!data || !Array.isArray(data.images)) return blockError("Este carrossel tem um erro de formato.");
    if (data.images.length < 1) return blockError("O carrossel precisa de pelo menos uma imagem.");
    if (!data.images.every((image) => image && isAllowedImageSrc(image.src))) return blockError("Cada imagem do carrossel precisa de um endereço \"src\" (caminho relativo ou https).");
    const title = String(data.title || "Carrossel");
    const panels = data.images.map((image, i) => {
      const alt = escapeHtml(String(image.alt || `${title}, imagem ${i + 1}`));
      return `<img class="carrossel-img" src="${escapeHtml(image.src.trim())}" alt="${alt}" loading="lazy">`;
    });
    return renderStepper("carrossel", title, `<p class="stepper-title">${escapeHtml(title)}</p>`, panels);
  }

  // ---- Bloco "roteamento": Trie binária de rotas; o aluno escolhe o endereço e acompanha o maior prefixo comum ----
  // { "title": "...", "bits": 4, "endereco": "1011", "rotas": [{ "prefixo": "", "saida": "A" }, { "prefixo": "1", "saida": "B" }] }
  const BINARIO = /^[01]*$/;

  function renderRoteamento(source) {
    const data = parseJson(source);
    if (!data || !Array.isArray(data.rotas) || data.rotas.length < 1) return blockError("Este bloco de roteamento tem um erro de formato.");
    const bits = Number.isInteger(data.bits) && data.bits >= 1 && data.bits <= 6 ? data.bits : 4;
    const rotas = new Map();
    for (const rota of data.rotas) {
      const prefixo = rota && typeof rota.prefixo === "string" ? rota.prefixo : null;
      if (prefixo === null || !BINARIO.test(prefixo) || prefixo.length > bits || !rota.saida) {
        return blockError("Cada rota precisa de um prefixo com 0 e 1 (até " + bits + " bits) e de uma saída.");
      }
      rotas.set(prefixo, String(rota.saida));
    }
    const construir = data.modo === "construcao";   // "construcao": mostra a Trie sendo montada, rota por rota
    const endereco = typeof data.endereco === "string" && BINARIO.test(data.endereco) && data.endereco.length === bits ? data.endereco : "1".repeat(bits);

    // nós da Trie: todos os prefixos das rotas; "fantasmas": filhos que não existem (aparecem quando a busca para)
    const nos = new Set([""]);
    for (const prefixo of rotas.keys()) for (let k = 1; k <= prefixo.length; k++) nos.add(prefixo.slice(0, k));
    const fantasmas = [];
    if (!construir) for (const p of nos) if (p.length < bits) for (const b of "01") if (!nos.has(p + b)) fantasmas.push(p + b);

    const W = 34 * 2 ** Math.min(bits, 4);   // cada nó do último nível ganha uma faixa de 34 unidades
    const H = 26 + bits * 62 + 36;
    const x = (p) => (W * ((p ? parseInt(p, 2) : 0) + 0.5)) / 2 ** p.length;
    const y = (p) => 26 + p.length * 62;
    const r = (p) => (p.length >= 4 ? 13 : 16);
    const aresta = (p, cls) => {
      const pai = p.slice(0, -1);
      const mx = (x(pai) + x(p)) / 2, my = (y(pai) + y(p)) / 2;
      const lado = p.endsWith("0") ? -9 : 9;
      return '<g class="rt-edge' + cls + '" data-p="' + p + '"><line x1="' + x(pai) + '" y1="' + y(pai) + '" x2="' + x(p) + '" y2="' + y(p) + '"></line>' +
        '<text class="rt-bitlbl" x="' + (mx + lado) + '" y="' + (my + 4) + '">' + p.slice(-1) + "</text></g>";
    };
    const ordenados = Array.from(nos).sort((a, b) => a.length - b.length || a.localeCompare(b));
    let svg = "";
    for (const p of ordenados) if (p) svg += aresta(p, construir ? " rt-hidden" : "");
    for (const p of fantasmas) svg += aresta(p, " rt-ghost");
    for (const p of ordenados) {
      const saida = rotas.get(p);
      const rotulo = saida !== undefined && !construir ? escapeHtml(saida) : p ? "" : "raiz";
      const cls = construir ? (p ? " rt-hidden" : "") : saida !== undefined ? " rt-has" : "";
      svg += '<g class="rt-node' + cls + '" data-p="' + p + '"' + (saida !== undefined ? ' data-s="' + escapeHtml(saida) + '"' : "") + '><circle cx="' + x(p) + '" cy="' + y(p) + '" r="' + r(p) + '"></circle>' +
        '<text class="rt-name" x="' + x(p) + '" y="' + (y(p) + 5) + '">' + rotulo + "</text>" +
        (p ? '<text class="rt-pref" x="' + x(p) + '" y="' + (y(p) + r(p) + 13) + '">' + p + "</text>" : "") + "</g>";
    }
    for (const p of fantasmas) {
      svg += '<g class="rt-node rt-ghost" data-p="' + p + '"><circle cx="' + x(p) + '" cy="' + y(p) + '" r="' + r(p) + '"></circle>' +
        '<text class="rt-name" x="' + x(p) + '" y="' + (y(p) + 3) + '">NULL</text></g>';
    }

    const entradas = Array.from(rotas.entries());
    if (!construir) entradas.sort((a, b) => a[0].length - b[0].length || a[0].localeCompare(b[0]));
    const linhas = entradas
      .map(([p, s]) => '<tr data-p="' + p + '" data-s="' + escapeHtml(s) + '"><td><code>' + (p || "(vazio)") + "</code>" + (p ? "" : " <small>padrão</small>") + "</td><td>" + escapeHtml(s) + "</td></tr>").join("");
    const botoes = Array.from(endereco).map((b, i) => '<button type="button" class="rt-bit" data-i="' + i + '" aria-label="Bit ' + i + '">' + b + "</button>").join("");
    const title = String(data.title || (construir ? "Construindo a Trie de rotas" : "Roteamento com maior prefixo comum"));
    const svgHtml = '<svg class="rt-tree" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Trie binária com as rotas cadastradas">' + svg + "</svg>";
    const tabela = '<table class="rt-table"><thead><tr><th>Prefixo</th><th>Saída</th></tr></thead><tbody>' + linhas + "</tbody></table>";

    if (construir) {
      return '<section class="roteamento rt-build" data-kind="roteamento" aria-label="' + escapeHtml(title) + '">' +
        '<p class="stepper-title">' + escapeHtml(title) + "</p>" +
        '<div class="rt-top"><div class="rt-addr"><span class="rt-lbl">Prefixo sendo inserido</span><div class="rt-bits rt-pbits"><span class="rt-vazio">—</span></div></div>' +
        '<div class="rt-actions"><button type="button" data-rt="play" class="rt-play" data-label="▶ Construir">▶ Construir</button><button type="button" data-rt="step">Próximo passo ›</button><button type="button" data-rt="reset">Reiniciar</button></div></div>' +
        '<div class="rt-body">' + svgHtml + '<div class="rt-side">' + tabela +
        '<p class="rt-best">Nós na Trie: <strong>1</strong><span class="rt-count"> (só a raiz)</span></p></div></div>' +
        '<p class="rt-msg" aria-live="polite">A Trie começa só com a raiz. Clique em <strong>Construir</strong> ou em <strong>Próximo passo</strong> para inserir as rotas da tabela, uma por vez.</p>' +
        '<ol class="rt-log"></ol></section>';
    }

    return '<section class="roteamento" data-kind="roteamento" aria-label="' + escapeHtml(title) + '">' +
      '<p class="stepper-title">' + escapeHtml(title) + "</p>" +
      '<div class="rt-top"><div class="rt-addr"><span class="rt-lbl">Endereço do pacote (clique em um bit para trocá-lo)</span><div class="rt-bits">' + botoes + "</div></div>" +
      '<div class="rt-actions"><button type="button" data-rt="play" class="rt-play" data-label="▶ Rotear">▶ Rotear</button><button type="button" data-rt="step">Próximo passo ›</button><button type="button" data-rt="reset">Reiniciar</button></div></div>' +
      '<div class="rt-body">' + svgHtml + '<div class="rt-side">' + tabela +
      '<p class="rt-best">Melhor rota até agora: <strong>—</strong></p></div></div>' +
      '<p class="rt-msg" aria-live="polite">Escolha um endereço e clique em <strong>Rotear</strong> ou em <strong>Próximo passo</strong>.</p>' +
      '<ol class="rt-log"></ol></section>';
  }

  // Passos da busca pelo maior prefixo comum, calculados a partir do que está desenhado no bloco.
  function passosRoteamento(el) {
    const endereco = Array.from(el.querySelectorAll(".rt-bit")).map((b) => b.textContent).join("");
    const nos = new Set(Array.from(el.querySelectorAll(".rt-node:not(.rt-ghost)")).map((g) => g.dataset.p));
    const rotas = new Map(Array.from(el.querySelectorAll(".rt-table tbody tr")).map((tr) => [tr.dataset.p, tr.dataset.s]));
    const cod = (t) => "<code>" + escapeHtml(t || "(vazio)") + "</code>";
    const passos = [];
    let atual = "";
    let melhor = rotas.has("") ? "" : null;
    passos.push({ atual, melhor, bit: -1, msg: "O pacote chega à raiz. " + (melhor !== null
      ? "O prefixo vazio é a <strong>rota padrão</strong>: por enquanto, a melhor rota é <strong>" + escapeHtml(rotas.get("")) + "</strong>."
      : "Não há rota padrão: por enquanto, nenhuma rota combina.") });
    let parou = false;
    for (let i = 0; i < endereco.length; i++) {
      const b = endereco[i];
      const filho = atual + b;
      if (!nos.has(filho)) {
        passos.push({ atual, melhor, bit: i, ghost: filho, msg: "Bit " + i + " = " + b + ": o prefixo " + cod(filho) + " não existe na Trie (o filho é <code>NULL</code>). Nenhuma rota é mais longa, então a busca para aqui." });
        parou = true;
        break;
      }
      atual = filho;
      if (rotas.has(atual)) {
        melhor = atual;
        passos.push({ atual, melhor, bit: i, msg: "Bit " + i + " = " + b + ": descemos para " + cod(atual) + ". Esse nó tem rota (<strong>" + escapeHtml(rotas.get(atual)) + "</strong>) com um prefixo mais longo: ela passa a ser a melhor." });
      } else {
        passos.push({ atual, melhor, bit: i, msg: "Bit " + i + " = " + b + ": descemos para " + cod(atual) + ". Esse nó não tem rota própria (só existe porque leva a outras rotas); a melhor rota não muda." });
      }
    }
    if (!parou) passos.push({ atual, melhor, bit: endereco.length - 1, msg: "Os " + endereco.length + " bits do endereço acabaram: não há como descer mais." });
    const ultimo = passos[passos.length - 1];
    passos.push({ ...ultimo, fim: true, msg: melhor !== null
      ? "Resultado: o pacote " + escapeHtml(endereco) + " sai pela <strong>saída " + escapeHtml(rotas.get(melhor)) + "</strong>, porque " + cod(melhor) + " é o maior prefixo cadastrado que combina com o endereço."
      : "Resultado: nenhuma rota combina com " + escapeHtml(endereco) + " e não há rota padrão, então o pacote é descartado." });
    return passos;
  }

  // Passos da construção: insere as rotas na ordem da tabela, criando ou reaproveitando nós.
  function passosConstrucao(el) {
    const linhas = Array.from(el.querySelectorAll(".rt-table tbody tr")).map((tr) => [tr.dataset.p, tr.dataset.s]);
    const cod = (t) => "<code>" + escapeHtml(t) + "</code>";
    const existe = new Set([""]);
    const marcado = new Map();
    const passos = [];
    const foto = (extra) => passos.push({ existe: new Set(existe), marcado: new Map(marcado), ...extra });
    linhas.forEach(([prefixo, saida], j) => {
      const s = "<strong>" + escapeHtml(saida) + "</strong>";
      if (!prefixo) {
        marcado.set("", saida);
        foto({ linha: j, prefixo, atual: "", bit: -1, marcou: true, msg: "Rota " + cod("(vazio)") + " → " + s + ": o prefixo vazio é a própria raiz. Ela guarda a saída " + s + ", a <strong>rota padrão</strong>." });
        return;
      }
      foto({ linha: j, prefixo, atual: "", bit: -1, msg: "Nova rota: prefixo " + cod(prefixo) + " → saída " + s + ". Começamos pela raiz e seguimos os bits do prefixo." });
      let atual = "";
      for (let i = 0; i < prefixo.length; i++) {
        const b = prefixo[i];
        const filho = atual + b;
        if (existe.has(filho)) {
          atual = filho;
          foto({ linha: j, prefixo, atual, bit: i, msg: "Bit " + i + " = " + b + ": o nó " + cod(filho) + " <strong>já existe</strong>. Reaproveitamos e descemos para ele." });
        } else {
          existe.add(filho);
          atual = filho;
          foto({ linha: j, prefixo, atual, bit: i, novo: filho, msg: "Bit " + i + " = " + b + ": não há filho " + b + " aqui. <strong>Criamos</strong> o nó " + cod(filho) + " e descemos para ele." });
        }
      }
      marcado.set(prefixo, saida);
      foto({ linha: j, prefixo, atual, bit: prefixo.length, marcou: true, msg: "Fim do prefixo: o nó " + cod(prefixo) + " passa a guardar a saída " + s + "." });
    });
    const semRota = existe.size - marcado.size;
    foto({ linha: linhas.length, prefixo: "", atual: null, bit: -1, fim: true, msg: "Pronto: " + linhas.length + " rotas, " + existe.size + " nós." +
      (semRota ? " Os " + semRota + " nós sem letra não são rotas: existem só para levar a prefixos mais longos." : "") + " Agora a Trie pode ser usada para rotear pacotes." });
    return passos;
  }

  function mostrarConstrucao(el, n) {
    const passos = el.__rtPassos || (el.__rtPassos = passosConstrucao(el));
    const k = Math.min(n, passos.length - 1);
    el.__rtPasso = k;
    const passo = k >= 0 ? passos[k] : null;
    const existe = passo ? passo.existe : new Set([""]);
    const marcado = passo ? passo.marcado : new Map();
    const caminho = (p) => !!passo && passo.atual !== null && passo.atual.startsWith(p);
    el.querySelectorAll(".rt-node").forEach((g) => {
      const p = g.dataset.p;
      g.classList.toggle("rt-hidden", !existe.has(p));
      g.classList.toggle("rt-has", marcado.has(p));
      g.classList.toggle("rt-on", caminho(p));
      g.classList.toggle("rt-cur", !!passo && passo.atual === p);
      g.classList.toggle("rt-new", !!passo && passo.novo === p);
      g.classList.toggle("rt-win", !!passo && !!passo.marcou && passo.atual === p);
      g.querySelector(".rt-name").textContent = marcado.has(p) ? marcado.get(p) : p ? "" : "raiz";
    });
    el.querySelectorAll(".rt-edge").forEach((e) => {
      e.classList.toggle("rt-hidden", !existe.has(e.dataset.p));
      e.classList.toggle("rt-on", caminho(e.dataset.p));
    });
    el.querySelectorAll(".rt-table tbody tr").forEach((tr, j) => {
      tr.classList.toggle("rt-done", !!passo && j < passo.linha);
      tr.classList.toggle("rt-match", !!passo && j === passo.linha);
      tr.classList.toggle("rt-wait", !passo || j > passo.linha);
    });
    const pbits = el.querySelector(".rt-pbits");
    pbits.innerHTML = passo && passo.prefixo
      ? Array.from(passo.prefixo).map((b, i) => '<span class="rt-bit' + (i === passo.bit ? " rt-cur" : i < passo.bit ? " rt-done" : "") + '">' + b + "</span>").join("")
      : '<span class="rt-vazio">' + (passo && !passo.fim ? "(vazio)" : "—") + "</span>";
    const semRota = existe.size - marcado.size;
    el.querySelector(".rt-best strong").textContent = String(existe.size);
    el.querySelector(".rt-count").textContent = existe.size === 1 ? " (só a raiz)" : " (" + marcado.size + " com rota, " + semRota + " sem rota)";
    el.querySelector(".rt-msg").innerHTML = passo ? passo.msg : "A Trie começa só com a raiz. Clique em <strong>Construir</strong> ou em <strong>Próximo passo</strong> para inserir as rotas da tabela, uma por vez.";
    el.querySelector(".rt-log").innerHTML = passos.slice(0, Math.max(k, 0)).map((p) => "<li>" + p.msg + "</li>").join("");
    el.classList.toggle("rt-fim", !!passo && !!passo.fim);
    el.querySelector('[data-rt="step"]').disabled = !!passo && !!passo.fim;
    return !!passo && !!passo.fim;
  }

  function mostrarRoteamento(el, n) {
    if (el.classList.contains("pt")) return mostrarPatricia(el, n);
    if (el.classList.contains("rt-build")) return mostrarConstrucao(el, n);
    const passos = el.__rtPassos || (el.__rtPassos = passosRoteamento(el));
    const k = Math.min(n, passos.length - 1);
    el.__rtPasso = k;
    const passo = k >= 0 ? passos[k] : null;
    const noCaminho = (p) => passo && passo.atual.startsWith(p);
    el.querySelectorAll(".rt-node").forEach((g) => {
      const p = g.dataset.p;
      g.classList.toggle("rt-on", !!passo && noCaminho(p) && !g.classList.contains("rt-ghost"));
      g.classList.toggle("rt-cur", !!passo && passo.atual === p && !g.classList.contains("rt-ghost"));
      g.classList.toggle("rt-win", !!passo && passo.melhor === p);
      g.classList.toggle("rt-show", !!passo && passo.ghost === p);
    });
    el.querySelectorAll(".rt-edge").forEach((e) => {
      const p = e.dataset.p;
      e.classList.toggle("rt-on", !!passo && !e.classList.contains("rt-ghost") && noCaminho(p));
      e.classList.toggle("rt-show", !!passo && passo.ghost === p);
    });
    el.querySelectorAll(".rt-bit").forEach((b, i) => {
      b.classList.toggle("rt-cur", !!passo && passo.bit === i && !passo.fim);
      b.classList.toggle("rt-done", !!passo && i < passo.bit);
    });
    el.querySelectorAll(".rt-table tbody tr").forEach((tr) => {
      tr.classList.toggle("rt-match", !!passo && noCaminho(tr.dataset.p));
      tr.classList.toggle("rt-win", !!passo && passo.melhor === tr.dataset.p);
    });
    const rotas = new Map(Array.from(el.querySelectorAll(".rt-table tbody tr")).map((tr) => [tr.dataset.p, tr.dataset.s]));
    const best = el.querySelector(".rt-best strong");
    best.textContent = passo && passo.melhor !== null ? rotas.get(passo.melhor) + " (prefixo " + (passo.melhor || "vazio") + ")" : "—";
    el.querySelector(".rt-msg").innerHTML = passo ? passo.msg : "Escolha um endereço e clique em <strong>Rotear</strong> ou em <strong>Próximo passo</strong>.";
    el.querySelector(".rt-log").innerHTML = passos.slice(0, Math.max(k, 0)).map((p) => "<li>" + p.msg + "</li>").join("");
    el.classList.toggle("rt-fim", !!passo && !!passo.fim);
    el.querySelector('[data-rt="step"]').disabled = !!passo && !!passo.fim;
    return !!passo && !!passo.fim;
  }

  function pararRoteamento(el) {
    if (el.__rtTimer) { clearInterval(el.__rtTimer); el.__rtTimer = null; }
    const play = el.querySelector('[data-rt="play"]');
    if (play) { play.textContent = play.dataset.label || "▶ Rotear"; play.classList.remove("playing"); }
  }

  function acaoRoteamento(el, acao, alvo) {
    if (acao === "bit") {
      pararRoteamento(el);
      alvo.textContent = alvo.textContent === "1" ? "0" : "1";
      el.__rtPassos = null;
      mostrarRoteamento(el, -1);
      return;
    }
    if (acao === "reset") { pararRoteamento(el); el.__rtPassos = null; mostrarRoteamento(el, -1); return; }
    if (acao === "step") { pararRoteamento(el); mostrarRoteamento(el, (el.__rtPasso ?? -1) + 1); return; }
    if (acao === "play") {
      if (el.__rtTimer) { pararRoteamento(el); return; }
      if (el.classList.contains("rt-fim") || el.__rtPasso === undefined || el.__rtPasso < 0) mostrarRoteamento(el, 0);
      const play = el.querySelector('[data-rt="play"]');
      play.textContent = "⏸ Pausar"; play.classList.add("playing");
      el.__rtTimer = setInterval(() => {
        if (mostrarRoteamento(el, el.__rtPasso + 1)) pararRoteamento(el);
      }, 1400);
    }
  }

  // ---- Bloco "patricia": construção passo a passo de uma árvore Patricia (sem código) ----
  // { "title": "...", "bits": 5, "chaves": [{ "nome": "notas.txt", "bits": "01101" }, ...] }
  // Usa os mesmos botões e estilos do bloco "roteamento"; a árvore é redesenhada a cada passo,
  // porque na Patricia um nó novo pode entrar acima de nós que já existiam.
  function renderPatricia(source) {
    const data = parseJson(source);
    if (!data || !Array.isArray(data.chaves) || data.chaves.length < 1 || data.chaves.length > 10) return blockError("Este bloco Patricia precisa de 1 a 10 chaves.");
    const bits = Number.isInteger(data.bits) && data.bits >= 2 && data.bits <= 8 ? data.bits : 5;
    for (const c of data.chaves) {
      if (!c || typeof c.nome !== "string" || !c.nome.trim() || typeof c.bits !== "string" || !BINARIO.test(c.bits) || c.bits.length !== bits) {
        return blockError("Cada chave precisa de um nome e de " + bits + " bits (0 e 1).");
      }
    }
    const title = String(data.title || "Construindo uma árvore Patricia");
    const linhas = data.chaves.map((c) => '<tr data-nome="' + escapeHtml(c.nome) + '" data-bits="' + c.bits + '"><td>' + escapeHtml(c.nome) + "</td><td><code>" + c.bits + "</code></td></tr>").join("");
    const inicial = "A árvore começa vazia. Clique em <strong>Construir</strong> ou em <strong>Próximo passo</strong> para inserir as chaves da tabela, uma por vez.";
    return '<section class="roteamento rt-build pt" data-kind="patricia" data-bits="' + bits + '" aria-label="' + escapeHtml(title) + '">' +
      '<p class="stepper-title">' + escapeHtml(title) + "</p>" +
      '<div class="rt-top"><div class="rt-addr"><span class="rt-lbl">Chave sendo inserida</span><div class="rt-bits rt-pbits"><span class="rt-vazio">—</span></div></div>' +
      '<div class="rt-actions"><button type="button" data-rt="play" class="rt-play" data-label="▶ Construir">▶ Construir</button><button type="button" data-rt="step">Próximo passo ›</button><button type="button" data-rt="reset">Reiniciar</button></div></div>' +
      '<div class="rt-body"><svg class="rt-tree pt-tree" viewBox="0 0 400 120" role="img" aria-label="Árvore Patricia"><text class="pt-vazia" x="200" y="64">árvore vazia</text></svg>' +
      '<div class="rt-side"><table class="rt-table"><thead><tr><th>Chave</th><th>Bits</th></tr></thead><tbody>' + linhas + "</tbody></table>" +
      '<p class="rt-best">Folhas: <strong>0</strong><span class="rt-count"> · nós internos: 0</span></p></div></div>' +
      '<p class="rt-msg" aria-live="polite">' + inicial + "</p>" +
      '<ol class="rt-log"></ol></section>';
  }

  function passosPatricia(el) {
    const chaves = Array.from(el.querySelectorAll(".rt-table tbody tr")).map((tr) => ({ nome: tr.dataset.nome, bits: tr.dataset.bits }));
    const nb = Number(el.dataset.bits) || chaves[0].bits.length;
    const bit = (i, b) => Number(b[i - 1]);
    const cod = (t) => "<code>" + escapeHtml(t) + "</code>";
    const nome = (c) => "<strong>" + escapeHtml(c.nome) + "</strong>";
    let seq = 0;
    let raiz = null;
    const clone = (n) => (n === null ? null : n.t === "e" ? { ...n } : { ...n, esq: clone(n.esq), dir: clone(n.dir) });
    const passos = [];
    const foto = (extra) => passos.push({ raiz: clone(raiz), ...extra });

    chaves.forEach((c, j) => {
      const base = { linha: j, chave: c };
      if (raiz === null) {
        raiz = { t: "e", id: "f" + seq++, chave: c };
        foto({ ...base, novos: [raiz.id], msg: "Primeira chave: " + nome(c) + " (" + cod(c.bits) + "). A árvore estava vazia, então ela vira uma <strong>folha</strong>, que é a raiz." });
        return;
      }
      foto({ ...base, msg: "Nova chave: " + nome(c) + " (" + cod(c.bits) + "). Primeiro descemos até uma folha, seguindo os bits que os nós internos mandam testar." });
      // 1) desce até uma folha
      let p = raiz;
      const caminho = [];
      while (p.t === "i") {
        const b = bit(p.idx, c.bits);
        caminho.push(p.id);
        foto({ ...base, caminho: caminho.slice(), atual: p.id, bitAtual: p.idx, msg: "Este nó testa o <strong>bit " + p.idx + "</strong>. Em " + cod(c.bits) + " ele vale " + b + ", então vamos para a " + (b ? "direita" : "esquerda") + "." });
        p = b ? p.dir : p.esq;
      }
      caminho.push(p.id);
      // 2) primeiro bit diferente
      let i = 1;
      while (i <= nb && bit(i, c.bits) === bit(i, p.chave.bits)) i++;
      if (i > nb) {
        foto({ ...base, caminho, atual: p.id, cmp: p.id, msg: "Chegamos à folha " + nome(p.chave) + " (" + cod(p.chave.bits) + "): os bits são <strong>todos iguais</strong>. A chave já está no índice, então nada é inserido." });
        return;
      }
      foto({ ...base, caminho, atual: p.id, cmp: p.id, bitDif: i, msg: "Chegamos à folha " + nome(p.chave) + " (" + cod(p.chave.bits) + "). Comparando com " + cod(c.bits) + ", o primeiro bit diferente é o <strong>bit " + i + "</strong>. Precisamos de um nó interno que teste esse bit." });
      // 3) acha o lugar: primeiro nó do caminho que é folha ou testa bit maior que i
      let pai = null, lado = null, t = raiz;
      const caminho2 = [];
      while (t.t === "i" && t.idx < i) {
        caminho2.push(t.id);
        pai = t; lado = bit(t.idx, c.bits) ? "dir" : "esq"; t = t[lado];
      }
      caminho2.push(t.id);
      const onde = pai === null ? "no lugar da <strong>raiz</strong>" : "logo abaixo do nó que testa o bit " + pai.idx;
      const porque = t.t === "e" ? "porque ali há uma folha" : "porque o nó que estava ali testa o bit " + t.idx + ", maior que " + i;
      foto({ ...base, caminho: caminho2, atual: t.id, bitDif: i, msg: "Descendo de novo a partir da raiz, o nó do bit " + i + " entra " + onde + ", " + porque + ". Assim os bits testados continuam crescentes de cima para baixo." });
      // 4) cria o nó interno e a folha
      const folha = { t: "e", id: "f" + seq++, chave: c };
      const b = bit(i, c.bits);
      const novo = { t: "i", id: "n" + seq++, idx: i, esq: b ? t : folha, dir: b ? folha : t };
      if (pai === null) raiz = novo; else pai[lado] = novo;
      foto({ ...base, novos: [novo.id, folha.id], bitDif: i, msg: "Criamos o nó interno que testa o <strong>bit " + i + "</strong> e a folha de " + nome(c) + ". Como o bit " + i + " de " + cod(c.bits) + " vale " + b + ", a nova folha fica à " + (b ? "direita" : "esquerda") + " e o que estava ali vai para o outro lado." });
    });
    let folhas = 0, internos = 0, altura = 0;
    const conta = (n, d) => { if (!n) return; altura = Math.max(altura, d); if (n.t === "e") folhas++; else { internos++; conta(n.esq, d + 1); conta(n.dir, d + 1); } };
    conta(raiz, 0);
    foto({ linha: chaves.length, fim: true, msg: "Pronto: " + folhas + " chaves e " + internos + " nós internos. Para achar qualquer chave basta testar no máximo " + altura + " bits e fazer <strong>uma única comparação</strong> da chave inteira, na folha." });
    return passos;
  }

  function desenhaPatricia(raiz, passo, ordem, alturaMax) {
    if (!raiz) return { box: "0 0 400 120", svg: '<text class="pt-vazia" x="200" y="64">árvore vazia</text>' };
    const LX = 92, LY = 82, W = Math.max(400, ordem.length * LX), H = 50 + alturaMax * LY + 34;
    const x0 = (W - ordem.length * LX) / 2 + LX / 2;
    const pos = new Map();
    const mede = (n, d) => {
      if (n.t === "e") { const x = x0 + ordem.indexOf(n.chave.bits) * LX; pos.set(n.id, [x, 36 + d * LY]); return [x, x]; }
      const a = mede(n.esq, d + 1), b = mede(n.dir, d + 1);
      pos.set(n.id, [(a[0] + b[1]) / 2, 36 + d * LY]);
      return [a[0], b[1]];
    };
    mede(raiz, 0);
    const caminho = new Set(passo.caminho || []);
    const novos = new Set(passo.novos || []);
    let arestas = "", nos = "";
    const visita = (n) => {
      const [x, y] = pos.get(n.id);
      const cls = (caminho.has(n.id) ? " rt-on" : "") + (passo.atual === n.id ? " rt-cur" : "") + (novos.has(n.id) ? " rt-new" : "") + (passo.cmp === n.id ? " pt-cmp" : "");
      if (n.t === "i") {
        for (const [filho, b] of [[n.esq, "0"], [n.dir, "1"]]) {
          const [fx, fy] = pos.get(filho.id);
          const on = caminho.has(n.id) && caminho.has(filho.id);
          arestas += '<g class="rt-edge' + (on ? " rt-on" : "") + (novos.has(filho.id) && novos.has(n.id) ? " rt-new" : "") + '"><line x1="' + x + '" y1="' + y + '" x2="' + fx + '" y2="' + (filho.t === "e" ? fy - 20 : fy) + '"></line>' +
            '<text class="rt-bitlbl" x="' + ((x + fx) / 2 + (b === "0" ? -10 : 10)) + '" y="' + ((y + fy) / 2) + '">' + b + "</text></g>";
          visita(filho);
        }
        nos += '<g class="rt-node pt-int' + cls + '"><circle cx="' + x + '" cy="' + y + '" r="20"></circle>' +
          '<text class="pt-small" x="' + x + '" y="' + (y - 5) + '">bit</text><text class="rt-name" x="' + x + '" y="' + (y + 11) + '">' + n.idx + "</text></g>";
      } else {
        nos += '<g class="rt-node pt-leaf' + cls + '"><rect x="' + (x - 42) + '" y="' + (y - 20) + '" width="84" height="42" rx="9"></rect>' +
          '<text class="pt-nome" x="' + x + '" y="' + (y - 3) + '">' + escapeHtml(n.chave.nome) + '</text><text class="pt-bits" x="' + x + '" y="' + (y + 14) + '">' + n.chave.bits + "</text></g>";
      }
    };
    visita(raiz);
    return { box: "0 0 " + W + " " + H, svg: arestas + nos };
  }

  function mostrarPatricia(el, n) {
    const passos = el.__rtPassos || (el.__rtPassos = passosPatricia(el));
    if (!el.__ptOrdem) {
      // folhas sempre na mesma coluna: ordem crescente das chaves (é a ordem em que a Patricia as deixa)
      el.__ptOrdem = Array.from(new Set(Array.from(el.querySelectorAll(".rt-table tbody tr")).map((tr) => tr.dataset.bits))).sort();
      let h = 0;
      const alt = (r, d) => { if (!r) return; h = Math.max(h, d); if (r.t === "i") { alt(r.esq, d + 1); alt(r.dir, d + 1); } };
      passos.forEach((p) => alt(p.raiz, 0));
      el.__ptAltura = h;
    }
    const k = Math.min(n, passos.length - 1);
    el.__rtPasso = k;
    const passo = k >= 0 ? passos[k] : { raiz: null, linha: -1 };
    const desenho = desenhaPatricia(passo.raiz, passo, el.__ptOrdem, el.__ptAltura);
    const svg = el.querySelector(".pt-tree");
    svg.setAttribute("viewBox", desenho.box);
    svg.innerHTML = desenho.svg;
    el.querySelectorAll(".rt-table tbody tr").forEach((tr, j) => {
      tr.classList.toggle("rt-done", k >= 0 && j < passo.linha);
      tr.classList.toggle("rt-match", k >= 0 && j === passo.linha);
      tr.classList.toggle("rt-wait", k < 0 || j > passo.linha);
    });
    const pbits = el.querySelector(".rt-pbits");
    pbits.innerHTML = passo.chave
      ? Array.from(passo.chave.bits).map((b, i) => '<span class="rt-bit' + (passo.bitAtual === i + 1 ? " rt-cur" : passo.bitDif === i + 1 ? " pt-dif" : "") + '" title="bit ' + (i + 1) + '">' + b + "</span>").join("") + '<span class="pt-chave">' + escapeHtml(passo.chave.nome) + "</span>"
      : '<span class="rt-vazio">—</span>';
    let folhas = 0, internos = 0;
    const conta = (r) => { if (!r) return; if (r.t === "e") folhas++; else { internos++; conta(r.esq); conta(r.dir); } };
    conta(passo.raiz);
    el.querySelector(".rt-best strong").textContent = String(folhas);
    el.querySelector(".rt-count").textContent = " · nós internos: " + internos;
    el.querySelector(".rt-msg").innerHTML = k >= 0 ? passo.msg : "A árvore começa vazia. Clique em <strong>Construir</strong> ou em <strong>Próximo passo</strong> para inserir as chaves da tabela, uma por vez.";
    el.querySelector(".rt-log").innerHTML = passos.slice(0, Math.max(k, 0)).map((p) => "<li>" + p.msg + "</li>").join("");
    el.classList.toggle("rt-fim", !!passo.fim);
    el.querySelector('[data-rt="step"]').disabled = !!passo.fim;
    return !!passo.fim;
  }

  // ---- Widgets interativos de "Registros de tamanho fixo" (tópico 6 de AEDS II) ----
  // Blocos: registro, alinhamento, rrn, blocos. Cada um recebe um JSON (ver docs/guia-e-modelo-markdown.md).
  // O renderizador só emite uma "casca" com a configuração em data-cfg; iniciarWidgets() monta a parte
  // interativa depois que a página é inserida (assim o HTML passa pelo DOMPurify sem perder nada).

  // ---- contas puras (testadas em tests/renderer.test.js) ----
  function calcCampo(valor, bytes) {
    // quantos bytes do texto cabem no campo; o que passa do limite é "cortado"
    const enc = new TextEncoder();
    const cels = [];
    let usados = 0;
    let corte = "";
    let cortando = false;
    for (const ch of Array.from(String(valor))) {
      const n = enc.encode(ch).length;
      if (cortando || usados + n > bytes) { cortando = true; corte += ch; continue; }
      for (let k = 0; k < n; k++) cels.push({ ch, cont: k > 0 });
      usados += n;
    }
    return { cels, usados, corte };
  }

  function calcStruct(campos, ordem) {
    // cada campo começa num múltiplo do próprio alinhamento; o tamanho final é múltiplo do maior alinhamento
    let off = 0;
    let maior = 1;
    let soma = 0;
    const itens = [];
    for (const i of ordem) {
      const c = campos[i];
      const pad = (c.align - (off % c.align)) % c.align;
      if (pad) itens.push({ pad });
      itens.push({ campo: i, bytes: c.bytes, off: off + pad });
      off += pad + c.bytes;
      soma += c.bytes;
      if (c.align > maior) maior = c.align;
    }
    const fim = (maior - (off % maior)) % maior;
    if (fim) itens.push({ pad: fim, fim: true });
    return { itens, soma, sizeof: off + fim, padding: off + fim - soma };
  }

  function melhorOrdem(campos) {
    let melhor = null;
    const usa = (ordem, resto) => {
      if (!resto.length) {
        const r = calcStruct(campos, ordem);
        if (melhor === null || r.sizeof < melhor.sizeof) melhor = { ordem: ordem.slice(), sizeof: r.sizeof };
        return;
      }
      resto.forEach((x, k) => usa(ordem.concat(x), resto.filter((_, j) => j !== k)));
    };
    usa([], campos.map((_, i) => i));
    return melhor.ordem;
  }

  function calcOffset(cab, tam, rrn) { return cab + rrn * tam; }

  function calcBlocos(B, R, N, espalhada) {
    const fb = Math.floor(B / R);
    const out = { fb, sobra: fb ? B - fb * R : B, blocos: [], divididos: 0, cabe: fb > 0 };
    if (!espalhada) {
      if (!fb) return out;
      const nb = Math.ceil(N / fb);
      for (let b = 0; b < nb; b++) {
        const qtd = Math.min(fb, N - b * fb);
        const segs = [];
        for (let k = 0; k < qtd; k++) segs.push({ rec: b * fb + k, bytes: R });
        if (B - qtd * R) segs.push({ livre: B - qtd * R, sobra: qtd === fb });
        out.blocos.push(segs);
      }
    } else {
      const total = N * R;
      const nb = Math.ceil(total / B);
      for (let b = 0; b < nb; b++) {
        const ini = b * B;
        const fim = Math.min(total, ini + B);
        const segs = [];
        for (let p = ini; p < fim;) {
          const rec = Math.floor(p / R);
          const q = Math.min(fim, (rec + 1) * R);
          segs.push({ rec, bytes: q - p, cont: p > rec * R, corta: q < (rec + 1) * R });
          p = q;
        }
        if (fim - ini < B) segs.push({ livre: B - (fim - ini), sobra: false });
        out.blocos.push(segs);
      }
      for (let rec = 0; rec < N; rec++) {
        if (Math.floor((rec * R) / B) !== Math.floor((rec * R + R - 1) / B)) out.divididos++;
      }
    }
    return out;
  }

  function fmtNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }

  // ---- as quatro "cascas" ----
  function cascaRg(tipo, data, cfg, erro) {
    const titulo = String(data.title || "");
    return '<section class="rg rg-' + tipo + '" data-kind="' + tipo + '" data-cfg="' + escapeHtml(JSON.stringify(cfg)) + '" aria-label="' + escapeHtml(titulo) + '">' +
      (titulo ? '<p class="stepper-title">' + escapeHtml(titulo) + "</p>" : "") +
      (data.dica ? '<p class="rg-dica">' + renderInline(String(data.dica)) + "</p>" : "") +
      '<div class="rg-app"><p class="rg-dica">Carregando…</p></div></section>';
  }

  function renderRegistro(source) {
    const data = parseJson(source);
    const campos = data && data.campos;
    if (!Array.isArray(campos) || campos.length < 1 || campos.length > 5) return blockError("O bloco registro precisa de 1 a 5 campos.");
    for (const c of campos) {
      if (!c || typeof c.nome !== "string" || !c.nome.trim() || !Number.isInteger(c.bytes) || c.bytes < 2 || c.bytes > 64) {
        return blockError("Cada campo do bloco registro precisa de um nome e de um tamanho (2 a 64 bytes).");
      }
    }
    const cfg = { campos: campos.map((c) => ({ nome: c.nome, bytes: c.bytes, valor: String(c.valor || "") })), milhao: data.milhao !== false };
    return cascaRg("registro", data, cfg);
  }

  function renderAlinhamento(source) {
    const data = parseJson(source);
    const campos = data && data.campos;
    if (!Array.isArray(campos) || campos.length < 2 || campos.length > 6) return blockError("O bloco alinhamento precisa de 2 a 6 campos.");
    for (const c of campos) {
      if (!c || typeof c.decl !== "string" || !c.decl.trim() || !Number.isInteger(c.bytes) || c.bytes < 1 || ![1, 2, 4, 8].includes(c.align)) {
        return blockError("Cada campo do bloco alinhamento precisa de decl, bytes e align (1, 2, 4 ou 8).");
      }
    }
    const cfg = { campos: campos.map((c) => ({ decl: c.decl, bytes: c.bytes, align: c.align })) };
    return cascaRg("alinhamento", data, cfg);
  }

  function renderRrn(source) {
    const data = parseJson(source);
    if (!data || typeof data !== "object") return blockError("Este bloco rrn tem um erro de formato.");
    const cab = data.cab === undefined ? 8 : data.cab;
    const tam = data.tam === undefined ? 70 : data.tam;
    const n = data.n === undefined ? 8 : data.n;
    if (!Number.isInteger(cab) || cab < 0 || cab > 4096 || !Number.isInteger(tam) || tam < 1 || tam > 4096 || !Number.isInteger(n) || n < 3 || n > 12) {
      return blockError("O bloco rrn precisa de cab (0 a 4096), tam (1 a 4096) e n (3 a 12).");
    }
    return cascaRg("rrn", data, { cab, tam, n, rrn: Math.min(Number.isInteger(data.rrn) ? Math.max(data.rrn, 0) : 3, n - 1) });
  }

  function renderBlocosWidget(source) {
    const data = parseJson(source);
    if (!data || typeof data !== "object") return blockError("Este bloco blocos tem um erro de formato.");
    const B = data.bloco === undefined ? 200 : data.bloco;
    const R = data.registro === undefined ? 70 : data.registro;
    const N = data.registros === undefined ? 5 : data.registros;
    if (!Number.isInteger(B) || B < 100 || B > 400 || !Number.isInteger(R) || R < 20 || R > 150 || !Number.isInteger(N) || N < 3 || N > 12) {
      return blockError("O bloco blocos precisa de bloco (100 a 400), registro (20 a 150) e registros (3 a 12).");
    }
    return cascaRg("blocos", data, { B, R, N, espalhada: data.espalhada === true });
  }

  // ---- montagem do DOM ----
  function mk(tag, cls, texto) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function celula(cls, texto) { return mk("span", "rg-cel " + cls, texto); }

  function iniciarRegistro(el, cfg) {
    const app = el.querySelector(".rg-app");
    app.replaceChildren();
    const st = { bytes: cfg.campos.map((c) => c.bytes), valor: cfg.campos.map((c) => c.valor) };
    el.__rg = st;
    cfg.campos.forEach((c, i) => {
      const row = mk("div", "rg-row");
      row.dataset.i = String(i);
      const head = mk("div", "rg-head");
      head.append(mk("span", "rg-nome rg-c" + (i % 4), c.nome));
      const texto = mk("input", "rg-texto");
      texto.type = "text"; texto.value = c.valor; texto.dataset.rg = "texto"; texto.dataset.i = String(i);
      texto.autocomplete = "off"; texto.spellcheck = false;
      texto.setAttribute("aria-label", "Valor do campo " + c.nome);
      const slide = mk("label", "rg-slide", "tamanho ");
      const rng = mk("input");
      rng.type = "range"; rng.min = "4"; rng.max = String(Math.max(40, Math.ceil(c.bytes * 1.5)));
      rng.value = String(c.bytes); rng.dataset.rg = "tam"; rng.dataset.i = String(i);
      rng.setAttribute("aria-label", "Tamanho do campo " + c.nome + " em bytes");
      slide.append(rng, mk("output", "rg-tamval"));
      head.append(texto, slide);
      row.append(head, mk("div", "rg-cells"), mk("p", "rg-nota"));
      app.append(row);
    });
    app.append(mk("div", "rg-resumo"));
    app.querySelector(".rg-resumo").setAttribute("aria-live", "polite");
    atualizarRegistro(el, cfg);
  }

  function atualizarRegistro(el, cfg) {
    const st = el.__rg;
    let usados = 0;
    let total = 0;
    let cortou = false;
    cfg.campos.forEach((c, i) => {
      const r = calcCampo(st.valor[i], st.bytes[i]);
      const row = el.querySelector('.rg-row[data-i="' + i + '"]');
      const cels = row.querySelector(".rg-cells");
      cels.replaceChildren();
      for (const k of r.cels) cels.append(celula("rg-c" + (i % 4) + (k.cont ? " rg-cont" : ""), k.cont ? "" : k.ch === " " ? "\u00b7" : k.ch));
      for (let k = r.usados; k < st.bytes[i]; k++) cels.append(celula("rg-vazio"));
      row.querySelector(".rg-tamval").textContent = st.bytes[i] + " bytes (do byte " + total + " ao " + (total + st.bytes[i] - 1) + ")";
      const nota = row.querySelector(".rg-nota");
      nota.textContent = r.corte ? "⚠ cortado: “" + r.corte + "” não coube no campo" : r.usados + " de " + st.bytes[i] + " bytes usados · " + (st.bytes[i] - r.usados) + " sem uso";
      nota.classList.toggle("rg-corte", !!r.corte);
      if (r.corte) cortou = true;
      usados += r.usados;
      total += st.bytes[i];
    });
    const desp = total - usados;
    const pct = total ? Math.round((desp * 100) / total) : 0;
    const resumo = el.querySelector(".rg-resumo");
    resumo.replaceChildren();
    const barra = mk("div", "rg-barra");
    const cheio = mk("span");
    cheio.style.width = 100 - pct + "%";
    barra.append(cheio);
    const linha = mk("p", "rg-linha");
    linha.innerHTML = "<strong>" + usados + "</strong> de <strong>" + total + "</strong> bytes guardam dado · <strong class=\"rg-ruim\">" + desp + " bytes (" + pct + "%)</strong> são fragmentação interna";
    resumo.append(barra, linha);
    if (cfg.milhao) {
      const m = mk("p", "rg-linha");
      m.innerHTML = "Com 1 milhão de registros: <strong class=\"rg-ruim\">" + fmtNum(desp) + " MB</strong> desperdiçados";
      resumo.append(m);
    }
    if (cortou) resumo.append(mk("p", "rg-aviso", "Há dado cortado. Aumente o campo ou use um valor menor."));
  }

  function iniciarAlinhamento(el, cfg) {
    el.__rg = { ordem: cfg.campos.map((_, i) => i) };
    desenharAlinhamento(el, cfg);
  }

  function desenharAlinhamento(el, cfg) {
    const ordem = el.__rg.ordem;
    const r = calcStruct(cfg.campos, ordem);
    const app = el.querySelector(".rg-app");
    app.replaceChildren();
    const lista = mk("ol", "rg-ordem");
    ordem.forEach((idx, pos) => {
      const li = mk("li", "rg-c" + (idx % 4));
      li.append(mk("code", "", cfg.campos[idx].decl + ";"));
      const sobe = mk("button", "rg-mini", "↑");
      sobe.type = "button"; sobe.dataset.rg = "sobe"; sobe.dataset.i = String(pos); sobe.disabled = pos === 0;
      sobe.setAttribute("aria-label", "Subir " + cfg.campos[idx].decl);
      const desce = mk("button", "rg-mini", "↓");
      desce.type = "button"; desce.dataset.rg = "desce"; desce.dataset.i = String(pos); desce.disabled = pos === ordem.length - 1;
      desce.setAttribute("aria-label", "Descer " + cfg.campos[idx].decl);
      li.append(sobe, desce);
      lista.append(li);
    });
    const mem = mk("div", "rg-mem");
    mem.setAttribute("role", "img");
    mem.setAttribute("aria-label", "Memória da struct: " + r.sizeof + " bytes, " + r.padding + " de preenchimento");
    let byte = 0;
    for (const it of r.itens) {
      if (it.pad) {
        for (let k = 0; k < it.pad; k++) mem.append(celula("rg-pad", "pad"));
        byte += it.pad;
      } else {
        const c = cfg.campos[it.campo];
        for (let k = 0; k < it.bytes; k++) mem.append(celula("rg-c" + (it.campo % 4), k === 0 ? c.decl.replace(/^\w+\s+/, "").replace(/\[.*$/, "") : ""));
        byte += it.bytes;
      }
    }
    const escala = mk("div", "rg-escala");
    for (let b = 0; b < r.sizeof; b++) escala.append(mk("span", "", b % 4 === 0 ? String(b) : ""));
    const info = mk("p", "rg-linha");
    info.innerHTML = "soma dos campos: <strong>" + r.soma + "</strong> · <code>sizeof</code>: <strong class=\"" + (r.padding ? "rg-ruim" : "rg-bom") + "\">" + r.sizeof + "</strong> bytes · preenchimento: <strong>" + r.padding + "</strong>";
    const msg = mk("p", "rg-msg", r.padding
      ? "Os bytes vermelhos (pad) são preenchimento: o compilador os coloca para alinhar cada campo. Tente outra ordem."
      : "Sem preenchimento! O sizeof é igual à soma dos campos.");
    msg.classList.toggle("rg-ok", !r.padding);
    const acoes = mk("div", "rg-acoes");
    const dica = mk("button", "rg-btn", "Mostrar uma boa ordem");
    dica.type = "button"; dica.dataset.rg = "melhor";
    const zera = mk("button", "rg-btn rg-sec", "Reiniciar");
    zera.type = "button"; zera.dataset.rg = "zera";
    acoes.append(dica, zera);
    app.append(lista, mem, escala, info, msg, acoes);
  }

  function iniciarRrn(el, cfg) {
    const app = el.querySelector(".rg-app");
    app.replaceChildren();
    el.__rg = { rrn: cfg.rrn, grande: false };
    const faixa = mk("div", "rg-faixa");
    faixa.setAttribute("role", "group");
    faixa.setAttribute("aria-label", "Registros do arquivo");
    const cab = mk("span", "rg-rec rg-cabec");
    cab.append(mk("b", "", "cab"), mk("small", "", "0"));
    faixa.append(cab);
    for (let i = 0; i < cfg.n; i++) {
      const b = mk("button", "rg-rec");
      b.type = "button"; b.dataset.rg = "rrn"; b.dataset.i = String(i);
      b.append(mk("b", "", "R" + i), mk("small", "", String(calcOffset(cfg.cab, cfg.tam, i))));
      b.setAttribute("aria-label", "Registro de RRN " + i);
      faixa.append(b);
    }
    faixa.append(mk("span", "rg-rec rg-mais", "…"));
    const rng = mk("input", "rg-rrnslide");
    rng.type = "range"; rng.min = "0"; rng.max = String(cfg.n - 1); rng.value = String(cfg.rrn);
    rng.dataset.rg = "rrnslide"; rng.setAttribute("aria-label", "RRN procurado");
    const formula = mk("p", "rg-formula");
    const codigo = mk("p", "rg-fseek");
    const lanes = mk("div", "rg-lanes");
    const seq = mk("div", "rg-lane rg-seq");
    const dir = mk("div", "rg-lane rg-dir");
    for (const l of [seq, dir]) { l.append(mk("span", "rg-lbl"), mk("div", "rg-mini-faixa"), mk("p", "rg-conta")); }
    seq.querySelector(".rg-lbl").textContent = "Sequencial";
    dir.querySelector(".rg-lbl").textContent = "Direto (com RRN)";
    for (const l of [seq, dir]) for (let i = 0; i < cfg.n; i++) l.querySelector(".rg-mini-faixa").append(mk("span", "rg-quad"));
    lanes.append(seq, dir);
    const acoes = mk("div", "rg-acoes");
    const grande = mk("button", "rg-btn", "E se o RRN fosse 5 000 000?");
    grande.type = "button"; grande.dataset.rg = "grande";
    acoes.append(grande);
    app.append(faixa, rng, formula, codigo, lanes, acoes);
    app.querySelector(".rg-lanes").setAttribute("aria-live", "polite");
    atualizarRrn(el, cfg);
  }

  function atualizarRrn(el, cfg) {
    const st = el.__rg;
    const rrn = st.grande ? 5000000 : st.rrn;
    const off = calcOffset(cfg.cab, cfg.tam, rrn);
    const app = el.querySelector(".rg-app");
    app.classList.toggle("rg-grande", st.grande);
    app.querySelectorAll(".rg-faixa .rg-rec[data-i]").forEach((b) => {
      const i = Number(b.dataset.i);
      b.classList.toggle("rg-sel", !st.grande && i === st.rrn);
      b.classList.toggle("rg-antes", !st.grande && i < st.rrn);
    });
    app.querySelector(".rg-rrnslide").value = String(st.rrn);
    app.querySelector(".rg-rrnslide").disabled = st.grande;
    app.querySelector(".rg-formula").innerHTML = "offset = <span class=\"rg-t0\">" + fmtNum(cfg.cab) + "</span> + <span class=\"rg-t1\">" + fmtNum(rrn) + "</span> × <span class=\"rg-t2\">" + fmtNum(cfg.tam) + "</span> = <strong>" + fmtNum(off) + "</strong>" +
      "<small>cabeçalho + RRN × tamanho</small>";
    app.querySelector(".rg-fseek").innerHTML = "<code>fseek(f, " + fmtNum(off) + ", SEEK_SET);</code>";
    const seq = app.querySelector(".rg-seq");
    const dir = app.querySelector(".rg-dir");
    seq.querySelectorAll(".rg-quad").forEach((q, i) => { q.className = "rg-quad" + (!st.grande && i < st.rrn ? " rg-lido" : !st.grande && i === st.rrn ? " rg-alvo" : ""); });
    dir.querySelectorAll(".rg-quad").forEach((q, i) => { q.className = "rg-quad" + (!st.grande && i === st.rrn ? " rg-alvo" : ""); });
    seq.querySelector(".rg-conta").innerHTML = "<strong class=\"rg-ruim\">" + fmtNum(rrn) + "</strong> registros lidos só para chegar lá";
    dir.querySelector(".rg-conta").innerHTML = "<strong class=\"rg-bom\">0</strong> registros lidos antes · <strong>1</strong> <code>fseek</code>";
    const g = app.querySelector('[data-rg="grande"]');
    g.textContent = st.grande ? "Voltar ao exemplo pequeno" : "E se o RRN fosse 5 000 000?";
  }

  function iniciarBlocos(el, cfg) {
    const app = el.querySelector(".rg-app");
    app.replaceChildren();
    el.__rg = { B: cfg.B, R: cfg.R, espalhada: cfg.espalhada };
    const ctrl = mk("div", "rg-ctrl");
    const mkSlide = (rotulo, chave, min, max, valor) => {
      const l = mk("label", "rg-slide", rotulo + " ");
      const r = mk("input");
      r.type = "range"; r.min = String(min); r.max = String(max); r.step = "10"; r.value = String(valor);
      r.dataset.rg = chave; r.setAttribute("aria-label", rotulo + " em bytes");
      l.append(r, mk("output", "rg-tamval"));
      return l;
    };
    ctrl.append(mkSlide("bloco", "B", 100, 400, cfg.B), mkSlide("registro", "R", 20, 150, cfg.R));
    const modo = mk("div", "rg-modo");
    modo.setAttribute("role", "group");
    modo.setAttribute("aria-label", "Organização");
    for (const [v, t] of [["nao", "Não espalhada"], ["sim", "Espalhada"]]) {
      const b = mk("button", "rg-btn rg-sec", t);
      b.type = "button"; b.dataset.rg = "modo"; b.dataset.v = v;
      modo.append(b);
    }
    ctrl.append(modo);
    app.append(ctrl, mk("div", "rg-area"), mk("div", "rg-nums"), mk("p", "rg-msg"));
    app.querySelector(".rg-nums").setAttribute("aria-live", "polite");
    atualizarBlocos(el, cfg);
  }

  function atualizarBlocos(el, cfg) {
    const st = el.__rg;
    const r = calcBlocos(st.B, st.R, cfg.N, st.espalhada);
    const app = el.querySelector(".rg-app");
    const sliders = app.querySelectorAll(".rg-slide");
    sliders[0].querySelector("output").textContent = st.B + " bytes";
    sliders[1].querySelector("output").textContent = st.R + " bytes";
    app.querySelectorAll('[data-rg="modo"]').forEach((b) => {
      const on = (b.dataset.v === "sim") === st.espalhada;
      b.classList.toggle("rg-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    const area = app.querySelector(".rg-area");
    area.replaceChildren();
    r.blocos.forEach((segs, b) => {
      const linha = mk("div", "rg-bloco");
      linha.append(mk("span", "rg-bnome", "bloco " + b));
      const barra = mk("div", "rg-bbarra");
      for (const s of segs) {
        const seg = mk("span", "rg-seg");
        if (s.livre !== undefined) {
          seg.classList.add(s.sobra ? "rg-sobra" : "rg-livre");
          seg.textContent = s.sobra ? "sobra " + s.livre : "vazio";
          seg.style.flex = s.livre + " 1 0";
        } else {
          seg.classList.add("rg-c" + (s.rec % 4));
          if (s.cont) seg.classList.add("rg-cortaE");
          if (s.corta) seg.classList.add("rg-cortaD");
          seg.textContent = "R" + s.rec;
          seg.style.flex = s.bytes + " 1 0";
        }
        barra.append(seg);
      }
      linha.append(barra);
      area.append(linha);
    });
    const nums = app.querySelector(".rg-nums");
    nums.replaceChildren();
    const item = (rot, val, cls) => { const d = mk("div", "rg-num"); d.append(mk("strong", cls || "", String(val)), mk("span", "", rot)); return d; };
    nums.append(
      item("registros por bloco (fator de bloco)", r.fb),
      item("bytes de sobra por bloco", st.espalhada ? 0 : r.sobra, !st.espalhada && r.sobra ? "rg-ruim" : "rg-bom"),
      item("blocos usados", r.cabe || st.espalhada ? r.blocos.length : "—"),
      item("registros em 2 blocos", st.espalhada ? r.divididos : 0, st.espalhada && r.divididos ? "rg-ruim" : "rg-bom")
    );
    const msg = app.querySelector(".rg-msg");
    msg.classList.remove("rg-ok");
    if (!r.cabe && !st.espalhada) msg.textContent = "O registro é maior que o bloco: não cabe! Só a organização espalhada resolve.";
    else if (st.espalhada) msg.textContent = r.divididos ? "Espalhada: não sobra espaço, mas " + r.divididos + " registro(s) ficam em dois blocos, e ler cada um custa duas leituras." : "Espalhada: aqui nenhum registro foi dividido.";
    else msg.textContent = r.sobra ? "Não espalhada: cada registro fica inteiro em um bloco, mas sobram " + r.sobra + " bytes em cada bloco cheio." : "A divisão é exata: não sobra nada!";
  }

  const RG_INICIAL = { registro: iniciarRegistro, alinhamento: iniciarAlinhamento, rrn: iniciarRrn, blocos: iniciarBlocos };

  function iniciarWidgets(root) {
    for (const el of root.querySelectorAll(".rg:not([data-ok])")) {
      const cfg = parseJson(el.dataset.cfg || "");
      const inicia = RG_INICIAL[el.dataset.kind];
      if (!cfg || !inicia) continue;
      el.dataset.ok = "1";
      inicia(el, cfg);
    }
  }

  function acaoRg(el, alvo) {
    const cfg = parseJson(el.dataset.cfg || "");
    if (!cfg || !el.__rg) return;
    const acao = alvo.dataset.rg;
    const st = el.__rg;
    if (el.dataset.kind === "alinhamento") {
      const i = Number(alvo.dataset.i);
      if (acao === "sobe" && i > 0) [st.ordem[i - 1], st.ordem[i]] = [st.ordem[i], st.ordem[i - 1]];
      if (acao === "desce" && i < st.ordem.length - 1) [st.ordem[i + 1], st.ordem[i]] = [st.ordem[i], st.ordem[i + 1]];
      if (acao === "melhor") st.ordem = melhorOrdem(cfg.campos);
      if (acao === "zera") st.ordem = cfg.campos.map((_, k) => k);
      desenharAlinhamento(el, cfg);
      const foco = el.querySelector('[data-rg="' + acao + '"][data-i="' + (acao === "sobe" ? i - 1 : i + 1) + '"]');
      if (foco && !foco.disabled && (acao === "sobe" || acao === "desce")) foco.focus();
    } else if (el.dataset.kind === "rrn") {
      if (acao === "rrn") { st.rrn = Number(alvo.dataset.i); st.grande = false; }
      if (acao === "grande") st.grande = !st.grande;
      atualizarRrn(el, cfg);
    } else if (el.dataset.kind === "blocos") {
      if (acao === "modo") st.espalhada = alvo.dataset.v === "sim";
      atualizarBlocos(el, cfg);
    }
  }

  function entradaRg(el, alvo) {
    const cfg = parseJson(el.dataset.cfg || "");
    if (!cfg || !el.__rg) return;
    const st = el.__rg;
    const acao = alvo.dataset.rg;
    if (el.dataset.kind === "registro") {
      const i = Number(alvo.dataset.i);
      if (acao === "texto") st.valor[i] = alvo.value;
      if (acao === "tam") st.bytes[i] = Number(alvo.value);
      atualizarRegistro(el, cfg);
    } else if (el.dataset.kind === "rrn" && acao === "rrnslide") {
      st.rrn = Number(alvo.value); st.grande = false;
      atualizarRrn(el, cfg);
    } else if (el.dataset.kind === "blocos") {
      if (acao === "B") st.B = Number(alvo.value);
      if (acao === "R") st.R = Number(alvo.value);
      atualizarBlocos(el, cfg);
    }
  }

  const BLOCK_RENDERERS = { "aula-narrada": renderNarratedLesson, video: renderVideo, slides: renderSlides, demo: renderDemo, carrossel: renderCarrossel, exercicio: renderExercise, codigo: renderCodigo, roteamento: renderRoteamento, patricia: renderPatricia, registro: renderRegistro, alinhamento: renderAlinhamento, rrn: renderRrn, blocos: renderBlocosWidget };

  // Ponte para o renderizador do site: devolve o HTML do bloco, ou null se a linguagem não é nossa.
  function renderBlock(language, source, options = {}) {
    if (typeof language !== "string") return null;
    if (BLOCK_RENDERERS[language]) return BLOCK_RENDERERS[language](source, options);
    if (FENCE_CLASSES[language]) return `<pre class="${FENCE_CLASSES[language]}"><code>${escapeHtml(source)}</code></pre>`;
    return null;
  }

  // Depois da sanitização: troca cada "slot" de vídeo por um iframe, revalidando o endereço.
  function hydrateVideoEmbeds(root) {
    for (const slot of root.querySelectorAll("[data-embed-src]")) {
      const url = slot.getAttribute("data-embed-src");
      if (!isAllowedEmbed(url)) continue;
      const frame = document.createElement("iframe");
      frame.className = "video-embed";
      frame.src = url;
      frame.title = slot.getAttribute("data-embed-title") || "Vídeo explicativo";
      frame.loading = "lazy";
      frame.setAttribute("allowfullscreen", "");
      slot.replaceWith(frame);
    }
  }

  function showStep(stepper, delta) {
    const count = Number(stepper.dataset.count);
    const panels = Array.from(stepper.querySelectorAll(".stepper-panel"));
    const next = stepIndex(panels.findIndex((panel) => !panel.hidden), delta, count);
    panels.forEach((panel, i) => { panel.hidden = i !== next; });
    stepper.querySelector(".stepper-counter").textContent = `${next + 1} / ${count}`;
    stepper.querySelector('[data-stepper="prev"]').disabled = next === 0;
    stepper.querySelector('[data-stepper="next"]').disabled = next === count - 1;
    if (stepper.dataset.kind === "codigo") {
      const line = Number(panels[next].dataset.line) || 0;
      const lines = stepper.querySelectorAll(".cline");
      lines.forEach((el, i) => el.classList.toggle("on", i + 1 === line));
      // código longo: rola só a caixa do código (não a página) para a linha atual ficar visível
      const box = stepper.querySelector(".codigo-code");
      const el = lines[line - 1];
      if (box && el && (el.offsetTop < box.scrollTop + 24 || el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight - 24)) {
        box.scrollTop = Math.max(0, el.offsetTop - box.clientHeight / 2);
      }
    }
    return next;
  }

  function stopPlay(stepper) {
    if (stepper.dataset.kind === "narrada") {
      if (activeSpeech?.button.closest(".stepper") === stepper) stopNarration();
      delete stepper.dataset.finished;
      stepper.querySelector("[data-narrate]").textContent = "Ouvir aula";
    }
    if (stepper.__timer) { clearInterval(stepper.__timer); stepper.__timer = null; }
    const play = stepper.querySelector('[data-stepper="play"]');
    if (play) { play.textContent = "▶ Executar"; play.classList.remove("playing"); }
  }

  function togglePlay(stepper) {
    if (stepper.__timer) { stopPlay(stepper); return; }
    const count = Number(stepper.dataset.count);
    const panels = Array.from(stepper.querySelectorAll(".stepper-panel"));
    if (panels.findIndex((panel) => !panel.hidden) >= count - 1) showStep(stepper, -count);
    const play = stepper.querySelector('[data-stepper="play"]');
    play.textContent = "⏸ Pausar"; play.classList.add("playing");
    stepper.__timer = setInterval(() => {
      const at = showStep(stepper, 1);
      if (at >= count - 1) stopPlay(stepper);
    }, 1300);
  }

  // Botões e setas ← → dos slides e das demonstrações (escuta delegada, instalada uma única vez).
  function attachInteractions(root) {
    iniciarWidgets(root);
    if (root.__lessonInteractions) return;
    root.__lessonInteractions = true;
    root.addEventListener("input", (event) => {
      const campo = event.target.closest(".rg [data-rg]");
      if (campo) entradaRg(campo.closest(".rg"), campo);
    });
    root.addEventListener("click", (event) => {
      const rg = event.target.closest(".rg button[data-rg]");
      if (rg) { if (!rg.disabled) acaoRg(rg.closest(".rg"), rg); return; }
      const view = event.target.closest(".lesson-views [data-view]");
      if (view) {
        const lesson = view.closest(".stepper");
        lesson.dataset.view = view.dataset.view;
        for (const option of view.parentElement.querySelectorAll("button")) {
          option.setAttribute("aria-pressed", String(option === view));
        }
        return;
      }
      const narrator = event.target.closest("[data-narrate]");
      if (narrator) { narrate(narrator.closest(".stepper")); return; }
      const rt = event.target.closest(".roteamento [data-rt], .roteamento .rt-bit");
      if (rt) {
        if (rt.disabled) return;
        acaoRoteamento(rt.closest(".roteamento"), rt.classList.contains("rt-bit") ? "bit" : rt.dataset.rt, rt);
        return;
      }
      const button = event.target.closest("[data-stepper]");
      if (!button || button.disabled) return;
      const stepper = button.closest(".stepper");
      if (button.dataset.stepper === "play") { togglePlay(stepper); return; }
      stopPlay(stepper);
      showStep(stepper, button.dataset.stepper === "next" ? 1 : -1);
    });
    root.addEventListener("keydown", (event) => {
      const stepper = event.target.closest(".stepper");
      if (!stepper || event.target !== stepper) return;
      if (event.key === "ArrowRight") { event.preventDefault(); stopPlay(stepper); showStep(stepper, 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); stopPlay(stepper); showStep(stepper, -1); }
    });
  }

  function renderQuiz(source, index) {
    let quiz;
    try { quiz = JSON.parse(source); }
    catch { return '<p class="quiz-error">Este teste tem um erro de formato. Confira o bloco de teste no arquivo Markdown.</p>'; }
    if (!quiz.question || !Array.isArray(quiz.options) || quiz.options.length < 2) {
      return '<p class="quiz-error">Este teste precisa de uma pergunta e pelo menos duas alternativas.</p>';
    }
    const correctIndex = quiz.options.findIndex((option) => option.correct === true);
    if (correctIndex < 0) return '<p class="quiz-error">Marque uma alternativa como correta usando "correct": true.</p>';
    const questionId = `quiz-${index}`;
    const options = quiz.options.map((option, optionIndex) =>
      `<label for="${questionId}-option-${optionIndex}"><input id="${questionId}-option-${optionIndex}" type="radio" name="${questionId}" value="${optionIndex}"><span>${escapeHtml(option.text || "")}</span></label>`
    ).join("");
    return `<section class="knowledge-test" aria-labelledby="${questionId}-title"><h3 id="${questionId}-title">Teste de conhecimento</h3><p class="question">${escapeHtml(quiz.question)}</p><form class="quiz-form" data-correct="${correctIndex}" data-correct-feedback="${escapeHtml(quiz.correctFeedback || "Correto!")}" data-incorrect-feedback="${escapeHtml(quiz.incorrectFeedback || "Ainda não. Revise o conteúdo e tente novamente.")}"><fieldset><legend class="sr-only">Selecione uma resposta</legend>${options}</fieldset><button type="submit">Conferir resposta</button><p class="quiz-feedback" role="status" aria-live="polite"></p></form></section>`;
  }

  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");
    const html = [];
    let paragraph = [];
    let listType = "";
    let codeLines = [];
    let inCode = false;
    let codeLanguage = "";
    let quizIndex = 0;

    const flushParagraph = () => {
      if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (listType) html.push(`</${listType}>`);
      listType = "";
    };
    const renderCode = () => codeLanguage === "quiz"
      ? renderQuiz(codeLines.join("\n"), quizIndex++)
      : BLOCK_RENDERERS[codeLanguage]
      ? BLOCK_RENDERERS[codeLanguage](codeLines.join("\n"))
      : `<pre${FENCE_CLASSES[codeLanguage] ? ` class="${FENCE_CLASSES[codeLanguage]}"` : ""}><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.trim().startsWith("```")) {
        flushParagraph(); closeList();
        if (inCode) {
          html.push(renderCode());
          codeLines = [];
          codeLanguage = "";
        } else {
          codeLanguage = line.trim().slice(3).trim().split(/\s+/)[0].toLowerCase();
        }
        inCode = !inCode;
        continue;
      }
      if (inCode) { codeLines.push(line); continue; }
      if (line.includes("|") && index + 1 < lines.length && TABLE_SEPARATOR.test(lines[index + 1])
          && parseRow(line).length === parseRow(lines[index + 1]).length) {
        flushParagraph(); closeList();
        const rows = [parseRow(line)];
        index += 2;
        while (index < lines.length && lines[index].trim() && lines[index].includes("|")) rows.push(parseRow(lines[index++]));
        index--;
        html.push(renderTable(rows));
        continue;
      }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const listItem = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
      const quote = line.match(/^>\s?(.*)$/);
      if (/^\s*---+\s*$/.test(line)) { flushParagraph(); closeList(); html.push("<hr>"); continue; }
      if (!line.trim()) { flushParagraph(); closeList(); continue; }
      if (heading) {
        flushParagraph(); closeList();
        const level = heading[1].length;
        html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      } else if (listItem) {
        flushParagraph();
        const nextType = /^\d/.test(listItem[1]) ? "ol" : "ul";
        if (listType !== nextType) { closeList(); html.push(`<${nextType}>`); listType = nextType; }
        html.push(`<li>${renderInline(listItem[2])}</li>`);
      } else if (quote) {
        flushParagraph(); closeList();
        html.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      } else {
        closeList(); paragraph.push(line.trim());
      }
    }
    flushParagraph(); closeList();
    if (inCode) html.push(renderCode());
    return html.join("\n");
  }

  return { escapeHtml, renderInline, renderMarkdown, stepIndex, renderBlock, isAllowedEmbed, hydrateVideoEmbeds, attachInteractions, highlightC, calc: { calcCampo, calcStruct, melhorOrdem, calcOffset, calcBlocos } };
});
