## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar como a seleção por substituição cria arquivos ordenados maiores.
- Calcular quantas passadas uma intercalação de p vias faz.
- Comparar a intercalação balanceada com a polifásica.
- Acompanhar a polifásica usando a sequência de Fibonacci.

## Conexão com a Trilha

Na página anterior ordenamos um arquivo grande em duas fases e vimos que cada passada pelo disco é cara. Aqui buscamos reduzir o número de passadas, criando arquivos ordenados maiores e comparando a intercalação balanceada com a polifásica.

### Seleção por substituição: runs maiores

Na fase 1, em vez de ordenar blocos de `n` registros, dá para criar arquivos ordenados **maiores que a memória**. Esse truque se chama **seleção por substituição**. Veja como funciona:

1. Carregue `n` registros na memória.
2. Tire o **menor** deles e grave na run atual.
3. Leia o próximo registro do arquivo e coloque no lugar do que saiu.
   - Se ele for **maior ou igual** ao que acabou de sair, ainda cabe na run atual.
   - Se for **menor**, não cabe. Ele fica "congelado" e espera a **próxima** run.
4. Quando todos os registros da memória estiverem congelados, a run atual termina e começa outra.

Com dados em ordem aleatória, as runs saem com cerca de **2 × n** registros, em média. Esse é um resultado clássico, descrito por Knuth. Runs maiores significam menos arquivos (`k` menor) e menos trabalho na fase 2.

Esse método não apareceu nos slides do professor. Mesmo assim, ele faz parte do assunto de ordenação em disco do plano de ensino.

### Quantas passadas?

O esquema da aula junta os `k` arquivos **de uma só vez** (`p = k`), em **uma** passada. Mas e se a memória não comporta `k + 1` buffers de bom tamanho? Então juntamos só `p` arquivos por vez, em várias passadas.

Cada passada divide a quantidade de arquivos por `p`. O número de passadas é `⌈log_p k⌉`, ou seja, quantas vezes precisamos dividir `k` por `p` até chegar a 1.

Exemplo: `T = 1 000 000` registros e `n = 10 000` criam `k = 100` arquivos ordenados.

| Vias (`p`) | Passadas de intercalação |
|---|---|
| 2 | 7 (porque 2⁷ = 128 ≥ 100) |
| 10 | 2 (porque 10² = 100) |
| 100 | 1 (é o esquema da aula, com `p = k`) |

Quanto maior o `p`, menos passadas. Mas os buffers ficam menores (`b = n / (p + 1)`). O disco também precisa "pular" mais entre os `p` arquivos, e esses pulos se chamam *seeks*. Por isso existe um ponto de equilíbrio.

### Intercalação balanceada

Na **intercalação balanceada de p vias** usamos `2p` arquivos: `p` de entrada e `p` de saída. Em cada passada, lemos as runs dos arquivos de entrada, juntamos e espalhamos o resultado pelos arquivos de saída. Na passada seguinte, trocamos os papéis dos arquivos.

O ponto fraco é que cada passada **copia todos os dados**.

### Intercalação polifásica

A **polifásica** aproveita melhor os arquivos. Ela usa `p + 1` arquivos. Em cada fase, `p` arquivos são de entrada e **1 é de saída**. Quando um arquivo de entrada **esvazia**, ele vira a saída da fase seguinte. Assim, os dados não são copiados por inteiro a cada passada.

Para funcionar sem desperdício, as runs são distribuídas no começo seguindo os **números de Fibonacci**: 1, 1, 2, 3, 5, 8, 13, 21, 34, ... Com 3 arquivos e 34 runs, colocamos 21 runs em um arquivo e 13 no outro. Se a quantidade de runs não bate com a sequência, completamos com **runs fictícias**, que são vazias.

Veja a conta na demonstração abaixo. A polifásica com 3 arquivos ordena 34 runs em 7 fases e escreve 180 "unidades" de dados. Cada unidade é o tamanho de uma run inicial. A balanceada de 2 vias, com 4 arquivos, faria 6 passadas completas: 6 × 34 = 204 unidades. E ela usa um arquivo a mais.

## Demonstração

Esta demonstração mostra a polifásica com 3 arquivos e 34 runs.

