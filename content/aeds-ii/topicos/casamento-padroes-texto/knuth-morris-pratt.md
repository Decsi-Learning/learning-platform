## Objetivos de aprendizagem

Ao final desta página, você deverá ser capaz de:

- Explicar como o algoritmo **Knuth-Morris-Pratt (KMP)** evita voltar no texto.
- Calcular a **tabela de falha** (maior borda) de um padrão.
- Implementar o KMP em C e justificar seu custo linear $O(n + m)$.

## Conceito principal

Quando a força bruta falha após casar $q$ caracteres, ela volta no texto e relê posições já examinadas. O **KMP** aproveita o fato de que o trecho recém-casado é conhecido (`P[0..q-1]`): ele escorrega o padrão para a direita até alinhar o maior prefixo próprio que também é sufixo desse trecho — chamado de **borda**. Assim, o índice `i` do texto **nunca volta**.

A tabela de falha armazena, para cada posição $q$, o tamanho da maior borda de $P[0..q]$:

| `q` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `P[q]` | A | B | A | B | C | A | B | A | B |
| `falha[q]` | 0 | 0 | 1 | 2 | 0 | 1 | 2 | 3 | 4 |

Quando `P[q] != T[i]`, o algoritmo faz `q = falha[q - 1]` repetidamente até voltar a casar ou zerar `q`. Após uma ocorrência completa (`q == m`), também faz `q = falha[m - 1]` para detectar ocorrências sobrepostas (como `ABA` em `ABABA`).

## Exemplo passo a passo

```demo
{
  "title": "KMP procurando ABABCABAB",
  "steps": [
    {"caption":"Texto com n = 19 e padrão com m = 9. O índice i percorre o texto uma única vez; q conta quantos caracteres do padrão já casaram. Tabela de falha: [0, 0, 1, 2, 0, 1, 2, 3, 4].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\npadrão:    A  B  A  B  C  A  B  A  B"},
    {"caption":"i = 0 a 3: os caracteres ABAB casam um a um. Agora q = 4.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\npadrão:    A  B  A  B  C  A  B  A  B\n                    i\n\nq = 4"},
    {"caption":"i = 4: T[4] = D não casa com P[4] = C. Em vez de voltar no texto, o KMP consulta a tabela de falha e escorrega o padrão: q = 4  ->  falha[3] = 2  ->  falha[1] = 0. T[4] também não casa com P[0]; q = 0 e o texto avança.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\nantes:     A  B  A  B  C  A  B  A  B\ndepois:                   A  B  A  B  C  A  B  A  B\n                       i\n\nq = 4  ->  falha[3] = 2  ->  falha[1] = 0"},
    {"caption":"i = 5 a 7: os caracteres ABA casam um a um. Agora q = 3.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\npadrão:                   A  B  A  B  C  A  B  A  B\n                                i\n\nq = 3"},
    {"caption":"i = 8: T[8] = C não casa com P[3] = B. Em vez de voltar no texto, o KMP consulta a tabela de falha e escorrega o padrão: q = 3  ->  falha[2] = 1  ->  falha[0] = 0. T[8] também não casa com P[0]; q = 0 e o texto avança.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\nantes:                    A  B  A  B  C  A  B  A  B\ndepois:                               A  B  A  B  C  A  B  A  B\n                                   i\n\nq = 3  ->  falha[2] = 1  ->  falha[0] = 0"},
    {"caption":"i = 9: T[9] = D não casa com P[0] = A. q continua 0 e o texto avança.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\npadrão:                               A  B  A  B  C  A  B  A  B\n                                      i\n\nq = 0"},
    {"caption":"i = 10 a 18: os caracteres ABABCABAB casam um a um. Agora q = 9.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\npadrão:                                  A  B  A  B  C  A  B  A  B\n                                                                 i\n\nq = 9"},
    {"caption":"q = 9 = m: ocorrência na posição i - m + 1 = 18 - 9 + 1 = 10. Depois de achar, o KMP faz q = falha[8] = 4 para continuar procurando ocorrências sobrepostas.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\nachou:                                   A  B  A  B  C  A  B  A  B\n                                                                 i\n\nocorrência em 10"},
    {"caption":"Fim: o índice i nunca voltou. Foram 19 avanços no texto e uma ocorrência, na posição 10. A força bruta testaria 11 janelas.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18\ntexto:     A  B  A  B  D  A  B  A  C  D  A  B  A  B  C  A  B  A  B\nachou:                                   A  B  A  B  C  A  B  A  B"}
  ]
}
```

## Código em C

```c
#include <stdio.h>
#include <string.h>

#define MAXP 256

void calculaFalha(const char *P, int m, int falha[]) {
    int k = 0;
    falha[0] = 0;
    for (int q = 1; q < m; q++) {
        while (k > 0 && P[k] != P[q])
            k = falha[k - 1];
        if (P[k] == P[q])
            k++;
        falha[q] = k;
    }
}

void kmp(const char *T, const char *P) {
    int n = strlen(T), m = strlen(P);
    int falha[MAXP];
    calculaFalha(P, m, falha);

    int q = 0;
    for (int i = 0; i < n; i++) {
        while (q > 0 && P[q] != T[i])
            q = falha[q - 1];
        if (P[q] == T[i])
            q++;
        if (q == m) {
            printf("ocorrencia na posicao %d\n", i - m + 1);
            q = falha[q - 1];
        }
    }
}
```

## Complexidade

| Etapa | Custo | Motivo |
|:---|:---|:---|
| Tabela de falha | $O(m)$ | `k` sobe no máximo $m$ vezes e cada volta do `while` diminui `k` |
| Busca | $O(n)$ | `i` avança $n$ vezes; `q` sobe e desce no máximo $n$ vezes (análise amortizada) |
| Total / Memória | $O(n + m)$ / $O(m)$ | Pior caso linear garantido; vetor `falha` de tamanho $m$ |

> O KMP lê o texto em uma única passagem sem retroceder, sendo ideal para fluxos contínuos e entradas muito repetitivas. Porém, examina todos os caracteres do texto.
