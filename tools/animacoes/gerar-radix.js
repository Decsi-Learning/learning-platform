// Gera os três blocos "codigo" da árvore Radix (inserção, busca e remoção). Uso: node tools/animacoes/gerar-radix.js
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

// ---- leitura do rastro: "tag n=1 ... $palavra=x $resto=y # @0::0:1 @1:ca:1:0 ... & @0:ca:0:3" ----
function lerArvore(tokens) {
  const raiz = { filhos: [] };
  const pilha = [raiz];
  for (const t of tokens) {
    const [d, rotulo, fim, marca] = t.slice(1).split(":");
    const no = { rotulo, fim: fim === "1", marca: Number(marca), prof: Number(d), filhos: [] };
    pilha.length = no.prof + 1;
    pilha[no.prof].filhos.push(no);
    pilha[no.prof + 1] = no;
  }
  return raiz.filhos[0] || null;
}

function lerRastro(bruto, tagLinha) {
  const eventos = [];
  const impresso = [];
  for (const linha of bruto.split("\n")) {
    const partes = linha.trim().split(" ");
    if (!(partes[0] in tagLinha)) { impresso.push(linha); continue; }
    const ev = { tag: partes[0], vars: {}, palavra: "", resto: "", arvore: null, solto: null };
    let i = 1;
    for (; i < partes.length && partes[i] !== "#"; i++) {
      const p = partes[i];
      const eq = p.indexOf("=");
      if (p.startsWith("$")) ev[p.slice(1, eq)] = p.slice(eq + 1);
      else ev.vars[p.slice(0, eq)] = Number(p.slice(eq + 1));
    }
    const resto = partes.slice(i + 1);
    const corte = resto.indexOf("&");
    ev.arvore = lerArvore(corte < 0 ? resto : resto.slice(0, corte));
    ev.solto = corte < 0 ? null : lerArvore(resto.slice(corte + 1));
    if (ev.solto) nos(ev.solto).forEach((no) => { no.solto = true; });
    eventos.push(ev);
  }
  return { eventos, impresso: impresso.join("\n").trim() };
}

// ---- desenho: cada nível da árvore é uma linha da animação; folhas a cada 2 colunas ----
const ehRaiz = (no) => no.prof === 0 && !no.solto;
const nome = (no) => (ehRaiz(no) ? "raiz" : no.rotulo) + (no.fim ? "*" : "");
const cor = (no) => (ehRaiz(no) ? 0 : (no.rotulo.charCodeAt(0) - 97 + 12) % 12);
const flag = (no) => (no.marca === 2 ? "c" : no.marca === 3 ? "p" : "");

function nos(raiz) {
  const lista = [];
  const visita = (no) => { lista.push(no); no.filhos.forEach(visita); };
  if (raiz) visita(raiz);
  return lista;
}

function posicionar(raiz) {
  let folhas = 0;
  const pos = (no) => {
    if (!no.filhos.length) { no.col = 2 * folhas++; return; }
    no.filhos.forEach(pos);
    no.col = 2 * Math.floor((no.filhos[0].col + no.filhos[no.filhos.length - 1].col) / 4);
  };
  pos(raiz);
  return 2 * folhas;
}

function quadrosDe(eventos, { legenda, pilha, linhasArvore, colunas }) {
  return eventos.map((ev, n) => {
    const todos = nos(ev.arvore);
    const foco = todos.find((x) => x.marca === 1) || null;
    const compara = todos.find((x) => x.marca === 2) || null;
    const largura = ev.arvore ? posicionar(ev.arvore) : 0;
    const desloc = Math.floor((colunas - largura) / 2);
    const niveis = Array.from({ length: linhasArvore }, () => []);
    for (const no of todos) {
      niveis[no.prof].push({ s: desloc + no.col, n: 2, i: [it(nome(no), flag(no), cor(no))], ...(no === foco ? { a: 1 } : {}), ...(no.fim && no.prof ? { l: "fim" } : {}) });
    }
    const usado = ev.palavra.length - ev.resto.length;
    const letras = [...ev.palavra].map((c, i) => it(c, i < usado ? "g" : i === usado && ["olha", "comum", "tamanho"].includes(ev.tag) ? "c" : "", (c.charCodeAt(0) - 97 + 12) % 12));
    const rows = [[{ i: letras, l: ev.palavra ? "chave (apagadas: já consumidas)" : "" }], ...niveis];
    if (ev.solto) {
      const s = ev.solto;
      rows.push([{ i: [it(nome(s), "p", cor(s)), ...s.filhos.flatMap((f) => [it("→", "g", 0), it(nome(f), "", cor(f))])], l: "nó novo, ainda fora da árvore" }]);
    } else rows.push([]);
    const ctx = { ev, foco, compara, todos, anterior: eventos[n - 1] };
    const quadro = { line: ev.linha, caption: legenda(ctx), vars: {}, rows, stack: pilha(ctx) };
    if (ev.palavra) quadro.vars.chave = `"${ev.resto}"`;
    if (foco) quadro.vars[ev.programa === "remover" ? "no" : "atual"] = foco.prof === 0 ? "raiz" : `"${foco.rotulo}"`;
    if (compara) quadro.vars.filho = `"${compara.rotulo}"`;
    for (const [k, v] of Object.entries(ev.vars)) quadro.vars[k] = v;
    return quadro;
  });
}

