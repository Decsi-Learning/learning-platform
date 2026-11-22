## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

* Identificar os critérios técnicos utilizados para comparar algoritmos de ordenação: **complexidade de tempo**, **uso de memória auxiliar (*in-place*)** e **estabilidade**.

* Diferenciar o custo de **comparações entre chaves** do custo de **movimentações (trocas/deslocamentos) de registros**.

* Compreender o conceito de **estabilidade** na ordenação e analisar por que algoritmos que realizam trocas distantes podem perder essa propriedade.

* Aplicar técnicas práticas em C (como desempate por chave secundária ou índice original) para preservar a ordem relativa em registros compostos.

## Introdução

Na busca binária, vimos que dados ordenados reduzem drasticamente o tempo de consulta. No entanto, em aplicações reais, **ordenar** não é apenas colocar números em ordem crescente: frequentemente ordenamos coleções de registros estruturados (`struct`), contendo múltiplos campos (como matrícula, nota, data de nascimento, prioridade ou nome).

Quando vários algoritmos resolvem o mesmo problema de ordenação, como escolher o mais adequado? Em AEDS I, a decisão envolve equilibrar **tempo de execução**, **consumo de memória** e **preservação da ordem relativa** dos dados.

## Conceito principal

### 1. Métricas de Eficiência: Comparações, Movimentações e Memória

Ao avaliar um algoritmo de ordenação sobre uma entrada de $n$ elementos, observamos três grandezas principais:

* **Número de comparações ($C(n)$):** quantas vezes duas chaves são comparadas (por exemplo, `V[i] > V[j]`). Quando a comparação envolve chaves compostas ou cadeias de caracteres longas, o número de comparações pesa diretamente no tempo total.

* **Número de movimentações ($M(n)$):** quantas vezes elementos são copiados, deslocados ou trocados de posição no vetor. Se cada posição de $V$ armazena uma `struct` volumosa (com dezenas ou centenas de bytes), copiar registros repetidamente torna-se mais custoso do que comparar chaves.

* **Uso de memória auxiliar (*In-Place*):** dizemos que um algoritmo é ***in-place*** (no próprio local) quando reorganiza os elementos usando apenas espaço extra constante $O(1)$ além do vetor de entrada — ou $O(\log n)$ reservado à pilha de chamadas recursivas —, sem alocar um segundo vetor de tamanho proporcional a $n$.

> **Regra fundamental:** um algoritmo rápido em tempo assintótico pode não ser a única escolha se exigir um vetor auxiliar $O(n)$ em ambientes com memória restrita, ou se alterar a ordem de registros empatados quando isso importa para o domínio do problema.

### 2. Estabilidade na Ordenação

Um algoritmo de ordenação é **estável** quando **preserva a ordem relativa original** entre elementos que possuem chaves iguais.

Se dois elementos $A$ e $B$ satisfazem $\text{chave}(A) = \text{chave}(B)$ e $A$ ocorre antes de $B$ na sequência de entrada, um algoritmo estável garante que $A$ continuará antes de $B$ na sequência ordenada.

* **Quando a estabilidade importa:** em ordenações em múltiplas etapas ou sobre registros com múltiplos campos. Por exemplo: ordenar uma lista de inscrições por **curso** mantendo quem se inscreveu primeiro, ou ordenar registros já ordenados por **nome** agora por **nota**, preservando a ordem alfabética dentro de cada faixa de nota.

* **Quando a estabilidade não altera o resultado:** quando ordenamos chaves primitivas (como inteiros simples sem dados associados) ou quando cada elemento possui uma chave única (como um CPF ou matrícula sem empates).

## Exemplo

Considere um vetor de registros de alunos já ordenado alfabeticamente por **nome**, que será ordenado em ordem decrescente pela **nota**:

```text
Entrada (ordenada por Nome):
  0: ("Ana",    nota = 8.5)
  1: ("Bruno",  nota = 9.0)
  2: ("Carlos", nota = 8.5)
  3: ("Diana",  nota = 7.0)

Ordenação ESTÁVEL por nota (decrescente):
  0: ("Bruno",  nota = 9.0)
  1: ("Ana",    nota = 8.5)   <-- "Ana" continua antes de "Carlos"
  2: ("Carlos", nota = 8.5)
  3: ("Diana",  nota = 7.0)

Ordenação INSTÁVEL por nota (decrescente):
  0: ("Bruno",  nota = 9.0)
  1: ("Carlos", nota = 8.5)   <-- "Carlos" passou na frente de "Ana"
  2: ("Ana",    nota = 8.5)
  3: ("Diana",  nota = 7.0)
```

### Por que trocas distantes podem quebrar a estabilidade?

Algoritmos que movimentam elementos apenas entre posições adjacentes ou intercalam sequências respeitando a ordem da esquerda tendem a preservar empates. Já algoritmos que efetuam **trocas de longa distância** (movendo um elemento de uma ponta a outra do vetor em um único passo) podem saltar sobre um registro de chave igual e inverter a ordem relativa original.

### Implementação em C: Garantindo Estabilidade em Critérios Compostos

Em C, mesmo ao utilizar um algoritmo intrinsecamente instável (como os métodos avançados que veremos adiante), podemos obter um resultado estável incorporando a **posição original** (ou um critério de desempate explícito) na função de comparação:

