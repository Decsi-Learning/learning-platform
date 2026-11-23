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

  const BLOCK_RENDERERS = { video: renderVideo, slides: renderSlides, demo: renderDemo, carrossel: renderCarrossel, exercicio: renderExercise, codigo: renderCodigo, roteamento: renderRoteamento, patricia: renderPatricia };

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
    if (root.__lessonInteractions) return;
    root.__lessonInteractions = true;
    root.addEventListener("click", (event) => {
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
