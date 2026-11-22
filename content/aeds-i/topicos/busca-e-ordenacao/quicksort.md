## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

* Compreender o paradigma de **Divisão e Conquista** aplicado ao **Quicksort** e o papel central da operação de **particionamento**.
* Executar manualmente o algoritmo de particionamento de Lomuto, identificando como o **pivô** alcança sua posição definitiva.
* Implementar o Quicksort em C com a heurística da **Mediana de Três** para mitigar o pior caso em vetores já ordenados.
* Analisar a complexidade assintótica no melhor caso, caso médio ($\Theta(n \log n)$) e pior caso ($O(n^2)$), além do consumo de memória de pilha e da instabilidade.
## Introdução

Criado por Tony Hoare em 1960, o **Quicksort** é um dos algoritmos de ordenação mais rápidos e amplamente utilizados na prática (servindo de base para rotinas padrão como a função `qsort` da biblioteca padrão da linguagem C).

Assim como o *Mergesort*, ele aplica o paradigma de **Divisão e Conquista**, mas inverte o momento em que o esforço computacional ocorre: enquanto o Mergesort divide o vetor ao meio sem comparar nada e realiza todo o trabalho na intercalação durante o retorno da recursão, o Quicksort concentra o trabalho pesado **antes** das chamadas recursivas, por meio de uma rotina chamada **particionamento**.

## Conceito principal

Dado um subvetor contíguo $V[\text{inicio} \dots \text{fim}]$, o Quicksort opera em três etapas:

1. **Escolha do Pivô:** seleciona-se um elemento do intervalo como referência (`pivo`).
2. **Particionamento (`particionar`):** reorganiza-se o intervalo *in-place* em tempo linear $\Theta(n)$ de forma que:
   * Todos os elementos **menores ou iguais** ao pivô fiquem posicionados à sua **esquerda**.
   * Todos os elementos **maiores** que o pivô fiquem posicionados à sua **direita**.
   * Ao final dessa etapa, **o pivô já ocupa sua posição definitiva** no vetor ordenado e não precisará mais ser movido.
3. **Conquista (Recursão):** aplica-se o mesmo procedimento recursivamente ao subvetor à esquerda (`inicio` até `indice_pivo - 1`) e ao subvetor à direita (`indice_pivo + 1` até `fim`).

> **Regra fundamental:** o desempenho do Quicksort depende diretamente do equilíbrio entre os tamanhos das duas partições geradas. Quando o pivô divide o intervalo próximo à metade, a árvore de recursão possui altura $O(\log n)$ e o tempo total é $\Theta(n \log n)$. Se o pivô for sistematicamente o menor ou o maior elemento, uma partição terá tamanho $n - 1$ e a outra $0$, degradando o custo para $O(n^2)$.

### Estratégias para Evitar o Pior Caso $O(n^2)$

Quando adotamos sempre o último elemento (`V[fim]`) como pivô e o vetor de entrada já está ordenado (em ordem crescente ou decrescente), cada particionamento reduz o problema em apenas $1$ elemento ($T(n) = T(n-1) + \Theta(n) \Rightarrow O(n^2)$). Para prevenir esse cenário:

* **Pivoteamento Aleatório:** sorteia-se um índice aleatório no intervalo `[inicio, fim]` e troca-se esse elemento com `V[fim]` antes de particionar.
* **Mediana de Três:** compara-se o primeiro (`V[inicio]`), o central (`V[meio]`) e o último (`V[fim]`) elementos do intervalo, utilizando a **mediana** entre os três como pivô.

---

## Exemplo

Considere o particionamento de **Lomuto** (adotando o último elemento `V[fim]` como pivô) sobre o vetor:

```text
Índices:         0    1    2    3    4    5
Vetor inicial: [ 28 | 12 | 45 | 19 | 33 | 24 ]   (pivô = 24)
```

<details>
<summary><strong>Ver rastreamento passo a passo do Particionamento de Lomuto (pivô = 24)</strong></summary>

Mantemos um índice `i` marcando o fim da região de elementos $\le 24$ (inicia em `inicio - 1 = -1`) e percorremos `j` de `0` até `4`:

1. **`j = 0` (`V[0] = 28`):** $28 > 24$ $\rightarrow$ permanece na região dos maiores (`i = -1`).
2. **`j = 1` (`V[1] = 12`):** $12 \le 24$ $\rightarrow$ avança `i = 0` e troca `V[0]` com `V[1]`:
   `[ 12 | 28 | 45 | 19 | 33 | 24 ]`
3. **`j = 2` (`V[2] = 45`):** $45 > 24$ $\rightarrow$ permanece na região dos maiores (`i = 0`).
4. **`j = 3` (`V[3] = 19`):** $19 \le 24$ $\rightarrow$ avança `i = 1` e troca `V[1]` com `V[3]`:
   `[ 12 | 19 | 45 | 28 | 33 | 24 ]`
5. **`j = 4` (`V[4] = 33`):** $33 > 24$ $\rightarrow$ permanece na região dos maiores (`i = 1`).
6. **Posicionamento definitivo do pivô:** troca `V[5]` (`24`) com `V[i + 1]` (`V[2] = 45`):
   * **Resultado:** `[ 12 | 19 | (24) | 28 | 33 | 45 ]`
   * O pivô `24` está fixado no índice `2`. As chamadas recursivas agora atuam de forma independente sobre `[12, 19]` e `[28, 33, 45]`.

