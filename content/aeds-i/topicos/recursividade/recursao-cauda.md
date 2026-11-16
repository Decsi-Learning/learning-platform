## Objetivos de aprendizagem

- Definir recursão de cauda.
- Diferenciar recursão de cauda de uma recursão que ainda precisa combinar resultados após a chamada.
- Identificar o papel do acumulador.
- Entender os limites da otimização de chamada de cauda em C.

## Parte teórica

### O que é recursão de cauda?

Uma função apresenta **recursão de cauda** quando a chamada recursiva é a última operação executada pela função. Depois que a chamada retorna, a função não precisa realizar cálculos adicionais: ela simplesmente devolve o resultado recebido.

Compare:

- `return n * fatorial(n - 1);`: depois da chamada, ainda é necessário multiplicar por `n`. Portanto, essa forma não é recursiva de cauda.
- `return fatorial_cauda(n - 1, acumulador * n);`: a chamada recursiva já recebe o estado atualizado e é a última operação. Essa é uma forma de recursão de cauda.

### Por que usar um acumulador?

O acumulador guarda o resultado parcial entre as chamadas. Em vez de deixar operações pendentes para realizar no retorno, a função atualiza o acumulador antes de chamar a próxima execução.

### A recursão de cauda é sempre mais eficiente?

Não necessariamente. Alguns compiladores e linguagens conseguem aplicar a **otimização de chamada de cauda**, reutilizando o espaço da chamada atual em vez de empilhar um novo registro. Isso pode reduzir o uso da pilha.

Entretanto, a linguagem C não garante que essa otimização será aplicada. O resultado depende do compilador, das opções de compilação e do código gerado. Portanto, não se deve afirmar que toda recursão de cauda em C usa memória constante.

## Estrutura

```text
FUNÇÃO funcao_cauda(entrada, acumulador)
    SE entrada atende ao caso base ENTÃO
        RETORNE acumulador
    FIM SE

    novo_estado <- atualizar(acumulador, entrada)
    RETORNE funcao_cauda(entrada_menor, novo_estado)
FIM FUNÇÃO
```

Elementos para reconhecer:

1. Um parâmetro que carrega o estado parcial, frequentemente chamado de acumulador.
2. Atualização desse estado antes da chamada.
3. Chamada recursiva como última operação.

## Demonstração

Vamos calcular `5!` com acumulador. A chamada inicial é `fatorial_cauda(5, 1)`.

| Chamada | Atualização do acumulador | Próxima chamada |
|:--|:--|:--|
| `(5, 1)` | `1 * 5 = 5` | `(4, 5)` |
| `(4, 5)` | `5 * 4 = 20` | `(3, 20)` |
| `(3, 20)` | `20 * 3 = 60` | `(2, 60)` |
| `(2, 60)` | `60 * 2 = 120` | `(1, 120)` |
| `(1, 120)` | Caso base | Retorna `120` |

Observe que o resultado parcial já está calculado no acumulador. Não há multiplicações pendentes para executar no retorno.

## Pseudocódigo

```text
FUNÇÃO fatorial_cauda(n, acumulador)
    SE n = 0 ENTÃO
        RETORNE acumulador
    FIM SE

    RETORNE fatorial_cauda(n - 1, acumulador * n)
FIM FUNÇÃO

// Chamada inicial:
fatorial_cauda(5, 1)
```

## Código em C

```c
int fatorial_cauda(int n, int acumulador) {
    if (n == 0) {
        return acumulador;
    }
    return fatorial_cauda(n - 1, acumulador * n);
}

// Uso: fatorial_cauda(5, 1) retorna 120.
```

O código pressupõe `n >= 0` e valores que caibam em `int`. Em aplicações reais, valide a entrada e escolha um tipo adequado.


## Teste rápido

```quiz
{
  "question": "Qual característica identifica uma recursão de cauda?",
  "options": [
    { "text": "A função faz duas chamadas recursivas em cada execução.", "correct": false },
    { "text": "A chamada recursiva é a última operação da função.", "correct": true },
    { "text": "A função não possui caso base.", "correct": false }
  ],
  "correctFeedback": "Isso mesmo! Depois da chamada recursiva, não há outra operação a realizar na função atual.",
  "incorrectFeedback": "Pense no que acontece depois que a chamada recursiva retorna. Na recursão de cauda, ainda existe algum cálculo pendente?"
}
```

## Exercícios de fixação desta página

1. Explique por que `return n * fatorial(n - 1);` não é uma chamada de cauda.
2. Qual é a função do acumulador em `fatorial_cauda`?
3. Escreva a sequência de chamadas para `fatorial_cauda(3, 1)`.
4. É correto afirmar que qualquer compilador C transforma automaticamente uma recursão de cauda em laço? Justifique.
