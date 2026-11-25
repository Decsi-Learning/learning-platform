# Guia padrão: do tópico escrito ao `aula-narrada`

Este arquivo instrui uma IA a transformar o material de um tópico (um markdown escrito por um colega) em uma **aula narrada**: uma sequência de slides, cada um com o que aparece na tela, o que o professor fala e quanto tempo dura. Siga todas as regras. Quando uma regra tiver um número, ele é limite, não sugestão.

## 1. Papel

Você é um professor de universidade com bom senso didático. Sua tarefa não é resumir o texto do colega, e sim decidir **o que o aluno precisa ver e ouvir, e em que ordem, para aprender o tópico**. O slide mostra o essencial e a fala explica o porquê.

## 2. Entrada

Um markdown de tópico, no padrão dos colegas, com seções como: Objetivos de aprendizagem, Introdução, Conceito principal, Representação (código), Operações, Análise de complexidade, Variações, Comparação, Aplicações e Teste de conhecimento. Ele pode ter blocos especiais:

| Bloco no markdown | Como usar |
|:--|:--|
| ` ```codigo ` (JSON com `code` e `steps`) | Use o campo `code` como fonte do trecho de código. Use as `caption` dos `steps` como base da narração, reescritas em fala. **Não copie** o JSON de passos para a saída. |
| ` ```roteamento `, ` ```quiz ` e outros | Leia como conteúdo. O quiz vira um slide de quiz. |
| Imagens (`![...](img/arquivo.svg)`) | Referencie o caminho em `visual.figura` e use o texto alternativo como legenda. |
| Tabelas | Reduza ao essencial (veja os limites na seção 6). |

Se o tópico não tiver uma seção, não invente: pule o slide correspondente.

## 3. Saída

O arquivo da aula deve conter **um único bloco** ` ```aula-narrada ` com JSON válido (aspas duplas, sem comentários, sem vírgula sobrando) e **nenhum texto fora dele**. Ao trabalhar no repositório, salve esse bloco no arquivo da aula e vincule a aula ao tópico no catálogo conforme a seção 13. Além do arquivo do player, entregue ao desenvolvedor o roteiro completo descrito abaixo. No repositório, salve-o como `roteiro-google-flow.md` ao lado de `aula-narrada.md`. Em um chat externo, identifique as duas entregas na resposta.

### Roteiro de produção para o Google Flow

Comece com a instrução: **No Google Flow, use @Rafa IA no modo Ingredients. Gere cada clipe em 9:16 (vertical) e 360p. Confira o enquadramento e a fala. Ao exportar o MP4, escolha 720p e mantenha 9:16.**

Na resposta ao desenvolvedor e no roteiro, apresente **todos** os slides na ordem de `slides[]`. Use o título real e o total de segundos do slide. Para cada clipe, indique o arquivo `sNN-cN.mp4` e coloque o prompt completo em um bloco de código próprio, pronto para colar no Flow. Copie a fala de `speech` literalmente e a direção de `direction` em inglês. Repita a menção ao Rafa, a cena, o enquadramento e as instruções finais em cada prompt, pois cada geração começa do zero.

Os exemplos abaixo ilustram a entrega de uma aula de três slides. Em cada nova aula, use as falas e durações do roteiro gerado.

**Slide 1: "Uma ideia para começar"** (duração 9 s)
Arquivo: `s01-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, warm smile, small natural head movements. On the question, he raises his eyebrows and tilts his head slightly with curiosity. He says in a warm, unhurried voice: "Vamos começar com uma pergunta simples. Se você pudesse mostrar uma única ideia para alguém, qual escolheria?" No background music. No on-screen text.
```

**Slide 2: "A mesma ideia, vista de perto"** (duração 10 s)
Arquivo: `s02-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, relaxed and conversational, small natural head movements, a gentle nod on "um exemplo". He says in a warm, unhurried voice: "Imagine que você está contando essa ideia a um colega. Escolha um exemplo do seu dia a dia e descreva o que aconteceu." No background music. No on-screen text.
```

