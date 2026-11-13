Uma **lista simplesmente encadeada** é formada por nós ligados em sequência. Cada nó guarda um dado e uma referência ao próximo nó.

Pense em uma caça ao tesouro: você começa pela primeira pista (`head`) e cada pista indica onde está a próxima. A navegação segue para a frente; para voltar a um nó anterior, é preciso percorrer a lista desde o início.

O primeiro nó é a entrada da lista. O último aponta para `NULL`, indicando que não há outro elemento depois dele.

```text
estrutura No:
    dado
    proximo
```

Essa estrutura permite inserir, remover e buscar elementos sem exigir que todos fiquem lado a lado na memória.

```quiz
{
  "question": "Por que não conseguimos voltar facilmente de um nó para o nó anterior em uma lista simplesmente encadeada?",
  "options": [
    { "text": "Porque o ponteiro proximo aponta sempre para o início.", "correct": false },
    { "text": "Porque cada nó guarda a referência ao próximo, mas não ao anterior.", "correct": true },
    { "text": "Porque o nó anterior é apagado da memória ao avançar.", "correct": false }
  ],
  "correctFeedback": "Correto! Cada nó aponta só para a frente, então para voltar é preciso percorrer a lista desde o início.",
  "incorrectFeedback": "Reveja quais referências cada nó guarda e tente novamente."
}
```
