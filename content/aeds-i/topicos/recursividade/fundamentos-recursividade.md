## Objetivos de aprendizagem

Ao final desta página, você deverá ser capaz de:

- Explicar o que é recursividade e como uma chamada recursiva funciona.
- Identificar caso base e caso recursivo.
- Acompanhar a pilha de chamadas durante a execução.
- Reconhecer quando uma recursão não termina corretamente.

## Parte teórica

### O que é recursividade?

Recursividade é uma técnica de programação em que uma função resolve um problema chamando a si mesma, diretamente ou por meio de outra função. Em geral, a função transforma o problema original em uma versão menor ou mais simples, até chegar a uma situação cuja resposta é conhecida.

Uma analogia é abrir uma sequência de caixas encaixadas: para chegar ao objeto, abrimos uma caixa e encontramos outra menor. Continuamos até encontrar a última caixa, que não contém outra. Depois, voltamos fechando as caixas na ordem inversa.

### Os dois elementos obrigatórios

Toda recursão correta precisa, em geral, de dois elementos:

1. **Caso base:** condição que encerra as chamadas recursivas. Nele, a função retorna uma resposta sem chamar a si mesma.
2. **Caso recursivo:** parte em que a função chama a si mesma com um problema menor ou mais próximo do caso base.

> Sem um caso base alcançável, as chamadas podem continuar até ocorrer estouro da pilha (*stack overflow*). Se o argumento não se aproxima do caso base, o problema também pode não terminar.

### Pilha de chamadas

Cada chamada de função cria um registro de execução contendo informações como parâmetros, variáveis locais e o ponto para onde a execução deve retornar. Esses registros são organizados na pilha de chamadas (*call stack*).

Quando uma função chama outra, a nova chamada fica no topo da pilha. Quando ela termina, seu registro é removido e a execução continua na chamada anterior. Na recursão, isso acontece repetidamente.

### Exemplo: fatorial

O fatorial de um inteiro não negativo é definido por:

- `0! = 1` — caso base.
- `n! = n * (n - 1)!`, para `n > 0` — caso recursivo.

Para calcular `4!`, as chamadas descem até `fatorial(0)`. Depois, os resultados são devolvidos: `1`, `1`, `2`, `6` e `24`.

## Estrutura de uma função recursiva

```text
FUNÇÃO resolver(problema)
    SE problema atende ao caso base ENTÃO
        RETORNE resposta_base
    FIM SE

    reduza o problema
    resultado <- resolver(problema_menor)
    combine resultado com os dados da chamada atual
    RETORNE resultado
FIM FUNÇÃO
```

Uma forma prática de revisar uma função recursiva é perguntar:

- Qual é o caso base?
- O que muda a cada chamada?
- Essa mudança aproxima a execução do caso base?
- O que acontece depois que a chamada recursiva retorna?

## Demonstração

Considere `fatorial(3)`:

| Etapa | Ação | Situação |
|:--|:--|:--|
| 1 | `fatorial(3)` chama `3 * fatorial(2)` | Aguardando retorno |
| 2 | `fatorial(2)` chama `2 * fatorial(1)` | Aguardando retorno |
| 3 | `fatorial(1)` chama `1 * fatorial(0)` | Aguardando retorno |
| 4 | `fatorial(0)` retorna `1` | Caso base alcançado |
| 5 | `fatorial(1)` calcula `1 * 1` | Retorna `1` |
| 6 | `fatorial(2)` calcula `2 * 1` | Retorna `2` |
| 7 | `fatorial(3)` calcula `3 * 2` | Retorna `6` |

### Código em C

```c
int fatorial(int n) {
    if (n == 0) {          // caso base
        return 1;
    }
    return n * fatorial(n - 1); // caso recursivo
}
```

O exemplo considera `n >= 0`. Em um programa completo, também é necessário validar entradas negativas e considerar o limite do tipo inteiro utilizado.

## Pseudocódigo

```text
FUNÇÃO fatorial(n)
    SE n = 0 ENTÃO
        RETORNE 1
    FIM SE

    RETORNE n * fatorial(n - 1)
FIM FUNÇÃO
```


## Teste rápido

```quiz
{
  "question": "Quais são os dois elementos fundamentais de uma função recursiva bem estruturada?",
  "options": [
    { "text": "Um laço e uma variável global.", "correct": false },
    { "text": "Um caso base e um caso recursivo.", "correct": true },
    { "text": "Duas funções diferentes e um vetor.", "correct": false }
  ],
  "correctFeedback": "Correto! O caso base encerra a recursão e o caso recursivo transforma o problema para avançar em direção a ele.",
  "incorrectFeedback": "Revise a seção sobre os dois elementos obrigatórios: um deles encerra as chamadas e o outro realiza a chamada recursiva."
}
```

## Exercícios de fixação desta página

1. Identifique o caso base e o caso recursivo da função `fatorial`.
2. O que pode acontecer se uma função recursiva nunca alcançar seu caso base?
3. Explique por que as chamadas de `fatorial(3)` retornam na ordem inversa em que foram iniciadas.
4. Altere mentalmente a função de fatorial para que o caso base seja `n == 1`. Para quais entradas essa versão funcionaria sem tratamento adicional?
