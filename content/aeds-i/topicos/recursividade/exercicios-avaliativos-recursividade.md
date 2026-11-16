## Exercícios avaliativos — Recursividade

Esta atividade reúne os conteúdos de fundamentos da recursividade, recursão de cauda, indireta, aninhada, recursão excessiva e backtracking. Responda às questões e confira o feedback para revisar os pontos que ainda geram dúvida.

## Parte 1 — Fundamentos e rastreamento

### Questão 1 — Conceitos fundamentais

```quiz
{
  "question": "Em uma função recursiva, qual é a finalidade do caso base?",
  "options": [
    { "text": "Realizar a chamada recursiva com um valor maior.", "correct": false },
    { "text": "Encerrar as chamadas e fornecer uma resposta conhecida.", "correct": true },
    { "text": "Armazenar todas as variáveis em um vetor.", "correct": false },
    { "text": "Executar a função indefinidamente.", "correct": false }
  ],
  "correctFeedback": "Correto! O caso base interrompe a recursão e permite que os resultados retornem às chamadas anteriores.",
  "incorrectFeedback": "Revise a função do caso base: ele é a condição de parada da recursão."
}
```

### Questão 2 — Rastreamento

Considere:

```text
FUNÇÃO soma(n)
    SE n = 0 ENTÃO
        RETORNE 0
    FIM SE
    RETORNE n + soma(n - 1)
FIM FUNÇÃO
```

```quiz
{
  "question": "Qual valor é retornado por soma(3)?",
  "options": [
    { "text": "3", "correct": false },
    { "text": "5", "correct": false },
    { "text": "6", "correct": true },
    { "text": "9", "correct": false }
  ],
  "correctFeedback": "Correto! soma(3) = 3 + 2 + 1 + 0 = 6.",
  "incorrectFeedback": "Expanda as chamadas até soma(0), que retorna zero, e depois some os valores no retorno."
}
```

## Parte 2 — Tipos de recursão

### Questão 3 — Recursão de cauda

```quiz
{
  "question": "Qual alternativa apresenta uma chamada recursiva de cauda?",
  "options": [
    { "text": "return n * fatorial(n - 1);", "correct": false },
    { "text": "return soma(n - 1) + n;", "correct": false },
    { "text": "return contar(n - 1, total + 1);", "correct": true },
    { "text": "return n + contar(n - 1, total);", "correct": false }
  ],
  "correctFeedback": "Correto! A chamada é a última operação. O estado parcial já foi atualizado no argumento total.",
  "incorrectFeedback": "Na recursão de cauda, não pode existir uma operação pendente depois que a chamada retorna."
}
```

### Questão 4 — Recursão indireta

```quiz
{
  "question": "Duas funções A e B chamam uma à outra, formando o fluxo A → B → A. Como esse padrão é classificado?",
  "options": [
    { "text": "Recursão de cauda.", "correct": false },
    { "text": "Recursão indireta.", "correct": true },
    { "text": "Recursão aninhada.", "correct": false },
    { "text": "Backtracking.", "correct": false }
  ],
  "correctFeedback": "Isso mesmo! O ciclo de chamadas entre funções diferentes caracteriza a recursão indireta.",
  "incorrectFeedback": "Observe que a função A não chama A diretamente: existe a função B entre as chamadas."
}
```

### Questão 5 — Recursão aninhada

```quiz
{
  "question": "Qual expressão é um exemplo de chamada recursiva aninhada?",
  "options": [
    { "text": "A(n - 1)", "correct": false },
    { "text": "A(B(n))", "correct": false },
    { "text": "M(M(n + 11))", "correct": true },
    { "text": "A(n) + 1", "correct": false }
  ],
  "correctFeedback": "Correto! Uma chamada recursiva é utilizada como argumento de outra chamada recursiva.",
  "incorrectFeedback": "Procure a expressão em que uma chamada da própria função aparece dentro dos argumentos de outra chamada."
}
```

## Parte 3 — Eficiência

### Questão 6 — Recursão excessiva

```quiz
{
  "question": "Qual é a principal causa da ineficiência da versão recursiva simples de Fibonacci?",
  "options": [
    { "text": "A ausência de parâmetros.", "correct": false },
    { "text": "A repetição do cálculo de subproblemas já resolvidos.", "correct": true },
    { "text": "O uso de dois casos base.", "correct": false },
    { "text": "A impossibilidade de retornar inteiros.", "correct": false }
  ],
  "correctFeedback": "Correto! A árvore de chamadas repete subproblemas, causando crescimento exponencial do tempo na implementação simples.",
  "incorrectFeedback": "Observe a árvore de chamadas de Fibonacci: alguns valores aparecem em diferentes ramos."
}
```

