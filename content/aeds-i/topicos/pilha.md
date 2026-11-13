Explorando o Mundo das Pilhas (Stacks)

As Pilhas são uma das estruturas de dados mais intuitivas porque nós as usamos o tempo todo no mundo real. Elas são simples, organizadas e extremamente úteis para controlar o fluxo de informações no computador.

Neste material, vamos entender como elas funcionam, quais são suas operações básicas e onde elas são aplicadas.

Página 1: O Conceito e a Regra LIFO

Imagine uma pilha de pratos na pia ou uma pilha de livros na sua mesa. Quando você guarda um livro, você o coloca no topo. Quando você precisa pegar um livro, você tira o que está no topo. Se tentar puxar um livro lá do meio, a pilha inteira pode desmoronar!

Na programação, a Pilha segue exatamente essa regra de ouro, conhecida como LIFO:

LIFO vem do inglês Last In, First Out (O Último a Entrar é o Primeiro a Sair).

O último elemento que foi adicionado será obrigatoriamente o primeiro a ser removido quando precisarmos de um dado.

Teste de Conhecimento (Pág. 1)

```quiz
{
  "question": "Se você inserir os números 1, 2 e 3 em uma Pilha (nesta exata ordem), qual será o PRIMEIRO número a ser removido?",
  "options": [
    { "text": "O número 1, pois foi o primeiro a entrar.", "correct": false },
    { "text": "O número 2, pois ele está no meio.", "correct": false },
    { "text": "O número 3, pois foi o último a entrar (está no topo).", "correct": true }
  ],
  "correctFeedback": "✅ Perfeito! A regra LIFO garante que o último elemento adicionado (o número 3) fica no topo e é o primeiro a sair.",
  "incorrectFeedback": "❌ Cuidado com a regra LIFO! Lembre-se da pilha de pratos: qual é o primeiro prato que você pega para lavar? Tente novamente."
}
```

Página 2: As Operações Básicas

Para manipular uma Pilha, não precisamos de muitos comandos. Como só podemos interagir com o topo, as operações principais são bem específicas:

Empilhar (Push): Adiciona um novo elemento no topo da pilha.

Desempilhar (Pop): Remove o elemento que está no topo da pilha e o devolve para você usar.

Topo / Espiar (Top / Peek): Apenas olha qual é o elemento que está no topo, mas não o remove. É como ler a capa do primeiro livro sem tirá-lo da pilha.

Exemplo em pseudocódigo:

pilha_livros <- criar_pilha()
empilhar(pilha_livros, "Harry Potter")
empilhar(pilha_livros, "Senhor dos Anéis")
// O topo agora é "Senhor dos Anéis"

livro_lido <- desempilhar(pilha_livros)
// Você pegou "Senhor dos Anéis". O topo voltou a ser "Harry Potter".


Teste de Conhecimento (Pág. 2)

```quiz
{
  "question": "Qual é a diferença entre as operações Pop (Desempilhar) e Peek/Top (Topo)?",
  "options": [
    { "text": "Pop adiciona um elemento, Peek remove.", "correct": false },
    { "text": "Pop remove e retorna o elemento do topo; Peek apenas retorna o elemento do topo sem removê-lo.", "correct": true },
    { "text": "Não há diferença, ambos removem o elemento do topo.", "correct": false }
  ],
  "correctFeedback": "✅ Exatamente! O Peek/Top serve apenas para consulta, enquanto o Pop de fato tira o item da estrutura.",
  "incorrectFeedback": "❌ Ops! Pense no Peek como 'dar uma espiadinha'. Será que ele altera a pilha? Tente novamente."
}
```

Página 3: Onde as Pilhas são Usadas?

Você pode não perceber, mas usa pilhas todos os dias quando está no computador. Aqui estão alguns exemplos clássicos de onde essa estrutura brilha:

O botão 'Desfazer' (Ctrl+Z): Cada ação que você faz (digitar uma palavra, apagar uma linha, mudar uma cor) é colocada no topo de uma pilha. Quando você aperta Ctrl+Z (Desfazer), o programa dá um Pop (Desempilha) na última ação e a reverte.

Navegador de Internet (Botão Voltar): As páginas que você visita vão sendo empilhadas. Ao clicar na seta para voltar, você sai da página atual e "desempilha" a página anterior para acessá-la novamente.

Chamadas de Função (Call Stack): O próprio computador usa uma pilha para lembrar de onde parou quando uma função chama outra no seu código.

Teste de Conhecimento (Pág. 3)

```quiz
{
  "question": "Imagine que você está criando um editor de texto e precisa implementar a funcionalidade de 'Desfazer' (Ctrl+Z). Por que a Pilha é a estrutura ideal para isso?",
  "options": [
    { "text": "Porque a última ação feita pelo usuário deve ser a primeira a ser desfeita.", "correct": true },
    { "text": "Porque o usuário sempre quer desfazer a primeira coisa que ele fez no dia.", "correct": false },
    { "text": "Porque a Pilha organiza os dados em ordem alfabética automaticamente.", "correct": false }
  ],
  "correctFeedback": "✅ Muito bem! O comportamento LIFO é perfeito para reverter ações na ordem inversa em que aconteceram.",
  "incorrectFeedback": "❌ Pense no comportamento do Ctrl+Z. Quando você aperta ele, qual ação é desfeita? A mais recente ou a mais antiga? Tente novamente."
}
```
## Vídeo: como funcionam as pilhas

Assista à explicação em vídeo:

[Como funcionam as pilhas — AEDS I](https://pub-9d9cbda2b3df472fb4e59e0e826b272f.r2.dev/AEDs%20I/YTDown.com_YouTube_Media_BpG0SZZ5IEo_AEDS-20-Pilha-1-Como-funcionam-as-PILHAS_004_144p.mp4)
