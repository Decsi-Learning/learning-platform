## Recursão aninhada

### Conceito

Na **recursão aninhada**, uma chamada recursiva aparece como argumento de outra chamada recursiva. Não confunda com a recursão indireta, em que funções diferentes se chamam.

### Exemplo: McCarthy 91

```c
int m91(int n) {
    if (n > 100) return n - 10;
    return m91(m91(n + 11));
}
```

Para `n <= 100`, a função faz uma chamada interna e usa o resultado como argumento da chamada externa.

### Rastreio resumido de `m91(99)`

A chamada inicial avalia `m91(m91(110))`. A chamada interna `m91(110)` retorna `100`; então a externa vira `m91(100)`. Essa chamada segue a regra recursiva e, após as chamadas internas, retorna `91`.

**Ideia-chave:** uma chamada recursiva é avaliada dentro de outra chamada da mesma função.

## Demonstração interativa

Avance e volte pelos passos para acompanhar o rastreio.

```demo
{
  "title": "Rastreie m91(99)",
  "steps": [
    {
      "caption": "Como 99 ≤ 100, m91(99) avalia primeiro a chamada interna m91(110).",
      "state": "m91(99)\n= m91(m91(110))\n\nchamada interna: m91(110)"
    },
    {
      "caption": "m91(110) está acima de 100, então retorna 110 − 10 = 100.",
      "state": "m91(110) → 100\n\nA chamada externa fica:\nm91(100)"
    },
    {
      "caption": "m91(100) também entra na regra recursiva e calcula m91(111) primeiro.",
      "state": "m91(100)\n= m91(m91(111))\n\nm91(111) → 101"
    },
    {
      "caption": "A chamada externa agora é m91(101). Como 101 > 100, retorna 91.",
      "state": "m91(101) → 91\n\nm91(100) → 91\nm91(99) → 91"
    }
  ]
}
```

### Teste rápido

```quiz
{
  "question": "O que torna uma chamada recursiva aninhada?",
  "options": [
    { "text": "Uma função chama outra função diferente.", "correct": false },
    { "text": "A chamada recursiva é usada como argumento de outra chamada recursiva.", "correct": true },
    { "text": "A função contém dois casos base.", "correct": false },
    { "text": "A chamada é a última operação da função.", "correct": false }
  ],
  "correctFeedback": "Correto: uma chamada está dentro da outra.",
  "incorrectFeedback": "Procure uma chamada recursiva dentro dos argumentos de outra."
}
```


### Mais questões de fixação

```quiz
{
  "question": "O que caracteriza recursão aninhada?",
  "options": [
    {
      "text": "A função chama outra função sem recursão",
      "correct": false
    },
    {
      "text": "Uma chamada recursiva é argumento de outra chamada recursiva",
      "correct": true
    },
    {
      "text": "Duas funções se alternam",
      "correct": false
    }
  ],
  "correctFeedback": "Correto: uma chamada recursiva é avaliada dentro de outra.",
  "incorrectFeedback": "A característica é a chamada recursiva usada como argumento de outra chamada."
}
```

```quiz
{
  "question": "Em m91(99), por que m91(110) é avaliada antes da chamada externa?",
  "options": [
    {
      "text": "Porque o argumento da chamada externa precisa ser calculado primeiro",
      "correct": true
    },
    {
      "text": "Porque 110 é o caso base da função",
      "correct": false
    },
    {
      "text": "Porque toda recursão aninhada usa laços",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! Primeiro se calcula o argumento interno.",
  "incorrectFeedback": "A chamada externa precisa receber o resultado da chamada que está dentro do argumento."
}
```

