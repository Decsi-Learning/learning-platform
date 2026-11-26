## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

* Conectar a estrutura de **Max-Heap** (estudada nas estruturas hierárquicas) à ordenação *in-place* pelo **Heapsort**.
* Executar manualmente as duas fases do algoritmo: construção linear do Max-Heap (`build-heap`) e extrações sucessivas da raiz com `sift-down`.
* Implementar o Heapsort completo em C sem alocar vetores auxiliares.
* Sintetizar e comparar todos os algoritmos de ordenação da disciplina quanto à complexidade assintótica, consumo de memória e estabilidade.

## Introdução

Inventado por J. W. J. Williams em 1964 e aprimorado por Robert Floyd, o **Heapsort** combina duas propriedades desejáveis que pareciam opostas nos algoritmos anteriores:

1. Assim como o *Mergesort*, garante tempo de execução $O(n \log n)$ **mesmo no pior caso** (sem o risco quadrático $O(n^2)$ do Quicksort).
2. Assim como o *Quicksort* e o *Shellsort*, executa estritamente ***in-place***, utilizando apenas espaço auxiliar constante $O(1)$ (sem o vetor extra $O(n)$ do Mergesort).

Em essência, o Heapsort é uma versão sofisticada da ordenação por seleção: em vez de percorrer linearmente o vetor restante em $O(n)$ a cada passo para descobrir o maior elemento, ele organiza os dados em um **Max-Heap**, permitindo localizar o maior valor em $O(1)$ e restaurar a estrutura em $O(\log n)$.

> **Atenção:** o Heapsort não cria nós com ponteiros na memória. Ele opera sobre um vetor comum (`int V[]`), interpretando-o logicamente como uma árvore binária quase completa por meio de aritmética de índices (`esq = 2*i + 1`, `dir = 2*i + 2`).

## Conceito principal

Dado um vetor $V$ de tamanho $n$, o Heapsort opera inteiramente dentro do próprio array em **duas fases**:

### Fase 1: Construção do Max-Heap (`construir_heap`) — Custo $O(n)$

Interpretamos o vetor $V[0 \dots n-1]$ como uma árvore binária quase completa e aplicamos a operação `sift_down` (descer) de trás para frente a partir do último nó interno até a raiz:

$$i = \left\lfloor \frac{n}{2} \right\rfloor - 1 \;\longrightarrow\; 0$$

Ao final dessa etapa, $V$ satisfaz a propriedade de Max-Heap ($V[\text{pai}] \ge V[\text{filho}]$), e o **maior elemento de todo o vetor** está garantidamente na raiz `V[0]`.

### Fase 2: Extração Sucessiva e Redução do Heap — Custo $O(n \log n)$

Repetimos o seguinte ciclo para `fim` variando de `n - 1` até `1`:

1. **Troca (`swap`):** trocamos a raiz `V[0]` (maior elemento ativo) com o último elemento da porção não ordenada `V[fim]`. Agora `V[fim]` está em sua posição final definitiva!
2. **Redução e Restauração (`sift_down`):** diminuímos em $1$ o tamanho lógico do heap (`fim`) e aplicamos `sift_down(V, fim, 0)` para que o novo maior elemento suba para `V[0]`.

> **Regra fundamental:** embora o Heapsort seja teoricamente ótimo em tempo e espaço ($O(n \log n)$ e $O(1)$), na prática ele costuma ser ligeiramente mais lento que o Quicksort bem implementado devido à menor localidade de cache (saltos entre índices $i$ e $2i+1$) e por realizar cerca de o dobro de comparações. Além disso, as trocas entre a raiz e o fim do vetor tornam o Heapsort **não estável**.

---

## Exemplo

### Visualização passo a passo — Heapsort

Acompanhe a execução completa do Heapsort sobre o vetor `[19, 42, 10, 55, 27, 31]`, observando a **Fase 1** (construção do Max-Heap a partir do último nó interno $i = 2$) e a **Fase 2** (extração da raiz para o final e redução do tamanho ativo do heap):

