# Lista de Exercícios - Árvore Radix

Resolva a lista de exercícios para avançar para a próxima etapa.

## Questões interativas

A árvore começa com romano. Indique onde cada rótulo se divide quando chegam romance e rubro e, depois das remoções, se os rótulos podem ser fundidos. Se errar, a mensagem explica o que falta; depois da primeira tentativa, o botão **Ver resposta** aparece.

```pratica
{
  "tipo": "radix",
  "title": "Pratique: divisão e fusão na árvore Radix",
  "operacoes": [
    {
      "inserir": "romano"
    },
    {
      "inserir": "romance"
    },
    {
      "inserir": "rubro"
    },
    {
      "inserir": "roman"
    },
    {
      "remover": "romance"
    },
    {
      "remover": "roman"
    }
  ]
}
```

## Questões de múltipla escolha

```quiz
{
  "question": "Qual é a principal diferença entre uma Trie e uma árvore Radix?",
  "options": [
    { "text": "A Radix guarda as palavras em ordem alfabética, e a Trie não", "correct": false },
    { "text": "Na Radix, cadeias de nós com um único filho são fundidas em um nó só, rotulado com um trecho da chave", "correct": true },
    { "text": "A Radix é sempre binária, com dois filhos por nó", "correct": false },
    { "text": "A busca na Radix custa O(log n), e na Trie custa O(m)", "correct": false }
  ],
  "correctFeedback": "Correto! A Radix é uma Trie compacta: cada nó guarda um trecho, e só há nós onde as palavras se separam.",
  "incorrectFeedback": "Compare as duas figuras: o que aconteceu com os nós d, i e a da palavra dia?"
}
```

```quiz
{
  "question": "A árvore Radix tem apenas a palavra \"casa\", em um único nó. O que acontece ao inserir \"caso\"?",
  "options": [
    { "text": "Cria-se uma folha \"caso\" ao lado de \"casa\", como filha da raiz", "correct": false },
    { "text": "O nó \"casa\" é dividido em \"cas\", com os filhos \"a\" e \"o\"", "correct": true },
    { "text": "O nó \"casa\" é substituído por \"caso\"", "correct": false }
  ],
  "correctFeedback": "Correto! As duas palavras têm o prefixo comum cas, então o nó é dividido ali e cada palavra ganha a sua folha.",
  "incorrectFeedback": "Lembre-se de que os filhos de um mesmo nó precisam começar com letras diferentes. Reveja a animação da inserção."
}
```

```quiz
{
  "question": "A árvore tem \"ca\" (fim de palavra), com os filhos \"sa\" e \"ma\". O que retorna buscar(\"cam\")?",
  "options": [
    { "text": "true, porque \"cam\" é o começo de \"cama\"", "correct": false },
    { "text": "false, porque a chave acaba no meio do rótulo \"ma\"", "correct": true },
    { "text": "true, porque o nó \"ca\" é fim de palavra", "correct": false }
  ],
  "correctFeedback": "Correto! Depois de consumir ca, sobra m, que não é igual ao rótulo inteiro ma. A busca exata falha, embora a busca por prefixo dissesse sim.",
  "incorrectFeedback": "A busca compara o rótulo inteiro do filho com o que falta da chave. O que falta depois de ca?"
}
```

```quiz
{
  "question": "Na mesma árvore (\"ca\" com os filhos \"sa\" e \"ma\"), existe alguma palavra que começa com \"cam\"?",
  "options": [
    { "text": "Sim: o prefixo acaba no meio do rótulo \"ma\", e todas as palavras abaixo desse nó começam com \"cam\"", "correct": true },
    { "text": "Não, porque \"cam\" não é igual a nenhum rótulo inteiro", "correct": false },
    { "text": "Não, porque o nó \"ma\" não é filho da raiz", "correct": false }
  ],
  "correctFeedback": "Correto! Na busca por prefixo, acabar no meio de um rótulo é suficiente: cama começa com cam.",
  "incorrectFeedback": "Releia a regra da busca por prefixo logo depois da animação da busca."
}
```

