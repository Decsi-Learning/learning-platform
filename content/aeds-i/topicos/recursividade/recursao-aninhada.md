## Objetivos de aprendizagem

- Reconhecer chamadas recursivas aninhadas.
- Diferenciar recursão aninhada de recursão indireta.
- Acompanhar chamadas que aparecem como argumento de outras chamadas recursivas.
- Entender por que esse padrão pode gerar muitas chamadas.

## Parte teórica

### O que é recursão aninhada?

Na **recursão aninhada**, uma chamada recursiva aparece dentro dos argumentos de outra chamada recursiva. Em vez de chamar a função apenas com uma expressão simples, a função precisa primeiro calcular o resultado de outra chamada recursiva para então utilizá-lo como argumento.

Um exemplo clássico de definição é:

```text
M(n) = n - 10, se n > 100
M(n) = M(M(n + 11)), se n <= 100
```

Para calcular `M(n)` quando `n <= 100`, é necessário calcular `M(n + 11)` e usar esse resultado como argumento de uma nova chamada a `M`.

### Não confunda com recursão indireta

- **Indireta:** o fluxo passa por funções diferentes, como `A → B → A`.
- **Aninhada:** uma chamada recursiva está dentro do argumento de outra chamada recursiva, como `M(M(n + 11))`.

### Atenção ao custo

A quantidade de chamadas pode crescer de forma difícil de prever, pois uma chamada pode depender do resultado de outra chamada recursiva. Por isso, é importante analisar o número de chamadas e a profundidade da pilha, e não apenas contar quantas linhas de código existem.

## Estrutura

```text
FUNÇÃO M(n)
    SE condição_base ENTÃO
        RETORNE resultado_base
    FIM SE

    valor <- M(expressao_com_n)
    RETORNE M(valor)
FIM FUNÇÃO
```

A característica marcante é que o resultado da primeira chamada recursiva é utilizado como argumento da segunda.

## Demonstração conceitual

Considere apenas a estrutura `M(M(x))`:

1. Para iniciar a chamada externa `M(...)`, o programa precisa avaliar seu argumento.
2. Esse argumento exige executar a chamada interna `M(x)`.
3. A chamada interna retorna um valor.
4. O valor retornado é usado como argumento da chamada externa.
5. A chamada externa então continua sua execução.

Portanto, a chamada interna precisa ser resolvida antes que a chamada externa possa receber seu argumento.

## Exemplo clássico: função de McCarthy 91

A função de McCarthy 91 é definida por:

- Se `n > 100`, retorna `n - 10`.
- Caso contrário, retorna `M(M(n + 11))`.

Para entradas inteiras positivas até 100, o resultado final é 91. O objetivo aqui é observar a estrutura aninhada, não decorar o resultado.

## Pseudocódigo

```text
FUNÇÃO M(n)
    SE n > 100 ENTÃO
        RETORNE n - 10
    SENÃO
        valor <- M(n + 11)
        RETORNE M(valor)
    FIM SE
FIM FUNÇÃO
```

A atribuição a `valor` deixa explícita a ordem de avaliação da expressão aninhada.

## Código em C

```c
int mccarthy91(int n) {
    if (n > 100) {
        return n - 10;
    }
    int valor = mccarthy91(n + 11);
    return mccarthy91(valor);
}
```

O exemplo ilustra a definição clássica. A função é adequada para estudo com entradas inteiras dentro do domínio esperado, mas não deve ser usada sem limites em aplicações reais: chamadas recursivas profundas podem consumir muita pilha.


## Teste rápido

```quiz
{
  "question": "O que caracteriza uma recursão aninhada?",
  "options": [
    { "text": "Uma função chama outra função que chama a primeira.", "correct": false },
    { "text": "Uma chamada recursiva aparece dentro do argumento de outra chamada recursiva.", "correct": true },
    { "text": "A função utiliza somente um laço for.", "correct": false }
  ],
  "correctFeedback": "Exatamente! A chamada interna precisa ser avaliada para fornecer o argumento da chamada externa.",
  "incorrectFeedback": "Repare na forma M(M(x)): uma chamada recursiva está encaixada no argumento de outra."
}
```

## Exercícios de fixação desta página

1. Explique, com suas palavras, por que `M(M(n + 11))` é uma chamada aninhada.
2. Qual chamada precisa ser avaliada primeiro em `M(M(5))`? Por quê?
3. Diferencie recursão aninhada e recursão indireta.
4. Cite um motivo pelo qual uma função aninhada pode ser difícil de analisar quanto ao custo.
