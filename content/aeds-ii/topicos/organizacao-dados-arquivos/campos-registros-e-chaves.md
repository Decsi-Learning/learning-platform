## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Diferenciar campo, registro, arquivo e chave.
- Distinguir chave primária de chave secundária e explicar a forma canônica.
- Descrever as técnicas para manter os campos e os métodos para agrupar registros.
- Comparar arquivos de texto e binários e explicar o papel do cabeçalho.

## Conexão com a Trilha

Nos tópicos anteriores você viu como os arquivos guardam dados e como acessá-los em sequência ou direto. Agora damos nome às peças que formam um arquivo: campo, registro e chave. Elas são o vocabulário de todo o resto da disciplina.

### Por que precisamos de arquivos?

A memória principal (a RAM) é rápida, mas tem dois problemas. Ela some quando o computador desliga, e é pequena perto da quantidade de dados que um sistema real guarda. A **memória secundária** (disco rígido, SSD, fita) guarda muito mais e **não perde os dados**. Para usá-la, organizamos os dados em **arquivos**.

O ponto central deste tópico é o custo. Ler um dado da RAM leva nanossegundos. Ler de um disco giratório leva milissegundos, dezenas de milhares de vezes mais. Por isso, quando trabalhamos com arquivos, a pergunta mais importante é: **quantas vezes preciso ir ao disco?** Quase toda técnica da disciplina tenta diminuir esse número.

### Campo, registro e arquivo

Existe uma hierarquia simples:

- **Campo:** a menor unidade de informação com significado, como o nome ou o telefone de uma pessoa.
- **Registro:** um conjunto de campos que descreve uma coisa só, como todos os dados de um aluno.
- **Arquivo:** um conjunto de registros guardado em memória secundária, como o cadastro de todos os alunos.
- **Chave:** o campo (ou os campos) que identifica um registro, como a matrícula. É com ela que pesquisamos.

Pense numa agenda de papel. Cada informação (nome, telefone) é um campo. Cada página de contato é um registro. A agenda inteira é o arquivo.

### Chave de pesquisa

Para achar um registro sem ler o arquivo inteiro, damos a ele uma **chave**. A chave é um campo, ou um conjunto de campos, que identifica o registro.

- **Chave primária:** identifica **um único** registro. O ideal é uma relação de um para um entre chave e registro, ou seja, **chaves distintas**. Exemplos: matrícula e CPF.
- **Chave secundária:** em geral **não** identifica um único registro. Ela serve para buscar vários de uma vez. Exemplo: todos os "Alexandre" que moram em Belo Horizonte.
- O **nome** não é uma boa chave primária, porque duas pessoas podem ter o mesmo nome. Mas é uma boa chave secundária, porque muitas vezes queremos mesmo achar todos os registros com aquele nome.
- **Forma canônica da chave:** é uma única maneira de escrever a chave, definida por uma regra. Se a regra diz "letras maiúsculas", tudo o que o usuário digitar ("ana", "Ana") vira "ANA" antes da pesquisa. O arquivo também deve guardar a chave nessa forma. Sem isso, "ana" e "ANA" seriam chaves diferentes.

### Fluxo de bytes e arquivo de registros

Para o sistema operacional, um arquivo é só uma **sequência de bytes**. Ele não sabe o que é "campo" nem "registro". Quem dá essa estrutura é o **seu programa**, com regras como "cada registro tem 100 bytes" ou "os campos são separados por ponto e vírgula". Por isso falamos em *organizar dados em arquivos*: escolher e documentar essas regras.

### Como não perder os campos e os registros

Em um arquivo em *stream* não há como separar o nome do endereço sozinho. Para manter os campos existem quatro técnicas:

| Técnica | Ideia |
|---|---|
| Estrutura (campos de tamanho fixo) | Cada campo tem um tamanho combinado de antemão, como em uma `struct` de C |
| Indicador de comprimento | O tamanho de cada campo é guardado logo antes do dado |
| Delimitadores | Um caractere especial separa um campo do próximo |
| *keyword=value* | Cada campo vem com o nome, como `nome=Ana`. O campo informa o próprio significado |

