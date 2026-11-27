# Lista de Exercícios - Segment Tree

Resolva a lista de exercícios para avançar para a próxima etapa.

Quando a questão citar o exemplo da aula, considere a Segment Tree de somas de v = {2, 5, 1, 4, 9, 3}, com a raiz no nó 1 e os filhos de `no` em `2 * no` e `2 * no + 1`.

## Questões interativas

Escolha os nós que somam um intervalo e depois os que mudam quando um valor do vetor é trocado. Se errar, a mensagem explica o que falta; depois da primeira tentativa, o botão **Ver resposta** aparece.

```pratica
{
  "tipo": "segtree",
  "title": "Pratique: consulta e atualização na Segment Tree",
  "vetor": [
    2,
    5,
    1,
    4,
    9,
    3
  ],
  "consulta": {
    "de": 1,
    "ate": 4
  },
  "edicao": {
    "pos": 2,
    "valor": 6
  }
}
```

## Questões de múltipla escolha

```quiz
{
  "question": "Por que usar uma Segment Tree em vez de um vetor de somas acumuladas?",
  "options": [
    { "text": "Porque a Segment Tree responde a soma de um intervalo em O(1)", "correct": false },
    { "text": "Porque, com atualizações frequentes, o vetor de somas acumuladas gasta O(n) a cada troca, e a Segment Tree, O(log n)", "correct": true },
    { "text": "Porque a Segment Tree ocupa menos memória que o vetor de somas acumuladas", "correct": false },
    { "text": "Porque o vetor de somas acumuladas não consegue somar intervalos", "correct": false }
  ],
  "correctFeedback": "Correto! As somas acumuladas são ótimas para consultas, mas cada troca obriga a refazer as somas seguintes. A Segment Tree faz as duas operações em O(log n).",
  "incorrectFeedback": "Releia a introdução: em qual operação o vetor de somas acumuladas é lento?"
}
```

```quiz
{
  "question": "Com o vetor de somas acumuladas acum[i] = v[0] + ... + v[i], como se calcula a soma de v[0..b]?",
  "options": [
    { "text": "acum[b] - acum[-1]", "correct": false },
    { "text": "acum[b], porque quando a = 0 não há nada para descontar", "correct": true },
    { "text": "acum[b] - acum[0]", "correct": false }
  ],
  "correctFeedback": "Correto! A fórmula acum[b] - acum[a - 1] só vale para a > 0. Com a = 0, acum[b] já é a soma pedida.",
  "incorrectFeedback": "acum[b] - acum[0] deixa v[0] de fora, e acum[-1] não existe. O que acum[b] já soma?"
}
```

```quiz
{
  "question": "Na Segment Tree guardada em vetor, onde ficam os filhos do nó 6?",
  "options": [
    { "text": "Nas posições 7 e 8", "correct": false },
    { "text": "Nas posições 12 e 13", "correct": true },
    { "text": "Nas posições 3 e 4", "correct": false }
  ],
  "correctFeedback": "Correto! Os filhos de no ficam em 2 * no e 2 * no + 1, como no heap.",
  "incorrectFeedback": "Lembre-se da regra da representação em C: o filho esquerdo de no fica em 2 * no."
}
```

```quiz
{
  "question": "Um vetor tem 6 elementos. Quantos nós tem a Segment Tree de somas montada sobre ele?",
  "options": [
    { "text": "6", "correct": false },
    { "text": "11, porque são 2n − 1 nós", "correct": true },
    { "text": "24, o tamanho do vetor arvore", "correct": false },
    { "text": "8, a próxima potência de 2", "correct": false }
  ],
  "correctFeedback": "Correto! São 6 folhas e 5 nós internos. O vetor arvore tem 4n posições só como margem: algumas ficam sem uso.",
  "incorrectFeedback": "Conte as folhas (uma por elemento) e lembre que cada nó interno tem exatamente dois filhos."
}
```

