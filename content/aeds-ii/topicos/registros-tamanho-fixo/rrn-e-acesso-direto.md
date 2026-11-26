## Objetivos de aprendizagem

- Entender o cabeçalho e o RRN.
- Calcular onde um registro começa.
- Ler e atualizar um registro com um único `fseek`.

## Cabeçalho e RRN

O arquivo é: **cabeçalho**, registro 0, registro 1, registro 2...

- **Cabeçalho**: quantidade de registros, tamanho do registro, versão.
- **RRN** (*Relative Record Number*): a posição do registro, contada a partir de **0**.

> **offset = cabeçalho + RRN × tamanho do registro**

## Vá direto ao registro

```rrn
{
  "title": "Cabeçalho de 8 bytes, registros de 70 bytes",
  "dica": "Clique em um registro (ou arraste o controle) e compare o custo dos dois tipos de acesso.",
  "cab": 8,
  "tam": 70,
  "n": 8,
  "rrn": 3
}
```

## Operações

| Operação | Com tamanho fixo |
|:---|:---|
| Buscar | Conta do offset, `fseek`, `fread` |
| Inserir | Grava no fim e soma 1 à quantidade do cabeçalho |
| Atualizar | Regrava no mesmo lugar: **sempre cabe** |
| Remover | Em geral, uma marca de remoção lógica |

- Quantos registros? `(tamanho do arquivo − cabeçalho) / tamanho do registro`.
- Busca por **chave**? Com o arquivo ordenado, a busca binária usa o RRN a cada passo.

## Código em C

Clique em **Executar** e acompanhe a linha amarela. Nenhum registro é lido só para ser pulado.

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