```quiz
{
  "question": "Depois de uma remoção, um nó que não é fim de palavra ficou com um único filho. O que a árvore Radix faz?",
  "options": [
    { "text": "Nada: o nó continua como está", "correct": false },
    { "text": "Libera o nó e o filho", "correct": false },
    { "text": "Funde o nó com o filho, juntando os dois rótulos em um só", "correct": true }
  ],
  "correctFeedback": "Correto! A fusão é o inverso da divisão e mantém a árvore compacta: todo nó que não é fim de palavra continua sendo uma bifurcação.",
  "incorrectFeedback": "Releia a regra que torna a árvore compacta e a animação da remoção de caso."
}
```

```quiz
{
  "question": "A árvore tem \"ca\" (fim de palavra), com os filhos \"sa\" e \"ma\". O que acontece ao remover \"ca\"?",
  "options": [
    { "text": "O nó \"ca\" é liberado junto com os filhos", "correct": false },
    { "text": "Só a marca de fim de palavra é desfeita: o nó ainda tem dois filhos, então nada é fundido", "correct": true },
    { "text": "O nó \"ca\" é fundido com \"sa\", formando \"casa\"", "correct": false }
  ],
  "correctFeedback": "Correto! O nó continua sendo uma bifurcação entre sa e ma. A fusão só acontece quando ele ficar com um único filho.",
  "incorrectFeedback": "Conte os filhos do nó ca depois da remoção. Um nó com dois filhos precisa ser fundido?"
}
```

```quiz
{
  "question": "Quantos nós, além da raiz, tem a árvore Radix com as palavras casa, caso, cama, cao e dia?",
  "options": [
    { "text": "11, como na Trie", "correct": false },
    { "text": "7: ca, s, a, o, ma, o e dia", "correct": true },
    { "text": "5, um por palavra", "correct": false }
  ],
  "correctFeedback": "Correto! Cada cadeia sem bifurcação vira um nó só, e a árvore cai de 11 para 7 nós.",
  "incorrectFeedback": "Reveja a figura do exemplo de estrutura e conte os nós de cada ramo."
}
```

```quiz
{
  "question": "A árvore Radix tem apenas \"casa\", em um único nó. O que acontece ao inserir \"cas\"?",
  "options": [
    { "text": "O nó é dividido em \"cas\", marcado como fim de palavra, com o filho \"a\"", "correct": true },
    { "text": "Cria-se uma folha \"cas\" como filha da raiz", "correct": false },
    { "text": "Nada: \"cas\" já está guardada dentro de \"casa\"", "correct": false }
  ],
  "correctFeedback": "Correto! A chave acaba no meio do rótulo casa, então o nó é dividido ali, e a parte comum vira fim de palavra.",
  "incorrectFeedback": "Use prefixoComum: quantos caracteres de casa coincidem com cas? O que sobra do rótulo?"
}
```

```quiz
{
  "question": "Por que uma árvore Radix com n palavras tem no máximo cerca de 2n nós?",
  "options": [
    { "text": "Porque cada palavra ocupa exatamente dois nós", "correct": false },
    { "text": "Porque todo nó que não é fim de palavra tem pelo menos dois filhos, e esse tipo de nó não pode passar do número de palavras", "correct": true },
    { "text": "Porque o alfabeto tem 26 letras", "correct": false }
  ],
  "correctFeedback": "Correto! Como os nós que não são fim de palavra são sempre bifurcações, o número de nós fica limitado pelo número de palavras, por mais longas que elas sejam.",
  "incorrectFeedback": "Releia a análise de complexidade: qual regra impede que surjam nós desnecessários?"
}
```

```quiz
{
  "question": "Um servidor web guarda as rotas /usuarios/perfil e /usuarios/posts numa árvore Radix. Como elas ficam?",
  "options": [
    { "text": "Um nó \"/usuarios/\" com os filhos \"perfil\" e \"posts\"", "correct": false },
    { "text": "Um nó \"/usuarios/p\" com os filhos \"erfil\" e \"osts\"", "correct": true },
    { "text": "Dois nós separados, um para cada rota, filhos da raiz", "correct": false }
  ],
  "correctFeedback": "Correto! As duas rotas também têm o p em comum. Como os filhos de um nó precisam começar com letras diferentes, a divisão acontece depois do p.",
  "incorrectFeedback": "Encontre o maior prefixo comum das duas rotas, letra por letra. Perfil e posts começam com a mesma letra?"
}
```
