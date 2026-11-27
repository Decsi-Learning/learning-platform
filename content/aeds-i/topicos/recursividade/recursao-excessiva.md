## Recursão excessiva

### Conceito

A recursão pode ser ineficiente quando repete cálculos já realizados. Um exemplo clássico é Fibonacci:

```c
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

### Rastreio de `fib(5)`

`fib(5)` chama `fib(4)` e `fib(3)`. Ao calcular `fib(4)`, o algoritmo também chama `fib(3)`. Portanto, `fib(3)` é calculado mais de uma vez.

### Como reduzir repetições?

- **Memoização:** guardar resultados e reutilizá-los.
- **Programação dinâmica:** organizar o cálculo dos subproblemas.
- **Iteração:** substituir recursão por laço quando adequado.

A versão simples de Fibonacci tem tempo exponencial (frequentemente limitado por `O(2^n)`). Com memoização, o cálculo pode ser feito em `O(n)` tempo e `O(n)` espaço.

## Demonstração interativa

Avance e volte pelos passos para acompanhar o rastreio.

```demo
{
  "title": "Veja as chamadas repetidas em fib(4)",
  "steps": [
    {
      "caption": "fib(4) abre dois ramos: fib(3) e fib(2).",
      "state": "fib(4)\n├─ fib(3)\n└─ fib(2)"
    },
    {
      "caption": "fib(3) também abre fib(2) e fib(1). O ramo fib(2) é calculado aqui.",
      "state": "fib(4)\n├─ fib(3)\n│  ├─ fib(2)  ← calculado\n│  └─ fib(1)\n└─ fib(2)"
    },
    {
      "caption": "O segundo ramo de fib(4) calcula fib(2) novamente: trabalho repetido.",
      "state": "fib(4)\n├─ fib(3)\n│  ├─ fib(2)\n│  └─ fib(1)\n└─ fib(2)  ← repetido"
    },
    {
      "caption": "fib(2) retorna 1 e fib(1) retorna 1; então fib(3) = 2 e fib(4) = 3.",
      "state": "fib(2) = 1\nfib(1) = 1\nfib(3) = 2\nfib(4) = 3\n\nMemoização guarda resultados para evitar recalcular."
    }
  ]
}
```

### Teste rápido

```quiz
{
  "question": "Por que Fibonacci recursivo simples é ineficiente?",
  "options": [
    { "text": "Não possui caso base.", "correct": false },
    { "text": "Recalcula subproblemas como fib(3) em vários ramos.", "correct": true },
    { "text": "Não pode retornar valores inteiros.", "correct": false },
    { "text": "Usa apenas uma chamada recursiva.", "correct": false }
  ],
  "correctFeedback": "Exato: há trabalho repetido.",
  "incorrectFeedback": "Observe a árvore de chamadas e os subproblemas que aparecem em mais de um ramo."
}
```


### Mais questões de fixação

```quiz
{
  "question": "Qual técnica armazena resultados já calculados para reutilizá-los?",
  "options": [
    {
      "text": "Memoização",
      "correct": true
    },
    {
      "text": "Backtracking",
      "correct": false
    },
    {
      "text": "Recursão indireta",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Memoização evita repetir o mesmo subproblema.",
  "incorrectFeedback": "A técnica guarda respostas anteriores em uma estrutura de memória."
}
```

```quiz
{
  "question": "Qual problema aparece no Fibonacci recursivo simples?",
  "options": [
    {
      "text": "Calcula fib(1) apenas uma vez",
      "correct": false
    },
    {
      "text": "Repete cálculos de subproblemas em vários ramos",
      "correct": true
    },
    {
      "text": "Não possui caso base",
      "correct": false
    }
  ],
  "correctFeedback": "Isso. A árvore de chamadas contém subproblemas repetidos.",
  "incorrectFeedback": "Veja fib(2) ou fib(3) aparecerem em ramos diferentes da árvore."
}
```

