# Fundamentos da Análise de Complexidade

## 1. O que é analisar um algoritmo?

Um algoritmo é uma sequência finita e organizada de passos para resolver um problema. Dois algoritmos podem produzir a mesma resposta correta, mas consumir quantidades diferentes de recursos.

A análise de complexidade estuda como o consumo de recursos varia conforme o tamanho da entrada aumenta. Os recursos mais estudados são:

- **Tempo:** quantidade de operações ou trabalho executado.
- **Espaço:** quantidade de memória utilizada durante a execução.

Não buscamos descobrir exatamente quantos segundos um programa levará em qualquer computador. Isso depende do processador, da linguagem, do compilador e de outros fatores. Procuramos entender o comportamento do algoritmo conforme a entrada cresce.

## 2. Tamanho da entrada

Representamos o tamanho da entrada normalmente por `n`. Seu significado depende do problema:

- Em um vetor, `n` pode ser a quantidade de elementos.
- Em uma string, `n` pode ser a quantidade de caracteres.
- Em uma matriz quadrada, `n` pode ser sua dimensão.
- Em um grafo, podemos usar `V` para vértices e `E` para arestas.

Antes de analisar um algoritmo, precisamos definir o que representa o tamanho da entrada.

## 3. Correção e eficiência

**Correção** significa produzir o resultado esperado. **Eficiência** trata dos recursos consumidos para produzir esse resultado.

Um algoritmo pode estar correto e ainda ser pouco eficiente para entradas grandes.

### Exemplo: busca sequencial

```c
int busca(int v[], int n, int x) {
    for (int i = 0; i < n; i++) {
        if (v[i] == x) {
            return i;
        }
    }
    return -1;
}
```

A função verifica os elementos um por um. Se `x` estiver na primeira posição, ocorre uma comparação. Se estiver na última posição ou não estiver no vetor, podem ocorrer `n` comparações.

## 4. Casos de análise

- **Melhor caso:** situação em que o algoritmo realiza menos trabalho para entradas de tamanho `n`.
- **Caso médio:** quantidade esperada de trabalho, considerando uma distribuição de entradas definida.
- **Pior caso:** situação em que o algoritmo realiza mais trabalho para entradas de tamanho `n`.

Essas expressões descrevem cenários de execução. Não são sinônimos das notações O, Ω e Θ.

Na busca sequencial:
- Melhor caso: valor na primeira posição — 1 comparação.
- Pior caso: valor na última posição ou ausente — até `n` comparações.
- Caso médio: se o valor estiver no vetor e todas as posições forem igualmente prováveis, aproximadamente `(n + 1) / 2` comparações.

## 5. Por que estudar complexidade?

A análise ajuda a comparar algoritmos, prever o comportamento para entradas maiores, identificar gargalos, escolher estruturas de dados e avaliar a viabilidade de uma solução.

Uma solução rápida para 10 elementos pode se tornar impraticável para milhões de elementos.

## 6. Exemplo guiado: contar elementos

```c
int contar(int v[], int n) {
    int quantidade = 0;
    for (int i = 0; i < n; i++) {
        quantidade++;
    }
    return quantidade;
}
```

O laço executa uma vez para cada elemento. Para um vetor de 5 elementos, são 5 iterações; para 100 elementos, são 100. O custo cresce proporcionalmente a `n`: Θ(n).

## 7. Resumo

- Complexidade analisa o consumo de recursos em função do tamanho da entrada.
- Tempo e espaço são recursos diferentes.
- Melhor, médio e pior caso são cenários de análise.
- A análise assintótica estuda o crescimento sem depender de uma máquina específica.
- Um algoritmo correto não é necessariamente eficiente.

## 8. Verifique sua compreensão

1. Por que medir apenas segundos de uma execução não é suficiente para comparar algoritmos?
2. Em um vetor, o que `n` normalmente representa?
3. Qual é a diferença entre correção e eficiência?
4. Na busca sequencial, por que a posição do elemento altera o número de comparações?
5. Um algoritmo que executa 100 operações para uma entrada de tamanho 10 é necessariamente melhor que outro que executa 150? O que mais seria necessário saber?


## Exercícios interativos de fixação

Responda às questões e clique em **Conferir resposta** para receber o feedback.

### Questão 1

```quiz
{
  "question": "Qual é o principal objetivo da análise de complexidade?",
  "options": [
    {
      "text": "Medir exatamente os segundos em qualquer computador.",
      "correct": false
    },
    {
      "text": "Estudar como o consumo de recursos cresce com o tamanho da entrada.",
      "correct": true
    },
    {
      "text": "Verificar apenas se o algoritmo compila.",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! A análise observa o crescimento do custo conforme a entrada aumenta.",
  "incorrectFeedback": "A ideia central não é medir segundos exatos nem apenas verificar compilação."
}
```

