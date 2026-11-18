// Gera o bloco "codigo" da leitura com prefixo de tamanho e do índice de offsets. Uso: node gerar-prefixo.js
const { executarEConferir, lerEventos, conferirQuadros, gravarBloco } = require("./lib.js");
const { it } = require("./texto.js");

const { codigo, tagLinha, bruto, impresso } = executarEConferir("prefixo.c", __dirname);
if (impresso.replace(/\r/g, "").trim() !== "registro 2: Carla;Minas;Itabirito\nregistro 1: Bruno Lima;Civil;Ouro Preto") throw new Error("resultado inesperado: " + impresso);
const textos = [...codigo.matchAll(/grava\(f, "([^"]+)"\)/g)].map((m) => m[1]);
const tamanhos = textos.map((s) => s.length);
const inicios = [];
tamanhos.reduce((pos, t) => { inicios.push(pos); return pos + 2 + t; }, 0);
const FIM = inicios[inicios.length - 1] + 2 + tamanhos[tamanhos.length - 1];
const eventos = lerEventos(bruto, tagLinha);
const N = textos.length;
const cor = (s) => s.charCodeAt(0) % 12;

const quadros = [];
const conhecido = new Set();   // registros cujo prefixo já foi lido
const indice = [];
let lido = null;
for (const ev of eventos) {
  const t = ev.tag, v = ev.vars;
  const pos = v.pos !== undefined ? v.pos : -1;
  const regPos = pos >= 0 ? Math.max(...inicios.filter((x) => x <= pos).map((x) => inicios.indexOf(x))) : -1;
  const focoReg = pos >= 0 && pos < FIM ? regPos : -1;
  let caption = "";
  if (t === "criado") caption = `O programa gravou 3 registros. Cada um começa com 2 bytes que dizem quantos bytes de dados vêm depois (o prefixo). Os dados têm ${tamanhos.join(", ")} bytes. Por isso os registros começam nos bytes ${inicios.join(", ")}, e o arquivo termina no byte ${FIM}.`;
  if (t === "pede") caption = "Queremos o registro 2 (o terceiro). Sem índice, vamos pular os registros 0 e 1 sem ler os dados deles.";
  if (t === "prefixo") caption = `A cabeça de leitura está no byte ${pos}, onde começa o registro ${v.i}. Vamos ler os 2 bytes do prefixo.`;
  if (t === "pula") { conhecido.add(v.i); caption = `O prefixo vale ${v.tam}. O fseek pula ${v.tam} bytes de dados e vai para o byte ${pos - 2 + 2 + v.tam}, onde começa o próximo registro.`; }
  if (t === "chegou") caption = `Chegamos ao byte ${pos}: é aqui que começa o registro ${v.n}. Pulamos 2 registros sem ler nenhum dado deles, só os prefixos.`;
  if (t === "lePrefixo") caption = `Estamos no byte ${pos}. Lemos o prefixo do registro.`;
  if (t === "leDados") { conhecido.add(regPos); caption = `O prefixo vale ${v.tam}. Então lemos exatamente ${v.tam} bytes de dados, sem precisar olhar o conteúdo.`; }
  if (t === "mostra" || t === "mostra2") { lido = v.reg; caption = `Registro ${v.reg} lido: ${textos[v.reg]}.`; }
  if (t === "indexa") { indice[v.i] = v.pos; caption = `Montando o índice: o registro ${v.i} começa no byte ${v.pos}. Guardamos esse número em indice[${v.i}].`; }
  if (t === "vai") caption = `Agora, com o índice, vamos direto ao byte ${v.pos}: um único fseek, sem pular registro nenhum.`;
  if (t === "pede") conhecido.clear();
  if (t === "indexa") conhecido.add(v.i);
  const registros = [...textos.map((s, i) => it(s[0], i === focoReg && !["criado", "mostra", "mostra2"].includes(t) ? "c" : "", cor(s))), it("·", "g", 0)];
  const offsets = [...inicios.map((x, i) => it(String(x), i === focoReg && !["criado", "mostra", "mostra2"].includes(t) ? "c" : "", cor(textos[i]))), it(String(FIM), "", 0)];
  const prefixos = [...tamanhos.map((x, i) => (conhecido.has(i) ? it(String(x), "", cor(textos[i])) : it("?", "", 0))), it("·", "g", 0)];
  const rows = [
    [{ s: 0, n: N + 1, i: registros, l: "registros (A = Ana, B = Bruno, C = Carla)" }],
    [{ s: 0, n: N + 1, i: offsets, l: "byte onde cada registro começa (o último é o fim do arquivo)" }],
    [{ s: 0, n: N + 1, i: prefixos, l: "prefixo (tamanho dos dados)" }],
  ];
  if (lido !== null && ["mostra", "mostra2"].includes(t)) rows.push([{ i: [it(textos[lido][0], "p", cor(textos[lido]))], l: `registro ${lido} lido` }]);
  const vars = {};
  if (pos >= 0) vars["cabeça (byte)"] = pos;
  if (v.tam !== undefined) vars.tam = v.tam;
  const stack = ["criado", "pede", "mostra", "mostra2", "indexa", "vai"].includes(t) ? "main" : ["lePrefixo", "leDados"].includes(t) ? "le ← main" : "localiza ← main";
  quadros.push({ line: tagLinha[t], caption, vars, rows, stack });
}
conferirQuadros(quadros);
gravarBloco(__dirname, "prefixo", { title: "Prefixo de tamanho e índice de offsets passo a passo", code: codigo, steps: quadros });
