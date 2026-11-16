## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender como o balanceamento automático evita a degeneração das Árvores Binárias de Busca.
- Identificar e verificar as cinco invariantes estruturais de uma Árvore Vermelho e Preto (Rubro-Negra).
- Executar rotações simples à esquerda e à direita preservando a propriedade de ordenação da ABB.
- Aplicar recoloração e rotações para restaurar o equilíbrio após inserções e remoções.

## Introdução

Uma **Árvore Vermelho e Preto** (*Red-Black Tree* ou Árvore Rubro-Negra) é uma Árvore Binária de Busca auto-balanceável. Como vimos na ABB comum, inserir chaves em ordem crescente cria uma árvore torta de altura $O(n)$, degradando o desempenho das buscas.

Para garantir tempo $O(\log n)$ mesmo no pior caso sem o custo rígido de rebalancear a árvore inteira a cada modificação, a Árvore Vermelho e Preto armazena um bit extra de cor em cada nó e utiliza regras locais para manter sua altura controlada.

## Conceito principal

Cada nó da estrutura guarda a chave, os ponteiros `esq`, `dir` e `pai`, além de um campo `cor` que assume o valor **VERMELHO** ou **PRETO**.

```text
           [ 20 (P) ]                ◄── Raiz sempre PRETA
            /      \
      [ 10 (V) ]  [ 30 (P) ]         ◄── Nó vermelho só tem filhos pretos
       /      \
  [ 5 (P) ] [ 15 (P) ]               ◄── Todos os caminhos têm 2 nós pretos
```

### Como funciona

Toda Árvore Vermelho e Preto válida obedece rigorosamente a **5 invariantes**:

1. **Bicoloridade:** Todo nó é **vermelho** ou **preto**.
2. **Raiz preta:** A raiz da árvore é sempre **preta**.
3. **Folhas nulas pretas:** Todo ponteiro nulo (`NULL` / `NIL`) é considerado um nó **preto**.
4. **Restrição do vermelho:** Se um nó é vermelho, ambos os seus filhos devem ser **pretos** (nunca existem dois nós vermelhos consecutivos).
5. **Altura Negra (*Black-Height*):** Todo caminho simples de um nó até qualquer folha descendente contém exatamente a **mesma quantidade de nós pretos**.

> **Regra fundamental:** como não há dois vermelhos seguidos e todos os caminhos têm o mesmo número de nós pretos, o caminho mais longo da raiz até uma folha nunca ultrapassa o dobro do caminho mais curto ($h \le 2 \log_2(n + 1)$).

---

## Exemplo

Quando inserimos ou removemos nós, podemos violar temporariamente as regras 2, 4 ou 5. Para restaurar o equilíbrio em $O(\log n)$, utilizamos **rotações** e **recoloração**.

### 1. Rotações (Esquerda e Direita)

As rotações alteram apenas ponteiros locais em tempo $O(1)$ para diminuir a altura de um ramo, mantendo intacta a ordem crescente do percurso Em-ordem:

```text
Rotação à Esquerda em X:               Rotação à Direita em Y:

      [ X ]                                  [ Y ]
      /   \             ───────►             /   \
     α    [ Y ]         ◄───────           [ X ]  γ
          /   \                            /   \
         β     γ                          α     β
```

### 2. Inserção e Correção (`inserir_fixup`)

Todo novo nó é inserido como em uma ABB comum e pintado inicialmente de **VERMELHO** (para não alterar a Altura Negra). Se o pai do novo nó também for vermelho, violamos a regra 4 e analisamos a cor do **tio** (irmão do pai):

- **Caso 1 (Tio é Vermelho):** Pintamos o **pai** e o **tio** de **PRETO**, pintamos o **avô** de **VERMELHO** e continuamos verificando a partir do avô.
- **Caso 2 (Tio é Preto — formato triângulo/joelho):** Aplicamos uma rotação no **pai** para alinhar os nós em linha reta (reduzindo ao Caso 3).
- **Caso 3 (Tio é Preto — formato linha reta):** Aplicamos uma rotação no **avô** na direção oposta e trocamos as cores do **pai** e do **avô**.

### 3. Remoção e Correção (`remover_fixup`)

A remoção segue os 3 casos da ABB. Se o nó efetivamente removido era **vermelho**, nenhuma invariante é quebrada. Se era **preto**, aquele ramo perde 1 unidade de Altura Negra (criando um nó "duplo preto"). A correção analisa a cor do **irmão** e dos **sobrinhos**, aplicando no máximo 3 rotações e recolorações para reequilibrar a contagem de nós pretos.

### 4. Implementação em C (Rotações e Ajuste de Inserção)

