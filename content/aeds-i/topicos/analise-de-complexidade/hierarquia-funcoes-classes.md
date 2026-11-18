# Hierarquia de Funções e Classes de Problemas

## 1. Por que comparar funções?

Algumas funções de crescimento aumentam lentamente; outras crescem muito rápido. A hierarquia ajuda a comparar algoritmos quando o tamanho da entrada aumenta.

Uma ordem comum, da taxa menor para a maior, é:

`1 < log n < n < n log n < n² < n³ < 2ⁿ < n!`

Essa ordem considera entradas suficientemente grandes. Em valores pequenos, constantes e detalhes da implementação podem influenciar o tempo observado.

## 2. Principais classes de crescimento

### Constante — Θ(1)

O custo não depende do tamanho da entrada.

```c
int primeiro(int v[]) {
    return v[0];
}
```

Um acesso a uma posição do vetor é considerado operação de custo constante.

### Logarítmica — Θ(log n)

O problema é reduzido por um fator em cada etapa, como dividir a entrada por 2.

```c
while (n > 1) {
    n /= 2;
}
```

### Linear — Θ(n)

O trabalho cresce proporcionalmente ao tamanho da entrada.

```c
for (int i = 0; i < n; i++) {
    processar(v[i]);
}
```

### Linearítmica — Θ(n log n)

É comum em algoritmos eficientes de ordenação por divisão e conquista, como Merge Sort e Heap Sort, em suas implementações usuais.

### Quadrática — Θ(n²)

É comum quando há dois níveis de repetição que percorrem entradas de tamanho proporcional a `n`.

### Cúbica — Θ(n³)

Pode aparecer em três laços aninhados, cada um percorrendo `n` posições.

### Exponencial — Θ(2ⁿ)

O trabalho pode dobrar a cada acréscimo de uma unidade na entrada. Aparece em algoritmos que exploram combinações ou subconjuntos sem estratégias de redução.

### Fatorial — Θ(n!)

Pode aparecer quando são enumeradas todas as permutações de `n` elementos. Cresce muito rapidamente.

## 3. Comparando o crescimento

- Θ(n) tende a crescer de forma moderada.
- Θ(n²) cresce muito mais rapidamente.
- Θ(2ⁿ) pode se tornar impraticável rapidamente.

A hierarquia não mede segundos: compara taxas matemáticas de crescimento.

## 4. Classes de problemas: P e NP

Além das classes de crescimento, a teoria da complexidade estuda classes de problemas computacionais. Uma distinção importante é entre P e NP.

### Classe P

P é a classe dos problemas de decisão que podem ser resolvidos por um algoritmo determinístico em tempo polinomial no tamanho da entrada.

Tempo polinomial inclui limites como O(n), O(n²), O(n³) ou O(n^k), para uma constante `k`.

### Classe NP

NP é a classe dos problemas de decisão cujas respostas “sim” possuem certificados que podem ser verificados em tempo polinomial por um algoritmo determinístico.

Isso não quer dizer que todos os problemas em NP sejam impossíveis de resolver rapidamente. Também não significa simplesmente “tempo não polinomial”.

### Relação entre P e NP

Todo problema em P também pertence a NP:

`P ⊆ NP`

Uma grande questão em aberto é saber se `P = NP`. Ainda não se sabe se todo problema cuja solução pode ser verificada em tempo polinomial também pode ser resolvido em tempo polinomial.

## 5. Crescimento de algoritmos não é a mesma coisa que P e NP

- `O(n²)` ou `O(2ⁿ)` descrevem limites de crescimento de uma função de custo.
- `P` e `NP` são classes de problemas de decisão, definidas a partir da possibilidade de resolução ou verificação em tempo polinomial.

Um problema pode ter diferentes algoritmos, com custos diferentes. A classificação do problema considera a existência de algoritmos com determinadas propriedades, não apenas um trecho de código isolado.

## 6. Exemplo de comparação: ordenação

- Bubble Sort tradicional: pior caso Θ(n²).
- Merge Sort: Θ(n log n) de tempo nas implementações usuais.

À medida que `n` aumenta, o crescimento `n log n` tende a ser muito mais favorável que `n²`. A escolha também deve considerar memória, estabilidade, características dos dados e requisitos do problema.

## 7. Resumo

| Crescimento | Nome | Exemplo de padrão |
|---|---|---|
| Θ(1) | Constante | Acesso a uma posição |
| Θ(log n) | Logarítmico | Dividir a entrada por 2 |
| Θ(n) | Linear | Um laço até `n` |
| Θ(n log n) | Linearítmico | Merge Sort |
| Θ(n²) | Quadrático | Dois laços aninhados |
| Θ(n³) | Cúbico | Três laços aninhados |
| Θ(2ⁿ) | Exponencial | Explorar subconjuntos |
| Θ(n!) | Fatorial | Enumerar permutações |

## 8. Exercícios rápidos

1. Organize em ordem crescente: `n²`, `log n`, `2ⁿ`, `n`, `1`.
2. Qual padrão de código costuma produzir Θ(n²)?
3. Por que Θ(2ⁿ) tende a ser mais preocupante que Θ(n²) para entradas grandes?
4. O que caracteriza um problema pertencente à classe P?
5. O que caracteriza um problema pertencente à classe NP?
6. Todo problema em P também está em NP? Explique.
7. P e NP são notações de complexidade de um trecho de código, como O(n), ou classes de problemas? Justifique.


## Exercícios interativos de fixação

