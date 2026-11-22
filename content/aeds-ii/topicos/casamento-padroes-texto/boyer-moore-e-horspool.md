## Objetivos de aprendizagem

Ao final desta página, você deverá ser capaz de:

- Explicar por que comparar **da direita para a esquerda** permite saltos sublineares.
- Descrever as heurísticas da **ocorrência** (caractere ruim) e do **casamento** (sufixo bom) do **Boyer-Moore**.
- Construir a tabela e implementar o **Boyer-Moore-Horspool (BMH)** em C.

## Boyer-Moore

O algoritmo de **Boyer e Moore** compara cada janela do **último caractere para o primeiro**. Se o caractere do texto nem existe no padrão, a janela inteira salta $m$ posições após uma única comparação — alcançando desempenho **sublinear** $O(n / m)$ no melhor caso.

A cada falha na posição $j$ do padrão (contra $x = T[s + j]$), o algoritmo calcula dois deslocamentos e aplica o **maior**:

1. **Heurística da ocorrência (caractere ruim):** alinha a última aparição de $x$ no padrão com $T[s + j]$: deslocamento $j - \text{ult}[x]$ (com $\text{ult}[x] = -1$ se $x$ não ocorre em $P$).
2. **Heurística do casamento (sufixo bom):** se o sufixo $P[j+1..m-1]$ já casou, desloca o padrão até a próxima cópia desse sufixo precedida por caractere diferente de $P[j]$ (ou até o maior prefixo de $P$ que coincida com um final desse sufixo).

## Boyer-Moore-Horspool (BMH)

O **BMH** simplifica o Boyer-Moore descartando o sufixo bom e olhando sempre o caractere do texto alinhado com o **fim da janela**, $T[s + m - 1]$. A tabela de deslocamento considera apenas $P[0..m-2]$ (o último caractere fica de fora para não gerar salto zero):

$$d[c] = \begin{cases} m - 1 - \text{última posição de } c \text{ em } P[0..m-2], & \text{se } c \text{ aparece em } P[0..m-2] \\ m, & \text{caso contrário} \end{cases}$$

Para `ABRA` ($m = 4$), temos `d[A] = 3`, `d[B] = 2`, `d[R] = 1` e `d[outros] = 4`.

> Uma variante comum é o **BMHS** (*Sunday*), que consulta o caractere logo após a janela ($T[s + m]$), podendo saltar até $m + 1$ posições.

## Exemplo passo a passo (BMH)

```demo
{
  "title": "BMH procurando ABRA em ABRACADABRA",
  "steps": [
    {"caption":"Pré-processamento: para cada caractere de P[0..m-2] = ABR, d[c] = m - 1 - (última posição de c). Quem não aparece desloca m = 4. A comparação é feita da direita para a esquerda.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:    A  B  R  A\n\ntabela d:  A = 3   B = 2   R = 1   outros = 4"},
    {"caption":"s = 0: comparando da direita para a esquerda, os 4 caracteres casam: ocorrência na posição 0. O deslocamento vem do caractere do texto alinhado com o fim do padrão: T[3] = A, d[A] = 3. A janela pula 3 posições.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:    A  B  R  A\n           =  =  =  =\n                    d\n\ntabela d:  A = 3   B = 2   R = 1   outros = 4"},
    {"caption":"s = 3: comparando da direita para a esquerda, P[3] = A é diferente de T[6] = D. O deslocamento vem do caractere do texto alinhado com o fim do padrão: T[6] = D, d[D] = 4. A janela pula 4 posições.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:             A  B  R  A\n                             x\n                             d\n\ntabela d:  A = 3   B = 2   R = 1   outros = 4"},
    {"caption":"s = 7: comparando da direita para a esquerda, os 4 caracteres casam: ocorrência na posição 7. O deslocamento vem do caractere do texto alinhado com o fim do padrão: T[10] = A, d[A] = 3. A janela pula 3 posições.","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\npadrão:                         A  B  R  A\n                                =  =  =  =\n                                         d\n\ntabela d:  A = 3   B = 2   R = 1   outros = 4"},
    {"caption":"Fim: s = 10 passou de n - m = 7. Foram 3 janelas e 9 comparações. A força bruta precisou de 8 janelas e 16 comparações para achar as mesmas ocorrências (0 e 7).","state":"posição:   0  1  2  3  4  5  6  7  8  9 10\ntexto:     A  B  R  A  C  A  D  A  B  R  A\nachou:     A  B  R  A\nachou:                          A  B  R  A"}
  ]
}
```

## Código em C (BMH)

```explicado c
void bmh(const char *T, const char *P) { @@ Procura todas as ocorrências de `P` em `T`.
    int n = strlen(T), m = strlen(P); @@ Tamanhos do texto e do padrão.
    int d[256]; @@ Tabela de deslocamentos para alfabeto de 1 byte.
    for (int c = 0; c < 256; c++) @@ Inicializa todos os caracteres...
        d[c] = m; @@ ...com salto máximo `m`.
    for (int j = 0; j < m - 1; j++) @@ Percorre `P[0..m-2]` (sem o último caractere).
        d[(unsigned char)P[j]] = m - 1 - j; @@ Distância até o fim; última ocorrência prevalece.
    int s = 0; @@ Início da janela atual.
    while (s <= n - m) { @@ Enquanto o padrão couber no texto.
        int j = m - 1; @@ Compara da direita para a esquerda.
        while (j >= 0 && T[s + j] == P[j])
            j--;
        if (j < 0) @@ Todos os caracteres casaram.
            printf("ocorrencia na posicao %d\n", s);
        s += d[(unsigned char)T[s + m - 1]]; @@ Salta conforme o último caractere da janela.
    }
}
```

## Complexidade

| Algoritmo | Pré-processamento | Melhor caso | Pior caso | Memória extra |
|:---|:---|:---|:---|:---|
| Boyer-Moore | $O(m + c)$ | $O(n / m)$ | $O(n \cdot m)$ | $O(m + c)$ |
| BMH | $O(m + c)$ | $O(n / m)$ | $O(n \cdot m)$ | $O(c)$ |

Na prática, em textos em linguagem natural (alfabeto grande e padrões médios ou longos), o BMH tem desempenho excelente com código muito simples. Em alfabetos muito pequenos (como DNA), os saltos diminuem.
