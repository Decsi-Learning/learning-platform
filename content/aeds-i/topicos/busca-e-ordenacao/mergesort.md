## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender o paradigma de **Divisão e Conquista** aplicado ao **Mergesort**, focando na divisão recursiva ao meio e na etapa de **intercalação (*merge*)**.
- Executar manualmente o rastreamento da divisão até subvetores unitários e da intercalação ordenada no retorno da recursão.
- Implementar o Mergesort em C com alocação dinâmica segura de memória auxiliar (`malloc` / `free`) e preservação da estabilidade.
- Justificar por que o Mergesort garante complexidade $\Theta(n \log n)$ em todos os casos, avaliando o trade-off do custo espacial $\Theta(n)$.

## 1. Conexão com a Trilha: Onde Estamos?

Nos módulos anteriores desta trilha, construímos todo o repertório de trade-offs entre velocidade, previsibilidade, memória e estabilidade:

- Em **Busca Sequencial e Busca Binária**, vimos como dados ordenados habilitam pesquisas em $O(\log n)$ e exploramos a recursão sobre intervalos divididos ao meio (`inicio`, `meio`, `fim`).
- Em **Eficiência e Estabilidade na Ordenação**, analisamos por que a **estabilidade** é indispensável ao ordenar registros compostos (`struct`) em múltiplas etapas e como o uso de memória auxiliar distingue algoritmos *in-place* ($O(1)$) de algoritmos com arranjos temporários ($O(n)$).
- Nos **Métodos Elementares**, no **Shellsort** e no **Quicksort**, observamos um dilema recorrente: os algoritmos *in-place* mais rápidos que vimos até aqui (*Shellsort* e *Quicksort*) sacrificam a **estabilidade** e ainda carregam o risco teórico de degradação acima de $O(n \log n)$ no pior caso.

Agora surge a pergunta central deste módulo:

> **Como projetar um algoritmo de Divisão e Conquista que seja simultaneamente estável e imune a piores casos quadráticos — garantindo complexidade $O(n \log n)$ para qualquer entrada?**

A resposta é o **Mergesort**: ao dividir o vetor exatamente ao meio e realizar a ordenação durante a **intercalação (*merge*)** no retorno da recursão, ele assegura previsibilidade total em $O(n \log n)$ e estabilidade, cobrando em troca um espaço auxiliar de $O(n)$.

## 2. Introdução

Enquanto o *Quicksort* reorganiza os elementos em torno de um pivô **antes** das chamadas recursivas, o **Mergesort** (proposto por John von Neumann em 1945) segue a abordagem oposta dentro do paradigma de **Divisão e Conquista**: ele divide o vetor ao meio sucessivamente até obter subvetores de tamanho $1$ (que já estão trivialmente ordenados) e concentra todo o trabalho de ordenação **no retorno da recursão**, combinando metades previamente ordenadas por meio da operação de **intercalação (*merge*)**.

Essa estratégia confere ao Mergesort uma propriedade fundamental: **previsibilidade assintótica**. Diferente do Quicksort simples, ele não sofre degradação quadrática $O(n^2)$ — sua execução é sempre $\Theta(n \log n)$, independentemente da ordem inicial dos dados.

## 3. Conceito principal

Dado um intervalo contíguo $V[\text{inicio} \dots \text{fim}]$:

1. **Divisão:** calculamos o índice central $\text{meio} = \text{inicio} + \lfloor (\text{fim} - \text{inicio}) / 2 \rfloor$, particionando o problema em dois subvetores de tamanhos praticamente iguais: $V[\text{inicio} \dots \text{meio}]$ e $V[\text{meio} + 1 \dots \text{fim}]$.
2. **Conquista (Caso Base e Recursão):** enquanto $\text{inicio} < \text{fim}$, ordenamos recursivamente a metade esquerda e a metade direita. Quando $\text{inicio} \ge \text{fim}$, o subvetor possui $0$ ou $1$ elemento e já está ordenado.
3. **Combinação (`intercalar` / `merge`):** mesclamos os dois subvetores ordenados em uma única sequência ordenada no intervalo $V[\text{inicio} \dots \text{fim}]$, comparando sucessivamente o menor elemento ainda não processado de cada metade.

> **Regra fundamental:** a intercalação de duas metades que somam $m$ elementos executa em tempo estritamente linear $\Theta(m)$. Como a divisão binária produz $\lceil \log_2 n \rceil$ níveis na árvore de recursão e cada nível processa todos os $n$ elementos no total, a recorrência $T(n) = 2T(n/2) + \Theta(n)$ resulta sempre em $\Theta(n \log n)$ no melhor caso, no caso médio e no pior caso.

