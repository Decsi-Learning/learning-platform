// Gera o bloco "codigo" da leitura com separadores. Uso: node gerar-separadores.js
const { executarEConferir, lerEventos, conferirQuadros, gravarBloco } = require("./lib.js");
const { it } = require("./texto.js");

const { codigo, tagLinha, bruto, impresso } = executarEConferir("separadores.c", __dirname);
if (impresso.replace(/\r/g, "").trim() !== "campo 0: Ana\ncampo 1: TI\ncampo 2: BH") throw new Error("resultado inesperado: " + impresso);
const REG = codigo.match(/fputs\("([^"]+)"/)[1];
const eventos = lerEventos(bruto, tagLinha);

const cor = (ch) => (ch === ";" ? 7 : ch === "#" ? 1 : ch.charCodeAt(0) % 12);
const NOMES = ["nome", "curso", "cidade"];
const quadros = [];
let pos = -1, atual = [], prontos = [];
for (const ev of eventos) {
  const t = ev.tag, v = ev.vars;
  const ch = v.byte !== undefined ? String.fromCharCode(v.byte) : "";
  if (t === "le") pos++;
  const bytes = [...REG].map((c, i) => it(c, i === pos && t !== "fim" ? (t === "junta" ? "p" : "c") : "", cor(c)));
  const campoAtual = atual.map((c) => it(c, "", cor(c)));
  let caption = "";
  if (t === "le") caption = `Lemos o byte da posição ${pos}: '${ch}'. Agora o programa olha: esse byte é um separador (';' ou '#')?`;
  if (t === "junta") { campoAtual.push(it(ch, "p", cor(ch))); caption = `'${ch}' não é separador, então é parte do campo. Colocamos a letra no campo que está sendo montado.`; }
  if (t === "fimCampo") {
    caption = ch === ";" ? `É o separador ';': o campo acabou. O campo ${v.n + 1} (${NOMES[v.n]}) ficou "${atual.join("")}".` : `É o '#': além de terminar o campo, ele termina o registro. O último campo (${NOMES[v.n]}) ficou "${atual.join("")}".`;
    campoAtual.forEach((x, i) => (campoAtual[i] = it(atual[i], "p", cor(atual[i]))));
  }
  if (t === "fimRegistro") caption = `O '#' termina o registro. Lemos ${v.n} campos. O laço para.`;
  if (t === "fim") caption = `Pronto: ${v.n} campos lidos (${prontos.map((p) => '"' + p + '"').join(", ")}). Repare que precisamos olhar TODOS os bytes, um por um, para achar os separadores.`;
  const rows = [[{ s: 0, n: REG.length, i: bytes, l: "bytes do arquivo" }]];
  rows.push([{ i: campoAtual, l: "campo que está sendo montado" }]);
  rows.push([{ i: prontos.map((p) => it(p, "", p.charCodeAt(0) % 12)), l: "campos prontos" }]);
  const vars = {};
  if (v.n !== undefined) vars.n = v.n;
  if (v.tam !== undefined) vars.tam = v.tam;
  quadros.push({ line: tagLinha[t], caption, vars, rows, stack: t === "fim" ? "main" : "lerRegistro ← main" });
  if (t === "junta") atual.push(ch);
  if (t === "fimCampo") { prontos.push(atual.join("")); atual = []; }
}
conferirQuadros(quadros);
gravarBloco(__dirname, "separadores", { title: "Lendo um registro com separadores passo a passo", code: codigo, steps: quadros });
