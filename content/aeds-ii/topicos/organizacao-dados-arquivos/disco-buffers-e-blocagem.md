## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Descrever como o disco é organizado (pratos, trilhas, setores e cilindros).
- Explicar as três partes do custo de um acesso e por que o número de acessos importa.
- Calcular o fator de blocagem e o espaço perdido em cada bloco.
- Comparar a organização espalhada e a não espalhada.

## Conexão com a Trilha

Na página anterior definimos campos, registros e chaves. Agora olhamos onde eles ficam guardados de verdade: no disco. Como o disco entrega blocos inteiros, precisamos entender o custo de cada acesso e como agrupar registros em blocos.

### Como o disco guarda e entrega os dados

Um disco rígido é uma pilha de **pratos**. Os dados ficam nas faces desses pratos. Cada prato é dividido em **trilhas** (círculos), e cada trilha é dividida em **setores**. As trilhas que ficam uma sobre a outra, em todos os pratos, formam um **cilindro**.

Sempre que possível, um arquivo é gravado por cilindro. O motivo é que mover o braço de leitura de um cilindro para outro (o *seek*) é a parte mais cara do acesso.

O sistema operacional divide o disco em **blocos** de tamanho fixo. Ele lê e escreve blocos inteiros, mesmo que você peça só 1 byte. O custo de um acesso tem três partes:

1. **Seek:** mover a cabeça de leitura até a trilha certa.
2. **Latência rotacional:** esperar o setor girar até chegar na cabeça.
3. **Transferência:** ler os bytes de fato.

O seek e a latência são os mais caros. Quando a cabeça já está no lugar, ler bytes vizinhos é barato. Por isso **ler em sequência é muito mais rápido do que pular de lugar em lugar**.

> Os SSDs não têm seek mecânico. Mesmo assim, o acesso continua sendo em blocos e continua muito mais lento que a RAM. A ideia de reduzir o número de acessos vale do mesmo jeito.

### Buffers

Um **buffer** é uma área da RAM que guarda um bloco inteiro lido do disco. Quando o programa pede o registro seguinte, ele muitas vezes já está no buffer. Então não é preciso ir ao disco de novo.

Gravar funciona ao contrário. Os registros se acumulam no buffer, e só depois o bloco é escrito.

### Blocagem: vários registros por bloco

O bloco é a unidade de transferência entre o disco e a memória. Por isso, os registros de um arquivo precisam ser distribuídos em blocos. Seja `B` o tamanho do bloco e `R` o tamanho do registro, com `B ≥ R`. O **fator de blocagem** (`bfr`) é quantos registros inteiros cabem em um bloco:

`bfr = ⌊B / R⌋` (o símbolo ⌊x⌋ quer dizer "arredondar x para baixo")

Em geral `R` não divide `B` exatamente. Então sobra, em cada bloco, um espaço sem uso de `B − bfr × R` bytes.

Exemplo: com `B = 512` e `R = 71`, temos `bfr = ⌊512 / 71⌋ = 7`. Sete registros ocupam 497 bytes, e sobram 15 bytes em cada bloco.

Há duas formas de tratar essa sobra:

- **Organização espalhada** (*spanned*): usa a sobra. Guarda parte de um registro em um bloco e o resto em outro. No fim do primeiro bloco fica um ponteiro para onde o registro continua, se não for o bloco seguinte. Ela é **obrigatória** quando o registro é maior que o bloco.
- **Organização não espalhada** (*unspanned*): nenhum registro atravessa o limite do bloco. Cada registro começa em um lugar conhecido dentro do bloco. Isso simplifica o processamento, mas a sobra fica sem uso. É a mais usada com registros de tamanho fixo e `B > R`. Com registros de tamanho variável, dá para usar qualquer uma das duas.

## Estrutura

A **blocagem** com `B = 512` bytes e `R = 71` bytes, o que dá `bfr = 7`:

```estrutura
ORGANIZAÇÃO NÃO ESPALHADA (unspanned): nenhum registro atravessa o limite do bloco

 bloco i   +-----+-----+-----+-----+-----+-----+-----+-----------------+
           | r1  | r2  | r3  | r4  | r5  | r6  | r7  | 15 bytes SEM USO|
           +-----+-----+-----+-----+-----+-----+-----+-----------------+
             71    71    71    71    71    71    71    (7 x 71 = 497)

 bloco i+1 +-----+-----+-----+-----+-----+-----+-----+-----------------+
           | r8  | r9  | ...                                           |


ORGANIZAÇÃO ESPALHADA (spanned): aproveita a sobra; P = ponteiro para o resto

 bloco i   +-----+-----+-----+-----+-----+-----+-----+---------+---+
           | r1  | r2  | r3  | r4  | r5  | r6  | r7  | r8 (ini)| P |--+
           +-----+-----+-----+-----+-----+-----+-----+---------+---+  |
                                                                       |
 bloco i+1 +---------------+-----+-----+...                            |
           | r8 (resto)    | r9  | r10 |  <----------------------------+
           +---------------+-----+-----+
```