```c
#include <stdio.h>
#include <stdlib.h>

typedef enum { VERMELHO, PRETO } Cor;

typedef struct NoRB {
    int info;
    Cor cor;
    struct NoRB *esq, *dir, *pai;
} NoRB;

void rotacao_esquerda(NoRB **raiz, NoRB *x) {
    NoRB *y = x->dir;
    x->dir = y->esq;
    if (y->esq != NULL) y->esq->pai = x;

    y->pai = x->pai;
    if (x->pai == NULL) {
        *raiz = y;
    } else if (x == x->pai->esq) {
        x->pai->esq = y;
    } else {
        x->pai->dir = y;
    }

    y->esq = x;
    x->pai = y;
}

void rotacao_direita(NoRB **raiz, NoRB *y) {
    NoRB *x = y->esq;
    y->esq = x->dir;
    if (x->dir != NULL) x->dir->pai = y;

    x->pai = y->pai;
    if (y->pai == NULL) {
        *raiz = x;
    } else if (y == y->pai->esq) {
        y->pai->esq = x;
    } else {
        y->pai->dir = x;
    }

    x->dir = y;
    y->pai = x;
}

void corrigir_insercao(NoRB **raiz, NoRB *z) {
    while (z->pai != NULL && z->pai->cor == VERMELHO) {
        NoRB *avo = z->pai->pai;
        if (z->pai == avo->esq) {
            NoRB *tio = avo->dir;
            if (tio != NULL && tio->cor == VERMELHO) {
                // Caso 1: Tio vermelho (recoloração)
                z->pai->cor = PRETO;
                tio->cor = PRETO;
                avo->cor = VERMELHO;
                z = avo;
            } else {
                if (z == z->pai->dir) {
                    // Caso 2: Joelho -> alinha com rotação à esquerda
                    z = z->pai;
                    rotacao_esquerda(raiz, z);
                }
                // Caso 3: Linha reta -> rotação à direita no avô
                z->pai->cor = PRETO;
                avo->cor = VERMELHO;
                rotacao_direita(raiz, avo);
            }
        } else {
            NoRB *tio = avo->esq;
            if (tio != NULL && tio->cor == VERMELHO) {
                z->pai->cor = PRETO;
                tio->cor = PRETO;
                avo->cor = VERMELHO;
                z = avo;
            } else {
                if (z == z->pai->esq) {
                    z = z->pai;
                    rotacao_direita(raiz, z);
                }
                z->pai->cor = PRETO;
                avo->cor = VERMELHO;
                rotacao_esquerda(raiz, avo);
            }
        }
    }
    (*raiz)->cor = PRETO; // Garante a invariante da raiz preta
}
```

## Comparação e complexidade

A tabela abaixo compara a Árvore Vermelho e Preto com a ABB comum:

| Operação | ABB Comum (Pior Caso) | Árvore Vermelho e Preto (Pior Caso) | Rotações Máximas |
|:--|:--|--:|--:|
| Buscar | O(n) | O(log n) | 0 |
| Inserir | O(n) | O(log n) | 2 |
| Remover | O(n) | O(log n) | 3 |
| Espaço extra por nó | 0 bits | 1 bit (cor) + ponteiro `pai` | — |

## Teste de conhecimento

```quiz
{
  "question": "Por que todo novo nó inserido em uma Árvore Vermelho e Preto recebe inicialmente a cor VERMELHA em vez de PRETA?",
  "options": [
    { "text": "Para preservar a invariante da Altura Negra (mesma quantidade de nós pretos em todos os caminhos até as folhas).", "correct": true },
    { "text": "Porque a raiz da árvore precisa terminar sempre com a cor vermelha.", "correct": false },
    { "text": "Porque nós pretos não permitem rotações à esquerda.", "correct": false }
  ],
  "correctFeedback": "Correto! Inserir um nó preto adicionaria 1 nó preto apenas ao ramo modificado, quebrando a regra 5 imediatamente.",
  "incorrectFeedback": "Revise a Regra 5 (Altura Negra) e avalie o que acontece na contagem de nós pretos quando adicionamos um novo nó."
}
```

```quiz
{
  "question": "Durante a inserção em uma Árvore Vermelho e Preto, ocorre um conflito 'vermelho-vermelho' (pai vermelho e filho vermelho) e o TIO do novo nó também é VERMELHO. Qual é o procedimento correto?",
  "options": [
    { "text": "Apenas recolorir: pintar pai e tio de preto, pintar o avô de vermelho e subir a verificação para o avô.", "correct": true },
    { "text": "Aplicar uma rotação dupla no avô e remover o tio da árvore.", "correct": false },
    { "text": "Pintar o novo nó de preto e encerrar o algoritmo sem verificar os níveis superiores.", "correct": false }
  ],
  "correctFeedback": "Exato! Quando o tio é vermelho, não há necessidade de rotações; a recoloração empurra o vermelho para cima mantendo a Altura Negra intacta.",
  "incorrectFeedback": "Lembre-se da distinção entre Tio Vermelho (apenas recoloração) e Tio Preto (exige rotação)."
}
```

```quiz
{
  "question": "Qual garantia fundamental uma rotação (à esquerda ou à direita) preserva em uma Árvore Vermelho e Preto?",
  "options": [
    { "text": "Mantém inalterada a ordem crescente do percurso Em-ordem (propriedade de Árvore Binária de Busca).", "correct": true },
    { "text": "Garante que todos os nós da árvore fiquem com a cor preta após o giro.", "correct": false },
    { "text": "Transforma qualquer árvore binária em uma lista circular.", "correct": false }
  ],
  "correctFeedback": "Correto! As rotações reorganizam apenas os encadeamentos verticais para reduzir a altura, mantendo a ordenação relativa das chaves.",
  "incorrectFeedback": "Observe o diagrama de rotação entre X, Y e as subárvores α, β, γ: a sequência da esquerda para a direita continua α, X, β, Y, γ."
}
```