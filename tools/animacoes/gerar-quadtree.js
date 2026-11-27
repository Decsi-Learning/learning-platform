// Gera os três blocos "codigo" da QuadTree (inserção, busca de ponto e consulta de região). Uso: node tools/animacoes/gerar-quadtree.js
// Precisa de gcc. Cada programa roda duas vezes: com rastro (para os quadros) e com -DSEM_RASTRO, que é
// exatamente o código da aula; as duas execuções precisam imprimir o mesmo.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { extrairCodigo, conferirQuadros, gravarBloco } = require("./lib.js");
const { it } = require("./texto.js");

const DIR = __dirname;
const TMP = path.join(DIR, "tmp");
fs.mkdirSync(TMP, { recursive: true });

function rodar(nomeC, extra) {
  const exe = path.join(TMP, nomeC.replace(/\.c$/, "") + (extra.length ? "-limpo" : "") + ".exe");
  execFileSync("gcc", ["-Wall", "-Wextra", "-I", DIR, ...extra, "-o", exe, path.join(DIR, nomeC)], { stdio: "inherit" });
  const saida = execFileSync(exe, [], { encoding: "utf8", cwd: TMP }).replace(/\r/g, "");
  fs.rmSync(exe, { force: true });
  return saida;
}

// ---- leitura do rastro: "tag k=v ... $ponto=A # @0:0:0:8:0:-:1 @1:0:4:4:1:C:0 ..." ----
function lerArvore(tokens) {
  const pilha = [];
  let raiz = null;
  for (const t of tokens) {
    const [d, x0, y0, lado, folha, ponto, marca] = t.slice(1).split(":");
    const no = { prof: Number(d), x0: Number(x0), y0: Number(y0), lado: Number(lado), folha: folha === "1", ponto: ponto === "-" ? null : ponto, marca: Number(marca), filhos: [] };
    if (no.prof === 0) raiz = no; else pilha[no.prof - 1].filhos.push(no);
    pilha[no.prof] = no;
  }
  return raiz;
}

function lerRastro(bruto, tagLinha) {
  const eventos = [];
  const impresso = [];
  for (const linha of bruto.split("\n")) {
    const partes = linha.trim().split(" ");
    if (!(partes[0] in tagLinha)) { impresso.push(linha); continue; }
    const ev = { tag: partes[0], vars: {}, ponto: "-" };
    let i = 1;
    for (; i < partes.length && partes[i] !== "#"; i++) {
      const p = partes[i], eq = p.indexOf("=");
      if (p.startsWith("$")) ev[p.slice(1, eq)] = p.slice(eq + 1);
      else ev.vars[p.slice(0, eq)] = Number(p.slice(eq + 1));
    }
    ev.arvore = lerArvore(partes.slice(i + 1));
    eventos.push(ev);
  }
  return { eventos, impresso: impresso.join("\n").trim() };
}

// ---- desenho: cada nível da árvore é uma linha; cada folha ocupa uma coluna; a última linha lista os pontos ----
const nos = (raiz) => { const l = []; const v = (n) => { l.push(n); n.filhos.forEach(v); }; if (raiz) v(raiz); return l; };
const QUAD = ["NO", "NE", "SO", "SE"];
const corPonto = (p) => (p.charCodeAt(0) - 65) * 2 % 12 + 1;
const reg = (x0, y0, lado) => `x de ${x0} a ${x0 + lado - 1}, y de ${y0} a ${y0 + lado - 1}`;
const regNo = (n) => reg(n.x0, n.y0, n.lado);

function posicionar(raiz) {
  let folhas = 0;
  const pos = (n, pai, q) => {
    n.pai = pai; n.quad = q;
    if (n.folha) { n.s = folhas++; n.n = 1; return; }
    n.filhos.forEach((f, i) => pos(f, n, i));
    n.s = n.filhos[0].s; n.n = n.filhos[3].s + n.filhos[3].n - n.s;
  };
  pos(raiz, null, -1);
  return folhas;
}