### Questão 7 — Memoização

```quiz
{
  "question": "Como a memoização ajuda a evitar recursão excessiva em problemas com subproblemas sobrepostos?",
  "options": [
    { "text": "Armazena resultados calculados para reutilizá-los.", "correct": true },
    { "text": "Remove todos os casos base.", "correct": false },
    { "text": "Faz a função chamar a si mesma sem parâmetros.", "correct": false },
    { "text": "Garante que o algoritmo nunca use memória.", "correct": false }
  ],
  "correctFeedback": "Exatamente! Os resultados armazenados evitam que o mesmo subproblema seja recalculado.",
  "incorrectFeedback": "Memoização significa guardar resultados anteriores para reaproveitá-los quando o mesmo subproblema aparecer."
}
```

## Parte 4 — Backtracking

### Questão 8 — Retrocesso

```quiz
{
  "question": "Em um algoritmo de backtracking, o que deve acontecer quando uma escolha leva a um estado inválido ou sem solução?",
  "options": [
    { "text": "Manter a escolha e ignorar as restrições.", "correct": false },
    { "text": "Desfazer a escolha e tentar outra possibilidade.", "correct": true },
    { "text": "Encerrar obrigatoriamente todo o programa.", "correct": false },
    { "text": "Reiniciar o computador.", "correct": false }
  ],
  "correctFeedback": "Correto! O algoritmo retrocede, restaura o estado anterior e explora outra alternativa.",
  "incorrectFeedback": "Lembre-se das etapas: escolher, validar, avançar e desfazer quando o caminho não funciona."
}
```

### Questão 9 — Poda

```quiz
{
  "question": "Qual é o objetivo da poda em um algoritmo de backtracking?",
  "options": [
    { "text": "Explorar novamente todos os caminhos já visitados.", "correct": false },
    { "text": "Interromper caminhos que já violam restrições ou não podem levar a uma solução.", "correct": true },
    { "text": "Aumentar a profundidade da recursão sem necessidade.", "correct": false },
    { "text": "Substituir todos os casos base por laços.", "correct": false }
  ],
  "correctFeedback": "Muito bem! A poda evita explorar caminhos que não podem produzir uma solução válida.",
  "incorrectFeedback": "Pense na poda como uma forma de cortar antecipadamente um ramo inútil da árvore de busca."
}
```

## Parte 5 — Questões discursivas e de implementação

Responda em texto ou em uma folha à parte. Estas questões exigem justificativa e construção de soluções.

1. **Análise de função:** escreva uma função recursiva que calcule a soma dos números de `1` até `n`. Identifique o caso base e o caso recursivo e rastreie a execução para `n = 4`.
2. **Transformação em cauda:** transforme a função de soma da questão anterior em uma versão de recursão de cauda, utilizando um acumulador. Mostre a chamada inicial.
3. **Recursão indireta:** descreva duas funções que se chamem alternadamente para verificar uma propriedade de um número. Indique os casos base e explique como o argumento progride.
4. **Recursão aninhada:** explique a ordem de avaliação de `M(M(n + 11))`. Por que a chamada interna precisa ser resolvida antes da externa?
5. **Eficiência:** desenhe parte da árvore de chamadas de `fib(5)` e destaque pelo menos um subproblema repetido. Explique como a memoização resolve essa repetição.
6. **Backtracking:** descreva como resolveria um labirinto usando backtracking. Informe quais condições tornam uma posição inválida e em que momento a marcação de uma posição deve ser desfeita.
7. **Comparação:** apresente uma situação em que uma solução recursiva é clara e adequada e outra em que uma abordagem iterativa ou com memoização seria mais interessante. Justifique considerando tempo, memória e legibilidade.

## Critérios de avaliação sugeridos

| Critério | O que será observado |
|:--|:--|
| Conceitos | Diferencia corretamente os tipos de recursão. |
| Rastreamento | Identifica a ordem das chamadas e dos retornos. |
| Implementação | Define caso base e progresso em direção à parada. |
| Eficiência | Reconhece chamadas repetidas e propõe melhorias adequadas. |
| Backtracking | Aplica escolha, validação, avanço e retrocesso corretamente. |