```quiz
{
  "question": "O nó 3 do exemplo cobre v[3..5]. Que trechos cobrem os filhos dele?",
  "options": [
    { "text": "v[3..4] e v[5]", "correct": true },
    { "text": "v[3] e v[4..5]", "correct": false },
    { "text": "v[3..5] e v[3..5]", "correct": false }
  ],
  "correctFeedback": "Correto! meio = (3 + 5) / 2 = 4, então o filho esquerdo cobre v[3..4] e o direito, v[5..5].",
  "incorrectFeedback": "Calcule meio = (ini + fim) / 2. O filho esquerdo fica com v[ini..meio] e o direito, com v[meio+1..fim]."
}
```

```quiz
{
  "question": "Durante a consulta de v[1..4], a busca chega ao nó que cobre v[3..4]. O que acontece?",
  "options": [
    { "text": "A busca desce até as folhas de v[3] e v[4] para somá-las", "correct": false },
    { "text": "O nó está dentro do intervalo e devolve a soma que já guarda, sem descer", "correct": true },
    { "text": "O nó está fora do intervalo e devolve 0", "correct": false }
  ],
  "correctFeedback": "Correto! v[3..4] cabe inteiro em v[1..4], então o valor do nó já é a resposta daquele trecho.",
  "incorrectFeedback": "Compare o trecho do nó com o intervalo pedido. Reveja os três casos da consulta."
}
```

```quiz
{
  "question": "No exemplo da aula, quais nós entram na resposta da consulta de v[2..5]?",
  "options": [
    { "text": "As quatro folhas v[2], v[3], v[4] e v[5]", "correct": false },
    { "text": "A folha v[2] e o nó que cobre v[3..5]: 1 + 16 = 17", "correct": true },
    { "text": "Só a raiz, que vale 24", "correct": false }
  ],
  "correctFeedback": "Correto! v[3..5] cabe inteiro no intervalo, então o nó 3 entra com 16 sem descer. Do lado esquerdo, só a folha v[2] serve.",
  "incorrectFeedback": "Comece pela raiz e classifique cada nó como fora, dentro ou parcial. Só os nós dentro entram na soma."
}
```

```quiz
{
  "question": "Depois de trocar o valor de v[2], quais nós da árvore precisam ser recalculados?",
  "options": [
    { "text": "Todos os nós da árvore", "correct": false },
    { "text": "Só a folha de v[2]", "correct": false },
    { "text": "A folha de v[2] e os seus ancestrais, até a raiz", "correct": true },
    { "text": "Todas as folhas à direita de v[2]", "correct": false }
  ],
  "correctFeedback": "Correto! Só os nós cujo trecho contém a posição 2 mudam: é um caminho da raiz até a folha, com O(log n) nós.",
  "incorrectFeedback": "Pense em quais trechos contêm a posição 2. Reveja a animação da atualização."
}
```

```quiz
{
  "question": "Qual é o custo de construir a Segment Tree de um vetor com n elementos?",
  "options": [
    { "text": "O(n), porque cada nó é calculado uma única vez", "correct": true },
    { "text": "O(n log n), porque cada elemento é somado em todos os níveis", "correct": false },
    { "text": "O(log n), a altura da árvore", "correct": false }
  ],
  "correctFeedback": "Correto! São 2n − 1 nós, e cada um faz uma soma dos dois filhos, que já estão prontos.",
  "incorrectFeedback": "Releia a construção: quantas vezes cada nó é visitado e quanto trabalho ele faz?"
}
```

```quiz
{
  "question": "Numa Segment Tree de mínimo, o que um nó fora do intervalo consultado deve devolver?",
  "options": [
    { "text": "0, como na soma", "correct": false },
    { "text": "+∞ (em C, INT_MAX), porque não muda o mínimo de nenhum valor", "correct": true },
    { "text": "−∞ (em C, INT_MIN)", "correct": false }
  ],
  "correctFeedback": "Correto! O valor devolvido precisa ser o elemento neutro da operação. Com 0, o mínimo de valores positivos sairia errado.",
  "incorrectFeedback": "Releia a tabela de outras operações: que valor não altera o resultado de min(x, valor)?"
}
```
