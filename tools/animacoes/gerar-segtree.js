// Gera os três blocos "codigo" da Segment Tree (construção, consulta e atualização). Uso: node tools/animacoes/gerar-segtree.js
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

// ---- leitura do rastro: "tag no=1 ini=0 ... foco=1 a=-1 b=-1 @v=2,5,1 # 1:0:5:24:1:0 2:0:2:8:1:0 ..." ----
function lerRastro(bruto, tagLinha) {
  const eventos = [];
  const impresso = [];
  for (const linha of bruto.split("\n")) {
    const partes = linha.trim().split(" ");
    if (!(partes[0] in tagLinha)) { impresso.push(linha); continue; }
    const ev = { tag: partes[0], vars: {}, v: [], nos: {} };
    let i = 1;
    for (; i < partes.length && partes[i] !== "#"; i++) {
      const [k, x] = partes[i].split("=");
      if (k === "@v") ev.v = x === "" ? [] : x.split(",").map(Number);
      else ev.vars[k] = Number(x);
    }
    for (const t of partes.slice(i + 1)) {
      const [no, ini, fim, valor, feito, marca] = t.split(":").map(Number);
      ev.nos[no] = { no, ini, fim, valor, feito: feito === 1, marca, prof: Math.floor(Math.log2(no)) };
    }
    ev.foco = ev.vars.foco; ev.a = ev.vars.a; ev.b = ev.vars.b;
    delete ev.vars.foco; delete ev.vars.a; delete ev.vars.b;
    eventos.push(ev);
  }
  return { eventos, impresso: impresso.join("\n").trim() };
}

// ---- desenho: cada linha é um nível da árvore e a última é o vetor. Cada nó ocupa as colunas do trecho que cobre ----
const COLUNAS = 6;
const LINHAS = 4;     // níveis da árvore para n = 6
const trecho = (no) => (no.ini === no.fim ? `${no.ini}` : `${no.ini}–${no.fim}`);
const fatia = (ini, fim) => (ini === fim ? `\`v[${ini}]\`` : `\`v[${ini}..${fim}]\``);
const FLAG = { 1: "c", 2: "p", 3: "g", 4: "p" };

function quadrosDe(eventos, { legenda, pilha, vetor, amarelos }) {
  return eventos.map((ev, n) => {
    const foco = ev.nos[ev.foco] || null;
    const lista = Object.values(ev.nos);
    const valoresVetor = vetor ? vetor(ev) : ev.v;
    const marcados = amarelos(ev, foco);
    const linhaVetor = valoresVetor.map((x, i) => ({ s: i, n: 1, i: [it(String(x), marcados.has(i) ? "c" : "")], l: `v[${i}]` }));
    const niveis = Array.from({ length: LINHAS }, () => []);
    for (const no of lista) {
      const sprite = no.feito ? it(String(no.valor), FLAG[no.marca] || "") : it("?", "g", 0);
      niveis[no.prof].push({ s: no.ini, n: no.fim - no.ini + 1, i: [sprite], l: trecho(no), ...(no === foco ? { a: 1 } : {}) });
    }
    const ctx = { ev, foco, nos: ev.nos, lista, anterior: eventos[n - 1] };
    const vars = {};
    for (const [k, x] of Object.entries(ev.vars)) vars[k] = x;
    if (ev.a >= 0) { vars.a = ev.a; vars.b = ev.b; }
    return { line: ev.linha, caption: legenda(ctx), vars, rows: [...niveis, linhaVetor], stack: pilha(ctx) };
  });
}

function programa(nomeC, opcoes) {
  const fonte = fs.readFileSync(path.join(DIR, nomeC), "utf8");
  const { codigo, tagLinha } = extrairCodigo(fonte);
  const bruto = rodar(nomeC, []);
  const limpo = rodar(nomeC, ["-DSEM_RASTRO"]).trim();
  const { eventos, impresso } = lerRastro(bruto, tagLinha);
  if (impresso !== limpo) throw new Error(`${nomeC}: o código da aula imprime algo diferente da versão rastreada`);
  if (limpo !== opcoes.saida) throw new Error(`${nomeC}: saída inesperada: ${limpo}`);
  for (const ev of eventos) ev.linha = tagLinha[ev.tag];
  return { codigo, eventos, fonte };
}