```demo
{
  "title": "Intercalação polifásica: 3 arquivos, 34 runs",
  "steps": [
    {
      "caption": "Distribuição inicial: 21 runs no arquivo 1 e 13 no arquivo 2 (números de Fibonacci consecutivos). O arquivo 3 está vazio e será a primeira saída.",
      "state": "Fase 0\n  arquivo 1: 21 runs\n  arquivo 2: 13 runs\n  arquivo 3:  0 runs"
    },
    {
      "caption": "Intercala 13 runs do arquivo 1 com as 13 do arquivo 2, gravando no arquivo 3. O arquivo 2 esvazia.",
      "state": "Fase 1\n  arquivo 1:  8 runs\n  arquivo 2:  0 runs   <- esvaziou, será a saída\n  arquivo 3: 13 runs"
    },
    {
      "caption": "Intercala 8 runs dos arquivos 1 e 3, gravando no arquivo 2. O arquivo 1 esvazia.",
      "state": "Fase 2\n  arquivo 1:  0 runs   <- esvaziou, será a saída\n  arquivo 2:  8 runs\n  arquivo 3:  5 runs"
    },
    {
      "caption": "Intercala 5 runs dos arquivos 2 e 3, gravando no arquivo 1.",
      "state": "Fase 3\n  arquivo 1:  5 runs\n  arquivo 2:  3 runs\n  arquivo 3:  0 runs   <- esvaziou"
    },
    {
      "caption": "Intercala 3 runs dos arquivos 1 e 2, gravando no arquivo 3.",
      "state": "Fase 4\n  arquivo 1:  2 runs\n  arquivo 2:  0 runs   <- esvaziou\n  arquivo 3:  3 runs"
    },
    {
      "caption": "Intercala 2 runs dos arquivos 1 e 3, gravando no arquivo 2.",
      "state": "Fase 5\n  arquivo 1:  0 runs   <- esvaziou\n  arquivo 2:  2 runs\n  arquivo 3:  1 run"
    },
    {
      "caption": "Intercala 1 run dos arquivos 2 e 3, gravando no arquivo 1.",
      "state": "Fase 6\n  arquivo 1:  1 run\n  arquivo 2:  1 run\n  arquivo 3:  0 runs"
    },
    {
      "caption": "Última fase: intercala as duas últimas runs no arquivo 3. Sobrou uma só run com todos os dados ordenados.",
      "state": "Fase 7\n  arquivo 1:  0 runs\n  arquivo 2:  0 runs\n  arquivo 3:  1 run   <- ARQUIVO ORDENADO\n\nTotal: 7 fases, 3 arquivos"
    }
  ]
}
```

## Código em C

Vamos ver a polifásica em um exemplo menor: **8 runs**, distribuídas em 5 e 3 (dois números de Fibonacci seguidos). Cada arquivo é representado por uma lista com os tamanhos das suas runs. Na vida real seriam arquivos de verdade. Aqui simulamos, para você enxergar só a lógica.

Clique em **Executar** e preste atenção em três coisas:

- Cada bichinho é uma run, e o número é o tamanho dela (quantas runs iniciais ela contém).
- Quando um arquivo esvazia, ele vira a saída da fase seguinte.
- Os tamanhos que aparecem são 1, 2, 3, 5 e 8. É a sequência de Fibonacci.

