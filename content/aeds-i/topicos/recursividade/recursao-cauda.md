## Recursão de cauda

### Conceito

A **recursão de cauda** ocorre quando a chamada recursiva é a última operação da função. Não há cálculo pendente depois que ela retorna.

```c
int soma_cauda(int n, int acumulador) {
    if (n == 0) return acumulador;
    return soma_cauda(n - 1, acumulador + n);
}
```

O parâmetro `acumulador` guarda o resultado parcial, evitando deixar somas pendentes na pilha.

### Rastreio de `soma_cauda(3, 0)`

| Chamada | Acumulador |
|---|---:|
| `soma_cauda(3, 0)` | `0 + 3 = 3` |
| `soma_cauda(2, 3)` | `3 + 2 = 5` |
| `soma_cauda(1, 5)` | `5 + 1 = 6` |
| `soma_cauda(0, 6)` | retorna `6` |

### Atenção

Recursão de cauda pode facilitar a transformação em laço, mas C não garante que o compilador elimine as chamadas recursivas.

## Demonstração interativa

Avance e volte pelos passos para acompanhar o rastreio.

```demo
{
  "title": "Acompanhe soma_cauda(3, 0)",
  "steps": [
    {
      "caption": "A chamada recebe n = 3 e acumulador = 0. Soma n ao acumulador e passa n - 1.",
      "state": "soma_cauda(3, 0)\nnovo acumulador = 0 + 3 = 3\npróxima chamada: soma_cauda(2, 3)"
    },
    {
      "caption": "A chamada seguinte atualiza o acumulador para 5.",
      "state": "soma_cauda(2, 3)\nnovo acumulador = 3 + 2 = 5\npróxima chamada: soma_cauda(1, 5)"
    },
    {
      "caption": "Depois soma 1 e chega a n = 0.",
      "state": "soma_cauda(1, 5)\nnovo acumulador = 5 + 1 = 6\npróxima chamada: soma_cauda(0, 6)"
    },
    {
      "caption": "O caso base retorna o acumulador. Não há multiplicação ou soma pendente após a chamada recursiva.",
      "state": "soma_cauda(0, 6)\ncaso base → retorna 6\nresultado final: 6"
    }
  ]
}
```

### Teste rápido

```quiz
{
  "question": "Qual trecho usa recursão de cauda?",
  "options": [
    { "text": "return n * f(n - 1);", "correct": false },
    { "text": "return n + f(n - 1);", "correct": false },
    { "text": "return f(n - 1, acumulador + n);", "correct": true },
    { "text": "return f(n - 1) + 1;", "correct": false }
  ],
  "correctFeedback": "Correto: a chamada é a última operação.",
  "incorrectFeedback": "Verifique se existe alguma operação depois da chamada recursiva."
}
```


### Mais questões de fixação

```quiz
{
  "question": "Por que o acumulador ajuda na recursão de cauda?",
  "options": [
    {
      "text": "Ele guarda o resultado parcial antes da próxima chamada",
      "correct": true
    },
    {
      "text": "Ele substitui o caso base",
      "correct": false
    },
    {
      "text": "Ele faz a chamada recursiva acontecer duas vezes",
      "correct": false
    }
  ],
  "correctFeedback": "Exato. O resultado parcial é transportado nos parâmetros.",
  "incorrectFeedback": "Observe que o acumulador é atualizado antes da chamada seguinte."
}
```

```quiz
{
  "question": "Em C, recursão de cauda garante que a pilha não crescerá?",
  "options": [
    {
      "text": "Sim, sempre",
      "correct": false
    },
    {
      "text": "Não; o compilador C não garante otimização de chamada de cauda",
      "correct": true
    },
    {
      "text": "Só quando a função retorna void",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A otimização depende do compilador e das condições.",
  "incorrectFeedback": "A forma de cauda facilita otimização, mas não é garantia da linguagem C."
}
```

