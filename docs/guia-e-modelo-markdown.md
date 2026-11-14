# Guia da equipe: conteúdo em Markdown

Este guia reúne a estrutura recomendada para as aulas e um esqueleto copiável. Use Markdown para o texto e os catálogos JSON para títulos, ordem e navegação. Não escreva HTML, CSS ou JavaScript dentro das aulas.

## Como adicionar uma aula

1. Escolha a trilha: `aeds-i` ou `aeds-ii`.
2. Crie um arquivo `.md` em `content/<trilha>/topicos/`, por exemplo `content/aeds-i/topicos/recursividade.md`.
3. Registre o tópico em `content/<trilha>/topicos.json`.
4. Publique o `.md` e o JSON juntos. O site usa o JSON para encontrar o arquivo.

Para um tópico com uma única página, adicione um objeto a `topics`:

```json
{
  "id": "recursividade",
  "title": "Recursividade",
  "summary": "Conceitos e formas de recursão usados em algoritmos.",
  "file": "recursividade.md"
}
```

Use IDs curtos, únicos dentro da trilha, sem espaços e sem acentos. O campo `file` é só o nome do `.md`; o arquivo fica na pasta `topicos/` da trilha.

### Dividir um tópico em páginas

Se o assunto precisar de subtópicos, use `pages`. A ordem do array determina a navegação interna. Cada página precisa do próprio `.md`:

```json
{
  "id": "listas",
  "title": "Listas",
  "summary": "Estruturas lineares encadeadas.",
  "pages": [
    {
      "id": "lista-simples",
      "title": "Lista simplesmente encadeada",
      "summary": "Cada nó guarda o dado e uma referência ao próximo.",
      "file": "lista-simples.md"
    },
    {
      "id": "lista-dupla",
      "title": "Lista duplamente encadeada",
      "summary": "Cada nó aponta para o anterior e para o próximo.",
      "file": "lista-dupla.md"
    }
  ]
}
```

Para reordenar, mova as entradas no array `topics` ou `pages`. Os botões anterior e próximo acompanham essa ordem.

## Elementos disponíveis no Markdown

### Títulos e texto

O título principal da página vem do campo `title` no catálogo. Dentro do arquivo, comece normalmente com `##` e use `###` para subdivisões.

```markdown
## Conceito
Escreva parágrafos curtos, com uma ideia principal em cada um.

### Como funciona
Explique o processo ou a regra com suas próprias palavras.
```

Também é possível usar **negrito**, *itálico*, `código em linha` e uma linha horizontal:

```markdown
**termo importante** · *termo em outro idioma* · `nome_de_variavel`

---
```

O renderizador reconhece títulos `#`, `##` e `###`; prefira `##` e `###` no corpo para manter uma hierarquia clara abaixo do título da página.

### Listas e citações

```markdown
1. Primeiro passo
2. Segundo passo

- Primeiro item
- Segundo item

> Use uma citação para destacar uma regra, observação ou definição curta.
```

### Exemplos de código

Use três crases antes e depois do exemplo. O texto depois das crases é opcional e serve para identificar o tipo de código:

````markdown
```c
int soma = a + b;
```
````

### Tabelas

Separe as colunas com `|` e coloque uma linha de traços após o cabeçalho. Os dois-pontos controlam o alinhamento.

```markdown
| Operação | Descrição | Custo |
|:--|:--|--:|
| Inserir | Adiciona um elemento | O(1) |
| Buscar | Procura um elemento | O(n) |
```

Em telas estreitas, tabelas largas podem ser roladas horizontalmente.

### Links e materiais em PDF ou vídeo

Use `[texto do link](URL)` para um link HTTPS. Links comuns abrem em outra aba. Links diretos terminados em `.pdf` aparecem em um visualizador incorporado; links diretos terminados em `.mp4`, `.webm` ou `.ogv` aparecem em um reprodutor de vídeo.

```markdown
[Abrir referência externa](https://exemplo.org/referencia)

[Material complementar em PDF](https://SEU_BUCKET.r2.dev/pasta/material.pdf)

[Aula em vídeo](https://SEU_BUCKET.r2.dev/pasta/aula.mp4)
```

Use links diretos para arquivos de vídeo. Links do YouTube e de outras páginas de vídeo ficam como links externos, não como vídeo incorporado. O endereço público do R2 deve incluir o caminho completo do objeto; espaços no nome aparecem como `%20`.

### Imagens

Use `![descrição](caminho)` e, opcionalmente, defina alinhamento e largura. O texto entre colchetes é o texto alternativo da imagem; descreva o que ela mostra.

```markdown
![Nós de uma lista encadeada](https://SEU_BUCKET.r2.dev/imagens/lista.png){align=right width=38%}

Este parágrafo começa ao lado da imagem. Continue o texto normalmente.
```

