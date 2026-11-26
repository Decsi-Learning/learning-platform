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

---

## 1. Busca Sequencial (Linear)

A **Busca Sequencial** é a estratégia mais direta possível: como não há garantia alguma sobre a ordem dos elementos em $V$, examinamos cada posição sequencialmente a partir do índice `0` até encontrar a chave $x$ ou atingir o fim do vetor (`n - 1`).

- **Vantagem:** funciona sobre qualquer coleção de dados, mesmo completamente desordenada, e não exige pré-processamento.
- **Limitação:** no pior caso (quando $x$ está na última posição ou não existe no vetor), todas as $n$ posições precisam ser verificadas, resultando em custo linear $O(n)$.

> **Otimização clássica — Busca com Sentinela:** em vetores que possuem uma posição extra reservada ao final (`V[n]`), podemos gravar a própria chave $x$ em `V[n]` antes de iniciar o laço. Isso garante que a busca sempre encontrará $x$, eliminando o teste de limite `i < n` a cada iteração do `while` e reduzindo pela metade o número de comparações de controle do laço.

### Visualização passo a passo — Busca Sequencial

Acompanhe a varredura linear em um vetor **desordenado** de $7$ elementos procurando pela chave `x = 19`:

```codigo
{"title":"Busca Sequencial Padrão: buscando x = 19","code":"int busca_sequencial(const int V[], int n, int x) {\n    for (int i = 0; i < n; i++) {\n        if (V[i] == x) {\n            return i;\n        }\n    }\n    return -1;\n}","steps":[{"line":2,"caption":"Iniciamos a busca sequencial por x = 19 em um vetor não ordenado de 7 elementos. O índice i começa em 0.","vars":{"n":7,"x":19,"i":0},"rows":[[{"s":0,"n":7,"i":[["42","",1],["15","",1],["8","",1],["73","",1],["19","",2],["31","",1],["60","",1]],"l":"vetor V (desordenado)"}]],"stack":""},{"line":3,"caption":"i = 0: comparamos V[0] = 42 com x = 19. Diferentes — avançamos para o próximo índice.","vars":{"x":19,"i":0,"V[i]":42},"rows":[[{"s":0,"n":7,"i":[["42","c",3],["15","",1],["8","",1],["73","",1],["19","",2],["31","",1],["60","",1]],"l":"vetor V"}]],"stack":""},{"line":3,"caption":"i = 1: comparamos V[1] = 15 com x = 19. Diferentes — continuamos percorrendo.","vars":{"x":19,"i":1,"V[i]":15},"rows":[[{"s":0,"n":7,"i":[["42","",0],["15","c",3],["8","",1],["73","",1],["19","",2],["31","",1],["60","",1]],"l":"vetor V"}]],"stack":""},{"line":3,"caption":"i = 2: comparamos V[2] = 8 com x = 19. Diferentes — ainda não encontramos.","vars":{"x":19,"i":2,"V[i]":8},"rows":[[{"s":0,"n":7,"i":[["42","",0],["15","",0],["8","c",3],["73","",1],["19","",2],["31","",1],["60","",1]],"l":"vetor V"}]],"stack":""},{"line":3,"caption":"i = 3: comparamos V[3] = 73 com x = 19. Diferentes — seguimos para i = 4.","vars":{"x":19,"i":3,"V[i]":73},"rows":[[{"s":0,"n":7,"i":[["42","",0],["15","",0],["8","",0],["73","c",3],["19","",2],["31","",1],["60","",1]],"l":"vetor V"}]],"stack":""},{"line":4,"caption":"i = 4: V[4] == 19! Chave encontrada após 5 comparações. A função interrompe o laço e retorna o índice 4.","vars":{"x":19,"i":4,"V[i]":19,"retorno":4},"rows":[[{"s":0,"n":7,"i":[["42","",0],["15","",0],["8","",0],["73","",0],["19","p",2],["31","",1],["60","",1]],"l":"chave encontrada no índice 4"}]],"stack":""}]}
```

### Implementação em C — Busca Sequencial

```c
#include <stdio.h>

// 1. Busca Sequencial Padrão: O(n) no pior caso
int busca_sequencial(const int V[], int n, int x) {
    for (int i = 0; i < n; i++) {
        if (V[i] == x) {
            return i;
        }
    }
    return -1;
}

// 2. Busca Sequencial com Sentinela (exige vetor V com capacidade para n + 1 elementos)
int busca_sequencial_sentinela(int V[], int n, int x) {
    int i = 0;
    V[n] = x; // Posiciona a sentinela ao final do vetor

    while (V[i] != x) {
        i++;
    }

    if (i < n) {
        return i; // Encontrou antes da sentinela
    }
    return -1;    // Parou apenas na sentinela (ausente)
}

int main(void) {
    int dados[8] = {42, 15, 8, 73, 19, 31, 60}; // 7 elementos úteis + 1 espaço extra
    int n = 7;

    printf("Busca Sequencial (19): indice %d\n", busca_sequencial(dados, n, 19));
    printf("Busca Sentinela  (99): indice %d\n", busca_sequencial_sentinela(dados, n, 99));
    return 0;
}
```

