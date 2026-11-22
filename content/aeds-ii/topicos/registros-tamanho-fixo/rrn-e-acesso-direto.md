## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar o que é o RRN e para que serve o cabeçalho do arquivo.
- Calcular o byte onde um registro começa com a fórmula `cabeçalho + RRN × tamanho`.
- Ler, gravar e atualizar um registro fazendo um único `fseek`.
- Explicar por que o acesso direto é possível com tamanho fixo.

### O cabeçalho do arquivo

Além dos registros, o arquivo costuma ter um **cabeçalho** no começo. É uma pequena área, também de tamanho fixo, com informações sobre o próprio arquivo. As mais comuns são:

- a **quantidade de registros** gravados;
- o **tamanho de cada registro**, para quem for ler saber como interpretar os bytes;
- a **versão** do formato;
- informações sobre registros removidos, assunto do tópico sobre reutilização de espaço.

Assim, o arquivo é: **cabeçalho, registro 0, registro 1, registro 2** e assim por diante.

### RRN: o número relativo do registro

O **RRN** (*Relative Record Number*, número relativo do registro) é a posição do registro **dentro do arquivo**, contada a partir de zero: o primeiro registro tem RRN 0, o segundo tem RRN 1, e assim por diante. O RRN não diz o byte onde o registro está. Diz **qual** registro ele é.

Como todos os registros têm o mesmo tamanho, o byte onde o registro começa sai de uma **conta**:

> **offset = tamanho do cabeçalho + RRN × tamanho do registro**

Com cabeçalho de 8 bytes e registros de 70 bytes, o registro de RRN 3 começa no byte 8 + 3 × 70 = 218.

### Acesso direto

Com a conta, o programa não precisa ler os registros anteriores. Ele calcula o offset, chama `fseek` para posicionar a cabeça de leitura e lê o registro com `fread`. É o **acesso direto** (ou aleatório). O custo de buscar o registro 5 e o registro 5 000 000 é o mesmo: um posicionamento e uma leitura.

| Forma de acesso | Como chega ao registro `n` | Quanto custa |
|:---|:---|:---|
| Sequencial | Lê os `n` registros anteriores, um por um | Cresce com `n` |
| Direto (com RRN) | Calcula o offset e dá um `fseek` | Um posicionamento, qualquer que seja `n` |

Duas contas úteis que saem do mesmo raciocínio:

- **Quantos registros o arquivo tem?** `(tamanho do arquivo − cabeçalho) / tamanho do registro`. O tamanho do arquivo vem de `fseek(f, 0, SEEK_END)` seguido de `ftell(f)`.
- **Onde inserir um registro novo no fim?** No RRN igual à quantidade atual de registros. Depois da gravação, o contador do cabeçalho aumenta em um.

### Atualizar e remover

| Operação | O que acontece com tamanho fixo |
|:---|:---|
| Buscar pelo RRN | Conta do offset, `fseek` e `fread` |
| Inserir | Grava no fim do arquivo e atualiza a quantidade no cabeçalho |
| Atualizar | Regrava os mesmos bytes no mesmo lugar. O novo registro **sempre cabe**, porque tem o mesmo tamanho |
| Remover | Em geral é uma remoção **lógica**: o registro é marcado como removido e continua ocupando seu espaço |

Atualizar é simples porque não existe a pergunta "o registro novo cabe no lugar do antigo?". A resposta é sempre sim. Como aproveitar o espaço dos registros removidos é o assunto do tópico "Ordenação em disco e reutilização de espaço".

### E se a busca for por uma chave?

O RRN só ajuda quando você **já sabe** a posição. Se a pergunta for "onde está o aluno de matrícula 2023001?", o programa precisa procurar. Sem organização nenhuma, é uma busca sequencial. Se o arquivo estiver **ordenado pela chave**, dá para fazer **busca binária**, e cada passo da busca usa justamente o acesso direto por RRN. Para buscas mais rápidas, existem os índices, vistos no tópico de indexação.

## Estrutura

Um arquivo com cabeçalho de 8 bytes e registros de 70 bytes. O primeiro registro só começa depois do cabeçalho, e cada registro seguinte começa 70 bytes depois do anterior:

| RRN | Conta | Começa no byte | Ocupa os bytes |
|---:|:---|---:|:---|
| 0 | 8 + 0 × 70 | 8 | 8 a 77 |
| 1 | 8 + 1 × 70 | 78 | 78 a 147 |
| 2 | 8 + 2 × 70 | 148 | 148 a 217 |
| 3 | 8 + 3 × 70 | 218 | 218 a 287 |
| 4 | 8 + 4 × 70 | 288 | 288 a 357 |

Para qualquer outro RRN, é só repetir a conta. O registro de RRN 199, por exemplo, começa no byte 8 + 199 × 70 = 13 938.

## Demonstração

Acompanhe o cálculo do offset do registro de RRN 3, passo a passo.

