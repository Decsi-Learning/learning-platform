# Slides — Registros de tamanho variável

Esta apresentação reúne os conteúdos estudados neste tópico.

## Slides

Use os botões ou as setas do teclado para passar os slides.

```slides
{
  "slides": [
    { "title": "Por que tamanho variável?", "bullets": ["Registros fixos desperdiçam espaço.", "No variável, cada registro ocupa só o que precisa.", "O arquivo fica menor."] },
    { "title": "Dois problemas novos", "bullets": ["Onde acaba um campo?", "Onde acaba um registro?", "Precisamos marcar esses limites."] },
    { "title": "Delimitando campos", "bullets": ["Prefixo de tamanho: [9]Ana Souza.", "Separador: Ana Souza;Sistemas.", "Palavra-chave: nome=Ana Souza."] },
    { "title": "Delimitando registros", "bullets": ["Prefixo com o tamanho do registro.", "Delimitador de registro, como '#'.", "Número fixo de campos.", "Arquivo de índice com os offsets."] },
    { "title": "Cuidado com o separador", "bullets": ["Não pode aparecer dentro dos dados.", "'Rua A; casa 2' engana o separador ';'.", "Prefixo de tamanho evita o problema."] },
    { "title": "Achando o registro n", "bullets": ["Não existe a conta com RRN.", "Opção 1: percorrer, pulando de prefixo em prefixo.", "Opção 2: índice de byte offsets, que pode ficar na RAM."] },
    { "title": "Atualizar e remover", "bullets": ["Registro maior: grava no fim e marca o antigo.", "Remoção deixa buracos de tamanhos diferentes.", "Reaproveitamento: tópico seguinte."] },
    { "title": "Quatro técnicas para os campos", "bullets": ["Estrutura: campos de tamanho fixo (struct).", "Indicador de comprimento antes de cada campo.", "Delimitadores entre os campos.", "keyword=value, ou código do tipo de campo."] },
    { "title": "keyword=value", "bullets": ["O campo informa o próprio significado.", "Facilita ver o conteúdo e achar campos perdidos.", "Custo: os nomes ocupam espaço (overhead).", "Três separadores: nome/valor, campo/campo, fim do registro."] },
    { "title": "Arquivo misto e BLOB", "bullets": ["Arquivo misto: registros de tipos diferentes no mesmo arquivo.", "Cada registro começa com um código de tipo de registro.", "BLOB: imagem, vídeo, áudio ou texto livre.", "O BLOB fica à parte; o registro guarda um ponteiro."] },
    { "title": "Fixo x variável", "bullets": ["Fixo: simples, acesso por RRN, desperdiça espaço.", "Variável: compacto, mas exige delimitadores ou índice."] }
  ]
}
```

## Vídeo explicativo

```video
{ "title": "Registros de tamanho variável", "url": null }
```

## Conteúdos abordados

- Delimitando campos e registros
- Lendo e localizando registros
- Arquivo misto, BLOB e comparação

## Referências

- FOLK, M. J.; ZOELLICK, B. *File Structures: An Object-Oriented Approach with C++*, 3ª ed., Addison-Wesley. Assuntos: conceitos fundamentais de estrutura de arquivos (formas de organizar campos e registros, prefixos de tamanho e delimitadores) e gerenciamento de arquivos de registros.
- THARP, A. L. *File Organization and Processing*, Wiley. Assuntos: registros de tamanho fixo e variável.
- ALEXANDRE, R. F. Slides das aulas "Manipulação de arquivos de registros" (Estrutura de Dados II) e "Armazenamento de disco, estruturas de arquivo básicas e hashing" (Capítulo 17, Banco de Dados II), UFOP.

> Os livros foram citados por assunto, e não por número de página, porque a paginação muda entre edições. Confira os capítulos na sua edição.