---

## 2. Busca Binária (*Binary Search*)

A **Busca Binária** explora a **ordenação prévia** do vetor ($V[0] \le V[1] \le \dots \le V[n-1]$) para aplicar o paradigma de **Divisão e Conquista**.

Em vez de avançar de um em um, mantemos dois delimitadores que definem o intervalo ativo de busca: `inicio` e `fim`. A cada passo, calculamos o índice central `meio` e comparamos $x$ com $V[\text{meio}]$:

1. **Se $x == V[\text{meio}]$:** a chave foi localizada; retornamos `meio`.
2. **Se $x < V[\text{meio}]$:** pela transitividade da ordenação, $x$ é estritamente menor que todos os elementos à direita de `meio`. Descartamos toda a metade superior fazendo `fim = meio - 1`.
3. **Se $x > V[\text{meio}]$:** $x$ é estritamente maior que todos os elementos à esquerda de `meio`. Descartamos toda a metade inferior fazendo `inicio = meio + 1`.

Se em algum momento `inicio > fim`, o intervalo ativo tornou-se vazio e concluímos com certeza que $x$ não pertence ao vetor.

> **Regra fundamental:** a cada comparação malsucedida, a Busca Binária **elimina metade dos candidatos restantes**. Partindo de $n$ elementos, o tamanho do intervalo cai sucessivamente para $n/2, n/4, n/8, \dots, 1$. O número máximo de passos $k$ satisfaz $2^k \le n$, o que implica no máximo $\lfloor \log_2 n \rfloor + 1$ comparações — complexidade $O(\log n)$.

### Visualização passo a passo — Caso A: Busca Binária com sucesso (`x = 61`)

Acompanhe a execução da Busca Binária iterativa em um vetor ordenado de $11$ elementos ($n = 11$). Observe como o intervalo ativo `[inicio .. fim]` é reduzido pela metade a cada comparação:

```codigo
{"title":"Busca Binária Iterativa: buscando x = 61","code":"int busca_binaria(const int V[], int n, int x) {\n    int inicio = 0, fim = n - 1;\n    while (inicio <= fim) {\n        int meio = inicio + (fim - inicio) / 2;\n        if (V[meio] == x) return meio;\n        else if (x < V[meio]) fim = meio - 1;\n        else inicio = meio + 1;\n    }\n    return -1;\n}","steps":[{"line":2,"caption":"Iniciamos a busca por x = 61 no vetor ordenado de 11 elementos. Definimos os delimitadores do intervalo ativo: inicio = 0 e fim = 10.","vars":{"n":11,"x":61,"inicio":0,"fim":10},"rows":[[{"s":0,"n":11,"i":[["5","",1],["12","",1],["19","",1],["24","",1],["31","",1],["38","",1],["44","",1],["52","",1],["61","",2],["73","",1],["89","",1]],"l":"vetor V (índices 0 a 10)"}]],"stack":""},{"line":4,"caption":"Iteração 1 (inicio <= fim): calculamos o índice central meio = 0 + (10 - 0) / 2 = 5. O elemento central é V[5] = 38.","vars":{"x":61,"inicio":0,"fim":10,"meio":5,"V[meio]":38},"rows":[[{"s":0,"n":11,"i":[["5","",1],["12","",1],["19","",1],["24","",1],["31","",1],["38","c",3],["44","",1],["52","",1],["61","",2],["73","",1],["89","",1]],"l":"intervalo ativo [0..10]"}]],"stack":""},{"line":7,"caption":"Comparamos x = 61 com V[5] = 38. Como 61 > 38, descartamos toda a metade esquerda [0..5] e atualizamos inicio = meio + 1 = 6.","vars":{"x":61,"inicio":6,"fim":10,"meio":5},"rows":[[{"s":6,"n":5,"i":[["5","",0],["12","",0],["19","",0],["24","",0],["31","",0],["38","",0],["44","",1],["52","",1],["61","",2],["73","",1],["89","",1]],"l":"intervalo ativo [6..10] (metade esquerda descartada)"}]],"stack":""},{"line":4,"caption":"Iteração 2 (6 <= 10): calculamos o novo centro do intervalo restante: meio = 6 + (10 - 6) / 2 = 8. O elemento central é V[8] = 61.","vars":{"x":61,"inicio":6,"fim":10,"meio":8,"V[meio]":61},"rows":[[{"s":6,"n":5,"i":[["5","",0],["12","",0],["19","",0],["24","",0],["31","",0],["38","",0],["44","",1],["52","",1],["61","c",3],["73","",1],["89","",1]],"l":"intervalo ativo [6..10]"}]],"stack":""},{"line":5,"caption":"Sucesso! V[8] == 61. A função retorna o índice 8 com apenas 2 comparações (na Busca Sequencial seriam necessárias 9 comparações).","vars":{"x":61,"meio":8,"retorno":8},"rows":[[{"s":6,"n":5,"i":[["5","",0],["12","",0],["19","",0],["24","",0],["31","",0],["38","",0],["44","",1],["52","",1],["61","p",2],["73","",1],["89","",1]],"l":"chave encontrada no índice 8"}]],"stack":""}]}
```