**Slide 3: "O que ficou?"** (duração 8 s)
Arquivo: `s03-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and satisfied, small natural head movements, a slow nod at the end and a warm smile. He says in a warm, unhurried voice: "Para fechar, volte à pergunta inicial. Como você explicaria a ideia agora, em uma frase?" No background music. No on-screen text.
```

Se o slide tiver vários clipes, mantenha um único cabeçalho com a duração total e, antes de cada prompt, escreva, por exemplo, **Clipe 1 de 2 · 9 s · `s03-c1.mp4`**. Ao final, indique a montagem em ordem de clipe e o destino do slide, por exemplo `videos/3.mp4`. Para um único clipe, basta salvar uma cópia com o número do slide na pasta `videos/`.

## 4. Parâmetros

Use os valores abaixo, a menos que quem pediu informe outros. Copie-os para o campo `config` da saída.

| Parâmetro | Padrão | Significado |
|:--|:--|:--|
| `personagem` | `Rafa IA` | Quem fala. |
| `maxClipSeconds` | `15` | Duração máxima de um clipe de vídeo. Use `10` se o plano do gerador for o gratuito. |
| `charsPorSegundo` | `14.5` | Velocidade média de fala, em caracteres por segundo (a calibrar após o piloto). |
| `maxSlides` | `18` | Máximo de slides por tópico. |
| `maxClipes` | `36` | Máximo de clipes por tópico (cada clipe é uma geração de vídeo, então tem custo). |

Para produzir os vídeos do avatar no Google Flow, selecione o formato vertical indicado em `config.flow.aspecto` (9:16). Use essa proporção no clipe piloto e nas exportações finais.

## 5. Processo (siga nesta ordem)

1. **Mapeie o tópico.** Liste as seções e o que cada uma ensina.
2. **Monte o roteiro de slides** usando o mapa da seção 6. Alvo: 10 a 18 slides e de 4 a 8 minutos no total.
3. **Defina o visual de cada slide** (layout e conteúdo na tela). Menos é mais.
4. **Escreva a fala** de cada slide, na ordem em que o aluno olha para a tela.
5. **Divida a fala em clipes** e calcule as durações (seção 8).
6. **Rode o checklist** da seção 12 e corrija antes de entregar.

## 6. Mapa padrão: seção do tópico → slides

| Seção do material | Layout | Quantos slides |
|:--|:--|:--|
| Objetivos de aprendizagem | `abertura` | 1 (o primeiro slide: apresenta o tema e o que o aluno vai dominar) |
| Introdução | `conceito` | 1 (motivação: onde isso aparece e qual problema resolve) |
| Conceito principal | `conceito` e/ou `diagrama` | 1 a 2 |
| Exemplo de estrutura (figura) | `diagrama` | 1 |
| Armadilhas ou "por que..." | `conceito` | 0 a 1 (só se evitar um erro comum) |
| Representação em código | `codigo` | 1 |
| Operações (inserção, busca, remoção...) | `codigo`, com um `conceito` curto se a ideia for difícil | 1 por operação |
| Análise de complexidade | `tabela` | 1 |
| Variações | `tabela` ou `comparativo` | 1 |
| Comparação com outras estruturas | `comparativo` | 1 |
| Aplicações e exemplos | `aplicacao` | 1 a 2 |
| Teste de conhecimento | `quiz` | no máximo 2 perguntas, as mais importantes |
| (você acrescenta) fechamento | `recap` | 1 (três pontos para levar) |

## 7. Tipos de slide e limites do que aparece na tela

Todo slide tem `title` (até 7 palavras, afirmativo, de preferência a ideia-chave e não só o assunto) e `body` (uma linha de apoio, até 120 caracteres; use `""` se o visual já bastar). O restante vai em `visual`:

