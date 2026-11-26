## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar o que é intercalar duas listas que já estão em ordem.
- Descrever as duas fases do mergesort externo.
- Calcular quantos arquivos e quantos buffers o método usa.
- Acompanhar o código em C, linha por linha, com a animação.

## Conexão com a Trilha

No tópico anterior vimos os registros de tamanho variável e a dificuldade de reaproveitar os buracos que sobram. Agora mudamos de problema: como ordenar um arquivo que é maior que a memória. Na ordenação externa contamos as passadas pelo disco, e não as comparações.

### O problema: o arquivo não cabe na memória

Você já conhece o Quicksort e o Mergesort. Eles guardam todos os dados na memória (a RAM). Mas e se o arquivo tem 10 GB e a RAM tem só 1 GB? Não dá para carregar tudo.

Pense numa mesa pequena e numa pilha enorme de fichas numeradas. Você só consegue espalhar algumas fichas por vez. Como colocar todas em ordem? Esse é o problema da **ordenação externa**, também chamada de **ordenação em disco**.

O disco é muito mais lento que a memória. Por isso, aqui não contamos comparações. Contamos **quantas vezes o arquivo inteiro é lido e gravado**. Cada volta completa pelo arquivo é uma **passada**. Quanto menos passadas, melhor.

### Intercalar: juntar duas listas em ordem

Imagine dois montes de cartas, cada um já em ordem crescente. Para juntar os dois em um monte só, também em ordem:

1. Olhe a carta de cima de cada monte.
2. Pegue a menor e coloque no monte novo.
3. Repita até um dos montes acabar. Depois, passe o que sobrou do outro monte.

Cada monte é lido **uma única vez**, do começo ao fim. Isso é ótimo para o disco. Também não precisamos do monte inteiro na memória. Basta um pedaço pequeno de cada um. Esse pedaço se chama **buffer**.

Duas listas com 4 e 5 itens fazem no máximo 4 + 5 - 1 = 8 comparações.

### Mergesort externo: duas fases

É o método mais usado para ordenar arquivos grandes. Ele usa a intercalação para juntar vários pedaços ordenados em um só. Estes são os símbolos que vamos usar:

| Símbolo | Significado |
|---|---|
| `n` | Quantos registros cabem na memória (RAM) |
| `T` | Quantos registros o arquivo tem no total (`T` é maior que `n`) |
| `k` | Quantos arquivos ordenados a fase 1 cria |
| `b` | Tamanho de cada buffer, em registros |
| `p` | Quantos arquivos juntamos de cada vez ("p vias") |

**Fase 1: criar arquivos ordenados.**

1. Leia do arquivo de entrada até `n` registros e coloque na memória.
2. Ordene esses registros na memória, por exemplo com o Quicksort.
3. Grave o resultado em um arquivo novo.
4. Repita até acabar o arquivo original.

No fim temos `k = ⌈T / n⌉` arquivos ordenados. Cada um deles também é chamado de **run** ("corrida", em português).

**Fase 2: juntar todos de uma vez** (*multi-way merging*).

1. Crie `k + 1` buffers, cada um com `b = n / (k + 1)` registros (arredonde para baixo). São `k` buffers de entrada, um para cada arquivo, e 1 buffer de saída.
2. Encha cada buffer de entrada com o começo do seu arquivo.
3. Repita: olhe o primeiro valor de cada buffer de entrada, pegue o menor e coloque no buffer de saída.
4. Se um buffer de entrada esvaziar, encha de novo com o próximo pedaço do arquivo. Se o buffer de saída encher, grave no arquivo final.

Para achar o menor, comparamos os primeiros valores dos `k` buffers, um por um. São até `k - 1` comparações para cada registro gravado. Uma estrutura chamada *heap* reduz esse custo, mas na aula usamos a varredura simples.

**Um exemplo com números.** O arquivo tem `T = 1000` registros e a memória comporta `n = 100`. A fase 1 cria `k = 10` arquivos de 100 registros. A fase 2 usa 11 buffers, cada um com `b = ⌊100 / 11⌋ = 9` registros.

E se `k + 1` for maior que `n`? Aí não cabe nem 1 registro por buffer. Nesse caso juntamos só `p` arquivos por vez, em várias passadas. Veremos isso na próxima página.

## Estrutura

Os arquivos e os buffers do mergesort externo:

```estrutura
MERGESORT EXTERNO (T registros no arquivo; a memória comporta n)

 FASE 1: gerar k = T / n arquivos ordenados
 +----------------+  lê n, ordena na RAM (Quicksort)  +----------+
 | arquivo de     | --------------------------------> | Temp1    |
 | entrada        |  lê n, ordena na RAM              | Temp2    |
 | (T registros)  | --------------------------------> | Temp3    |
 +----------------+              ...                 | ...      |
                                                      | Tempk    |
                                                      +----------+

 FASE 2: multi-way merging com k + 1 buffers de tamanho b = n / (k + 1)

   Temp1 --> [buffer de entrada 1] --+
   Temp2 --> [buffer de entrada 2] --+--> escolhe o menor --> [buffer de saída] --> ARQUIVO ORDENADO
   ...                               |        das cabeças          (1 buffer)
   Tempk --> [buffer de entrada k] --+

   entrada vazio  -> lê mais dados do arquivo
   saída cheio    -> grava no arquivo final
```

## Demonstração

Duas demonstrações: a intercalação de duas runs e o mergesort externo com `k + 1` buffers, como na aula.

```demo
{
  "title": "Intercalação de duas runs",
  "steps": [
    {
      "caption": "Duas runs ordenadas. Os marcadores mostram o próximo elemento de cada uma.",
      "state": "A: [2] 5  9  14\nB: [3] 4  10 11\nsaída: (vazia)"
    },
    {
      "caption": "Compara 2 e 3. O 2 é menor: vai para a saída. Avança em A.",
      "state": "A:  2 [5] 9  14\nB: [3] 4  10 11\nsaída: 2"
    },
    {
      "caption": "Compara 5 e 3, depois 5 e 4. Saem o 3 e o 4 (ambos de B).",
      "state": "A:  2 [5] 9  14\nB:  3  4 [10] 11\nsaída: 2 3 4"
    },
    {
      "caption": "Compara 5 e 10: sai o 5. Compara 9 e 10: sai o 9.",
      "state": "A:  2  5  9 [14]\nB:  3  4 [10] 11\nsaída: 2 3 4 5 9"
    },
    {
      "caption": "Compara 14 e 10, depois 14 e 11: saem o 10 e o 11. A run B acabou.",
      "state": "A:  2  5  9 [14]\nB:  3  4  10 11 (acabou)\nsaída: 2 3 4 5 9 10 11\n\ncomparações até aqui: 7"
    },
    {
      "caption": "Sobrou só o 14 em A: é copiado sem comparar. Fim.",
      "state": "saída: 2 3 4 5 9 10 11 14\n\ntotal: 8 elementos, 7 comparações\n(cada run foi lida uma única vez)"
    }
  ]
}
```

