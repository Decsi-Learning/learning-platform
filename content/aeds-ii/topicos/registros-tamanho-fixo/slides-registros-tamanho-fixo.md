# Slides — Registros de tamanho fixo

Esta apresentação reúne os conteúdos estudados neste tópico.

## Slides

Use os botões ou as setas do teclado para passar os slides.

```slides
{
  "slides": [
    {
      "title": "O que é tamanho fixo?",
      "bullets": [
        "Todos os registros têm o mesmo número de bytes.",
        "Cada campo também tem tamanho combinado de antemão.",
        "O tamanho é decidido antes de gravar."
      ]
    },
    {
      "title": "Registro em C",
      "bullets": [
        "Uma struct com vetores de char (nunca ponteiros).",
        "sizeof(Aluno) dá o tamanho real.",
        "memset zera os bytes antes de preencher."
      ]
    },
    {
      "title": "Alinhamento",
      "bullets": [
        "O compilador pode inserir bytes de preenchimento.",
        "O sizeof pode ser maior que a soma dos campos.",
        "Não faça a conta de cabeça: use sempre o sizeof."
      ]
    },
    {
      "title": "Gravar e ler",
      "bullets": [
        "fwrite(&reg, sizeof(Aluno), 1, f) grava um registro.",
        "fread(&reg, sizeof(Aluno), 1, f) lê um registro.",
        "Arquivo binário: cópia direta de bytes entre RAM e disco."
      ]
    },
    {
      "title": "Cabeçalho e RRN",
      "bullets": [
        "Cabeçalho: quantidade de registros, tamanho do registro, versão.",
        "RRN: posição do registro, contada a partir de zero.",
        "O RRN diz qual é o registro, não o byte."
      ]
    },
    {
      "title": "A conta do offset",
      "bullets": [
        "offset = cabeçalho + RRN x tamanho.",
        "Ex.: 8 + 3 x 70 = 218.",
        "Um fseek leva direto ao registro."
      ]
    },
    {
      "title": "Acesso direto",
      "bullets": [
        "O custo não depende do RRN.",
        "Sequencial: lê todos os anteriores.",
        "Busca binária usa o acesso por RRN."
      ]
    },
    {
      "title": "Atualizar e remover",
      "bullets": [
        "Atualizar: regrava no mesmo lugar, sempre cabe.",
        "Remover: em geral uma marca de remoção lógica.",
        "Qualquer registro novo cabe no buraco."
      ]
    },
    {
      "title": "Fator de bloco",
      "bullets": [
        "fb = tamanho do bloco ÷ tamanho do registro (divisão inteira).",
        "blocos = registros ÷ fb, arredondado para cima.",
        "4096 ÷ 70 = 58, sobram 36 bytes."
      ]
    },
    {
      "title": "Espalhada x não espalhada",
      "bullets": [
        "Não espalhada: registro inteiro em um bloco, com sobra.",
        "Espalhada: aproveita tudo, mas o registro pode cruzar blocos.",
        "Com tamanho fixo, a sobra é igual em todos os blocos."
      ]
    },
    {
      "title": "Fragmentação interna",
      "bullets": [
        "Espaço reservado e não usado dentro do registro.",
        "Ana Souza: 24 de 70 bytes são dados, 46 são desperdício.",
        "Campo pequeno corta dados; campo grande desperdiça."
      ]
    },
    {
      "title": "Quando usar",
      "bullets": [
        "Bom: dados de tamanho parecido, acesso direto, código simples.",
        "Ruim: dados que variam muito de tamanho.",
        "Nesse caso, veja registros de tamanho variável."
      ]
    }
  ]
}
```

## Vídeo explicativo

```video
{ "title": "Registros de tamanho fixo", "url": null }
```

## Conteúdos abordados

- Campos e registros de tamanho fixo
- RRN e acesso direto
- Blocos, fragmentação interna e limites

## Referências

- FOLK, M. J.; ZOELLICK, B. *File Structures: An Object-Oriented Approach with C++*, 3ª ed., Addison-Wesley. Assuntos: registros de tamanho fixo, cabeçalhos de arquivo, acesso direto por número relativo do registro (RRN) e blocagem.
- THARP, A. L. *File Organization and Processing*, Wiley. Assuntos: registros de tamanho fixo e variável, blocagem e fragmentação.
- ALEXANDRE, R. F. Slides das aulas "Manipulação de arquivos de registros" (Estrutura de Dados II) e "Armazenamento de disco, estruturas de arquivo básicas e hashing" (Capítulo 17, Banco de Dados II), UFOP.

> Os livros foram citados por assunto, e não por número de página, porque a paginação muda entre edições. Confira os capítulos na sua edição.