### Visualização passo a passo — Caso B: Busca Binária sem sucesso (`x = 27`)

Agora acompanhe a versão recursiva procurando por `x = 27` (valor ausente no vetor), observando a pilha de chamadas até `inicio > fim`:

```codigo
{"title":"Busca Binária Recursiva: buscando x = 27 (ausente)","code":"int busca_bin_rec(const int V[], int ini, int fim, int x) {\n    if (ini > fim) return -1;\n    int meio = ini + (fim - ini) / 2;\n    if (V[meio] == x) return meio;\n    if (x < V[meio]) return busca_bin_rec(V, ini, meio - 1, x);\n    return busca_bin_rec(V, meio + 1, fim, x);\n}","steps":[{"line":3,"caption":"Chamada 1: intervalo [0..10]. Calculamos meio = 5 (V[5] = 38). Como 27 < 38, chamamos recursivamente para a metade esquerda [0..4].","vars":{"ini":0,"fim":10,"meio":5,"V[meio]":38},"rows":[[{"s":0,"n":11,"i":[["5","",1],["12","",1],["19","",1],["24","",1],["31","",1],["38","c",3],["44","",1],["52","",1],["61","",1],["73","",1],["89","",1]],"l":"intervalo [0..10]"}]],"stack":"busca_bin_rec(0, 10)"},{"line":3,"caption":"Chamada 2: intervalo [0..4]. Calculamos meio = 2 (V[2] = 19). Como 27 > 19, chamamos recursivamente para a metade direita [3..4].","vars":{"ini":0,"fim":4,"meio":2,"V[meio]":19},"rows":[[{"s":0,"n":5,"i":[["5","",1],["12","",1],["19","c",3],["24","",1],["31","",1],["38","",0],["44","",0],["52","",0],["61","",0],["73","",0],["89","",0]],"l":"intervalo [0..4]"}]],"stack":"busca_bin_rec(0, 10) -> busca_bin_rec(0, 4)"},{"line":3,"caption":"Chamada 3: intervalo [3..4]. Calculamos meio = 3 (V[3] = 24). Como 27 > 24, avançamos para o intervalo unitário [4..4].","vars":{"ini":3,"fim":4,"meio":3,"V[meio]":24},"rows":[[{"s":3,"n":2,"i":[["5","",0],["12","",0],["19","",0],["24","c",3],["31","",1],["38","",0],["44","",0],["52","",0],["61","",0],["73","",0],["89","",0]],"l":"intervalo [3..4]"}]],"stack":"busca_bin_rec(0, 10) -> (0, 4) -> (3, 4)"},{"line":3,"caption":"Chamada 4: intervalo [4..4]. Calculamos meio = 4 (V[4] = 31). Como 27 < 31, chamamos para [4..3].","vars":{"ini":4,"fim":4,"meio":4,"V[meio]":31},"rows":[[{"s":4,"n":1,"i":[["5","",0],["12","",0],["19","",0],["24","",0],["31","c",3],["38","",0],["44","",0],["52","",0],["61","",0],["73","",0],["89","",0]],"l":"intervalo [4..4]"}]],"stack":"busca_bin_rec(0, 10) -> (0, 4) -> (3, 4) -> (4, 4)"},{"line":2,"caption":"Caso base atingido (ini = 4 > fim = 3): o intervalo tornou-se vazio. A função retorna -1 após 4 comparações (⌊log₂ 11⌋ + 1).","vars":{"ini":4,"fim":3,"retorno":-1},"rows":[[{"s":0,"n":0,"i":[["5","",0],["12","",0],["19","",0],["24","",0],["31","",0],["38","",0],["44","",0],["52","",0],["61","",0],["73","",0],["89","",0]],"l":"intervalo vazio (chave não encontrada)"}]],"stack":"retorno: -1"}]}
```

### Implementação em C — Busca Binária

Um detalhe técnico importante em C diz respeito ao cálculo do índice central. Em vetores muito grandes (próximos ao limite de representação do tipo `int`, $2^{31} - 1$), a expressão clássica `(inicio + fim) / 2` pode causar **estouro de inteiro (*integer overflow*)**, resultando em um índice negativo e falha de segmentação (*Segmentation Fault*). A forma segura e recomendada é:

$$\text{meio} = \text{inicio} + \left\lfloor \frac{\text{fim} - \text{inicio}}{2} \right\rfloor$$

```c
#include <stdio.h>

// 1. Busca Binária Iterativa: O(log n) tempo e O(1) memória auxiliar
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

// 2. Busca Binária Recursiva: O(log n) tempo e O(log n) na pilha de chamadas
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

    printf("Busca Binaria Iterativa (61): indice %d\n", busca_binaria_iterativa(dados, n, 61));
    printf("Busca Binaria Recursiva (27): indice %d\n", busca_binaria_recursiva(dados, 0, n - 1, 27));
    return 0;
}
```

---

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