Responda às questões e clique em **Conferir resposta** para receber o feedback.

### Questão 1

```quiz
{
  "question": "Qual sequência está em ordem crescente de crescimento?",
  "options": [
    {
      "text": "1 < log n < n < n log n < n²",
      "correct": true
    },
    {
      "text": "n² < n < log n < 1",
      "correct": false
    },
    {
      "text": "2ⁿ < n < log n < n²",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Essa é a hierarquia usual para entradas suficientemente grandes.",
  "incorrectFeedback": "Compare as taxas de crescimento, não os valores para n muito pequeno."
}
```

### Questão 2

```quiz
{
  "question": "Qual função cresce mais rapidamente para n grande?",
  "options": [
    {
      "text": "n",
      "correct": false
    },
    {
      "text": "n²",
      "correct": false
    },
    {
      "text": "2ⁿ",
      "correct": true
    }
  ],
  "correctFeedback": "Isso! A função exponencial supera as polinomiais para n suficientemente grande.",
  "incorrectFeedback": "Exponenciais crescem mais rapidamente que polinomiais."
}
```

### Questão 3

```quiz
{
  "question": "Um algoritmo que acessa diretamente a primeira posição de um vetor realiza uma operação de qual ordem?",
  "options": [
    {
      "text": "Θ(1)",
      "correct": true
    },
    {
      "text": "Θ(n)",
      "correct": false
    },
    {
      "text": "Θ(log n)",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! O acesso a uma posição é considerado constante.",
  "incorrectFeedback": "O custo não depende da quantidade de elementos."
}
```

### Questão 4

```quiz
{
  "question": "Qual padrão costuma produzir Θ(n log n)?",
  "options": [
    {
      "text": "Um único laço de n iterações.",
      "correct": false
    },
    {
      "text": "Divisão da entrada em partes e trabalho linear por nível, como no Merge Sort.",
      "correct": true
    },
    {
      "text": "Três laços aninhados de n iterações.",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito! O Merge Sort é um exemplo clássico de Θ(n log n).",
  "incorrectFeedback": "Lembre da combinação entre níveis logarítmicos e trabalho linear por nível."
}
```

### Questão 5

```quiz
{
  "question": "Três laços aninhados, cada um percorrendo n posições, sugerem qual ordem?",
  "options": [
    {
      "text": "Θ(n)",
      "correct": false
    },
    {
      "text": "Θ(n²)",
      "correct": false
    },
    {
      "text": "Θ(n³)",
      "correct": true
    }
  ],
  "correctFeedback": "Isso! n × n × n resulta em n³.",
  "incorrectFeedback": "Multiplique as quantidades de iterações dos três níveis."
}
```

### Questão 6

```quiz
{
  "question": "Qual é a característica de um problema pertencente à classe P?",
  "options": [
    {
      "text": "É um problema de decisão resolvível em tempo polinomial por algoritmo determinístico.",
      "correct": true
    },
    {
      "text": "É qualquer problema com custo exponencial.",
      "correct": false
    },
    {
      "text": "É um problema cuja resposta nunca pode ser verificada.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! P reúne problemas de decisão resolvíveis em tempo polinomial.",
  "incorrectFeedback": "A definição de P envolve resolução determinística em tempo polinomial."
}
```

### Questão 7

```quiz
{
  "question": "Qual é a ideia central da classe NP?",
  "options": [
    {
      "text": "Problemas que não possuem solução.",
      "correct": false
    },
    {
      "text": "Problemas de decisão cujas respostas sim têm certificados verificáveis em tempo polinomial.",
      "correct": true
    },
    {
      "text": "Problemas que exigem necessariamente tempo exponencial.",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! A definição destaca a verificação eficiente de certificados.",
  "incorrectFeedback": "NP não significa simplesmente “não polinomial”."
}
```

### Questão 8

```quiz
{
  "question": "Qual relação entre P e NP é conhecida?",
  "options": [
    {
      "text": "P está contida em NP.",
      "correct": true
    },
    {
      "text": "NP está contida em P, e isso já foi provado.",
      "correct": false
    },
    {
      "text": "P e NP são classes sem relação.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Todo problema resolvível em tempo polinomial também tem solução verificável em tempo polinomial.",
  "incorrectFeedback": "P ⊆ NP é uma inclusão conhecida."
}
```

### Questão 9

```quiz
{
  "question": "O que diferencia uma classe de crescimento como Θ(n²) de uma classe de problemas como NP?",
  "options": [
    {
      "text": "Não há diferença.",
      "correct": false
    },
    {
      "text": "Θ(n²) descreve crescimento de custo; NP classifica problemas de decisão pela verificabilidade de certificados.",
      "correct": true
    },
    {
      "text": "NP é apenas outra forma de escrever O(n²).",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente! São conceitos de níveis diferentes da teoria da computação.",
  "incorrectFeedback": "Uma notação assintótica não é uma classe de problemas como P ou NP."
}
```

### Questão 10

```quiz
{
  "question": "Qual ordem tende a ser mais eficiente para entradas grandes?",
  "options": [
    {
      "text": "Θ(n²), em comparação com Θ(n log n).",
      "correct": false
    },
    {
      "text": "Θ(n log n), em comparação com Θ(n²).",
      "correct": true
    },
    {
      "text": "As duas crescem sempre igualmente.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! n log n cresce mais lentamente que n².",
  "incorrectFeedback": "Para n suficientemente grande, a taxa n log n é menor que n²."
}
```
