const test = require("node:test");
const assert = require("node:assert");
const { escapeHtml, renderMarkdown, stepIndex } = require("../js/renderer.js");

test("escapeHtml escapes the five special characters", () => {
  assert.strictEqual(escapeHtml(`<&">`), "&lt;&amp;&quot;&gt;");
  assert.strictEqual(escapeHtml("'"), "&#39;");
});

test("renderMarkdown renders headings", () => {
  assert.match(renderMarkdown("# T"), /<h1>T<\/h1>/);
});

test("renderMarkdown renders unordered lists", () => {
  const html = renderMarkdown("- a\n- b");
  assert.match(html, /<ul>\n<li>a<\/li>\n<li>b<\/li>\n<\/ul>/);
});

test("renderMarkdown renders text fences as pre/code", () => {
  const html = renderMarkdown("```text\nx <- 1\n```");
  assert.match(html, /<pre><code>x &lt;- 1<\/code><\/pre>/);
});

test("renderMarkdown renders a valid quiz with the right answer index", () => {
  const quiz = JSON.stringify({
    question: "Q?",
    options: [{ text: "a" }, { text: "b", correct: true }],
  });
  const html = renderMarkdown("```quiz\n" + quiz + "\n```");
  assert.match(html, /class="knowledge-test"/);
  assert.match(html, /data-correct="1"/);
});

test("renderMarkdown shows quiz-error for invalid quiz JSON", () => {
  const html = renderMarkdown("```quiz\n{nao e json\n```");
  assert.match(html, /class="quiz-error"/);
});

test("renderMarkdown gives identical output for CRLF input", () => {
  const lf = "# T\n\n- a\n- b\n\ntexto";
  assert.strictEqual(renderMarkdown(lf.replace(/\n/g, "\r\n")), renderMarkdown(lf));
});

test("stepIndex clamps to the valid range", () => {
  assert.strictEqual(stepIndex(0, -1, 3), 0);
  assert.strictEqual(stepIndex(2, 1, 3), 2);
  assert.strictEqual(stepIndex(0, 1, 3), 1);
  assert.strictEqual(stepIndex(0, 1, 0), 0);
});

// ---- Task 2: tables and fences ----
test("table renders thead and tbody", () => {
  const html = renderMarkdown("| A | B |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<table>/);
  assert.match(html, /<th>A<\/th><th>B<\/th>/);
  assert.match(html, /<td>1<\/td><td>2<\/td>/);
});

test("table pads short rows with empty cells", () => {
  const html = renderMarkdown("| A | B |\n|---|---|\n| 1 |");
  assert.match(html, /<td>1<\/td><td><\/td>/);
});

test("table escapes html in cells", () => {
  const html = renderMarkdown("| A |\n|---|\n| <b>x</b> |");
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<b>/);
});

test("a stray pipe in a paragraph does not become a table", () => {
  const html = renderMarkdown("a | b\n\ntexto");
  assert.doesNotMatch(html, /<table>/);
  assert.match(html, /<p>a \| b<\/p>/);
});

test("estrutura and pseudocodigo fences get their own class", () => {
  assert.match(renderMarkdown("```estrutura\n[x]\n```"), /<pre class="estrutura"><code>\[x\]<\/code><\/pre>/);
  assert.match(renderMarkdown("```pseudocodigo\nx <- 1\n```"), /<pre class="pseudocodigo"><code>x &lt;- 1<\/code><\/pre>/);
});

// ---- Task 3: video ----
const fence = (lang, obj) => "```" + lang + "\n" + (typeof obj === "string" ? obj : JSON.stringify(obj)) + "\n```";

test("video with null url renders the placeholder and no iframe", () => {
  const html = renderMarkdown(fence("video", { title: "Aula", url: null }));
  assert.match(html, /video-placeholder/);
  assert.doesNotMatch(html, /<iframe/);
});