```demo
{
  "title": "Calculando o endereço de um registro",
  "steps": [
    {
      "caption": "O arquivo tem um cabeçalho de 8 bytes e registros de 70 bytes. Queremos o registro de RRN 3, o quarto.",
      "state": "byte:     0        8       78      148     218     288\n          +--------+-------+-------+-------+-------+\narquivo:  |  cab   |  R0   |  R1   |  R2   |  R3   | ...\n          +--------+-------+-------+-------+-------+\nRRN pedido: 3"
    },
    {
      "caption": "Passo 1: pular o cabeçalho. O primeiro registro só começa depois dele.",
      "state": "início dos registros = tamanho do cabeçalho\n                     = 8"
    },
    {
      "caption": "Passo 2: pular os registros anteriores. São 3 registros (RRN 0, 1 e 2) de 70 bytes cada.",
      "state": "registros pulados = RRN x tamanho\n                  = 3 x 70\n                  = 210"
    },
    {
      "caption": "Passo 3: somar. O registro 3 começa no byte 218.",
      "state": "offset = cabeçalho + RRN x tamanho\n       = 8 + 3 x 70\n       = 218"
    },
    {
      "caption": "Passo 4: um único fseek vai direto para lá, e um fread lê os 70 bytes do registro.",
      "state": "fseek(f, 218, SEEK_SET);\nfread(&a, 70, 1, f);\n\nO tempo não depende de quantos registros existem antes."
    }
  ]
}
```

## Código em C

O programa abaixo grava 4 registros de 24 bytes depois de um cabeçalho de 4 bytes. Em seguida, ele lê o registro de RRN 2 indo direto ao byte dele, muda o curso e regrava no mesmo lugar. Clique em **Executar** e acompanhe a linha amarela.

Repare que a conta aparece uma vez no `le` e outra no `grava`, e que **nenhum registro é lido só para ser pulado**.