function quadrosDe(eventos, { legenda, pilha, pontos, flagPonto, colunas, linhasArvore }) {
  return eventos.map((ev, k) => {
    const lista = nos(ev.arvore);
    const largura = posicionar(ev.arvore);
    const desloc = Math.floor((colunas - largura) / 2);
    const foco = lista.find((n) => n.marca === 1) || null;
    const niveis = Array.from({ length: linhasArvore }, () => []);
    for (const n of lista) {
      const flag = n.marca === 2 || n.marca === 4 ? "p" : n.marca === 3 ? "g" : "";
      const sprite = n.folha ? (n.ponto ? it(n.ponto, flag, corPonto(n.ponto)) : it("·", "g", 0)) : it("+", flag, 6);
      niveis[n.prof].push({ s: desloc + n.s, n: n.n, i: [sprite], l: n.pai ? QUAD[n.quad] : "raiz", ...(n === foco ? { a: 1 } : {}) });
    }
    const linhaPontos = [{ i: pontos.map((p) => it(p.nome, flagPonto(ev, p, k), corPonto(p.nome))), l: "pontos: " + pontos.map((p) => `${p.nome}(${p.x},${p.y})`).join(" ") }];
    const ctx = { ev, foco, lista, k, anterior: eventos[k - 1] };
    const vars = {};
    if (foco) vars.no = `${foco.pai ? QUAD[foco.quad] : "raiz"} (lado ${foco.lado})`;
    for (const [nome, v] of Object.entries(ev.vars)) if (!/^no->/.test(nome)) vars[nome.replace("p->", "p.")] = v;
    return { line: ev.linha, caption: legenda(ctx), vars, rows: [...niveis, linhaPontos], stack: pilha(ctx) };
  });
}

function programa(nomeC, saida) {
  const fonte = fs.readFileSync(path.join(DIR, nomeC), "utf8");
  const { codigo, tagLinha } = extrairCodigo(fonte);
  const bruto = rodar(nomeC, []);
  const limpo = rodar(nomeC, ["-DSEM_RASTRO"]).trim();
  const { eventos, impresso } = lerRastro(bruto, tagLinha);
  if (impresso !== limpo) throw new Error(`${nomeC}: o código da aula imprime algo diferente da versão rastreada`);
  if (limpo !== saida) throw new Error(`${nomeC}: saída inesperada: ${limpo}`);
  for (const ev of eventos) ev.linha = tagLinha[ev.tag];
  return { codigo, eventos, fonte };
}

