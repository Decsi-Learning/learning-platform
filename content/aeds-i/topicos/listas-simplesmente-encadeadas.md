## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender como nós são alocados dinamicamente e encadeados por ponteiros na memória.
- Identificar a anatomia de um nó (`info` e `prox`) e o papel de `head` e `NULL`.
- Executar operações de inserção, busca e remoção preservando a integridade dos encadeamentos.
- Avaliar o custo assintótico das operações em comparação com vetores estáticos.

## Introdução

Uma **lista simplesmente encadeada** (*Singly Linked List*) é uma estrutura de dados linear dinâmica formada por uma sequência de elementos chamados **nós**. Diferente de um vetor, seus elementos não precisam ocupar posições vizinhas na memória.

Essa organização permite que a estrutura cresça e diminua sob demanda durante a execução do programa, sem desperdício de espaço pré-alocado e sem necessidade de deslocar blocos inteiros de dados a cada inserção ou remoção.

## Conceito principal

Cada nó da lista guarda dois campos essenciais: o **dado** útil armazenado e uma **referência** (ponteiro) para o endereço de memória do próximo nó da sequência.

![Diagrama de uma lista simplesmente encadeada com ponteiro head e três nós ligados até NULL](imagens/lista-simplesmente-encadeada.png){align=center width=78%}

### Como funciona

O acesso à estrutura começa sempre por um ponteiro externo chamado **cabeça da lista** (`head`), que armazena o endereço do primeiro nó. A partir dele, percorre-se a lista seguindo o campo `prox` de cada elemento até alcançar o marcador `NULL`, que indica o fim da cadeia.

> **Regra fundamental:** nunca perca o endereço armazenado em `head` durante um percurso. Utilize sempre um ponteiro auxiliar (`atual`) para caminhar pelos nós.

---

## Exemplo

Considere a manipulação passo a passo de uma lista de números inteiros em memória.

### 1. Inserção no início

Para inserir um novo nó no começo da lista, conectamos primeiro o novo elemento ao antigo primeiro nó e, em seguida, atualizamos `head`:

```text
Passo 1: novo->prox = head
  novo ──► [ 5 | ● ] ──► [ 10 | ● ] ──► [ 25 | NULL ]
                          ▲
                         head

Passo 2: head = novo
  head ──► [ 5 | ● ] ──► [ 10 | ● ] ──► [ 25 | NULL ]
```

### 2. Inserção após um nó conhecido

Ao inserir `novo` logo após um nó `ant`, a ordem das atribuições evita a perda do restante da lista:

```text
Inserir [ 18 ] após [ 10 ]:

  [ 10 | ● ] ───────────────────► [ 25 | NULL ]
         │                           ▲
         │ (2º) ant->prox = novo     │ (1º) novo->prox = ant->prox
         └──────► [ 18 | ● ] ────────┘
```

### 3. Implementação em C

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    int info;
    struct No *prox;
} No;

No* inserir_inicio(No *head, int valor) {
    No *novo = (No*) malloc(sizeof(No));
    if (novo == NULL) return head;

    novo->info = valor;
    novo->prox = head;
    return novo;
}

No* buscar(No *head, int valor) {
    No *atual = head;
    while (atual != NULL) {
        if (atual->info == valor) return atual;
        atual = atual->prox;
    }
    return NULL;
}

No* remover(No *head, int valor) {
    No *ant = NULL;
    No *atual = head;

    while (atual != NULL && atual->info != valor) {
        ant = atual;
        atual = atual->prox;
    }

    if (atual == NULL) return head;

    if (ant == NULL) {
        head = atual->prox;
    } else {
        ant->prox = atual->prox;
    }

    free(atual);
    return head;
}
```

## Comparação e complexidade

A tabela abaixo resume o custo computacional das operações considerando apenas o ponteiro `head`:

| Operação | Descrição | Custo |
|:--|:--|--:|
| Inserir no início | Atualiza `novo->prox` e redireciona `head` | O(1) |
| Remover no início | Avança `head` para `head->prox` e libera o nó | O(1) |
| Acessar por índice | Percorre nó a nó a partir de `head` até a posição | O(n) |
| Buscar por valor | Compara cada elemento até encontrar ou chegar em `NULL` | O(n) |
| Inserir ou remover no fim | Exige percorrer toda a lista até o último nó | O(n) |

## Teste de conhecimento

```quiz
{
  "question": "Por que acessar o k-ésimo elemento em uma lista simplesmente encadeada custa O(n), enquanto em um vetor custa O(1)?",
  "options": [
    { "text": "Porque a lista encadeada ordena os elementos antes de cada leitura.", "correct": false },
    { "text": "Porque os nós ficam em posições não contíguas da memória, exigindo percurso sequencial desde head.", "correct": true },
    { "text": "Porque o ponteiro NULL impede o uso de índices inteiros em C.", "correct": false }
  ],
  "correctFeedback": "Correto! Sem endereços contíguos, o endereço de cada nó só é descoberto lendo o ponteiro prox do nó anterior.",
  "incorrectFeedback": "Lembre-se de como os dados são distribuídos na memória em vetores versus nós alocados dinamicamente."
}
```

```quiz
{
  "question": "Ao inserir um nó 'novo' logo após o nó 'ant', o que acontece se executarmos 'ant->prox = novo;' antes de 'novo->prox = ant->prox;'?",
  "options": [
    { "text": "A inserção funciona normalmente, pois a ordem das duas linhas não altera o resultado.", "correct": false },
    { "text": "O endereço do antigo sucessor de 'ant' é perdido e 'novo->prox' passa a apontar para si mesmo.", "correct": true },
    { "text": "O ponteiro 'head' é automaticamente atualizado para o final da lista.", "correct": false }
  ],
  "correctFeedback": "Exato! Sobrescrever ant->prox antes de salvar o endereço seguinte causa perda da sublista restante e cria um ciclo em novo.",
  "incorrectFeedback": "Rastreie qual endereço fica armazenado em ant->prox após a primeira atribuição."
}
```

```quiz
{
  "question": "Qual o custo para inserir um elemento no final de uma lista simplesmente encadeada que mantém apenas o ponteiro 'head'?",
  "options": [
    { "text": "O(1), pois basta alterar o ponteiro do último elemento.", "correct": false },
    { "text": "O(log n), utilizando busca binária nos ponteiros.", "correct": false },
    { "text": "O(n), pois é necessário percorrer todos os nós até encontrar o que aponta para NULL.", "correct": true }
  ],
  "correctFeedback": "Correto! Sem um ponteiro auxiliar para o último nó (tail), é preciso caminhar desde head até o fim da lista.",
  "incorrectFeedback": "Considere que você só conhece o endereço inicial (head) e precisa chegar ao nó cujo campo prox vale NULL."
}
```