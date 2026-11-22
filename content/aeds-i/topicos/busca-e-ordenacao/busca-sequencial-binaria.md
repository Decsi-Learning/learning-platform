## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender o problema fundamental da recuperação de informação em memória principal e o papel da pré-condição de ordenação.
- Implementar e analisar a **Busca Sequencial** (padrão e com sentinela) em vetores não ordenados.
- Compreender o princípio de redução do espaço de busca da **Busca Binária** e provar intuitivamente seu limite de $\lfloor \log_2 n \rfloor + 1$ comparações.
- Implementar a Busca Binária nas versões **iterativa** e **recursiva** em C, prevenindo estouro de inteiro (*integer overflow*) no cálculo do índice central.
- Avaliar o trade-off entre o custo de ordenar previamente um vetor e o ganho assintótico em múltiplas consultas.

## Introdução

Em praticamente qualquer sistema computacional (de um catálogo de alunos em uma universidade até índices de bancos de dados), armazenar informações só faz sentido se formos capazes de **encontrá-las rapidamente** quando necessário.

Formalmente, dado um vetor $V$ de $n$ elementos (indexados de `0` a `n - 1`) e uma chave de pesquisa $x$, o **problema da busca** consiste em determinar se existe algum índice $i$ tal que $V[i] = x$, retornando sua posição em caso de sucesso ou um sinalizador de falha (comumente `-1`) caso contrário.

A escolha entre as duas estratégias clássicas de pesquisa em memória depende diretamente de uma única pergunta estrutural: **os dados estão previamente ordenados?**

## Conceito principal

### 1. Busca Sequencial (Linear)

A **Busca Sequencial** é a estratégia mais direta possível: como não há garantia alguma sobre a ordem dos elementos em $V$, examinamos cada posição sequencialmente a partir do índice `0` até encontrar a chave $x$ ou atingir o fim do vetor (`n - 1`).

- **Vantagem:** funciona sobre qualquer coleção de dados, mesmo completamente desordenada, e não exige pré-processamento.
- **Limitação:** no pior caso (quando $x$ está na última posição ou não existe no vetor), todas as $n$ posições precisam ser verificadas, resultando em custo linear $O(n)$.

> **Otimização clássica — Busca com Sentinela:** em vetores que possuem uma posição extra reservada ao final (`V[n]`), podemos gravar a própria chave $x$ em `V[n]` antes de iniciar o laço. Isso garante que a busca sempre encontrará $x$, eliminando o teste de limite `i < n` a cada iteração do `while` e reduzindo pela metade o número de comparações de controle do laço.

### 2. Busca Binária (*Binary Search*)

A **Busca Binária** explora a **ordenação prévia** do vetor ($V[0] \le V[1] \le \dots \le V[n-1]$) para aplicar o paradigma de **Divisão e Conquista**.

Em vez de avançar de um em um, mantemos dois delimitadores que definem o intervalo ativo de busca: `inicio` e `fim`. A cada passo, calculamos o índice central `meio` e comparamos $x$ com $V[\text{meio}]$:

1. **Se $x == V[\text{meio}]$:** a chave foi localizada; retornamos `meio`.
2. **Se $x < V[\text{meio}]$:** pela transitividade da ordenação, $x$ é estritamente menor que todos os elementos à direita de `meio`. Descartamos toda a metade superior fazendo `fim = meio - 1`.
3. **Se $x > V[\text{meio}]$:** $x$ é estritamente maior que todos os elementos à esquerda de `meio`. Descartamos toda a metade inferior fazendo `inicio = meio + 1`.

Se em algum momento `inicio > fim`, o intervalo ativo tornou-se vazio e concluímos com certeza que $x$ não pertence ao vetor.

> **Regra fundamental:** a cada comparação malsucedida, a Busca Binária **elimina metade dos candidatos restantes**. Partindo de $n$ elementos, o tamanho do intervalo cai sucessivamente para $n/2, n/4, n/8, \dots, 1$. O número máximo de passos $k$ satisfaz $2^k \le n$, o que implica no máximo $\lfloor \log_2 n \rfloor + 1$ comparações — complexidade $O(\log n)$.

---

## Exemplo

Considere a busca em um vetor ordenado de $11$ elementos ($n = 11$):

```text
Índices:   0     1     2     3     4     5     6     7     8     9    10
Vetor V: [ 5  | 12  | 19  | 24  | 31  | 38  | 44  | 52  | 61  | 73  | 89 ]
```