```c
#include <stdio.h>

typedef struct {
    char nome[40];
    float nota;
    int ordem_original;
} RegistroAluno;

/*
 * Retorna valor < 0 se 'a' deve vir antes de 'b',
 * > 0 se 'b' deve vir antes de 'a', e 0 se equivalentes.
 * Prioridade 1: maior nota primeiro.
 * Prioridade 2 (desempate): menor ordem_original primeiro (estabilidade).
 */
int comparar_por_nota_estavel(const RegistroAluno *a, const RegistroAluno *b) {
    if (a->nota > b->nota) return -1;
    if (a->nota < b->nota) return 1;
    if (a->ordem_original < b->ordem_original) return -1;
    if (a->ordem_original > b->ordem_original) return 1;
    return 0;
}

void exibir_alunos(const RegistroAluno V[], int n) {
    for (int i = 0; i < n; i++) {
        printf("%d. %-8s | Nota: %.1f | Origem: %d\n",
               i + 1, V[i].nome, V[i].nota, V[i].ordem_original);
    }
}

int main(void) {
    RegistroAluno turma[4] = {
        {"Ana",    8.5f, 0},
        {"Bruno",  9.0f, 1},
        {"Carlos", 8.5f, 2},
        {"Diana",  7.0f, 3}
    };

    exibir_alunos(turma, 4);
    return 0;
}
```

## Comparação e complexidade

A tabela abaixo resume como os critérios de análise se aplicam às famílias de algoritmos de ordenação da disciplina (incluindo os métodos elementares vistos na base da trilha e os algoritmos avançados que estudaremos a seguir):

| Algoritmo | Pior Caso | Caso Médio | Espaço Extra | Estável? | Observação de Uso |
|:--|:--|:--|:--|:--|:--|
| Métodos elementares (*Bubble / Selection / Insertion*) | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Varia* | Adequados para vetores pequenos ou quase ordenados (*Insertion*) |
| **Shellsort** | Depende do *gap* | Depende do *gap* | $O(1)$ | Não | Melhora o *Insertion* com saltos; simples e *in-place* |
| **Quicksort** | $O(n^2)$ | $O(n \log n)$ | $O(\log n)$ | Não | Muito rápido na prática; exige cuidado com escolha do pivô |
| **Mergesort** | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Sim | Tempo garantido $O(n \log n)$ e estável; custa memória auxiliar |
| **Heapsort** | $O(n \log n)$ | $O(n \log n)$ | $O(1)$ | Não | Garante $O(n \log n)$ *in-place* sem vetor auxiliar $O(n)$ |

*\*Na base elementar, Insertion Sort e Bubble Sort (com troca apenas quando estritamente maior) são estáveis, enquanto Selection Sort padrão é instável.*

## Teste de conhecimento

```quiz
{
  "question": "O que significa dizer que um algoritmo de ordenação é ESTÁVEL?",
  "options": [
    { "text": "Ele mantém a mesma complexidade de tempo em todos os casos de entrada.", "correct": false },
    { "text": "Ele preserva a ordem relativa original entre elementos que possuem chaves iguais.", "correct": true },
    { "text": "Ele ordena os dados sem utilizar nenhuma memória auxiliar além do vetor original.", "correct": false }
  ],
  "correctFeedback": "Correto! A estabilidade garante que, na presença de chaves empatadas, a ordem anterior entre esses registros não seja alterada.",
  "incorrectFeedback": "Lembre-se de o que acontece quando dois elementos têm a mesma chave de ordenação: a estabilidade protege a ordem relativa entre eles."
}
```

```quiz
{
  "question": "Qual critério caracteriza um algoritmo como IN-PLACE?",
  "options": [
    { "text": "Exigir memória auxiliar proporcional ao tamanho n do vetor para intercalar metades.", "correct": false },
    { "text": "Realizar a ordenação diretamente na estrutura de entrada usando apenas espaço extra constante O(1) (ou O(log n) da pilha de recursão).", "correct": true },
    { "text": "Não realizar nenhuma movimentação de elementos durante a execução.", "correct": false }
  ],
  "correctFeedback": "Exato! Um algoritmo in-place evita alocar estruturas auxiliares de tamanho O(n), operando no próprio espaço do vetor.",
  "incorrectFeedback": "Avalie o consumo de memória extra em relação ao tamanho n do vetor de entrada."
}
```

```quiz
{
  "question": "Em um sistema que ordena uma lista de pedidos primeiro pela data de chegada e, em seguida, pelo status de prioridade, por que a estabilidade é relevante?",
  "options": [
    { "text": "Porque sem estabilidade, pedidos com o mesmo status de prioridade podem ter a ordem de chegada (antiguidade) embaralhada.", "correct": true },
    { "text": "Porque a estabilidade transforma qualquer algoritmo de complexidade O(n²) em O(log n).", "correct": false },
    { "text": "Porque a estabilidade impede que haja dois pedidos com o mesmo status de prioridade.", "correct": false }
  ],
  "correctFeedback": "Correto! Preservar a ordem relativa nos empates mantém o critério de desempate natural dado pela ordem anterior (data de chegada).",
  "incorrectFeedback": "Pense no que ocorre com dois pedidos que compartilham o mesmo status de prioridade quando o vetor já estava ordenado por data."
}
```