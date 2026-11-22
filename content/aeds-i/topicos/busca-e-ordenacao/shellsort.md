## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

* Compreender como o **Shellsort** supera a limitação de movimentações curtas dos métodos elementares por meio de **saltos decrescentes (*gaps*)**.

* Executar manualmente o processo de **$h$-ordenação** sobre um vetor dado uma sequência de incrementos.

* Implementar o Shellsort em C utilizando a **sequência de Knuth** ($h = 3h + 1$).

* Analisar o impacto da escolha da sequência de incrementos na complexidade assintótica e justificar por que o algoritmo é **instável** e ***in-place***.

## Introdução

Proposto por Donald Shell em 1959, o **Shellsort** foi um dos primeiros algoritmos a quebrar a barreira quadrática $O(n^2)$ dos métodos elementares de ordenação sem exigir memória auxiliar extra.

Nos métodos simples baseados em trocas ou deslocamentos entre elementos adjacentes (como o *Insertion Sort*), um elemento muito pequeno localizado próximo ao final do vetor precisa avançar uma posição por vez — exigindo até $n - 1$ movimentações para alcançar o início. O Shellsort resolve esse gargalo permitindo que elementos fora de posição realizem **saltos de longa distância** nas primeiras passadas, deixando o vetor "quase ordenado" antes da etapa final.

## Conceito principal

Em vez de comparar e deslocar apenas elementos vizinhos (distância $1$), o Shellsort utiliza uma **sequência decrescente de incrementos** (*gaps*):

$$
h_k > h_{k-1} > \dots > h_1 = 1
$$

Para cada incremento $h$ da sequência, o algoritmo particiona logicamente o vetor em $h$ subvetores intercalados (formados pelos elementos separados por distância $h$) e aplica a lógica de inserção direta dentro de cada subvetor. Ao final dessa passada, dizemos que o vetor está **$h$-ordenado** — ou seja, para todo índice $i \ge h$, vale $V[i - h] \le V[i]$.

> **Regra fundamental:** o último incremento da sequência **deve ser obrigatoriamente $h = 1$**. Quando $h = 1$, o algoritmo executa uma passada final de inserção direta entre vizinhos adjacentes. Como as etapas anteriores ($h > 1$) já eliminaram as inversões distantes, essa última etapa executa praticamente em tempo linear $O(n)$.

### Escolha da Sequência de Incrementos

O desempenho do Shellsort depende diretamente da sequência de *gaps* adotada:

* **Sequência original de Shell ($h = \lfloor n / 2^k \rfloor$):** simples de calcular, mas como os incrementos são potências de 2, índices pares e ímpares só se misturam no último passo ($h = 1$), levando a um pior caso $O(n^2)$.

* **Sequência de Knuth ($h_1 = 1,\; h_{k+1} = 3h_k + 1 \Rightarrow 1, 4, 13, 40, 121, \dots$):** evita múltiplos comuns entre passos consecutivos, garantindo pior caso $O(n^{3/2})$ ($\approx O(n^{1.5})$) e excelente velocidade prática para vetores de tamanho pequeno a médio.

## Exemplo

Considere o vetor de $8$ elementos e a sequência de incrementos $h \in \{4, 2, 1\}$:

```text
Índices:         0    1    2    3    4    5    6    7
Vetor inicial: [ 35 | 12 | 48 | 19 | 22 | 08 | 41 | 15 ]
```

<details>
<summary><strong>Ver rastreamento passo a passo com h = 4, h = 2 e h = 1</strong></summary>

1. **Passada 1 ($h = 4$ — compara pares separados por 4 posições):**
   * Subvetor `(0, 4)`: `[35, 22]` $\rightarrow$ troca $\rightarrow$ `[22, 35]`
   * Subvetor `(1, 5)`: `[12, 08]` $\rightarrow$ troca $\rightarrow$ `[08, 12]`
   * Subvetor `(2, 6)`: `[48, 41]` $\rightarrow$ troca $\rightarrow$ `[41, 48]`
   * Subvetor `(3, 7)`: `[19, 15]` $\rightarrow$ troca $\rightarrow$ `[15, 19]`
   * **Vetor 4-ordenado:** `[ 22 | 08 | 41 | 15 | 35 | 12 | 48 | 19 ]`

2. **Passada 2 ($h = 2$ — ordena índices pares entre si e ímpares entre si):**
   * Índices pares `(0, 2, 4, 6)`: `[22, 41, 35, 48]` $\rightarrow$ `[22, 35, 41, 48]`
   * Índices ímpares `(1, 3, 5, 7)`: `[08, 15, 12, 19]` $\rightarrow$ `[08, 12, 15, 19]`
   * **Vetor 2-ordenado:** `[ 22 | 08 | 35 | 12 | 41 | 15 | 48 | 19 ]`