### 3.1 Estabilidade na Intercalação

O Mergesort é naturalmente **estável** desde que, durante a intercalação, a **metade esquerda tenha prioridade em caso de empate**: sempre que o elemento atual da esquerda for menor ou igual (`<=`) ao elemento atual da direita, copiamos primeiro o da esquerda. Dessa forma, registros com chaves iguais mantêm sua ordem relativa original.

---

## 4. Exemplo

Considere a ordenação do vetor de $6$ elementos abaixo:

```text
Índices:         0    1    2    3    4    5
Vetor inicial: [ 38 | 27 | 43 | 03 | 09 | 82 ]
```

<details>
<summary><strong>Ver rastreamento passo a passo da divisão e da intercalação</strong></summary>

1. **Fase de Divisão (descida da recursão até casos base unitários):**
   - `[38, 27, 43, 3, 9, 82]` $\rightarrow$ `[38, 27, 43]` e `[3, 9, 82]`
   - `[38, 27, 43]` $\rightarrow$ `[38, 27]` e `[43]` $\rightarrow$ `[38]`, `[27]` e `[43]`
   - `[3, 9, 82]` $\rightarrow$ `[3, 9]` e `[82]` $\rightarrow$ `[3]`, `[9]` e `[82]`

2. **Fase de Intercalação (subida da recursão):**
   - Intercala `[38]` e `[27]` $\rightarrow$ `[27, 38]`
   - Intercala `[27, 38]` e `[43]` $\rightarrow$ `[27, 38, 43]`
   - Intercala `[3]` e `[9]` $\rightarrow$ `[3, 9]`
   - Intercala `[3, 9]` e `[82]` $\rightarrow$ `[3, 9, 82]`

3. **Intercalação final das duas metades (`[27, 38, 43]` e `[3, 9, 82]`):**
   - Compara `27` e `3` $\rightarrow$ copia `3` (`[3]`)
   - Compara `27` e `9` $\rightarrow$ copia `9` (`[3, 9]`)
   - Compara `27` e `82` $\rightarrow$ copia `27` (`[3, 9, 27]`)
   - Compara `38` e `82` $\rightarrow$ copia `38` (`[3, 9, 27, 38]`)
   - Compara `43` e `82` $\rightarrow$ copia `43` (`[3, 9, 27, 38, 43]`)
   - Copia o restante da metade direita (`82`) $\rightarrow$ **Vetor final:** `[ 03 | 09 | 27 | 38 | 43 | 82 ]`

</details>

### 4.1 Implementação em C

Em C, a rotina `intercalar` aloca dois vetores temporários para armazenar as cópias das metades esquerda e direita, evitando sobrescrever elementos de `V` antes de serem comparados, e libera a memória com `free` logo após a mesclagem:

```c
#include <stdio.h>
#include <stdlib.h>

void intercalar(int V[], int inicio, int meio, int fim) {
    int n_esq = meio - inicio + 1;
    int n_dir = fim - meio;

    int *esq = (int *) malloc((size_t)n_esq * sizeof(int));
    int *dir = (int *) malloc((size_t)n_dir * sizeof(int));

    if (esq == NULL || dir == NULL) {
        free(esq);
        free(dir);
        return;
    }

    for (int i = 0; i < n_esq; i++) esq[i] = V[inicio + i];
    for (int j = 0; j < n_dir; j++) dir[j] = V[meio + 1 + j];

    int i = 0, j = 0, k = inicio;

    // '<=' garante estabilidade ao priorizar o elemento da metade esquerda em empates
    while (i < n_esq && j < n_dir) {
        if (esq[i] <= dir[j]) {
            V[k++] = esq[i++];
        } else {
            V[k++] = dir[j++];
        }
    }

    while (i < n_esq) {
        V[k++] = esq[i++];
    }

    while (j < n_dir) {
        V[k++] = dir[j++];
    }

    free(esq);
    free(dir);
}

void mergesort(int V[], int inicio, int fim) {
    if (inicio < fim) {
        int meio = inicio + (fim - inicio) / 2;
        mergesort(V, inicio, meio);
        mergesort(V, meio + 1, fim);
        intercalar(V, inicio, meio, fim);
    }
}

int main(void) {
    int dados[] = {38, 27, 43, 3, 9, 82};
    int n = sizeof(dados) / sizeof(dados[0]);

    mergesort(dados, 0, n - 1);

    for (int i = 0; i < n; i++) {
        printf("%d ", dados[i]);
    }
    printf("\n");
    return 0;
}
```

