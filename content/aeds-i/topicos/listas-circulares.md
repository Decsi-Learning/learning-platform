Em uma **lista circular**, a referência do último nó volta ao primeiro, formando um ciclo. Por isso, o percurso não termina em `NULL` no último elemento.

Uma lista circular pode ser simplesmente ou duplamente encadeada. Na versão simplesmente encadeada, o `proximo` do último nó aponta para o início; na versão dupla, as referências também permitem percorrer o ciclo no sentido inverso.

Esse formato pode ser útil quando o percurso deve se repetir, como em uma sequência circular de tarefas. Ao percorrê-lo, é necessário definir um critério de parada para não continuar indefinidamente.

```quiz
{
  "question": "Qual característica distingue uma lista circular de uma lista encadeada não circular?",
  "options": [
    { "text": "Ela só armazena números inteiros.", "correct": false },
    { "text": "A referência do último nó retorna ao primeiro, formando um ciclo.", "correct": true },
    { "text": "Ela não pode ter um nó inicial definido.", "correct": false }
  ],
  "correctFeedback": "Correto! A ligação entre o último nó e o primeiro fecha o ciclo.",
  "incorrectFeedback": "Observe para onde aponta a referência do último nó e tente novamente."
}
```
