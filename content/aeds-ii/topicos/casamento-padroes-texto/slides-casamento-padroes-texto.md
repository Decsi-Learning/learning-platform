# Slides — Casamento de padrões em texto

Esta apresentação resume os algoritmos estudados neste tópico.

## Slides

Use os botões ou as setas do teclado para passar os slides.

```slides
{
  "slides": [
    {
      "title": "O problema",
      "bullets": [
        "Encontrar todas as ocorrências de P (tamanho m) em T (tamanho n).",
        "Três categorias: sem pré-processamento, padrão pré-processado ou texto pré-processado."
      ]
    },
    {
      "title": "Força bruta",
      "bullets": [
        "Testa todas as n - m + 1 janelas da esquerda para a direita.",
        "Sem memória extra, mas pior caso O(n × m) em textos repetitivos."
      ]
    },
    {
      "title": "Knuth-Morris-Pratt (KMP)",
      "bullets": [
        "Tabela de falha guarda a maior borda de cada prefixo P[0..q].",
        "Nunca volta no texto: pré-processamento O(m) e busca O(n) garantidos."
      ]
    },
    {
      "title": "Boyer-Moore",
      "bullets": [
        "Compara a janela da direita para a esquerda, podendo saltar m posições.",
        "Usa o maior salto entre a heurística da ocorrência e a do sufixo bom."
      ]
    },
    {
      "title": "Boyer-Moore-Horspool (BMH)",
      "bullets": [
        "Simplifica o BM olhando apenas o caractere alinhado ao fim da janela.",
        "Sublinear O(n / m) no melhor caso; rápido e simples para textos comuns."
      ]
    },
    {
      "title": "Shift-And",
      "bullets": [
        "Usa paralelismo de bits: R = ((R << 1) | 1) & M[T[i]].",
        "Lê o texto em O(n) para m <= 64 e estende-se facilmente para busca aproximada."
      ]
    },
    {
      "title": "Qual escolher?",
      "bullets": [
        "BMH: busca exata em textos naturais; KMP: garantia linear e fluxos.",
        "Shift-And: padrões curtos com coringas, classes de caracteres ou até k erros."
      ]
    }
  ]
}
```

## Vídeo explicativo

```video
{ "title": "Casamento de padrões em texto", "url": null }
```

## Referências

- ZIVIANI, N. *Projeto de Algoritmos com implementações em Pascal e C*, 3ª ed., Cengage Learning.
- CORMEN, T. H. et al. *Algoritmos: Teoria e Prática*, 3ª ed., Elsevier.
- BOYER, R. S.; MOORE, J. S. *A Fast String Searching Algorithm*. CACM, 1977.
- HORSPOOL, R. N. *Practical Fast Searching in Strings*. Software: Practice and Experience, 1980.
- KNUTH, D. E.; MORRIS, J. H.; PRATT, V. R. *Fast Pattern Matching in Strings*. SIAM J. Comput., 1977.
- BAEZA-YATES, R.; GONNET, G. H. *A New Approach to Text Searching*. CACM, 1992.