```demo
{
  "title": "Mergesort externo: k arquivos e k + 1 buffers",
  "steps": [
    {
      "caption": "Fase 1 já feita: T = 12 registros e n = 6 geraram k = 2 arquivos ordenados: (1 2 3 7 8 9) e (4 5 6 10 11 12). Fase 2: k + 1 = 3 buffers de tamanho b = piso(6 / 3) = 2. Cada buffer de entrada recebe os 2 primeiros valores do seu arquivo.",
      "state": "entrada 1: [1, 2]   (no disco: 3, 7, 8, 9)\nentrada 2: [4, 5]   (no disco: 6, 10, 11, 12)\nsaída:     []\narquivo final: (vazio)"
    },
    {
      "caption": "Menor entre as cabeças (1 e 4): é o 1. Vai para o buffer de saída.",
      "state": "entrada 1: [2]   (no disco: 3, 7, 8, 9)\nentrada 2: [4, 5]   (no disco: 6, 10, 11, 12)\nsaída:     [1]\narquivo final: (vazio)"
    },
    {
      "caption": "Depois do 2 a saída encheu e foi gravada, e a entrada 1 esvaziou e foi recarregada (3 e 7). Agora o 3 acabou de sair.",
      "state": "entrada 1: [7]   (no disco: 8, 9)\nentrada 2: [4, 5]   (no disco: 6, 10, 11, 12)\nsaída:     [3]\narquivo final: 1 2"
    },
    {
      "caption": "O 4 e o 5 saíram da entrada 2. Ao esvaziar, ela foi recarregada com 6 e 10.",
      "state": "entrada 1: [7]   (no disco: 8, 9)\nentrada 2: [6, 10]   (no disco: 11, 12)\nsaída:     [5]\narquivo final: 1 2 3 4"
    },
    {
      "caption": "O 7 foi o último da entrada 1. Ela esvaziou e recebeu os últimos valores do arquivo 1: 8 e 9.",
      "state": "entrada 1: [8, 9]   (no disco: nada)\nentrada 2: [10]   (no disco: 11, 12)\nsaída:     [7]\narquivo final: 1 2 3 4 5 6"
    },
    {
      "caption": "O 9 foi o último valor do arquivo 1. Não há mais o que ler dele: esse buffer é ignorado daqui em diante.",
      "state": "entrada 1: []   (no disco: nada)\nentrada 2: [10]   (no disco: 11, 12)\nsaída:     [9]\narquivo final: 1 2 3 4 5 6 7 8"
    },
    {
      "caption": "Só o arquivo 2 continua. Quando o 12 sai, todos os buffers de entrada estão vazios: o arquivo final está completo e ordenado.",
      "state": "entrada 1: []\nentrada 2: []\nsaída:     []\narquivo final: 1 2 3 4 5 6 7 8 9 10 11 12\n\nTodos os registros foram lidos e gravados uma vez na fase 2."
    }
  ]
}
```

## Código em C

Agora vamos ver o código funcionando. Clique em **Executar** ou em **Próximo**. A linha amarela é a que o computador está executando. Ao lado, você vê o que acontece com os números.

### Aquecimento: mergesort na memória

Antes do externo, veja o mergesort comum, que trabalha só na memória. Ele divide o vetor ao meio até sobrar 1 número em cada parte. Depois junta as partes com a função `intercala`. É a mesma ideia de "juntar duas listas em ordem" que você acabou de ver.