const normaliza = (s) => s.replace(/\r/g, "").replace(/\n{2,}/g, "\n\n").trim();
function definicoesOcultas(fonte) {
  const m = fonte.replace(/\r/g, "").match(/\/\/---OCULTO---\n([\s\S]*?)#include "quad-rastro\.h"/);
  return normaliza(m[1]);
}
// as definições escondidas nos programas 2 e 3 são o primeiro programa sem o main
const semMain = (codigo) => normaliza(codigo.split("int main")[0]);

const LINHAS = 3;     // raiz, nível 1 e nível 2
const COLUNAS = 7;    // 7 folhas no fim da inserção

// ---- 1. inserção ----
const ins = programa("quad-inserir.c", "");
const PONTOS = [...ins.codigo.matchAll(/\{(\d+), (\d+), '([A-Z])'\}/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), nome: m[3] }));
const P = Object.fromEntries(PONTOS.map((p) => [p.nome, p]));
const nomeP = (n) => `${n} = (${P[n].x}, ${P[n].y})`;
// pilha de chamadas de inserir: cada divisão faz duas chamadas recursivas
const pilhaIns = [];
let frames = [];
for (const ev of ins.eventos) {
  if (ev.tag === "inicio") frames.push({ restantes: 0 });
  ev.profundidade = frames.length;
  if (ev.tag === "divide") frames[frames.length - 1].restantes = 2;
  if (ev.tag === "guarda") {
    frames.pop();
    while (frames.length && frames[frames.length - 1].restantes > 0) {
      const topo = frames[frames.length - 1];
      topo.restantes--;
      if (topo.restantes > 0) break;
      frames.pop();
    }
  }
  pilhaIns.push(ev.profundidade);
}
const inseridos = new Set();
const quadrosIns = quadrosDe(ins.eventos, {
  colunas: COLUNAS, linhasArvore: LINHAS, pontos: PONTOS,
  flagPonto: (ev, p) => (ev.tag === "guarda" && ev.ponto === p.nome && inseridos.add(p.nome), p.nome === ev.ponto && ev.tag !== "guarda" ? "c" : inseridos.has(p.nome) || (ev.tag === "guarda" && ev.ponto === p.nome) ? "" : "g"),
  pilha: ({ ev }) => (ev.profundidade ? Array(ev.profundidade).fill("inserir").join(" ← ") + " ← main" : "main"),
  legenda: ({ ev, foco, lista, anterior }) => {
    const v = ev.vars;
    switch (ev.tag) {
      case "raiz": return "A raiz cobre o quadrado inteiro: " + regNo(foco) + ". Ela começa como uma **folha vazia**.";
      case "inicio":
        if (anterior && anterior.tag === "divide") return `Primeiro, ${nomeP(ev.ponto)}, que estava na folha, é **reinserido** a partir do nó que acabou de ser dividido.`;
        if (ev.profundidade > 1 && anterior && anterior.tag === "guarda") return `Agora a inserção de ${nomeP(ev.ponto)} recomeça a partir do mesmo nó dividido.`;
        return `Inserindo ${nomeP(ev.ponto)}. Começamos pela raiz.`;
      case "desce": {
        const pai = foco.pai, m = pai.lado / 2;
        return `(${v["p->x"]}, ${v["p->y"]}) fica no quadrante **${QUAD[v.q]}**: x ${v["p->x"] >= pai.x0 + m ? "≥" : "<"} ${pai.x0 + m} e y ${v["p->y"] >= pai.y0 + m ? "≥" : "<"} ${pai.y0 + m}. Descemos para ele, que cobre ${regNo(foco)}.`;
      }
      case "folha": return foco.ponto ? `Chegamos a uma folha que **já guarda** ${nomeP(foco.ponto)}.` : "Chegamos a uma **folha vazia**.";
      case "guarda": return `${ev.ponto} fica guardado nesta folha.` + (lista.filter((n) => n.ponto).length === PONTOS.length ? "" : "");
      case "divide": return `Cada folha guarda no máximo um ponto, então a folha é **dividida** em 4 quadrantes de lado ${v["no->lado"] / 2} (os nós novos). O ponto que estava nela, (${v["antigo->x"]}, ${v["antigo->y"]}), e o ponto novo serão inseridos de novo a partir daqui.`;
      case "pronto": {
        const folhas = lista.filter((n) => n.folha);
        return `Pronto: ${PONTOS.length} pontos em ${lista.length} nós, sendo ${folhas.length} folhas (${folhas.filter((n) => !n.ponto).length} vazias). Só o quadrante NO, onde C e D estão próximos, precisou ser dividido de novo.`;
      }
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

// ---- 2. busca ----
const bus = programa("quad-buscar.c", "1\n0\n0");
if (definicoesOcultas(bus.fonte) !== semMain(ins.codigo)) throw new Error("quad-buscar.c: as definições ocultas não são iguais às do primeiro programa");
const quadrosBus = quadrosDe(bus.eventos, {
  colunas: COLUNAS, linhasArvore: LINHAS, pontos: PONTOS,
  flagPonto: () => "",
  pilha: ({ ev }) => (ev.tag === "arvore" ? "main" : "buscar ← main"),
  legenda: ({ ev, foco }) => {
    const v = ev.vars;
    switch (ev.tag) {
      case "arvore": return "A árvore já guarda os 5 pontos. Vamos buscar (3, 7), (3, 6) e (7, 2).";
      case "inicio": return `Buscando (${v.x}, ${v.y}). A busca desce pela árvore como a inserção, sem dividir nada.`;
      case "desce": {
        const pai = foco.pai, m = pai.lado / 2;
        return `(${v.x}, ${v.y}) fica no quadrante **${QUAD[v.q]}** (x ${v.x >= pai.x0 + m ? "≥" : "<"} ${pai.x0 + m}, y ${v.y >= pai.y0 + m ? "≥" : "<"} ${pai.y0 + m}), que cobre ${regNo(foco)}.`;
      }
      case "folha": {
        const p = foco.ponto && P[foco.ponto];
        if (p && p.x === v.x && p.y === v.y) return `A folha guarda ${nomeP(foco.ponto)}, que é o ponto procurado: \`buscar\` devolve **1**.`;
        if (p) return `A folha guarda ${nomeP(foco.ponto)}, outro ponto da mesma região. As coordenadas não batem: \`buscar\` devolve **0**.`;
        return "A folha está vazia: `buscar` devolve **0**.";
      }
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

// ---- 3. consulta de região ----
const con = programa("quad-consultar.c", "2");
if (definicoesOcultas(con.fonte) !== semMain(ins.codigo)) throw new Error("quad-consultar.c: as definições ocultas não são iguais às do primeiro programa");
const [, AX, AY, BX, BY] = con.codigo.match(/contar\(raiz, (\d+), (\d+), (\d+), (\d+)\)/).map(Number);
const dentroRet = (p) => p.x >= AX && p.x <= BX && p.y >= AY && p.y <= BY;
const RET = `x de ${AX} a ${BX}, y de ${AY} a ${BY}`;
const contados = new Set();
const quadrosCon = quadrosDe(con.eventos, {
  colunas: COLUNAS, linhasArvore: LINHAS, pontos: PONTOS,
  flagPonto: (ev, p) => {
    if (ev.tag === "folha") { const f = nos(ev.arvore).find((n) => n.marca === 1); if (f && f.ponto === p.nome && dentroRet(p)) contados.add(p.nome); }
    return contados.has(p.nome) ? "p" : "";
  },
  pilha: ({ ev, foco }) => (foco && ev.tag !== "pronto" ? Array(foco.prof + 1).fill("contar").join(" ← ") + " ← main" : "main"),
  legenda: ({ ev, foco }) => {
    const v = ev.vars;
    switch (ev.tag) {
      case "arvore": return `Vamos contar os pontos do retângulo ${RET}, o canto de cima, à esquerda.`;
      case "entra": return `\`contar\` chega ao nó ${foco.pai ? QUAD[foco.quad] : "raiz"}, que cobre ${regNo(foco)}. A região encosta no retângulo?`;
      case "fora": return `Não encosta: a região fica fora de ${RET}. O nó é **descartado inteiro**, com tudo o que está abaixo dele.`;
      case "folha": {
        const p = foco.ponto && P[foco.ponto];
        if (p && dentroRet(p)) return `É uma folha com ${nomeP(foco.ponto)}, que está dentro do retângulo: conta **1**.`;
        if (p) return `É uma folha com ${nomeP(foco.ponto)}, mas o ponto está fora do retângulo: conta 0.`;
        return "A região encosta no retângulo, mas a folha está vazia: conta 0.";
      }
      case "volta": return `De volta ao nó ${foco.pai ? QUAD[foco.quad] : "raiz"}: os quatro filhos somam **${v.total}**.`;
      case "pronto": return `Resultado: **${v.n}** pontos no retângulo (C e D). Três quadrantes da raiz foram descartados sem olhar nenhum ponto deles.`;
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

for (const [nomeBloco, titulo, codigo, quadros] of [
  ["quad-inserir", "Inserindo A, B, C, D e E na QuadTree", ins.codigo, quadrosIns],
  ["quad-buscar", "Buscando (3, 7), (3, 6) e (7, 2) na QuadTree", bus.codigo, quadrosBus],
  ["quad-consultar", `Contando os pontos do retângulo ${RET}`, con.codigo, quadrosCon],
]) {
  conferirQuadros(quadros);
  gravarBloco(DIR, nomeBloco, { title: titulo, cols: COLUNAS, code: codigo, steps: quadros });
}
