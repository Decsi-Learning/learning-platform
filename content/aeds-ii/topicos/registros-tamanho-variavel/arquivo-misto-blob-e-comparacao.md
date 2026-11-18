## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar o que é um arquivo misto e para que serve o código de tipo de registro.
- Explicar o que é um BLOB e como ele é guardado.
- Relacionar registros variáveis e blocos (espalhada e não espalhada).
- Comparar registros fixos e variáveis em espaço, acesso e reaproveitamento.

### Arquivo misto

Os registros de tamanho variável aparecem por vários motivos:

- campos de tamanho variável, como o nome;
- campos com vários valores;
- campos opcionais;
- **arquivos mistos**.

Em um **arquivo misto**, registros de **tipos diferentes** convivem no mesmo arquivo. Por exemplo, alunos e disciplinas. Cada registro começa com um **código de tipo de registro**. Com ele, o programa sabe como interpretar o que vem depois. O cabeçalho do arquivo descreve esses códigos.

### Campos grandes: BLOB

Um campo que guarda um objeto grande e sem estrutura é chamado de **BLOB**. Pode ser uma imagem, um vídeo, um áudio ou um texto livre.

Em geral o BLOB é guardado **separadamente** do registro, em blocos de disco próprios. O registro guarda só um **ponteiro** para ele.

### Registros variáveis e blocos

Como vimos na blocagem, com registros de tamanho variável podemos usar dois tipos de organização:

- **Espalhada:** o registro pode cruzar de um bloco para outro. Assim aproveitamos toda a sobra.
- **Não espalhada:** cada registro fica inteiro dentro de um bloco. A sobra no fim de cada bloco passa a variar de bloco para bloco, porque não existe um tamanho de registro único.

### Comparando com tamanho fixo

| Aspecto | Tamanho fixo | Tamanho variável |
|---|---|---|
| Espaço usado | Maior (fragmentação interna) | Menor |
| Achar o registro `n` | Conta direta com o RRN | Varrer o arquivo ou usar índice de offsets |
| Código | Simples | Mais trabalhoso |
| Reaproveitar buracos | Fácil (todos iguais) | Difícil (tamanhos diferentes) |
| Bom quando | Os dados têm tamanho parecido | Os tamanhos variam muito |

## Código em C

O arquivo abaixo é misto. Cada linha é um registro, e o primeiro caractere é o **código do tipo**. A letra `A` quer dizer aluno, a letra `D` quer dizer disciplina, e há uma linha `X` que o programa não conhece. Nas animações, cada tipo tem a sua cor.

Clique em **Executar**. Repare que o programa lê o código do tipo primeiro e só depois decide como interpretar os campos.