A técnica *keyword=value* facilita identificar o conteúdo do arquivo e perceber campos perdidos. Em troca, os nomes ocupam espaço. Esse custo extra (*overhead*) é desprezível em algumas aplicações.

Para agrupar os campos em registros existem cinco métodos:

1. registros de tamanho fixo;
2. número fixo de campos por registro;
3. um indicador com o tamanho do registro;
4. um índice com a posição inicial de cada registro;
5. um delimitador entre os registros.

Os próximos tópicos detalham o método 1 (tamanho fixo) e os métodos de 2 a 5 (tamanho variável).

### Arquivo de texto ou binário?

| Característica | Texto | Binário |
|---|---|---|
| Como o número 123456789 é guardado | 9 caracteres, ou seja, 9 bytes | 1 inteiro de 4 bytes |
| Dá para abrir em um editor de texto | Sim | Não, aparece lixo |
| Tamanho do arquivo | Maior | Menor |
| Facilidade de depurar | Alta | Baixa |
| Acesso direto a um registro | Difícil, pois os tamanhos variam | Fácil se o tamanho for fixo |

Arquivos binários são mais compactos e permitem acesso direto. Arquivos de texto são mais fáceis de ler e de trocar entre programas.

### Cabeçalho do arquivo

Muitos arquivos começam com um **cabeçalho**. É uma área com informações sobre o próprio arquivo, como o tamanho de cada registro, a quantidade de registros e a versão do formato. Sem ele, quem abre o arquivo depois precisa adivinhar a estrutura.

Em sistemas de arquivos e bancos de dados, o cabeçalho também se chama **descritor de arquivo**. Ele registra ainda os endereços dos blocos do arquivo, o formato dos campos (tamanhos e ordem), os caracteres separadores e, quando existem, os códigos de tipo de registro.

## Estrutura

Veja como um arquivo binário de registros de tamanho fixo pode ser organizado. Os números mostram os bytes ocupados e os deslocamentos (*offsets*), contados a partir do início do arquivo.

```estrutura
ARQUIVO alunos.dat

 offset 0    +----------------------------------------+
             | CABEÇALHO (64 bytes)                   |
             |  versão .............. 1 byte          |
             |  tamanho do registro . 4 bytes (= 100) |
             |  qtd. de registros ... 4 bytes         |
             |  (reservado) ......... 55 bytes        |
 offset 64   +----------------------------------------+
             | REGISTRO 0 (100 bytes)                 |
             |  matrícula  4 bytes                    |
             |  nome       60 bytes                   |
             |  curso      30 bytes                   |
             |  ano        4 bytes                    |
             |  (vazio)    2 bytes                    |
 offset 164  +----------------------------------------+
             | REGISTRO 1 (100 bytes)                 |
 offset 264  +----------------------------------------+
             | REGISTRO 2 (100 bytes)                 |
             +----------------------------------------+
                           ...
```

## Código em C

### Chave primária, chave secundária e forma canônica

O programa abaixo guarda 5 alunos. A matrícula é a chave primária. O nome é uma chave secundária, e os nomes ficam em letras maiúsculas.

O usuário digita `ana` em minúsculas. Clique em **Executar** e veja duas coisas:

- A forma canônica transforma `ana` em `ANA` antes da comparação.
- A chave secundária acha **dois** alunos. A chave primária (a matrícula) acha **um** só e pode parar assim que o encontra.

