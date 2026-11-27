# Lista de Exercícios - Árvore Trie

Resolva a lista de exercícios para avançar para a próxima etapa.

## Questões interativas

Insira sol, solo e sal, nessa ordem. Antes de cada inserção, marque os nós que serão reaproveitados. No fim, decida se so é uma palavra ou só um prefixo. Se errar, a mensagem explica o que falta; depois da primeira tentativa, o botão **Ver resposta** aparece.

```pratica
{
  "tipo": "trie",
  "title": "Pratique: inserção e busca na Trie",
  "palavras": [
    "sol",
    "solo",
    "sal"
  ],
  "busca": "so"
}
```

## Questões de múltipla escolha

```quiz
{
  "question": "Qual é o custo de buscar uma palavra de tamanho m em uma Trie que armazena n palavras?",
  "options": [
    { "text": "O(log n)", "correct": false },
    { "text": "O(m)", "correct": true },
    { "text": "O(n · m)", "correct": false },
    { "text": "O(n)", "correct": false }
  ],
  "correctFeedback": "Correto! A busca percorre um nó por caractere da chave, independentemente de quantas palavras existem na Trie.",
  "incorrectFeedback": "Lembre-se de que a Trie desce um nível por caractere. Quantos passos são necessários para uma palavra de tamanho m?"
}
```

```quiz
{
  "question": "Uma Trie contém apenas a palavra \"carro\". O que retorna buscar(\"car\")?",
  "options": [
    { "text": "true, porque o caminho c-a-r existe", "correct": false },
    { "text": "false, porque o nó do r não está marcado como fim de palavra", "correct": true },
    { "text": "Gera erro, porque o caminho não existe", "correct": false }
  ],
  "correctFeedback": "Correto! O caminho existe, mas \"car\" é apenas um prefixo de \"carro\", não uma palavra armazenada.",
  "incorrectFeedback": "Revise a seção sobre a marca de fim de palavra: existir o caminho não basta para a busca exata."
}
```

```quiz
{
  "question": "Na mesma Trie que contém apenas \"carro\", o que retorna comecaCom(\"car\")?",
  "options": [
    { "text": "true, porque basta o caminho c-a-r existir", "correct": true },
    { "text": "false, porque \"car\" não está marcada como fim de palavra", "correct": false },
    { "text": "false, porque a busca por prefixo só aceita prefixos de uma letra", "correct": false }
  ],
  "correctFeedback": "Correto! A busca por prefixo não exige a marca de fim de palavra: se o caminho existe, alguma palavra começa com ele.",
  "incorrectFeedback": "Compare buscar e comecaCom: qual delas exige que o último nó seja fim de palavra?"
}
```

```quiz
{
  "question": "Uma Trie guarda as palavras casa, caso, cama, cao e dia. Quantos nós ela tem, sem contar a raiz?",
  "options": [
    { "text": "17, uma letra por palavra", "correct": false },
    { "text": "11, porque o prefixo ca é guardado uma única vez", "correct": true },
    { "text": "5, um nó por palavra", "correct": false },
    { "text": "7, um nó por trecho sem bifurcação", "correct": false }
  ],
  "correctFeedback": "Correto! São c, a, s, a, o, m, a, o (8 nós no ramo de ca) e d, i, a (3 nós no ramo de dia).",
  "incorrectFeedback": "Desenhe a Trie: as palavras que começam com ca compartilham os nós c e a. Conte os nós de cada ramo."
}
```

```quiz
{
  "question": "Uma Trie já contém \"carro\". Quantos nós novos são criados ao inserir \"car\"?",
  "options": [
    { "text": "Nenhum: o caminho c-a-r já existe, basta marcar o nó do r como fim de palavra", "correct": true },
    { "text": "Três: c, a e r", "correct": false },
    { "text": "Um: um novo nó r para a palavra car", "correct": false }
  ],
  "correctFeedback": "Correto! A inserção só cria nós quando o caminho não existe. Aqui ele já existe, então a inserção apenas marca o fim de palavra.",
  "incorrectFeedback": "Siga a inserção letra por letra: em algum momento falta um filho?"
}
```

