## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Representar uma lista em um vetor com um contador de elementos.
- Explicar por que inserir ou remover no meio do vetor exige deslocamentos.
- Implementar inserção e remoção em C, respeitando a capacidade máxima.
- Comparar o custo das operações com a versão encadeada.

## Introdução

A forma mais direta de implementar uma lista é guardar os itens em um **vetor**: posições contíguas de memória, acessadas por índice. É a mesma ideia de uma prateleira com lugares numerados: se você sabe o número do lugar, vai direto até ele.

O preço dessa comodidade aparece quando a ordem muda. Para abrir espaço para um novo item no meio da prateleira, é preciso empurrar todos os seguintes uma posição adiante.

## Como funciona

A lista é representada por um vetor `itens` com capacidade fixa `MAX` e um contador `n` que diz quantas posições estão ocupadas. Os elementos válidos ficam sempre nas posições de `0` a `n - 1`.

- **Acessar** o elemento da posição `k` é imediato: `itens[k]`.
- **Inserir** na posição `pos` exige mover os elementos de `pos` até `n - 1` uma posição para a direita, abrindo espaço.
- **Remover** da posição `pos` exige mover os elementos de `pos + 1` até `n - 1` uma posição para a esquerda, fechando o buraco.

```demo
{ "title": "Inserir 7 na posição 1 de uma lista com 3 elementos", "steps": [
  { "caption": "Lista inicial: n = 3. Queremos inserir 7 na posição 1.", "state": "índice:   0    1    2    3    4\nitens:  [ 10 | 25 | 30 |    |    ]\n             n = 3" },
  { "caption": "Passo 1: desloca os elementos de trás para frente, começando do último.", "state": "índice:   0    1    2    3    4\nitens:  [ 10 | 25 | 25 | 30 |    ]\n                 30 →    25 →\n      (30 foi para 3; 25 foi para 2)" },
  { "caption": "Passo 2: a posição 1 ficou livre. Escreve o novo elemento e atualiza n.", "state": "índice:   0    1    2    3    4\nitens:  [ 10 |  7 | 25 | 30 |    ]\n             n = 4" }
] }
```

> **Atenção à ordem do deslocamento:** na inserção, mova do último elemento para o primeiro; na remoção, do primeiro livre para o último. Inverter a ordem sobrescreve valores que ainda seriam necessários.

## Implementação em C

```explicado c
#define MAX 100

typedef struct {
    int itens[MAX];
    int n;
} Lista;

int inserir(Lista *L, int pos, int x) {
    if (L->n == MAX || pos < 0 || pos > L->n) return 0; @@ Rejeita lista cheia ou posição inválida.
    for (int i = L->n; i > pos; i--) { @@ Percorre de trás para frente, do último até pos.
        L->itens[i] = L->itens[i - 1]; @@ Move cada elemento uma posição para a direita.
    }
    L->itens[pos] = x; @@ Escreve o novo elemento no espaço aberto.
    L->n++; @@ A lista passa a ter um elemento a mais.
    return 1; @@ Sucesso.
}

int remover(Lista *L, int pos) {
    if (pos < 0 || pos >= L->n) return 0; @@ Rejeita posição fora da parte ocupada.
    for (int i = pos; i < L->n - 1; i++) { @@ Percorre da posição removida até o penúltimo.
        L->itens[i] = L->itens[i + 1]; @@ Move cada elemento uma posição para a esquerda.
    }
    L->n--; @@ A lista passa a ter um elemento a menos.
    return 1; @@ Sucesso.
}
```

## Comparação e complexidade

| Operação | Descrição | Custo |
|:--|:--|--:|
| Acessar por índice | Leitura direta de `itens[k]` | O(1) |
| Inserir ou remover no fim | Sem deslocamentos, se houver espaço | O(1) |
| Inserir ou remover no início ou meio | Desloca até n elementos | O(n) |
| Buscar por valor | Compara elemento a elemento | O(n) |

A implementação por vetor é uma boa escolha quando o tamanho máximo é conhecido e o acesso por índice é frequente. Quando o número de elementos varia muito ou há muitas inserções e remoções no meio, a versão encadeada costuma ser melhor, como veremos a seguir.

## Teste de conhecimento

```quiz
{
  "question": "Por que inserir um elemento no início de uma lista implementada por vetor custa O(n)?",
  "options": [
    { "text": "Porque é preciso deslocar todos os n elementos uma posição para a direita para abrir espaço.", "correct": true },
    { "text": "Porque o vetor precisa ser ordenado novamente após cada inserção.", "correct": false },
    { "text": "Porque o índice 0 é protegido pelo sistema operacional e exige uma cópia completa.", "correct": false }
  ],
  "correctFeedback": "Correto! Como os itens ocupam posições contíguas, abrir espaço no início move todos os elementos existentes.",
  "incorrectFeedback": "Pense na prateleira numerada: o que acontece com quem já está nela quando o novo item precisa ficar no lugar 0? Tente novamente."
}
```

```quiz
{
  "question": "Na inserção em vetor, por que o deslocamento deve começar pelo último elemento, e não pelo da posição de inserção?",
  "options": [
    { "text": "Porque começar pelo último torna o algoritmo O(1).", "correct": false },
    { "text": "Porque começar pela posição de inserção sobrescreve o elemento seguinte antes de ele ser copiado, destruindo dados.", "correct": true },
    { "text": "A ordem do deslocamento não importa, pois o compilador otimiza o laço.", "correct": false }
  ],
  "correctFeedback": "Exato! Se itens[pos] for copiado para itens[pos+1] primeiro, o valor original de itens[pos+1] se perde antes de ser movido.",
  "incorrectFeedback": "Rastreie com dois elementos: o que acontece com itens[pos+1] se você copiar itens[pos] para lá antes de movê-lo? Tente novamente."
}
```
