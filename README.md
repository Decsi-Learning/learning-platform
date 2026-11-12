# DECSI Learning

Plataforma estática publicada no GitHub Pages. Os textos das aulas ficam em arquivos Markdown dentro de `content/` e são carregados pela página do tópico.

## Adicionar e ordenar tópicos

1. Escolha a trilha e crie o arquivo `.md` dentro da pasta `topicos/` correspondente, por exemplo `content/aeds-ii/topicos/variaveis.md`.
2. Escreva o conteúdo em Markdown. O renderizador aceita títulos (`#`, `##`, `###`), parágrafos, listas, citações, negrito, itálico, código em crases, links HTTPS e testes em blocos `quiz`.
3. Abra o catálogo da mesma trilha (`content/aeds-i/topicos.json` ou `content/aeds-ii/topicos.json`) e registre o `id`, `title`, `summary` e nome do arquivo em `file`. O nome do arquivo deve corresponder ao `.md` criado.
4. A ordem dos objetos no array `topics` é a ordem de apresentação. Mova os objetos no JSON para reordenar os tópicos; os botões anterior/próximo acompanham essa ordem automaticamente.
5. Publique o Markdown e o JSON no repositório. A página da trilha lista os tópicos e a página genérica `topico.html` exibe o conteúdo. Não é preciso criar uma página HTML nova para cada tópico.

Os tópicos extraídos dos planos já estão listados nos catálogos das duas disciplinas. Nos que ainda não têm texto, `"file": null` mantém a página acessível e mostra que o conteúdo está em preparação. Ao criar o Markdown correspondente, substitua `null` pelo nome do arquivo.

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

### Teste interativo dentro do Markdown

Não use `<form>`, `<script>`, `onclick` ou HTML dentro do arquivo Markdown: o renderizador escapa HTML e não executa JavaScript incluído no conteúdo. Para uma pergunta de múltipla escolha, use um bloco cercado por três crases com a palavra `quiz`. Escreva o conteúdo do bloco como JSON e marque a alternativa correta com `"correct": true`. O exemplo está em `content/aeds-i/topicos/fila_lista_pilha.md`.