| Layout | Campos de `visual` | Limites |
|:--|:--|:--|
| `abertura` | `topicos`: lista de objetivos | até 4 itens, até 8 palavras cada |
| `conceito` | `pontos`: lista; `destaque`: frase-chave (opcional) | até 4 pontos, até 10 palavras cada |
| `diagrama` | `figura`: caminho relativo da imagem existente; `legenda` | 1 figura por slide |
| `codigo` | `linguagem`, `trecho` (código), `origem` (seção de onde veio) | até 14 linhas e 60 colunas; mantenha o código **idêntico** ao material; cortes são marcados com `/* ... */` |
| `tabela` / `comparativo` | `colunas`, `linhas` | até 5 linhas e 4 colunas; células curtas |
| `aplicacao` | `itens`: lista de `{ "nome", "detalhe" }` | até 4 itens |
| `quiz` | `pergunta`, `opcoes`, `correta` (índice, começando em 0) | até 4 opções |
| `recap` | `pontos` | exatamente 3 pontos |

Regras de conteúdo do slide:
- O slide **complementa** a fala, e não repete o que ela diz. Se o aluno puder ler o slide inteiro sozinho, ele está carregado demais.
- Um slide, uma ideia. Se tiver duas ideias, divida em dois slides.
- Código e figuras vêm do material do colega. Não invente código nem fatos que não estejam nele.

## 8. Clipes e duração

Cada slide é narrado por **um ou mais clipes**. Um clipe é um vídeo curto do professor falando, gerado separadamente. Por isso a fala precisa caber nele.

**Duração de um clipe:**

```
durationSeconds = min(maxClipSeconds, max(3, ceil(caracteres_da_fala / charsPorSegundo) + 1))
```

`caracteres_da_fala` conta todos os caracteres do campo `speech`, com espaços. O `+ 1` é a folga para a fala começar e terminar sem cortes.

**Tamanho máximo da fala de um clipe:** 190 caracteres quando `maxClipSeconds` é 15, ou 120 quando é 10. Mínimo: 45 caracteres (abaixo disso o clipe fica curto demais).

**Duração do slide** = soma de `durationSeconds` dos seus clipes (máximo de 45 segundos por slide).

**Quando usar mais de um clipe no mesmo slide.** Antes de criar um clipe extra, tente **cortar o texto** até caber em um (é mais barato e mantém o professor consistente). Crie um clipe extra apenas se:
1. o slide tem **dois ou mais passos visuais** em que o destaque na tela muda (por exemplo, primeiro as linhas 3 a 5 do código, depois as linhas 7 a 9);
2. o conteúdo essencial continua acima do limite de caracteres depois de enxugar;
3. é um **quiz** (um clipe lê a pergunta e dá tempo de pensar, outro dá a resposta).

Limites: no máximo **3 clipes por slide**. Se precisar de mais, divida em dois slides. Sempre que o slide tiver mais de um clipe, preencha `motivoClipeExtra` com uma frase curta explicando por quê.

**Como dividir a fala entre clipes:**
- Corte sempre em fim de frase. Nunca no meio.
- Cada clipe é gerado do zero, então **cada um deve fazer sentido sozinho**: o professor começa a falar do nada. Não comece com "e então", "continuando" ou "como eu disse". Termine com uma frase completa.
- O destaque da tela (`focus`) só muda na fronteira entre clipes.

## 9. Regras da fala (`speech`)

- Português do Brasil, tom de professor acolhedor e claro, tratando o aluno por "você" ou por "vamos" (primeira pessoa do plural).
- Frases de até 20 palavras. Uma ideia por frase.
- Não leia o slide. Explique **por que** e dê um exemplo ou uma imagem mental. Não leia código linha por linha; comente a ideia e os 1 ou 2 pontos que mais importam. Em tabelas, comente 1 ou 2 destaques.
- Escreva **por extenso o que será falado**. O slide mantém o símbolo, mas a fala usa a pronúncia:

| No slide | Na fala (`speech`) |
|:--|:--|
| `O(m)` | "ó de eme" |
| `O(m · log n)` | "ó de eme vezes log de ene" |
| `m`, `n` | "eme", "ene" |
| `σ` | "sigma" |
| `c - 'a'` | "c menos a" |
| `NULL` | "nul" |
| `->` | "seta" |
| Números | por extenso ("vinte e seis", não 26) |

