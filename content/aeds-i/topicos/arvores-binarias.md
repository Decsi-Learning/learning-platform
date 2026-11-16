## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender a organização hierárquica de dados e a terminologia formal de árvores (raiz, nó interno, folha, altura e profundidade).
- Diferenciar uma árvore binária genérica de uma Árvore Binária de Busca (ABB).
- Executar manualmente e em código C as operações de busca, inserção, remoção (nos seus três casos) e percursos (pré-ordem, em-ordem e pós-ordem).
- Avaliar o impacto do balanceamento no custo assintótico das operações da ABB.

## Introdução

Uma **árvore binária** (*Binary Tree*) é uma estrutura de dados dinâmica não linear, organizada de forma hierárquica e recursiva. Diferente de listas, pilhas e filas — onde cada elemento possui no máximo um sucessor —, em uma árvore binária cada elemento pode se ramificar em até dois caminhos.

Quando aplicamos uma regra de ordenação entre os nós, obtemos uma **Árvore Binária de Busca (ABB)** (*Binary Search Tree - BST*), amplamente utilizada para implementar dicionários, conjuntos dinâmicos e índices de pesquisa rápida.

## Conceito principal

Cada elemento da árvore é um **nó** alocado dinamicamente que armazena uma chave (dado) e dois ponteiros: `esq` (subárvore esquerda) e `dir` (subárvore direita).

```text
           [ 20 ]          ◄── Raiz (nível 0)
           /    \
       [ 10 ]  [ 30 ]      ◄── Nós internos (nível 1)
       /    \       \
    [ 5 ]  [ 15 ]  [ 40 ]  ◄── Folhas (nível 2, altura = 2)
```

### Como funciona

O acesso à estrutura ocorre por meio de um ponteiro externo para a **raiz** (`root`). A partir dela, a Árvore Binária de Busca impõe a seguinte invariante para todo nó $X$:

1. Todas as chaves na **subárvore esquerda** de $X$ são **menores** que a chave de $X$.
2. Todas as chaves na **subárvore direita** de $X$ são **maiores** que a chave de $X$.
3. Ambas as subárvores também são Árvores Binárias de Busca.

> **Regra fundamental:** em uma ABB, o percurso **Em-ordem** (*Esquerda → Raiz → Direita*) visita todas as chaves em ordem estritamente crescente.

---

## Exemplo

Considere as operações fundamentais sobre uma Árvore Binária de Busca armazenando números inteiros.

### 1. Busca e Inserção

Tanto a busca quanto a inserção comparam o valor desejado com o nó atual para decidir o caminho. A inserção ocorre sempre criando uma nova **folha** no primeiro ponteiro `NULL` encontrado:

```text
Inserir [ 12 ] na ABB anterior:
1. 12 < 20 ──► desce para esquerda ([ 10 ])
2. 12 > 10 ──► desce para direita  ([ 15 ])
3. 12 < 15 ──► esquerda de [ 15 ] é NULL ──► aloca [ 12 ] ali.
```

### 2. Remoção (os 3 casos)

A remoção exige cuidado para não quebrar a ordenação da ABB:

- **Caso 1 — Nó folha:** basta liberar o nó (`free`) e fazer o pai apontar para `NULL`.
- **Caso 2 — Nó com 1 filho:** o pai do nó removido passa a apontar diretamente para o único filho desse nó.
- **Caso 3 — Nó com 2 filhos:** substituímos a chave do nó removido pelo seu **sucessor em-ordem** (o menor nó da subárvore direita) e removemos esse sucessor, que garantidamente possui no máximo 1 filho:

```text
Remover [ 20 ] (possui 2 filhos):
  Menor da subárvore direita = [ 30 ] (sucessor)

           [ 30 ]          ◄── [ 30 ] assume o lugar de [ 20 ]
           /    \
       [ 10 ]  [ 40 ]      ◄── [ 40 ] sobe para o lugar antigo de [ 30 ]
       /    \
    [ 5 ]  [ 15 ]
```

### 3. Implementação em C

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    int info;
    struct No *esq;
    struct No *dir;
} No;

No* criar_no(int valor) {
    No *novo = (No*) malloc(sizeof(No));
    if (novo != NULL) {
        novo->info = valor;
        novo->esq = NULL;
        novo->dir = NULL;
    }
    return novo;
}

No* inserir(No *raiz, int valor) {
    if (raiz == NULL) return criar_no(valor);

    if (valor < raiz->info) {
        raiz->esq = inserir(raiz->esq, valor);
    } else if (valor > raiz->info) {
        raiz->dir = inserir(raiz->dir, valor);
    }
    return raiz;
}

No* buscar(No *raiz, int valor) {
    if (raiz == NULL || raiz->info == valor) return raiz;

    if (valor < raiz->info) return buscar(raiz->esq, valor);
    return buscar(raiz->dir, valor);
}

