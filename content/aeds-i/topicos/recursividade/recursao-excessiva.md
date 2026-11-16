## Objetivos de aprendizagem

- Entender o que significa realizar chamadas recursivas em excesso.
- Identificar trabalho repetido em uma árvore de chamadas.
- Analisar o exemplo da sequência de Fibonacci.
- Conhecer estratégias para reduzir chamadas desnecessárias.

## Parte teórica

### O que é recursão excessiva?

Neste material, chamamos de **recursão excessiva** a situação em que a solução recursiva realiza muitas chamadas, especialmente quando recalcula repetidamente resultados que já foram obtidos. Isso pode tornar o algoritmo muito lento e aumentar o consumo de memória da pilha.

Nem toda função recursiva com muitas chamadas é necessariamente ruim. O problema aparece quando o custo é desnecessário ou quando a profundidade da recursão ultrapassa os limites disponíveis.

### Exemplo: Fibonacci recursivo simples

A sequência de Fibonacci pode ser definida por:

- `fib(0) = 0`.
- `fib(1) = 1`.
- `fib(n) = fib(n - 1) + fib(n - 2)`, para `n > 1`.

A implementação direta é fácil de entender, mas repete cálculos. Para calcular `fib(5)`, por exemplo, `fib(3)` é solicitado por mais de um caminho. Para valores maiores, a quantidade de chamadas cresce rapidamente.

### Como reduzir o trabalho repetido?

- **Memoização:** armazena resultados já calculados e os reutiliza.
- **Programação dinâmica:** organiza o cálculo dos subproblemas, muitas vezes de baixo para cima.
- **Abordagem iterativa:** utiliza laços e variáveis para evitar uma grande pilha de chamadas, quando isso for adequado.
- **Poda:** em problemas de busca, interrompe caminhos que não podem produzir uma solução válida.

Memoização e programação dinâmica são especialmente úteis quando existem subproblemas sobrepostos. Poda é uma técnica associada a algoritmos de busca, como backtracking.

## Estrutura

### Recursão simples, com repetição

```text
FUNÇÃO fib(n)
    SE n <= 1 ENTÃO
        RETORNE n
    FIM SE
    RETORNE fib(n - 1) + fib(n - 2)
FIM FUNÇÃO
```

### Recursão com memoização

```text
FUNÇÃO fib_memo(n, memoria)
    SE n <= 1 ENTÃO
        RETORNE n
    FIM SE

    SE memoria[n] já foi calculado ENTÃO
        RETORNE memoria[n]
    FIM SE

    memoria[n] <- fib_memo(n - 1, memoria)
                  + fib_memo(n - 2, memoria)
    RETORNE memoria[n]
FIM FUNÇÃO
```

A tabela de memória deve ser inicializada indicando que nenhuma posição foi calculada. Em uma implementação real, também é necessário validar o tamanho da tabela e o domínio de `n`.

## Demonstração

Para `fib(5)`, a definição recursiva solicita `fib(4)` e `fib(3)`. Ao calcular `fib(4)`, o algoritmo solicita novamente `fib(3)` e `fib(2)`. Assim, `fib(3)` aparece repetido.

| Subproblema | Sem memoização | Com memoização |
|:--|:--|:--|
| `fib(3)` | Pode ser calculado várias vezes | É calculado uma vez e reutilizado |
| `fib(2)` | Também pode se repetir | É armazenado e reutilizado |
| Resultado final | Correto, mas com trabalho repetido | Correto, evitando recomputações |

Para a implementação recursiva simples, o tempo cresce exponencialmente, com limite superior frequentemente descrito como `O(2^n)`. Com memoização, cada valor de `0` a `n` é calculado uma vez, resultando em tempo `O(n)` e espaço `O(n)` para a tabela e a pilha recursiva.

## Pseudocódigo

```text
FUNÇÃO fib(n)
    SE n <= 1 ENTÃO
        RETORNE n
    FIM SE
    RETORNE fib(n - 1) + fib(n - 2)
FIM FUNÇÃO

FUNÇÃO fib_memo(n, memoria)
    SE n <= 1 ENTÃO
        RETORNE n
    FIM SE
    SE memoria[n] != DESCONHECIDO ENTÃO
        RETORNE memoria[n]
    FIM SE
    memoria[n] <- fib_memo(n - 1, memoria) + fib_memo(n - 2, memoria)
    RETORNE memoria[n]
FIM FUNÇÃO
```

## Código em C — versão simples

```c
int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}
```

A função é didática, mas não é indicada para valores grandes devido ao número de chamadas repetidas. Para uma solução eficiente, pode-se implementar memoização ou uma versão iterativa.


## Teste rápido

```quiz
{
  "question": "Por que a implementação recursiva simples de Fibonacci pode ser ineficiente?",
  "options": [
    { "text": "Porque não possui nenhum caso base.", "correct": false },
    { "text": "Porque recalcula os mesmos subproblemas diversas vezes.", "correct": true },
    { "text": "Porque utiliza obrigatoriamente uma tabela hash.", "correct": false }
  ],
  "correctFeedback": "Correto! A implementação simples repete cálculos, como fib(3), em diferentes ramos da árvore de chamadas.",
  "incorrectFeedback": "Observe a árvore de chamadas de Fibonacci e procure valores que aparecem em mais de um ramo."
}
```

## Exercícios de fixação desta página

1. Quais são os casos base da sequência de Fibonacci?
2. Explique por que `fib(3)` pode ser calculado mais de uma vez ao executar `fib(5)`.
3. O que é memoização?
4. Qual é a diferença entre reduzir chamadas repetidas e reduzir a profundidade da pilha? As duas coisas são sempre a mesma melhoria?