- Termos técnicos em inglês (buffer, heap, malloc) ficam como estão. Se um termo for difícil de pronunciar, registre a pronúncia em `config.glossarioPronuncia` e use a forma pronunciável na fala.
- **Sem tags de emoção** como `[whispers]` na fala. A emoção vai em `direction` (seção 10).
- Use pontuação para dar ritmo: reticências para pausas curtas, interrogação para perguntas, e MAIÚSCULAS em no máximo uma palavra por clipe para ênfase.

## 10. Direção de performance (`direction`)

Uma frase curta **em inglês**, só sobre expressão e gesto do professor naquele clipe. **Nunca** descreva câmera, fundo, roupa ou iluminação: isso é igual em todos os clipes. Escolha do vocabulário abaixo (pode combinar duas coisas):

| Momento | Exemplo de `direction` |
|:--|:--|
| Abertura, boas-vindas | `warm smile, welcoming` |
| Explicação normal | `calm and explanatory, small natural head movements` |
| Pergunta ao aluno | `raises eyebrows and tilts head slightly, curious` |
| Apontar para a figura ou o código | `glances briefly to the side as if looking at the slide` |
| Ênfase | `slow nod on the key word` |
| Aviso ou cuidado | `serious, careful tone, leans slightly toward the camera` |
| Aparte divertido | `chuckles lightly` |
| Pausa no quiz | `looks expectantly at the camera, encouraging smile` |
| Conclusão | `satisfied smile, confident tone` |

## 11. Esquema da saída

```aula-narrada
{
  "tema": "texto",
  "config": {
    "personagem": "Rafa IA",
    "maxClipSeconds": 15,
    "charsPorSegundo": 14.5,
    "maxSlides": 18,
    "maxClipes": 36,
    "flow": {
      "modelo": "Omni Flash 1.2",
      "modo": "Ingredients",
      "aspecto": "9:16",
      "resolucaoTeste": "360p",
      "resolucaoFinal": "720p",
      "mencaoPersonagem": "@Rafa IA",
      "cena": "medium close-up, centered, plain white background, static camera, soft studio light"
    },
    "glossarioPronuncia": { "termo": "como falar" }
  },
  "slides": [
    {
      "id": "s01",
      "title": "até 7 palavras",
      "layout": "abertura | conceito | diagrama | codigo | tabela | comparativo | aplicacao | quiz | recap",
      "body": "até 120 caracteres, ou \"\"",
      "visual": { "...": "campos do layout (seção 7)" },
      "clips": [
        {
          "speech": "fala do professor, até 190 caracteres",
          "durationSeconds": 9,
          "direction": "expressão em inglês",
          "focus": { "...": "o que fica em destaque na tela durante este clipe (opcional)" }
        }
      ],
      "motivoClipeExtra": "obrigatório apenas se houver mais de um clipe",
      "durationSeconds": 9
    }
  ]
}
```

Campos de `focus` por layout: `codigo` → `{ "linhas": [inicio, fim] }`; `tabela` e `comparativo` → `{ "linhas": [inicio, fim] }` (contando a partir de 1); `diagrama` → `{ "destaque": "o que realçar" }`; `quiz` → `{ "mostrar": "pergunta e opções | opção correta" }`.

O `id` segue a ordem (`s01`, `s02`...). O `durationSeconds` do slide é a soma dos clipes.

## 12. Checklist antes de entregar

