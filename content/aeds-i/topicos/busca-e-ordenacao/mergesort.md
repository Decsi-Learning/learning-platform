## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender o paradigma de **Divisão e Conquista** aplicado ao **Mergesort**, focando na divisão recursiva ao meio e na etapa de **intercalação (*merge*)**.
- Executar manualmente o rastreamento da divisão até subvetores unitários e da intercalação ordenada no retorno da recursão.
- Implementar o Mergesort em C com alocação dinâmica segura de memória auxiliar (`malloc` / `free`) e preservação da estabilidade.
- Justificar por que o Mergesort garante complexidade $O(n \log n)$ em todos os casos, avaliando o trade-off do custo espacial $O(n)$.

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

Essa estratégia confere ao Mergesort uma propriedade fundamental: **previsibilidade assintótica**. Diferente do Quicksort simples, ele não sofre degradação quadrática $O(n^2)$ — sua execução é sempre $O(n \log n)$, independentemente da ordem inicial dos dados.

## 3. Conceito principal

Dado um intervalo contíguo $V[\text{inicio} \dots \text{fim}]$:

1. **Divisão:** calculamos o índice central $\text{meio} = \text{inicio} + \lfloor (\text{fim} - \text{inicio}) / 2 \rfloor$, particionando o problema em dois subvetores de tamanhos praticamente iguais: $V[\text{inicio} \dots \text{meio}]$ e $V[\text{meio} + 1 \dots \text{fim}]$.
2. **Conquista (Caso Base e Recursão):** enquanto $\text{inicio} < \text{fim}$, ordenamos recursivamente a metade esquerda e a metade direita. Quando $\text{inicio} \ge \text{fim}$, o subvetor possui $0$ ou $1$ elemento e já está ordenado.
3. **Combinação (`intercalar` / `merge`):** mesclamos os dois subvetores ordenados em uma única sequência ordenada no intervalo $V[\text{inicio} \dots \text{fim}]$, comparando sucessivamente o menor elemento ainda não processado de cada metade.

> **Regra fundamental:** a intercalação de duas metades que somam $m$ elementos executa em tempo estritamente linear $\Theta(m)$. Como a divisão binária produz $\lceil \log_2 n \rceil$ níveis na árvore de recursão e cada nível processa todos os $n$ elementos no total, a recorrência $T(n) = 2T(n/2) + \Theta(n)$ resulta sempre em $O(n \log n)$ no melhor caso, no caso médio e no pior caso.

### 3.1 Estabilidade na Intercalação

O Mergesort é naturalmente **estável** desde que, durante a intercalação, a **metade esquerda tenha prioridade em caso de empate**: sempre que o elemento atual da esquerda for menor ou igual (`<=`) ao elemento atual da direita, copiamos primeiro o da esquerda. Dessa forma, registros com chaves iguais mantêm sua ordem relativa original.

---

## 4. Exemplo

### Visualização 1 — Divisão recursiva em blocos (`mergesort`)

Acompanhe como o `mergesort` quebra o vetor `[38, 27, 43, 3, 9, 82]` ao meio em cada nível até atingir subvetores unitários (caso base) e depois sobe combinando os blocos ordenados:

