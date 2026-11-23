## Objetivos de aprendizagem

Ao final desta página, você deverá ser capaz de:

- Explicar como o **Shift-And** usa paralelismo de bits para testar todos os prefixos do padrão simultaneamente.
- Implementar o Shift-And em C e reconhecer suas extensões (classes de caracteres e busca aproximada).
- Comparar os cinco algoritmos estudados e escolher o mais adequado para cada cenário.

## Shift-And

O algoritmo **Shift-And** usa operações bit a bit (`<<`, `|`, `&`) sobre uma palavra do processador (32 ou 64 bits) para acompanhar todos os casamentos parciais ao mesmo tempo.

- **Máscaras `M[c]`:** o bit `j` de `M[c]` vale `1` se $P[j] = c$, e `0` caso contrário. Para `ABRA`: `M[A] = 1001`, `M[B] = 0010`, `M[R] = 0100` (bit 0 à direita).
- **Estado `R`:** começa em `0`. O bit `j` vale `1` quando o prefixo $P[0..j]$ termina na posição atual `i` do texto. A cada caractere lido:

$$R \leftarrow ((R \ll 1) \mid 1) \mathbin{\&} M[T[i]]$$

Se o bit $m - 1$ de `R` ficar ligado, há ocorrência na posição $i - m + 1$.

> **Flexibilidade:** o Shift-And aceita **classes de caracteres** (ex.: maiúsculas/minúsculas ou coringas) apenas ligando bits extras em `M[c]`, e se estende para **casamento aproximado** (até $k$ erros) mantendo vetores de estado adicionais em $O(k \cdot n)$.

## Exemplo passo a passo

```demo
{
  "title": "Shift-And procurando ABRA em ABRACADABRA",
  "steps": [
    {"caption":"Pré-processamento: o bit j da máscara M[c] vale 1 quando P[j] = c. Os bits são escritos com o bit 0 (que representa P[0]) à direita. R começa com todos os bits em 0.","state":"bit:     3210\npadrão:  ARBA   (P[3] P[2] P[1] P[0])\n\nmáscaras:  M[A] = 1001   M[B] = 0010   M[R] = 0100   outros = 0000\n\nR:       0000"},
    {"caption":"i = 0, T[0] = A: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[A]. Bit ligado: o prefixo \"A\" termina em T[0].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n           i\n\nR antes: 0000\n<<1 | 1: 0001\nM[A]:    1001\nR novo:  0001"},
    {"caption":"i = 1, T[1] = B: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[B]. Bit ligado: o prefixo \"AB\" termina em T[1].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n              i\n\nR antes: 0001\n<<1 | 1: 0011\nM[B]:    0010\nR novo:  0010"},
    {"caption":"i = 2, T[2] = R: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[R]. Bit ligado: o prefixo \"ABR\" termina em T[2].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                 i\n\nR antes: 0010\n<<1 | 1: 0101\nM[R]:    0100\nR novo:  0100"},
    {"caption":"i = 3, T[3] = A: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[A]. Bits ligados: os prefixos \"A\" e \"ABRA\" terminam em T[3]. O bit 3 está ligado: ocorrência na posição 3 - 4 + 1 = 0.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                    i\n\nR antes: 0100\n<<1 | 1: 1001\nM[A]:    1001\nR novo:  1001   <- bit 3 ligado: ocorrência"},
    {"caption":"i = 4, T[4] = C: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[C]. Nenhum prefixo do padrão termina aqui: R zera.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                       i\n\nR antes: 1001\n<<1 | 1: 0011\nM[C]:    0000\nR novo:  0000"},
    {"caption":"i = 5, T[5] = A: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[A]. Bit ligado: o prefixo \"A\" termina em T[5].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                          i\n\nR antes: 0000\n<<1 | 1: 0001\nM[A]:    1001\nR novo:  0001"},
    {"caption":"i = 6, T[6] = D: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[D]. Nenhum prefixo do padrão termina aqui: R zera.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                             i\n\nR antes: 0001\n<<1 | 1: 0011\nM[D]:    0000\nR novo:  0000"},
    {"caption":"i = 7, T[7] = A: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[A]. Bit ligado: o prefixo \"A\" termina em T[7].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                                i\n\nR antes: 0000\n<<1 | 1: 0001\nM[A]:    1001\nR novo:  0001"},
    {"caption":"i = 8, T[8] = B: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[B]. Bit ligado: o prefixo \"AB\" termina em T[8].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                                   i\n\nR antes: 0001\n<<1 | 1: 0011\nM[B]:    0010\nR novo:  0010"},
    {"caption":"i = 9, T[9] = R: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[R]. Bit ligado: o prefixo \"ABR\" termina em T[9].","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                                      i\n\nR antes: 0010\n<<1 | 1: 0101\nM[R]:    0100\nR novo:  0100"},
    {"caption":"i = 10, T[10] = A: desloca R uma casa para a esquerda, liga o bit 0 e faz AND com M[A]. Bits ligados: os prefixos \"A\" e \"ABRA\" terminam em T[10]. O bit 3 está ligado: ocorrência na posição 10 - 4 + 1 = 7.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\n                                         i\n\nR antes: 0100\n<<1 | 1: 1001\nM[A]:    1001\nR novo:  1001   <- bit 3 ligado: ocorrência"},
    {"caption":"Fim: o texto foi lido uma única vez, com uma operação de deslocamento, uma de OU e uma de E por caractere. Ocorrências nas posições 0 e 7.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\nachou:     A  B  R  A\nachou:                          A  B  R  A"}
  ]
}
```

