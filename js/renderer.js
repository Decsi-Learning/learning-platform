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
    if (el.classList.contains("qt")) return mostrarQuadtree(el, n);
    if (el.classList.contains("sg")) return mostrarSegtree(el, n);
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

  // ---- Bloco "segtree": planilha com uma Segment Tree de somas; fórmulas =SOMA e edições de célula, passo a passo ----
  // { "title": "...", "coluna": "Vendas", "linhas": [{ "rotulo": "Jan", "valor": 12 }, ...],
  //   "operacoes": [{ "tipo": "soma", "de": 1, "ate": 4 }, { "tipo": "editar", "linha": 3, "valor": 11 }] }
  // "de", "ate" e "linha" contam as linhas de dados a partir de 0; na tela, a linha i aparece como a célula B(i + 2).
  const SG_LX = 76, SG_LY = 70;
  const SG_INICIO = "A Segment Tree já está montada sobre a planilha: cada nó guarda a soma de um trecho de linhas. Clique em <strong>Executar</strong> ou em <strong>Próximo passo</strong> para rodar as fórmulas e as edições.";

  function sgNos(n) {
    const nos = [];
    const visita = (no, ini, fim, d) => {
      nos.push({ no, ini, fim, d });
      if (ini === fim) return;
      const meio = Math.floor((ini + fim) / 2);
      visita(2 * no, ini, meio, d + 1);
      visita(2 * no + 1, meio + 1, fim, d + 1);
    };
    visita(1, 0, n - 1, 0);
    return nos;
  }

  function renderSegtree(source) {
    const data = parseJson(source);
    const linhas = data && Array.isArray(data.linhas) ? data.linhas : null;
    if (!linhas || linhas.length < 2 || linhas.length > 8) return blockError("Este bloco Segment Tree precisa de 2 a 8 linhas.");
    for (const l of linhas) {
      if (!l || typeof l.rotulo !== "string" || !l.rotulo.trim() || !Number.isInteger(l.valor)) return blockError("Cada linha precisa de um rótulo e de um valor inteiro.");
    }
    const n = linhas.length;
    const ops = Array.isArray(data.operacoes) ? data.operacoes : [];
    if (ops.length < 1 || ops.length > 8) return blockError("Este bloco Segment Tree precisa de 1 a 8 operações.");
    const linhaOk = (i) => Number.isInteger(i) && i >= 0 && i < n;
    for (const op of ops) {
      const ok = op && (op.tipo === "soma" ? linhaOk(op.de) && linhaOk(op.ate) && op.de <= op.ate : op.tipo === "editar" ? linhaOk(op.linha) && Number.isInteger(op.valor) : false);
      if (!ok) return blockError("Cada operação precisa ser uma soma (de, ate) ou uma edição (linha, valor) dentro da planilha.");
    }
    const title = String(data.title || "Planilha com Segment Tree");
    const coluna = String(data.coluna || "Valor");
    const nos = sgNos(n);
    const D = Math.max(...nos.map((x) => x.d));
    const W = 20 + n * SG_LX, H = 34 + D * SG_LY + 44;
    const cx = (i) => 10 + SG_LX * (i + 0.5);
    const px = (x) => (cx(x.ini) + cx(x.fim)) / 2, py = (x) => 30 + x.d * SG_LY;
    const trecho = (x) => escapeHtml(linhas[x.ini].rotulo) + (x.ini === x.fim ? "" : "–" + escapeHtml(linhas[x.fim].rotulo));
    let arestas = "", desenho = "";
    for (const x of nos) {
      if (x.no > 1) {
        const pai = nos.find((p) => p.no === Math.floor(x.no / 2));
        arestas += '<g class="rt-edge" data-no="' + x.no + '"><line x1="' + px(pai) + '" y1="' + (py(pai) + 16) + '" x2="' + px(x) + '" y2="' + (py(x) - 16) + '"></line></g>';
      }
      desenho += '<g class="rt-node sg-node' + (x.ini === x.fim ? " sg-folha" : "") + '" data-no="' + x.no + '" data-ini="' + x.ini + '" data-fim="' + x.fim + '">' +
        '<rect x="' + (px(x) - 27) + '" y="' + (py(x) - 16) + '" width="54" height="32" rx="8"></rect>' +
        '<text class="rt-name" x="' + px(x) + '" y="' + (py(x) + 5) + '">' + linhas.slice(x.ini, x.fim + 1).reduce((s, l) => s + l.valor, 0) + "</text>" +
        '<text class="rt-pref" x="' + px(x) + '" y="' + (py(x) + 29) + '">' + trecho(x) + "</text></g>";
    }
    const tabela = '<table class="rt-table sg-table"><thead><tr><th></th><th>A</th><th>B</th></tr><tr class="sg-cab"><td>1</td><td>Mês</td><td>' + escapeHtml(coluna) + "</td></tr></thead><tbody>" +
      linhas.map((l, i) => '<tr data-i="' + i + '" data-v="' + l.valor + '"><td>' + (i + 2) + "</td><td>" + escapeHtml(l.rotulo) + '</td><td class="sg-cel">' + l.valor + "</td></tr>").join("") + "</tbody></table>";
    const opsAttr = escapeHtml(JSON.stringify(ops.map((op) => (op.tipo === "soma" ? { tipo: "soma", de: op.de, ate: op.ate } : { tipo: "editar", linha: op.linha, valor: op.valor }))));
    return '<section class="roteamento sg" data-kind="segtree" data-ops="' + opsAttr + '" aria-label="' + escapeHtml(title) + '">' +
      '<p class="stepper-title">' + escapeHtml(title) + "</p>" +
      '<div class="rt-top"><div class="rt-addr"><span class="rt-lbl">Operação na planilha</span><div class="sg-formula"><span class="rt-vazio">—</span></div></div>' +
      '<div class="rt-actions"><button type="button" data-rt="play" class="rt-play" data-label="▶ Executar">▶ Executar</button><button type="button" data-rt="step">Próximo passo ›</button><button type="button" data-rt="reset">Reiniciar</button></div></div>' +
      '<div class="rt-body"><svg class="rt-tree sg-tree" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Segment Tree com as somas da planilha">' + arestas + desenho + "</svg>" +
      '<div class="rt-side">' + tabela + '<p class="rt-best">Resultado: <strong>—</strong><span class="rt-count"></span></p></div></div>' +
      '<p class="rt-msg" aria-live="polite">' + SG_INICIO + '</p><ol class="rt-log"></ol></section>';
  }

  function passosSegtree(el) {
    const rotulos = Array.from(el.querySelectorAll(".sg-table tbody tr")).map((tr) => tr.children[1].textContent);
    const cel = Array.from(el.querySelectorAll(".sg-table tbody tr")).map((tr) => Number(tr.dataset.v));
    const ops = JSON.parse(el.dataset.ops);
    const n = cel.length;
    const nos = sgNos(n);
    const porNo = new Map(nos.map((x) => [x.no, x]));
    const soma = new Map();
    const monta = (no) => { const x = porNo.get(no); const v = x.ini === x.fim ? cel[x.ini] : monta(2 * no) + monta(2 * no + 1); soma.set(no, v); return v; };
    monta(1);
    const ref = (i) => "B" + (i + 2);
    const faixa = (a, b) => (a === b ? ref(a) : ref(a) + ":" + ref(b));
    const nome = (x) => "<strong>" + escapeHtml(rotulos[x.ini]) + (x.ini === x.fim ? "" : "–" + escapeHtml(rotulos[x.fim])) + "</strong>";
    const passos = [];
    const foto = (extra) => passos.push({ soma: new Map(soma), cel: cel.slice(), ...extra });
    const total = nos.length;
    ops.forEach((op) => {
      if (op.tipo === "soma") {
        const { de: a, ate: b } = op;
        const formula = "=SOMA(" + faixa(a, b) + ")";
        const base = { formula, a, b };
        const marca = new Map();
        let acc = 0, visitados = 0;
        foto({ ...base, marca: new Map(marca), msg: "Nova fórmula: <code>" + formula + "</code>, o total de " + escapeHtml(rotulos[a]) + " a " + escapeHtml(rotulos[b]) + ". Em vez de ler as " + (b - a + 1) + " células, a planilha pergunta à árvore, começando pela raiz." });
        const consulta = (no) => {
          const x = porNo.get(no);
          visitados++;
          if (b < x.ini || x.fim < a) {
            marca.set(no, "fora");
            foto({ ...base, marca: new Map(marca), cur: no, acc, visitados, msg: "O nó " + nome(x) + " não tem nenhuma linha da fórmula: está <strong>fora</strong>. Ele é descartado inteiro, sem descer." });
            return 0;
          }
          if (a <= x.ini && x.fim <= b) {
            marca.set(no, "dentro");
            acc += soma.get(no);
            foto({ ...base, marca: new Map(marca), cur: no, acc, visitados, msg: "Todas as linhas do nó " + nome(x) + " estão na fórmula: ele está <strong>dentro</strong> e entra na conta com " + soma.get(no) + ", sem descer. Total até agora: " + acc + "." });
            return soma.get(no);
          }
          marca.set(no, "parcial");
          foto({ ...base, marca: new Map(marca), cur: no, acc, visitados, msg: "Só uma parte das linhas do nó " + nome(x) + " está na fórmula: ele é <strong>parcial</strong>, e a pergunta desce para os dois filhos." });
          return consulta(2 * no) + consulta(2 * no + 1);
        };
        const r = consulta(1);
        const usados = Array.from(marca.values()).filter((m) => m === "dentro").length;
        foto({ ...base, marca: new Map(marca), acc: r, visitados, resultado: r, msg: "<code>" + formula + "</code> = <strong>" + r + "</strong>, " + (usados === 1 ? "a soma pronta do nó vermelho" : "juntando as " + usados + " somas prontas dos nós vermelhos") + ". A árvore visitou " + visitados + " dos " + total + " nós. " +
          (visitados < b - a + 1 ? "Somando célula por célula, seriam " + (b - a + 1) + " leituras."
            : "Com só " + n + " linhas a diferença é pequena, mas com um milhão de linhas a árvore visitaria algumas dezenas de nós, em vez de ler até um milhão de células.") });
      } else {
        const { linha: i, valor } = op;
        const antes = cel[i];
        const formula = ref(i) + " ← " + valor;
        const base = { formula, edit: i };
        const caminho = new Set();
        const novos = new Set();
        foto({ ...base, caminho: new Set(caminho), novos: new Set(novos), msg: "Você digitou <strong>" + valor + "</strong> na célula " + ref(i) + " (" + escapeHtml(rotulos[i]) + "), que valia " + antes + ". Só os nós que contêm essa linha precisam ser corrigidos: o caminho da raiz até a folha." });
        let no = 1;
        for (;;) {
          const x = porNo.get(no);
          caminho.add(no);
          if (x.ini === x.fim) break;
          const meio = Math.floor((x.ini + x.fim) / 2);
          const esq = i <= meio;
          foto({ ...base, caminho: new Set(caminho), novos: new Set(novos), cur: no, msg: "O nó " + nome(x) + " contém " + escapeHtml(rotulos[i]) + ". A linha está na metade " + (esq ? "esquerda" : "direita") + ", então descemos por ali; a outra metade não muda." });
          no = esq ? 2 * no : 2 * no + 1;
        }
        cel[i] = valor;
        soma.set(no, valor);
        novos.add(no);
        foto({ ...base, caminho: new Set(caminho), novos: new Set(novos), cur: no, msg: "Na folha de " + escapeHtml(rotulos[i]) + ", o valor passa de " + antes + " para <strong>" + valor + "</strong>." });
        let mudou = 1;
        while (no > 1) {
          no = Math.floor(no / 2);
          const velho = soma.get(no);
          soma.set(no, soma.get(2 * no) + soma.get(2 * no + 1));
          novos.add(no);
          mudou++;
          foto({ ...base, caminho: new Set(caminho), novos: new Set(novos), cur: no, msg: "Subindo: o nó " + nome(porNo.get(no)) + " soma os filhos de novo, " + soma.get(2 * no) + " + " + soma.get(2 * no + 1) + " = <strong>" + soma.get(no) + "</strong> (era " + velho + ")." });
        }
        foto({ ...base, caminho: new Set(caminho), novos: new Set(novos), msg: "Edição salva: só " + mudou + " dos " + total + " nós foram recalculados. Os outros continuam certos, e qualquer fórmula <code>=SOMA</code> já usa o valor novo." });
      }
    });
    foto({ fim: true, msg: "Fim das operações. Cada fórmula e cada edição custou O(log n) passos na árvore, em vez de percorrer as linhas da planilha." });
    return passos;
  }

  function mostrarSegtree(el, n) {
    const passos = el.__rtPassos || (el.__rtPassos = passosSegtree(el));
    const k = Math.min(n, passos.length - 1);
    el.__rtPasso = k;
    const passo = k >= 0 ? passos[k] : null;
    if (!el.__sgInicial) {
      const cel = Array.from(el.querySelectorAll(".sg-table tbody tr")).map((tr) => Number(tr.dataset.v));
      const soma = new Map();
      el.querySelectorAll(".sg-node").forEach((g) => {
        let v = 0;
        for (let i = Number(g.dataset.ini); i <= Number(g.dataset.fim); i++) v += cel[i];
        soma.set(Number(g.dataset.no), v);
      });
      el.__sgInicial = { soma, cel };
    }
    const estado = passo || el.__sgInicial;
    const marca = (passo && passo.marca) || new Map();
    const caminho = (passo && passo.caminho) || new Set();
    const novos = (passo && passo.novos) || new Set();
    el.querySelectorAll(".sg-node").forEach((g) => {
      const no = Number(g.dataset.no);
      g.querySelector(".rt-name").textContent = String(estado.soma.get(no));
      const m = marca.get(no);
      g.classList.toggle("rt-on", m === "parcial" || caminho.has(no));
      g.classList.toggle("rt-cur", !!passo && passo.cur === no);
      g.classList.toggle("sg-dentro", m === "dentro");
      g.classList.toggle("sg-fora", m === "fora");
      g.classList.toggle("rt-new", novos.has(no));
    });
    el.querySelectorAll(".sg-tree .rt-edge").forEach((e) => {
      const no = Number(e.dataset.no);
      const pai = Math.floor(no / 2);
      const noCaminho = (x) => marca.has(x) || caminho.has(x);
      e.classList.toggle("rt-on", noCaminho(no) && noCaminho(pai) && marca.get(no) !== "fora");
    });
    el.querySelectorAll(".sg-table tbody tr").forEach((tr, i) => {
      tr.querySelector(".sg-cel").textContent = String(estado.cel[i]);
      tr.classList.toggle("rt-match", !!passo && passo.a !== undefined && i >= passo.a && i <= passo.b);
      tr.classList.toggle("rt-win", !!passo && passo.edit === i);
    });
    el.querySelector(".sg-formula").innerHTML = passo && passo.formula ? "<code>" + escapeHtml(passo.formula) + "</code>" : '<span class="rt-vazio">—</span>';
    el.querySelector(".rt-best strong").textContent = passo && passo.acc !== undefined ? String(passo.acc) : "—";
    el.querySelector(".rt-count").textContent = passo && passo.visitados ? " · nós visitados: " + passo.visitados : "";
    el.querySelector(".rt-msg").innerHTML = passo ? passo.msg : SG_INICIO;
    el.querySelector(".rt-log").innerHTML = passos.slice(0, Math.max(k, 0)).map((p) => "<li>" + p.msg + "</li>").join("");
    el.classList.toggle("rt-fim", !!passo && !!passo.fim);
    el.querySelector('[data-rt="step"]').disabled = !!passo && !!passo.fim;
    return !!passo && !!passo.fim;
  }

  // ---- Bloco "pratica": questões interativas sobre as árvores (o aluno clica em nós, letras ou bits) ----
  // { "tipo": "segtree", "vetor": [2, 5, 1, 4, 9, 3], "consulta": { "de": 1, "ate": 4 }, "edicao": { "pos": 2, "valor": 6 } }
  // { "tipo": "trie", "palavras": ["sol", "solo", "sal"], "busca": "so" }
  // { "tipo": "radix", "operacoes": [{ "inserir": "romano" }, { "inserir": "romance" }, { "remover": "romance" }] }
  // { "tipo": "patricia", "bits": 5, "pares": [[{ "nome": "H", "bits": "01000" }, { "nome": "J", "bits": "01010" }]],
  //   "chaves": [{ "nome": "B", "bits": "00010" }, ...], "procurada": { "nome": "G", "bits": "00111" } }
  // O bloco só fica "feito" (data-feito="true") depois que todas as etapas forem respondidas; a página usa isso para liberar o avanço.
  const PX_TIPOS = { segtree: "Segment Tree", trie: "Trie", radix: "árvore Radix", patricia: "árvore Patricia", quadtree: "QuadTree" };
  const PALAVRA = /^[a-z]{1,10}$/;

  function validaPratica(d) {
    if (!d || !PX_TIPOS[d.tipo]) return "Escolha um tipo de prática: segtree, trie, radix, patricia ou quadtree.";
    if (d.tipo === "segtree") {
      const v = d.vetor;
      if (!Array.isArray(v) || v.length < 2 || v.length > 8 || !v.every(Number.isInteger)) return "O vetor precisa ter de 2 a 8 inteiros.";
      const ok = (i) => Number.isInteger(i) && i >= 0 && i < v.length;
      if (!d.consulta || !ok(d.consulta.de) || !ok(d.consulta.ate) || d.consulta.de > d.consulta.ate) return "A consulta precisa de \"de\" e \"ate\" dentro do vetor.";
      if (!d.edicao || !ok(d.edicao.pos) || !Number.isInteger(d.edicao.valor) || d.edicao.valor === v[d.edicao.pos]) return "A edição precisa de uma posição do vetor e de um valor novo.";
    }
    if (d.tipo === "trie") {
      if (!Array.isArray(d.palavras) || d.palavras.length < 1 || d.palavras.length > 5 || !d.palavras.every((p) => PALAVRA.test(p))) return "Use de 1 a 5 palavras com letras minúsculas de a a z.";
      if (!PALAVRA.test(d.busca || "")) return "A busca precisa ser uma palavra com letras minúsculas.";
    }
    if (d.tipo === "radix") {
      if (!Array.isArray(d.operacoes) || d.operacoes.length < 2 || d.operacoes.length > 8) return "Use de 2 a 8 operações.";
      const guardadas = new Set();
      for (const op of d.operacoes) {
        const p = op && (op.inserir || op.remover);
        if (!PALAVRA.test(p || "")) return "Cada operação precisa inserir ou remover uma palavra com letras minúsculas.";
        if (op.inserir) { if (guardadas.has(p)) return "A palavra \"" + p + "\" já foi inserida."; guardadas.add(p); }
        else if (!guardadas.delete(p)) return "Só dá para remover uma palavra que está na árvore: \"" + p + "\".";
      }
    }
    if (d.tipo === "quadtree") {
      const erro = validaQuadtree({ lado: d.lado, pontos: d.pontos, consultas: d.consulta ? [d.consulta] : [] });
      if (erro) return erro;
      const n = d.novo;
      if (!n || typeof n.nome !== "string" || !n.nome.trim() || !Number.isInteger(n.x) || !Number.isInteger(n.y) || n.x < 0 || n.y < 0 || n.x >= d.lado || n.y >= d.lado) return "O ponto novo precisa de um nome e de x e y dentro do plano.";
      if (d.pontos.some((p) => p.x === n.x && p.y === n.y)) return "O ponto novo não pode repetir as coordenadas de outro.";
      if (!d.consulta) return "A prática precisa de uma consulta (x0, y0, x1, y1).";
    }
    if (d.tipo === "patricia") {
      const nb = d.bits;
      const chave = (c) => c && typeof c.nome === "string" && c.nome.trim() && typeof c.bits === "string" && BINARIO.test(c.bits) && c.bits.length === nb;
      if (!Number.isInteger(nb) || nb < 2 || nb > 8) return "Use chaves de 2 a 8 bits.";
      if (!Array.isArray(d.pares) || !d.pares.every((p) => Array.isArray(p) && p.length === 2 && chave(p[0]) && chave(p[1]) && p[0].bits !== p[1].bits)) return "Cada par precisa de duas chaves diferentes com " + nb + " bits.";
      if (!Array.isArray(d.chaves) || d.chaves.length < 2 || d.chaves.length > 8 || !d.chaves.every(chave)) return "A árvore precisa de 2 a 8 chaves com " + nb + " bits.";
      if (new Set(d.chaves.map((c) => c.bits)).size !== d.chaves.length) return "As chaves da árvore precisam ser diferentes.";
      if (!chave(d.procurada) || d.chaves.some((c) => c.bits === d.procurada.bits)) return "A chave procurada precisa ter " + nb + " bits e não estar na árvore.";
    }
    return null;
  }

  function renderPratica(source) {
    const data = parseJson(source);
    const erro = validaPratica(data);
    if (erro) return blockError("Prática: " + erro);
    const title = String(data.title || "Pratique: " + PX_TIPOS[data.tipo]);
    return '<section class="roteamento px" data-kind="pratica" data-tipo="' + data.tipo + '" data-cfg="' + escapeHtml(JSON.stringify(data)) + '" aria-label="' + escapeHtml(title) + '">' +
      '<p class="stepper-title">' + escapeHtml(title) + '</p><p class="px-cont">Questão interativa</p>' +
      '<div class="px-fig"></div><p class="px-texto">Carregando a questão…</p><div class="px-area"></div>' +
      '<p class="px-msg" aria-live="polite"></p><div class="rt-actions px-acoes"></div></section>';
  }

  // Desenho genérico de árvore (Trie e Radix): folhas em colunas, pai no meio dos filhos.
  // nó: { id, rotulo, fim, filhos: [] }; opt.cls(nó) devolve as classes extras; opt.clicavel(nó) liga o clique.
  function desenhaArv(raiz, opt) {
    const LX = opt.lx || 62, LY = 64;
    const pos = new Map();
    let folhas = 0, prof = 0;
    const mede = (n, d) => {
      prof = Math.max(prof, d);
      if (!n.filhos.length) { pos.set(n, [folhas++ * LX, d]); return; }
      n.filhos.forEach((f) => mede(f, d + 1));
      pos.set(n, [(pos.get(n.filhos[0])[0] + pos.get(n.filhos[n.filhos.length - 1])[0]) / 2, d]);
    };
    mede(raiz, 0);
    const W = Math.max(320, folhas * LX + 60), off = (W - (folhas - 1) * LX) / 2;
    const X = (n) => off + pos.get(n)[0], Y = (n) => 30 + pos.get(n)[1] * LY;
    const larg = (n) => (opt.retangulo ? Math.max(36, 11 * (n.rotulo || "raiz").length + 20) : 34);
    let arestas = "", nos = "";
    const visita = (n) => {
      for (const f of n.filhos) {
        arestas += '<g class="rt-edge' + (opt.arestaOn && opt.arestaOn(f) ? " rt-on" : "") + '"><line x1="' + X(n) + '" y1="' + (Y(n) + 17) + '" x2="' + X(f) + '" y2="' + (Y(f) - 17) + '"></line></g>';
        visita(f);
      }
      const raizNo = n === raiz;
      const cls = "rt-node" + (raizNo ? " px-raiz" : "") + (n.fim ? " rt-has" : "") + (opt.cls ? opt.cls(n) : "") + (!raizNo && opt.clicavel && opt.clicavel(n) ? " px-alvo" : "");
      const forma = opt.retangulo
        ? '<rect x="' + (X(n) - larg(n) / 2) + '" y="' + (Y(n) - 17) + '" width="' + larg(n) + '" height="34" rx="10"></rect>'
        : '<circle cx="' + X(n) + '" cy="' + Y(n) + '" r="17"></circle>';
      nos += '<g class="' + cls + '"' + (!raizNo && opt.clicavel && opt.clicavel(n) ? ' data-px-no="' + escapeHtml(String(n.id)) + '" tabindex="0" role="button" aria-label="nó ' + escapeHtml(n.rotulo) + '"' : "") + ">" + forma +
        '<text class="rt-name" x="' + X(n) + '" y="' + (Y(n) + 5) + '">' + escapeHtml(raizNo ? "raiz" : n.rotulo) + "</text>" +
        (opt.sub && opt.sub(n) ? '<text class="rt-pref" x="' + X(n) + '" y="' + (Y(n) + 30) + '">' + escapeHtml(opt.sub(n)) + "</text>" : "") + "</g>";
    };
    visita(raiz);
    return '<svg class="rt-tree" viewBox="0 0 ' + W + " " + (30 + prof * LY + 40) + '" role="img" aria-label="' + escapeHtml(opt.rotulo || "árvore") + '">' + arestas + nos + "</svg>";
  }

  function svgSegtree(n, valores, cls) {
    const nos = sgNos(n);
    const D = Math.max(...nos.map((x) => x.d));
    const W = 20 + n * SG_LX, H = 34 + D * SG_LY + 44;
    const cx = (i) => 10 + SG_LX * (i + 0.5);
    const px = (x) => (cx(x.ini) + cx(x.fim)) / 2, py = (x) => 30 + x.d * SG_LY;
    let arestas = "", desenho = "";
    for (const x of nos) {
      if (x.no > 1) {
        const pai = nos.find((p) => p.no === Math.floor(x.no / 2));
        arestas += '<g class="rt-edge"><line x1="' + px(pai) + '" y1="' + (py(pai) + 16) + '" x2="' + px(x) + '" y2="' + (py(x) - 16) + '"></line></g>';
      }
      const extra = cls(x.no);
      desenho += '<g class="rt-node sg-node' + (x.ini === x.fim ? " sg-folha" : "") + extra + '"' + (extra.includes("px-alvo") ? ' data-px-no="' + x.no + '" tabindex="0" role="button" aria-label="nó que cobre v[' + x.ini + (x.ini === x.fim ? "" : ".." + x.fim) + ']"' : "") + ">" +
        '<rect x="' + (px(x) - 27) + '" y="' + (py(x) - 16) + '" width="54" height="32" rx="8"></rect>' +
        '<text class="rt-name" x="' + px(x) + '" y="' + (py(x) + 5) + '">' + valores.get(x.no) + "</text>" +
        '<text class="rt-pref" x="' + px(x) + '" y="' + (py(x) + 29) + '">v[' + x.ini + (x.ini === x.fim ? "" : ".." + x.fim) + "]</text></g>";
    }
    return '<svg class="rt-tree" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Segment Tree">' + arestas + desenho + "</svg>";
  }

  const lista = (xs) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " e " + xs[xs.length - 1]);
  const cod = (t) => "<code>" + escapeHtml(t) + "</code>";

  // Cada etapa: { tipo: "nos" | "escolha" | "letra" | "bit", texto, figura(st), depois, ... }
  function etapasSegtree(cfg) {
    const v = cfg.vetor.slice(), n = v.length;
    const nos = sgNos(n), porNo = new Map(nos.map((x) => [x.no, x]));
    const somas = (vals) => { const s = new Map(); const m = (no) => { const x = porNo.get(no); const r = x.ini === x.fim ? vals[x.ini] : m(2 * no) + m(2 * no + 1); s.set(no, r); return r; }; m(1); return s; };
    const fat = (x) => "v[" + x.ini + (x.ini === x.fim ? "" : ".." + x.fim) + "]";
    const { de: a, ate: b } = cfg.consulta;
    const dentro = [];
    const dec = (no) => { const x = porNo.get(no); if (b < x.ini || x.fim < a) return; if (a <= x.ini && x.fim <= b) { dentro.push(no); return; } dec(2 * no); dec(2 * no + 1); };
    dec(1);
    const s0 = somas(v);
    const { pos, valor } = cfg.edicao;
    const v1 = v.slice(); v1[pos] = valor;
    const s1 = somas(v1);
    const caminho = nos.filter((x) => x.ini <= pos && pos <= x.fim).map((x) => x.no);
    const marca = (st, certo, clsOk) => (no) => {
      const sel = st.sel.has(no), ok = certo.has(no);
      if (!st.resolvida) return (sel ? " px-sel" : "") + " px-alvo";
      return ok ? clsOk : sel ? " px-errado" : "";
    };
    const certo1 = new Set(dentro), certo2 = new Set(caminho);
    const intervalo = "v[" + a + (a === b ? "" : ".." + b) + "]";
    return [
      {
        tipo: "nos", correta: certo1,
        texto: "Para v = {" + v.join(", ") + "}: <strong>quais nós você usaria para somar " + cod(intervalo) + "</strong> com o menor número de nós? Clique neles (clique de novo para desmarcar) e depois em <strong>Verificar</strong>.",
        figura: (st) => svgSegtree(n, s0, marca(st, certo1, " sg-dentro")),
        checar(sel) {
          const conta = new Array(n).fill(0);
          for (const no of sel) for (let i = porNo.get(no).ini; i <= porNo.get(no).fim; i++) conta[i]++;
          const fora = [...sel].map((no) => porNo.get(no)).find((x) => x.ini < a || x.fim > b);
          if (fora) return "O nó " + cod(fat(fora)) + " tem posições fora de " + cod(intervalo) + ": a soma dele traria valores que não foram pedidos.";
          if (conta.some((c) => c > 1)) return "Alguma posição seria somada duas vezes: um dos nós escolhidos já está dentro de outro.";
          const falta = []; for (let i = a; i <= b; i++) if (!conta[i]) falta.push("v[" + i + "]");
          if (falta.length) return "Ainda faltam posições: " + lista(falta) + ".";
          return "Esses nós cobrem " + cod(intervalo) + " certinho, mas dá para usar menos: quando dois irmãos estão escolhidos, o pai deles já guarda a soma dos dois.";
        },
        depois: "Os nós " + lista(dentro.map((no) => cod(fat(porNo.get(no))))) + " cobrem exatamente " + cod(intervalo) + ", sem sobrar nem repetir posição: " + dentro.map((no) => s0.get(no)).join(" + ") + " = <strong>" + dentro.reduce((t, no) => t + s0.get(no), 0) + "</strong>. São os nós que a consulta encontra no caso <strong>dentro</strong>.",
      },
      {
        tipo: "nos", correta: certo2,
        texto: "Agora " + cod("v[" + pos + "]") + " muda de " + v[pos] + " para " + valor + ". <strong>Quais nós precisam ser atualizados?</strong> Clique neles e depois em <strong>Verificar</strong>.",
        figura: (st) => svgSegtree(n, st.resolvida ? s1 : s0, marca(st, certo2, " rt-new")),
        checar(sel) {
          const extra = [...sel].map((no) => porNo.get(no)).find((x) => !certo2.has(x.no));
          if (extra) return "O nó " + cod(fat(extra)) + " não contém a posição " + pos + ": a soma dele continua a mesma.";
          return "Ainda falta nó: todo nó cujo trecho contém a posição " + pos + " soma o valor que mudou.";
        },
        depois: "Só " + caminho.length + " nós mudam, o caminho da folha de " + cod("v[" + pos + "]") + " até a raiz: " + lista(caminho.slice().reverse().map((no) => cod(fat(porNo.get(no))) + " (" + s0.get(no) + " → " + s1.get(no) + ")")) + ". Os outros " + (nos.length - caminho.length) + " continuam certos.",
      },
    ];
  }

  // Trie: nós identificados pelo prefixo; a raiz é "".
  function trieArvore(existe, fim) {
    const mk = (p) => ({ id: p, rotulo: p.slice(-1), fim: fim.has(p), filhos: [] });
    const raiz = mk(""), por = new Map([["", raiz]]);
    [...existe].sort((x, y) => x.length - y.length || x.localeCompare(y)).forEach((p) => { if (!p) return; const n = mk(p); por.set(p, n); por.get(p.slice(0, -1)).filhos.push(n); });
    return raiz;
  }

  function etapasTrie(cfg) {
    const existe = new Set([""]), fim = new Set();
    const etapas = [];
    for (const w of cfg.palavras) {
      const antes = new Set(existe), fimAntes = new Set(fim);
      const prefixos = Array.from(w, (_, i) => w.slice(0, i + 1));
      const reuso = prefixos.filter((p) => antes.has(p)), novos = prefixos.filter((p) => !antes.has(p));
      prefixos.forEach((p) => existe.add(p)); fim.add(w);
      const depoisE = new Set(existe), depoisF = new Set(fim);
      const certo = new Set(reuso);
      const jaEra = fimAntes.has(w);
      etapas.push({
        tipo: "nos", correta: certo, nenhum: true,
        texto: "Vamos inserir " + cod(w) + ". <strong>Quais nós do caminho já existem e serão reaproveitados?</strong> Clique neles e depois em <strong>Verificar</strong>. Se nenhum for reaproveitado, clique em <strong>Nenhum nó</strong>.",
        figura: (st) => st.resolvida
          ? desenhaArv(trieArvore(depoisE, depoisF), { cls: (n) => (certo.has(n.id) ? " rt-on" : "") + (novos.includes(n.id) ? " rt-new" : ""), arestaOn: (n) => prefixos.includes(n.id), rotulo: "Trie depois da inserção" })
          : desenhaArv(trieArvore(antes, fimAntes), { cls: (n) => (st.sel.has(n.id) ? " px-sel" : ""), clicavel: () => true, rotulo: "Trie antes da inserção" }),
        checar(sel) {
          const fora = [...sel].find((p) => !certo.has(p));
          if (fora) return "O nó " + cod(fora.slice(-1)) + " (prefixo " + cod(fora) + ") não está no caminho de " + cod(w) + ": " + cod(w) + " não começa com " + cod(fora) + ".";
          return "Falta nó: o caminho de " + cod(w) + " passa pelos nós dos prefixos " + lista(reuso.map((p) => cod(p))) + ", que já existem.";
        },
        depois: (reuso.length ? "Reaproveitamos " + (reuso.length === 1 ? "o nó do prefixo " : "os nós dos prefixos ") + lista(reuso.map((p) => cod(p))) + ". " : "Nenhum nó existia no caminho. ") +
          (novos.length ? "Criamos " + (novos.length === 1 ? "o nó " : "os nós ") + lista(novos.map((p) => cod(p.slice(-1)))) + " (contorno azul)" : "Nenhum nó foi criado") +
          (jaEra ? ", e " + cod(w) + " já era palavra." : ", e o último nó passa a marcar o fim de " + cod(w) + "."),
      });
    }
    const q = cfg.busca;
    const resp = !existe.has(q) ? 2 : fim.has(q) ? 0 : 1;
    const caminhoQ = Array.from(q, (_, i) => q.slice(0, i + 1)).filter((p) => existe.has(p));
    etapas.push({
      tipo: "escolha",
      texto: "Na Trie que você montou, " + cod(q) + " é uma palavra guardada ou só um prefixo?",
      opcoes: [
        { t: "É uma palavra guardada", ok: resp === 0, por: "O caminho existe, mas olhe a marca do último nó: ele é fim de palavra?" },
        { t: "É só um prefixo de outras palavras", ok: resp === 1, por: resp === 0 ? "O último nó do caminho está marcado como fim de palavra." : "Siga as letras a partir da raiz: o caminho existe inteiro?" },
        { t: "Não aparece na Trie", ok: resp === 2, por: "Siga as letras a partir da raiz: o caminho existe inteiro." },
      ],
      figura: (st) => desenhaArv(trieArvore(existe, fim), { cls: (n) => (st.resolvida && caminhoQ.includes(n.id) ? (n.id === q && resp === 0 ? " rt-win" : " rt-on") : ""), arestaOn: (n) => st.resolvida && caminhoQ.includes(n.id), rotulo: "Trie com as palavras inseridas" }),
      depois: resp === 0 ? "O caminho " + cod(q) + " existe e o último nó é fim de palavra: " + cod(q) + " está guardada."
        : resp === 1 ? "O caminho " + cod(q) + " existe (em destaque), mas o último nó <strong>não</strong> é fim de palavra. Por isso " + cod(q) + " é só um prefixo: a busca exata devolve false, e a busca por prefixo devolve true."
        : "O caminho " + cod(q) + " não existe inteiro na Trie: nenhuma palavra começa com ele.",
    });
    return etapas;
  }

  // Radix: nós { id, rotulo, fim, filhos }; os filhos ficam em ordem alfabética.
  function etapasRadix(cfg) {
    let seq = 0;
    const raiz = { id: seq++, rotulo: "", fim: false, filhos: [] };
    const clone = (n) => ({ ...n, filhos: n.filhos.map(clone) });
    const ordena = (n) => n.filhos.sort((x, y) => x.rotulo.localeCompare(y.rotulo));
    const comum = (x, y) => { let k = 0; while (k < x.length && x[k] === y[k]) k++; return k; };
    const opt = (extra) => ({ retangulo: true, rotulo: "árvore Radix", ...extra });
    const etapas = [];
    const naoDivide = (w, depoisTxt, antes, depois, novos) => etapas.push({
      tipo: "escolha", texto: "Vamos inserir " + cod(w) + ". <strong>Algum nó precisa ser dividido?</strong>",
      opcoes: [{ t: "Sim, um rótulo precisa ser dividido", ok: false, por: "Compare " + cod(w) + " com os rótulos do caminho: algum deles coincide só pela metade?" }, { t: "Não, nenhum rótulo é cortado", ok: true }],
      figura: (st) => desenhaArv(st.resolvida ? depois : antes, opt({ cls: (n) => (st.resolvida && novos.includes(n.id) ? " rt-new" : "") })),
      depois: depoisTxt,
    });
    for (const op of cfg.operacoes) {
      if (op.inserir) {
        const w = op.inserir;
        const antes = clone(raiz);
        let at = raiz, ch = w, divisao = null;
        const novos = [];
        while (ch) {
          const f = at.filhos.find((x) => x.rotulo[0] === ch[0]);
          if (!f) { const nf = { id: seq++, rotulo: ch, fim: true, filhos: [] }; at.filhos.push(nf); ordena(at); novos.push(nf.id); ch = ""; at = null; break; }
          const k = comum(f.rotulo, ch);
          if (k < f.rotulo.length) {
            divisao = { id: f.id, rotulo: f.rotulo, k, resto: ch };
            const meio = { id: seq++, rotulo: f.rotulo.slice(0, k), fim: false, filhos: [f] };
            f.rotulo = f.rotulo.slice(k);
            at.filhos[at.filhos.indexOf(f)] = meio; ordena(at);
            novos.push(meio.id);
            at = meio; ch = ch.slice(k);
            if (ch) { const nf = { id: seq++, rotulo: ch, fim: true, filhos: [] }; meio.filhos.push(nf); ordena(meio); novos.push(nf.id); ch = ""; at = null; }
            break;
          }
          at = f; ch = ch.slice(k);
        }
        if (at) at.fim = true;
        const depois = clone(raiz);
        if (divisao) {
          const { rotulo: r, k, resto } = divisao;
          etapas.push({
            tipo: "letra", letras: Array.from(r), correta: k - 1,
            texto: "Vamos inserir " + cod(w) + ". Ela começa igual ao rótulo " + cod(r) + " (em destaque), mas não por inteiro. <strong>Depois de qual letra esse rótulo deve ser dividido?</strong> Clique na última letra que " + cod(w) + " tem em comum com ele.",
            figura: (st) => (st.resolvida
              ? desenhaArv(depois, opt({ cls: (n) => (novos.includes(n.id) ? " rt-new" : "") }))
              : desenhaArv(antes, opt({ cls: (n) => (n.id === divisao.id ? " rt-on" : "") }))),
            checar(i) {
              if (i < k - 1) return "Depois de " + cod(r.slice(0, i + 1)) + " as letras ainda são iguais: " + cod(w) + " também continua com '" + r[i + 1] + "'. Dá para dividir mais adiante.";
              return "Na letra '" + r[k] + "' o rótulo e a palavra já são diferentes (" + (resto.length > k ? "a palavra tem '" + resto[k] + "'" : "a palavra acaba antes") + "). A divisão precisa vir antes dela.";
            },
            depois: "O nó vira " + cod(r.slice(0, k)) + ", o prefixo comum, " + (resto.length > k
              ? "com os filhos " + cod(r.slice(k)) + " e " + cod(resto.slice(k)) + " (contorno azul nos nós novos)."
              : "agora fim de palavra, com o filho " + cod(r.slice(k)) + ".") + " As palavras que já estavam na árvore continuam com o mesmo caminho.",
          });
        } else if (novos.length && etapas.length) {
          naoDivide(w, "Nenhum rótulo do caminho começa com a letra que falta, então " + cod(w) + " ganha uma folha nova com o resto da chave de uma vez.", antes, depois, novos);
        } else if (!novos.length) {
          naoDivide(w, cod(w) + " termina exatamente no fim de um nó que já existe: basta marcá-lo como fim de palavra (contorno vermelho).", antes, depois, []);
        }
      } else {
        const w = op.remover;
        const antes = clone(raiz);
        const pais = [raiz];
        let at = raiz, ch = w;
        while (ch) { const f = at.filhos.find((x) => x.rotulo[0] === ch[0]); ch = ch.slice(f.rotulo.length); at = f; pais.push(f); }
        at.fim = false;
        let cand = at, liberou = false;
        if (!at.filhos.length) { const pai = pais[pais.length - 2]; pai.filhos.splice(pai.filhos.indexOf(at), 1); cand = pai; liberou = true; }
        const meio = clone(raiz);
        const umFilho = cand.filhos.length === 1, pode = cand !== raiz && umFilho && !cand.fim;
        const filhoRot = umFilho ? cand.filhos[0].rotulo : "";
        const candRot = cand.rotulo;
        const candPalavra = liberou ? w.slice(0, w.length - at.rotulo.length) : w;
        if (pode) { const f = cand.filhos[0]; cand.rotulo += f.rotulo; cand.fim = f.fim; cand.filhos = f.filhos; }
        const depois = clone(raiz);
        const candId = cand.id;
        const inicio = "Removemos " + cod(w) + (liberou ? ": a folha dela foi liberada" : ": o nó dela deixou de ser fim de palavra") + ". ";
        if (cand === raiz) continue;
        etapas.push({
          tipo: "escolha",
          texto: inicio + (umFilho
            ? "Agora o nó " + cod(candRot) + " (em destaque) tem um único filho, " + cod(filhoRot) + ". <strong>Os dois rótulos podem ser fundidos num nó só?</strong>"
            : "O nó " + cod(candRot) + " (em destaque) tem " + cand.filhos.length + " filhos. <strong>Ele precisa ser fundido com algum filho?</strong>"),
          opcoes: umFilho
            ? [{ t: "Sim, viram " + candRot + filhoRot, ok: pode, por: "Olhe a marca do nó " + candRot + ": se ele for fim de palavra, a palavra que termina nele sumiria na fusão." },
               { t: "Não, eles continuam separados", ok: !pode, por: "O nó " + candRot + " não é fim de palavra e tem um filho só: ele não separa palavra nenhuma." }]
            : [{ t: "Sim", ok: false, por: "Ele ainda tem mais de um filho: continua sendo um ponto onde as palavras se separam." }, { t: "Não", ok: true }],
          figura: (st) => desenhaArv(st.resolvida ? depois : meio, opt({ cls: (n) => (n.id === candId ? (st.resolvida && pode ? " rt-new" : " rt-on") : "") })),
          depois: pode
            ? "Sim: " + cod(candRot) + " não é fim de palavra e ficou com um filho só, então os dois viram " + cod(candRot + filhoRot) + ". A fusão é o inverso da divisão."
            : umFilho
              ? "Não: o nó " + cod(candRot) + " marca o fim da palavra " + cod(candPalavra) + ", que continua guardada. Se ele fosse fundido com " + cod(filhoRot) + ", " + cod(candPalavra) + " se perderia."
              : "Não: com " + cand.filhos.length + " filhos, o nó ainda é uma bifurcação, e a árvore continua compacta.",
        });
      }
    }
    return etapas;
  }

  function patriciaInsere(raiz, c, nb, novoId) {
    const bit = (i, b) => Number(b[i - 1]);
    if (!raiz) return { t: "e", id: novoId(), chave: c };
    let p = raiz;
    while (p.t === "i") p = bit(p.idx, c.bits) ? p.dir : p.esq;
    let i = 1;
    while (i <= nb && bit(i, c.bits) === bit(i, p.chave.bits)) i++;
    if (i > nb) return raiz;
    let pai = null, lado = null, t = raiz;
    while (t.t === "i" && t.idx < i) { pai = t; lado = bit(t.idx, c.bits) ? "dir" : "esq"; t = t[lado]; }
    const folha = { t: "e", id: novoId(), chave: c };
    const novo = { t: "i", id: novoId(), idx: i, esq: bit(i, c.bits) ? t : folha, dir: bit(i, c.bits) ? folha : t };
    if (pai === null) return novo;
    pai[lado] = novo;
    return raiz;
  }

  function etapasPatricia(cfg) {
    const nb = cfg.bits, bit = (i, b) => Number(b[i - 1]);
    const primeiroDif = (x, y) => { let i = 1; while (x[i - 1] === y[i - 1]) i++; return i; };
    const etapas = cfg.pares.map(([a, b]) => {
      const d = primeiroDif(a.bits, b.bits);
      return {
        tipo: "bit", chaves: [a, b], correta: d,
        texto: "<strong>Qual é o primeiro bit em que " + escapeHtml(a.nome) + " e " + escapeHtml(b.nome) + " diferem?</strong> Clique nele, na linha de cima. Os bits são numerados de 1 a " + nb + ", da esquerda para a direita.",
        checar(i) {
          if (a.bits[i - 1] === b.bits[i - 1]) return "No bit " + i + " as duas chaves valem " + a.bits[i - 1] + ": ele não separa " + escapeHtml(a.nome) + " de " + escapeHtml(b.nome) + ".";
          return "O bit " + i + " é diferente, mas não é o primeiro: compare os bits anteriores a ele, da esquerda para a direita.";
        },
        depois: "O primeiro bit diferente é o <strong>bit " + d + "</strong> (" + escapeHtml(a.nome) + " tem " + a.bits[d - 1] + " e " + escapeHtml(b.nome) + " tem " + b.bits[d - 1] + "). Na inserção, é esse bit que o novo nó interno testa.",
      };
    });
    let seq = 0;
    let raiz = null;
    for (const c of cfg.chaves) raiz = patriciaInsere(raiz, c, nb, () => "n" + seq++);
    const ordem = cfg.chaves.map((c) => c.bits).sort();
    let altura = 0;
    const alt = (r, d) => { altura = Math.max(altura, d); if (r.t === "i") { alt(r.esq, d + 1); alt(r.dir, d + 1); } };
    alt(raiz, 0);
    const g = cfg.procurada;
    const caminho = [];
    let p = raiz;
    const svg = (passo) => { const dz = desenhaPatricia(raiz, passo, ordem, altura); return '<svg class="rt-tree pt-tree" viewBox="' + dz.box + '" role="img" aria-label="Árvore Patricia">' + dz.svg + "</svg>"; };
    const nomes = lista(cfg.chaves.map((c) => escapeHtml(c.nome) + " = " + c.bits));
    while (p.t === "i") {
      caminho.push(p.id);
      const no = p, ate = caminho.slice(), b = bit(no.idx, g.bits);
      etapas.push({
        tipo: "escolha",
        texto: (caminho.length === 1 ? "A árvore guarda " + nomes + ". Vamos pesquisar " + escapeHtml(g.nome) + " = " + cod(g.bits) + ", que <strong>não</strong> está nela. " : "") +
          "O nó em destaque testa o <strong>bit " + no.idx + "</strong>. <strong>Para que lado a pesquisa por " + escapeHtml(g.nome) + " = " + cod(g.bits) + " segue?</strong>",
        opcoes: [{ t: "Esquerda (o bit vale 0)", ok: b === 0, por: "Conte os bits de " + g.bits + " a partir da esquerda, começando em 1: quanto vale o bit " + no.idx + "?" },
                 { t: "Direita (o bit vale 1)", ok: b === 1, por: "Conte os bits de " + g.bits + " a partir da esquerda, começando em 1: quanto vale o bit " + no.idx + "?" }],
        figura: () => svg({ caminho: ate, atual: no.id }),
        depois: "O bit " + no.idx + " de " + cod(g.bits) + " vale " + b + ": a pesquisa segue para a " + (b ? "direita" : "esquerda") + ".",
      });
      p = b ? no.dir : no.esq;
    }
    caminho.push(p.id);
    const folha = p.chave;
    const testados = new Set();
    let q = raiz; while (q.t === "i") { testados.add(q.idx); q = bit(q.idx, g.bits) ? q.dir : q.esq; }
    const difs = []; for (let i = 1; i <= nb; i++) if (g.bits[i - 1] !== folha.bits[i - 1]) difs.push(i);
    etapas.push({
      tipo: "escolha", chavesDepois: [g, folha], difs,
      texto: "A pesquisa chegou à folha " + escapeHtml(folha.nome) + " = " + cod(folha.bits) + ". Os bits testados no caminho (" + lista([...testados].sort((x, y) => x - y).map(String)) + ") combinaram. <strong>" + escapeHtml(g.nome) + " está na árvore?</strong>",
      opcoes: [
        { t: "Sim: todos os bits testados combinaram", ok: false, por: "A descida pulou alguns bits. " + escapeHtml(g.nome) + " pode ser diferente de " + escapeHtml(folha.nome) + " justamente neles." },
        { t: "Ainda não dá para saber: é preciso comparar a chave inteira com a da folha", ok: true },
        { t: "Não: a pesquisa deveria ter parado num nó interno", ok: false, por: "Na Patricia, toda pesquisa desce até uma folha; quem decide é a comparação final." },
      ],
      figura: (st) => svg({ caminho, atual: p.id, cmp: st.resolvida ? p.id : null }),
      depois: "Comparando " + escapeHtml(g.nome) + " = " + cod(g.bits) + " com " + escapeHtml(folha.nome) + " = " + cod(folha.bits) + ", eles diferem " + (difs.length === 1 ? "no bit " : "nos bits ") + lista(difs.map(String)) +
        " (em vermelho), que a descida pulou. Então " + escapeHtml(g.nome) + " <strong>não</strong> está na árvore, e só a comparação da chave inteira mostra isso.",
    });
    return etapas;
  }

  // ---- QuadTree: núcleo comum do bloco "quadtree" (aplicação) e da prática tipo "quadtree" ----
  // Cada folha guarda no máximo um ponto; o plano vai de 0 a lado − 1 em x e em y, com y para cima.
  const QT_NOMES = ["NO", "NE", "SO", "SE"];

  function qtArvore(lado) {
    let seq = 0;
    const novo = (x0, y0, l, prof) => ({ id: seq++, x0, y0, lado: l, prof, ponto: null, filhos: null });
    return { raiz: novo(0, 0, lado, 0), novo };
  }
  const qtQuad = (n, x, y) => { const m = n.lado / 2, leste = x >= n.x0 + m, norte = y >= n.y0 + m; return norte ? (leste ? 1 : 0) : (leste ? 3 : 2); };
  const qtClone = (n) => ({ ...n, filhos: n.filhos && n.filhos.map(qtClone) });
  const qtNos = (r) => { const l = []; const v = (n) => { l.push(n); if (n.filhos) n.filhos.forEach(v); }; v(r); return l; };
  const qtRegiao = (n) => "x de " + n.x0 + " a " + (n.x0 + n.lado - 1) + ", y de " + n.y0 + " a " + (n.y0 + n.lado - 1);
  const qtEncosta = (n, r) => !(n.x0 > r.x1 || n.x0 + n.lado - 1 < r.x0 || n.y0 > r.y1 || n.y0 + n.lado - 1 < r.y0);
  const qtDentro = (p, r) => p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1;

  // ev(tipo, dados) recebe cada passo; motivo diz se a chamada é a reinserção do ponto antigo ou a continuação do novo
  function qtInserir(t, n, p, ev, motivo) {
    if (ev) ev("inicio", { no: n, p, motivo });
    while (n.filhos) { const q = qtQuad(n, p.x, p.y), pai = n; n = n.filhos[q]; if (ev) ev("desce", { no: n, pai, q, p }); }
    if (!n.ponto) { n.ponto = p; if (ev) ev("guarda", { no: n, p }); return; }
    const antigo = n.ponto, m = n.lado / 2;
    n.ponto = null;
    n.filhos = [t.novo(n.x0, n.y0 + m, m, n.prof + 1), t.novo(n.x0 + m, n.y0 + m, m, n.prof + 1), t.novo(n.x0, n.y0, m, n.prof + 1), t.novo(n.x0 + m, n.y0, m, n.prof + 1)];
    if (ev) ev("divide", { no: n, p, antigo });
    qtInserir(t, n, antigo, ev, "antigo");
    qtInserir(t, n, p, ev, "continua");
  }

  // Mapa (à esquerda) e árvore (à direita) num só SVG.
  // opt: { sigla(p), noCls(n), regCls(n) (camada sobre a região de qualquer nó), ptCls(p), ret, pendente, clicavel(n) }
  function qtDesenho(raiz, lado, opt) {
    const C = Math.round(240 / lado), OX = 26, OY = 30, PL = C * lado;
    const rx = (n) => OX + C * n.x0, ry = (n) => OY + C * (lado - n.y0 - n.lado);
    const cx = (x) => OX + C * (x + 0.5), cy = (y) => OY + C * (lado - y - 0.5);
    const todos = qtNos(raiz), folhas = todos.filter((n) => !n.filhos);
    const alvo = (n) => (opt.clicavel && opt.clicavel(n) ? ' data-px-no="' + n.id + '" tabindex="0" role="button" aria-label="nó ' + qtRegiao(n) + '"' : "");
    let mapa = "";
    for (let i = 0; i < lado; i++) {
      mapa += '<text class="qt-eixo" x="' + cx(i) + '" y="' + (OY + PL + 13) + '">' + i + '</text><text class="qt-eixo" x="' + (OX - 9) + '" y="' + (cy(i) + 4) + '">' + i + "</text>";
    }
    for (const n of folhas) mapa += '<rect class="qt-reg' + (opt.clicavel && opt.clicavel(n) ? " px-alvo" : "") + '"' + alvo(n) + ' x="' + rx(n) + '" y="' + ry(n) + '" width="' + C * n.lado + '" height="' + C * n.lado + '"></rect>';
    for (const n of todos) { const c = opt.regCls ? opt.regCls(n) : ""; if (c) mapa += '<rect class="qt-camada ' + c + '" x="' + rx(n) + '" y="' + ry(n) + '" width="' + C * n.lado + '" height="' + C * n.lado + '"></rect>'; }
    mapa += '<rect class="qt-borda" x="' + OX + '" y="' + OY + '" width="' + PL + '" height="' + PL + '"></rect>';
    if (opt.ret) { const r = opt.ret; mapa += '<rect class="qt-ret" x="' + (OX + C * r.x0) + '" y="' + (OY + C * (lado - r.y1 - 1)) + '" width="' + C * (r.x1 - r.x0 + 1) + '" height="' + C * (r.y1 - r.y0 + 1) + '"></rect>'; }
    for (const n of folhas) if (n.ponto) {
      const p = n.ponto;
      mapa += '<g class="qt-pt' + (opt.ptCls ? opt.ptCls(p) : "") + '"><circle cx="' + cx(p.x) + '" cy="' + cy(p.y) + '" r="' + Math.min(10, C * 0.36) + '"></circle><text x="' + cx(p.x) + '" y="' + (cy(p.y) + 4) + '">' + escapeHtml(opt.sigla(p)) + "</text></g>";
    }
    if (opt.pendente) { const p = opt.pendente; mapa += '<g class="qt-pt qt-pendente"><circle cx="' + cx(p.x) + '" cy="' + cy(p.y) + '" r="' + Math.min(10, C * 0.36) + '"></circle><text x="' + cx(p.x) + '" y="' + (cy(p.y) + 4) + '">' + escapeHtml(opt.sigla(p)) + "</text></g>"; }
    // árvore: cada folha numa coluna, pai no meio dos filhos
    const LX = 40, LY = 58, TX = OX + PL + 44;
    const pos = new Map();
    let col = 0, prof = 0;
    const mede = (n) => { prof = Math.max(prof, n.prof); if (!n.filhos) { pos.set(n.id, TX + col++ * LX + 16); return; } n.filhos.forEach(mede); pos.set(n.id, (pos.get(n.filhos[0].id) + pos.get(n.filhos[3].id)) / 2); };
    mede(raiz);
    const ty = (n) => 34 + n.prof * LY;
    let arestas = "", nos = "";
    const visita = (n, q) => {
      if (n.filhos) n.filhos.forEach((f, i) => {
        arestas += '<g class="rt-edge' + (opt.arestaOn && opt.arestaOn(f) ? " rt-on" : "") + '"><line x1="' + pos.get(n.id) + '" y1="' + (ty(n) + 13) + '" x2="' + pos.get(f.id) + '" y2="' + (ty(f) - 13) + '"></line></g>';
        visita(f, i);
      });
      const tipo = n.filhos ? "" : n.ponto ? " qt-folha" : " qt-vazia";
      const texto = n.filhos ? (q < 0 ? "raiz" : "+") : n.ponto ? opt.sigla(n.ponto) : "·";
      nos += '<g class="rt-node' + tipo + (opt.noCls ? opt.noCls(n) : "") + (opt.clicavel && opt.clicavel(n) ? " px-alvo" : "") + '"' + alvo(n) + ">" +
        '<rect x="' + (pos.get(n.id) - 15) + '" y="' + (ty(n) - 13) + '" width="30" height="26" rx="7"></rect>' +
        '<text class="rt-name" x="' + pos.get(n.id) + '" y="' + (ty(n) + 5) + '">' + escapeHtml(texto) + "</text>" +
        (q >= 0 ? '<text class="qt-q" x="' + pos.get(n.id) + '" y="' + (ty(n) - 17) + '">' + QT_NOMES[q] + "</text>" : "") + "</g>";
    };
    visita(raiz, -1);
    const W = Math.max(TX + col * LX + 10, OX + PL + 60), H = Math.max(OY + PL + 22, 34 + prof * LY + 30);
    return '<svg class="rt-tree qt-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Mapa dividido pela QuadTree e a árvore correspondente">' + mapa + arestas + nos + "</svg>";
  }

  function qtSiglas(pontos) {
    const iniciais = pontos.map((p) => p.nome.trim()[0].toUpperCase());
    const unicas = new Set(iniciais).size === iniciais.length;
    return new Map(pontos.map((p, i) => [p, unicas ? iniciais[i] : String.fromCharCode(65 + i)]));
  }

  function validaQuadtree(d) {
    if (!d || !Number.isInteger(d.lado) || ![4, 8, 16].includes(d.lado)) return "O lado do plano precisa ser 4, 8 ou 16.";
    if (!Array.isArray(d.pontos) || d.pontos.length < 2 || d.pontos.length > 10) return "Use de 2 a 10 pontos.";
    const vistos = new Set();
    for (const p of d.pontos) {
      if (!p || typeof p.nome !== "string" || !p.nome.trim() || !Number.isInteger(p.x) || !Number.isInteger(p.y) || p.x < 0 || p.y < 0 || p.x >= d.lado || p.y >= d.lado) return "Cada ponto precisa de um nome e de x e y entre 0 e " + (d.lado - 1) + ".";
      if (vistos.has(p.x + "," + p.y)) return "Dois pontos não podem ter as mesmas coordenadas.";
      vistos.add(p.x + "," + p.y);
    }
    const ret = (r) => r && [r.x0, r.y0, r.x1, r.y1].every((v) => Number.isInteger(v) && v >= 0 && v < d.lado) && r.x0 <= r.x1 && r.y0 <= r.y1;
    if (d.consultas !== undefined && (!Array.isArray(d.consultas) || d.consultas.length > 4 || !d.consultas.every(ret))) return "Cada consulta precisa de x0 ≤ x1 e y0 ≤ y1 dentro do plano.";
    return null;
  }

  function renderQuadtree(source) {
    const data = parseJson(source);
    const erro = validaQuadtree(data);
    if (erro) return blockError("QuadTree: " + erro);
    const title = String(data.title || "Montando e consultando uma QuadTree");
    const siglas = qtSiglas(data.pontos);
    const linhas = data.pontos.map((p, i) => '<tr data-i="' + i + '"><td><strong>' + escapeHtml(siglas.get(p)) + "</strong> " + escapeHtml(p.nome) + "</td><td>(" + p.x + ", " + p.y + ")</td></tr>").join("");
    const svg = qtDesenho(qtArvore(data.lado).raiz, data.lado, { sigla: (p) => siglas.get(p) });
    return '<section class="roteamento qt" data-kind="quadtree" data-cfg="' + escapeHtml(JSON.stringify(data)) + '" aria-label="' + escapeHtml(title) + '">' +
      '<p class="stepper-title">' + escapeHtml(title) + "</p>" +
      '<div class="rt-top"><div class="rt-addr"><span class="rt-lbl">Operação</span><div class="sg-formula qt-op"><span class="rt-vazio">—</span></div></div>' +
      '<div class="rt-actions"><button type="button" data-rt="play" class="rt-play" data-label="▶ Executar">▶ Executar</button><button type="button" data-rt="step">Próximo passo ›</button><button type="button" data-rt="reset">Reiniciar</button></div></div>' +
      '<div class="qt-fig">' + svg + "</div>" +
      '<div class="qt-lado"><table class="rt-table"><thead><tr><th>Lugar</th><th>Posição</th></tr></thead><tbody>' + linhas + "</tbody></table>" +
      '<p class="rt-best">Nós na árvore: <strong>1</strong><span class="rt-count"> (só a raiz, uma folha vazia)</span></p></div>' +
      '<p class="rt-msg" aria-live="polite">' + QT_INICIO + '</p><ol class="rt-log"></ol></section>';
  }
  const QT_INICIO = "A árvore começa só com a raiz: uma folha vazia que representa o mapa inteiro. Clique em <strong>Executar</strong> ou em <strong>Próximo passo</strong> para inserir os lugares, um por vez, e depois fazer as consultas.";

  function passosQuadtree(el) {
    const cfg = JSON.parse(el.dataset.cfg);
    const siglas = qtSiglas(cfg.pontos);
    const nome = (p) => "<strong>" + escapeHtml(p.nome) + "</strong>";
    const t = qtArvore(cfg.lado);
    const passos = [];
    const foto = (extra) => passos.push({ raiz: qtClone(t.raiz), ...extra });
    cfg.pontos.forEach((p, j) => {
      qtInserir(t, t.raiz, p, (tipo, d) => {
        const q = d.p;
        const base = { linha: j, op: p.nome + " em (" + p.x + ", " + p.y + ")", foco: d.no.id };
        if (tipo === "inicio") foto({ ...base, pendente: q, msg: d.motivo === "antigo" ? "Primeiro, " + nome(q) + ", que estava na folha, é colocado de novo a partir do nó dividido." : d.motivo === "continua" ? "Agora " + nome(q) + " continua a inserção a partir do mesmo nó dividido." : "Novo lugar: " + nome(q) + ", em (" + q.x + ", " + q.y + "). Começamos pela raiz." });
        if (tipo === "desce") { const m = d.pai.lado / 2; foto({ ...base, pendente: q, msg: nome(q) + ", em (" + q.x + ", " + q.y + "), fica no quadrante <strong>" + QT_NOMES[d.q] + "</strong>: x " + (q.x >= d.pai.x0 + m ? "≥" : "<") + " " + (d.pai.x0 + m) + " e y " + (q.y >= d.pai.y0 + m ? "≥" : "<") + " " + (d.pai.y0 + m) + ". Descemos para ele (" + qtRegiao(d.no) + ")." }); }
        if (tipo === "guarda") foto({ ...base, novos: [d.no.id], msg: "A folha estava vazia: " + nome(q) + " fica guardado nela." });
        if (tipo === "divide") foto({ ...base, pendente: q, novos: d.no.filhos.map((x) => x.id), msg: "A folha já guardava " + nome(d.antigo) + ". Como cada folha guarda no máximo um lugar, ela é <strong>dividida</strong> em 4 quadrantes de lado " + d.no.lado / 2 + " (contorno azul), e " + nome(d.antigo) + " e " + nome(q) + " são distribuídos entre eles." });
      });
    });
    const total = qtNos(t.raiz).length;
    foto({ linha: cfg.pontos.length, fimIns: true, msg: "Os " + cfg.pontos.length + " lugares estão na árvore, que tem " + total + " nós. Só as regiões com lugares próximos foram divididas mais de uma vez." + ((cfg.consultas || []).length ? " Agora, as consultas." : "") });
    for (const r of cfg.consultas || []) {
      const ret = { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 };
      const op = "consulta: " + (r.nome || "região");
      const achados = [], fora = [], visitados = [];
      let comparados = 0;
      const base = () => ({ ret, op, achados: achados.slice(), fora: fora.slice(), visitados: visitados.slice(), comparados, linha: -1 });
      foto({ ...base(), msg: "Consulta " + (r.nome ? "“" + escapeHtml(r.nome) + "”" : "") + ": quais lugares têm x de " + r.x0 + " a " + r.x1 + " e y de " + r.y0 + " a " + r.y1 + " (retângulo tracejado)? A consulta começa pela raiz." });
      const visita = (n, q) => {
        visitados.push(n.id);
        const qual = q < 0 ? "A raiz" : "O nó " + QT_NOMES[q] + " (" + qtRegiao(n) + ")";
        if (!qtEncosta(n, ret)) { qtNos(n).forEach((x) => fora.push(x.id)); foto({ ...base(), foco: n.id, msg: qual + " <strong>não encosta</strong> no retângulo: é descartado inteiro" + (n.filhos ? ", sem olhar nenhum dos seus filhos." : ".") }); return; }
        if (!n.filhos) {
          if (n.ponto) comparados++;
          if (n.ponto && qtDentro(n.ponto, ret)) { achados.push(n.ponto.nome); foto({ ...base(), foco: n.id, msg: qual + " é uma folha com " + nome(n.ponto) + ", que está <strong>dentro</strong> do retângulo: encontrado." }); }
          else foto({ ...base(), foco: n.id, msg: qual + " encosta no retângulo, mas é uma folha " + (n.ponto ? "com " + nome(n.ponto) + ", que fica fora dele." : "vazia.") });
          return;
        }
        foto({ ...base(), foco: n.id, msg: qual + " encosta no retângulo e está " + (q < 0 ? "dividida" : "dividido") + ": a consulta olha os quatro filhos." });
        n.filhos.forEach((f, i) => visita(f, i));
      };
      visita(t.raiz, -1);
      foto({ ...base(), resultado: true, msg: "Resultado: " + (achados.length ? lista(achados.map((a) => "<strong>" + escapeHtml(a) + "</strong>")) : "nenhum lugar") + ". A consulta só comparou " + comparados + " dos " + cfg.pontos.length + " lugares com o retângulo" + (comparados < cfg.pontos.length ? ": os outros estavam em regiões descartadas inteiras." : ".") });
    }
    foto({ fim: true, linha: cfg.pontos.length, msg: "Fim. A inserção desce um caminho só, e a consulta só entra nas regiões que encostam na área procurada." });
    return { passos, siglas: new Map(cfg.pontos.map((p) => [p.nome, siglas.get(p)])), lado: cfg.lado, nomes: cfg.pontos.map((p) => p.nome) };
  }

  function mostrarQuadtree(el, n) {
    const dados = el.__rtPassos || (el.__rtPassos = passosQuadtree(el));
    const passos = dados.passos;
    const k = Math.min(n, passos.length - 1);
    el.__rtPasso = k;
    const passo = k >= 0 ? passos[k] : null;
    const sigla = (p) => dados.siglas.get(p.nome);
    if (passo) {
      const caminho = new Set();
      if (passo.foco !== undefined && !passo.ret) { const ach = (x, trilha) => { if (x.id === passo.foco) trilha.forEach((i) => caminho.add(i)); if (x.filhos) x.filhos.forEach((f) => ach(f, [...trilha, f.id])); }; ach(passo.raiz, [passo.raiz.id]); }
      const fora = new Set(passo.fora || []), visit = new Set(passo.visitados || []), achados = new Set(passo.achados || []), novos = new Set(passo.novos || []);
      el.querySelector(".qt-fig").innerHTML = qtDesenho(passo.raiz, dados.lado, {
        sigla, ret: passo.ret, pendente: passo.pendente,
        noCls: (x) => (fora.has(x.id) ? " qt-fora" : "") + (caminho.has(x.id) || (visit.has(x.id) && !fora.has(x.id)) ? " rt-on" : "") + (x.id === passo.foco ? " rt-cur" : "") + (novos.has(x.id) ? " rt-new" : "") + (x.ponto && achados.has(x.ponto.nome) ? " rt-win" : ""),
        arestaOn: (x) => caminho.has(x.id) || (visit.has(x.id) && !fora.has(x.id)),
        regCls: (x) => (x.id === passo.foco ? "qt-foco" : fora.has(x.id) && isTopoFora(passo.raiz, x, fora) ? "qt-descartado" : ""),
        ptCls: (p) => (achados.has(p.nome) ? " qt-achado" : ""),
      });
    } else el.querySelector(".qt-fig").innerHTML = qtDesenho(qtArvore(dados.lado).raiz, dados.lado, { sigla });
    const inseridos = passo ? (passo.linha < 0 ? dados.nomes.length : passo.linha) : 0;
    el.querySelectorAll(".rt-table tbody tr").forEach((tr, j) => {
      const emInsercao = !!passo && !passo.ret && j === passo.linha && !passo.fimIns && !passo.fim;
      tr.classList.toggle("rt-done", !!passo && (j < inseridos || passo.fimIns || passo.fim || !!passo.ret) && !emInsercao);
      tr.classList.toggle("rt-match", emInsercao);
      tr.classList.toggle("rt-wait", !passo || (j > inseridos && !passo.ret && !passo.fimIns && !passo.fim));
      tr.classList.toggle("rt-win", !!passo && !!passo.achados && passo.achados.includes(dados.nomes[j]));
    });
    el.querySelector(".qt-op").innerHTML = passo && passo.op ? "<code>" + escapeHtml(passo.op) + "</code>" : '<span class="rt-vazio">—</span>';
    const nosAgora = passo ? qtNos(passo.raiz).length : 1;
    el.querySelector(".rt-best").innerHTML = passo && passo.ret
      ? "Encontrados: <strong>" + (passo.achados.length ? passo.achados.map(escapeHtml).join(", ") : "—") + '</strong><span class="rt-count"> · lugares comparados: ' + passo.comparados + "</span>"
      : "Nós na árvore: <strong>" + nosAgora + '</strong><span class="rt-count">' + (nosAgora === 1 ? " (só a raiz)" : "") + "</span>";
    el.querySelector(".rt-msg").innerHTML = passo ? passo.msg : QT_INICIO;
    el.querySelector(".rt-log").innerHTML = passos.slice(0, Math.max(k, 0)).map((p) => "<li>" + p.msg + "</li>").join("");
    el.classList.toggle("rt-fim", !!passo && !!passo.fim);
    el.querySelector('[data-rt="step"]').disabled = !!passo && !!passo.fim;
    return !!passo && !!passo.fim;
  }
  // um nó descartado só ganha a camada cinza se o pai dele não foi descartado (senão a camada repetiria)
  function isTopoFora(raiz, x, fora) {
    let pai = null;
    const acha = (n) => { if (n.filhos) for (const f of n.filhos) { if (f.id === x.id) pai = n; acha(f); } };
    acha(raiz);
    return !pai || !fora.has(pai.id);
  }

  // QuadTree: quadrante do ponto novo, folha onde ele cai, o que acontece na folha cheia,
  // nós descartados pela consulta e folhas que entram na resposta.
  function etapasQuadtree(cfg) {
    const lado = cfg.lado;
    const todos = [...cfg.pontos, cfg.novo];
    const siglas = qtSiglas(todos);
    const sigla = (p) => siglas.get(p);
    const t = qtArvore(lado);
    cfg.pontos.forEach((p) => qtInserir(t, t.raiz, p));
    const antes = qtClone(t.raiz);
    const novo = cfg.novo, nomeN = "<strong>" + escapeHtml(novo.nome) + "</strong> = (" + novo.x + ", " + novo.y + ")";
    const qRaiz = qtQuad(antes, novo.x, novo.y);
    let folha = antes;
    while (folha.filhos) folha = folha.filhos[qtQuad(folha, novo.x, novo.y)];
    const ocupada = folha.ponto;
    qtInserir(t, t.raiz, novo);
    const depois = qtClone(t.raiz);
    const idsAntes = new Set(qtNos(antes).map((n) => n.id));
    const novos = qtNos(depois).filter((n) => !idsAntes.has(n.id)).map((n) => n.id);
    const ret = cfg.consulta;
    const retTxt = "x de " + ret.x0 + " a " + ret.x1 + " e y de " + ret.y0 + " a " + ret.y1;
    // nós descartados "por inteiro": não encostam no retângulo, mas o pai encosta
    const descartados = new Set(), achadas = new Set(), paiDe = new Map();
    const percorre = (n) => {
      if (!qtEncosta(n, ret)) { descartados.add(n.id); return; }
      if (!n.filhos) { if (n.ponto && qtDentro(n.ponto, ret)) achadas.add(n.id); return; }
      n.filhos.forEach((x) => { paiDe.set(x.id, n); percorre(x); });
    };
    percorre(depois);
    const porId = new Map(qtNos(depois).map((n) => [n.id, n]));
    const nomeNo = (n) => (n.prof === 0 ? "a raiz" : "o nó " + qtRegiao(n));
    const desenho = (raiz, opt) => qtDesenho(raiz, lado, { sigla, ...opt });
    const pendenteOpt = { pendente: novo };
    return [
      {
        tipo: "escolha",
        texto: "A QuadTree já guarda " + lista(cfg.pontos.map((p) => "<strong>" + escapeHtml(sigla(p)) + "</strong> = (" + p.x + ", " + p.y + ")")) + ". Vamos inserir " + nomeN + " (o ponto azul tracejado no mapa). <strong>Em que quadrante da raiz ele fica?</strong>",
        opcoes: QT_NOMES.map((q, i) => ({ t: q + (i === 0 ? " (noroeste)" : i === 1 ? " (nordeste)" : i === 2 ? " (sudoeste)" : " (sudeste)"), ok: i === qRaiz, por: "Compare com o meio do plano, " + lado / 2 + ": x " + (novo.x >= lado / 2 ? "≥" : "<") + " " + lado / 2 + " é " + (novo.x >= lado / 2 ? "leste" : "oeste") + ", e y " + (novo.y >= lado / 2 ? "≥" : "<") + " " + lado / 2 + " é " + (novo.y >= lado / 2 ? "norte" : "sul") + "." })),
        figura: (st) => desenho(antes, { ...pendenteOpt, regCls: (n) => (st.resolvida && antes.filhos && n === antes.filhos[qRaiz] ? "qt-foco" : "") }),
        depois: "x = " + novo.x + (novo.x >= lado / 2 ? " ≥ " : " < ") + lado / 2 + " e y = " + novo.y + (novo.y >= lado / 2 ? " ≥ " : " < ") + lado / 2 + ": o ponto fica no quadrante <strong>" + QT_NOMES[qRaiz] + "</strong>.",
      },
      {
        tipo: "nos", correta: new Set([folha.id]),
        texto: "<strong>Em que folha " + nomeN + " vai parar?</strong> Clique nela, no mapa ou na árvore, e depois em <strong>Verificar</strong>.",
        figura: (st) => desenho(antes, { ...pendenteOpt,
          clicavel: (n) => !st.resolvida && !n.filhos,
          regCls: (n) => (st.resolvida && n.id === folha.id ? "qt-certo" : !n.filhos && st.sel.has(n.id) ? "px-sel" : ""),
          noCls: (n) => (st.sel.has(n.id) && !st.resolvida ? " px-sel" : "") + (st.resolvida && n.id === folha.id ? " rt-on rt-cur" : "") }),
        checar(sel) {
          if (sel.size > 1) return "O ponto vai para uma folha só: escolha apenas uma.";
          const n = porId.get([...sel][0]) || qtNos(antes).find((x) => x.id === [...sel][0]);
          return "A folha escolhida cobre " + qtRegiao(n) + ", e " + escapeHtml(novo.nome) + " = (" + novo.x + ", " + novo.y + ") não está nessa região. Desça a partir da raiz escolhendo, em cada nó, o quadrante do ponto.";
        },
        depois: "A descida termina na folha que cobre " + qtRegiao(folha) + (ocupada ? ", que <strong>já guarda</strong> " + escapeHtml(sigla(ocupada)) + " = (" + ocupada.x + ", " + ocupada.y + ")." : ", que está vazia."),
      },
      {
        tipo: "escolha",
        texto: ocupada
          ? "A folha já guarda " + escapeHtml(sigla(ocupada)) + " = (" + ocupada.x + ", " + ocupada.y + "), e cada folha guarda no máximo um ponto. <strong>O que acontece ao inserir " + escapeHtml(novo.nome) + "?</strong>"
          : "A folha está vazia. <strong>O que acontece ao inserir " + escapeHtml(novo.nome) + "?</strong>",
        opcoes: ocupada
          ? [{ t: "A folha é dividida em 4 quadrantes, e os dois pontos são distribuídos entre eles", ok: true },
             { t: escapeHtml(novo.nome) + " substitui o ponto que estava na folha", ok: false, por: "Nenhum ponto pode se perder: os dois continuam na árvore." },
             { t: "A folha passa a guardar os dois pontos", ok: false, por: "Nesta QuadTree, cada folha guarda no máximo um ponto. O que a inserção faz para abrir espaço?" }]
          : [{ t: escapeHtml(novo.nome) + " fica guardado na folha, e nada é dividido", ok: true },
             { t: "A folha é dividida em 4 quadrantes", ok: false, por: "A divisão só acontece quando a folha já tem um ponto." }],
        figura: (st) => (st.resolvida ? desenho(depois, { noCls: (n) => (novos.includes(n.id) ? " rt-new" : "") }) : desenho(antes, { ...pendenteOpt, noCls: (n) => (n.id === folha.id ? " rt-on rt-cur" : "") })),
        depois: ocupada
          ? "A folha virou um nó dividido com " + (novos.length === 4 ? "4 filhos novos" : novos.length + " nós novos") + " (contorno azul), e " + escapeHtml(sigla(ocupada)) + " e " + escapeHtml(sigla(novo)) + " ficaram em folhas diferentes." + (novos.length > 4 ? " Como eles caíram de novo no mesmo quadrante, a divisão se repetiu um nível abaixo." : "")
          : escapeHtml(novo.nome) + " ficou guardado na folha.",
      },
      {
        tipo: "nos", correta: descartados,
        texto: "Agora uma consulta: quais pontos têm " + retTxt + " (retângulo tracejado)? <strong>Quais nós a consulta descarta inteiros, sem olhar nada abaixo deles?</strong> Clique nos nós da árvore (ou nas regiões do mapa) e depois em <strong>Verificar</strong>.",
        figura: (st) => desenho(depois, { ret,
          clicavel: (n) => !st.resolvida && n.prof > 0,
          regCls: (n) => (st.resolvida && descartados.has(n.id) ? "qt-descartado" : !st.resolvida && st.sel.has(n.id) && !n.filhos ? "px-sel" : ""),
          noCls: (n) => (st.sel.has(n.id) && !st.resolvida ? " px-sel" : "") + (st.resolvida && descartados.has(n.id) ? " qt-fora" : "") }),
        checar(sel) {
          for (const id of sel) {
            const n = porId.get(id);
            if (qtEncosta(n, ret)) return "A região " + qtRegiao(n) + " encosta no retângulo: a consulta precisa entrar nesse nó.";
            if (!descartados.has(id)) return "O nó " + qtRegiao(n) + " nem chega a ser visitado: um nó acima dele já foi descartado inteiro. Marque só o nó mais alto de cada parte descartada.";
          }
          return "Ainda falta nó: procure, entre os filhos dos nós que encostam no retângulo, os que ficam totalmente fora dele.";
        },
        depois: "São descartados " + lista([...descartados].map((id) => "o nó " + qtRegiao(porId.get(id)))) + ". Nenhum ponto dessas regiões é comparado com o retângulo.",
      },
      {
        tipo: "nos", correta: achadas,
        texto: "<strong>Quais folhas guardam pontos que entram na resposta da consulta?</strong> Clique nelas e depois em <strong>Verificar</strong>.",
        figura: (st) => desenho(depois, { ret,
          clicavel: (n) => !st.resolvida && !n.filhos,
          regCls: (n) => (descartados.has(n.id) && (!paiDe.get(n.id) || !descartados.has(paiDe.get(n.id).id)) ? "qt-descartado" : !st.resolvida && st.sel.has(n.id) ? "px-sel" : ""),
          noCls: (n) => (descartados.has(n.id) || [...descartados].some((d) => qtNos(porId.get(d)).some((x) => x.id === n.id)) ? " qt-fora" : "") + (st.sel.has(n.id) && !st.resolvida ? " px-sel" : "") + (st.resolvida && achadas.has(n.id) ? " rt-win" : ""),
          ptCls: (p) => (st.resolvida && qtDentro(p, ret) ? " qt-achado" : "") }),
        checar(sel) {
          for (const id of sel) {
            const n = porId.get(id);
            if (!n.ponto) return "A folha que cobre " + qtRegiao(n) + " está vazia.";
            if (!qtDentro(n.ponto, ret)) return escapeHtml(sigla(n.ponto)) + " = (" + n.ponto.x + ", " + n.ponto.y + ") fica fora do retângulo, mesmo que a região da folha encoste nele.";
          }
          return "Ainda falta folha: confira cada ponto que está dentro do retângulo.";
        },
        depois: "A resposta é " + lista([...achadas].map((id) => "<strong>" + escapeHtml(sigla(porId.get(id).ponto)) + "</strong>")) + ". A consulta só comparou com o retângulo os pontos das folhas que encostam nele.",
      },
    ];
  }

  const PX_ETAPAS = { segtree: etapasSegtree, trie: etapasTrie, radix: etapasRadix, patricia: etapasPatricia, quadtree: etapasQuadtree };

  function iniciarPratica(el) {
    if (el.__px) return;
    let cfg;
    try { cfg = JSON.parse(el.dataset.cfg); } catch { return; }
    el.__px = { etapas: PX_ETAPAS[cfg.tipo](cfg), etapa: 0, sel: new Set(), resolvida: false, revelada: false, tentou: false, escolha: null, msg: "", ok: false };
    mostrarPratica(el);
  }

  const linhaBits = (c, opt) => '<div class="px-bits"><span class="px-nome">' + escapeHtml(c.nome) + "</span>" + Array.from(c.bits, (b, i) => {
    const n = i + 1, cls = "rt-bit" + ((opt.dif || []).includes(n) ? " pt-dif" : "") + (opt.marcado === n ? " px-marcado" : "");
    return opt.clicavel ? '<button type="button" class="' + cls + '" data-px-bit="' + n + '" title="bit ' + n + '">' + b + "</button>" : '<span class="' + cls + '" title="bit ' + n + '">' + b + "</span>";
  }).join("") + "</div>";

  function mostrarPratica(el) {
    const st = el.__px, e = st.etapas[st.etapa], total = st.etapas.length;
    const ultima = st.etapa === total - 1;
    el.querySelector(".px-cont").textContent = "Questão " + (st.etapa + 1) + " de " + total;
    el.querySelector(".px-fig").innerHTML = e.figura ? e.figura(st) : "";
    el.querySelector(".px-texto").innerHTML = e.texto;
    let area = "";
    if (e.tipo === "escolha") {
      area = '<div class="px-opcoes">' + e.opcoes.map((o, i) => '<button type="button" data-px-op="' + i + '" class="px-op' +
        (st.resolvida && o.ok ? " px-certa" : st.escolha === i && !o.ok ? " px-errada" : "") + '"' + (st.resolvida ? " disabled" : "") + ">" + escapeHtml(o.t) + "</button>").join("") + "</div>";
      if (st.resolvida && e.chavesDepois) area += '<div class="px-chaves">' + e.chavesDepois.map((c) => linhaBits(c, { dif: e.difs })).join("") + "</div>";
    } else if (e.tipo === "letra") {
      area = '<div class="px-letras" role="group" aria-label="Letras do rótulo">' + e.letras.map((l, i) => '<button type="button" data-px-letra="' + i + '" class="px-letra' +
        (st.resolvida && i === e.correta ? " px-certa" : st.escolha === i && i !== e.correta ? " px-errada" : "") + (st.resolvida && i > e.correta ? " px-corte" : "") + '"' + (st.resolvida ? " disabled" : "") + ">" + escapeHtml(l) + "</button>").join("") + "</div>";
    } else if (e.tipo === "bit") {
      const [a, b] = e.chaves;
      area = '<div class="px-chaves">' + linhaBits(a, { clicavel: !st.resolvida, dif: st.resolvida ? [e.correta] : [], marcado: st.escolha }) + linhaBits(b, { dif: st.resolvida ? [e.correta] : [] }) + "</div>";
    }
    el.querySelector(".px-area").innerHTML = area;
    const msg = el.querySelector(".px-msg");
    msg.innerHTML = st.resolvida ? (st.revelada ? "<strong>Resposta:</strong> " : "<strong>Correto!</strong> ") + (typeof e.depois === "string" ? e.depois : "") : st.msg;
    msg.className = "px-msg" + (st.resolvida ? " px-ok" : st.msg ? " px-erro" : "");
    const botoes = [];
    if (!st.resolvida && e.tipo === "nos") {
      botoes.push('<button type="button" data-px="verificar">Verificar</button>');
      if (e.nenhum) botoes.push('<button type="button" data-px="nenhum">Nenhum nó</button>');
    }
    if (!st.resolvida && st.tentou) botoes.push('<button type="button" data-px="revelar">Ver resposta</button>');
    if (st.resolvida && !ultima) botoes.push('<button type="button" data-px="proxima" class="rt-play">Próxima questão ›</button>');
    if (st.resolvida && ultima) botoes.push('<span class="px-fim">Prática concluída ✓</span>');
    botoes.push('<button type="button" data-px="recomecar">Recomeçar</button>');
    el.querySelector(".px-acoes").innerHTML = botoes.join("");
    const feito = st.resolvida && ultima;
    if (feito && el.dataset.feito !== "true") {
      el.dataset.feito = "true";
      el.dispatchEvent(new CustomEvent("pratica-feita", { bubbles: true }));
    }
  }

  function resolverPratica(el, revelada) {
    const st = el.__px, e = st.etapas[st.etapa];
    st.resolvida = true; st.revelada = revelada; st.msg = "";
    if (e.tipo === "nos") st.sel = new Set(e.correta);
    if (e.tipo === "escolha" && revelada) st.escolha = null;
  }

  function acaoPratica(el, alvo) {
    const st = el.__px;
    if (!st) return;
    const e = st.etapas[st.etapa];
    const erro = (m) => { st.tentou = true; st.msg = m; };
    if (alvo.dataset.pxNo !== undefined && e.tipo === "nos" && !st.resolvida) {
      const id = /^\d+$/.test(alvo.dataset.pxNo) && e.correta.size && typeof [...e.correta][0] === "number" ? Number(alvo.dataset.pxNo) : alvo.dataset.pxNo;
      if (st.sel.has(id)) st.sel.delete(id); else st.sel.add(id);
      st.msg = "";
    } else if (alvo.dataset.pxOp !== undefined && !st.resolvida) {
      const i = Number(alvo.dataset.pxOp);
      st.escolha = i;
      if (e.opcoes[i].ok) resolverPratica(el, false); else erro(e.opcoes[i].por || "Ainda não. Observe a figura e tente de novo.");
    } else if ((alvo.dataset.pxLetra !== undefined || alvo.dataset.pxBit !== undefined) && !st.resolvida) {
      const i = Number(alvo.dataset.pxLetra ?? alvo.dataset.pxBit);
      st.escolha = i;
      if (i === e.correta) resolverPratica(el, false); else erro(e.checar(i));
    } else {
      const acao = alvo.dataset.px;
      if (acao === "verificar" || acao === "nenhum") {
        if (acao === "nenhum") st.sel = new Set();
        const certo = st.sel.size === e.correta.size && [...st.sel].every((x) => e.correta.has(x));
        if (certo) resolverPratica(el, false); else erro(st.sel.size === 0 && e.correta.size ? (e.nenhum ? "Há nós que já existem no caminho dessa palavra." : "Selecione pelo menos um nó.") : e.checar(st.sel));
      } else if (acao === "revelar") resolverPratica(el, true);
      else if (acao === "proxima") Object.assign(st, { etapa: st.etapa + 1, sel: new Set(), resolvida: false, revelada: false, tentou: false, escolha: null, msg: "" });
      else if (acao === "recomecar") {
        Object.assign(st, { etapa: 0, sel: new Set(), resolvida: false, revelada: false, tentou: false, escolha: null, msg: "" });
      } else return;
    }
    mostrarPratica(el);
    if (alvo.dataset.pxNo !== undefined) { const igual = el.querySelector('[data-px-no="' + alvo.dataset.pxNo + '"]'); if (igual) igual.focus({ preventScroll: true }); }
  }

  const BLOCK_RENDERERS = { "aula-narrada": renderNarratedLesson, video: renderVideo, slides: renderSlides, demo: renderDemo, carrossel: renderCarrossel, exercicio: renderExercise, codigo: renderCodigo, roteamento: renderRoteamento, patricia: renderPatricia, segtree: renderSegtree, pratica: renderPratica, quadtree: renderQuadtree };

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
    if (root.querySelectorAll) root.querySelectorAll(".px[data-cfg]").forEach(iniciarPratica);
    if (root.__lessonInteractions) return;
    root.__lessonInteractions = true;
    root.addEventListener("keydown", (event) => {
      const no = event.target.closest && event.target.closest(".px [data-px-no]");
      if (!no || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      acaoPratica(no.closest(".px"), no);
    });
    root.addEventListener("click", (event) => {
      const px = event.target.closest(".px [data-px], .px [data-px-no], .px [data-px-op], .px [data-px-letra], .px [data-px-bit]");
      if (px) { if (!px.disabled) acaoPratica(px.closest(".px"), px); return; }
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

  return { escapeHtml, renderInline, renderMarkdown, stepIndex, renderBlock, isAllowedEmbed, hydrateVideoEmbeds, attachInteractions, highlightC };
});