```codigo
{
  "title": "Merge sort passo a passo",
  "code": [
    "#include <stdio.h>",
    "",
    "int v[8] = {7, 4, 2, 1, 8, 3, 6, 5};",
    "int aux[8];",
    "",
    "void intercala(int ini, int meio, int fim) {",
    "    int i = ini, j = meio, k = ini;",
    "    while (i < meio && j < fim) {",
    "        if (v[i] <= v[j]) {",
    "            aux[k++] = v[i++];",
    "        } else {",
    "            aux[k++] = v[j++];",
    "        }",
    "    }",
    "    while (i < meio) {",
    "        aux[k++] = v[i++];",
    "    }",
    "    while (j < fim) {",
    "        aux[k++] = v[j++];",
    "    }",
    "    for (k = ini; k < fim; k++)",
    "        v[k] = aux[k];",
    "}",
    "",
    "void mergeSort(int ini, int fim) {",
    "    if (fim - ini <= 1) {",
    "        return;",
    "    }",
    "    int meio = (ini + fim) / 2;",
    "    mergeSort(ini, meio);",
    "    mergeSort(meio, fim);",
    "    intercala(ini, meio, fim);",
    "}",
    "",
    "int main(void) {",
    "    mergeSort(0, 8);",
    "    for (int k = 0; k < 8; k++)",
    "        printf(\"%d \", v[k]);",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 36,
      "caption": "O programa começa. O vetor `v` tem 8 números fora de ordem. Vamos pedir para `mergeSort(0, 8)` ordenar tudo.",
      "vars": {},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}]]
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(0, 8)`. Esta parte do vetor tem 8 número(s).",
      "vars": {"ini": 0, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5], "a": 1}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (0 + 8) / 2 = 4. A metade da esquerda vai de 0 a 3 e a da direita de 4 a 7.",
      "vars": {"ini": 0, "meio": 4, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5], "a": 1}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 0, "meio": 4, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5], "a": 1}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(0, 4)`. Esta parte do vetor tem 4 número(s).",
      "vars": {"ini": 0, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1], "a": 1}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (0 + 4) / 2 = 2. A metade da esquerda vai de 0 a 1 e a da direita de 2 a 3.",
      "vars": {"ini": 0, "meio": 2, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1], "a": 1}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 0, "meio": 2, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1], "a": 1}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(0, 2)`. Esta parte do vetor tem 2 número(s).",
      "vars": {"ini": 0, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4], "a": 1}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (0 + 2) / 2 = 1. A metade da esquerda vai de 0 a 0 e a da direita de 1 a 1.",
      "vars": {"ini": 0, "meio": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4], "a": 1}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 0, "meio": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4], "a": 1}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(0, 1)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 0, "fim": 1},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4]}], [{"s": 0, "n": 1, "i": [7], "a": 1}]],
      "stack": "mergeSort(0, 1) ← mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 7. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 0, "fim": 1},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4]}], [{"s": 0, "n": 1, "i": [7], "a": 1}]],
      "stack": "mergeSort(0, 1) ← mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 0, "meio": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4], "a": 1}], [{"s": 0, "n": 1, "i": [7]}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(1, 2)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4]}], [{"s": 0, "n": 1, "i": [7]}, {"s": 1, "n": 1, "i": [4], "a": 1}]],
      "stack": "mergeSort(1, 2) ← mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 4. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4]}], [{"s": 0, "n": 1, "i": [7]}, {"s": 1, "n": 1, "i": [4], "a": 1}]],
      "stack": "mergeSort(1, 2) ← mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 0, "meio": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [7, 4], "a": 1}], [{"s": 0, "n": 1, "i": [7]}, {"s": 1, "n": 1, "i": [4]}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 0, "meio": 1, "fim": 2, "i": 0, "j": 1, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 1, "i": [7]}, {"s": 1, "n": 1, "i": [4]}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 7 (esquerda) com `v[j]` = 4 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 1, "fim": 2, "i": 0, "j": 1, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 1, "i": [[7, "c"]]}, {"s": 1, "n": 1, "i": [[4, "c"]]}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 4 da direita é menor. Copiamos o 4 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 0, "meio": 1, "fim": 2, "i": 0, "j": 1, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 1, "i": [7]}, {"s": 1, "n": 1, "i": [[4, "p"]]}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 7.",
      "vars": {"ini": 0, "meio": 1, "fim": 2, "i": 0, "j": 2, "k": 1},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [4], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 1, "i": [[7, "p"]]}, {"s": 1, "n": 1, "i": []}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 4, 7. Agora copiamos de volta para `v`, nas posições 0 a 1.",
      "vars": {"ini": 0, "meio": 1, "fim": 2, "i": 1, "j": 2, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [7, 4, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [7, 4, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 1, "i": []}, {"s": 1, "n": 1, "i": []}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 0 a 1 agora estão ordenadas: 4, 7. A função volta para quem a chamou.",
      "vars": {"ini": 0, "meio": 1, "fim": 2},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7], "a": 1}]],
      "stack": "mergeSort(0, 2) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 0, "meio": 2, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1], "a": 1}], [{"s": 0, "n": 2, "i": [4, 7]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(2, 4)`. Esta parte do vetor tem 2 número(s).",
      "vars": {"ini": 2, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1], "a": 1}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (2 + 4) / 2 = 3. A metade da esquerda vai de 2 a 2 e a da direita de 3 a 3.",
      "vars": {"ini": 2, "meio": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1], "a": 1}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 2, "meio": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1], "a": 1}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(2, 3)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 2, "fim": 3},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1]}], [{"s": 2, "n": 1, "i": [2], "a": 1}]],
      "stack": "mergeSort(2, 3) ← mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 2. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 2, "fim": 3},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1]}], [{"s": 2, "n": 1, "i": [2], "a": 1}]],
      "stack": "mergeSort(2, 3) ← mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 2, "meio": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1], "a": 1}], [{"s": 2, "n": 1, "i": [2]}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(3, 4)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1]}], [{"s": 2, "n": 1, "i": [2]}, {"s": 3, "n": 1, "i": [1], "a": 1}]],
      "stack": "mergeSort(3, 4) ← mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 1. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1]}], [{"s": 2, "n": 1, "i": [2]}, {"s": 3, "n": 1, "i": [1], "a": 1}]],
      "stack": "mergeSort(3, 4) ← mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 2, "meio": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [2, 1], "a": 1}], [{"s": 2, "n": 1, "i": [2]}, {"s": 3, "n": 1, "i": [1]}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 2, "meio": 3, "fim": 4, "i": 2, "j": 3, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 2, "n": 1, "i": [2]}, {"s": 3, "n": 1, "i": [1]}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 2 (esquerda) com `v[j]` = 1 (direita). O menor vai primeiro.",
      "vars": {"ini": 2, "meio": 3, "fim": 4, "i": 2, "j": 3, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 2, "n": 1, "i": [[2, "c"]]}, {"s": 3, "n": 1, "i": [[1, "c"]]}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 1 da direita é menor. Copiamos o 1 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 2, "meio": 3, "fim": 4, "i": 2, "j": 3, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 2, "n": 1, "i": [2]}, {"s": 3, "n": 1, "i": [[1, "p"]]}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 2.",
      "vars": {"ini": 2, "meio": 3, "fim": 4, "i": 2, "j": 4, "k": 3},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [1], "l": "auxiliar", "a": 1}], [{"s": 2, "n": 1, "i": [[2, "p"]]}, {"s": 3, "n": 1, "i": []}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 1, 2. Agora copiamos de volta para `v`, nas posições 2 a 3.",
      "vars": {"ini": 2, "meio": 3, "fim": 4, "i": 3, "j": 4, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 2, 1, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 2, 1]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [1, 2], "l": "auxiliar", "a": 1}], [{"s": 2, "n": 1, "i": []}, {"s": 3, "n": 1, "i": []}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 2 a 3 agora estão ordenadas: 1, 2. A função volta para quem a chamou.",
      "vars": {"ini": 2, "meio": 3, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 1, 2]}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [1, 2], "a": 1}]],
      "stack": "mergeSort(2, 4) ← mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 0, "meio": 2, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [4, 7, 1, 2], "a": 1}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [1, 2]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 0, "j": 2, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [1, 2]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 4 (esquerda) com `v[j]` = 1 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 0, "j": 2, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [[4, "c"], 7]}, {"s": 2, "n": 2, "i": [[1, "c"], 2]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 1 da direita é menor. Copiamos o 1 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 0, "j": 2, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [[1, "p"], 2]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 4 (esquerda) com `v[j]` = 2 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 0, "j": 3, "k": 1},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [[4, "c"], 7]}, {"s": 2, "n": 2, "i": [[2, "c"]]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 2 da direita é menor. Copiamos o 2 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 0, "j": 3, "k": 1},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [4, 7]}, {"s": 2, "n": 2, "i": [[2, "p"]]}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 4.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 0, "j": 4, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [[4, "p"], 7]}, {"s": 2, "n": 2, "i": []}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 7.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 1, "j": 4, "k": 3},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": [[7, "p"]]}, {"s": 2, "n": 2, "i": []}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 1, 2, 4, 7. Agora copiamos de volta para `v`, nas posições 0 a 3.",
      "vars": {"ini": 0, "meio": 2, "fim": 4, "i": 2, "j": 4, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [4, 7, 1, 2, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 2, "i": []}, {"s": 2, "n": 2, "i": []}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 0 a 3 agora estão ordenadas: 1, 2, 4, 7. A função volta para quem a chamou.",
      "vars": {"ini": 0, "meio": 2, "fim": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7], "a": 1}]],
      "stack": "mergeSort(0, 4) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 0, "meio": 4, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5], "a": 1}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(4, 8)`. Esta parte do vetor tem 4 número(s).",
      "vars": {"ini": 4, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5], "a": 1}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (4 + 8) / 2 = 6. A metade da esquerda vai de 4 a 5 e a da direita de 6 a 7.",
      "vars": {"ini": 4, "meio": 6, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5], "a": 1}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 4, "meio": 6, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5], "a": 1}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(4, 6)`. Esta parte do vetor tem 2 número(s).",
      "vars": {"ini": 4, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3], "a": 1}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (4 + 6) / 2 = 5. A metade da esquerda vai de 4 a 4 e a da direita de 5 a 5.",
      "vars": {"ini": 4, "meio": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3], "a": 1}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 4, "meio": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3], "a": 1}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(4, 5)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 4, "fim": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3]}], [{"s": 4, "n": 1, "i": [8], "a": 1}]],
      "stack": "mergeSort(4, 5) ← mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 8. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 4, "fim": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3]}], [{"s": 4, "n": 1, "i": [8], "a": 1}]],
      "stack": "mergeSort(4, 5) ← mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 4, "meio": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3], "a": 1}], [{"s": 4, "n": 1, "i": [8]}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(5, 6)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3]}], [{"s": 4, "n": 1, "i": [8]}, {"s": 5, "n": 1, "i": [3], "a": 1}]],
      "stack": "mergeSort(5, 6) ← mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 3. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3]}], [{"s": 4, "n": 1, "i": [8]}, {"s": 5, "n": 1, "i": [3], "a": 1}]],
      "stack": "mergeSort(5, 6) ← mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 4, "meio": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [8, 3], "a": 1}], [{"s": 4, "n": 1, "i": [8]}, {"s": 5, "n": 1, "i": [3]}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 4, "meio": 5, "fim": 6, "i": 4, "j": 5, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 1, "i": [8]}, {"s": 5, "n": 1, "i": [3]}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 8 (esquerda) com `v[j]` = 3 (direita). O menor vai primeiro.",
      "vars": {"ini": 4, "meio": 5, "fim": 6, "i": 4, "j": 5, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 1, "i": [[8, "c"]]}, {"s": 5, "n": 1, "i": [[3, "c"]]}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 3 da direita é menor. Copiamos o 3 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 4, "meio": 5, "fim": 6, "i": 4, "j": 5, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 1, "i": [8]}, {"s": 5, "n": 1, "i": [[3, "p"]]}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 8.",
      "vars": {"ini": 4, "meio": 5, "fim": 6, "i": 4, "j": 6, "k": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [3], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 1, "i": [[8, "p"]]}, {"s": 5, "n": 1, "i": []}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 3, 8. Agora copiamos de volta para `v`, nas posições 4 a 5.",
      "vars": {"ini": 4, "meio": 5, "fim": 6, "i": 5, "j": 6, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 8, 3, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [8, 3, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 1, "i": []}, {"s": 5, "n": 1, "i": []}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 4 a 5 agora estão ordenadas: 3, 8. A função volta para quem a chamou.",
      "vars": {"ini": 4, "meio": 5, "fim": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8], "a": 1}]],
      "stack": "mergeSort(4, 6) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 4, "meio": 6, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5], "a": 1}], [{"s": 4, "n": 2, "i": [3, 8]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(6, 8)`. Esta parte do vetor tem 2 número(s).",
      "vars": {"ini": 6, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5], "a": 1}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 29,
      "caption": "Achamos o meio: (6 + 8) / 2 = 7. A metade da esquerda vai de 6 a 6 e a da direita de 7 a 7.",
      "vars": {"ini": 6, "meio": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5], "a": 1}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 30,
      "caption": "Primeiro, mandamos ordenar a metade da esquerda.",
      "vars": {"ini": 6, "meio": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5], "a": 1}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(6, 7)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 6, "fim": 7},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5]}], [{"s": 6, "n": 1, "i": [6], "a": 1}]],
      "stack": "mergeSort(6, 7) ← mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 6. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 6, "fim": 7},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5]}], [{"s": 6, "n": 1, "i": [6], "a": 1}]],
      "stack": "mergeSort(6, 7) ← mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 31,
      "caption": "A esquerda já ficou ordenada. Agora mandamos ordenar a metade da direita.",
      "vars": {"ini": 6, "meio": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5], "a": 1}], [{"s": 6, "n": 1, "i": [6]}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 26,
      "caption": "Entramos em `mergeSort(7, 8)`. Esta parte do vetor tem 1 número(s).",
      "vars": {"ini": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5]}], [{"s": 6, "n": 1, "i": [6]}, {"s": 7, "n": 1, "i": [5], "a": 1}]],
      "stack": "mergeSort(7, 8) ← mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 27,
      "caption": "Só há 1 número aqui: o 5. Um número sozinho já está ordenado, então a função volta sem fazer nada.",
      "vars": {"ini": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5]}], [{"s": 6, "n": 1, "i": [6]}, {"s": 7, "n": 1, "i": [5], "a": 1}]],
      "stack": "mergeSort(7, 8) ← mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 6, "meio": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [6, 5], "a": 1}], [{"s": 6, "n": 1, "i": [6]}, {"s": 7, "n": 1, "i": [5]}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 6, "meio": 7, "fim": 8, "i": 6, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 6, "n": 1, "i": [6]}, {"s": 7, "n": 1, "i": [5]}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 6 (esquerda) com `v[j]` = 5 (direita). O menor vai primeiro.",
      "vars": {"ini": 6, "meio": 7, "fim": 8, "i": 6, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 6, "n": 1, "i": [[6, "c"]]}, {"s": 7, "n": 1, "i": [[5, "c"]]}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 5 da direita é menor. Copiamos o 5 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 6, "meio": 7, "fim": 8, "i": 6, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [], "l": "auxiliar", "a": 1}], [{"s": 6, "n": 1, "i": [6]}, {"s": 7, "n": 1, "i": [[5, "p"]]}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 6.",
      "vars": {"ini": 6, "meio": 7, "fim": 8, "i": 6, "j": 8, "k": 7},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [5], "l": "auxiliar", "a": 1}], [{"s": 6, "n": 1, "i": [[6, "p"]]}, {"s": 7, "n": 1, "i": []}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 5, 6. Agora copiamos de volta para `v`, nas posições 6 a 7.",
      "vars": {"ini": 6, "meio": 7, "fim": 8, "i": 7, "j": 8, "k": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 6, 5]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 6, 5]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [5, 6], "l": "auxiliar", "a": 1}], [{"s": 6, "n": 1, "i": []}, {"s": 7, "n": 1, "i": []}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 6 a 7 agora estão ordenadas: 5, 6. A função volta para quem a chamou.",
      "vars": {"ini": 6, "meio": 7, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 5, 6]}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [5, 6], "a": 1}]],
      "stack": "mergeSort(6, 8) ← mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 4, "meio": 6, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 8, 5, 6], "a": 1}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [5, 6]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 4, "j": 6, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [3, 8]}, {"s": 6, "n": 2, "i": [5, 6]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 3 (esquerda) com `v[j]` = 5 (direita). O menor vai primeiro.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 4, "j": 6, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [[3, "c"], 8]}, {"s": 6, "n": 2, "i": [[5, "c"], 6]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 10,
      "caption": "O 3 da esquerda é menor ou igual. Copiamos o 3 para o auxiliar e andamos `i` uma casa.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 4, "j": 6, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [[3, "p"], 8]}, {"s": 6, "n": 2, "i": [5, 6]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 8 (esquerda) com `v[j]` = 5 (direita). O menor vai primeiro.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 5, "j": 6, "k": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [[8, "c"]]}, {"s": 6, "n": 2, "i": [[5, "c"], 6]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 5 da direita é menor. Copiamos o 5 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 5, "j": 6, "k": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [8]}, {"s": 6, "n": 2, "i": [[5, "p"], 6]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 8 (esquerda) com `v[j]` = 6 (direita). O menor vai primeiro.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 5, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [[8, "c"]]}, {"s": 6, "n": 2, "i": [[6, "c"]]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 6 da direita é menor. Copiamos o 6 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 5, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [8]}, {"s": 6, "n": 2, "i": [[6, "p"]]}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 16,
      "caption": "A direita acabou. O que sobrou na esquerda já está em ordem, então copiamos o 8.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 5, "j": 8, "k": 7},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": [[8, "p"]]}, {"s": 6, "n": 2, "i": []}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 3, 5, 6, 8. Agora copiamos de volta para `v`, nas posições 4 a 7.",
      "vars": {"ini": 4, "meio": 6, "fim": 8, "i": 6, "j": 8, "k": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 8, 5, 6]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6, 8], "l": "auxiliar", "a": 1}], [{"s": 4, "n": 2, "i": []}, {"s": 6, "n": 2, "i": []}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 4 a 7 agora estão ordenadas: 3, 5, 6, 8. A função volta para quem a chamou.",
      "vars": {"ini": 4, "meio": 6, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 5, 6, 8]}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6, 8], "a": 1}]],
      "stack": "mergeSort(4, 8) ← mergeSort(0, 8)"
    },
    {
      "line": 32,
      "caption": "As duas metades já estão ordenadas. Falta juntá-las em uma só, mantendo a ordem. Isso se chama intercalar.",
      "vars": {"ini": 0, "meio": 4, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 4, 7, 3, 5, 6, 8], "a": 1}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 8,
      "caption": "Começa a intercalação. `i` aponta para o primeiro da esquerda, `j` para o primeiro da direita e `k` para onde vamos escrever no vetor auxiliar.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 0, "j": 4, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [1, 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 1 (esquerda) com `v[j]` = 3 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 0, "j": 4, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[1, "c"], 2, 4, 7]}, {"s": 4, "n": 4, "i": [[3, "c"], 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 10,
      "caption": "O 1 da esquerda é menor ou igual. Copiamos o 1 para o auxiliar e andamos `i` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 0, "j": 4, "k": 0},
      "rows": [[{"s": 0, "n": 8, "i": [], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[1, "p"], 2, 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 2 (esquerda) com `v[j]` = 3 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 1, "j": 4, "k": 1},
      "rows": [[{"s": 0, "n": 8, "i": [1], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[2, "c"], 4, 7]}, {"s": 4, "n": 4, "i": [[3, "c"], 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 10,
      "caption": "O 2 da esquerda é menor ou igual. Copiamos o 2 para o auxiliar e andamos `i` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 1, "j": 4, "k": 1},
      "rows": [[{"s": 0, "n": 8, "i": [1], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[2, "p"], 4, 7]}, {"s": 4, "n": 4, "i": [3, 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 4 (esquerda) com `v[j]` = 3 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 2, "j": 4, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[4, "c"], 7]}, {"s": 4, "n": 4, "i": [[3, "c"], 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 3 da direita é menor. Copiamos o 3 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 2, "j": 4, "k": 2},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [4, 7]}, {"s": 4, "n": 4, "i": [[3, "p"], 5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 4 (esquerda) com `v[j]` = 5 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 2, "j": 5, "k": 3},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[4, "c"], 7]}, {"s": 4, "n": 4, "i": [[5, "c"], 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 10,
      "caption": "O 4 da esquerda é menor ou igual. Copiamos o 4 para o auxiliar e andamos `i` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 2, "j": 5, "k": 3},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[4, "p"], 7]}, {"s": 4, "n": 4, "i": [5, 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 7 (esquerda) com `v[j]` = 5 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 3, "j": 5, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[7, "c"]]}, {"s": 4, "n": 4, "i": [[5, "c"], 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 5 da direita é menor. Copiamos o 5 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 3, "j": 5, "k": 4},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [7]}, {"s": 4, "n": 4, "i": [[5, "p"], 6, 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 7 (esquerda) com `v[j]` = 6 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 3, "j": 6, "k": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[7, "c"]]}, {"s": 4, "n": 4, "i": [[6, "c"], 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 12,
      "caption": "O 6 da direita é menor. Copiamos o 6 para o auxiliar e andamos `j` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 3, "j": 6, "k": 5},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [7]}, {"s": 4, "n": 4, "i": [[6, "p"], 8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 9,
      "caption": "Comparamos `v[i]` = 7 (esquerda) com `v[j]` = 8 (direita). O menor vai primeiro.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 3, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5, 6], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[7, "c"]]}, {"s": 4, "n": 4, "i": [[8, "c"]]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 10,
      "caption": "O 7 da esquerda é menor ou igual. Copiamos o 7 para o auxiliar e andamos `i` uma casa.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 3, "j": 7, "k": 6},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5, 6], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": [[7, "p"]]}, {"s": 4, "n": 4, "i": [8]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 19,
      "caption": "A esquerda acabou. O que sobrou na direita já está em ordem, então copiamos o 8.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 4, "j": 7, "k": 7},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5, 6, 7], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": []}, {"s": 4, "n": 4, "i": [[8, "p"]]}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 21,
      "caption": "Tudo foi para o auxiliar: 1, 2, 3, 4, 5, 6, 7, 8. Agora copiamos de volta para `v`, nas posições 0 a 7.",
      "vars": {"ini": 0, "meio": 4, "fim": 8, "i": 4, "j": 8, "k": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "auxiliar", "a": 1}], [{"s": 0, "n": 4, "i": []}, {"s": 4, "n": 4, "i": []}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 33,
      "caption": "Pronto! As posições 0 a 7 agora estão ordenadas: 1, 2, 3, 4, 5, 6, 7, 8. A função volta para quem a chamou.",
      "vars": {"ini": 0, "meio": 4, "fim": 8},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5, 6, 7, 8], "a": 1}]],
      "stack": "mergeSort(0, 8)"
    },
    {
      "line": 37,
      "caption": "`mergeSort` terminou e o vetor inteiro está ordenado: 1, 2, 3, 4, 5, 6, 7, 8.",
      "vars": {},
      "rows": [[{"s": 0, "n": 8, "i": [1, 2, 3, 4, 5, 6, 7, 8]}]]
    }
  ]
}
```

### Mergesort externo, com arquivos de verdade

Agora o mergesort externo. Para caber na tela, a memória aqui guarda só 6 números (n = 6, que no código aparece como a constante N) e o arquivo tem 9. Na vida real o n é bem maior, mas a ideia é a mesma.

Repare nas duas fases. Primeiro criamos arquivos pequenos e ordenados. Depois juntamos todos, usando só um pedacinho de cada um.

```codigo
{
  "title": "Merge sort externo passo a passo",
  "code": [
    "#include <stdio.h>",
    "#include <stdlib.h>",
    "",
    "#define N 6                         /* n: registros que cabem na memória (bem pequeno, só para a animação) */",
    "",
    "typedef struct {                    /* buffer de entrada de um arquivo ordenado */",
    "    FILE *f;",
    "    int  *dados;",
    "    int   pos, max;                 /* posição atual e quantidade de valores válidos */",
    "} Entrada;",
    "",
    "static int compara(const void *a, const void *b) {",
    "    int x = *(const int *)a, y = *(const int *)b;",
    "    return (x > y) - (x < y);",
    "}",
    "",
    "static void salva(const char *nome, const int *v, int tam) {",
    "    FILE *f = fopen(nome, \"a\");",
    "    for (int i = 0; i < tam; i++) fprintf(f, \"%d\\n\", v[i]);",
    "    fclose(f);",
    "}",
    "",
    "/* Fase 1: gera os k arquivos ordenados Temp1.txt, Temp2.txt, ... */",
    "static int criaArquivosOrdenados(const char *nome) {",
    "    int v[N], total = 0, k = 0;",
    "    char tmp[32];",
    "    FILE *f = fopen(nome, \"r\");",
    "    while (fscanf(f, \"%d\", &v[total]) == 1) {",
    "        if (++total == N) {                       /* memória cheia */",
    "            sprintf(tmp, \"Temp%d.txt\", ++k);",
    "            qsort(v, total, sizeof(int), compara);",
    "            salva(tmp, v, total);",
    "            total = 0;",
    "        }",
    "    }",
    "    if (total > 0) {                              /* sobrou um pedaço */",
    "        sprintf(tmp, \"Temp%d.txt\", ++k);",
    "        qsort(v, total, sizeof(int), compara);",
    "        salva(tmp, v, total);",
    "    }",
    "    fclose(f);",
    "    return k;",
    "}",
    "",
    "static void preencheBuffer(Entrada *e, int b) {",
    "    if (e->f == NULL) return;",
    "    e->pos = e->max = 0;",
    "    while (e->max < b && fscanf(e->f, \"%d\", &e->dados[e->max]) == 1) e->max++;",
    "    if (e->max < b) { fclose(e->f); e->f = NULL; }   /* acabou o arquivo */",
    "}",
    "",
    "/* Procura o menor valor entre as \"cabeças\" dos k buffers: custo O(k) */",
    "static int procuraMenor(Entrada *e, int k, int b, int *menor) {",
    "    int idx = -1;",
    "    for (int i = 0; i < k; i++)",
    "        if (e[i].pos < e[i].max &&",
    "            (idx == -1 || e[i].dados[e[i].pos] < e[idx].dados[e[idx].pos]))",
    "            idx = i;",
    "    if (idx == -1) return 0;                      /* todos os buffers vazios */",
    "    *menor = e[idx].dados[e[idx].pos++];",
    "    if (e[idx].pos == e[idx].max) preencheBuffer(&e[idx], b);",
    "    return 1;",
    "}",
    "",
    "/* Fase 2: intercala os k arquivos de uma só vez, com k+1 buffers de tamanho b */",
    "static void merge(const char *saida, int k, int b) {",
    "    Entrada *e = malloc(k * sizeof(Entrada));",
    "    int *buf = malloc(b * sizeof(int)), qtd = 0, menor;",
    "    char tmp[32];",
    "    for (int i = 0; i < k; i++) {",
    "        sprintf(tmp, \"Temp%d.txt\", i + 1);",
    "        e[i].f = fopen(tmp, \"r\");",
    "        e[i].dados = malloc(b * sizeof(int));",
    "        preencheBuffer(&e[i], b);",
    "    }",
    "    while (procuraMenor(e, k, b, &menor)) {",
    "        buf[qtd++] = menor;",
    "        if (qtd == b) {                           /* saída cheia */",
    "            salva(saida, buf, b);",
    "            qtd = 0;",
    "        }",
    "    }",
    "    if (qtd > 0) {",
    "        salva(saida, buf, qtd);",
    "    }",
    "    for (int i = 0; i < k; i++) free(e[i].dados);",
    "    free(e); free(buf);",
    "}",
    "",
    "void mergeSortExterno(const char *nome, const char *saida) {",
    "    int k = criaArquivosOrdenados(nome);",
    "    int b = N / (k + 1);                          /* tamanho de cada buffer */",
    "    char tmp[32];",
    "    if (b < 1) b = 1;",
    "    remove(saida);",
    "    merge(saida, k, b);",
    "    for (int i = 1; i <= k; i++) { sprintf(tmp, \"Temp%d.txt\", i); remove(tmp); }",
    "}",
    "",
    "int main(void) {",
    "    mergeSortExterno(\"dados.txt\", \"saida.txt\");",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 91,
      "caption": "Vamos ordenar o arquivo `dados.txt`, que tem 9 números. Só que a memória guarda 6 de cada vez. Então a fase 1 vai criar arquivos menores, já ordenados.",
      "vars": {},
      "rows": [[{"s": 0, "n": 9, "i": [7, 3, 9, 1, 8, 5, 2, 6, 4], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [], "l": "memória: vetor v (cabem 6)"}]],
      "stack": "mergeSortExterno"
    },
    {
      "line": 28,
      "caption": "Abrimos o arquivo e começamos a ler os números para a memória (o vetor `v`) até encher: 6 números.",
      "vars": {},
      "rows": [[{"s": 0, "n": 9, "i": [7, 3, 9, 1, 8, 5, 2, 6, 4], "l": "dados.txt (ainda não lido)", "a": 1}], [{"s": 0, "n": 6, "i": [], "l": "memória: vetor v (cabem 6)"}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 30,
      "caption": "A memória encheu: temos 6 números em `v`. Escolhemos o nome do arquivo temporário: `Temp1.txt`.",
      "vars": {"total": 6, "k": 0, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [2, 6, 4], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [7, 3, 9, 1, 8, 5], "l": "memória: vetor v (cabem 6)", "a": 1}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 31,
      "caption": "Ordenamos na memória 6 números com `qsort`.",
      "vars": {"total": 6, "k": 1, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [2, 6, 4], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [7, 3, 9, 1, 8, 5], "l": "memória: vetor v (cabem 6)", "a": 1}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 32,
      "caption": "Agora 6 números estão em ordem. Gravamos todos em `Temp1.txt`. Depois disso a memória fica livre para a próxima leva.",
      "vars": {"total": 6, "k": 1, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [2, 6, 4], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [[1, "p"], [3, "p"], [5, "p"], [7, "p"], [8, "p"], [9, "p"]], "l": "memória: vetor v (cabem 6)", "a": 1}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 37,
      "caption": "O arquivo de entrada acabou, mas sobraram 3 números na memória. Eles também viram um arquivo.",
      "vars": {"total": 3, "k": 1, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [2, 6, 4], "l": "memória: vetor v (cabem 6)", "a": 1}], [{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt"}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 38,
      "caption": "Ordenamos 3 números que sobraram.",
      "vars": {"total": 3, "k": 2, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [2, 6, 4], "l": "memória: vetor v (cabem 6)", "a": 1}], [{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt"}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 39,
      "caption": "Gravamos 3 números em ordem no arquivo `Temp2.txt`.",
      "vars": {"total": 3, "k": 2, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [[2, "p"], [4, "p"], [6, "p"]], "l": "memória: vetor v (cabem 6)", "a": 1}], [{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt"}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 42,
      "caption": "Fim da fase 1. Criamos 2 arquivos temporários e cada um deles já está ordenado. Falta juntar todos em um só.",
      "vars": {"k": 2, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [], "l": "memória: vetor v (cabem 6)"}], [{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt", "a": 1}, {"s": 6, "n": 3, "i": [2, 4, 6], "l": "Temp2.txt", "a": 1}]],
      "stack": "criaArquivosOrdenados ← mergeSortExterno"
    },
    {
      "line": 92,
      "caption": "Agora calculamos o tamanho de cada buffer: b = N / (k + 1) = 6 / (2 + 1) = 2. Usamos k + 1 buffers: 2 de entrada (um por arquivo) e 1 de saída.",
      "vars": {"k": 2, "b": 2, "N": 6},
      "rows": [[{"s": 0, "n": 9, "i": [], "l": "dados.txt (ainda não lido)"}], [{"s": 0, "n": 6, "i": [], "l": "memória: vetor v (cabem 6)"}], [{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [2, 4, 6], "l": "Temp2.txt"}]],
      "stack": "mergeSortExterno"
    },
    {
      "line": 96,
      "caption": "Fase 2: vamos juntar os 2 arquivos em `saida.txt`. Em vez de ler tudo, olhamos só 2 números de cada arquivo por vez.",
      "vars": {"k": 2, "b": 2},
      "rows": [[{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt", "a": 1}, {"s": 6, "n": 3, "i": [2, 4, 6], "l": "Temp2.txt", "a": 1}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "mergeSortExterno"
    },
    {
      "line": 70,
      "caption": "Reservamos memória para os buffers de entrada (um para cada arquivo) e para o buffer de saída.",
      "vars": {"k": 2, "b": 2},
      "rows": [[{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [2, 4, 6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 49,
      "caption": "Carregamos 2 números de `Temp1.txt` para o buffer de entrada 1.",
      "vars": {"b": 2, "idx": 0, "max": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt", "a": 1}, {"s": 6, "n": 3, "i": [2, 4, 6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [1, 3], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "preencheBuffer ← merge ← mergeSortExterno"
    },
    {
      "line": 49,
      "caption": "Carregamos 2 números de `Temp2.txt` para o buffer de entrada 2.",
      "vars": {"b": 2, "idx": 1, "max": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt", "a": 1}], [{"s": 0, "n": 6, "i": [1, 3], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [2, 4], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "preencheBuffer ← merge ← mergeSortExterno"
    },
    {
      "line": 76,
      "caption": "Começa o laço principal: enquanto existir algum número, procuramos o menor deles.",
      "vars": {"k": 2, "b": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [1, 3], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [2, 4], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 1 e 2. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[1, "c"], 3], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[2, "c"], 4], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 1, que está no buffer 1. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[1, "p"], 3], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[2, "c"], 4], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 1 no buffer de saída.",
      "vars": {"qtd": 0, "menor": 1},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [3], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [2, 4], "l": "buffer de entrada 2"}], [{"i": [[1, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 3 e 2. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[3, "c"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[2, "c"], 4], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 2, que está no buffer 2. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 1},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[3, "c"]], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [[2, "p"], 4], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 2 no buffer de saída.",
      "vars": {"qtd": 1, "menor": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [3], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [4], "l": "buffer de entrada 2"}], [{"i": [[2, "p"]], "l": "menor"}, {"i": [1], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 79,
      "caption": "O buffer de saída encheu (2 números). Gravamos tudo no fim de `saida.txt` e esvaziamos o buffer.",
      "vars": {"qtd": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [3], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [4], "l": "buffer de entrada 2"}], [{"i": [1, 2], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [], "l": "saida.txt", "a": 1}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 3 e 4. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[3, "c"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[4, "c"]], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 3, que está no buffer 1. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[3, "p"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[4, "c"]], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 61,
      "caption": "O buffer 1 ficou vazio. Precisamos reabastecê-lo com mais números do arquivo.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [4], "l": "buffer de entrada 2"}], [{"i": [[3, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 49,
      "caption": "Buscamos mais 2 números de `Temp1.txt` para o buffer 1.",
      "vars": {"b": 2, "idx": 0, "max": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt", "a": 1}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [5, 7], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [4], "l": "buffer de entrada 2"}], [{"i": [[3, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "preencheBuffer ← procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 3 no buffer de saída.",
      "vars": {"qtd": 0, "menor": 3},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [5, 7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [4], "l": "buffer de entrada 2"}], [{"i": [[3, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 5 e 4. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[5, "c"], 7], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[4, "c"]], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 4, que está no buffer 2. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 1},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[5, "c"], 7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [[4, "p"]], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 61,
      "caption": "O buffer 2 ficou vazio. Precisamos reabastecê-lo com mais números do arquivo.",
      "vars": {"idx": 1},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [6], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [5, 7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2", "a": 1}], [{"i": [[4, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 49,
      "caption": "Só restavam 1 número em `Temp2.txt`. Carregamos esses e o arquivo termina.",
      "vars": {"b": 2, "idx": 1, "max": 1},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt", "a": 1}], [{"s": 0, "n": 6, "i": [5, 7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [6], "l": "buffer de entrada 2", "a": 1}], [{"i": [[4, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "preencheBuffer ← procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 4 no buffer de saída.",
      "vars": {"qtd": 1, "menor": 4},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [5, 7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [6], "l": "buffer de entrada 2"}], [{"i": [[4, "p"]], "l": "menor"}, {"i": [3], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 79,
      "caption": "O buffer de saída encheu (2 números). Gravamos tudo no fim de `saida.txt` e esvaziamos o buffer.",
      "vars": {"qtd": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [5, 7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [6], "l": "buffer de entrada 2"}], [{"i": [3, 4], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2], "l": "saida.txt", "a": 1}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 5 e 6. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[5, "c"], 7], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[6, "c"]], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 5, que está no buffer 1. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[5, "p"], 7], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[6, "c"]], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 5 no buffer de saída.",
      "vars": {"qtd": 0, "menor": 5},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [6], "l": "buffer de entrada 2"}], [{"i": [[5, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 7 e 6. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[7, "c"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [[6, "c"]], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 6, que está no buffer 2. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 1},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[7, "c"]], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [[6, "p"]], "l": "buffer de entrada 2", "a": 1}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 61,
      "caption": "O buffer 2 ficou vazio. Precisamos reabastecê-lo com mais números do arquivo.",
      "vars": {"idx": 1},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2", "a": 1}], [{"i": [[6, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 6 no buffer de saída.",
      "vars": {"qtd": 1, "menor": 6},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[6, "p"]], "l": "menor"}, {"i": [5], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 79,
      "caption": "O buffer de saída encheu (2 números). Gravamos tudo no fim de `saida.txt` e esvaziamos o buffer.",
      "vars": {"qtd": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [7], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [5, 6], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4], "l": "saida.txt", "a": 1}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 7. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[7, "c"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 7, que está no buffer 1. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[7, "p"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 61,
      "caption": "O buffer 1 ficou vazio. Precisamos reabastecê-lo com mais números do arquivo.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[7, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 49,
      "caption": "Buscamos mais 2 números de `Temp1.txt` para o buffer 1.",
      "vars": {"b": 2, "idx": 0, "max": 2},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [8, 9], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[7, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "preencheBuffer ← procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 7 no buffer de saída.",
      "vars": {"qtd": 0, "menor": 7},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [8, 9], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[7, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 8. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[8, "c"], 9], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 8, que está no buffer 1. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[8, "p"], 9], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 8 no buffer de saída.",
      "vars": {"qtd": 1, "menor": 8},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [9], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[8, "p"]], "l": "menor"}, {"i": [7], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 79,
      "caption": "O buffer de saída encheu (2 números). Gravamos tudo no fim de `saida.txt` e esvaziamos o buffer.",
      "vars": {"qtd": 2},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [9], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [7, 8], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6], "l": "saida.txt", "a": 1}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Olhamos o primeiro número (a \"cabeça\") de cada buffer: 9. O menor deles será o próximo da saída.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[9, "c"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 60,
      "caption": "O menor é o 9, que está no buffer 1. Pegamos esse número e avançamos uma posição naquele buffer.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [[9, "p"]], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 61,
      "caption": "O buffer 1 ficou vazio. Precisamos reabastecê-lo com mais números do arquivo.",
      "vars": {"idx": 0},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[9, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 49,
      "caption": "O `Temp1.txt` acabou: não há mais números para carregar. Ele sai da disputa.",
      "vars": {"b": 2, "idx": 0, "max": 0},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1", "a": 1}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[9, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt"}]],
      "stack": "preencheBuffer ← procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 77,
      "caption": "Colocamos o 9 no buffer de saída.",
      "vars": {"qtd": 0, "menor": 9},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [[9, "p"]], "l": "menor"}, {"i": [], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt"}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 55,
      "caption": "Todos os buffers estão vazios e os arquivos acabaram. Não há mais números: a função devolve 0 e o laço termina.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt"}]],
      "stack": "procuraMenor ← merge ← mergeSortExterno"
    },
    {
      "line": 84,
      "caption": "O que sobrou no buffer de saída (1 número) também vai para `saida.txt`.",
      "vars": {"qtd": 1},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [9], "l": "buffer de saída", "a": 1}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8], "l": "saida.txt", "a": 1}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 86,
      "caption": "Pronto: `saida.txt` tem todos os números em ordem: 1, 2, 3, 4, 5, 6, 7, 8, 9. Falta só liberar a memória.",
      "vars": {},
      "rows": [[{"s": 0, "n": 6, "i": [], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [], "l": "Temp2.txt"}], [{"s": 0, "n": 6, "i": [], "l": "buffer de entrada 1"}, {"s": 6, "n": 3, "i": [], "l": "buffer de entrada 2"}], [{"i": [], "l": "buffer de saída"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8, 9], "l": "saida.txt", "a": 1}]],
      "stack": "merge ← mergeSortExterno"
    },
    {
      "line": 97,
      "caption": "Os arquivos temporários não são mais necessários, então vamos apagá-los.",
      "vars": {"k": 2},
      "rows": [[{"s": 0, "n": 6, "i": [1, 3, 5, 7, 8, 9], "l": "Temp1.txt"}, {"s": 6, "n": 3, "i": [2, 4, 6], "l": "Temp2.txt"}], [{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8, 9], "l": "saida.txt", "a": 1}]],
      "stack": "mergeSortExterno"
    },
    {
      "line": 98,
      "caption": "Terminou! Só ficou `saida.txt`, com os 9 números ordenados: 1, 2, 3, 4, 5, 6, 7, 8, 9.",
      "vars": {},
      "rows": [[{"s": 0, "n": 9, "i": [1, 2, 3, 4, 5, 6, 7, 8, 9], "l": "saida.txt", "a": 1}]],
      "stack": "mergeSortExterno"
    }
  ]
}
```

### O programa completo, com N = 100

O programa abaixo é o mesmo, mas com `N = 100`. Ele já está pronto para ordenar um arquivo de verdade.

```c
#include <stdio.h>
#include <stdlib.h>

