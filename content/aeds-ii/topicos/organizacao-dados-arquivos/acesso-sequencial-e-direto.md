## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar como funciona a busca sequencial e quando ela é razoável.
- Explicar o acesso direto e calcular o byte offset a partir do RRN.
- Comparar as organizações sequencial, ordenada, indexada e por hash.
- Comparar o custo, em acessos ao disco, de cada forma de acesso.

## Conexão com a Trilha

Já sabemos como o disco entrega blocos e como os registros são agrupados neles. A pergunta agora é: como achar um registro? Comparamos a busca sequencial, o acesso direto e as organizações indexada e por hash, sempre contando acessos ao disco.

### Acesso sequencial e acesso direto

- No acesso **sequencial**, você percorre os registros do primeiro ao último, na ordem em que estão no arquivo.
- No acesso **direto** (ou randômico), você calcula ou consulta a posição e vai direto ao registro, sem passar pelos anteriores.

Pense num livro. Ler do começo até achar a página é acesso sequencial. Abrir direto na página 150 é acesso direto.

A **busca sequencial** lê registro por registro até achar a chave. Ela custa O(n). É fácil de programar e exige uma estrutura de arquivo simples. Seu uso é **razoável** quando:

- o arquivo tem poucos registros (da ordem de 10);
- o arquivo é pouco consultado, por exemplo porque fica guardado em fita;
- procuramos um trecho de texto em um arquivo ASCII;
- procuramos por uma chave secundária para a qual esperamos muitos registros.

No **acesso direto**, fazemos um *seek* direto para o início do registro (ou do setor que o contém) e lemos o registro na hora. O custo é O(1): um único acesso traz o registro, não importa o tamanho do arquivo.

Mas é preciso saber onde o registro começa. Essa posição pode estar em um **arquivo de índice**, separado. Ou pode ser calculada a partir do **RRN** (*relative record number*), a posição relativa do registro, contada a partir de 0. Quando todos os registros têm o mesmo tamanho:

`byte offset = RRN × tamanho do registro`

Se o arquivo começa com um cabeçalho, soma-se o tamanho do cabeçalho. Atenção: essa conta supõe registros colados um no outro. Se houver sobra no fim de cada bloco (organização não espalhada), a conta muda, como a demonstração mostra.

Esses dois modos são detalhados no tópico "Acesso sequencial e randômico".

### Principais formas de organizar um arquivo

| Organização | Ideia | Pesquisa por chave | Veremos em |
|---|---|---|---|
| Sequencial (heap) | Registros um depois do outro, na ordem de chegada | Percorre tudo | Este tópico |
| Sequencial ordenada | Registros ordenados pela chave | Pode usar busca binária | Ordenação em disco |
| Indexada | Um arquivo auxiliar (índice) diz onde cada chave está | Poucos acessos | Árvores B e B+ |
| Direta (hash) | Uma função transforma a chave na posição | Em geral 1 acesso | Tabelas hash |

## Demonstração

Esta demonstração compara quantos acessos ao disco são necessários para achar um registro de duas formas. Os tempos são só ilustrativos.

```demo
{
  "title": "Pesquisa sequencial x acesso direto",
  "steps": [
    {
      "caption": "O arquivo: 1000 registros, 10 registros por bloco. Queremos o registro número 537.",
      "state": "Registros ..... 1000\nPor bloco ...... 10\nBlocos ......... 100\nProcurado ...... registro 537"
    },
    {
      "caption": "Pesquisa sequencial: lemos bloco por bloco, do início, até o registro aparecer.",
      "state": "bloco  1  (regs   1 a  10)  não está\nbloco  2  (regs  11 a  20)  não está\n   ...\nbloco 53  (regs 521 a 530)  não está\nbloco 54  (regs 531 a 540)  ACHOU o 537\n\nacessos: 54"
    },
    {
      "caption": "Acesso direto: sabendo a posição, calculamos em que bloco o registro está e lemos só esse.",
      "state": "bloco = piso((537 - 1) / 10) + 1 = 54\n\nlemos apenas o bloco 54\n\nacessos: 1"
    },
    {
      "caption": "Se cada acesso levasse 10 ms (valor ilustrativo), a diferença seria grande.",
      "state": "sequencial: 54 acessos x 10 ms = 540 ms\ndireto:      1 acesso  x 10 ms =  10 ms\n\nno pior caso (registro 1000):\nsequencial lê 100 blocos = 1000 ms"
    },
    {
      "caption": "Conclusão: quanto mais registros, maior a diferença. Por isso estudamos índices e hash.",
      "state": "10 000 registros -> sequencial: até 1000 acessos\n                    direto:      1 acesso"
    }
  ]
}
```

## Código em C

O programa abaixo tem um arquivo com 40 registros, de chaves 100 a 139. O disco entrega blocos de 10 registros. O programa procura a chave 127 de duas formas e conta os acessos ao disco.

Clique em **Executar**. Cada bichinho é um bloco. Repare quantos blocos cada forma precisa ler.

