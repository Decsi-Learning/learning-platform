## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar o que é um registro de tamanho fixo e como seus campos são organizados.
- Declarar um registro em C com `struct` e descobrir seu tamanho com `sizeof`.
- Explicar o alinhamento de memória e por que o `sizeof` pode ser maior que a soma dos campos.
- Gravar e ler registros fixos em um arquivo binário com `fwrite` e `fread`.

### O que é um registro de tamanho fixo?

No tópico anterior vimos que um arquivo guarda **registros**, e que cada registro é formado por **campos**. Em um arquivo de **registros de tamanho fixo**, todos os registros ocupam **exatamente o mesmo número de bytes**, e isso vale para cada campo: o campo `nome` tem sempre 30 bytes, o campo `curso` tem sempre 20, e assim por diante.

Esse tamanho é decidido **antes** de gravar o primeiro registro. Depois disso, o arquivo é só uma fila de blocos de bytes do mesmo tamanho, lado a lado.

Quando o dado é menor que o campo, o resto do campo fica **sem uso**. Um nome como `Ana Souza` ocupa 9 bytes em um campo de 30, e os outros 21 bytes ficam vazios. Esse espaço reservado e não usado é a **fragmentação interna**, que vamos medir na terceira página.

### Os campos de um registro

Vamos usar o mesmo registro da página anterior, o de um aluno com nome, curso e cidade:

| Campo | Tipo em C | Bytes | Exemplo |
|:---|:---|---:|:---|
| `nome` | `char[30]` | 30 | `Ana Souza` |
| `curso` | `char[20]` | 20 | `Sistemas` |
| `cidade` | `char[20]` | 20 | `Mariana` |
| **Registro inteiro** | `Aluno` | **70** | |

O registro tem 70 bytes. Como o tamanho é conhecido, a organização dos bytes é sempre a mesma: os 30 primeiros pertencem ao nome, os 20 seguintes ao curso e os últimos 20 à cidade.

> Campos numéricos também têm tamanho fixo. Um `int` ocupa 4 bytes, seja o valor `1` ou `123456789`. O desperdício aparece principalmente nos campos de texto.

### Registro em C: a struct

Em C, o jeito natural de representar um registro de tamanho fixo é uma `struct`. O compilador já sabe quantos bytes ela ocupa, e o operador `sizeof` informa esse número.

```c
typedef struct {
    char nome[30];
    char curso[20];
    char cidade[20];
} Aluno;
```

Dois cuidados importantes na hora de montar o registro:

- Use **vetores de `char`**, nunca ponteiros (`char *nome`). Um ponteiro guarda só um endereço da memória, e esse endereço não faz sentido depois que o programa termina. Os caracteres precisam estar dentro do registro.
- Antes de preencher, **zere o registro** com `memset`. Assim os bytes que sobram no fim de cada campo ficam em zero, e não com lixo de memória que iria parar no arquivo.

### Alinhamento: quando o `sizeof` surpreende

O compilador pode inserir bytes de **preenchimento** (*padding*) entre os campos, para que cada um comece em um endereço que o processador acessa com facilidade. Um `int`, por exemplo, costuma começar em um endereço múltiplo de 4.

Por isso o `sizeof` de uma `struct` **pode ser maior que a soma dos campos**. Observe duas structs com os mesmos campos em ordens diferentes:

```c
#include <stdio.h>

struct Sem {
    char tipo;
    int codigo;
    char sigla[3];
};

struct Arrumada {
    int codigo;
    char tipo;
    char sigla[3];
};

int main(void) {
    printf("soma dos campos: %d bytes\n", 1 + 4 + 3);
    printf("sizeof(struct Sem): %zu bytes\n", sizeof(struct Sem));
    printf("sizeof(struct Arrumada): %zu bytes\n", sizeof(struct Arrumada));
    return 0;
}
```

A saída do programa é:

```text
soma dos campos: 8 bytes
sizeof(struct Sem): 12 bytes
sizeof(struct Arrumada): 8 bytes
```

Na primeira struct, o compilador coloca 3 bytes de preenchimento depois de `tipo`, para o `int` começar em um múltiplo de 4, e mais 1 byte no fim. Na segunda, com o `int` na frente, não sobra nenhum.

A regra prática é: **nunca faça a conta do tamanho de cabeça**. Use sempre `sizeof(Aluno)`, tanto para gravar quanto para calcular posições. Esse preenchimento depende do compilador e da máquina, então um arquivo gravado em um computador pode não ser lido corretamente em outro. Para as nossas aulas, o importante é usar o mesmo programa para gravar e ler.

## Estrutura

Os 70 bytes de um registro `Aluno`. Avance pelos passos para ver em quais bytes cada campo fica dentro do registro e como calcular onde ele começa:

