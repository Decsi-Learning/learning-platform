# Slides — Organização de dados em arquivos

Esta apresentação reúne os conteúdos estudados neste tópico.

## Slides

Use os botões ou as setas do teclado para passar os slides.

```slides
{
  "slides": [
    { "title": "Por que arquivos?", "bullets": ["A RAM é rápida, mas pequena e volátil.", "O disco guarda muito mais e não perde os dados.", "Acessar o disco é milhares de vezes mais lento que a RAM."] },
    { "title": "Campo, registro, arquivo", "bullets": ["Campo: uma informação (nome).", "Registro: conjunto de campos de uma coisa (um aluno).", "Arquivo: conjunto de registros no disco.", "Chave: o campo que identifica o registro."] },
    { "title": "O arquivo é só uma sequência de bytes", "bullets": ["O sistema operacional não conhece campos nem registros.", "Quem define a estrutura é o programa.", "Organizar dados em arquivos é escolher e documentar essas regras."] },
    { "title": "Texto ou binário", "bullets": ["Texto: legível, maior, bom para trocar dados.", "Binário: compacto, bom para acesso direto.", "123456789 ocupa 9 bytes em texto e 4 bytes em binário."] },
    { "title": "Cabeçalho", "bullets": ["Guarda informações sobre o próprio arquivo.", "Exemplos: tamanho do registro e quantidade de registros.", "Sem ele, é preciso adivinhar o formato."] },
    { "title": "Custo de um acesso ao disco", "bullets": ["Seek: mover a cabeça até a trilha.", "Latência: esperar o setor passar.", "Transferência: ler os bytes.", "Seek e latência dominam o custo."] },
    { "title": "Buffer e blocos", "bullets": ["O disco entrega blocos, não bytes soltos.", "O buffer guarda o bloco na RAM.", "Ler em sequência aproveita o bloco inteiro."] },
    { "title": "Formas de organizar", "bullets": ["Sequencial: simples, pesquisa lenta.", "Ordenada: permite busca binária.", "Indexada: índice aponta a posição.", "Hash: função calcula a posição."] },
    { "title": "Disco: pratos, trilhas, setores e cilindros", "bullets": ["Pratos têm trilhas; trilhas têm setores.", "Trilhas empilhadas formam um cilindro.", "Arquivos são gravados por cilindro: o seek é a parte mais cara.", "O sistema operacional divide o disco em blocos de tamanho fixo."] },
    { "title": "Chave de pesquisa", "bullets": ["Primária: identifica um único registro (matrícula, CPF).", "Secundária: pode repetir (nome, cidade).", "Forma canônica: uma única representação, como letras maiúsculas.", "Chaves distintas: relação 1 para 1 com o registro."] },
    { "title": "Como manter os campos", "bullets": ["Estrutura: campos de tamanho fixo.", "Indicador de comprimento antes de cada campo.", "Delimitadores entre os campos.", "keyword=value: o campo diz o que é."] },
    { "title": "Como agrupar em registros", "bullets": ["1. Tamanho fixo.", "2. Número fixo de campos.", "3. Indicador de tamanho do registro.", "4. Índice com a posição de cada registro.", "5. Delimitador de registro."] },
    { "title": "Blocagem", "bullets": ["bfr = piso(B / R) registros por bloco.", "Sobra por bloco: B - bfr x R bytes.", "Ex.: B = 512, R = 71: bfr = 7 e sobram 15 bytes."] },
    { "title": "Espalhada x não espalhada", "bullets": ["Espalhada: o registro pode cruzar blocos (ponteiro). Obrigatória se R > B.", "Não espalhada: cada registro fica em um só bloco; a sobra é desperdiçada.", "Não espalhada é a mais comum com registros fixos."] },
    { "title": "Quando a busca sequencial basta", "bullets": ["Poucos registros (cerca de 10).", "Arquivo pouco consultado, como o de fita.", "Busca de cadeia em arquivo ASCII.", "Chave secundária com muitas ocorrências."] },
    { "title": "Ideia para guardar", "bullets": ["A pergunta central é: quantos acessos ao disco?", "Boa organização de arquivo = poucos acessos."] }
  ]
}
```

## Vídeo explicativo

```video
{ "title": "Organização de dados em arquivos", "url": null }
```

## Conteúdos abordados

- Campos, registros e chaves
- O disco, os buffers e a blocagem
- Acesso sequencial e acesso direto
- Complemento: armazenamento e alocação (Cap. 17)

## Referências

- FOLK, M. J.; ZOELLICK, B. *File Structures: An Object-Oriented Approach with C++*, 3ª ed., Addison-Wesley. Assuntos: operações fundamentais de arquivos, armazenamento secundário e conceitos fundamentais de estrutura de arquivos (campos, registros, cabeçalhos).
- THARP, A. L. *File Organization and Processing*, Wiley. Assuntos: dispositivos de armazenamento e organização básica de arquivos.
- ALEXANDRE, R. F. Slides das aulas "Manipulação de arquivos de registros" (Estrutura de Dados II) e "Armazenamento de disco, estruturas de arquivo básicas e hashing" (Capítulo 17, Banco de Dados II), UFOP.

> Os livros foram citados por assunto, e não por número de página, porque a paginação muda entre edições. Confira os capítulos na sua edição.
