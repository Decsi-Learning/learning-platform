# O que é um algoritmo?

Um **algoritmo** é uma sequência finita e organizada de passos para resolver um problema. Receitas culinárias, instruções de montagem e programas de computador podem ser descritos como algoritmos.

Para ser útil, um algoritmo precisa deixar claro quais dados recebe, o que deve fazer com eles e qual resultado deve produzir. Cada passo também precisa ser executável e a sequência deve terminar.

## Exemplo: somar dois números

Queremos receber dois números e mostrar a soma. Uma descrição em linguagem natural seria:

1. Leia o primeiro número.
2. Leia o segundo número.
3. Some os dois valores.
4. Mostre o resultado.

Em pseudocódigo, podemos escrever:

```text
leia numero1
leia numero2
soma <- numero1 + numero2
escreva soma
```

O símbolo `<-` representa uma atribuição: o valor calculado à direita é guardado na variável à esquerda.

## Entrada, processamento e saída

Esse exemplo pode ser separado em três partes:

- **Entrada:** os dois números informados.
- **Processamento:** a soma dos valores.
- **Saída:** o resultado apresentado.

Essa divisão ajuda a transformar um problema em passos menores. Antes de programar, descreva o que o problema recebe e o que precisa entregar.

## Uma forma de pensar antes de programar

Ao resolver um problema, pergunte:

1. Quais informações estão disponíveis?
2. Qual resultado preciso obter?
3. Quais passos transformam as informações no resultado?
4. Como posso conferir se os passos funcionam em exemplos diferentes?

> Um algoritmo bem descrito pode ser revisado antes de ser traduzido para uma linguagem de programação.