```demo
{
  "title": "Os 70 bytes de um registro Aluno",
  "steps": [
    {
      "caption": "Um registro Aluno ocupa 70 bytes, divididos em três campos de tamanho fixo: nome (30), curso (20) e cidade (20).",
      "state": "byte:  0                       30              50             70\n       +-----------------------+---------------+---------------+\n       | nome (30 bytes)       | curso (20)    | cidade (20)   |\n       +-----------------------+---------------+---------------+"
    },
    {
      "caption": "O campo nome vem primeiro. Ele ocupa os bytes de 0 a 29, ou seja, 30 bytes.",
      "state": "nome:    começa no byte 0\n         tem 30 bytes\n         termina no byte 29    (0 + 30 - 1)"
    },
    {
      "caption": "O campo curso começa onde o nome termina, no byte 30, e ocupa os bytes de 30 a 49.",
      "state": "curso:   começa no byte 30     (tamanho do nome)\n         tem 20 bytes\n         termina no byte 49    (30 + 20 - 1)"
    },
    {
      "caption": "O campo cidade começa no byte 50 e ocupa os bytes de 50 a 69, o fim do registro.",
      "state": "cidade:  começa no byte 50     (30 + 20)\n         tem 20 bytes\n         termina no byte 69    (50 + 20 - 1)"
    },
    {
      "caption": "Regra geral: cada campo começa na soma dos tamanhos dos campos que vêm antes dele. A soma de todos dá o tamanho do registro.",
      "state": "início do campo = soma dos tamanhos dos campos anteriores\n\nnome   -> byte 0\ncurso  -> byte 30\ncidade -> byte 50\n\ntotal  -> 30 + 20 + 20 = 70 bytes"
    },
    {
      "caption": "Com os dados de Ana Souza, só 24 dos 70 bytes são usados. O resto de cada campo fica sem uso: é a fragmentação interna.",
      "state": "nome:    \"Ana Souza\"   9 de 30 bytes usados, 21 sem uso\ncurso:   \"Sistemas\"    8 de 20 bytes usados, 12 sem uso\ncidade:  \"Mariana\"     7 de 20 bytes usados, 13 sem uso\n\nusados:  9 + 8 + 7    = 24 bytes\nsem uso: 21 + 12 + 13 = 46 bytes"
    }
  ]
}
```

## Código em C

O programa abaixo cria um registro, mostra o tamanho dele e grava duas cópias em um arquivo binário. Depois ele vai até o fim do arquivo e pergunta quantos bytes o arquivo tem. Rode no seu computador e confira o resultado.

```c
#include <stdio.h>
#include <string.h>

typedef struct {
    char nome[30];
    char curso[20];
    char cidade[20];
} Aluno;

int main(void) {
    Aluno a;
    memset(&a, 0, sizeof(a));          /* zera tudo: sem lixo no arquivo */
    strcpy(a.nome, "Ana Souza");
    strcpy(a.curso, "Sistemas");
    strcpy(a.cidade, "Mariana");

    printf("tamanho do registro: %zu bytes\n", sizeof(Aluno));
    printf("bytes usados pelos dados: %zu\n", strlen(a.nome) + strlen(a.curso) + strlen(a.cidade));

    FILE *f = fopen("alunos.dat", "wb");
    fwrite(&a, sizeof(Aluno), 1, f);
    fwrite(&a, sizeof(Aluno), 1, f);
    fclose(f);

    f = fopen("alunos.dat", "rb");
    fseek(f, 0, SEEK_END);
    printf("tamanho do arquivo com 2 registros: %ld bytes\n", ftell(f));
    fclose(f);
    return 0;
}
```

A saída do programa é:

```text
tamanho do registro: 70 bytes
bytes usados pelos dados: 24
tamanho do arquivo com 2 registros: 140 bytes
```

O registro ocupa 70 bytes, mas os dados de verdade têm só 24. O arquivo com dois registros tem exatamente 2 × 70 = 140 bytes. Na próxima página você vai usar essa regularidade para ir direto a qualquer registro.

## Teste rápido

```quiz
{
  "question": "Em um arquivo de registros de tamanho fixo, o campo nome tem 30 bytes. Quantos bytes o campo ocupa para o nome \"Rui\"?",
  "options": [
    { "text": "3 bytes, só os caracteres do nome", "correct": false },
    { "text": "30 bytes, o tamanho reservado para o campo", "correct": true },
    { "text": "4 bytes, o nome mais o terminador", "correct": false }
  ],
  "correctFeedback": "✅ Correto! O campo tem sempre o mesmo tamanho. O que sobra fica sem uso e é fragmentação interna.",
  "incorrectFeedback": "❌ Ainda não. No tamanho fixo, o espaço do campo é reservado de antemão e não muda com o dado."
}
```

```quiz
{
  "question": "Por que se deve usar sizeof(Aluno), e não somar os tamanhos dos campos à mão?",
  "options": [
    { "text": "Porque o compilador pode inserir bytes de preenchimento (padding) e o sizeof já os conta", "correct": true },
    { "text": "Porque a soma dos campos é sempre maior que o sizeof", "correct": false },
    { "text": "Porque o sizeof só funciona com campos de texto", "correct": false }
  ],
  "correctFeedback": "✅ Correto! O alinhamento pode deixar o sizeof maior que a soma dos campos, e é o sizeof que vale para gravar e para calcular posições.",
  "incorrectFeedback": "❌ Ainda não. O compilador alinha os campos na memória e pode acrescentar bytes entre eles. O sizeof devolve o tamanho real da struct."
}
```