```codigo
{"title":"Mergesort: Divisão em blocos e retorno da recursão","code":"void mergesort(int V[], int inicio, int fim) {\n    if (inicio < fim) {\n        int meio = inicio + (fim - inicio) / 2;\n        mergesort(V, inicio, meio);\n        mergesort(V, meio + 1, fim);\n        intercalar(V, inicio, meio, fim);\n    }\n}","steps":[{"line":2,"caption":"Início: recebemos o vetor V[0..5] com 6 elementos. Como inicio < fim (0 < 5), vamos dividi-lo ao meio.","vars":{"fase":"Nível 0 (Início)","inicio":0,"fim":5},"rows":[[{"s":0,"n":6,"i":[["38","",1],["27","",1],["43","",1],["3","",1],["9","",1],["82","",1]],"l":"V[0..5]"}]],"stack":"mergesort(0, 5)"},{"line":3,"caption":"Divisão 1: meio = 2. O vetor é dividido em dois blocos: metade esquerda [0..2] e metade direita [3..5].","vars":{"fase":"Divisão (Nível 1)","inicio":0,"meio":2,"fim":5},"rows":[[{"s":0,"n":6,"i":[["38","",0],["27","",0],["43","",0],["3","",0],["9","",0],["82","",0]],"l":"Nível 0: [0..5]"}],[{"s":0,"n":3,"i":[["38","c",1],["27","c",1],["43","c",1]],"l":"Esq [0..2]"},{"s":3,"n":3,"i":[["3","",2],["9","",2],["82","",2]],"l":"Dir [3..5]"}]],"stack":"mergesort(0, 5)"},{"line":4,"caption":"Divisão 2 (lado esquerdo): chamamos mergesort(0, 2) com meio = 1. Quebramos [38, 27, 43] em [0..1] e [2..2] (já unitário).","vars":{"fase":"Divisão (Nível 2)","inicio":0,"meio":1,"fim":2},"rows":[[{"s":0,"n":3,"i":[["38","",0],["27","",0],["43","",0]],"l":"Esq [0..2]"},{"s":3,"n":3,"i":[["3","",2],["9","",2],["82","",2]],"l":"Dir [3..5]"}],[{"s":0,"n":2,"i":[["38","c",1],["27","c",1]],"l":"[0..1]"},{"s":2,"n":1,"i":[["43","p",1]],"l":"[2..2] (base)"}]],"stack":"mergesort(0, 5) -> (0, 2)"},{"line":4,"caption":"Divisão 3 (caso base): chamamos mergesort(0, 1) com meio = 0. Quebramos [38, 27] nos blocos unitários [38] e [27]. Como ambos têm tamanho 1, a descida termina!","vars":{"fase":"Caso Base (Nível 3)","inicio":0,"meio":0,"fim":1},"rows":[[{"s":0,"n":2,"i":[["38","",0],["27","",0]],"l":"[0..1]"},{"s":2,"n":1,"i":[["43","p",1]],"l":"[2..2] (base)"}],[{"s":0,"n":1,"i":[["38","c",1]],"l":"[0..0]"},{"s":1,"n":1,"i":[["27","c",1]],"l":"[1..1]"}]],"stack":"mergesort(0, 5) -> (0, 2) -> (0, 1)"},{"line":6,"caption":"Retorno 1 — intercalar(0, 0, 1): subimos um nível mesclando os dois blocos unitários de baixo ([38] e [27]) no bloco ordenado [27, 38] em [0..1]. O bloco [43] aguarda ao lado.","vars":{"fase":"Retorno (Esq)","intercalar":"[38] + [27] -> [27, 38]"},"rows":[[{"s":0,"n":2,"i":[["27","p",1],["38","p",1]],"l":"[0..1] ordenado"},{"s":2,"n":1,"i":[["43","",1]],"l":"[2..2] (aguardando)"}],[{"s":0,"n":1,"i":[["38","",0]],"l":"[0..0] (mesclado)"},{"s":1,"n":1,"i":[["27","",0]],"l":"[1..1] (mesclado)"}]],"stack":"mergesort(0, 5) -> (0, 2) -> intercalar(0, 0, 1)"},{"line":6,"caption":"Retorno 2 — intercalar(0, 1, 2): mesclamos [27, 38] com [43] na linha de cima. Toda a metade esquerda [0..2] = [27, 38, 43] está ordenada! Agora vamos para a metade direita.","vars":{"fase":"Retorno (Esq)","intercalar":"[27, 38] + [43] -> [27, 38, 43]"},"rows":[[{"s":0,"n":3,"i":[["27","p",1],["38","p",1],["43","p",1]],"l":"Esq [0..2] ordenada"},{"s":3,"n":3,"i":[["3","c",2],["9","c",2],["82","c",2]],"l":"Dir [3..5] (próxima)"}],[{"s":0,"n":2,"i":[["27","",0],["38","",0]],"l":"[0..1] (mesclado)"},{"s":2,"n":1,"i":[["43","",0]],"l":"[2..2] (mesclado)"}]],"stack":"mergesort(0, 5) -> intercalar(0, 1, 2)"},{"line":5,"caption":"Divisão 4 (lado direito): chamamos mergesort(3, 5) com meio = 4. Quebramos [3, 9, 82] em [3..4] e [5..5] (unitário).","vars":{"fase":"Divisão (Nível 2 - Dir)","inicio":3,"meio":4,"fim":5},"rows":[[{"s":0,"n":3,"i":[["27","p",1],["38","p",1],["43","p",1]],"l":"Esq [0..2] pronta"},{"s":3,"n":3,"i":[["3","",0],["9","",0],["82","",0]],"l":"Dir [3..5]"}],[{"s":3,"n":2,"i":[["3","c",2],["9","c",2]],"l":"[3..4]"},{"s":5,"n":1,"i":[["82","p",2]],"l":"[5..5] (base)"}]],"stack":"mergesort(0, 5) -> (3, 5)"},{"line":4,"caption":"Divisão 5 (caso base na direita): chamamos mergesort(3, 4) com meio = 3, separando [3, 9] nos blocos unitários [3] e [9].","vars":{"fase":"Caso Base (Nível 3 - Dir)","inicio":3,"meio":3,"fim":4},"rows":[[{"s":3,"n":2,"i":[["3","",0],["9","",0]],"l":"[3..4]"},{"s":5,"n":1,"i":[["82","p",2]],"l":"[5..5] (base)"}],[{"s":3,"n":1,"i":[["3","c",2]],"l":"[3..3]"},{"s":4,"n":1,"i":[["9","c",2]],"l":"[4..4]"}]],"stack":"mergesort(0, 5) -> (3, 5) -> (3, 4)"},{"line":6,"caption":"Retorno 3 — intercalar(3, 3, 4): subimos mesclando os blocos unitários [3] e [9] no bloco ordenado [3, 9] em [3..4]. O bloco [82] aguarda ao lado.","vars":{"fase":"Retorno (Dir)","intercalar":"[3] + [9] -> [3, 9]"},"rows":[[{"s":3,"n":2,"i":[["3","p",2],["9","p",2]],"l":"[3..4] ordenado"},{"s":5,"n":1,"i":[["82","",2]],"l":"[5..5] (aguardando)"}],[{"s":3,"n":1,"i":[["3","",0]],"l":"[3..3] (mesclado)"},{"s":4,"n":1,"i":[["9","",0]],"l":"[4..4] (mesclado)"}]],"stack":"mergesort(0, 5) -> (3, 5) -> intercalar(3, 3, 4)"},{"line":6,"caption":"Retorno 4 — intercalar(3, 4, 5): mesclamos [3, 9] com [82]. Agora temos as duas metades [27, 38, 43] e [3, 9, 82] prontas para a intercalação final!","vars":{"fase":"Pronto para Merge Final","intercalar":"[3, 9] + [82] -> [3, 9, 82]"},"rows":[[{"s":0,"n":3,"i":[["27","p",1],["38","p",1],["43","p",1]],"l":"Esq [0..2] ordenada"},{"s":3,"n":3,"i":[["3","p",2],["9","p",2],["82","p",2]],"l":"Dir [3..5] ordenada"}],[{"s":3,"n":2,"i":[["3","",0],["9","",0]],"l":"[3..4] (mesclado)"},{"s":5,"n":1,"i":[["82","",0]],"l":"[5..5] (mesclado)"}]],"stack":"mergesort(0, 5) -> intercalar(0, 2, 5)"},{"line":8,"caption":"Conclusão: após intercalar(0, 2, 5) combinar as duas metades em tempo linear O(n), todo o vetor [3, 9, 27, 38, 43, 82] está ordenado! Veja abaixo o passo a passo interno do intercalar.","vars":{"fase":"Concluído"},"rows":[[{"s":0,"n":6,"i":[["3","p",3],["9","p",3],["27","p",3],["38","p",3],["43","p",3],["82","p",3]],"l":"V[0..5] completamente ordenado"}]],"stack":"concluído"}]}
```

