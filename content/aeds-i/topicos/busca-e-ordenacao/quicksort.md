## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

* Compreender o paradigma de **Divisão e Conquista** aplicado ao **Quicksort** e o papel central da operação de **particionamento**.
* Executar manualmente o algoritmo de particionamento de Lomuto, identificando como o **pivô** alcança sua posição definitiva.
* Implementar o Quicksort em C com a heurística da **Mediana de Três** para mitigar o pior caso em vetores já ordenados.
* Analisar a complexidade assintótica no melhor caso, caso médio ($O(n \log n)$) e pior caso ($O(n^2)$), além do consumo de memória de pilha e da instabilidade.

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

> **Regra fundamental:** o desempenho do Quicksort depende diretamente do equilíbrio entre os tamanhos das duas partições geradas. Quando o pivô divide o intervalo próximo à metade, a árvore de recursão possui altura $O(\log n)$ e o tempo total é $O(n \log n)$. Se o pivô for sistematicamente o menor ou o maior elemento, uma partição terá tamanho $n - 1$ e a outra $0$, degradando o custo para $O(n^2)$.

### Estratégias para Evitar o Pior Caso $O(n^2)$

Quando adotamos sempre o último elemento (`V[fim]`) como pivô e o vetor de entrada já está ordenado (em ordem crescente ou decrescente), cada particionamento reduz o problema em apenas $1$ elemento ($T(n) = T(n-1) + \Theta(n) \Rightarrow O(n^2)$). Para prevenir esse cenário:

* **Pivoteamento Aleatório:** sorteia-se um índice aleatório no intervalo `[inicio, fim]` e troca-se esse elemento com `V[fim]` antes de particionar.
* **Mediana de Três:** compara-se o primeiro (`V[inicio]`), o central (`V[meio]`) e o último (`V[fim]`) elementos do intervalo, utilizando a **mediana** entre os três como pivô.

---

## Exemplo

### Visualização passo a passo — Particionamento de Lomuto e Recursão

Acompanhe a execução do Quicksort sobre o vetor `[28, 12, 45, 19, 33, 24]`. Na primeira chamada (`quicksort(0, 5)`), adotamos o último elemento (`pivo = 24`) e usamos os ponteiros `i` (fronteira dos menores ou iguais) e `j` (varredura):

```codigo
{"title":"Quicksort passo a passo: Particionamento de Lomuto (pivô = 24)","code":"int particionar(int V[], int inicio, int fim) {\n    int pivo = V[fim], i = inicio - 1;\n    for (int j = inicio; j < fim; j++) {\n        if (V[j] <= pivo) {\n            i++;\n            trocar(&V[i], &V[j]);\n        }\n    }\n    trocar(&V[i + 1], &V[fim]);\n    return i + 1;\n}","steps":[{"line":2,"caption":"Iniciamos o particionamento no intervalo [0..5]. Escolhemos V[5] = 24 como pivô e inicializamos a fronteira dos menores i = -1.","vars":{"inicio":0,"fim":5,"pivo":24,"i":-1},"rows":[[{"s":0,"n":6,"i":[["28","",1],["12","",1],["45","",1],["19","",1],["33","",1],["24","c",2]],"l":"vetor V (pivô = 24 no fim)"}]],"stack":"quicksort(0, 5)"},{"line":4,"caption":"j = 0 (V[0] = 28): como 28 > 24, não trocamos nada. O índice i permanece em -1, mantendo 28 na região dos maiores.","vars":{"pivo":24,"i":-1,"j":0,"V[j]":28},"rows":[[{"s":0,"n":6,"i":[["28","c",3],["12","",1],["45","",1],["19","",1],["33","",1],["24","",2]],"l":"vetor V (j = 0)"}]],"stack":"quicksort(0, 5)"},{"line":6,"caption":"j = 1 (V[1] = 12): como 12 <= 24, avançamos i = 0 e trocamos V[0] com V[1]. O elemento 12 entra na região dos menores!","vars":{"pivo":24,"i":0,"j":1,"troca":"V[0] <-> V[1]"},"rows":[[{"s":0,"n":6,"i":[["12","c",3],["28","c",3],["45","",1],["19","",1],["33","",1],["24","",2]],"l":"vetor V (12 movido para esquerda)"}]],"stack":"quicksort(0, 5)"},{"line":4,"caption":"j = 2 (V[2] = 45): como 45 > 24, apenas avançamos j. A fronteira i continua em 0.","vars":{"pivo":24,"i":0,"j":2,"V[j]":45},"rows":[[{"s":0,"n":6,"i":[["12","",1],["28","",1],["45","c",3],["19","",1],["33","",1],["24","",2]],"l":"vetor V (j = 2)"}]],"stack":"quicksort(0, 5)"},{"line":6,"caption":"j = 3 (V[3] = 19): como 19 <= 24, avançamos i = 1 e trocamos V[1] com V[3]. Agora [12, 19] formam o bloco <= 24.","vars":{"pivo":24,"i":1,"j":3,"troca":"V[1] <-> V[3]"},"rows":[[{"s":0,"n":6,"i":[["12","",1],["19","c",3],["45","",1],["28","c",3],["33","",1],["24","",2]],"l":"vetor V (19 movido para esquerda)"}]],"stack":"quicksort(0, 5)"},{"line":4,"caption":"j = 4 (V[4] = 33): como 33 > 24, encerramos o laço for com i = 1. Todos os menores estão em [0..1] e os maiores em [2..4].","vars":{"pivo":24,"i":1,"j":4,"V[j]":33},"rows":[[{"s":0,"n":6,"i":[["12","",1],["19","",1],["45","",1],["28","",1],["33","c",3],["24","",2]],"l":"fim da varredura (i = 1)"}]],"stack":"quicksort(0, 5)"},{"line":9,"caption":"Posicionamento definitivo do pivô: trocamos V[i + 1] (V[2] = 45) com V[fim] (24). O pivô 24 está fixado no índice 2 para sempre!","vars":{"pivo":24,"indice_pivo":2,"troca":"V[2] <-> V[5]"},"rows":[[{"s":0,"n":6,"i":[["12","",1],["19","",1],["24","p",2],["28","",1],["33","",1],["45","",1]],"l":"pivô 24 fixado no índice 2"}]],"stack":"quicksort(0, 5) -> [0..1] e [3..5]"},{"line":10,"caption":"Conquista recursiva: chamamos quicksort(0, 1) para [12, 19] (pivô 19 já ordenado) e quicksort(3, 5) para [28, 33, 45] (pivô 45 já ordenado). Todo o vetor está ordenado!","vars":{"estado":"concluído"},"rows":[[{"s":0,"n":6,"i":[["12","p",2],["19","p",2],["24","p",2],["28","p",2],["33","p",2],["45","p",2]],"l":"vetor completamente ordenado"}]],"stack":"concluído"}]}
```
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