// as definições escondidas nos programas 2 e 3 têm de ser iguais às mostradas no programa 1
const normaliza = (s) => s.replace(/\r/g, "").replace(/\n{2,}/g, "\n\n").trim();
function definicoesOcultas(fonte) {
  const m = fonte.replace(/\r/g, "").match(/\/\/---OCULTO---\n([\s\S]*?)#include "segtree-rastro\.h"/);
  return normaliza(m[1]);
}

const chamadas = (nome) => ({ foco }) => (foco ? Array(foco.prof + 1).fill(nome).join(" ← ") + " ← main" : "main");
const val = (nos, no) => nos[no].valor;

// ---- 1. construção ----
const con = programa("segtree-construir.c", { saida: "24" });
const VETOR = con.codigo.match(/int v\[\] = \{([^}]+)\}/)[1].split(",").map((x) => Number(x));
if (VETOR.length !== COLUNAS) throw new Error("o vetor precisa ter " + COLUNAS + " posições");
const totalNos = Object.keys(con.eventos[con.eventos.length - 1].nos).length;
const quadrosCon = quadrosDe(con.eventos, {
  pilha: chamadas("construir"),
  amarelos: (ev, foco) => new Set(foco ? Array.from({ length: foco.fim - foco.ini + 1 }, (_, i) => foco.ini + i) : []),
  legenda: ({ ev, foco, nos }) => {
    const v = ev.vars;
    switch (ev.tag) {
      case "vetor": return `O vetor \`v\` tem ${VETOR.length} números. Cada nó da Segment Tree vai guardar a **soma de um trecho** do vetor, e o trecho fica embaixo do nó. Os pontos de interrogação são somas que ainda não foram calculadas.`;
      case "entra": return (v.no === 1 ? "`construir` começa pela **raiz** (`no` = 1), que cobre o vetor inteiro, " : `Chegamos ao nó ${v.no}, que cobre `) + fatia(v.ini, v.fim) + " (em amarelo no vetor).";
      case "folha": return `O trecho tem um único elemento: o nó ${v.no} é uma **folha** e guarda \`v[${v.ini}]\` = ${val(nos, v.no)}.`;
      case "meio": return `O trecho tem mais de um elemento. \`meio\` = (${v.ini} + ${v.fim}) / 2 = ${v.meio}: o filho esquerdo (nó ${2 * v.no}) fica com ${fatia(v.ini, v.meio)} e o direito (nó ${2 * v.no + 1}), com ${fatia(v.meio + 1, v.fim)}.`;
      case "soma": return `Os dois filhos estão prontos. O nó ${v.no} guarda a soma deles: ${val(nos, 2 * v.no)} + ${val(nos, 2 * v.no + 1)} = ${val(nos, v.no)}.` + (v.no === 1 ? " Essa é a soma do vetor inteiro." : "");
      case "pronto": return `Pronto: ${totalNos} nós para ${VETOR.length} números. Cada nó interno vale a soma dos dois filhos, e \`arvore[1]\` = ${val(nos, 1)} é a soma de todo o vetor.`;
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

// ---- 2. consulta ----
const bus = programa("segtree-consultar.c", { saida: "19\n8" });
if (definicoesOcultas(bus.fonte) !== normaliza(con.codigo.split("int main")[0])) throw new Error("segtree-consultar.c: as definições ocultas não são iguais às do primeiro programa");
const intervalo = (ev) => fatia(ev.a, ev.b);
const quadrosBus = quadrosDe(bus.eventos, {
  pilha: chamadas("consultar"),
  amarelos: (ev) => new Set(ev.a >= 0 ? Array.from({ length: ev.b - ev.a + 1 }, (_, i) => ev.a + i) : []),
  legenda: ({ ev, nos, lista: todos }) => {
    const v = ev.vars;
    const no = nos[v.no];
    switch (ev.tag) {
      case "arvore": return `A árvore já está montada para v = {${VETOR.join(", ")}}. Vamos pedir a soma de \`v[1..4]\` e, depois, a de \`v[0..2]\`.`;
      case "entra": return v.no === 1
        ? `Consulta de ${intervalo(ev)} (em amarelo no vetor). Começa pela raiz, que cobre ${fatia(no.ini, no.fim)}.`
        : `O nó ${v.no} cobre ${fatia(no.ini, no.fim)}. Como esse trecho se encaixa em ${intervalo(ev)}?`;
      case "fora": return `${fatia(v.ini, v.fim)} não tem nada em comum com ${intervalo(ev)}: o nó está **fora**. Ele devolve 0 e a busca nem desce por ali.`;
      case "dentro": return `${fatia(v.ini, v.fim)} cabe inteiro em ${intervalo(ev)}: o nó está **dentro**. Ele devolve ${no.valor} direto, sem olhar os filhos.`;
      case "parcial": return `Só uma parte de ${fatia(v.ini, v.fim)} está em ${intervalo(ev)}: o nó é **parcial**. Com \`meio\` = ${v.meio}, a pergunta vai para os dois filhos.`;
      case "volta": return `De volta ao nó ${v.no}: o filho esquerdo devolveu ${v.esq} e o direito, ${v.dir}. O nó devolve ${v.esq} + ${v.dir} = ${v.esq + v.dir}.`;
      case "res1":
      case "res2": {
        const usados = todos.filter((x) => x.marca === 2).sort((p, q) => p.ini - q.ini);
        const visitados = todos.filter((x) => x.marca).length;
        return `\`consultar\` devolveu **${v.s}**` + (usados.length > 1 ? ` = ${usados.map((x) => x.valor).join(" + ")}, a soma dos ${usados.length} nós verdes` : `, o valor de um único nó verde, o nó ${usados[0].no}`)
          + `. Foram visitados ${visitados} dos ${todos.length} nós.` + (ev.tag === "res1" ? " Agora, a segunda consulta." : " Os nós cinza foram descartados inteiros, sem descer até as folhas.");
      }
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

// ---- 3. atualização ----
const atu = programa("segtree-atualizar.c", { saida: "29" });
if (definicoesOcultas(atu.fonte) !== normaliza(con.codigo.split("int main")[0])) throw new Error("segtree-atualizar.c: as definições ocultas não são iguais às do primeiro programa");
const [, POS, NOVO] = atu.codigo.match(/atualizar\(1, 0, n - 1, (\d+), (\d+)\)/).map(Number);
const folhas = (ev) => Object.values(ev.nos).filter((x) => x.ini === x.fim).sort((p, q) => p.ini - q.ini).map((x) => x.valor);
const quadrosAtu = quadrosDe(atu.eventos, {
  pilha: chamadas("atualizar"),
  vetor: folhas,
  amarelos: () => new Set([POS]),
  legenda: ({ ev, nos, lista: todos }) => {
    const v = ev.vars;
    switch (ev.tag) {
      case "arvore": return `A árvore está montada e a soma total é ${v["arvore[1]"]}. Vamos trocar \`v[${POS}]\` de ${VETOR[POS]} para ${NOVO}. Só os nós cujo trecho contém a posição ${POS} precisam mudar.`;
      case "entra": return `O nó ${v.no} cobre ${fatia(v.ini, v.fim)}, que contém a posição ${POS}. Ele está no caminho (amarelo).`;
      case "meio": {
        const esq = v.pos <= v.meio;
        return `\`meio\` = ${v.meio}. Como \`pos\` = ${v.pos} ${esq ? "≤" : ">"} ${v.meio}, a posição está no filho ${esq ? "esquerdo" : "direito"} (nó ${esq ? 2 * v.no : 2 * v.no + 1}). O outro filho não muda e nem é visitado.`;
      }
      case "folha": return `Chegamos à folha de \`v[${v.ini}]\`: ela passa de ${v.antes} para ${v.valor}.`;
      case "soma": return `De volta ao nó ${v.no}: ele recalcula a soma dos filhos, ${val(nos, 2 * v.no)} + ${val(nos, 2 * v.no + 1)} = ${val(nos, v.no)} (antes era ${v.antes}).`;
      case "pronto": {
        const mudaram = atu.eventos.filter((e) => ["folha", "soma"].includes(e.tag)).length;
        return `Pronto: só os ${mudaram} nós do caminho entre a raiz e a folha mudaram, e os outros ${todos.length - mudaram} ficaram como estavam. A raiz agora vale ${v["arvore[1]"]}.`;
      }
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

for (const [nomeBloco, titulo, codigo, quadros] of [
  ["segtree-construir", "Construindo a Segment Tree de v = {2, 5, 1, 4, 9, 3}", con.codigo, quadrosCon],
  ["segtree-consultar", "Somando v[1..4] e v[0..2] na Segment Tree", bus.codigo, quadrosBus],
  ["segtree-atualizar", "Trocando v[2] de 1 para 6 na Segment Tree", atu.codigo, quadrosAtu],
]) {
  conferirQuadros(quadros);
  gravarBloco(DIR, nomeBloco, { title: titulo, cols: COLUNAS, code: codigo, steps: quadros });
}
