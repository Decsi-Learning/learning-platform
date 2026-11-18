// Gera o bloco "codigo" do arquivo misto (código do tipo de registro). Uso: node gerar-misto.js
const { executarEConferir, lerEventos, conferirQuadros, gravarBloco } = require("./lib.js");
const { it } = require("./texto.js");

const { codigo, tagLinha, bruto, impresso } = executarEConferir("misto.c", __dirname);
const esperado = "aluno: nome = Ana, curso = Sistemas\ndisciplina: nome = AEDS2, carga = 60 horas\naluno: nome = Bruno, curso = Civil\ndisciplina: nome = BD, carga = 45 horas\ntipo desconhecido: X";
if (impresso.replace(/\r/g, "").trim() !== esperado) throw new Error("resultado inesperado: " + impresso);
const linhas = [...codigo.matchAll(/fputs\("([^"]+?)\\n"/g)].map((m) => m[1]);
const eventos = lerEventos(bruto, tagLinha);
const CORES = { A: 6, D: 2, X: 0 };
const NOMES = { A: "aluno", D: "disciplina" };

const quadros = [];
let n = -1;
for (const ev of eventos) {
  const t = ev.tag, v = ev.vars;
  if (v.n !== undefined) n = v.n;
  const tipo = v.tipo !== undefined ? String.fromCharCode(v.tipo) : "";
  const reg = linhas.map((l, i) => it(l[0], i === n && t !== "fim" ? (t === "le" ? "c" : "p") : "", CORES[l[0]] ?? 0));
  const lidoGrupo = [];
  let caption = "";
  if (t === "le") caption = `Lemos o registro ${n}. O primeiro caractere é o código do tipo de registro: '${tipo}'. O programa decide o que fazer a partir dele.`;
  if (t === "aluno" || t === "disciplina") {
    const campos = linhas[n].slice(2).split(";");
    const nomesCampos = t === "aluno" ? ["nome", "curso"] : ["nome", "carga"];
    caption = t === "aluno"
      ? `O código 'A' quer dizer aluno. Então os dados são nome e curso, separados por ';'. O sscanf separa os dois campos: nome = ${campos[0]} e curso = ${campos[1]}.`
      : `O código 'D' quer dizer disciplina. Então os dados são nome e carga horária (um número). O sscanf lê nome = ${campos[0]} e carga = ${campos[1]}.`;
    campos.forEach((c, i) => lidoGrupo.push(it(c, "p", (c.charCodeAt(0) + i) % 12)));
    lidoGrupo.label = t === "aluno" ? "campos de um aluno (nome; curso)" : "campos de uma disciplina (nome; carga horária)";
  }
  if (t === "desconhecido") caption = `O código '${tipo}' não está na lista de tipos conhecidos. O programa avisa e continua com o próximo registro.`;
  if (t === "fim") caption = "Fim do arquivo. O mesmo arquivo guardou dois tipos de registro. O código do tipo, no começo de cada um, disse ao programa como interpretar o resto.";
  const rows = [[{ s: 0, n: linhas.length, i: reg, l: "arquivo (A = aluno, D = disciplina)" }]];
  if (lidoGrupo.length) rows.push([{ i: lidoGrupo.slice(), l: lidoGrupo.label }]);
  const vars = {};
  if (v.n !== undefined) vars.n = v.n;
  if (tipo) vars.tipo = `'${tipo}'`;
  quadros.push({ line: tagLinha[t], caption, vars, rows, stack: "lerMisto ← main" });
}
conferirQuadros(quadros);
gravarBloco(__dirname, "misto", { title: "Arquivo misto passo a passo", code: codigo, steps: quadros });