3. **Passada 3 ($h = 1$ — ajuste fino entre vizinhos adjacentes):**
   * Todos os elementos já estão próximos de suas posições finais; poucos deslocamentos concluem a ordenação:
   * **Vetor ordenado:** `[ 08 | 12 | 15 | 19 | 22 | 35 | 41 | 48 ]`

</details>

### Implementação em C (Sequência de Knuth)

Note que não precisamos criar laços separados para cada um dos $h$ subvetores: basta iniciar o laço externo em `i = h` e retroceder `j` de `h` em `h` posições:

```c
#include <stdio.h>

void shellsort(int V[], int n) {
    int h = 1;

    // Gera o maior incremento da sequência de Knuth menor que n / 3
    while (h < n / 3) {
        h = 3 * h + 1;
    }

    while (h >= 1) {
        // Aplica inserção direta com salto h
        for (int i = h; i < n; i++) {
            int chave = V[i];
            int j = i;

            while (j >= h && V[j - h] > chave) {
                V[j] = V[j - h];
                j -= h;
            }
            V[j] = chave;
        }
        h = h / 3; // Avança para o próximo incremento menor
    }
}

int main(void) {
    int dados[] = {35, 12, 48, 19, 22, 8, 41, 15};
    int n = sizeof(dados) / sizeof(dados[0]);

    shellsort(dados, n);

    for (int i = 0; i < n; i++) {
        printf("%d ", dados[i]);
    }
    printf("\n");
    return 0;
}
```

## Comparação e complexidade

| Critério | Análise no Shellsort | Detalhamento Técnico |
| :--- | :--- | :--- |
| Melhor caso (tempo) | $O(n \log n)$ | Ocorre quando o vetor já está ordenado (apenas 1 comparação por elemento em cada salto $h$) |
| Pior caso (Shell $n / 2^k$) | $O(n^2)$ | Elementos em posições pares e ímpares não são comparados até $h = 1$ |
| Pior caso (Knuth $3h + 1$) | $O(n^{3/2})$ | Elimina múltiplos comuns entre *gaps*, reduzindo drasticamente o número de inversões |
| Memória auxiliar | $O(1)$ (*in-place*) | Usa apenas variáveis locais (`h`, `i`, `j`, `chave`), sem recursão nem vetores extras |
| Estabilidade | **Não estável** | Deslocamentos com salto $h > 1$ podem ultrapassar elementos intermediários de mesma chave |

## Teste de conhecimento

```quiz
{
  "question": "Qual é a principal vantagem do Shellsort em relação aos métodos elementares baseados em trocas entre vizinhos adjacentes?",
  "options": [
    { "text": "Ele garante estabilidade absoluta mesmo quando há registros com chaves repetidas.", "correct": false },
    { "text": "Ele realiza comparações e deslocamentos com saltos (gaps) maiores que 1 nas etapas iniciais, eliminando rapidamente inversões distantes antes do passo final h = 1.", "correct": true },
    { "text": "Ele divide o vetor em duas metades independentes e utiliza um vetor auxiliar O(n) para intercalá-las.", "correct": false }
  ],
  "correctFeedback": "Correto! Os saltos iniciais aproximam rapidamente os elementos de suas regiões corretas, tornando o passo final (h = 1) muito rápido.",
  "incorrectFeedback": "Pense no efeito de mover um elemento fora de lugar por h posições de cada vez em vez de 1 posição por iteração."
}
```

```quiz
{
  "question": "Por que todo Shellsort válido exige que o último valor do incremento h seja igual a 1?",
  "options": [
    { "text": "Porque sem o passo final h = 1, elementos pertencentes a subvetores intercalados diferentes nunca seriam comparados entre si.", "correct": true },
    { "text": "Porque a linguagem C não permite índices negativos quando h > 1.", "correct": false },
    { "text": "Porque o passo h = 1 é o único responsável por liberar a memória auxiliar alocada.", "correct": false }
  ],
  "correctFeedback": "Exato! Enquanto h > 1, o algoritmo ordena apenas subgrupos espaçados de h em h; somente h = 1 garante a ordenação global entre elementos vizinhos.",
  "incorrectFeedback": "Imagine o vetor após executar apenas h = 2: o subvetor dos índices pares está ordenado e o dos ímpares também, mas o vetor inteiro está ordenado?"
}
```

```quiz
{
  "question": "Quanto às propriedades estruturais do Shellsort, qual alternativa está correta?",
  "options": [
    { "text": "É estável e exige O(n) de memória auxiliar.", "correct": false },
    { "text": "É in-place (memória auxiliar O(1)), porém não é estável.", "correct": true },
    { "text": "É estável e possui pior caso O(n log n) independente da sequência de incrementos.", "correct": false }
  ],
  "correctFeedback": "Correto! O Shellsort opera diretamente no vetor original com espaço extra O(1), mas os saltos de distância h > 1 quebram a estabilidade.",
  "incorrectFeedback": "Avalie duas coisas: o Shellsort aloca um segundo vetor? E seus saltos de longa distância preservam a ordem de chaves iguais?"
}
```