```quiz
{
  "question": "Uma Trie guarda \"car\" e \"carro\". Ao remover \"carro\", o que acontece com os nós?",
  "options": [
    { "text": "Todos os nós do caminho de carro são liberados, inclusive c, a e r", "correct": false },
    { "text": "Os nós do segundo r e do o são liberados; o nó do primeiro r fica, porque marca o fim de car", "correct": true },
    { "text": "Nenhum nó é liberado; só a marca de fim de palavra do o é desfeita", "correct": false }
  ],
  "correctFeedback": "Correto! A remoção libera, de baixo para cima, os nós que ficaram sem filhos e sem marca de fim de palavra, e para no primeiro nó que ainda é útil.",
  "incorrectFeedback": "Lembre-se da regra da remoção: um nó só é liberado se não for fim de palavra e não tiver filhos."
}
```

```quiz
{
  "question": "Na representação com vetor de 26 filhos, qual posição de filhos[] corresponde à letra 'd'?",
  "options": [
    { "text": "filhos[4], porque d é a quarta letra", "correct": false },
    { "text": "filhos[3], porque 'd' - 'a' = 3", "correct": true },
    { "text": "filhos[100], o código ASCII de 'd'", "correct": false }
  ],
  "correctFeedback": "Correto! O índice é a distância da letra até 'a': 'a' vai para 0, 'b' para 1, e assim por diante.",
  "incorrectFeedback": "Revise a representação em C: como a letra vira um índice entre 0 e 25?"
}
```

```quiz
{
  "question": "Qual é a principal desvantagem de uma Trie implementada com vetor de ponteiros em cada nó?",
  "options": [
    { "text": "A busca é mais lenta que em uma árvore binária de busca", "correct": false },
    { "text": "Não permite buscar palavras por prefixo", "correct": false },
    { "text": "Consome muita memória, pois cada nó reserva espaço para todo o alfabeto", "correct": true }
  ],
  "correctFeedback": "Correto! Cada nó reserva σ ponteiros, mesmo que a maioria fique nula. Variações como a Trie compacta reduzem esse custo.",
  "incorrectFeedback": "Pense no tamanho de cada nó: quantos ponteiros ele guarda e quantos são realmente usados?"
}
```

```quiz
{
  "question": "A tabela de rotas tem: (vazio) → A, 1 → B, 10 → C, 101 → D, 01 → E e 0110 → F. Por qual saída sai um pacote com endereço 1001?",
  "options": [
    { "text": "B, porque o primeiro bit é 1", "correct": false },
    { "text": "C, porque 10 é o maior prefixo cadastrado que combina com 1001", "correct": true },
    { "text": "D, porque 101 é a rota mais longa que começa com 1", "correct": false },
    { "text": "A, a rota padrão", "correct": false }
  ],
  "correctFeedback": "Correto! A busca passa por 1 (B) e 10 (C) e para porque o nó 100 não existe. A última rota vista, C, é o maior prefixo comum.",
  "incorrectFeedback": "Desça pela Trie seguindo os bits de 1001 e lembre a última rota vista no caminho. A rota 101 combina com 1001?"
}
```

```quiz
{
  "question": "Por que listar as sugestões de um autocompletar pode custar mais do que O(m), sendo m o tamanho do prefixo digitado?",
  "options": [
    { "text": "Porque, depois de achar o nó do prefixo, é preciso percorrer a subárvore abaixo dele para listar as palavras", "correct": true },
    { "text": "Porque a Trie precisa ser reconstruída a cada letra digitada", "correct": false },
    { "text": "Porque a busca pelo prefixo sempre visita todos os nós da Trie", "correct": false }
  ],
  "correctFeedback": "Correto! O(m) só verifica se o prefixo existe. Listar as sugestões depende de quantos nós existem abaixo dele.",
  "incorrectFeedback": "Separe as duas etapas do autocompletar: achar o nó do prefixo e listar as palavras que começam com ele."
}
```