```codigo
{"title":"Arquivo misto passo a passo","code":"#include <stdio.h>\n#include <string.h>\n\n/* Arquivo misto: cada linha é um registro e o primeiro caractere é o código do tipo.\n   'A' = aluno (nome;curso)    'D' = disciplina (nome;carga horária) */\nvoid lerMisto(FILE *f) {\n    char linha[64];\n    for (int n = 0; fgets(linha, sizeof(linha), f) != NULL; n++) {\n        linha[strcspn(linha, \"\\n\")] = '\\0';\n        char tipo = linha[0];\n        char *dados = linha + 2;\n        if (tipo == 'A') {\n            char nome[20], curso[20];\n            sscanf(dados, \"%19[^;];%19s\", nome, curso);\n            printf(\"aluno: nome = %s, curso = %s\\n\", nome, curso);\n        } else if (tipo == 'D') {\n            char nome[20];\n            int carga;\n            sscanf(dados, \"%19[^;];%d\", nome, &carga);\n            printf(\"disciplina: nome = %s, carga = %d horas\\n\", nome, carga);\n        } else {\n            printf(\"tipo desconhecido: %c\\n\", tipo);\n        }\n    }\n}\n\nint main(void) {\n    FILE *f = fopen(\"misto.txt\", \"w+\");\n    fputs(\"A Ana;Sistemas\\n\", f);\n    fputs(\"D AEDS2;60\\n\", f);\n    fputs(\"A Bruno;Civil\\n\", f);\n    fputs(\"D BD;45\\n\", f);\n    fputs(\"X ???\\n\", f);\n    rewind(f);\n    lerMisto(f);\n    fclose(f);\n    return 0;\n}","steps":[{"line":12,"caption":"Lemos o registro 0. O primeiro caractere é o código do tipo de registro: 'A'. O programa decide o que fazer a partir dele.","vars":{"n":0,"tipo":"'A'"},"rows":[[{"s":0,"n":5,"i":[["A","c",6],["D","",2],["A","",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"},{"line":14,"caption":"O código 'A' quer dizer aluno. Então os dados são nome e curso, separados por ';'. O sscanf separa os dois campos: nome = Ana e curso = Sistemas.","vars":{"n":0},"rows":[[{"s":0,"n":5,"i":[["A","p",6],["D","",2],["A","",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}],[{"i":[["Ana","p",5],["Sistemas","p",0]],"l":"campos de um aluno (nome; curso)"}]],"stack":"lerMisto ← main"},{"line":12,"caption":"Lemos o registro 1. O primeiro caractere é o código do tipo de registro: 'D'. O programa decide o que fazer a partir dele.","vars":{"n":1,"tipo":"'D'"},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","c",2],["A","",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"},{"line":19,"caption":"O código 'D' quer dizer disciplina. Então os dados são nome e carga horária (um número). O sscanf lê nome = AEDS2 e carga = 60.","vars":{"n":1},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","p",2],["A","",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}],[{"i":[["AEDS2","p",5],["60","p",7]],"l":"campos de uma disciplina (nome; carga horária)"}]],"stack":"lerMisto ← main"},{"line":12,"caption":"Lemos o registro 2. O primeiro caractere é o código do tipo de registro: 'A'. O programa decide o que fazer a partir dele.","vars":{"n":2,"tipo":"'A'"},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","c",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"},{"line":14,"caption":"O código 'A' quer dizer aluno. Então os dados são nome e curso, separados por ';'. O sscanf separa os dois campos: nome = Bruno e curso = Civil.","vars":{"n":2},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","p",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}],[{"i":[["Bruno","p",6],["Civil","p",8]],"l":"campos de um aluno (nome; curso)"}]],"stack":"lerMisto ← main"},{"line":12,"caption":"Lemos o registro 3. O primeiro caractere é o código do tipo de registro: 'D'. O programa decide o que fazer a partir dele.","vars":{"n":3,"tipo":"'D'"},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","",6],["D","c",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"},{"line":19,"caption":"O código 'D' quer dizer disciplina. Então os dados são nome e carga horária (um número). O sscanf lê nome = BD e carga = 45.","vars":{"n":3},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","",6],["D","p",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}],[{"i":[["BD","p",6],["45","p",5]],"l":"campos de uma disciplina (nome; carga horária)"}]],"stack":"lerMisto ← main"},{"line":12,"caption":"Lemos o registro 4. O primeiro caractere é o código do tipo de registro: 'X'. O programa decide o que fazer a partir dele.","vars":{"n":4,"tipo":"'X'"},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","",6],["D","",2],["X","c",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"},{"line":22,"caption":"O código 'X' não está na lista de tipos conhecidos. O programa avisa e continua com o próximo registro.","vars":{"n":4,"tipo":"'X'"},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","",6],["D","",2],["X","p",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"},{"line":25,"caption":"Fim do arquivo. O mesmo arquivo guardou dois tipos de registro. O código do tipo, no começo de cada um, disse ao programa como interpretar o resto.","vars":{},"rows":[[{"s":0,"n":5,"i":[["A","",6],["D","",2],["A","",6],["D","",2],["X","",0]],"l":"arquivo (A = aluno, D = disciplina)"}]],"stack":"lerMisto ← main"}]}
```

## Teste rápido

```quiz
{
  "question": "Um arquivo de cadastro tem campos como \"observações\" que variam de 0 a 2000 bytes. Qual organização tende a usar MENOS espaço?",
  "options": [
    { "text": "Registros de tamanho fixo, reservando 2000 bytes para observações", "correct": false },
    { "text": "Registros de tamanho variável", "correct": true },
    { "text": "As duas usam o mesmo espaço", "correct": false }
  ],
  "correctFeedback": "✅ Correto! No tamanho fixo, a maioria dos registros desperdiçaria quase todo o espaço reservado.",
  "incorrectFeedback": "❌ Ainda não. Reservar o pior caso em todos os registros desperdiça muito espaço (fragmentação interna). O tamanho variável usa só o necessário."
}
```

## Vídeo-resumo do tópico

[Resumo em vídeo: Arquivo misto, BLOB e comparação](videos/arquivos_mistos_e_blobs.mp4)