```codigo
{"title":"Registros de tamanho fixo: do RRN ao byte","code":"#include <stdio.h>\n#include <string.h>\n\ntypedef struct {\n    char nome[16];\n    char curso[8];\n} Aluno;                                   /* 24 bytes por registro */\n\n#define CAB 4                              /* cabeçalho: um int com a quantidade de registros */\n\n/* grava o registro na posição do RRN (sem ler nada antes) */\nvoid grava(FILE *f, int rrn, Aluno a) {\n    fseek(f, (long)(CAB + rrn * sizeof(Aluno)), SEEK_SET);\n    fwrite(&a, sizeof(Aluno), 1, f);\n}\n\n/* lê o registro de número RRN indo direto ao byte dele */\nAluno le(FILE *f, int rrn) {\n    Aluno a;\n    long pos = (long)(CAB + rrn * sizeof(Aluno));\n    fseek(f, pos, SEEK_SET);\n    fread(&a, sizeof(Aluno), 1, f);\n    return a;\n}\n\nint main(void) {\n    FILE *f = fopen(\"alunos.dat\", \"w+b\");\n    int qtd = 4;\n    fwrite(&qtd, sizeof(int), 1, f);\n    grava(f, 0, (Aluno){\"Ana\", \"SI\"});\n    grava(f, 1, (Aluno){\"Bruno\", \"EC\"});\n    grava(f, 2, (Aluno){\"Carla\", \"EM\"});\n    grava(f, 3, (Aluno){\"Davi\", \"CC\"});\n\n    /* leitura direta: queremos o registro de RRN 2 */\n    Aluno a = le(f, 2);                    /* vai direto ao RRN 2, sem passar pelos outros */\n    printf(\"registro 2: %s, %s\\n\", a.nome, a.curso);\n\n    strcpy(a.curso, \"SI\");                 /* atualiza na memória... */\n    grava(f, 2, a);                        /* ...e regrava no mesmo lugar */\n    a = le(f, 2);\n    printf(\"registro 2: %s, %s\\n\", a.nome, a.curso);\n    fclose(f);\n    return 0;\n}","steps":[{"line":35,"caption":"O programa gravou o cabeçalho (4 bytes, com a quantidade de registros) e 4 registros de 24 bytes cada. O registro de RRN i começa no byte 4 + i × 24: 4, 28, 52, 76. O arquivo termina no byte 100.","vars":{},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"main"},{"line":36,"caption":"Queremos o registro de RRN 2 (o terceiro). Não vamos ler os registros 0 e 1: vamos calcular onde o 2 começa.","vars":{"rrn":2},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"main"},{"line":20,"caption":"Conta direta: cabeçalho + RRN × tamanho = 4 + 2 × 24 = 52. É o byte onde o registro 2 começa.","vars":{"rrn":2,"alvo":52},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","c",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","c",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"le ← main"},{"line":22,"caption":"O fseek leva a cabeça de leitura direto ao byte 52. Foi um único salto, sem ler nenhum outro registro.","vars":{"rrn":2,"cabeça (byte)":52},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","c",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","c",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"le ← main"},{"line":23,"caption":"O fread copiou 24 bytes para a variável a. Agora a cabeça de leitura está no byte 76, onde começa o registro seguinte.","vars":{"rrn":2,"cabeça (byte)":76},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","p",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","p",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}],[{"i":[["Carla","p",7],["EM","p",10]],"l":"campos do registro na memória (nome, curso)"}]],"stack":"le ← main"},{"line":37,"caption":"Registro 2 lido: Carla, EM.","vars":{"rrn":2},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","p",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","p",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}],[{"i":[["Carla","p",7],["EM","p",10]],"l":"campos do registro na memória (nome, curso)"}]],"stack":"main"},{"line":39,"caption":"Vamos trocar o curso do registro 2, de EM para SI, primeiro na memória.","vars":{"rrn":2},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","p",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","p",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}],[{"i":[["Carla","p",7],["EM","p",10]],"l":"campos do registro na memória (nome, curso)"}]],"stack":"main"},{"line":40,"caption":"Na memória o curso já é SI. O grava usa a mesma conta (4 + 2 × 24 = 52) e escreve os 24 bytes por cima do registro antigo. O tamanho é igual, então nada se desloca e os outros registros não são tocados.","vars":{"rrn":2},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","p",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","p",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}],[{"i":[["Carla","p",7],["SI","p",12]],"l":"campos do registro na memória (nome, curso)"}]],"stack":"main"},{"line":20,"caption":"Conta direta: cabeçalho + RRN × tamanho = 4 + 2 × 24 = 52. É o byte onde o registro 2 começa.","vars":{"rrn":2,"alvo":52},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","c",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","c",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"le ← main"},{"line":22,"caption":"O fseek leva a cabeça de leitura direto ao byte 52. Foi um único salto, sem ler nenhum outro registro.","vars":{"rrn":2,"cabeça (byte)":52},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","c",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","c",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"le ← main"},{"line":23,"caption":"O fread copiou 24 bytes para a variável a. Agora a cabeça de leitura está no byte 76, onde começa o registro seguinte.","vars":{"rrn":2,"cabeça (byte)":76},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","p",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","p",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}],[{"i":[["Carla","p",7],["SI","p",12]],"l":"campos do registro na memória (nome, curso)"}]],"stack":"le ← main"},{"line":42,"caption":"Registro 2 lido: Carla, SI.","vars":{"rrn":2},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","p",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","p",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}],[{"i":[["Carla","p",7],["SI","p",12]],"l":"campos do registro na memória (nome, curso)"}]],"stack":"main"},{"line":43,"caption":"Pronto: lemos e atualizamos o registro 2 sem mexer nos demais. Com tamanho fixo, cada registro tem endereço calculável.","vars":{"rrn":2,"cabeça (byte)":76},"rows":[[{"s":0,"n":6,"i":[["cab","",8],["A","",5],["B","",6],["C","",7],["D","",8],["·","g",0]],"l":"arquivo (cab = cabeçalho; A = Ana, B = Bruno, C = Carla, D = Davi)"}],[{"s":0,"n":6,"i":[["0","",8],["4","",5],["28","",6],["52","",7],["76","",8],["100","",0]],"l":"byte onde cada parte começa (o último é o fim do arquivo)"}]],"stack":"main"}]}
```

## Teste rápido

```quiz
{
  "question": "Um arquivo tem cabeçalho de 16 bytes e registros de 50 bytes. Em que byte começa o registro de RRN 4?",
  "options": [
    { "text": "Byte 200, porque 4 x 50 = 200", "correct": false },
    { "text": "Byte 216, porque 16 + 4 x 50 = 216", "correct": true },
    { "text": "Byte 266, porque 16 + 5 x 50 = 266", "correct": false }
  ],
  "correctFeedback": "✅ Correto! É preciso somar o cabeçalho ao que vem dos registros anteriores. O RRN 4 tem 4 registros antes dele.",
  "incorrectFeedback": "❌ Ainda não. A conta é cabeçalho + RRN x tamanho. Não esqueça o cabeçalho, e lembre que o RRN começa em zero."
}
```

```quiz
{
  "question": "Por que atualizar um registro de tamanho fixo é simples?",
  "options": [
    { "text": "Porque o registro novo tem o mesmo tamanho e sempre cabe no lugar do antigo", "correct": true },
    { "text": "Porque o arquivo é regravado inteiro a cada atualização", "correct": false },
    { "text": "Porque o disco aumenta o espaço do registro automaticamente", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Basta regravar os mesmos bytes na mesma posição, sem deslocar mais nada.",
  "incorrectFeedback": "❌ Ainda não. O ponto é o tamanho: como todo registro tem o mesmo número de bytes, o novo ocupa exatamente o lugar do antigo."
}
```
