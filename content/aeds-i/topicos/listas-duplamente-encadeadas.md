Uma **lista duplamente encadeada** é uma sequência de nós em que cada elemento guarda referências ao nó anterior e ao próximo.

Imagine os vagões de um trem: a partir de um vagão, é possível seguir para a frente ou voltar para o vagão anterior. A lista precisa atualizar as duas referências quando um elemento é inserido ou removido.

```text
estrutura NoDuplo:
    anterior
    dado
    proximo
```

No primeiro nó, `anterior` não aponta para outro elemento; no último, `proximo` não aponta para outro elemento. Essas referências vazias costumam ser representadas por `NULL`.

A navegação nos dois sentidos pode facilitar operações como remover um nó conhecido. Em contrapartida, cada nó precisa armazenar uma referência adicional e as operações precisam manter os dois encadeamentos consistentes.

```quiz
{
  "question": "Para onde aponta o campo anterior do primeiro nó de uma lista duplamente encadeada não circular?",
  "options": [
    { "text": "Para NULL, pois não há nó antes dele.", "correct": true },
    { "text": "Para o último nó da lista.", "correct": false },
    { "text": "Para o próximo nó.", "correct": false }
  ],
  "correctFeedback": "Isso mesmo: o primeiro nó não tem predecessor, então anterior é NULL.",
  "incorrectFeedback": "Considere qual nó vem antes do primeiro elemento e tente novamente."
}
```
