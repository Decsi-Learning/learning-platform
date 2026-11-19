# Organização de dados em arquivos

### Hierarquia de dados:
1. **Byte:** Menor unidade endereçável de armazenamento no arquivo (composta por $8$ bits).
2. **Campo (*Field*):** Menor unidade lógica de informação com significado próprio (ex.: nome, CPF, matrícula).
3. **Registro (*Record*):** Coleção de campos relacionados que descrevem uma entidade e seus atributos.
4. **Arquivo (*File*):** Sequência de registros armazenados sob um mesmo identificador. Comumente, todos os registros de um arquivo pertencem ao mesmo tipo.
5. **Bloco (ou Página de Disco):** Unidade física de transferência de dados entre o disco e a memória principal, definida pelo sistema operacional na formatação.

---

### Exemplo de registro em C:

```c
struct aluno
{
    char nome[40];
    char cpf[11];
    char matricula[7];
    float coeficiente_r;
};

```

### BLOB (*Binary Large Objects*)
Quando um registro precisa associar dados não estruturados muito grandes (como imagens, áudios, vídeos ou textos extensos), o conteúdo do BLOB costuma ser gravado separadamente em um conjunto próprio de blocos de disco, mantendo apenas um ponteiro dentro do registro principal.

### Arquivo tipo stream
Os dados são escritos como uma sequência de bytes consecutivos em um arquivo. Não possui delimitadores ou qualquer forma para distinção de campos e registros. Uma vez gravados, torna-se impossível separar onde termina um campo e começa outro.

---

### Organização em Campos

Para preservar a identidade lógica dos campos dentro de um arquivo, utilizam-se quatro técnicas principais:

1. **Uso de Estruturas (Tamanho Fixo):** Define-se previamente uma quantidade fixa de bytes para cada campo (como na `struct` em C).
2. **Indicador de Comprimento (*Length Indicator*):** Armazena-se o tamanho do campo (em bytes) imediatamente antes do seu valor (ex.: `03Ana04Joao`).
3. **Separação por Delimitadores:** Insere-se um caractere especial reservado — que não faça parte dos dados válidos, como `|` ou `#` — ao final de cada campo (ex.: `Ana|12345678900|2315684|`).
4. **Expressões `keyword=value`:** Cada campo carrega seu próprio identificador semântico junto ao valor (ex.: `NOME=Ana|CPF=12345678900`). Facilita a identificação de campos opcionais ou fora de ordem, mas introduz sobrecarga (*overhead*) de espaço devido à repetição das palavras-chave.

### Organização em Registros

Um arquivo pode ser definido como uma sequência de registros. Dependendo da natureza dos dados, adotam-se duas abordagens principais:

- **Registros de tamanho fixo.**
- **Registros de tamanho variável.**

> Assunto abordado nos tópicos seguintes.

## Quiz

Questão 1:

```quiz
{
  "question": "De acordo com a hierarquia de dados e a estruturação de registros em arquivos, como funciona o armazenamento de dados do tipo BLOB (Binary Large Objects) e qual é a unidade física de transferência entre o disco e a memória principal?",
  "options": [
    { "text": "O conteúdo do BLOB é gravado separadamente em um conjunto próprio de blocos de disco, mantendo apenas um ponteiro no registro principal; a unidade física de transferência é o Bloco (ou Página de Disco).", "correct": true },
    { "text": "O conteúdo do BLOB é armazenado diretamente dentro de um vetor de caracteres fixo no registro principal; a unidade física de transferência é o Registro (Record).", "correct": false },
    { "text": "O conteúdo do BLOB é gravado como um arquivo do tipo stream sem ponteiros; a unidade física de transferência é o Campo (Field).", "correct": false },
    { "text": "O conteúdo do BLOB é dividido em bytes isolados dentro do cabeçalho do arquivo; a unidade física de transferência é o Byte.", "correct": false }
  ],
  "correctFeedback": "Correto! Dados não estruturados muito grandes (BLOBs) ficam em blocos próprios de disco com apenas um ponteiro no registro principal, e o Bloco (ou Página de Disco) é a unidade física de transferência definida pelo sistema operacional na formatação.",
  "incorrectFeedback": "Incorreto. O BLOB é armazenado separadamente em blocos próprios mantendo apenas um ponteiro no registro principal, enquanto o Bloco (ou Página de Disco) é a unidade física de transferência."
}
```

Questão 2:

```quiz

{
  "question": "Entre as quatro técnicas principais utilizadas para preservar a identidade lógica dos campos dentro de um arquivo, qual vantagem e qual desvantagem caracterizam o uso de expressões do tipo `keyword=value` (como `NOME=Ana|CPF=12345678900`)?",
  "options": [
    { "text": "Elimina completamente o desperdício de espaço em disco, mas impede que os campos sejam identificados caso estejam fora de ordem.", "correct": false },
    { "text": "Armazena o tamanho em bytes imediatamente antes de cada valor, mas exige que o caractere reservado faça parte dos dados válidos.", "correct": false },
    { "text": "Facilita a identificação de campos opcionais ou fora de ordem, mas introduz sobrecarga (overhead) de espaço devido à repetição das palavras-chave.", "correct": true },
    { "text": "Define previamente uma quantidade fixa de bytes para cada campo, mas torna impossível distinguir onde termina um campo e começa outro.", "correct": false }
  ],
  "correctFeedback": "Correto! Como cada campo carrega seu próprio identificador semântico junto ao valor, fica fácil reconhecer campos opcionais ou fora de ordem, ao custo de um overhead de espaço pela repetição das keywords.",
  "incorrectFeedback": "Incorreto. A técnica `keyword=value` facilita identificar campos opcionais ou fora de ordem, porém gera sobrecarga (overhead) de espaço devido à repetição das palavras-chave."
}
```

Questão 3:

```quiz
{
  "question": "Sobre a gravação de dados em um arquivo do tipo stream e as técnicas alternativas para distinguir campos em um arquivo, assinale a alternativa correta:",
  "options": [
    { "text": "No arquivo tipo stream, utiliza-se um indicador de comprimento (como `03Ana04Joao`) antes de cada dado para permitir a separação automática dos registros.", "correct": false },
    { "text": "Na técnica de separação por delimitadores, utilizam-se caracteres que fazem parte dos dados válidos do campo (como letras ou dígitos do CPF) para encerrar cada campo.", "correct": false },
    { "text": "Na hierarquia de dados, o Registro é a menor unidade lógica de informação com significado próprio, enquanto o Campo é composto por 8 bits.", "correct": false },
    { "text": "No arquivo tipo stream, os dados são escritos como uma sequência de bytes consecutivos sem delimitadores, tornando impossível separar onde termina um campo e começa outro após a gravação.", "correct": true }
  ],
  "correctFeedback": "Correto! Um arquivo tipo stream grava bytes consecutivos sem qualquer forma de distinção de campos e registros, impossibilitando separá-los posteriormente.",
  "incorrectFeedback": "Incorreto. No arquivo tipo stream não há delimitadores nem distinção entre campos e registros, sendo impossível separar onde um campo termina e outro começa depois de gravados."
}
```