Alinhamentos disponíveis:

- `align=left`: imagem à esquerda, com o texto fluindo à direita.
- `align=right`: imagem à direita, com o texto fluindo à esquerda.
- `align=center`: imagem centralizada, no ponto onde foi inserida.
- `width=38%` ou `width=320px`: largura opcional. Sem largura, cada alinhamento usa seu tamanho padrão.

Para colocar uma imagem acima ou abaixo de um trecho, deixe-a em sua própria linha entre os parágrafos. Imagens laterais viram imagens centralizadas em telas pequenas para manter o texto legível.

Os arquivos de imagem podem estar no R2 ou junto ao Markdown. Para uma imagem local na mesma pasta do `.md`, use, por exemplo, `![Diagrama](diagrama.png)`; para uma subpasta, use `![Diagrama](imagens/diagrama.png)`. O caminho relativo é calculado a partir do arquivo Markdown.

### Testes de conhecimento

Crie cada questão com um bloco cercado por três crases seguido de `quiz`. O conteúdo do bloco precisa ser JSON válido e ter uma pergunta, pelo menos duas alternativas e exatamente uma alternativa marcada com `"correct": true`.

````markdown
```quiz
{
  "question": "Qual estrutura segue a regra FIFO?",
  "options": [
    { "text": "Pilha", "correct": false },
    { "text": "Fila", "correct": true }
  ],
  "correctFeedback": "Correto! FIFO significa que o primeiro a entrar é o primeiro a sair.",
  "incorrectFeedback": "Revise a diferença entre FIFO e LIFO e tente novamente."
}
```
````

Uma página pode conter várias questões. O sistema mostra o feedback após a resposta e permite tentar novamente. Para exigir que o estudante marque uma opção em cada questão antes de avançar ou finalizar, inclua `"requiresQuizAnswers": true` no objeto da página no catálogo:

```json
{
  "id": "exercicios-fila",
  "title": "Exercícios sobre filas",
  "summary": "Verifique se entendeu FIFO.",
  "file": "exercicios-fila.md",
  "requiresQuizAnswers": true
}
```

Essa opção exige uma resposta selecionada em cada pergunta; ela não exige que a resposta esteja correta. Só use o bloqueio em páginas que contenham ao menos um bloco `quiz`.

## Modelo copiável de aula

Copie o trecho abaixo para um novo arquivo `.md` e substitua os textos entre colchetes. Remova seções que não forem necessárias.

````markdown
## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- [Objetivo 1]
- [Objetivo 2]

## Introdução

[Apresente o assunto e explique por que ele é importante.]

## Conceito principal

[Defina o conceito com clareza.]

### Como funciona

[Explique as etapas ou regras.]

> [Inclua aqui uma observação importante, se necessário.]

## Exemplo

[Explique um exemplo passo a passo.]

```text
[Pseudocódigo ou exemplo]
```

## Comparação ou resumo

| Conceito | Descrição | Observação |
|:--|:--|:--|
| [Item A] | [Descrição] | [Observação] |

## Imagem opcional

![Descreva a imagem](https://SEU_BUCKET.r2.dev/caminho/imagem.png){align=right width=38%}

[Escreva o parágrafo que ficará ao lado da imagem.]

## Material complementar opcional

[PDF complementar](https://SEU_BUCKET.r2.dev/caminho/material.pdf)

[Vídeo complementar](https://SEU_BUCKET.r2.dev/caminho/aula.mp4)

## Teste de conhecimento

```quiz
{
  "question": "[Escreva uma pergunta objetiva.]",
  "options": [
    { "text": "[Alternativa A]", "correct": false },
    { "text": "[Alternativa B]", "correct": true },
    { "text": "[Alternativa C]", "correct": false }
  ],
  "correctFeedback": "[Explique por que a resposta está correta.]",
  "incorrectFeedback": "[Dê uma dica para revisar o assunto.]"
}
```
````

## Padrão visual e cuidados

- Prefira parágrafos curtos, títulos descritivos e exemplos próximos do conteúdo.
- Use texto alternativo que descreva a imagem; não dependa apenas da cor para transmitir uma informação.
- Evite tabelas muito largas e imagens laterais com largura acima de 45% quando houver muito texto.
- Não adicione `<div>`, `<img>`, `<form>`, `<script>`, `onclick` ou estilos CSS no Markdown. O renderizador escapa HTML por segurança; use os exemplos deste guia.
- O teste Markdown precisa estar em um bloco `quiz`; JavaScript dentro do `.md` não será executado.
- Para testar o carregamento de arquivos, abra o site servido por HTTP ou GitHub Pages. Abrir HTML diretamente por `file://` pode impedir o carregamento do Markdown.