</details>

### Implementação em C (Com Mediana de Três)

Na implementação abaixo, `preparar_pivo_mediana` ordena localmente `V[inicio]`, `V[meio]` e `V[fim]` de modo que a mediana fique posicionada em `V[fim]`, pronta para ser usada pelo particionamento de Lomuto:

```c
#include <stdio.h>

void trocar(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Posiciona a mediana entre inicio, meio e fim em V[fim]
void preparar_pivo_mediana(int V[], int inicio, int fim) {
    int meio = inicio + (fim - inicio) / 2;
    if (V[meio] < V[inicio]) trocar(&V[inicio], &V[meio]);
    if (V[fim] < V[inicio])  trocar(&V[inicio], &V[fim]);
    if (V[meio] < V[fim])    trocar(&V[meio], &V[fim]);
}

int particionar(int V[], int inicio, int fim) {
    preparar_pivo_mediana(V, inicio, fim);
    int pivo = V[fim];
    int i = inicio - 1;

    for (int j = inicio; j < fim; j++) {
        if (V[j] <= pivo) {
            i++;
            trocar(&V[i], &V[j]);
        }
    }
    trocar(&V[i + 1], &V[fim]);
    return i + 1;
}

void quicksort(int V[], int inicio, int fim) {
    if (inicio < fim) {
        int indice_pivo = particionar(V, inicio, fim);
        quicksort(V, inicio, indice_pivo - 1);
        quicksort(V, indice_pivo + 1, fim);
    }
}

int main(void) {
    int dados[] = {28, 12, 45, 19, 33, 24};
    int n = sizeof(dados) / sizeof(dados[0]);

    quicksort(dados, 0, n - 1);

    for (int i = 0; i < n; i++) {
        printf("%d ", dados[i]);
    }
    printf("\n");
    return 0;
}
```

## Comparação e complexidade

| Critério | Análise no Quicksort | Detalhamento Técnico |
|:--|:--|:--|
| Melhor caso (tempo) | $O(n \log n)$ | Pivô divide o intervalo em duas metades equilibradas ($\approx n/2$) |
| Caso médio (tempo) | $O(n \log n)$ | Mesmo partições assimétricas (ex.: 90% e 10%) mantêm altura $O(\log n)$ |
| Pior caso (tempo) | $O(n^2)$ | Pivô escolhido é sempre um extremo ($T(n) = T(n-1) + O(n)$) |
| Memória auxiliar | $O(\log n)$ (médio) / $O(n)$ (pior) | Pilha de chamadas recursivas; não aloca vetor auxiliar (*in-place*) |
| Estabilidade | **Não estável** | Trocas durante o particionamento alteram a ordem relativa de chaves iguais |

## Teste de conhecimento

```quiz
{
  "question": "Ao término da execução da rotina de particionamento no Quicksort, qual garantia temos sobre o elemento escolhido como pivô?",
  "options": [
    { "text": "Ele estará sempre localizado exatamente no índice n / 2 do vetor.", "correct": false },
    { "text": "Ele já ocupa sua posição definitiva no vetor ordenado, com todos os menores ou iguais à esquerda e todos os maiores à direita.", "correct": true },
    { "text": "Ele será movido novamente nas chamadas recursivas seguintes até chegar à primeira posição.", "correct": false }
  ],
  "correctFeedback": "Correto! Como todos os elementos <= pivô estão à esquerda e todos os > pivô estão à direita, o índice retornado já é a posição final do pivô.",
  "incorrectFeedback": "Revise a invariante do particionamento: se ninguém à esquerda é maior que o pivô e ninguém à direita é menor, o pivô ainda precisa mudar de lugar?"
}
```

```quiz
{
  "question": "Qual cenário faz um Quicksort básico (que adota sempre o último elemento como pivô) degradar para o pior caso O(n²)?",
  "options": [
    { "text": "Quando o vetor de entrada já está completamente ordenado (em ordem crescente ou decrescente).", "correct": true },
    { "text": "Quando o vetor possui elementos distribuídos de forma uniforme e aleatória.", "correct": false },
    { "text": "Quando o tamanho n do vetor é um número ímpar.", "correct": false }
  ],
  "correctFeedback": "Exato! Em um vetor já ordenado, escolher o último elemento produz sempre um pivô extremo, gerando subproblemas de tamanho (n - 1) e 0.",
  "incorrectFeedback": "Analise o tamanho das duas partições quando o pivô escolhido é o maior (ou menor) elemento do intervalo."
}
```

```quiz
{
  "question": "Por que estratégias como Pivoteamento Aleatório ou Mediana de Três são aplicadas no Quicksort?",
  "options": [
    { "text": "Para tornar o Quicksort um algoritmo de ordenação estável.", "correct": false },
    { "text": "Para reduzir a probabilidade de selecionar pivôs extremos em vetores ordenados ou parcialmente ordenados, mantendo o tempo em O(n log n).", "correct": true },
    { "text": "Para eliminar completamente o uso da pilha de recursão.", "correct": false }
  ],
  "correctFeedback": "Correto! Escolher a mediana entre início, meio e fim garante partições equilibradas em vetores já ordenados, evitando o pior caso quadrático.",
  "incorrectFeedback": "Pense no impacto da escolha do pivô sobre o equilíbrio das duas partições geradas."
}
```