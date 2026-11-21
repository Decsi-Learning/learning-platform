# Exercícios Interativos — Revisão de Análise de Complexidade

Responda às questões e clique em **Conferir resposta** para receber feedback imediato.

## Questão 1

```quiz
{
  "question": "Qual recurso a análise de complexidade estuda principalmente?",
  "options": [
    {
      "text": "Crescimento do consumo de tempo e espaço conforme a entrada aumenta.",
      "correct": true
    },
    {
      "text": "Somente a quantidade de linhas do código.",
      "correct": false
    },
    {
      "text": "A aparência da interface do programa.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Complexidade estuda recursos em função do tamanho da entrada.",
  "incorrectFeedback": "Lembre-se de tempo e espaço como recursos principais."
}
```

## Questão 2

```quiz
{
  "question": "Um laço de n iterações dentro de outro laço de n iterações tem custo:",
  "options": [
    {
      "text": "Θ(n)",
      "correct": false
    },
    {
      "text": "Θ(n²)",
      "correct": true
    },
    {
      "text": "Θ(log n)",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! O corpo executa n vezes n.",
  "incorrectFeedback": "Laços aninhados multiplicam suas quantidades de iterações."
}
```

## Questão 3

```quiz
{
  "question": "Um laço que divide n por 2 a cada repetição tem custo:",
  "options": [
    {
      "text": "Θ(log n)",
      "correct": true
    },
    {
      "text": "Θ(n²)",
      "correct": false
    },
    {
      "text": "Θ(1)",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Reduções pela metade produzem crescimento logarítmico.",
  "incorrectFeedback": "Acompanhe a sequência n, n/2, n/4..."
}
```

## Questão 4

```quiz
{
  "question": "Um vetor auxiliar com n posições consome espaço auxiliar de ordem:",
  "options": [
    {
      "text": "Θ(1)",
      "correct": false
    },
    {
      "text": "Θ(n)",
      "correct": true
    },
    {
      "text": "Θ(n²)",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! A memória cresce proporcionalmente ao número de posições.",
  "incorrectFeedback": "Cada elemento ocupa espaço e há n elementos."
}
```

## Questão 5

```quiz
{
  "question": "Qual notação representa limite assintótico justo?",
  "options": [
    {
      "text": "O",
      "correct": false
    },
    {
      "text": "Ω",
      "correct": false
    },
    {
      "text": "Θ",
      "correct": true
    }
  ],
  "correctFeedback": "Correto! Θ combina limite superior e inferior.",
  "incorrectFeedback": "Pense na notação que prende a função pelos dois lados."
}
```

## Questão 6

```quiz
{
  "question": "Qual é Θ(6n² + 4n + 9)?",
  "options": [
    {
      "text": "Θ(n)",
      "correct": false
    },
    {
      "text": "Θ(n²)",
      "correct": true
    },
    {
      "text": "Θ(2ⁿ)",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito! O termo quadrático domina.",
  "incorrectFeedback": "Ignore constantes multiplicativas e termos de menor ordem."
}
```

## Questão 7

```quiz
{
  "question": "Qual função cresce mais lentamente?",
  "options": [
    {
      "text": "n!",
      "correct": false
    },
    {
      "text": "2ⁿ",
      "correct": false
    },
    {
      "text": "log n",
      "correct": true
    }
  ],
  "correctFeedback": "Isso! log n cresce mais lentamente que exponencial e fatorial.",
  "incorrectFeedback": "A hierarquia começa por constante e logarítmica."
}
```

## Questão 8

```quiz
{
  "question": "Qual exemplo é típico de Θ(n log n)?",
  "options": [
    {
      "text": "Merge Sort",
      "correct": true
    },
    {
      "text": "Busca sequencial no pior caso",
      "correct": false
    },
    {
      "text": "Três laços aninhados",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Merge Sort tem tempo Θ(n log n) nas versões usuais.",
  "incorrectFeedback": "Lembre dos algoritmos de ordenação por divisão e conquista."
}
```

## Questão 9

```quiz
{
  "question": "A classe P reúne problemas de decisão que:",
  "options": [
    {
      "text": "Podem ser resolvidos em tempo polinomial por algoritmo determinístico.",
      "correct": true
    },
    {
      "text": "Não podem ter suas respostas verificadas.",
      "correct": false
    },
    {
      "text": "Sempre exigem tempo fatorial.",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! Essa é a ideia central da classe P.",
  "incorrectFeedback": "A definição de P trata de resolução em tempo polinomial."
}
```

## Questão 10

```quiz
{
  "question": "Qual afirmação sobre NP está correta?",
  "options": [
    {
      "text": "NP significa necessariamente tempo não polinomial.",
      "correct": false
    },
    {
      "text": "Respostas sim possuem certificados verificáveis em tempo polinomial.",
      "correct": true
    },
    {
      "text": "Todo problema em NP já foi provado estar fora de P.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! NP é definida pela verificabilidade eficiente de certificados.",
  "incorrectFeedback": "Não interprete a sigla NP como “não polinomial”."
}
```
