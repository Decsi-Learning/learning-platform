## Recursão indireta

### Conceito

A **recursão indireta** (ou mútua) ocorre quando uma função chama outra, que eventualmente chama a primeira. Exemplo: `A → B → A`.

### Exemplo em C: par e ímpar

```c
#include <stdbool.h>

bool impar(int n);

bool par(int n) {
    if (n == 0) return true;
    return impar(n - 1);
}

bool impar(int n) {
    if (n == 0) return false;
    return par(n - 1);
}
```

O exemplo considera `n >= 0`. O protótipo `bool impar(int n);` permite que `par` chame a função antes de sua definição.

### Rastreio de `par(3)`

`par(3) → impar(2) → par(1) → impar(0) → false`.

As funções alternam e o argumento diminui até atingir o caso base.

## Demonstração interativa

Avance e volte pelos passos para acompanhar o rastreio.

```demo
{
  "title": "Siga as chamadas de par(3)",
  "steps": [
    {
      "caption": "par(3) não chegou ao caso base. Chama impar(2).",
      "state": "par(3)\n3 != 0\n↓\nimpar(2)"
    },
    {
      "caption": "impar(2) chama par(1). As funções alternam entre si.",
      "state": "impar(2)\n2 != 0\n↓\npar(1)"
    },
    {
      "caption": "par(1) chama impar(0).",
      "state": "par(1)\n1 != 0\n↓\nimpar(0)"
    },
    {
      "caption": "impar(0) é o caso base e retorna false. Esse valor retorna pelas chamadas anteriores.",
      "state": "impar(0) → false\npar(1) → false\nimpar(2) → false\npar(3) → false"
    }
  ]
}
```

### Teste rápido

```quiz
{
  "question": "Qual situação caracteriza recursão indireta?",
  "options": [
    { "text": "A função A chama A diretamente.", "correct": false },
    { "text": "A chama B e B chama A novamente.", "correct": true },
    { "text": "Uma função executa um laço for.", "correct": false },
    { "text": "Uma função chama outra sem retorno.", "correct": false }
  ],
  "correctFeedback": "Isso: o ciclo passa por outra função.",
  "incorrectFeedback": "Observe se a função chama a si mesma ou se outra função está no caminho."
}
```


### Mais questões de fixação

```quiz
{
  "question": "Qual sequência representa recursão indireta?",
  "options": [
    {
      "text": "A → A → A",
      "correct": false
    },
    {
      "text": "A → B → A",
      "correct": true
    },
    {
      "text": "A → laço → fim",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! O ciclo recursivo passa por outra função.",
  "incorrectFeedback": "Na recursão indireta, uma função chama outra que retorna à primeira."
}
```

```quiz
{
  "question": "No exemplo par(3), por que o processo termina?",
  "options": [
    {
      "text": "O argumento diminui até chegar a zero",
      "correct": true
    },
    {
      "text": "As funções deixam de se chamar após duas etapas",
      "correct": false
    },
    {
      "text": "O compilador remove todas as chamadas",
      "correct": false
    }
  ],
  "correctFeedback": "Correto: o argumento progride até o caso base.",
  "incorrectFeedback": "Acompanhe 3, 2, 1, 0: o valor se aproxima do caso base."
}
```

