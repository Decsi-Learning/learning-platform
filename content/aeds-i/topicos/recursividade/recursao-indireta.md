## Objetivos de aprendizagem

- Definir recursão indireta ou mútua.
- Identificar ciclos de chamadas entre duas ou mais funções.
- Acompanhar o fluxo até o caso base.
- Evitar ciclos que não apresentam condição de parada.

## Parte teórica

### O que é recursão indireta?

A **recursão indireta**, também chamada de recursão mútua, ocorre quando uma função não chama a si mesma diretamente, mas chama outra função que, depois, retorna à primeira por meio de novas chamadas.

Exemplo de ciclo: `A` chama `B`, `B` chama `A`, e o processo continua. Também pode envolver três ou mais funções.

### Como ela funciona?

Cada função pode ter uma responsabilidade diferente. Uma função pode tratar um caso e encaminhar outro para a função parceira. Mesmo assim, o conjunto precisa ter uma condição que encerre o ciclo.

A recursão indireta continua utilizando a pilha de chamadas. Cada chamada feita por uma função cria um novo contexto de execução, até que algum caso base seja alcançado.

### Exemplo: par ou ímpar

Podemos definir duas funções:

- `eh_par(n)` retorna verdadeiro quando `n` é par. Para `n > 0`, consulta `eh_impar(n - 1)`.
- `eh_impar(n)` retorna verdadeiro quando `n` é ímpar. Para `n > 0`, consulta `eh_par(n - 1)`.

Os casos base são `eh_par(0) = verdadeiro` e `eh_impar(0) = falso`, considerando entradas não negativas.

## Estrutura

```text
FUNÇÃO A(dado)
    SE caso_base_A ENTÃO
        RETORNE resposta_A
    FIM SE
    RETORNE B(proximo_dado)
FIM FUNÇÃO

FUNÇÃO B(dado)
    SE caso_base_B ENTÃO
        RETORNE resposta_B
    FIM SE
    RETORNE A(proximo_dado)
FIM FUNÇÃO
```

O ponto essencial é observar o ciclo entre as funções e verificar se cada passagem aproxima a execução de algum caso base.

## Demonstração

Considere a chamada `eh_par(3)`:

1. `eh_par(3)` chama `eh_impar(2)`.
2. `eh_impar(2)` chama `eh_par(1)`.
3. `eh_par(1)` chama `eh_impar(0)`.
4. `eh_impar(0)` alcança o caso base e retorna falso.
5. O resultado é devolvido pelas chamadas anteriores: `eh_par(3)` retorna falso.

A sequência de funções alterna, enquanto o argumento diminui até zero.

## Pseudocódigo

```text
FUNÇÃO eh_par(n)
    SE n = 0 ENTÃO
        RETORNE VERDADEIRO
    FIM SE
    RETORNE eh_impar(n - 1)
FIM FUNÇÃO

FUNÇÃO eh_impar(n)
    SE n = 0 ENTÃO
        RETORNE FALSO
    FIM SE
    RETORNE eh_par(n - 1)
FIM FUNÇÃO
```

## Código em C

```c
#include <stdbool.h>

bool eh_impar(int n);

bool eh_par(int n) {
    if (n == 0) return true;
    return eh_impar(n - 1);
}

bool eh_impar(int n) {
    if (n == 0) return false;
    return eh_par(n - 1);
}
```

Esse exemplo pressupõe `n >= 0`. Para aceitar números negativos, seria necessário definir e implementar o tratamento correspondente. Em C, a declaração antecipada de `eh_impar` permite que `eh_par` a chame antes de sua definição.


## Teste rápido

```quiz
{
  "question": "Qual situação representa uma recursão indireta?",
  "options": [
    { "text": "A função A chama A diretamente.", "correct": false },
    { "text": "A função A chama B, e B chama A novamente.", "correct": true },
    { "text": "Uma função chama um laço de repetição.", "correct": false }
  ],
  "correctFeedback": "Correto! A recursão é indireta porque o retorno ao ponto inicial acontece por meio de outra função.",
  "incorrectFeedback": "Observe se a função chama a si mesma diretamente ou se existe outra função no caminho."
}
```

## Exercícios de fixação desta página

1. Explique a diferença entre recursão direta e indireta.
2. Na sequência `A(4) → B(3) → A(2) → B(1) → A(0)`, identifique o que permite encerrar as chamadas.
3. O que pode acontecer se `A` e `B` chamarem uma à outra sem reduzir o problema e sem caso base?
4. Por que é importante declarar um protótipo de função em C quando uma função é chamada antes de sua definição?
