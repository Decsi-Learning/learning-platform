# DECSI Learning

Plataforma estática publicada no GitHub Pages. Os textos das aulas ficam em arquivos Markdown dentro de `content/` e são carregados pela página do tópico.

O [guia e modelo de Markdown](docs/guia-e-modelo-markdown.md) descreve os elementos suportados, a sintaxe para imagens, vídeos, PDFs, tabelas e testes, e inclui um esqueleto copiável para novas aulas.

## Gerar uma aula com IA

Antes de gerar uma aula, consulte o [guia de geração de aula narrada](docs/guia-geracao-aula-narrada.md). Ele orienta a transformação do Markdown do tópico em slides, falas e tempos. Se a IA estiver fora do repositório, anexe a versão atual do guia e o Markdown do tópico à mesma conversa e peça que aplique o guia.

Em todas as trilhas, vincule o arquivo da apresentação ao campo `narratedLesson` do tópico. Os slides abrem na página principal, antes do texto de estudo.

Ao criar ou atualizar uma aula, a IA deve entregar o Markdown do player e um **roteiro de produção para o Google Flow**. Na resposta ao desenvolvedor, apresente todos os slides em ordem no formato **Slide N: "Título" (duração X s)**, com um bloco de texto pronto para copiar por clipe. Inclua a fala integral em português, a direção do Rafa em inglês e o nome do MP4. Para slides com várias falas, identifique cada clipe e sua duração. O guia contém o modelo e exemplos completos.

Abra o roteiro com esta instrução: **No Google Flow, use o personagem @Rafa IA, gere cada clipe em 9:16 (vertical) e 360p. Na exportação, selecione 720p e mantenha 9:16.**

## Adicionar e ordenar tópicos

1. Escolha a trilha e crie o arquivo `.md` dentro da pasta `topicos/` correspondente, por exemplo `content/aeds-ii/topicos/variaveis.md`.
2. Escreva o conteúdo em Markdown. O renderizador aceita títulos (`#`, `##`, `###`), parágrafos, listas, citações, negrito, itálico, código em crases, links HTTPS, imagens e testes em blocos `quiz`.
3. Abra o catálogo da mesma trilha (`content/aeds-i/topicos.json` ou `content/aeds-ii/topicos.json`). Para um tópico de uma página, registre `id`, `title`, `summary` e `file`. Para dividir o tópico em páginas internas, use `pages`: cada entrada tem seu próprio `id`, `title`, `summary` e `file`.
4. A ordem dos objetos em `topics` define a ordem dos tópicos; a ordem em `pages` define a navegação interna. Os botões anterior/próximo acompanham essas ordens automaticamente.
5. Publique o Markdown e o JSON no repositório. A página da trilha lista os tópicos e a página genérica `topico.html` exibe o conteúdo. Não é preciso criar uma página HTML nova para cada tópico.

A busca no cabeçalho percorre títulos, resumos e textos Markdown dos tópicos e páginas cadastrados. Ao adicionar tópicos a uma trilha existente, eles entram na busca automaticamente. Ao criar uma trilha, registre-a também em `content/trilhas.json`, informando `id`, `title`, `catalog` e `contentDirectory` (e `plan` se houver uma página própria para a trilha). A página genérica `topico.html` lê esse manifesto para abrir conteúdos de qualquer trilha cadastrada.

Os tópicos extraídos dos planos já estão listados nos catálogos das duas disciplinas. Nos que ainda não têm texto, `"file": null` mantém a página acessível e mostra que o conteúdo está em preparação. Ao criar o Markdown correspondente, substitua `null` pelo nome do arquivo.

Exemplo de tópico com páginas internas:

```json
{
  "id": "estruturas-dados-lineares",
  "title": "Estruturas de Dados lineares - Lista",
  "summary": "Listas encadeadas, duplamente encadeadas e circulares.",
  "pages": [
    { "id": "listas-simplesmente-encadeadas", "title": "Lista simplesmente encadeada", "summary": "Nós com referência ao próximo.", "file": "listas-simplesmente-encadeadas.md" },
    { "id": "listas-duplamente-encadeadas", "title": "Lista duplamente encadeada", "summary": "Nós com referência ao anterior e ao próximo.", "file": "listas-duplamente-encadeadas.md" }
  ]
}
```