function programa(nomeC, opcoes) {
  const fonte = fs.readFileSync(path.join(DIR, nomeC), "utf8");
  const { codigo, tagLinha } = extrairCodigo(fonte);
  const bruto = rodar(nomeC, []);
  const limpo = rodar(nomeC, ["-DSEM_RASTRO"]).trim();
  const { eventos, impresso } = lerRastro(bruto, tagLinha);
  if (impresso !== limpo) throw new Error(`${nomeC}: o código da aula imprime algo diferente da versão rastreada`);
  if (opcoes.saida !== undefined && limpo !== opcoes.saida) throw new Error(`${nomeC}: saída inesperada: ${limpo}`);
  for (const ev of eventos) { ev.linha = tagLinha[ev.tag]; ev.programa = opcoes.programa; }
  return { codigo, eventos, fonte };
}

// as definições escondidas nos programas 2 e 3 têm de ser iguais às mostradas no programa 1
const normaliza = (s) => s.replace(/\r/g, "").replace(/\n{2,}/g, "\n\n").trim();
function definicoesOcultas(fonte) {
  const m = fonte.replace(/\r/g, "").match(/\/\/---OCULTO---\n([\s\S]*?)#include "radix-rastro\.h"/);
  return normaliza(m[1]);
}

const rotulo = (no) => (no.prof === 0 ? "raiz" : no.rotulo);
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const restoDepois = (ev, k) => (ev.resto.length > k ? `: falta \`${ev.resto.slice(k)}\`.` : ": a chave acabou.");
const LINHAS = 4;     // níveis de árvore: raiz, ca, s, a
const COLUNAS = 6;    // 3 folhas no máximo

// ---- 1. inserção ----
const ins = programa("radix-inserir.c", { programa: "inserir", saida: "" });
const palavras = [...ins.codigo.matchAll(/inserir\(raiz, "([^"]+)"\)/g)].map((m) => m[1]);
const prefixosTrie = new Set(palavras.flatMap((p) => [...p].map((_, i) => p.slice(0, i + 1))));
const quadrosIns = quadrosDe(ins.eventos, {
  linhasArvore: LINHAS, colunas: COLUNAS,
  pilha: ({ ev }) => (["raiz", "pronto"].includes(ev.tag) ? "main" : "inserir ← main"),
  legenda: ({ ev, foco, compara, todos }) => {
    const v = ev.vars, c = ev.resto[0];
    switch (ev.tag) {
      case "raiz": return "O programa cria a **raiz**: um nó de rótulo vazio que representa a cadeia vazia. Ela ainda não tem filhos.";
      case "inicio": return `Inserindo \`${ev.palavra}\`. \`atual\` começa na raiz.`;
      case "olha": return compara
        ? `A chave que falta é \`${ev.resto}\` e começa com '${c}' (\`indice\` = ${v.indice}). Em \`filhos[${v.indice}]\` está o nó \`${compara.rotulo}\`.`
        : `A chave que falta é \`${ev.resto}\` e começa com '${c}' (\`indice\` = ${v.indice}). \`filhos[${v.indice}]\` está vazio: nenhuma palavra continua com '${c}' a partir daqui.`;
      case "folha": return `Criamos **uma única folha** com todo o resto da chave, \`${ev.resto}\`, já marcada como fim de palavra.` + (ev.resto.length > 1 ? ` Na Trie seriam ${ev.resto.length} nós, um por letra.` : "") + " A inserção termina.";
      case "comum": {
        const r = compara.rotulo;
        return `\`prefixoComum\` compara o rótulo \`${r}\` com \`${ev.resto}\`: ${plural(v.k, "caractere é igual", "caracteres são iguais")} (\`${r.slice(0, v.k)}\`).`
          + (v.k === r.length ? " O rótulo casou inteiro, então não é preciso dividir nada."
            : ` Depois disso o rótulo tem '${r[v.k]}', mas ${ev.resto.length > v.k ? `a chave tem '${ev.resto[v.k]}'` : "a chave acaba"}: o rótulo precisa ser **dividido**.`);
      }
      case "meio": return `Criamos o nó \`${ev.solto.rotulo}\` só com a parte comum. Ele ainda está fora da árvore e não é fim de palavra.`;
      case "encurta": return `\`memmove\` tira os ${v.k} primeiros caracteres do rótulo do filho: ele passa a guardar só \`${compara.rotulo}\`, o pedaço que sobrou.`;
      case "liga": return `O filho encurtado vira filho do nó \`${ev.solto.rotulo}\`, na posição da letra '${compara.rotulo[0]}'.`;
      case "troca": return `\`${compara.rotulo}\` toma o lugar do filho antigo na árvore. A divisão terminou: as palavras que já estavam lá continuam com o mesmo caminho.`;
      case "desce": return `\`atual\` desce para o nó \`${rotulo(foco)}\` e a chave avança ${v.k}` + restoDepois(ev, v.k);
      case "acabou": return `A chave acabou exatamente no nó \`${rotulo(foco)}\`. Não é preciso criar nada: basta marcar esse nó como fim de palavra.`;
      case "marca": return `\`${rotulo(foco)}\` agora é fim de palavra (*): \`${ev.palavra}\` está na árvore.`;
      case "pronto": return `Pronto: ${palavras.map((p) => `\`${p}\``).join(", ").replace(/, ([^,]+)$/, " e $1")} ocupam só ${todos.length - 1} nós além da raiz. Uma Trie com as mesmas palavras usaria ${prefixosTrie.size}, um por letra.`;
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

// ---- 2. busca ----
const bus = programa("radix-buscar.c", { programa: "buscar", saida: "1\n0\n0\n0" });
if (definicoesOcultas(bus.fonte) !== normaliza(ins.codigo.split("int main")[0])) throw new Error("radix-buscar.c: as definições ocultas não são iguais às do primeiro programa");
const quadrosBus = quadrosDe(bus.eventos, {
  linhasArvore: LINHAS, colunas: COLUNAS,
  pilha: ({ ev }) => (ev.tag === "arvore" ? "main" : "buscar ← main"),
  legenda: ({ ev, foco, compara }) => {
    const v = ev.vars, c = ev.resto[0];
    switch (ev.tag) {
      case "arvore": return "A árvore já tem `casa`, `caso`, `cama` e `ca` (o asterisco marca fim de palavra). Vamos fazer quatro buscas.";
      case "inicio": return `Buscando \`${ev.palavra}\`. \`atual\` começa na raiz.`;
      case "olha": return compara
        ? `A chave que falta é \`${ev.resto}\`. O filho da letra '${c}' é o nó \`${compara.rotulo}\`.`
        : `A chave que falta é \`${ev.resto}\`, mas não há filho para a letra '${c}'.`;
      case "semFilho": return "Nenhuma palavra continua por aqui: `buscar` devolve **false** (0).";
      case "tamanho": return `O rótulo \`${compara.rotulo}\` tem ${plural(v.tam, "caractere", "caracteres")}. \`strncmp\` compara o rótulo inteiro com o começo de \`${ev.resto}\`.`;
      case "diverge": return `\`${compara.rotulo}\` não é o começo de \`${ev.resto}\`` + (ev.resto.length < v.tam ? ": a chave acaba **no meio do rótulo**" : "") + ". `buscar` devolve **false** (0).";
      case "desce": return `O rótulo casou inteiro. \`atual\` desce para \`${rotulo(foco)}\` e a chave avança ${v.tam}` + restoDepois(ev, v.tam);
      case "acabou": return foco.fim
        ? `A chave acabou no nó \`${rotulo(foco)}\`, que **é** fim de palavra: \`buscar\` devolve **true** (1).`
        : `A chave acabou no nó \`${rotulo(foco)}\`, que **não** é fim de palavra: \`buscar\` devolve **false** (0). O caminho existe, mas \`${ev.palavra}\` é só o começo de outras palavras.`;
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

// ---- 3. remoção ----
const rem = programa("radix-remover.c", { programa: "remover", saida: "casa" });
if (definicoesOcultas(rem.fonte) !== normaliza(ins.codigo.split("int main")[0])) throw new Error("radix-remover.c: as definições ocultas não são iguais às do primeiro programa");
const quadrosRem = quadrosDe(rem.eventos, {
  linhasArvore: LINHAS, colunas: COLUNAS,
  pilha: ({ ev, foco }) => (["arvore", "pronto"].includes(ev.tag) ? "main" : Array(foco.prof + 1).fill("removerRec").join(" ← ") + " ← remover ← main"),
  legenda: ({ ev, foco, compara }) => {
    const v = ev.vars;
    switch (ev.tag) {
      case "arvore": return "A árvore tem `casa`, `caso`, `cama` e `ca`. Vamos remover `caso`, `ca` e `cama`, nessa ordem.";
      case "entra": return foco.prof === 0
        ? `Começa a remoção de \`${ev.palavra}\`: \`removerRec\` é chamada para a raiz com a chave inteira.`
        : `\`removerRec\` chega ao nó \`${foco.rotulo}\` com ` + (ev.resto ? `a chave \`${ev.resto}\`.` : "a chave vazia.");
      case "fimChave": return `A chave acabou: \`${foco.rotulo}\` é o nó da palavra \`${ev.palavra}\`.`;
      case "desmarca": return "Desmarcamos o fim de palavra. " + (v.filhos === 0
        ? "O nó não tem filhos, então ficou inútil: devolve **true** para o pai liberá-lo."
        : `O nó ainda tem ${v.filhos} filhos, que levam a outras palavras. Ele fica, e devolve **false**.`);
      case "desceRec": return `O rótulo \`${compara.rotulo}\` casa com o começo da chave. Chamada recursiva para esse filho com ` + (ev.resto.length === v.tam ? "a chave vazia." : `o resto \`${ev.resto.slice(v.tam)}\`.`);
      case "libera": return `A chamada devolveu **true**: o filho \`${compara.rotulo}\` ficou inútil. Vamos liberar a memória dele.`;
      case "liberado": return "O filho foi liberado e o ponteiro dele voltou a `NULL`.";
      case "funde": return `O filho \`${compara.rotulo}\` não é fim de palavra e ficou com **um único filho**. Numa árvore Radix isso não pode acontecer: ele vai ser fundido com esse filho.`;
      case "fundido": return `\`fundir\` juntou os dois rótulos num nó só: \`${compara.rotulo}\`` + (compara.fim ? ", que herdou a marca de fim de palavra." : ".");
      case "volta": return (foco.prof === 0 ? "De volta à raiz" : `De volta ao nó \`${foco.rotulo}\``) + (foco.prof === 0
        ? ". A raiz nunca é liberada: a remoção terminou."
        : foco.fim ? ", que é fim de palavra: ele fica, e devolve **false**."
        : v.filhos === 0 ? ", que ficou sem filhos e não é fim de palavra: devolve **true**."
        : `, que ainda tem ${plural(v.filhos, "filho", "filhos")}: ele fica, e devolve **false**.`);
      case "pronto": return "Depois das três remoções sobrou só `casa`, guardada inteira em **um único nó**. A árvore continua compacta, sem nenhum nó desnecessário.";
      default: throw new Error("tag sem legenda: " + ev.tag);
    }
  },
});

for (const [nomeBloco, titulo, codigo, quadros] of [
  ["radix-inserir", "Inserindo casa, caso, cama e ca na árvore Radix", ins.codigo, quadrosIns],
  ["radix-buscar", "Buscando caso, cam, cas e dia na árvore Radix", bus.codigo, quadrosBus],
  ["radix-remover", "Removendo caso, ca e cama da árvore Radix", rem.codigo, quadrosRem],
]) {
  conferirQuadros(quadros);
  gravarBloco(DIR, nomeBloco, { title: titulo, cols: COLUNAS, code: codigo, steps: quadros });
}
