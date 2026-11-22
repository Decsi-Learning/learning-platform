## Objetivos de aprendizagem

Ao final desta página, você deverá ser capaz de:

- Definir o problema do casamento de padrões em texto e seu vocabulário básico.
- Classificar algoritmos de busca conforme o que é pré-processado.
- Implementar o algoritmo de **força bruta** em C e analisar sua complexidade.

## Introdução

O **casamento de padrões** (*pattern matching*) consiste em encontrar todas as ocorrências de um **padrão** $P[0..m-1]$ dentro de um **texto** $T[0..n-1]$ ($m \le n$) sobre um alfabeto $\Sigma$ de tamanho $c$. Esse problema aparece em buscas de texto (`Ctrl+F`, `grep`), antivírus, compiladores e bioinformática.

| Termo | Significado |
|:---|:---|
| Janela | Trecho $T[s..s+m-1]$ de mesmo tamanho que o padrão |
| Deslocamento $s$ | Posição inicial da janela, variando de $0$ até $n - m$ ($n - m + 1$ janelas) |
| Ocorrência | Deslocamento $s$ em que $T[s + j] = P[j]$ para todo $0 \le j < m$ |

Os algoritmos se dividem em três categorias conforme o pré-processamento:

| Categoria | Exemplos | Quando usar |
|:---|:---|:---|
| Nada pré-processado | Força bruta | Textos e padrões muito pequenos |
| Padrão pré-processado | KMP, Boyer-Moore, BMH, Shift-And | Texto muda ou é lido uma vez |
| Texto pré-processado | Árvore Trie, Árvore Patricia, árvores de sufixos | Texto fixo com muitas consultas |

## Força bruta

A abordagem mais direta testa todas as $n - m + 1$ janelas da esquerda para a direita. No primeiro caractere diferente, descarta a janela e avança apenas uma posição ($s \leftarrow s + 1$), descartando tudo o que já foi comparado.

```demo
{
  "title": "Força bruta procurando ABRA em ABRACADABRA",
  "steps": [
    {"caption":"Texto com n = 11 caracteres e padrão com m = 4. A força bruta encaixa o padrão em cada uma das n - m + 1 = 8 posições possíveis e compara da esquerda para a direita.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:    A  B  R  A"},
    {"caption":"s = 0: os 4 caracteres casam (4 comparações). Ocorrência na posição 0. Comparações até aqui: 4.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:    A  B  R  A\n           =  =  =  ="},
    {"caption":"s = 1: P[0] = A é diferente de T[1] = B. Uma comparação basta para descartar a janela, que anda uma posição. Comparações até aqui: 5.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:       A  B  R  A\n              x"},
    {"caption":"s = 2: P[0] = A é diferente de T[2] = R. Uma comparação basta para descartar a janela, que anda uma posição. Comparações até aqui: 6.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:          A  B  R  A\n                 x"},
    {"caption":"s = 3: o primeiro caractere casa, mas P[1] = B é diferente de T[4] = C. A janela anda só uma posição. Comparações até aqui: 8.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:             A  B  R  A\n                    =  x"},
    {"caption":"s = 4: P[0] = A é diferente de T[4] = C. Uma comparação basta para descartar a janela, que anda uma posição. Comparações até aqui: 9.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:                A  B  R  A\n                       x"},
    {"caption":"s = 5: o primeiro caractere casa, mas P[1] = B é diferente de T[6] = D. A janela anda só uma posição. Comparações até aqui: 11.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:                   A  B  R  A\n                          =  x"},
    {"caption":"s = 6: P[0] = A é diferente de T[6] = D. Uma comparação basta para descartar a janela, que anda uma posição. Comparações até aqui: 12.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:                      A  B  R  A\n                             x"},
    {"caption":"s = 7: os 4 caracteres casam (4 comparações). Ocorrência na posição 7. Comparações até aqui: 16.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:                         A  B  R  A\n                                =  =  =  ="},
    {"caption":"Fim: 8 janelas testadas, 16 comparações e ocorrências nas posições 0 e 7.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\nachou:     A  B  R  A\nachou:                          A  B  R  A"}
  ]
}
```

## Código em C

```explicado c
void forcaBruta(const char *T, const char *P) { @@ Procura todas as ocorrências de `P` em `T`.
    int n = strlen(T), m = strlen(P); @@ Tamanhos do texto e do padrão.
    for (int s = 0; s <= n - m; s++) { @@ Testa cada uma das `n - m + 1` janelas possíveis.
        int j = 0; @@ Começa no primeiro caractere do padrão.
        while (j < m && T[s + j] == P[j]) @@ Compara da esquerda para a direita enquanto casar.
            j++;
        if (j == m) @@ Todos os `m` caracteres casaram.
            printf("ocorrencia na posicao %d\n", s);
    }
}
```

## Complexidade

| Situação | Comparações | Exemplo |
|:---|:---|:---|
| Pior caso | $(n - m + 1) \cdot m = O(n \cdot m)$ | Texto `AAAA...A` e padrão `AAAB` |
| Caso médio (alfabeto grande) | Próximo de $O(n)$ | Palavra comum em texto em português |
| Memória extra | $O(1)$ | Apenas índices `s` e `j` |

> No pior caso, cada janela casa os $m - 1$ primeiros caracteres e falha apenas no último. Os próximos algoritmos eliminam esse retrabalho pré-processando o padrão.
