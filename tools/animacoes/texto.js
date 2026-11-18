// Peças comuns das animações de casamento de padrões: texto, padrão e bits.
const it = (v, flag, cor) => (flag || cor !== undefined ? [v, flag || "", cor] : v);

// Lê o texto e o padrão que o main do .c passa à função: f("texto", "padrao")
function textoEPadrao(codigo) {
  const m = codigo.match(/\("([^"]+)", "([^"]+)"\);\s*\n\s*return 0;/);
  if (!m) throw new Error("não achei texto e padrão no main");
  return { T: m[1], P: m[2] };
}

// marcas: { indice: "c"|"p" }
function letras(str, marcas = {}) {
  return [...str].map((c, i) => it(c, marcas[i]));
}

const grupoTexto = (T, marcas) => ({ s: 0, n: T.length, i: letras(T, marcas), l: "texto t" });
const grupoPadrao = (P, deslocamento, marcas, ativo) => ({ s: deslocamento, n: P.length, i: letras(P, marcas), l: "padrão p", ...(ativo ? { a: 1 } : {}) });

// bits de um inteiro com m casas (bit da esquerda = p[0]); 1 verde, 0 areia
const bits = (valor, m, marcas = {}) => Array.from({ length: m }, (_, i) => {
  const b = (valor >> (m - 1 - i)) & 1;
  return it(String(b), marcas[i], b ? 4 : 0);
});
const binario = (valor, m) => valor.toString(2).padStart(m, "0");

module.exports = { it, textoEPadrao, letras, grupoTexto, grupoPadrao, bits, binario };