<details>
<summary><strong>Caso A — Rastreamento com sucesso: buscar x = 61</strong></summary>

1. **Iteração 1:** `inicio = 0`, `fim = 10`
   - `meio = 0 + (10 - 0) / 2 = 5` $\rightarrow$ $V[5] = 38$.
   - Como $61 > 38$, descartamos os índices `[0..5]` e ajustamos `inicio = 6`.
2. **Iteração 2:** `inicio = 6`, `fim = 10`
   - `meio = 6 + (10 - 6) / 2 = 8` $\rightarrow$ $V[8] = 61$.
   - Como $61 == V[8]$, **sucesso! Retorna índice `8`** com apenas **2 comparações** (na Busca Sequencial seriam necessárias 9 comparações).

</details>

<details>
<summary><strong>Caso B — Rastreamento sem sucesso: buscar x = 27</strong></summary>

1. **Iteração 1:** `inicio = 0`, `fim = 10` $\rightarrow$ `meio = 5` ($V[5] = 38$). Como $27 < 38$, `fim = 4`.
2. **Iteração 2:** `inicio = 0`, `fim = 4` $\rightarrow$ `meio = 2` ($V[2] = 19$). Como $27 > 19$, `inicio = 3`.
3. **Iteração 3:** `inicio = 3`, `fim = 4` $\rightarrow$ `meio = 3` ($V[3] = 24$). Como $27 > 24$, `inicio = 4`.
4. **Iteração 4:** `inicio = 4`, `fim = 4` $\rightarrow$ `meio = 4` ($V[4] = 31$). Como $27 < 31$, `fim = 3`.
5. **Condição de parada:** agora `inicio = 4` e `fim = 3` (`inicio > fim`). O laço encerra e **retorna `-1`** após $\lfloor \log_2 11 \rfloor + 1 = 4$ comparações.

</details>

### Implementação em C

Um detalhe técnico importante em C diz respeito ao cálculo do índice central. Em vetores muito grandes (próximos ao limite de representação do tipo `int`, $2^{31} - 1$), a expressão clássica `(inicio + fim) / 2` pode causar **estouro de inteiro (*integer overflow*)**, resultando em um índice negativo e falha de segmentação (*Segmentation Fault*). A forma segura e recomendada é:

$$\text{meio} = \text{inicio} + \left\lfloor \frac{\text{fim} - \text{inicio}}{2} \right\rfloor$$

```c
#include <stdio.h>

// 1. Busca Sequencial Padrão: O(n) no pior caso, funciona em vetores desordenados
int busca_sequencial(const int V[], int n, int x) {
    for (int i = 0; i < n; i++) {
        if (V[i] == x) {
            return i;
        }
    }
    return -1;
}

// 2. Busca Binária Iterativa: O(log n) tempo e O(1) memória auxiliar
int busca_binaria_iterativa(const int V[], int n, int x) {
    int inicio = 0;
    int fim = n - 1;

    while (inicio <= fim) {
        int meio = inicio + (fim - inicio) / 2;

        if (V[meio] == x) {
            return meio;
        } else if (x < V[meio]) {
            fim = meio - 1;
        } else {
            inicio = meio + 1;
        }
    }
    return -1;
}

// 3. Busca Binária Recursiva: O(log n) tempo e O(log n) na pilha de chamadas
int busca_binaria_recursiva(const int V[], int inicio, int fim, int x) {
    if (inicio > fim) {
        return -1;
    }

    int meio = inicio + (fim - inicio) / 2;

    if (V[meio] == x) {
        return meio;
    }
    if (x < V[meio]) {
        return busca_binaria_recursiva(V, inicio, meio - 1, x);
    }
    return busca_binaria_recursiva(V, meio + 1, fim, x);
}

int main(void) {
    int dados[] = {5, 12, 19, 24, 31, 38, 44, 52, 61, 73, 89};
    int n = sizeof(dados) / sizeof(dados[0]);

    printf("Busca Binaria (61): indice %d\n", busca_binaria_iterativa(dados, n, 61));
    printf("Busca Binaria (27): indice %d\n", busca_binaria_recursiva(dados, 0, n - 1, 27));
    return 0;
}
```

## Comparação e complexidade

### Quando vale a pena ordenar antes de buscar?

Ordenar um vetor de $n$ elementos com um algoritmo eficiente custa $O(n \log n)$. Portanto:

