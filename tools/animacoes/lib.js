// Ferramentas comuns para gerar as animações "código + o que acontece".
// Ideia: o código C mostrado na aula é EXATAMENTE o do arquivo .c (menos as linhas T(...) do rastreador).
// Os passos da animação vêm de uma execução real: compila com gcc, roda e lê o rastro que as linhas T(...) imprimem.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const MARCA = "//---MOSTRAR---";

// Separa o código mostrado na aula e descobre em qual linha dele cada T("tag") aponta (a próxima linha visível).
function extrairCodigo(fonte) {
  const depois = fonte.split(MARCA)[1];
  if (depois === undefined) throw new Error("falta a marca " + MARCA);
  const linhas = depois.replace(/\r/g, "").replace(/^\n/, "").split("\n");
  const mostrado = [];
  const tagLinha = {};
  let pendentes = [];
  let oculto = false;
  for (const l of linhas) {
    // trechos escondidos da aula: entre //---OCULTO--- e //---FIM-OCULTO---, e linhas H(...)
    if (/^\s*\/\/---OCULTO---/.test(l)) { oculto = true; continue; }
    if (/^\s*\/\/---FIM-OCULTO---/.test(l)) { oculto = false; continue; }
    if (oculto || /^\s*H\(/.test(l)) continue;
    const m = l.match(/^\s*T\(\s*"([^"]+)"/);
    if (m) { if (tagLinha[m[1]] !== undefined || pendentes.includes(m[1])) throw new Error("tag repetida: " + m[1]); pendentes.push(m[1]); continue; }
    mostrado.push(l);
    if (l.trim() !== "") { for (const t of pendentes) tagLinha[t] = mostrado.length; pendentes = []; }
  }
  while (mostrado.length && mostrado[mostrado.length - 1].trim() === "") mostrado.pop();
  if (pendentes.length) throw new Error("T() sem linha depois: " + pendentes.join(","));
  return { codigo: mostrado.join("\n"), tagLinha };
}

// cwd: pasta onde o programa roda (útil quando ele cria arquivos).
function compilar(arquivo, saida, cwd) {
  execFileSync("gcc", ["-Wall", "-Wextra", "-o", saida, arquivo], { stdio: "inherit" });
  return execFileSync(saida, [], { encoding: "utf8", cwd });
}

// Cada linha do rastro: "tag nome=valor ... | v: a b c | aux: x y z"
function lerRastro(texto) {
  const eventos = [];
  for (const linha of texto.split(/\r?\n/)) {
    if (!linha.includes(" | v:")) continue;
    const [cab, v, aux] = linha.split(" | ");
    const partes = cab.trim().split(/\s+/);
    const vars = {};
    for (const p of partes.slice(1)) { const [n, x] = p.split("="); vars[n] = Number(x); }
    const nums = (s) => s.replace(/^\w+:/, "").trim().split(/\s+/).map(Number);
    eventos.push({ tag: partes[0], vars, v: nums(v), aux: nums(aux) });
  }
  return eventos;
}

// Verifica que o código mostrado (sem T) compila sozinho e imprime a mesma coisa que a versão rastreada.
function conferirCodigoLimpo(codigo, dir, saidaEsperada, cwd) {
  const c = path.join(dir, "_limpo.c");
  fs.writeFileSync(c, codigo + "\n");
  const exe = path.join(dir, "_limpo.exe");
  execFileSync("gcc", ["-Wall", "-Wextra", "-o", exe, c], { stdio: "inherit" });
  const saida = execFileSync(exe, [], { encoding: "utf8", cwd });
  fs.rmSync(c); fs.rmSync(exe);
  const semCR = (s) => s.split(String.fromCharCode(13)).join("").trim();
  if (semCR(saida) !== semCR(saidaEsperada)) throw new Error("o código mostrado imprime algo diferente: " + saida);
  return saida;
}

module.exports = { extrairCodigo, compilar, lerRastro, conferirCodigoLimpo };

// Rastro geral: cada linha é "tag nome=int ... @lista=1,2,3 ...". Só vale a linha cuja tag existe no código.
function lerEventos(texto, tagLinha) {
  const lista = (s) => (s === "" ? [] : s.split(",").map(Number));
  const eventos = [];
  for (const linha of texto.split(/\r?\n/)) {
    const [tag, ...resto] = linha.trim().split(" ");
    if (!(tag in tagLinha)) continue;
    const ev = { tag, vars: {}, arr: {} };
    for (const p of resto) {
      const i = p.indexOf("=");
      const nome = p.slice(0, i), valor = p.slice(i + 1);
      if (nome.startsWith("@")) ev.arr[nome.slice(1)] = lista(valor); else ev.vars[nome] = Number(valor);
    }
    eventos.push(ev);
  }
  return eventos;
}

// Compila e roda a versão rastreada; depois confere que o código mostrado (sem T) imprime o mesmo.
function executarEConferir(nomeC, dir) {
  const fonte = fs.readFileSync(path.join(dir, nomeC), "utf8");
  const { codigo, tagLinha } = extrairCodigo(fonte);
  const trabalho = path.join(dir, "tmp");
  fs.mkdirSync(trabalho, { recursive: true });
  const exe = path.join(trabalho, nomeC.replace(/\.c$/, ".exe"));
  const bruto = compilar(path.join(dir, nomeC), exe, trabalho);
  fs.rmSync(exe, { force: true });
  const impresso = bruto.split(/\r?\n/).filter((l) => !(l.trim().split(" ")[0] in tagLinha)).join("\n");
  conferirCodigoLimpo(codigo, trabalho, impresso, trabalho);
  return { codigo, tagLinha, bruto, impresso };
}

// Confere o que todo quadro precisa ter e, nas linhas com grupos posicionados (s, n), que nada transborda nem se sobrepõe.
function conferirQuadros(quadros) {
  quadros.forEach((q, qi) => {
    if (!q.line) throw new Error(`quadro ${qi}: sem linha de código`);
    if (!q.caption) throw new Error(`quadro ${qi}: sem legenda`);
    for (const row of q.rows || []) {
      const gs = row.filter((x) => x.s !== undefined);
      for (const x of gs) if (x.i.length > x.n) throw new Error(`quadro ${qi}: grupo "${x.l}" com ${x.i.length} itens em espaço ${x.n}`);
      for (let p = 0; p < gs.length; p++) for (let r = p + 1; r < gs.length; r++) {
        if (gs[p].s < gs[r].s + gs[r].n && gs[r].s < gs[p].s + gs[p].n) throw new Error(`quadro ${qi}: grupos sobrepostos`);
      }
    }
  });
}

function gravarBloco(dir, nome, bloco) {
  fs.mkdirSync(path.join(dir, "saida"), { recursive: true });
  fs.writeFileSync(path.join(dir, "saida", nome + ".json"), JSON.stringify(bloco));
  console.log(`${nome}: quadros ${bloco.steps.length} | linhas de código ${bloco.code.split("\n").length} | bytes ${JSON.stringify(bloco).length}`);
}

module.exports.lerEventos = lerEventos;
module.exports.executarEConferir = executarEConferir;
module.exports.conferirQuadros = conferirQuadros;
module.exports.gravarBloco = gravarBloco;