Exemplo de entrada no catálogo:

```json
{
  "id": "variaveis",
  "title": "Variáveis e atribuição",
  "summary": "Como guardar e atualizar valores durante um algoritmo.",
  "file": "variaveis.md"
}
```

O renderizador local trata o Markdown básico sem dependências externas e escapa HTML embutido. Vídeos e avaliações maiores podem ser acrescentados ao formato dos tópicos em etapas futuras. A conclusão atual fica salva no navegador do aluno; um backend poderá substituir esse armazenamento local quando houver hospedagem de servidor.

### Assistente de IA em todo o site

O ícone de chat é incluído em todas as páginas HTML por `assistant.js` e `assistant.css`. O assistente usa o Cloudflare Worker em `gemini-proxy/` como intermediário entre o site estático e a Gemini API. A chave da Gemini nunca deve ir para o front-end ou para o repositório.

1. Crie uma chave da Gemini API no Google AI Studio e instale/configure o Wrangler conforme a [documentação do Cloudflare](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
2. No terminal, a partir da pasta `gemini-proxy`, execute `npx wrangler secret put GEMINI_API_KEY` e informe a chave no prompt. O segredo é guardado no ambiente Cloudflare, sem entrar no repositório.
3. Revise `ALLOWED_ORIGINS` em `wrangler.jsonc` para permitir apenas as origens usadas pelo site.
4. Execute `npx wrangler deploy` nessa pasta usando a conta Cloudflare que administra `gemini-proxy.scrrhdvp7v.workers.dev`. Se o Wrangler mostrar outra URL, atualize o endereço em `assistant.js`.
5. Abra a URL do Worker no navegador. A versão correta responde `{"service":"decsi-learning-ai-assistant","status":"ok"}`. Se aparecer outra resposta, o Worker correto ainda não foi publicado nessa URL.
6. Publique as alterações do site depois que o Worker correto estiver ativo.
7. Configure uma regra de rate limiting no Cloudflare para o endpoint do Worker e monitore o uso/custo no Google AI Studio. CORS restringe uso em navegadores, mas sozinho não impede chamadas automatizadas diretas.

<<<<<<< Updated upstream
O Worker limita a pergunta do chat a 1.500 caracteres e não armazena conversas na Gemini API. No chat, somente as mensagens digitadas e o contexto recente da conversa são enviados. Ao clicar em **Resumir conteúdo** dentro de uma página de estudo, o título e o texto Markdown daquela página são enviados ao Worker para gerar o resumo; a Gemini recebe `store: false`. O modal informa que o resumo é um apoio e não substitui o estudo do material completo. Para uso local, sirva a pasta do projeto via HTTP na porta 5500 ou 8000; abrir por `file://` não é permitido pelo CORS.
=======
O Worker limita cada pergunta a 1.500 caracteres. O assistente mantém até oito trocas em memória enquanto a página estiver aberta e envia esse contexto junto com a nova pergunta; fecha a conversa ao navegar/recarregar. O Worker usa `store: false`, então o histórico é reenviado a cada chamada e não é mantido como sessão pela Gemini. O texto da aula e os metadados do tópico não são enviados. Para uso local, sirva a pasta do projeto via HTTP na porta 5500 ou 8000; abrir por `file://` não é permitido pelo CORS.
>>>>>>> Stashed changes

Se o assistente retornar HTTP 502, publique novamente o Worker para que ele mostre a mensagem de erro da Gemini sem expor a chave. A mensagem exibida ajuda a identificar chave inválida, modelo/acesso indisponível ou erro de solicitação. Para ver logs em tempo real, execute `npx wrangler tail gemini-proxy`.

O Worker usa o modelo `gemini-3.5-flash-lite` para responder às perguntas.

Referências: [Gemini Interactions API](https://ai.google.dev/api/interactions-api-v1) e [segredos do Cloudflare Workers](https://developers.cloudflare.com/workers/configuration/secrets/).

### Cadastro de usuários com D1

A tela `cadastro.html` envia nome, sobrenome, e-mail e senha ao endpoint `/api/register` do Worker `gemini-proxy`. O navegador envia a senha apenas por HTTPS ao Worker; o Worker a transforma em hash PBKDF2-SHA-256 com salt e 100.000 iterações antes de gravar na coluna `users.password`. O campo de confirmação é validado apenas no navegador e nunca é enviado. O número de iterações respeita o limite informado pelo runtime Web Crypto do Cloudflare Workers.

1. Para o banco existente, aplique as migrações pendentes (nomes e progresso): a partir da pasta `gemini-proxy`, execute `npx wrangler d1 migrations apply chat-db --remote`. Elas preservam as contas atuais; nomes de contas já existentes ficam vazios até serem preenchidos.
2. O Worker está vinculado ao banco `chat-db` com o binding `chat_db`, conforme `gemini-proxy/wrangler.jsonc`.
3. Publique o Worker atualizado com `npx wrangler deploy` a partir de `gemini-proxy/`.
4. Publique o site atualizado e abra `cadastro.html` ou use o link **Criar conta** na página inicial.

Para um banco D1 novo, crie as tabelas diretamente com `npx wrangler d1 execute chat-db --remote --file ../schema.sql`; esse schema já inclui usuários, nomes e progresso.

O cadastro aceita nomes e sobrenomes de até 80 caracteres, e-mails únicos e senhas de 12 a 128 caracteres. A API usa queries preparadas do D1; a senha em texto puro não é salva.

### Login e sessão

A página `login.html` autentica as contas do D1 por `/api/login`. O Worker compara a senha com o hash PBKDF2 armazenado e cria um token de sessão assinado, válido por 24 horas. O token fica em `sessionStorage` do navegador, e o cabeçalho mostra a conta ativa com a opção **Sair**. Isso mantém o login entre páginas na mesma aba. O site ainda deixa o conteúdo público; o login identifica o estudante, mas não bloqueia páginas.

Antes de publicar o Worker, crie o segredo de assinatura com `npx wrangler secret put SESSION_SECRET` (use um valor aleatório com pelo menos 32 caracteres, diferente da chave Gemini). Depois publique com `npx wrangler deploy`. Não coloque esse segredo em arquivos do projeto. A tela de login funciona em `login.html` e o link **Entrar** aparece no cabeçalho das páginas.

### Retomar estudos

O dashboard consulta os catálogos das trilhas e o progresso da conta em `/api/progress`. O Worker grava o estado do tópico em `learning_progress` e cada página visitada em `learning_page_progress`. O avanço de um tópico é a proporção de páginas visitadas sobre as páginas cadastradas; ao finalizar o tópico, todas as páginas dele contam como avançadas. O avanço da trilha soma as páginas avançadas de seus tópicos e divide pelo total de páginas da trilha, dando peso correto aos tópicos com várias páginas. **Finalizar tópico** registra a conclusão. Sem login, o navegador usa `localStorage` como alternativa. Para publicar, aplique as migrações D1 pendentes antes do Worker e depois publique os arquivos do site.

### Teste interativo dentro do Markdown

Não use `<form>`, `<script>`, `onclick` ou HTML dentro do arquivo Markdown: o renderizador escapa HTML e não executa JavaScript incluído no conteúdo. Para uma pergunta de múltipla escolha, use um bloco cercado por três crases com a palavra `quiz`. Escreva o conteúdo do bloco como JSON e marque a alternativa correta com `"correct": true`. Para exigir que o estudante selecione uma alternativa em cada questão antes de avançar ou finalizar, marque a página correspondente no catálogo com `"requiresQuizAnswers": true`. O exemplo está em `content/aeds-i/topicos.json`, na página de exercícios da pilha.

### Imagens no texto

Use a sintaxe `![descrição da imagem](caminho-ou-URL)`. O endereço pode ser um link público do R2 ou um arquivo relativo ao `.md`. Por padrão, a imagem fica centralizada. Para flutuar à esquerda ou à direita e deixar o texto correr ao lado, acrescente `{align=left width=40%}` ou `{align=right width=40%}`. Em celular, imagens laterais são empilhadas para manter o texto legível. Imagens com `align=center` podem ser colocadas entre parágrafos para aparecer acima, abaixo ou no ponto desejado do texto.

```markdown
![Representação de uma lista](https://exemplo.r2.dev/lista.png){align=right width=38%}

Este parágrafo começa ao lado da imagem. No celular, a imagem aparece acima do texto.
```