test("video with an allowed embed url renders an iframe", () => {
  for (const url of [
    "https://www.youtube.com/embed/abc",
    "https://www.youtube-nocookie.com/embed/abc",
    "https://player.vimeo.com/video/123",
  ]) {
    assert.match(renderMarkdown(fence("video", { title: "Aula", url })), /<iframe class="video-embed" src="/, url);
  }
});

test("video rejects unsafe or foreign urls", () => {
  for (const url of ["javascript:alert(1)", "http://www.youtube.com/embed/x", "https://evil.com/embed/x", "https://www.youtube.com.evil.com/embed/x"]) {
    const html = renderMarkdown(fence("video", { title: "Aula", url }));
    assert.doesNotMatch(html, /<iframe/, url);
    assert.match(html, /video-placeholder/, url);
  }
});

test("video escapes the title", () => {
  const html = renderMarkdown(fence("video", { title: "<i>x</i>", url: null }));
  assert.match(html, /&lt;i&gt;x&lt;\/i&gt;/);
  assert.doesNotMatch(html, /<i>/);
});

test("video with invalid json shows quiz-error", () => {
  assert.match(renderMarkdown(fence("video", "{nope")), /class="quiz-error"/);
});

// ---- Task 4: slides, demo, exercicio ----
test("slides render one panel per slide, only the first visible", () => {
  const html = renderMarkdown(fence("slides", { slides: [{ title: "A", bullets: ["x", "y"] }, { title: "B", bullets: [] }] }));
  assert.match(html, /data-kind="slides" data-count="2"/);
  assert.strictEqual((html.match(/data-step="/g) || []).length, 2);
  assert.strictEqual((html.match(/ hidden>/g) || []).length, 1);
  assert.match(html, /<li>x<\/li>/);
  assert.match(html, /1 \/ 2/);
});

test("slides with an empty list shows quiz-error", () => {
  const html = renderMarkdown(fence("slides", { slides: [] }));
  assert.match(html, /class="quiz-error"/);
  assert.match(html, /pelo menos um/);
});

test("demo with a single step disables both buttons", () => {
  const html = renderMarkdown(fence("demo", { title: "D", steps: [{ caption: "c", state: "s" }] }));
  assert.match(html, /data-kind="demo" data-count="1"/);
  assert.match(html, /data-stepper="prev" disabled/);
  assert.match(html, /data-stepper="next" disabled/);
});

test("demo with two steps starts with prev disabled and next enabled", () => {
  const html = renderMarkdown(fence("demo", { title: "D", steps: [{ caption: "c", state: "s" }, { caption: "d", state: "t" }] }));
  assert.match(html, /data-stepper="prev" disabled/);
  assert.doesNotMatch(html, /data-stepper="next" disabled/);
});

test("slides, demo, exercicio and video escape script text", () => {
  const evil = "<script>alert(1)</script>";
  const out = [
    renderMarkdown(fence("slides", { slides: [{ title: evil, bullets: [evil] }] })),
    renderMarkdown(fence("demo", { title: evil, steps: [{ caption: evil, state: evil }, { caption: evil, state: evil }] })),
    renderMarkdown(fence("exercicio", { title: evil, statement: evil, answer: evil })),
    renderMarkdown("| H |\n|---|\n| " + evil + " |"),
  ].join("\n");
  assert.doesNotMatch(out, /<script>/);
});

test("exercicio shows the statement and hides the answer in a details element", () => {
  const html = renderMarkdown(fence("exercicio", { title: "Ex 1", statement: "Enunciado", answer: "Gabarito" }));
  assert.match(html, /<h4>Ex 1<\/h4>/);
  assert.match(html, /<p class="exercise-statement">Enunciado<\/p>/);
  assert.match(html, /<details class="exercise-solution"><summary>Ver gabarito<\/summary><div class="exercise-answer">Gabarito<\/div><\/details>/);
});

test("slides, demo and exercicio with invalid json show quiz-error", () => {
  for (const lang of ["slides", "demo", "exercicio"]) {
    assert.match(renderMarkdown(fence(lang, "{nope")), /class="quiz-error"/, lang);
  }
});

test("exercicio without an answer shows quiz-error", () => {
  assert.match(renderMarkdown(fence("exercicio", { title: "t", statement: "s" })), /class="quiz-error"/);
});

// ---- Final review: edge case in table detection ----
test("a line with a pipe followed by a horizontal rule is not a table", () => {
  const html = renderMarkdown("ligar a | b\n---\ndepois");
  assert.doesNotMatch(html, /<table>/);
  assert.match(html, /<hr>/);
});

test("a table needs as many separator cells as header cells", () => {
  const html = renderMarkdown("| A | B |\n|---|\n| 1 | 2 |");
  assert.doesNotMatch(html, /<table>/);
});

// ---- Integração com o renderizador do site (marked + DOMPurify) ----
const { renderBlock, isAllowedEmbed } = require("../js/renderer.js");

test("renderBlock renders the custom block languages and ignores the others", () => {
  assert.match(renderBlock("slides", JSON.stringify({ slides: [{ title: "A", bullets: ["x"] }] })), /class="stepper"/);
  assert.match(renderBlock("demo", JSON.stringify({ title: "D", steps: [{ caption: "c", state: "s" }] })), /data-kind="demo"/);
  assert.match(renderBlock("exercicio", JSON.stringify({ title: "t", statement: "s", answer: "a" })), /exercise-solution/);
  assert.match(renderBlock("estrutura", "[x] <b>"), /<pre class="estrutura"><code>\[x\] &lt;b&gt;<\/code><\/pre>/);
  assert.match(renderBlock("pseudocodigo", "x <- 1"), /<pre class="pseudocodigo"><code>x &lt;- 1<\/code><\/pre>/);
  assert.strictEqual(renderBlock("c", "int x;"), null);
  assert.strictEqual(renderBlock("quiz", "{}"), null, "quiz continua sendo tratado pelo renderizador do site");
  assert.strictEqual(renderBlock(undefined, "x"), null);
});

test("renderBlock shows block errors for invalid json", () => {
  assert.match(renderBlock("slides", "{nope"), /class="quiz-error"/);
});

test("deferred video emits a slot (no iframe) so DOMPurify cannot strip it", () => {
  const url = "https://www.youtube.com/embed/abc";
  const html = renderBlock("video", JSON.stringify({ title: "Aula", url }), { defer: true });
  assert.doesNotMatch(html, /<iframe/);
  assert.match(html, new RegExp(`data-embed-src="${url}"`));
  assert.match(html, /data-embed-title="Aula"/);
});

test("deferred video with a null or foreign url keeps the placeholder", () => {
  for (const url of [null, "http://www.youtube.com/embed/x", "https://evil.com/embed/x", "javascript:alert(1)"]) {
    const html = renderBlock("video", JSON.stringify({ title: "Aula", url }), { defer: true });
    assert.doesNotMatch(html, /data-embed-src/, String(url));
    assert.match(html, /video-placeholder/, String(url));
  }
});

test("isAllowedEmbed accepts only the three embed hosts", () => {
  assert.strictEqual(isAllowedEmbed("https://www.youtube.com/embed/x"), true);
  assert.strictEqual(isAllowedEmbed("https://player.vimeo.com/video/1"), true);
  assert.strictEqual(isAllowedEmbed("https://www.youtube.com.evil.com/embed/x"), false);
  assert.strictEqual(isAllowedEmbed(""), false);
  assert.strictEqual(isAllowedEmbed(null), false);
});

// ---- bloco "codigo": código em C + animação ----
const { highlightC } = require("../js/renderer.js");
const codigoBloco = (extra = {}) => JSON.stringify({
  title: "Soma", code: "int a = 1;\nint b = a + 2; // soma",
  steps: [
    { line: 1, caption: "Cria `a`.", vars: { a: 1 }, rows: [[{ s: 0, n: 2, i: [3, [1, "p"]], l: "v", a: 1 }]] },
    { line: 2, caption: "Cria b.", rows: [[[5, 4]]] },
  ], ...extra,
});

test("codigo block renders code lines, one panel per step and the first line highlighted", () => {
  const html = renderBlock("codigo", codigoBloco());
  assert.match(html, /data-kind="codigo" data-count="2"/);
  assert.strictEqual((html.match(/class="cline/g) || []).length, 2);
  assert.match(html, /class="cline on"><span class="ln">1<\/span>/);
  assert.strictEqual((html.match(/class="stepper-panel cv-panel"/g) || []).length, 2);
  assert.match(html, /data-line="2"/);
  assert.match(html, /class="sp c3 f3"/);          // 3 -> cor 3
  assert.match(html, /class="sp c1 f1 pick"/);    // item marcado
  assert.match(html, /<code>a<\/code>/);           // `a` na legenda
  assert.match(html, /<em>a<\/em> = 1/);           // variável
  assert.match(html, /data-stepper="play"/);
});

test("codigo block rejects broken json, missing steps and lines outside the code", () => {
  assert.match(renderBlock("codigo", "{nope"), /quiz-error/);
  assert.match(renderBlock("codigo", JSON.stringify({ code: "x", steps: [] })), /quiz-error/);
  assert.match(renderBlock("codigo", codigoBloco({ steps: [{ line: 9, caption: "c" }] })), /não existe no código/);
});

test("codigo block escapes html coming from the data", () => {
  const html = renderBlock("codigo", JSON.stringify({ title: "<b>t</b>", code: "a < b;", steps: [{ line: 1, caption: "<img src=x>", vars: { "<i>": "<u>" }, rows: [[{ i: [1], l: "<s>" }]] }] }));
  assert.doesNotMatch(html, /<(img|u>|s>|i>)|<b>t/);
  assert.match(html, /&lt;img src=x&gt;/);
});

test("highlightC colors C tokens, escapes html and keeps one entry per line", () => {
  const lines = highlightC('#include <stdio.h>\nint main(void) { return 0; } /* a\nb */');
  assert.strictEqual(lines.length, 3);
  assert.match(lines[0], /tk-p">#include<\/span>/);
  assert.match(lines[1], /tk-t">int<\/span> <span class="tk-f">main/);
  assert.match(lines[1], /tk-k">return<\/span> <span class="tk-n">0/);
  assert.match(lines[1], /tk-c">\/\* a<\/span>/);
  assert.match(lines[2], /tk-c">b \*\/<\/span>/);
  assert.match(highlightC("a < b")[0], /a &lt; b/);
});

test("codigo sprites accept letters and an explicit color", () => {
  const html = renderBlock("codigo", JSON.stringify({
    code: "x", steps: [{ line: 1, caption: "c", rows: [[{ i: ["a", ["B", "c"], [100, "", 2], 7] }]] }],
  }));
  assert.match(html, /<span class="sp c1 f1"><b>a<\/b>/);          // 'a' = 97 -> 97 % 12 = 1
  assert.match(html, /<span class="sp c6 f2 cmp"><b>B<\/b>/);       // 'B' = 66 -> 66 % 12 = 6
  assert.match(html, /<span class="sp c2 f2"><b>100<\/b>/);         // cor explícita 2
  assert.match(html, /<span class="sp c7 f3"><b>7<\/b>/);
});

test("codigo sprites accept the ghost flag for empty slots", () => {
  const html = renderBlock("codigo", JSON.stringify({ code: "x", steps: [{ line: 1, caption: "c", rows: [[{ i: [["·", "g", 0]] }]] }] }));
  assert.match(html, /class="sp c0 f0 ghost"/);
});

test("codigo sprites with long labels get wider, short ones do not", () => {
  const html = renderBlock("codigo", JSON.stringify({ code: "x", steps: [{ line: 1, caption: "c", rows: [[{ i: ["Ana", "Sistemas", 60] }]] }] }));
  assert.match(html, /<span class="sp c\d+ f\d+ wide" style="--len:8"><b>Sistemas<\/b>/);
  assert.doesNotMatch(html, /wide[^>]*><b>Ana</);
  assert.doesNotMatch(html, /wide[^>]*><b>60</);
});

test("carrossel renders one panel per image with prev disabled", () => {
  const html = renderMarkdown(fence("carrossel", { title: "C", images: [{ src: "img/a.png", alt: "A" }, { src: "img/b.png" }] }));
  assert.match(html, /data-kind="carrossel" data-count="2"/);
  assert.match(html, /<img class="carrossel-img" src="img\/a.png" alt="A"/);
  assert.match(html, /data-stepper="prev" disabled/);
  assert.doesNotMatch(html, /data-stepper="next" disabled/);
});

test("carrossel rejects javascript:, data: and empty sources", () => {
  for (const src of ["javascript:alert(1)", "data:image/png;base64,AAAA", "", "http://x.org/a.png"]) {
    const html = renderMarkdown(fence("carrossel", { images: [{ src }] }));
    assert.match(html, /class="quiz-error"/, src);
  }
});

test("carrossel escapes attribute text and rejects an empty list", () => {
  const html = renderMarkdown(fence("carrossel", { title: '<b>"x"', images: [{ src: 'a"><script>.png', alt: "<i>" }] }));
  assert.doesNotMatch(html, /<script>|<i>|<b>/);
  assert.match(renderMarkdown(fence("carrossel", { images: [] })), /pelo menos uma/);
});

// ---- bloco "roteamento": Trie binária interativa ----
test("roteamento block draws the trie nodes, the missing children and the route table", () => {
  const html = renderBlock("roteamento", JSON.stringify({
    title: "Rotas", bits: 3, endereco: "101",
    rotas: [{ prefixo: "", saida: "A" }, { prefixo: "10", saida: "<b>C</b>" }],
  }));
  assert.match(html, /data-kind="roteamento"/);
  for (const p of ["", "1", "10"]) assert.match(html, new RegExp('class="rt-node[^"]*" data-p="' + p + '"'));
  assert.match(html, /class="rt-node rt-ghost" data-p="0"/);     // filho 0 da raiz não existe
  assert.match(html, /class="rt-node rt-ghost" data-p="101"/);
  assert.strictEqual((html.match(/class="rt-bit"/g) || []).length, 3);
  assert.match(html, /<tr data-p="10" data-s="&lt;b&gt;C&lt;\/b&gt;">/);
  assert.doesNotMatch(html, /<b>C<\/b>/);
});

test("roteamento block rejects invalid prefixes", () => {
  assert.match(renderBlock("roteamento", "{nope"), /quiz-error/);
  assert.match(renderBlock("roteamento", JSON.stringify({ rotas: [{ prefixo: "12", saida: "A" }] })), /quiz-error/);
  assert.match(renderBlock("roteamento", JSON.stringify({ bits: 2, rotas: [{ prefixo: "101", saida: "A" }] })), /quiz-error/);
});

test("roteamento block in construction mode starts with only the root visible and keeps the table order", () => {
  const html = renderBlock("roteamento", JSON.stringify({
    modo: "construcao", bits: 3,
    rotas: [{ prefixo: "10", saida: "C" }, { prefixo: "", saida: "A" }],
  }));
  assert.match(html, /class="roteamento rt-build"/);
  assert.match(html, /class="rt-node" data-p=""/);                       // raiz visível
  assert.match(html, /class="rt-node rt-hidden" data-p="10" data-s="C"/); // aparece depois
  assert.doesNotMatch(html, /rt-ghost/);
  assert.doesNotMatch(html, /class="rt-bit"/);                            // sem botões de endereço
  assert.ok(html.indexOf('data-p="10" data-s="C"><td>') < html.indexOf('<tr data-p="" '), "tabela na ordem de inserção");
});

// ---- bloco "patricia": construção sem código ----
test("patricia block lists the keys in insertion order and starts with an empty tree", () => {
  const html = renderBlock("patricia", JSON.stringify({
    title: "Índice", bits: 5,
    chaves: [{ nome: "notas.txt", bits: "01101" }, { nome: "<b>x</b>", bits: "10010" }],
  }));
  assert.match(html, /data-kind="patricia" data-bits="5"/);
  assert.match(html, /class="roteamento rt-build pt"/);
  assert.match(html, /árvore vazia/);
  assert.ok(html.indexOf('data-bits="01101"') < html.indexOf('data-bits="10010"'));
  assert.doesNotMatch(html, /<b>x<\/b>/);
});

test("patricia block rejects keys with the wrong number of bits", () => {
  assert.match(renderBlock("patricia", "{nope"), /quiz-error/);
  assert.match(renderBlock("patricia", JSON.stringify({ bits: 5, chaves: [{ nome: "a", bits: "0101" }] })), /quiz-error/);
  assert.match(renderBlock("patricia", JSON.stringify({ bits: 5, chaves: [{ nome: "", bits: "01010" }] })), /quiz-error/);
});
