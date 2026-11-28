## Exercícios avaliativos — Recursividade

Responda às 10 questões. O objetivo desta página é revisar os conceitos principais do tópico.

### Questão 1 — Caso base

```quiz
{
  "question": "Qual é a finalidade do caso base?",
  "options": [
    { "text": "Interromper a recursão com uma resposta conhecida.", "correct": true },
    { "text": "Aumentar o número de chamadas.", "correct": false },
    { "text": "Armazenar o código da função.", "correct": false },
    { "text": "Substituir todos os parâmetros.", "correct": false }
  ],
  "correctFeedback": "Correto!",
  "incorrectFeedback": "O caso base é a condição de parada."
}
```

### Questão 2 — Rastreio

```quiz
{
  "question": "Se soma(n) retorna n + soma(n-1) e soma(0)=0, quanto vale soma(3)?",
  "options": [
    { "text": "3", "correct": false },
    { "text": "5", "correct": false },
    { "text": "6", "correct": true },
    { "text": "9", "correct": false }
  ],
  "correctFeedback": "3 + 2 + 1 + 0 = 6.",
  "incorrectFeedback": "Expanda as chamadas até soma(0)."
}
```

### Questão 3 — Recursão de cauda

```quiz
{
  "question": "Qual é uma chamada recursiva de cauda?",
  "options": [
    { "text": "return n * f(n-1);", "correct": false },
    { "text": "return f(n-1, total+n);", "correct": true },
    { "text": "return n + f(n-1);", "correct": false },
    { "text": "return f(n-1) + 1;", "correct": false }
  ],
  "correctFeedback": "A chamada é a última operação.",
  "incorrectFeedback": "Não deve haver operação pendente após o retorno da chamada."
}
```

### Questão 4 — Recursão indireta

```quiz
{
  "question": "A chama B, e B chama A. Qual é o tipo?",
  "options": [
    { "text": "Direta", "correct": false },
    { "text": "Indireta", "correct": true },
    { "text": "De cauda necessariamente", "correct": false },
    { "text": "Backtracking", "correct": false }
  ],
  "correctFeedback": "O ciclo passa por funções diferentes.",
  "incorrectFeedback": "A não chama a si mesma diretamente."
}
```

### Questão 5 — Recursão aninhada

```quiz
{
  "question": "Qual expressão exemplifica recursão aninhada?",
  "options": [
    { "text": "f(n-1)", "correct": false },
    { "text": "f(n) + 1", "correct": false },
    { "text": "f(f(n-1))", "correct": true },
    { "text": "g(n-1)", "correct": false }
  ],
  "correctFeedback": "Uma chamada recursiva está dentro de outra.",
  "incorrectFeedback": "Procure a chamada da função dentro do argumento de outra chamada."
}
```

### Questão 6 — Recursão excessiva

```quiz
{
  "question": "Qual problema ocorre no Fibonacci recursivo simples?",
  "options": [
    { "text": "Repetição de cálculos de subproblemas.", "correct": true },
    { "text": "Ausência de caso base.", "correct": false },
    { "text": "Não usa retorno.", "correct": false },
    { "text": "Não realiza chamadas recursivas.", "correct": false }
  ],
  "correctFeedback": "Subproblemas como fib(3) são recalculados.",
  "incorrectFeedback": "A ineficiência vem do trabalho repetido."
}
```

### Questão 7 — Memoização

```quiz
{
  "question": "O que a memoização faz?",
  "options": [
    { "text": "Armazena resultados para reutilizá-los.", "correct": true },
    { "text": "Remove os casos base.", "correct": false },
    { "text": "Aumenta a profundidade das chamadas.", "correct": false },
    { "text": "Transforma toda função em iterativa automaticamente.", "correct": false }
  ],
  "correctFeedback": "Correto: evita recalcular resultados já obtidos.",
  "incorrectFeedback": "A memoização usa uma memória de resultados."
}
```

### Questão 8 — Backtracking

```quiz
{
  "question": "O que caracteriza o retrocesso?",
  "options": [
    { "text": "Desfazer uma escolha quando o caminho falha.", "correct": true },
    { "text": "Nunca alterar o estado.", "correct": false },
    { "text": "Executar apenas uma possibilidade.", "correct": false },
    { "text": "Ignorar o caso base.", "correct": false }
  ],
  "correctFeedback": "Isso permite explorar alternativas.",
  "incorrectFeedback": "Retroceder significa restaurar a escolha anterior."
}
```

### Questão 9 — Poda

```quiz
{
  "question": "Em backtracking, o que é poda?",
  "options": [
    { "text": "Interromper um caminho que não pode levar a uma solução válida.", "correct": true },
    { "text": "Guardar todas as soluções em uma pilha.", "correct": false },
    { "text": "Repetir uma chamada já concluída.", "correct": false },
    { "text": "Remover o caso base.", "correct": false }
  ],
  "correctFeedback": "A poda evita explorar caminhos inviáveis.",
  "incorrectFeedback": "A poda elimina antecipadamente uma possibilidade inválida."
}
```

### Questão 10 — Pilha de chamadas

```quiz
{
  "question": "Quando as chamadas recursivas começam a retornar?",
  "options": [
    { "text": "Quando é alcançado o caso base.", "correct": true },
    { "text": "Antes da primeira chamada.", "correct": false },
    { "text": "Somente quando o programa termina.", "correct": false },
    { "text": "Quando a função não tem parâmetros.", "correct": false }
  ],
  "correctFeedback": "O retorno começa no caso base e percorre as chamadas anteriores.",
  "incorrectFeedback": "O caso base encerra a descida recursiva."
}
```