```codigo
{
  "title": "Intercalação polifásica passo a passo",
  "code": [
    "#include <stdio.h>",
    "",
    "#define MAX 16",
    "",
    "int run[3][MAX];   /* run[f][i]: tamanho da i-ésima run do arquivo f (em runs iniciais) */",
    "int qtd[3];        /* quantas runs cada arquivo tem agora */",
    "",
    "/* junta a última run de a com a última run de b em uma run maior, gravada em saida */",
    "void fundeUma(int a, int b, int saida) {",
    "    int tamanho = run[a][qtd[a] - 1] + run[b][qtd[b] - 1];",
    "    qtd[a]--;",
    "    qtd[b]--;",
    "    run[saida][qtd[saida]++] = tamanho;",
    "}",
    "",
    "int main(void) {",
    "    int saida = 2, fase = 0;                       /* o arquivo 2 começa vazio e é a saída */",
    "    for (int i = 0; i < 5; i++) run[0][qtd[0]++] = 1;   /* distribuição de Fibonacci: 5 runs... */",
    "    for (int i = 0; i < 3; i++) run[1][qtd[1]++] = 1;   /* ...e 3 runs */",
    "    while (qtd[0] + qtd[1] + qtd[2] > 1) {         /* ainda há mais de uma run no total */",
    "        int a = (saida + 1) % 3, b = (saida + 2) % 3;",
    "        int vezes = qtd[a] < qtd[b] ? qtd[a] : qtd[b];   /* até o menor arquivo esvaziar */",
    "        fase++;",
    "        for (int i = 0; i < vezes; i++)",
    "            fundeUma(a, b, saida);",
    "        saida = qtd[a] == 0 ? a : b;               /* quem esvaziou vira a próxima saída */",
    "    }",
    "    printf(\"fases: %d\\n\", fase);",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 20,
      "caption": "Distribuição inicial das 8 runs (cada uma com tamanho 1): 5 no arquivo 1 e 3 no arquivo 2. São números de Fibonacci seguidos (3, 5, 8). O arquivo 3 está vazio e será a primeira saída.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, 1, 1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [1, 1, 1], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3"}]],
      "stack": "main"
    },
    {
      "line": 24,
      "caption": "Fase 1: lemos dos arquivos 1 e 2 e gravamos no arquivo 3. Vamos juntar 3 pares de runs, até o menor dos dois arquivos esvaziar.",
      "vars": {"fase": 1, "vezes": 3},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, 1, 1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [1, 1, 1], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 1 (tamanho 1) e a última do arquivo 2 (tamanho 1). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, 1, 1, [1, "c"]], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [1, 1, [1, "c"]], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 2 e vai para o arquivo 3.",
      "vars": {"tamanho": 2},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, 1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [1, 1], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 1 (tamanho 1) e a última do arquivo 2 (tamanho 1). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, 1, [1, "c"]], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [1, [1, "c"]], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [2], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 2 e vai para o arquivo 3.",
      "vars": {"tamanho": 2},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [1], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [2], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 1 (tamanho 1) e a última do arquivo 2 (tamanho 1). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1, [1, "c"]], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [[1, "c"]], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [2, 2], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 2 e vai para o arquivo 3.",
      "vars": {"tamanho": 2},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [2, 2], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 26,
      "caption": "O arquivo 2 esvaziou. Ele não precisa ser copiado nem apagado: na próxima fase ele vira a saída.",
      "vars": {"fase": 1},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2", "a": 1}], [{"s": 0, "n": 5, "i": [2, 2, 2], "l": "arquivo 3"}]],
      "stack": "main"
    },
    {
      "line": 24,
      "caption": "Fase 2: lemos dos arquivos 3 e 1 e gravamos no arquivo 2. Vamos juntar 2 pares de runs, até o menor dos dois arquivos esvaziar.",
      "vars": {"fase": 2, "vezes": 2},
      "rows": [[{"s": 0, "n": 5, "i": [1, 1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [2, 2, 2], "l": "arquivo 3"}]],
      "stack": "main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 3 (tamanho 2) e a última do arquivo 1 (tamanho 1). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [1, [1, "c"]], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [2, 2, [2, "c"]], "l": "arquivo 3"}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 3 e vai para o arquivo 2.",
      "vars": {"tamanho": 3},
      "rows": [[{"s": 0, "n": 5, "i": [1], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [2, 2], "l": "arquivo 3"}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 3 (tamanho 2) e a última do arquivo 1 (tamanho 1). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [[1, "c"]], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [3], "l": "arquivo 2 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [2, [2, "c"]], "l": "arquivo 3"}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 3 e vai para o arquivo 2.",
      "vars": {"tamanho": 3},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [3], "l": "arquivo 2 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [2], "l": "arquivo 3"}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 26,
      "caption": "O arquivo 1 esvaziou. Ele não precisa ser copiado nem apagado: na próxima fase ele vira a saída.",
      "vars": {"fase": 2},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1", "a": 1}], [{"s": 0, "n": 5, "i": [3, 3], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [2], "l": "arquivo 3"}]],
      "stack": "main"
    },
    {
      "line": 24,
      "caption": "Fase 3: lemos dos arquivos 2 e 3 e gravamos no arquivo 1. Vamos juntar 1 par de runs, até o menor dos dois arquivos esvaziar.",
      "vars": {"fase": 3, "vezes": 1},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [3, 3], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [2], "l": "arquivo 3"}]],
      "stack": "main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 2 (tamanho 3) e a última do arquivo 3 (tamanho 2). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [3, [3, "c"]], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [[2, "c"]], "l": "arquivo 3"}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 5 e vai para o arquivo 1.",
      "vars": {"tamanho": 5},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1 (saída)", "a": 1}], [{"s": 0, "n": 5, "i": [3], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3"}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 26,
      "caption": "O arquivo 3 esvaziou. Ele não precisa ser copiado nem apagado: na próxima fase ele vira a saída.",
      "vars": {"fase": 3},
      "rows": [[{"s": 0, "n": 5, "i": [5], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [3], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3", "a": 1}]],
      "stack": "main"
    },
    {
      "line": 24,
      "caption": "Fase 4: lemos dos arquivos 1 e 2 e gravamos no arquivo 3. Vamos juntar 1 par de runs, até o menor dos dois arquivos esvaziar.",
      "vars": {"fase": 4, "vezes": 1},
      "rows": [[{"s": 0, "n": 5, "i": [5], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [3], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "main"
    },
    {
      "line": 10,
      "caption": "Pegamos a última run do arquivo 1 (tamanho 5) e a última do arquivo 2 (tamanho 3). Vamos somar os tamanhos.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [[5, "c"]], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [[3, "c"]], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 13,
      "caption": "As duas runs saíram dos arquivos de entrada. A run nova tem tamanho 8 e vai para o arquivo 3.",
      "vars": {"tamanho": 8},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 3 (saída)", "a": 1}]],
      "stack": "fundeUma ← main"
    },
    {
      "line": 26,
      "caption": "O arquivo 1 esvaziou. Ele não precisa ser copiado nem apagado: na próxima fase ele vira a saída.",
      "vars": {"fase": 4},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1", "a": 1}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [8], "l": "arquivo 3"}]],
      "stack": "main"
    },
    {
      "line": 28,
      "caption": "Sobrou uma única run, de tamanho 8, no arquivo 3. É o arquivo ordenado! Foram 4 fases, sempre com 3 arquivos.",
      "vars": {"fase": 4},
      "rows": [[{"s": 0, "n": 5, "i": [], "l": "arquivo 1"}], [{"s": 0, "n": 5, "i": [], "l": "arquivo 2"}], [{"s": 0, "n": 5, "i": [[8, "p"]], "l": "arquivo 3", "a": 1}]],
      "stack": "main"
    }
  ]
}
```