```codigo
{
  "title": "Chave primária, chave secundária e forma canônica passo a passo",
  "code": [
    "#include <stdio.h>",
    "#include <string.h>",
    "#include <ctype.h>",
    "",
    "struct aluno {",
    "    int  matricula;                /* chave primária: identifica UM aluno */",
    "    char nome[12];                 /* chave secundária: pode repetir; guardado em MAIÚSCULAS */",
    "};",
    "",
    "/* forma canônica da chave: tudo em maiúsculas */",
    "void canonica(char *s) {",
    "    for (; *s; s++) {",
    "        *s = (char)toupper((unsigned char)*s);",
    "    }",
    "}",
    "",
    "/* chave secundária: acha TODOS os alunos com esse nome */",
    "int buscaPorNome(FILE *f, const char *digitado) {",
    "    struct aluno a;",
    "    char chave[12];",
    "    int achados = 0;",
    "    strcpy(chave, digitado);",
    "    canonica(chave);",
    "    rewind(f);",
    "    for (int rrn = 0; fread(&a, sizeof(a), 1, f) == 1; rrn++) {",
    "        if (strcmp(a.nome, chave) == 0) {",
    "            printf(\"achei a matricula %d\\n\", a.matricula);",
    "            achados++;",
    "        }",
    "    }",
    "    return achados;",
    "}",
    "",
    "/* chave primária: para no primeiro registro, porque só existe um */",
    "int buscaPorMatricula(FILE *f, int matricula, struct aluno *a) {",
    "    rewind(f);",
    "    for (int rrn = 0; fread(a, sizeof(*a), 1, f) == 1; rrn++) {",
    "        if (a->matricula == matricula) {",
    "            return 1;",
    "        }",
    "    }",
    "    return 0;",
    "}",
    "",
    "int main(void) {",
    "    FILE *f = fopen(\"alunos.dat\", \"w+b\");",
    "    struct aluno alunos[5] = {{1001, \"ANA\"}, {1002, \"BETO\"}, {1003, \"LUIZ\"}, {1004, \"ANA\"}, {1005, \"EVA\"}};",
    "    fwrite(alunos, sizeof(alunos[0]), 5, f);",
    "    buscaPorNome(f, \"ana\");",
    "    struct aluno a;",
    "    buscaPorMatricula(f, 1003, &a);",
    "    printf(\"matricula 1003: %s\\n\", a.nome);",
    "    fclose(f);",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 49,
      "caption": "O arquivo alunos.dat tem 5 registros. Cada um tem uma matrícula, que é a chave primária e não se repete, e um nome, que é uma chave secundária e pode se repetir. Os nomes estão guardados em letras maiúsculas.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "main"
    },
    {
      "line": 23,
      "caption": "O usuário digitou \"ana\" em letras minúsculas. Se comparássemos assim, nenhum nome do arquivo seria igual, porque ali está \"ANA\".",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}], [{"i": [["a", "c", 1], ["n", "c", 2], ["a", "c", 1]], "l": "chave usada na busca"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 24,
      "caption": "Aplicamos a forma canônica da chave: tudo em maiúsculas. Agora a chave é \"ANA\" e pode ser comparada com o arquivo.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}], [{"i": [["A", "p", 5], ["N", "p", 6], ["A", "p", 5]], "l": "chave usada na busca"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 26,
      "caption": "Registro 0 (matrícula 1001): o nome é \"ANA\". Será igual a \"ANA\"? Sim! Achamos um.",
      "vars": {"rrn": 0},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "p", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "p", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 26,
      "caption": "Registro 1 (matrícula 1002): o nome é \"BETO\". Será igual a \"ANA\"? Não.",
      "vars": {"rrn": 1},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "c", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "c", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 26,
      "caption": "Registro 2 (matrícula 1003): o nome é \"LUIZ\". Será igual a \"ANA\"? Não.",
      "vars": {"rrn": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "c", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "c", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 26,
      "caption": "Registro 3 (matrícula 1004): o nome é \"ANA\". Será igual a \"ANA\"? Sim! Achamos um.",
      "vars": {"rrn": 3},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "p", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "p", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 26,
      "caption": "Registro 4 (matrícula 1005): o nome é \"EVA\". Será igual a \"ANA\"? Não.",
      "vars": {"rrn": 4},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "c", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "c", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 31,
      "caption": "Fim do arquivo. A chave secundária achou 2 registros (matrículas 1001 e 1004). Precisamos ler o arquivo todo, porque podia haver mais alunos com esse nome.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorNome ← main"
    },
    {
      "line": 51,
      "caption": "Agora a busca pela chave primária: queremos a matrícula 1003.",
      "vars": {},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "main"
    },
    {
      "line": 38,
      "caption": "Registro 0: a matrícula é 1001. É igual a 1003? Não.",
      "vars": {"rrn": 0},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "c", 5], ["BETO", "", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "c", 5], ["1002", "", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorMatricula ← main"
    },
    {
      "line": 38,
      "caption": "Registro 1: a matrícula é 1002. É igual a 1003? Não.",
      "vars": {"rrn": 1},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "c", 6], ["LUIZ", "", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "c", 6], ["1003", "", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorMatricula ← main"
    },
    {
      "line": 38,
      "caption": "Registro 2: a matrícula é 1003. É igual a 1003? Sim!",
      "vars": {"rrn": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "p", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "p", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorMatricula ← main"
    },
    {
      "line": 39,
      "caption": "Achamos: é o aluno LUIZ. Como a matrícula é única, podemos parar aqui. Não precisamos ler o resto do arquivo.",
      "vars": {"rrn": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["ANA", "", 5], ["BETO", "", 6], ["LUIZ", "p", 4], ["ANA", "", 5], ["EVA", "", 9]], "l": "nome (chave secundária)"}], [{"s": 0, "n": 5, "i": [["1001", "", 5], ["1002", "", 6], ["1003", "p", 4], ["1004", "", 5], ["1005", "", 9]], "l": "matrícula (chave primária)"}]],
      "stack": "buscaPorMatricula ← main"
    }
  ]
}
```

