# Medidas de Avaliação: Tempo e Espaço

## 1. Complexidade de tempo

A complexidade de tempo representa como a quantidade de trabalho cresce em relação ao tamanho da entrada. Em análises introdutórias, contamos operações relevantes, como comparações, atribuições, operações aritméticas, acessos a vetores e execuções de laços.

Não precisamos contar cada instrução de máquina. O objetivo é identificar o comportamento de crescimento.

## 2. Um laço simples

```c
void imprimir(int n) {
    for (int i = 0; i < n; i++) {
        printf("%d\\n", i);
    }
}
```

O laço executa `n` vezes. Considerando o trabalho de cada iteração constante, o tempo é Θ(n).

## 3. Dois laços consecutivos

```c
void exemplo(int n) {
    for (int i = 0; i < n; i++) printf("%d", i);
    for (int j = 0; j < n; j++) printf("%d", j);
}
```

O primeiro laço executa `n` vezes e o segundo também. Total: `n + n = 2n`. Desconsiderando a constante multiplicativa, o tempo é Θ(n). Laços consecutivos têm seus custos somados.

## 4. Laços aninhados

```c
void exemplo(int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            printf("%d %d", i, j);
        }
    }
}
```

Para cada uma das `n` iterações externas, o laço interno executa `n` vezes. Total: `n × n = n²`. Tempo: Θ(n²).

## 5. Laço que divide a entrada

```c
while (n > 1) {
    n = n / 2;
}
```

A cada repetição, `n` é reduzido pela metade: `n`, `n/2`, `n/4`, `n/8`... A quantidade de divisões necessárias cresce como `log₂(n)`. Tempo: Θ(log n).

## 6. Complexidade de espaço

A complexidade de espaço avalia como o uso de memória cresce com a entrada. Podemos distinguir:

- **Espaço da entrada:** memória para armazenar os dados recebidos.
- **Espaço auxiliar:** memória adicional utilizada pelo algoritmo.
- **Espaço total:** pode incluir entrada, estruturas auxiliares, pilha de chamadas e outras áreas.

Em muitos exercícios, o foco é o espaço auxiliar. É importante verificar o que o enunciado está contando.

### Exemplo: espaço constante

```c
int soma(int v[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += v[i];
    }
    return total;
}
```

A função utiliza algumas variáveis, independentemente de `n`. Considerando apenas o espaço auxiliar: Θ(1). O vetor recebido é a entrada.

### Exemplo: espaço linear

```c
int* copiar(int v[], int n) {
    int *copia = malloc(n * sizeof(int));
    if (copia == NULL) return NULL;

    for (int i = 0; i < n; i++) {
        copia[i] = v[i];
    }
    return copia;
}
```

A função aloca um vetor com `n` posições. O espaço auxiliar cresce proporcionalmente a `n`: Θ(n). A memória alocada deve ser liberada com `free` quando não for mais necessária.

## 7. Tempo e espaço: compromisso

Uma solução pode utilizar memória adicional para reduzir o tempo. Uma tabela pode armazenar resultados já calculados e evitar repetir operações. Portanto, é necessário considerar os recursos relevantes para cada problema.

## 8. Tabela de referência

| Padrão | Crescimento típico |
|---|---|
| Quantidade fixa de operações | Θ(1) |
| Um laço até `n` | Θ(n) |
| Dois laços aninhados até `n` | Θ(n²) |
| Entrada dividida por 2 a cada passo | Θ(log n) |
| Vetor auxiliar de `n` posições | Θ(n) de espaço |

## 9. Exercícios rápidos

1. Quantas vezes o comando interno é executado em um laço que percorre `i = 0` até `n - 1`?
2. Qual é o crescimento de dois laços aninhados, ambos até `n`?
3. Qual é o espaço auxiliar da função `soma` apresentada?
4. Uma função aloca um vetor auxiliar com `n` inteiros. Como cresce o espaço auxiliar?
5. Explique uma situação em que utilizar mais memória pode reduzir o tempo de execução.


## Exercícios interativos de fixação

Responda às questões e clique em **Conferir resposta** para receber o feedback.

### Questão 1

```quiz
{
  "question": "Um laço executa n iterações e cada iteração faz trabalho constante. Qual é o tempo?",
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
  "correctFeedback": "Correto! O trabalho cresce proporcionalmente a n.",
  "incorrectFeedback": "Conte quantas vezes o corpo do laço é executado."
}
```

### Questão 2

```quiz
{
  "question": "Dois laços consecutivos, cada um com n iterações, resultam em qual ordem?",
  "options": [
    {
      "text": "Θ(n)",
      "correct": true
    },
    {
      "text": "Θ(n²)",
      "correct": false
    },
    {
      "text": "Θ(log n)",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! Somamos n + n = 2n e ignoramos a constante.",
  "incorrectFeedback": "Laços consecutivos somam seus custos, não multiplicam."
}
```

### Questão 3

```quiz
{
  "question": "Dois laços aninhados, ambos com n iterações, executam o corpo quantas vezes?",
  "options": [
    {
      "text": "n + n",
      "correct": false
    },
    {
      "text": "n × n",
      "correct": true
    },
    {
      "text": "2ⁿ",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! O corpo executa n² vezes.",
  "incorrectFeedback": "Para cada iteração externa, o laço interno executa n vezes."
}
```