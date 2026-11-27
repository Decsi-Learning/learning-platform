## Recursividade

### O que é?

Uma função é **recursiva** quando chama a si mesma para resolver uma versão menor do problema. Toda recursão precisa de:

- **Caso base:** condição que encerra as chamadas.
- **Passo recursivo:** chamada que aproxima o problema do caso base.

Sem progresso em direção ao caso base, a função pode continuar chamando a si mesma até ocorrer estouro de pilha.

### Exemplo: fatorial

\(n! = n 	imes (n-1)!\), com \(0! = 1\).

```c
int fatorial(int n) {
    if (n <= 1) return 1;       // caso base
    return n * fatorial(n - 1); // passo recursivo
}
```

### Rastreio de `fatorial(4)`

| Chamada | Ação |
|---|---|
| `fatorial(4)` | `4 * fatorial(3)` |
| `fatorial(3)` | `3 * fatorial(2)` |
| `fatorial(2)` | `2 * fatorial(1)` |
| `fatorial(1)` | retorna `1` |
| Retorno | `2 * 1 = 2`; `3 * 2 = 6`; `4 * 6 = 24` |

As chamadas ficam aguardando na **pilha de execução**. Quando o caso base retorna, os resultados são calculados de trás para frente.

## Demonstração interativa

Avance e volte pelos passos para acompanhar o rastreio.

```demo
{
  "title": "Rastreie fatorial(4)",
  "steps": [
    {
      "caption": "A chamada inicial começa com n = 4. Como 4 não é caso base, aguarda 4 × fatorial(3).",
      "state": "pilha de chamadas:\n fatorial(4) → aguarda 4 × fatorial(3)\n\nretorno ainda pendente: × 4"
    },
    {
      "caption": "fatorial(3) também não é caso base e aguarda 3 × fatorial(2).",
      "state": "pilha de chamadas:\n fatorial(4) → × 4\n fatorial(3) → × 3\n fatorial(2) → ..."
    },
    {
      "caption": "fatorial(2) chama fatorial(1).",
      "state": "pilha de chamadas:\n fatorial(4) → × 4\n fatorial(3) → × 3\n fatorial(2) → × 2\n fatorial(1)"
    },
    {
      "caption": "fatorial(1) é o caso base e retorna 1. Agora as chamadas pendentes são resolvidas de trás para frente.",
      "state": "retorno:\n fatorial(1) = 1\n fatorial(2) = 2 × 1 = 2\n fatorial(3) = 3 × 2 = 6\n fatorial(4) = 4 × 6 = 24"
    }
  ]
}
```

### Teste rápido

```quiz
{
  "question": "Qual é a função do caso base?",
  "options": [
    { "text": "Fazer a função chamar a si mesma para sempre.", "correct": false },
    { "text": "Encerrar as chamadas recursivas com uma resposta conhecida.", "correct": true },
    { "text": "Guardar todas as chamadas em um vetor.", "correct": false },
    { "text": "Aumentar o problema a cada chamada.", "correct": false }
  ],
  "correctFeedback": "Isso! O caso base é a condição de parada.",
  "incorrectFeedback": "Procure a condição que interrompe as chamadas."
}
```


### Mais questões de fixação

```quiz
{
  "question": "Quando a função f(n) chama f(n-1), qual condição torna essa recursão segura para terminar?",
  "options": [
    {
      "text": "Uma condição base alcançável",
      "correct": true
    },
    {
      "text": "Um parâmetro que nunca muda",
      "correct": false
    },
    {
      "text": "Uma chamada dentro de um laço infinito",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! O caso base precisa ser alcançado pelo passo recursivo.",
  "incorrectFeedback": "Sem caso base alcançável, as chamadas podem continuar até estourar a pilha."
}
```

```quiz
{
  "question": "Em fatorial(4), quando fatorial(1) retorna, o que acontece?",
  "options": [
    {
      "text": "As chamadas pendentes retornam e calculam os produtos",
      "correct": true
    },
    {
      "text": "A função começa novamente em fatorial(4)",
      "correct": false
    },
    {
      "text": "O programa ignora os valores anteriores",
      "correct": false
    }
  ],
  "correctFeedback": "Correto: cada chamada resolve a operação que estava aguardando.",
  "incorrectFeedback": "As chamadas anteriores ficam aguardando o resultado da chamada mais profunda."
}
```