### Lendo campos separados por um delimitador

Este programa lê um arquivo em que os campos são separados por `|`. A função `lerCampo` devolve um campo de cada vez, e o programa principal imprime todos.

```c
#include <stdio.h>
#include <string.h>

/* Lê o próximo campo: devolve o tamanho dele, ou -1 se acabou o arquivo.
   Os campos são separados pelo caractere delimitador (aqui, '|'). */
int lerCampo(FILE *f, char *campo, char delimitador) {
    int tam = 0, c;
    while ((c = fgetc(f)) != EOF) {
        if (c == delimitador) {
            campo[tam] = '\0';
            return tam;                    /* terminou um campo (pode ser vazio) */
        }
        campo[tam++] = (char)c;
    }
    campo[tam] = '\0';
    return tam > 0 ? tam : -1;             /* último campo, sem delimitador no fim */
}

int main(void) {
    FILE *f = fopen("campos.txt", "w+");
    fputs("Ana Souza|Sistemas|Mariana", f);
    rewind(f);
    char campo[50];
    int contador = 0;
    while (lerCampo(f, campo, '|') >= 0) {
        contador++;
        printf("Campo #%d: %s\n", contador, campo);
    }
    fclose(f);
    return 0;
}
```

A saída do programa é:

```text
Campo #1: Ana Souza
Campo #2: Sistemas
Campo #3: Mariana
```

## Teste rápido

```quiz
{
  "question": "Em um arquivo de alunos, a matrícula de cada aluno é usada para localizar o registro. Como chamamos a matrícula?",
  "options": [
    { "text": "Registro", "correct": false },
    { "text": "Chave", "correct": true },
    { "text": "Buffer", "correct": false }
  ],
  "correctFeedback": "✅ Correto! A chave é o campo que identifica o registro e é usada na pesquisa.",
  "incorrectFeedback": "❌ Ainda não. O registro é o conjunto de campos; o campo que identifica o registro é a chave."
}
```

```quiz
{
  "question": "Em um cadastro de alunos, qual campo é a melhor escolha de chave primária?",
  "options": [
    { "text": "Nome", "correct": false },
    { "text": "Matrícula", "correct": true },
    { "text": "Curso", "correct": false }
  ],
  "correctFeedback": "✅ Correto! A matrícula identifica um único aluno. Nome e curso se repetem, então servem melhor como chaves secundárias.",
  "incorrectFeedback": "❌ Ainda não. A chave primária precisa identificar UM registro. Nomes e cursos se repetem entre alunos."
}
```