### Questão 2

```quiz
{
  "question": "Em um vetor com n elementos, o que normalmente representa n?",
  "options": [
    {
      "text": "A quantidade de elementos do vetor.",
      "correct": true
    },
    {
      "text": "O número de funções do programa.",
      "correct": false
    },
    {
      "text": "A quantidade de bytes do executável.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Para esse problema, n representa o número de elementos.",
  "incorrectFeedback": "Identifique o parâmetro que mede o tamanho da entrada."
}
```

### Questão 3

```quiz
{
  "question": "Em um algoritmo que recebe uma string, n pode representar:",
  "options": [
    {
      "text": "A quantidade de caracteres.",
      "correct": true
    },
    {
      "text": "A quantidade de computadores.",
      "correct": false
    },
    {
      "text": "A quantidade de arquivos do projeto.",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente: n pode ser o comprimento da string.",
  "incorrectFeedback": "n representa uma medida do tamanho da entrada, que depende do problema."
}
```

### Questão 4

```quiz
{
  "question": "Qual afirmação diferencia correção de eficiência?",
  "options": [
    {
      "text": "Correção mede memória; eficiência mede apenas resultados.",
      "correct": false
    },
    {
      "text": "Correção verifica se o resultado está certo; eficiência avalia recursos consumidos.",
      "correct": true
    },
    {
      "text": "São nomes diferentes para a mesma propriedade.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Um algoritmo pode estar correto e ainda ser ineficiente.",
  "incorrectFeedback": "Pense em resultado esperado versus recursos necessários para obtê-lo."
}
```

### Questão 5

```quiz
{
  "question": "Na busca sequencial, quando ocorre o melhor caso?",
  "options": [
    {
      "text": "Quando o valor está na primeira posição.",
      "correct": true
    },
    {
      "text": "Quando o vetor está vazio sempre.",
      "correct": false
    },
    {
      "text": "Quando o valor não está no vetor.",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! A primeira comparação já encontra o elemento.",
  "incorrectFeedback": "O melhor caso é a situação que exige menos trabalho."
}
```

### Questão 6

```quiz
{
  "question": "Na busca sequencial, qual situação representa o pior caso?",
  "options": [
    {
      "text": "O elemento está na primeira posição.",
      "correct": false
    },
    {
      "text": "O elemento está na última posição ou não aparece.",
      "correct": true
    },
    {
      "text": "O vetor tem apenas um elemento e ele é o procurado.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Pode ser necessário verificar todos os n elementos.",
  "incorrectFeedback": "No pior caso, a busca percorre praticamente todo o vetor."
}
```

### Questão 7

```quiz
{
  "question": "O caso médio depende de quê?",
  "options": [
    {
      "text": "De uma distribuição ou hipótese sobre as entradas consideradas.",
      "correct": true
    },
    {
      "text": "Somente da velocidade do processador.",
      "correct": false
    },
    {
      "text": "Sempre do valor máximo de n.",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito! É preciso definir como as entradas se distribuem.",
  "incorrectFeedback": "O caso médio não é uma média universal: depende das hipóteses adotadas."
}
```

### Questão 8

```quiz
{
  "question": "Por que comparar algoritmos apenas pelo tempo em segundos pode ser inadequado?",
  "options": [
    {
      "text": "Porque segundos não podem ser medidos.",
      "correct": false
    },
    {
      "text": "Porque o resultado depende também de máquina, compilador e ambiente.",
      "correct": true
    },
    {
      "text": "Porque todos os algoritmos executam no mesmo tempo.",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! A análise de crescimento permite uma comparação menos dependente do ambiente.",
  "incorrectFeedback": "Tempos observados variam conforme hardware, compilador e condições de execução."
}
```

### Questão 9

```quiz
{
  "question": "Se dobrarmos n e o número de operações também aproximadamente dobrar, qual crescimento é sugerido?",
  "options": [
    {
      "text": "Linear.",
      "correct": true
    },
    {
      "text": "Quadrático.",
      "correct": false
    },
    {
      "text": "Fatorial.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! Crescimento proporcional a n é linear.",
  "incorrectFeedback": "Compare como o trabalho muda quando o tamanho da entrada dobra."
}
```

### Questão 10

```quiz
{
  "question": "Um algoritmo correto para 10 elementos necessariamente será eficiente para 10 milhões?",
  "options": [
    {
      "text": "Sim, correção garante eficiência.",
      "correct": false
    },
    {
      "text": "Não; a eficiência depende de como o custo cresce com a entrada.",
      "correct": true
    },
    {
      "text": "Sim, se estiver escrito em C.",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. A análise de complexidade ajuda a prever a escalabilidade.",
  "incorrectFeedback": "A linguagem e a correção não garantem que o algoritmo escale bem."
}
```