#define N 100                       /* n: registros que cabem na memória */

typedef struct {                    /* buffer de entrada de um arquivo ordenado */
    FILE *f;
    int  *dados;
    int   pos, max;                 /* posição atual e quantidade de valores válidos */
} Entrada;

static int compara(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

static void salva(const char *nome, const int *v, int tam) {
    FILE *f = fopen(nome, "a");
    for (int i = 0; i < tam; i++) fprintf(f, "%d\n", v[i]);
    fclose(f);
}

/* Fase 1: gera os k arquivos ordenados Temp1.txt, Temp2.txt, ... */
static int criaArquivosOrdenados(const char *nome) {
    int v[N], total = 0, k = 0;
    char tmp[32];
    FILE *f = fopen(nome, "r");
    while (fscanf(f, "%d", &v[total]) == 1) {
        if (++total == N) {                       /* memória cheia */
            sprintf(tmp, "Temp%d.txt", ++k);
            qsort(v, total, sizeof(int), compara);
            salva(tmp, v, total);
            total = 0;
        }
    }
    if (total > 0) {                              /* sobrou um pedaço */
        sprintf(tmp, "Temp%d.txt", ++k);
        qsort(v, total, sizeof(int), compara);
        salva(tmp, v, total);
    }
    fclose(f);
    return k;
}

static void preencheBuffer(Entrada *e, int b) {
    if (e->f == NULL) return;
    e->pos = e->max = 0;
    while (e->max < b && fscanf(e->f, "%d", &e->dados[e->max]) == 1) e->max++;
    if (e->max < b) { fclose(e->f); e->f = NULL; }   /* acabou o arquivo */
}

/* Procura o menor valor entre as "cabeças" dos k buffers: custo O(k) */
static int procuraMenor(Entrada *e, int k, int b, int *menor) {
    int idx = -1;
    for (int i = 0; i < k; i++)
        if (e[i].pos < e[i].max &&
            (idx == -1 || e[i].dados[e[i].pos] < e[idx].dados[e[idx].pos]))
            idx = i;
    if (idx == -1) return 0;                      /* todos os buffers vazios */
    *menor = e[idx].dados[e[idx].pos++];
    if (e[idx].pos == e[idx].max) preencheBuffer(&e[idx], b);
    return 1;
}

/* Fase 2: intercala os k arquivos de uma só vez, com k+1 buffers de tamanho b */
static void merge(const char *saida, int k, int b) {
    Entrada *e = malloc(k * sizeof(Entrada));
    int *buf = malloc(b * sizeof(int)), qtd = 0, menor;
    char tmp[32];
    for (int i = 0; i < k; i++) {
        sprintf(tmp, "Temp%d.txt", i + 1);
        e[i].f = fopen(tmp, "r");
        e[i].dados = malloc(b * sizeof(int));
        preencheBuffer(&e[i], b);
    }
    while (procuraMenor(e, k, b, &menor)) {
        buf[qtd++] = menor;
        if (qtd == b) { salva(saida, buf, b); qtd = 0; }   /* saída cheia */
    }
    if (qtd > 0) salva(saida, buf, qtd);
    for (int i = 0; i < k; i++) free(e[i].dados);
    free(e); free(buf);
}

void mergeSortExterno(const char *nome, const char *saida) {
    int k = criaArquivosOrdenados(nome);
    int b = N / (k + 1);                          /* tamanho de cada buffer */
    char tmp[32];
    if (b < 1) b = 1;
    remove(saida);
    merge(saida, k, b);
    for (int i = 1; i <= k; i++) { sprintf(tmp, "Temp%d.txt", i); remove(tmp); }
}
```

A função `main` só chama `mergeSortExterno`:

```c
int main(void) {
    FILE *f = fopen("dados.txt", "w");           /* gera 1000 números aleatórios */
    for (int i = 0; i < 1000; i++) fprintf(f, "%d\n", rand() % 5000);
    fclose(f);
    mergeSortExterno("dados.txt", "ordenado.txt");
    return 0;
}
```

## Teste rápido

```quiz
{
  "question": "Um arquivo muito maior que a memória precisa ser ordenado. Qual é o primeiro passo do mergesort externo?",
  "options": [
    { "text": "Intercalar todos os arquivos de uma vez", "correct": false },
    { "text": "Ler partes que cabem na memória, ordená-las lá e gravar cada uma em um arquivo separado", "correct": true },
    { "text": "Carregar o arquivo inteiro na memória virtual", "correct": false }
  ],
  "correctFeedback": "✅ Correto! A fase 1 gera os arquivos ordenados, e só depois eles são intercalados.",
  "incorrectFeedback": "❌ Ainda não. Antes de intercalar é preciso ter sequências ordenadas. Elas são geradas ordenando, na memória, partes do arquivo que cabem nela."
}
```

```quiz
{
  "question": "Na fase 2 do mergesort externo existem k = 9 arquivos ordenados e a memória comporta n = 1000 registros. Qual o tamanho b de cada um dos k + 1 buffers?",
  "options": [
    { "text": "100 registros", "correct": true },
    { "text": "111 registros", "correct": false },
    { "text": "1000 registros", "correct": false }
  ],
  "correctFeedback": "✅ Correto! São k + 1 = 10 buffers (9 de entrada e 1 de saída), então b = 1000 / 10 = 100.",
  "incorrectFeedback": "❌ Ainda não. A memória é dividida entre k + 1 buffers: 9 de entrada e 1 de saída. Logo b = n / (k + 1) = 1000 / 10."
}
```