## Demonstração

Esta demonstração mostra a blocagem e a posição de um registro.

```demo
{
  "title": "Blocagem: quantos registros por bloco?",
  "steps": [
    {
      "caption": "Dados do problema: bloco de 512 bytes, registro de 71 bytes e 10 000 registros.",
      "state": "B = 512 bytes\nR =  71 bytes\nregistros = 10 000"
    },
    {
      "caption": "Fator de blocagem: quantos registros inteiros cabem em um bloco.",
      "state": "bfr = piso(512 / 71) = 7\n7 x 71 = 497 bytes usados\nsobra por bloco = 512 - 497 = 15 bytes"
    },
    {
      "caption": "Organização NÃO espalhada: nenhum registro atravessa dois blocos.",
      "state": "blocos = teto(10 000 / 7) = 1429\nespaço em disco = 1429 x 512 = 731 648 bytes\ndados úteis = 10 000 x 71 = 710 000 bytes"
    },
    {
      "caption": "Organização ESPALHADA: usa a sobra de cada bloco para começar o registro seguinte (ponteiros ignorados nesta conta).",
      "state": "blocos = teto(710 000 / 512) = 1387\neconomia = 1429 - 1387 = 42 blocos"
    },
    {
      "caption": "Localizar o registro de RRN 20 (contando de 0) na organização não espalhada.",
      "state": "bloco = piso(20 / 7) = 2\nposição no bloco = 20 mod 7 = 6\nbyte dentro do bloco = 6 x 71 = 426\nbyte no arquivo = 2 x 512 + 426 = 1450"
    },
    {
      "caption": "Cuidado: RRN x R só vale quando os registros ficam colados, sem sobras.",
      "state": "RRN x R = 20 x 71 = 1420\nnão espalhada: 1450, ou seja, 30 bytes a mais,\nporque cada um dos 2 blocos anteriores perdeu 15 bytes"
    }
  ]
}
```

## Código em C

### Um buffer na prática

O programa abaixo lê 10 registros (os números de 1 a 10). O disco entrega blocos de 4 registros (`BFR = 4`). A função `lerRegistro` só vai ao disco quando o buffer acaba. Clique em **Executar** e conte os acessos ao disco.