No* encontrar_minimo(No *raiz) {
    No *atual = raiz;
    while (atual != NULL && atual->esq != NULL) {
        atual = atual->esq;
    }
    return atual;
}

No* remover(No *raiz, int valor) {
    if (raiz == NULL) return NULL;

    if (valor < raiz->info) {
        raiz->esq = remover(raiz->esq, valor);
    } else if (valor > raiz->info) {
        raiz->dir = remover(raiz->dir, valor);
    } else {
        // Caso 1 e Caso 2: 0 ou 1 filho
        if (raiz->esq == NULL) {
            No *temp = raiz->dir;
            free(raiz);
            return temp;
        } else if (raiz->dir == NULL) {
            No *temp = raiz->esq;
            free(raiz);
            return temp;
        }
        // Caso 3: 2 filhos (substitui pelo sucessor em-ordem)
        No *sucessor = encontrar_minimo(raiz->dir);
        raiz->info = sucessor->info;
        raiz->dir = remover(raiz->dir, sucessor->info);
    }
    return raiz;
}

void em_ordem(No *raiz) {
    if (raiz != NULL) {
        em_ordem(raiz->esq);
        printf("%d ", raiz->info);
        em_ordem(raiz->dir);
    }
}

void liberar_arvore(No *raiz) {
    if (raiz != NULL) {
        liberar_arvore(raiz->esq);
        liberar_arvore(raiz->dir);
        free(raiz);
    }
}
```

## Comparação e complexidade

O custo das operações em uma ABB depende diretamente de sua altura $h$. Em uma árvore balanceada, $h = O(\log n)$; porém, se os dados forem inseridos em ordem crescente ou decrescente, a árvore degenera em uma lista linear com $h = O(n)$:

| Operação | Descrição | Caso Médio (Balanceada) | Pior Caso (Degenerada) |
|:--|:--|--:|--:|
| Buscar | Compara chaves descendo um nível por vez | O(log n) | O(n) |
| Inserir | Busca a posição `NULL` e aloca uma nova folha | O(log n) | O(n) |
| Remover | Localiza o nó e ajusta ponteiros ou sucessor | O(log n) | O(n) |
| Percursos | Visita cada nó exatamente uma vez (`Pré`, `Em`, `Pós`) | O(n) | O(n) |

## Teste de conhecimento

```quiz
{
  "question": "Ao remover um nó que possui DOIS filhos em uma Árvore Binária de Busca (ABB), qual nó deve substituir o valor removido para preservar a ordenação da estrutura?",
  "options": [
    { "text": "O menor elemento da subárvore direita (sucessor em-ordem) ou o maior da subárvore esquerda (antecessor em-ordem).", "correct": true },
    { "text": "Sempre o filho imediato da esquerda, descartando os demais descendentes.", "correct": false },
    { "text": "Qualquer nó folha escolhido aleatoriamente.", "correct": false }
  ],
  "correctFeedback": "Correto! O sucessor (ou antecessor) em-ordem garante que todas as chaves à esquerda permaneçam menores e todas à direita permaneçam maiores.",
  "incorrectFeedback": "Lembre-se de que o substituto precisa manter a invariante de ordenação entre todos os nós da subárvore esquerda e direita."
}
```

```quiz
{
  "question": "Qual percurso em árvore binária visita os filhos antes da raiz (Esquerda -> Direita -> Raiz), sendo indispensável para liberar toda a memória alocada sem perder ponteiros?",
  "options": [
    { "text": "Pré-ordem.", "correct": false },
    { "text": "Em-ordem.", "correct": false },
    { "text": "Pós-ordem.", "correct": true }
  ],
  "correctFeedback": "Exato! No percurso Pós-ordem, cada nó só recebe free() depois que suas duas subárvores já foram completamente liberadas.",
  "incorrectFeedback": "Considere o que acontece se você der free(raiz) antes de visitar raiz->esq e raiz->dir."
}
```

```quiz
{
  "question": "Por que a busca em uma ABB sem balanceamento pode degradar de O(log n) para O(n)?",
  "options": [
    { "text": "Porque a inserção de elementos já ordenados faz todos os nós crescerem em um único lado, formando uma lista encadeada.", "correct": true },
    { "text": "Porque a ABB precisa reordenar todos os nós a cada consulta realizada.", "correct": false },
    { "text": "Porque ponteiros em C limitam a profundidade máxima de recursão a 10 níveis.", "correct": false }
  ],
  "correctFeedback": "Correto! Sem rotações de balanceamento, entradas ordenadas produzem uma árvore de altura n - 1.",
  "incorrectFeedback": "Rastreie onde cada novo elemento é inserido quando inserimos 10, 20, 30, 40 e 50 em sequência."
}
```