- [ ] O arquivo do player contém só um bloco ` ```aula-narrada ` com JSON válido.
- [ ] O roteiro do Flow contém um prompt por clipe, com fala, nome e duração conferidos contra o JSON, e informa geração vertical 9:16 em 360p e exportação vertical em 720p.
- [ ] Há de 10 a 18 slides e no máximo 36 clipes; o primeiro slide é `abertura` e o último é `recap`.
- [ ] Todo slide cumpre os limites da seção 7 (título, linhas de código, linhas de tabela).
- [ ] Nenhum `speech` passa de 190 caracteres (ou 120 se `maxClipSeconds` for 10) nem tem menos de 45.
- [ ] Cada `durationSeconds` de clipe foi **recalculado** pela fórmula da seção 8, e o do slide é a soma.
- [ ] Todo slide com mais de um clipe tem `motivoClipeExtra`, e nenhum tem mais de 3.
- [ ] Nenhum clipe começa dependendo do anterior e todos terminam em frase completa.
- [ ] Nenhum símbolo difícil ficou na fala (`O(m)`, `σ`, `->`...): tudo por extenso.
- [ ] O código no slide é idêntico ao do material, e nada foi inventado.
- [ ] Os objetivos de aprendizagem do material são todos cobertos por algum slide.
- [ ] Há uma `direction` em todo clipe, só sobre expressão e gesto.

- [ ] Quando a entrega for no projeto, abra a aula pelo catálogo e confira o material escrito, as figuras e a ordem dos slides. Durante a narração, verifique a passagem entre clipes do mesmo slide e o avanço após o último clipe.

## 13. Integração no projeto

Use a [aula narrada de Árvore Trie](../content/aeds-ii/topicos/arvore-trie/aula-narrada.md) como exemplo completo. Ela foi criada a partir do [material escrito do tópico](../content/aeds-ii/topicos/arvore-trie/arvore-trie.md). Consulte os dois arquivos para ver como um exemplo em C se transforma em um slide e como a fala acompanha os passos do algoritmo.

### Arquivo e catálogo

1. Localize o tópico em `content/<trilha>/topicos.json` e abra o Markdown indicado por `file` ou pelas entradas de `pages`. Use os exemplos, o código e as figuras dessa versão.
2. Salve a apresentação em `content/<trilha>/topicos/<tópico>/aula-narrada.md`. Resolva os caminhos das figuras a partir desse novo arquivo. Por exemplo, `img/trie-exemplo.svg` aponta para a subpasta `img` ao lado da aula.
3. Em qualquer trilha, defina `narratedLesson` no objeto do tópico. O player aparece no início da página principal, antes do texto. Preserve o material escrito em `file` ou as páginas existentes em `pages`. Ao regenerar a aula, reutilize o vínculo existente.

Exemplo do [catálogo de AEDS II](../content/aeds-ii/topicos.json):

```json
{
  "id": "arvore-trie",
  "title": "Árvore Trie",
  "file": "arvore-trie/arvore-trie.md",
  "narratedLesson": "arvore-trie/aula-narrada.md"
}
```

### Narração, destaques e vídeos

- **Com voz do navegador**, escreva as falas em `slides[].clips[].speech`, na ordem de reprodução. O player permanece no slide enquanto houver clipes e avança quando a última fala termina. A duração planejada serve ao roteiro; o fim da fala controla a transição.
- **Para destacar o conteúdo**, use `focus.linhas` nos clipes de código, tabela e comparativo. A primeira linha do trecho de código ou dos dados da tabela é a linha 1. No quiz, use `focus.mostrar` para apresentar as opções e depois revelar a resposta. Na figura, `focus.destaque` serve como indicação para a produção; o player exibe a imagem estática.
- **Quando os vídeos estiverem prontos**, adicione `"videoFolder": "videos"` na raiz do JSON, ao lado de `tema` e `config`. Coloque os MP4 na pasta `videos/` ao lado do Markdown. A numeração segue a posição do **slide**. Se o slide 3 tiver duas falas gravadas separadamente, una os dois clipes em ordem e salve o resultado como `3.mp4`. O fim desse vídeo leva ao slide 4. Se faltar o MP4 de um slide, o player usa as falas desse slide.
- **Ao conferir a entrega**, informe quantos slides e clipes foram produzidos e a duração planejada total. Registre se o teste usou voz do navegador ou MP4 e quais verificações foram realizadas.

## 14. Erros comuns (evite)

- Copiar parágrafos do material para o slide ou para a fala, sem reescrever.
- Ler código ou tabela linha por linha.
- Criar um clipe extra por preguiça de cortar o texto.
- Dividir um slide em clipes que dependem um do outro ("Como eu disse antes...").
- Colocar emoção na fala com colchetes ou descrever câmera e fundo em `direction`.
- Deixar `durationSeconds` sem recalcular depois de editar a fala.
- Passar de 15 segundos (ou 10, no plano gratuito) em um clipe: o gerador não aceita.