- Se você precisa realizar **apenas uma única busca** em um vetor desordenado, usar **Busca Sequencial** diretamente ($O(n)$) é mais rápido do que ordenar ($O(n \log n)$) para depois aplicar Busca Binária ($O(\log n)$).
- Se o vetor será consultado **$k$ vezes** (com $k$ grande, como em catálogos e consultas frequentes), o custo acumulado de $k$ buscas sequenciais seria $O(k \cdot n)$, enquanto ordenar uma vez e realizar $k$ buscas binárias custa $O(n \log n + k \log n)$ — uma diferença ordens de grandeza superior.

| Critério | Busca Sequencial | Busca Binária (Iterativa) | Busca Binária (Recursiva) |
|:--|:--|:--|:--|
| Organização exigida | Nenhuma (vetor qualquer) | Vetor estritamente ordenado | Vetor estritamente ordenado |
| Melhor caso (tempo) | $O(1)$ (1ª posição) | $O(1)$ (elemento central) | $O(1)$ (elemento central) |
| Caso médio (tempo) | $O(n)$ ($\approx \frac{n+1}{2}$ testes) | $O(\log n)$ | $O(\log n)$ |
| Pior caso (tempo) | $O(n)$ ($n$ testes) | $O(\log n)$ ($\lfloor \log_2 n \rfloor + 1$) | $O(\log n)$ ($\lfloor \log_2 n \rfloor + 1$) |
| Memória auxiliar | $O(1)$ | $O(1)$ | $O(\log n)$ (pilha de recursão) |
| Comparações ($n = 10^6$) | Até $1.000.000$ | No máximo $20$ | No máximo $20$ |

## Teste de conhecimento

```quiz
{
  "question": "Qual condição estrutural é obrigatória para garantir que a Busca Binária retorne o resultado correto em qualquer consulta?",
  "options": [
    { "text": "O vetor deve estar previamente ordenado segundo o mesmo critério usado nas comparações.", "correct": true },
    { "text": "O tamanho n do vetor deve ser obrigatoriamente uma potência exata de 2.", "correct": false },
    { "text": "O vetor não pode conter elementos repetidos.", "correct": false }
  ],
  "correctFeedback": "Correto! A ordenação garante que, se x < V[meio], nenhum elemento à direita de meio pode ser igual a x, legitimando o descarte de metade do vetor.",
  "incorrectFeedback": "Revise a premissa fundamental do algoritmo: o que permite descartar metade do intervalo sem sequer olhar seus elementos?"
}
```

```quiz
{
  "question": "Por que a expressão 'meio = inicio + (fim - inicio) / 2' é preferida em C no lugar de 'meio = (inicio + fim) / 2'?",
  "options": [
    { "text": "Porque reduz a complexidade de tempo da Busca Binária de O(log n) para O(1).", "correct": false },
    { "text": "Porque evita estouro de inteiro (integer overflow) quando a soma inicio + fim ultrapassa o limite máximo suportado pelo tipo int.", "correct": true },
    { "text": "Porque a divisão inteira em C arredonda para cima quando usamos parênteses.", "correct": false }
  ],
  "correctFeedback": "Exato! Matematicamente as duas expressões são idênticas, mas subtrair primeiro impede que a soma intermediária exceda INT_MAX em vetores muito grandes.",
  "incorrectFeedback": "Considere o que acontece na memória quando inicio e fim são índices próximos a 2 bilhões em uma variável int de 32 bits."
}
```

```quiz
{
  "question": "Você recebeu um vetor completamente desordenado com 50.000 registros e precisa realizar UMA ÚNICA consulta por uma chave específica. Qual abordagem possui menor custo assintótico total?",
  "options": [
    { "text": "Ordenar o vetor primeiro em O(n log n) e depois executar a Busca Binária em O(log n).", "correct": false },
    { "text": "Executar diretamente a Busca Sequencial em O(n), sem gastar O(n log n) para ordenar.", "correct": true },
    { "text": "Executar a Busca Binária diretamente sobre o vetor desordenado em O(log n).", "correct": false }
  ],
  "correctFeedback": "Correto! Para uma única busca, o custo de ordenar O(n log n) supera o custo da busca linear O(n). Ordenar compensa quando há múltiplas consultas.",
  "incorrectFeedback": "Some o custo de pré-processamento (ordenação) ao custo da busca e compare O(n) com O(n log n + log n)."
}
```