## Objetivos de aprendizagem

- Entender o que é um registro de tamanho fixo.
- Declarar a `struct` e medir com `sizeof`.
- Descobrir por que o `sizeof` pode passar da soma dos campos.

## O que é?

> Todo registro tem **o mesmo número de bytes**. Todo campo também.

| Campo | Tipo em C | Bytes |
|:---|:---|---:|
| `nome` | `char[30]` | 30 |
| `curso` | `char[20]` | 20 |
| `cidade` | `char[20]` | 20 |
| **Registro** | `Aluno` | **70** |

## Teste você mesmo

Digite nos campos e mexa nos tamanhos. O que sobra é **fragmentação interna**.

```registro
{
  "title": "Monte o registro de um aluno",
  "dica": "Escreva um nome bem longo, ou use acentos (`ã` ocupa 2 bytes). Depois diminua o campo no controle de tamanho.",
  "campos": [
    { "nome": "nome", "bytes": 30, "valor": "Ana Souza" },
    { "nome": "curso", "bytes": 20, "valor": "Sistemas" },
    { "nome": "cidade", "bytes": 20, "valor": "Mariana" }
  ]
}
```

- Campo **pequeno** demais: o dado é cortado.
- Campo **grande** demais: o espaço é desperdiçado.

## A struct em C

```c
typedef struct {
    char nome[30];
    char curso[20];
    char cidade[20];
} Aluno;
```

- Use `char nome[30]`, nunca `char *nome`: o ponteiro guarda só um endereço, não o texto.
- Use `memset` para zerar o registro antes de preencher.

## Alinhamento

O compilador pode inserir bytes de **preenchimento** (*padding*) para alinhar os campos. Por isso o `sizeof` pode ser maior que a soma deles.

```alinhamento
{
  "title": "Arrume a struct",
  "dica": "Use as setas para mudar a ordem dos campos. Desafio: ache uma ordem **sem** preenchimento.",
  "campos": [
    { "decl": "char tipo", "bytes": 1, "align": 1 },
    { "decl": "int codigo", "bytes": 4, "align": 4 },
    { "decl": "char sigla[3]", "bytes": 3, "align": 1 }
  ]
}
```

> Nunca some os campos de cabeça. Use sempre `sizeof(Aluno)`.

## Código em C

Grava dois registros e pergunta ao arquivo quantos bytes ele tem.

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

> 2 registros × 70 bytes = **140 bytes**. Essa regularidade é a chave da próxima página.

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