### Visualização 2 — Por dentro da intercalação (`intercalar`)

Veja em detalhes como `intercalar(V, 0, 2, 5)` combina as duas metades já ordenadas `esq = [27, 38, 43]` e `dir = [3, 9, 82]`, comparando sempre os elementos apontados pelos índices `i` e `j` e gravando o menor em `V[k]`:

```codigo
{"title":"Intercalação passo a passo: [27, 38, 43] + [3, 9, 82]","code":"void intercalar(int V[], int ini, int meio, int fim) {\n    // Copia metades para esq[0..2] e dir[0..2]\n    int i = 0, j = 0, k = ini;\n    while (i < n_esq && j < n_dir) {\n        if (esq[i] <= dir[j])\n            V[k++] = esq[i++];\n        else\n            V[k++] = dir[j++];\n    }\n    while (i < n_esq) V[k++] = esq[i++];\n    while (j < n_dir) V[k++] = dir[j++];\n}","steps":[{"line":3,"caption":"Copiamos as metades ordenadas para os vetores auxiliares esq e dir. Os índices começam em i = 0, j = 0 e k = 0.","vars":{"i":0,"j":0,"k":0},"rows":[[{"s":0,"n":3,"i":[["27","",1],["38","",1],["43","",1]],"l":"esq (metade esquerda)"}],[{"s":0,"n":3,"i":[["3","",2],["9","",2],["82","",2]],"l":"dir (metade direita)"}]],"stack":""},{"line":5,"caption":"Comparação 1: comparamos esq[0] = 27 com dir[0] = 3. Como 27 <= 3 é falso, vamos para o else.","vars":{"i":0,"j":0,"k":0,"compara":"27 <= 3 ? Não"},"rows":[[{"s":0,"n":3,"i":[["27","c",1],["38","",1],["43","",1]],"l":"esq (i = 0)"}],[{"s":0,"n":3,"i":[["3","c",2],["9","",2],["82","",2]],"l":"dir (j = 0)"}]],"stack":""},{"line":8,"caption":"Copiamos dir[0] = 3 para V[0] e avançamos j para 1 e k para 1.","vars":{"i":0,"j":1,"k":1},"rows":[[{"s":0,"n":3,"i":[["27","",1],["38","",1],["43","",1]],"l":"esq (i = 0)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",2],["82","",2]],"l":"dir (j = 1)"}],[{"s":0,"n":1,"i":[["3","p",2]],"l":"V (resultado parcial)"}]],"stack":""},{"line":5,"caption":"Comparação 2: comparamos esq[0] = 27 com dir[1] = 9. Como 27 <= 9 é falso, vamos para o else.","vars":{"i":0,"j":1,"k":1,"compara":"27 <= 9 ? Não"},"rows":[[{"s":0,"n":3,"i":[["27","c",1],["38","",1],["43","",1]],"l":"esq (i = 0)"}],[{"s":0,"n":3,"i":[["3","",0],["9","c",2],["82","",2]],"l":"dir (j = 1)"}],[{"s":0,"n":1,"i":[["3","",2]],"l":"V (resultado parcial)"}]],"stack":""},{"line":8,"caption":"Copiamos dir[1] = 9 para V[1] e avançamos j para 2 e k para 2.","vars":{"i":0,"j":2,"k":2},"rows":[[{"s":0,"n":3,"i":[["27","",1],["38","",1],["43","",1]],"l":"esq (i = 0)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","",2]],"l":"dir (j = 2)"}],[{"s":0,"n":2,"i":[["3","",2],["9","p",2]],"l":"V (resultado parcial)"}]],"stack":""},{"line":5,"caption":"Comparação 3: comparamos esq[0] = 27 com dir[2] = 82. Como 27 <= 82 é verdadeiro, entramos no if!","vars":{"i":0,"j":2,"k":2,"compara":"27 <= 82 ? Sim"},"rows":[[{"s":0,"n":3,"i":[["27","c",1],["38","",1],["43","",1]],"l":"esq (i = 0)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","c",2]],"l":"dir (j = 2)"}],[{"s":0,"n":2,"i":[["3","",2],["9","",2]],"l":"V (resultado parcial)"}]],"stack":""},{"line":6,"caption":"Copiamos esq[0] = 27 para V[2] e avançamos i para 1 e k para 3.","vars":{"i":1,"j":2,"k":3},"rows":[[{"s":0,"n":3,"i":[["27","",0],["38","",1],["43","",1]],"l":"esq (i = 1)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","",2]],"l":"dir (j = 2)"}],[{"s":0,"n":3,"i":[["3","",2],["9","",2],["27","p",1]],"l":"V (resultado parcial)"}]],"stack":""},{"line":5,"caption":"Comparação 4: comparamos esq[1] = 38 com dir[2] = 82. Como 38 <= 82 é verdadeiro, entramos no if.","vars":{"i":1,"j":2,"k":3,"compara":"38 <= 82 ? Sim"},"rows":[[{"s":0,"n":3,"i":[["27","",0],["38","c",1],["43","",1]],"l":"esq (i = 1)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","c",2]],"l":"dir (j = 2)"}],[{"s":0,"n":3,"i":[["3","",2],["9","",2],["27","",1]],"l":"V (resultado parcial)"}]],"stack":""},{"line":6,"caption":"Copiamos esq[1] = 38 para V[3] e avançamos i para 2 e k para 4.","vars":{"i":2,"j":2,"k":4},"rows":[[{"s":0,"n":3,"i":[["27","",0],["38","",0],["43","",1]],"l":"esq (i = 2)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","",2]],"l":"dir (j = 2)"}],[{"s":0,"n":4,"i":[["3","",2],["9","",2],["27","",1],["38","p",1]],"l":"V (resultado parcial)"}]],"stack":""},{"line":5,"caption":"Comparação 5: comparamos esq[2] = 43 com dir[2] = 82. Como 43 <= 82 é verdadeiro, entramos no if.","vars":{"i":2,"j":2,"k":4,"compara":"43 <= 82 ? Sim"},"rows":[[{"s":0,"n":3,"i":[["27","",0],["38","",0],["43","c",1]],"l":"esq (i = 2)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","c",2]],"l":"dir (j = 2)"}],[{"s":0,"n":4,"i":[["3","",2],["9","",2],["27","",1],["38","",1]],"l":"V (resultado parcial)"}]],"stack":""},{"line":6,"caption":"Copiamos esq[2] = 43 para V[4] e avançamos i para 3 e k para 5. Como esq terminou (i == n_esq), saímos do laço principal!","vars":{"i":3,"j":2,"k":5},"rows":[[{"s":0,"n":3,"i":[["27","",0],["38","",0],["43","",0]],"l":"esq (esgotado)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","",2]],"l":"dir (restante: j = 2)"}],[{"s":0,"n":5,"i":[["3","",2],["9","",2],["27","",1],["38","",1],["43","p",1]],"l":"V (resultado parcial)"}]],"stack":""},{"line":11,"caption":"Sobrou o elemento 82 em dir: o laço final while (j < n_dir) copia 82 diretamente para V[5], sem precisar comparar!","vars":{"i":3,"j":3,"k":6},"rows":[[{"s":0,"n":3,"i":[["27","",0],["38","",0],["43","",0]],"l":"esq (esgotado)"}],[{"s":0,"n":3,"i":[["3","",0],["9","",0],["82","c",2]],"l":"dir (copiando restante)"}],[{"s":0,"n":6,"i":[["3","",2],["9","",2],["27","",1],["38","",1],["43","",1],["82","p",2]],"l":"V (resultado parcial)"}]],"stack":""},{"line":12,"caption":"Fim do intercalar! Liberamos esq e dir com free(). O vetor V[0..5] = [3, 9, 27, 38, 43, 82] está completamente ordenado em tempo linear.","vars":{"estado":"concluído","k":6},"rows":[[{"s":0,"n":6,"i":[["3","p",3],["9","p",3],["27","p",3],["38","p",3],["43","p",3],["82","p",3]],"l":"V[0..5] ordenado"}]],"stack":""}]}
```

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