## Código em C

```explicado c
void shiftAnd(const char *T, const char *P) { @@ Procura todas as ocorrências de `P` em `T` (`m <= 64`).
    int n = strlen(T), m = strlen(P); @@ Tamanhos do texto e do padrão.
    if (m == 0 || m > 64) return; @@ Limite de uma palavra de 64 bits.
    uint64_t M[256] = {0}; @@ Máscaras zeradas para cada caractere.
    for (int j = 0; j < m; j++) @@ Pré-processamento do padrão.
        M[(unsigned char)P[j]] |= (1ULL << j); @@ Liga o bit `j` na máscara de `P[j]`.
    uint64_t R = 0, alvo = 1ULL << (m - 1); @@ Estado inicial e bit de casamento completo.
    for (int i = 0; i < n; i++) { @@ Lê o texto uma única vez.
        R = ((R << 1) | 1ULL) & M[(unsigned char)T[i]]; @@ Avança prefixos e filtra pelo caractere atual.
        if (R & alvo) @@ Se o bit `m - 1` estiver ligado, achou o padrão.
            printf("ocorrencia na posicao %d\n", i - m + 1);
    }
}
```

## Comparação geral dos algoritmos

Considere texto de tamanho $n$, padrão de tamanho $m$, alfabeto de tamanho $c$ e palavra da máquina de $w$ bits:

| Algoritmo | Pré-proc. | Melhor caso | Pior caso | Memória | Quando escolher |
|:---|:---|:---|:---|:---|:---|
| **Força bruta** | Nenhum | $O(n)$ | $O(n \cdot m)$ | $O(1)$ | Buscas pontuais em textos muito curtos |
| **KMP** | $O(m)$ | $O(n)$ | $O(n)$ | $O(m)$ | Pior caso linear garantido, fluxos e alfabeto pequeno |
| **Boyer-Moore** | $O(m + c)$ | $O(n / m)$ | $O(n \cdot m)$ | $O(m + c)$ | Padrões longos com repetições internas |
| **BMH** | $O(m + c)$ | $O(n / m)$ | $O(n \cdot m)$ | $O(c)$ | Busca exata rápida em textos comuns, código curto |
| **Shift-And** | $O(m + c)$ | $O(n \cdot \lceil m / w \rceil)$ | $O(n \cdot \lceil m / w \rceil)$ | $O(c)$ | Padrões curtos com coringas, classes ou busca aproximada |

Se o mesmo texto grande receber milhares de consultas, vale pré-processar o **texto** com estruturas como **Árvore Trie** e **Árvore Patricia**, vistos nos próximos tópicos.