```codigo
{
  "title": "Busca sequencial e acesso direto passo a passo",
  "code": [
    "#include <stdio.h>",
    "",
    "#define POR_BLOCO 10                       /* registros por bloco */",
    "",
    "struct registro {",
    "    int chave;",
    "    int dado;",
    "};",
    "",
    "/* busca sequencial: lê bloco por bloco, do começo, até achar a chave */",
    "int sequencial(FILE *f, int chave, int *acessos) {",
    "    struct registro bloco[POR_BLOCO];",
    "    rewind(f);",
    "    while (fread(bloco, sizeof(struct registro), POR_BLOCO, f) == POR_BLOCO) {",
    "        (*acessos)++;",
    "        for (int i = 0; i < POR_BLOCO; i++) {",
    "            if (bloco[i].chave == chave) {",
    "                return 1;",
    "            }",
    "        }",
    "    }",
    "    return 0;",
    "}",
    "",
    "/* acesso direto: calcula em que bloco o registro está e lê só esse */",
    "int direto(FILE *f, int rrn, int *acessos) {",
    "    struct registro bloco[POR_BLOCO];",
    "    fseek(f, (long)(rrn / POR_BLOCO) * sizeof(bloco), SEEK_SET);",
    "    fread(bloco, sizeof(struct registro), POR_BLOCO, f);",
    "    (*acessos)++;",
    "    return bloco[rrn % POR_BLOCO].chave;",
    "}",
    "",
    "int main(void) {",
    "    FILE *f = fopen(\"dados.dat\", \"w+b\");",
    "    for (int i = 0; i < 40; i++) {",
    "        struct registro r = {100 + i, i};",
    "        fwrite(&r, sizeof(r), 1, f);",
    "    }",
    "    int acessos = 0;",
    "    sequencial(f, 127, &acessos);",
    "    printf(\"sequencial: %d acessos\\n\", acessos);",
    "    acessos = 0;",
    "    int chave = direto(f, 27, &acessos);",
    "    printf(\"direto: %d acesso (chave %d)\\n\", acessos, chave);",
    "    fclose(f);",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 40,
      "caption": "O arquivo tem 40 registros, com chaves de 100 a 139. O disco entrega blocos de 10 registros, então são 4 blocos (0 a 3). Queremos o registro da chave 127. Cada bichinho é um bloco.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["127", "", 7]], "l": "chave procurada"}]],
      "stack": "main"
    },
    {
      "line": 41,
      "caption": "Busca sequencial: começamos no primeiro bloco e vamos lendo um bloco de cada vez, até achar a chave 127.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["127", "", 7]], "l": "chave procurada"}]],
      "stack": "main"
    },
    {
      "line": 16,
      "caption": "Acesso 1 ao disco: lemos o bloco 0, que vai da chave 100 até a 109. A chave 127 não está aqui. Passamos para o próximo bloco.",
      "vars": {"acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "c", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["127", "", 7]], "l": "chave procurada"}]],
      "stack": "sequencial ← main"
    },
    {
      "line": 16,
      "caption": "Acesso 2 ao disco: lemos o bloco 1, que vai da chave 110 até a 119. A chave 127 não está aqui. Passamos para o próximo bloco.",
      "vars": {"acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "c", 3], ["2", "", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["127", "", 7]], "l": "chave procurada"}]],
      "stack": "sequencial ← main"
    },
    {
      "line": 16,
      "caption": "Acesso 3 ao disco: lemos o bloco 2, que vai da chave 120 até a 129. A chave 127 está neste bloco. Vamos procurar dentro dele.",
      "vars": {"acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "c", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["127", "", 7]], "l": "chave procurada"}]],
      "stack": "sequencial ← main"
    },
    {
      "line": 18,
      "caption": "Achamos! A chave 127 é o registro 7 do bloco 2. A busca sequencial precisou de 3 acessos ao disco.",
      "vars": {"acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "p", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["127", "", 7]], "l": "chave procurada"}]],
      "stack": "sequencial ← main"
    },
    {
      "line": 44,
      "caption": "Acesso direto: já sabemos a posição (RRN) do registro: 27. Falta descobrir em que bloco ele está.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["27", "", 5]], "l": "RRN procurado"}]],
      "stack": "main"
    },
    {
      "line": 28,
      "caption": "bloco = 27 / 10 = 2 e posição dentro do bloco = 27 mod 10 = 7. Com essa conta, o fseek vai direto ao bloco 2.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "c", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["27", "", 5]], "l": "RRN procurado"}]],
      "stack": "direto ← main"
    },
    {
      "line": 31,
      "caption": "Lemos só o bloco 2: 1 acesso. O registro 27 tem a chave 127. A busca sequencial gastou 3 acessos, e o acesso direto, só 1. Em um arquivo maior, a diferença seria muito maior.",
      "vars": {"acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "i": [["0", "", 2], ["1", "", 3], ["2", "p", 4], ["3", "", 5]], "l": "blocos do arquivo (10 registros cada)"}], [{"i": [["27", "", 5]], "l": "RRN procurado"}]],
      "stack": "direto ← main"
    }
  ]
}
```

## Teste rápido

```quiz
{
  "question": "Um arquivo tem 800 registros, com 10 registros por bloco. No pior caso, quantos blocos a pesquisa sequencial precisa ler?",
  "options": [
    { "text": "1", "correct": false },
    { "text": "10", "correct": false },
    { "text": "80", "correct": true },
    { "text": "800", "correct": false }
  ],
  "correctFeedback": "✅ Correto! 800 / 10 = 80 blocos. Cada leitura traz 10 registros de uma vez.",
  "incorrectFeedback": "❌ Ainda não. O disco entrega blocos. Divida o total de registros pela quantidade de registros por bloco: 800 / 10."
}
```

```quiz
{
  "question": "Em qual destas situações a busca sequencial é razoável?",
  "options": [
    { "text": "Um arquivo com cerca de 10 registros, consultado raramente", "correct": true },
    { "text": "Um cadastro de milhões de clientes, consultado por CPF milhares de vezes por dia", "correct": false },
    { "text": "Um arquivo em que cada consulta precisa de uma resposta em um único acesso ao disco", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Com poucos registros ou pouca consulta, a simplicidade da busca sequencial compensa o custo O(n).",
  "incorrectFeedback": "❌ Ainda não. Com muitos registros e muitas consultas, percorrer o arquivo todo é caro. A busca sequencial só é razoável em arquivos pequenos ou pouco consultados."
}
```
