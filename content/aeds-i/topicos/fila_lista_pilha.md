# Listas, Pilhas e Filas

Assim como organizamos objetos no mundo real, na programação precisamos organizar os dados. **Estruturas de dados** são formas de armazenar e organizar essas informações para que possam ser usadas de maneira eficiente.

Três das estruturas mais comuns e importantes são as Listas, as Pilhas e as Filas.

## Lista

Uma **lista** é uma coleção de itens ordenados de forma sequencial. Você pode acessar, adicionar ou remover elementos em qualquer posição (no início, no meio ou no final).

Pense em uma **lista de compras**: você pode adicionar o "Leite" no final, riscar o "Pão" que estava no meio ou ler o primeiro item sempre que quiser.

Em pseudocódigo, interagir com uma lista seria algo como:
```text
compras <- ["Maçã", "Pão", "Leite"]
escreva compras[1]   // Mostra "Pão" (assumindo que começa no índice 0)
```

## Pilha (Stack)

Uma **pilha** funciona com a regra **LIFO** (*Last In, First Out* - O Último a Entrar é o Primeiro a Sair). Você só pode adicionar e remover itens do topo da pilha.

Pense em uma **pilha de pratos** na pia: você coloca um prato sujo no topo. Na hora de lavar, você pega o prato que está no topo (o último que foi colocado).

```text
pilha_de_pratos <- []
empilhar(pilha_de_pratos, "Prato 1")
empilhar(pilha_de_pratos, "Prato 2")
lavar <- desempilhar(pilha_de_pratos) // Pega o "Prato 2"
```

## Fila (Queue)

Uma **fila** segue a regra **FIFO** (*First In, First Out* - O Primeiro a Entrar é o Primeiro a Sair). Os itens são adicionados no final e removidos do início.

Pense em uma **fila de banco**: a primeira pessoa que chega é a primeira a ser atendida pelo caixa. Quem chega depois, vai para o final.

```text
fila_banco <- []
entrar_na_fila(fila_banco, "João")
entrar_na_fila(fila_banco, "Maria")
atender <- sair_da_fila(fila_banco) // Atende "João"
```

> Entender essas regras de organização (qualquer lugar, topo ou início/fim) ajuda você a escolher a melhor ferramenta para resolver o seu problema na hora de programar.

---

## Teste de Conhecimento

Os testes interativos usam um bloco `quiz` com dados JSON. Marque a alternativa correta com `"correct": true`.

```quiz
{
  "question": "Se você precisa criar um sistema de atendimento ao cliente para uma loja, onde o cliente que chegou primeiro deve receber atendimento primeiro, qual estrutura de dados você deve usar?",
  "options": [
    { "text": "Lista", "correct": false },
    { "text": "Pilha (LIFO)", "correct": false },
    { "text": "Fila (FIFO)", "correct": true }
  ],
  "correctFeedback": "✅ Correto! A fila segue o princípio FIFO: o primeiro a entrar é o primeiro a sair.",
  "incorrectFeedback": "❌ Ainda não. Em um atendimento FIFO, a primeira pessoa a chegar é a primeira a ser atendida. Tente novamente."
}
```