```codigo
{
  "title": "Buffer e blocagem passo a passo",
  "code": [
    "#include <stdio.h>",
    "",
    "#define BFR 4                      /* fator de blocagem: registros por bloco */",
    "",
    "struct buffer {",
    "    FILE *f;",
    "    int   registros[BFR];          /* o bloco que está na memória */",
    "    int   qtd;                     /* quantos registros o bloco tem */",
    "    int   pos;                     /* próximo registro a entregar */",
    "    int   acessos;                 /* quantas vezes fomos ao disco */",
    "};",
    "",
    "/* entrega o próximo registro; só vai ao disco quando o buffer acaba */",
    "int lerRegistro(struct buffer *b, int *registro) {",
    "    if (b->pos == b->qtd) {",
    "        b->qtd = (int)fread(b->registros, sizeof(int), BFR, b->f);",
    "        b->pos = 0;",
    "        if (b->qtd == 0) {",
    "            return 0;",
    "        }",
    "        b->acessos++;",
    "    }",
    "    *registro = b->registros[b->pos++];",
    "    return 1;",
    "}",
    "",
    "int main(void) {",
    "    FILE *f = fopen(\"numeros.dat\", \"w+b\");",
    "    for (int i = 1; i <= 10; i++) {",
    "        fwrite(&i, sizeof(i), 1, f);",
    "    }",
    "    rewind(f);",
    "    struct buffer b = {f, {0}, 0, 0, 0};",
    "    int r, lidos = 0;",
    "    while (lerRegistro(&b, &r)) {",
    "        lidos++;",
    "    }",
    "    printf(\"%d registros lidos com %d acessos ao disco\\n\", lidos, b.acessos);",
    "    fclose(f);",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 35,
      "caption": "O arquivo tem 10 registros (os números de 1 a 10). O disco entrega blocos de 4 registros, porque o fator de blocagem é 4. O buffer é uma caixa na memória que guarda um bloco inteiro.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [["·", "g", 0], ["·", "g", 0], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}]],
      "stack": "main"
    },
    {
      "line": 15,
      "caption": "O programa pede o primeiro registro, mas o buffer está vazio. Precisamos ir ao disco.",
      "vars": {"pos": 0, "qtd": 0, "acessos ao disco": 0},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [["·", "g", 0], ["·", "g", 0], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 22,
      "caption": "Acesso ao disco número 1: o bloco inteiro (4 registros) foi copiado para o buffer. Foi uma ida ao disco para vários registros.",
      "vars": {"acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]], "a": 1}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]], "l": "buffer (na memória)"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 1 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 0, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "p", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "c", 1], [2, "", 2], [3, "", 3], [4, "", 4]], "l": "buffer (na memória)"}], [{"i": [[1, "p", 1]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 1, então não precisamos ir ao disco.",
      "vars": {"pos": 1, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "c", 2], [3, "", 3], [4, "", 4]], "l": "buffer (na memória)"}], [{"i": [[1, "", 1]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 2 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 1, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "p", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "c", 2], [3, "", 3], [4, "", 4]], "l": "buffer (na memória)"}], [{"i": [[2, "p", 2]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 2, então não precisamos ir ao disco.",
      "vars": {"pos": 2, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "", 2], [3, "c", 3], [4, "", 4]], "l": "buffer (na memória)"}], [{"i": [[2, "", 2]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 3 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 2, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "p", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "", 2], [3, "c", 3], [4, "", 4]], "l": "buffer (na memória)"}], [{"i": [[3, "p", 3]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 3, então não precisamos ir ao disco.",
      "vars": {"pos": 3, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "c", 4]], "l": "buffer (na memória)"}], [{"i": [[3, "", 3]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 4 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 3, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "p", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "c", 4]], "l": "buffer (na memória)"}], [{"i": [[4, "p", 4]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede um registro, mas já usamos os 4 registros do buffer. Precisamos buscar o próximo bloco no disco.",
      "vars": {"pos": 4, "qtd": 4, "acessos ao disco": 1},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]], "l": "buffer (na memória)"}], [{"i": [[4, "", 4]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 22,
      "caption": "Acesso ao disco número 2: o bloco inteiro (4 registros) foi copiado para o buffer. Foi uma ida ao disco para vários registros.",
      "vars": {"acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]], "a": 1}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[4, "", 4]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 5 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 0, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "p", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "c", 5], [6, "", 6], [7, "", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[5, "p", 5]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 1, então não precisamos ir ao disco.",
      "vars": {"pos": 1, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "c", 6], [7, "", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[5, "", 5]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 6 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 1, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "p", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "c", 6], [7, "", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[6, "p", 6]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 2, então não precisamos ir ao disco.",
      "vars": {"pos": 2, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "", 6], [7, "c", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[6, "", 6]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 7 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 2, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "p", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "", 6], [7, "c", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[7, "p", 7]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 3, então não precisamos ir ao disco.",
      "vars": {"pos": 3, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "c", 8]], "l": "buffer (na memória)"}], [{"i": [[7, "", 7]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 8 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 3, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "p", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "c", 8]], "l": "buffer (na memória)"}], [{"i": [[8, "p", 8]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede um registro, mas já usamos os 4 registros do buffer. Precisamos buscar o próximo bloco no disco.",
      "vars": {"pos": 4, "qtd": 4, "acessos ao disco": 2},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]], "l": "buffer (na memória)"}], [{"i": [[8, "", 8]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 22,
      "caption": "Acesso ao disco número 3: o bloco inteiro (2 registros) foi copiado para o buffer. Foi uma ida ao disco para vários registros.",
      "vars": {"acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]], "a": 1}], [{"s": 0, "n": 4, "i": [[9, "", 9], [10, "", 10], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[8, "", 8]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 9 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 0, "qtd": 2, "acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "p", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[9, "c", 9], [10, "", 10], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[9, "p", 9]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede o próximo registro. O buffer ainda tem o registro da posição 1, então não precisamos ir ao disco.",
      "vars": {"pos": 1, "qtd": 2, "acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[9, "", 9], [10, "c", 10], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[9, "", 9]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 23,
      "caption": "Entregamos o registro 10 ao programa e avançamos a posição do buffer.",
      "vars": {"pos": 1, "qtd": 2, "acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "p", 10]]}], [{"s": 0, "n": 4, "i": [[9, "", 9], [10, "c", 10], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[10, "p", 10]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 15,
      "caption": "O programa pede um registro, mas já usamos os 2 registros do buffer. Precisamos buscar o próximo bloco no disco.",
      "vars": {"pos": 2, "qtd": 2, "acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [[9, "", 9], [10, "", 10], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[10, "", 10]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 19,
      "caption": "O arquivo acabou: o fread não trouxe nenhum registro. A função devolve 0 e o laço termina.",
      "vars": {"acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [["·", "g", 0], ["·", "g", 0], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[10, "", 10]], "l": "último registro entregue"}]],
      "stack": "lerRegistro ← main"
    },
    {
      "line": 38,
      "caption": "Pronto: 10 registros lidos com só 3 acessos ao disco. Sem buffer, teríamos feito 10 acessos, um para cada registro.",
      "vars": {"acessos ao disco": 3},
      "rows": [[{"s": 0, "n": 4, "l": "bloco 0", "i": [[1, "", 1], [2, "", 2], [3, "", 3], [4, "", 4]]}, {"s": 4, "n": 4, "l": "bloco 1", "i": [[5, "", 5], [6, "", 6], [7, "", 7], [8, "", 8]]}, {"s": 8, "n": 2, "l": "bloco 2", "i": [[9, "", 9], [10, "", 10]]}], [{"s": 0, "n": 4, "i": [["·", "g", 0], ["·", "g", 0], ["·", "g", 0], ["·", "g", 0]], "l": "buffer (na memória)"}], [{"i": [[10, "", 10]], "l": "último registro entregue"}]],
      "stack": "main"
    }
  ]
}
```