```codigo
{"title":"Heapsort passo a passo: [19, 42, 10, 55, 27, 31]","code":"void heapsort(int V[], int n) {\n    // Fase 1: Constroi o Max-Heap\n    for (int i = (n / 2) - 1; i >= 0; i--) {\n        sift_down(V, n, i);\n    }\n    // Fase 2: Extrai o maximo para o fim\n    for (int fim = n - 1; fim > 0; fim--) {\n        trocar(&V[0], &V[fim]);\n        sift_down(V, fim, 0);\n    }\n}","steps":[{"line":3,"caption":"Vetor inicial de 6 elementos. Iniciamos a Fase 1 (construção do Max-Heap) a partir do último nó interno: i = (6 / 2) - 1 = 2.","vars":{"n":6,"fase":"1 (Build-Heap)","i":2},"rows":[[{"s":0,"n":6,"i":[["19","",1],["42","",1],["10","",1],["55","",1],["27","",1],["31","",1]],"l":"vetor V (índices 0 a 5)"}]],"stack":""},{"line":4,"caption":"Fase 1 (i = 2): V[2] = 10 tem filho esquerdo V[5] = 31. Como 31 > 10, sift_down troca ambos.","vars":{"fase":"1 (Build-Heap)","i":2,"troca":"10 <-> 31"},"rows":[[{"s":0,"n":6,"i":[["19","",1],["42","",1],["31","c",3],["55","",1],["27","",1],["10","c",3]],"l":"vetor V (i = 2 ajustado)"}]],"stack":""},{"line":4,"caption":"Fase 1 (i = 1): V[1] = 42 tem filhos V[3] = 55 e V[4] = 27. O maior filho é 55; sift_down troca 42 e 55.","vars":{"fase":"1 (Build-Heap)","i":1,"troca":"42 <-> 55"},"rows":[[{"s":0,"n":6,"i":[["19","",1],["55","c",3],["31","",1],["42","c",3],["27","",1],["10","",1]],"l":"vetor V (i = 1 ajustado)"}]],"stack":""},{"line":4,"caption":"Fase 1 (i = 0): V[0] = 19 desce (sift_down) trocando primeiro com 55 e depois com 42. O Max-Heap está formado com o maior elemento (55) na raiz V[0]!","vars":{"fase":"1 (Build-Heap)","i":0,"raiz":55},"rows":[[{"s":0,"n":6,"i":[["55","c",2],["42","",1],["31","",1],["19","",1],["27","",1],["10","",1]],"l":"Max-Heap válido (V[0] = 55)"}]],"stack":""},{"line":8,"caption":"Fase 2 (fim = 5): trocamos a raiz V[0] (55) com V[5] (10). Agora 55 está na sua posição final definitiva!","vars":{"fase":"2 (Extração)","fim":5,"ordenado":"[55]"},"rows":[[{"s":0,"n":5,"i":[["10","c",3],["42","",1],["31","",1],["19","",1],["27","",1],["55","p",2]],"l":"heap ativo [0..4] | ordenado [5]"}]],"stack":""},{"line":9,"caption":"Fase 2 (fim = 5): aplicamos sift_down(V, 5, 0) na porção ativa [0..4]. O segundo maior elemento (42) sobe para a raiz V[0].","vars":{"fase":"2 (Extração)","fim":5,"nova_raiz":42},"rows":[[{"s":0,"n":5,"i":[["42","c",1],["27","",1],["31","",1],["19","",1],["10","",1],["55","p",2]],"l":"heap ativo [0..4] | ordenado [5]"}]],"stack":""},{"line":9,"caption":"Fase 2 (fim = 4): trocamos V[0] (42) com V[4] (10) e aplicamos sift_down(V, 4, 0). Agora 42 e 55 estão fixados e 31 assume a raiz.","vars":{"fase":"2 (Extração)","fim":4,"nova_raiz":31},"rows":[[{"s":0,"n":4,"i":[["31","c",1],["27","",1],["10","",1],["19","",1],["42","p",2],["55","p",2]],"l":"heap ativo [0..3] | ordenado [4..5]"}]],"stack":""},{"line":9,"caption":"Fase 2 (fim = 3): trocamos V[0] (31) com V[3] (19) e aplicamos sift_down(V, 3, 0). O elemento 31 é fixado e 27 assume a raiz.","vars":{"fase":"2 (Extração)","fim":3,"nova_raiz":27},"rows":[[{"s":0,"n":3,"i":[["27","c",1],["19","",1],["10","",1],["31","p",2],["42","p",2],["55","p",2]],"l":"heap ativo [0..2] | ordenado [3..5]"}]],"stack":""},{"line":9,"caption":"Fase 2 (fim = 2): trocamos V[0] (27) com V[2] (10) e aplicamos sift_down(V, 2, 0). O elemento 27 é fixado e 19 assume a raiz.","vars":{"fase":"2 (Extração)","fim":2,"nova_raiz":19},"rows":[[{"s":0,"n":2,"i":[["19","c",1],["10","",1],["27","p",2],["31","p",2],["42","p",2],["55","p",2]],"l":"heap ativo [0..1] | ordenado [2..5]"}]],"stack":""},{"line":11,"caption":"Fase 2 (fim = 1): trocamos V[0] (19) com V[1] (10). Resta apenas 1 elemento em V[0], encerrando o Heapsort com o vetor completamente ordenado em O(n log n) e O(1) de espaço!","vars":{"fase":"Concluído","fim":1},"rows":[[{"s":0,"n":6,"i":[["10","p",2],["19","p",2],["27","p",2],["31","p",2],["42","p",2],["55","p",2]],"l":"vetor completamente ordenado"}]],"stack":""}]}
```

### Implementação em C

Reutilizamos diretamente a função `sift_down` vista na unidade de estruturas hierárquicas:

```c
#include <stdio.h>

void trocar(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Restaura a propriedade de Max-Heap a partir do índice i em um heap de tamanho n
void sift_down(int V[], int n, int i) {
    while (1) {
        int maior = i;
        int esq = 2 * i + 1;
        int dir = 2 * i + 2;

        if (esq < n && V[esq] > V[maior]) {
            maior = esq;
        }
        if (dir < n && V[dir] > V[maior]) {
            maior = dir;
        }

        if (maior != i) {
            trocar(&V[i], &V[maior]);
            i = maior;
        } else {
            break;
        }
    }
}

void heapsort(int V[], int n) {
    // Fase 1: Constroi o Max-Heap em tempo O(n)
    for (int i = (n / 2) - 1; i >= 0; i--) {
        sift_down(V, n, i);
    }

    // Fase 2: Extrai o maior elemento (raiz) para o fim e reajusta o heap
    for (int fim = n - 1; fim > 0; fim--) {
        trocar(&V[0], &V[fim]);
        sift_down(V, fim, 0);
    }
}

int main(void) {
    int dados[] = {19, 42, 10, 55, 27, 31};
    int n = sizeof(dados) / sizeof(dados[0]);

    heapsort(dados, n);

    for (int i = 0; i < n; i++) {
        printf("%d ", dados[i]);
    }
    printf("\n");
    return 0;
}
```

## Comparação e complexidade

### Síntese Geral dos Algoritmos de Ordenação (AEDS I)

O quadro abaixo consolida todos os algoritmos de ordenação estudados na disciplina — desde os métodos elementares até os algoritmos avançados — servindo como guia de decisão para escolha de método:

| Algoritmo | Melhor Caso | Caso Médio | Pior Caso | Memória Auxiliar | Estável? | Paradigma / Ideia Central |
|:--|:--|:--|:--|:--|:--|:--|
| **Bubble Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Sim | Trocas sucessivas entre adjacentes |
| **Selection Sort** | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Não | Seleção direta do mínimo a cada posição |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Sim | Inserção ordenada em subvetor à esquerda |
| **Shellsort** | $O(n \log n)$ | Depende do *gap* | $O(n^{3/2})$\* | $O(1)$ | Não | Inserção com saltos decrescentes ($h$-ordenação) |
| **Quicksort** | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | Não | Divisão e conquista via particionamento com pivô |
| **Mergesort** | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Sim | Divisão ao meio e intercalação ordenada |
| **Heapsort** | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(1)$ | Não | Seleção eficiente usando Max-Heap no vetor |

*\*Considerando a sequência de incrementos de Knuth ($h = 3h + 1$).*

## Teste de conhecimento

```quiz
{
  "question": "Qual combinação de características diferencia o Heapsort tanto do Quicksort quanto do Mergesort?",
  "options": [
    { "text": "Garante complexidade O(n log n) mesmo no pior caso (como o Mergesort) e executa estritamente in-place com memória auxiliar O(1) (como o Quicksort).", "correct": true },
    { "text": "É o único algoritmo entre os três que é estável e roda em tempo linear O(n) para qualquer entrada.", "correct": false },
    { "text": "Utiliza uma lista duplamente encadeada auxiliar para evitar comparações entre chaves.", "correct": false }
  ],
  "correctFeedback": "Correto! O Heapsort reúne a garantia assintótica O(n log n) no pior caso sem precisar alocar um vetor auxiliar O(n).",
  "incorrectFeedback": "Compare o pior caso de tempo e o uso de memória extra do Heapsort frente ao Quicksort e ao Mergesort."
}
```

```quiz
{
  "question": "Na Fase 2 do Heapsort, logo após trocar o maior elemento (V[0]) com o último elemento ativo do heap (V[fim]), qual operação deve ser executada?",
  "options": [
    { "text": "Executar sift_down(V, fim, 0) para restaurar a propriedade de Max-Heap na porção restante do vetor.", "correct": true },
    { "text": "Executar sift_up(V, fim) para devolver o maior elemento à raiz.", "correct": false },
    { "text": "Reconstruir todo o heap do zero até o índice n - 1.", "correct": false }
  ],
  "correctFeedback": "Exato! O elemento trazido do final para a raiz provavelmente viola a propriedade de Max-Heap, então o sift_down o rebaixa até sua posição correta.",
  "incorrectFeedback": "Lembre-se de que o elemento em V[fim] já está ordenado e não deve mais ser tocado; apenas a nova raiz V[0] precisa descer até o nível adequado."
}
```

```quiz
{
  "question": "Você precisa ordenar um vetor muito grande em um sistema embarcado com memória RAM extremamente limitada (exigindo execução in-place O(1)) e não pode correr o risco de degradação quadrática O(n²) no pior caso. Qual algoritmo da tabela é a escolha mais segura?",
  "options": [
    { "text": "Mergesort.", "correct": false },
    { "text": "Heapsort.", "correct": true },
    { "text": "Bubble Sort.", "correct": false }
  ],
  "correctFeedback": "Correto! O Mergesort exigiria O(n) de memória extra e o Bubble Sort levaria O(n²); o Heapsort resolve em O(n log n) garantido usando O(1) de espaço.",
  "incorrectFeedback": "Cruze os dois requisitos do enunciado na tabela comparativa: memória auxiliar O(1) E pior caso O(n log n)."
}
```