## 5. Comparação e complexidade

| Critério | Análise no Mergesort | Detalhamento Técnico |
|:--|:--|:--|
| Melhor caso (tempo) | $O(n \log n)$ | Sempre divide ao meio e executa a intercalação completa |
| Caso médio (tempo) | $O(n \log n)$ | Desempenho independente da disposição inicial das chaves |
| Pior caso (tempo) | $O(n \log n)$ | Sem degradação quadrática (vantagem sobre o Quicksort simples) |
| Memória auxiliar | $O(n)$ | Exige arranjos auxiliares para intercalação + $O(\log n)$ da pilha recursiva |
| Estabilidade | **Estável** | Preserva a ordem original em empates quando usa `esq[i] <= dir[j]` |

## 6. Teste de conhecimento

```quiz
{
  "question": "Qual é a principal vantagem do Mergesort em comparação ao Quicksort em aplicações críticas que exigem previsibilidade e preservação de ordem?",
  "options": [
    { "text": "Garante complexidade de tempo O(n log n) mesmo no pior caso e é naturalmente estável.", "correct": true },
    { "text": "Não utiliza nenhuma memória auxiliar além de variáveis inteiras simples O(1).", "correct": false },
    { "text": "Dispensa comparações entre elementos durante a fase de intercalação.", "correct": false }
  ],
  "correctFeedback": "Correto! O Mergesort sempre divide o vetor em duas metades iguais e intercala em tempo linear, garantindo O(n log n) em todos os casos e estabilidade.",
  "incorrectFeedback": "Compare os trade-offs entre os dois algoritmos: o que o Mergesort garante que o Quicksort não garante?"
}
```

```quiz
{
  "question": "Qual é a principal desvantagem (custo estrutural) do Mergesort tradicional quando aplicado sobre vetores em memória principal?",
  "options": [
    { "text": "A complexidade de tempo degrada para O(n²) quando o vetor está inversamente ordenado.", "correct": false },
    { "text": "A exigência de memória auxiliar O(n) para realizar a intercalação ordenada das metades.", "correct": true },
    { "text": "A impossibilidade de ordenar vetores cujo tamanho n seja um número ímpar.", "correct": false }
  ],
  "correctFeedback": "Exato! A intercalação em vetores requer alocação de espaço extra proporcional a n, tornando-o um algoritmo não in-place.",
  "incorrectFeedback": "Lembre-se do que a função intercalar precisa alocar para mesclar as duas metades sem sobrescrever valores ainda não comparados."
}
```

```quiz
{
  "question": "Durante a etapa de intercalação (merge) entre duas metades ordenadas, qual regra garante que o Mergesort seja estável?",
  "options": [
    { "text": "Priorizar sempre o elemento da metade direita quando houver igualdade entre chaves.", "correct": false },
    { "text": "Copiar primeiro o elemento da metade esquerda sempre que ele for menor ou igual (<=) ao da metade direita.", "correct": true },
    { "text": "Inverter a ordem dos elementos empatados ao final de cada nível da recursão.", "correct": false }
  ],
  "correctFeedback": "Correto! Como os elementos da metade esquerda apareciam antes no vetor original, copiá-los primeiro em caso de empate (<=) preserva a ordem relativa.",
  "incorrectFeedback": "Pense em qual das duas metades contém os elementos que ocupavam posições anteriores no vetor de entrada."
}
```
---
## 7. Ponte para o Próximo Módulo da Trilha

Neste módulo, vimos como o **Mergesort** resolve os dois pontos fracos do Quicksort — entregando **pior caso garantido em $O(n \log n)$** e **estabilidade** —, mas descobrimos o preço dessa conquista: a necessidade de alocar **memória auxiliar proporcional a $O(n)$** durante a intercalação.

Com isso, surgem perguntas fundamentais que vão guiar a próxima e última etapa dos métodos de ordenação interna:

- **É possível reunir o melhor dos dois mundos** — garantindo tempo **$O(n \log n)$ mesmo no pior caso** (como o Mergesort), mas operando estritamente ***in-place* com espaço extra $O(1)$** (como o Quicksort e os métodos elementares)?
- **Como transformar a ideia clássica do *Selection Sort*** (selecionar o maior elemento a cada passo) em um algoritmo $O(n \log n)$ utilizando uma estrutura hierárquica implícita dentro do próprio vetor?

É exatamente isso que vamos explorar no próximo passo da trilha:

> **Próximo Módulo 🔜:** **Heapsort** — ordenação *in-place* com pior caso $O(n \log n)$ garantido por meio de Max-Heaps e síntese final dos algoritmos de ordenação!