## Teste rápido

```quiz
{
  "question": "Foram gerados k = 100 arquivos ordenados. Se cada passada intercala p = 10 arquivos de uma vez, quantas passadas de intercalação são necessárias?",
  "options": [
    { "text": "1", "correct": false },
    { "text": "2", "correct": true },
    { "text": "7", "correct": false },
    { "text": "10", "correct": false }
  ],
  "correctFeedback": "✅ Correto! 100 arquivos viram 10 na primeira passada e 1 na segunda: ⌈log₁₀ 100⌉ = 2.",
  "incorrectFeedback": "❌ Ainda não. Cada passada divide a quantidade de arquivos por 10: 100 → 10 → 1."
}
```

```quiz
{
  "question": "O que há de característico na intercalação polifásica?",
  "options": [
    { "text": "Ela usa p+1 arquivos e o arquivo de entrada que esvazia vira a próxima saída", "correct": true },
    { "text": "Ela usa 2p arquivos, metade de entrada e metade de saída o tempo todo", "correct": false },
    { "text": "Ela ordena o arquivo inteiro na memória e dispensa arquivos auxiliares", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Os papéis dos arquivos vão mudando conforme eles esvaziam, e as runs são distribuídas inicialmente seguindo números de Fibonacci.",
  "incorrectFeedback": "❌ Ainda não. A balanceada usa 2p arquivos. A polifásica usa p+1 e reaproveita como saída o arquivo que acabou de esvaziar."
}
```