### Calculando a blocagem

O programa abaixo faz as contas desta página: o fator de blocagem, a sobra por bloco, o número de blocos nas duas organizações e a posição do registro de RRN 20.

```c
#include <stdio.h>

int main(void) {
    int B = 512;                         /* tamanho do bloco, em bytes */
    int R = 71;                          /* tamanho do registro, em bytes */
    int total = 10000;                   /* quantos registros o arquivo tem */

    int bfr = B / R;                     /* fator de blocagem (a divisão de inteiros arredonda para baixo) */
    int sobra = B - bfr * R;             /* bytes sem uso em cada bloco (não espalhada) */
    int blocosNao = (total + bfr - 1) / bfr;               /* teto de total / bfr */
    int blocosEsp = (total * R + B - 1) / B;               /* espalhada: aproveita a sobra */

    printf("bfr = %d, sobra por bloco = %d bytes\n", bfr, sobra);
    printf("blocos (nao espalhada) = %d\n", blocosNao);
    printf("blocos (espalhada)     = %d\n", blocosEsp);

    int rrn = 20;                        /* onde está o registro de RRN 20? */
    int bloco = rrn / bfr;               /* número do bloco, contado de 0 */
    int dentro = (rrn % bfr) * R;        /* byte dentro do bloco */
    printf("RRN %d: bloco %d, byte %d do bloco, byte %d do arquivo\n", rrn, bloco, dentro, bloco * B + dentro);
    return 0;
}
```

A saída do programa é:

```text
bfr = 7, sobra por bloco = 15 bytes
blocos (nao espalhada) = 1429
blocos (espalhada)     = 1387
RRN 20: bloco 2, byte 426 do bloco, byte 1450 do arquivo
```

## Teste rápido

```quiz
{
  "question": "Qual parte do custo de ler um dado do disco giratório costuma ser a MAIS cara?",
  "options": [
    { "text": "A transferência dos bytes", "correct": false },
    { "text": "O seek e a latência rotacional", "correct": true },
    { "text": "A cópia do bloco para o buffer na RAM", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Mover a cabeça e esperar o setor passar custam bem mais do que transferir os bytes.",
  "incorrectFeedback": "❌ Ainda não. Depois que a cabeça está no lugar, transferir bytes é barato. O caro é o seek e a espera pela rotação."
}
```

```quiz
{
  "question": "Um bloco tem 1024 bytes e cada registro tem 200 bytes. Quantos registros inteiros cabem em um bloco (fator de blocagem)?",
  "options": [
    { "text": "4", "correct": false },
    { "text": "5", "correct": true },
    { "text": "6", "correct": false }
  ],
  "correctFeedback": "✅ Correto! bfr = piso(1024 / 200) = piso(5,12) = 5. Sobram 1024 - 1000 = 24 bytes.",
  "incorrectFeedback": "❌ Ainda não. Divida o tamanho do bloco pelo do registro e arredonde PARA BAIXO: 1024 / 200 = 5,12."
}
```

