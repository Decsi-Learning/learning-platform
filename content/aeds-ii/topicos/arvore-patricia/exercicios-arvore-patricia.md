# Lista de Exercícios - Árvore Patricia

Resolva a lista de exercícios para avançar para a próxima etapa.

As questões usam a árvore do exemplo da aula, com as chaves B = `00010`, C = `00011`, H = `01000`, J = `01010`, Q = `10001` e W = `10111`. A raiz testa o bit 1; à esquerda, o nó do bit 2 separa o nó do bit 5 (folhas B e C) do nó do bit 4 (folhas H e J); à direita, o nó do bit 3 separa as folhas Q e W.

## Questões interativas

Encontre o primeiro bit diferente entre duas chaves e depois acompanhe, nó por nó, a pesquisa por uma chave que não está na árvore. Se errar, a mensagem explica o que falta; depois da primeira tentativa, o botão **Ver resposta** aparece.

```pratica
{
  "tipo": "patricia",
  "title": "Pratique: bits e pesquisa na árvore Patricia",
  "bits": 5,
  "pares": [
    [
      {
        "nome": "H",
        "bits": "01000"
      },
      {
        "nome": "J",
        "bits": "01010"
      }
    ],
    [
      {
        "nome": "Q",
        "bits": "10001"
      },
      {
        "nome": "W",
        "bits": "10111"
      }
    ]
  ],
  "chaves": [
    {
      "nome": "B",
      "bits": "00010"
    },
    {
      "nome": "C",
      "bits": "00011"
    },
    {
      "nome": "H",
      "bits": "01000"
    },
    {
      "nome": "J",
      "bits": "01010"
    },
    {
      "nome": "Q",
      "bits": "10001"
    },
    {
      "nome": "W",
      "bits": "10111"
    }
  ],
  "procurada": {
    "nome": "G",
    "bits": "00111"
  }
}
```

## Questões de múltipla escolha

```quiz
{
  "question": "O que um nó interno de uma árvore Patricia armazena?",
  "options": [
    { "text": "Uma chave completa", "correct": false },
    { "text": "O índice do bit que deve ser testado nele", "correct": true },
    { "text": "Um caractere da chave, como na Trie", "correct": false },
    { "text": "A quantidade de chaves abaixo dele", "correct": false }
  ],
  "correctFeedback": "Correto! O nó interno só diz qual bit testar; as chaves ficam nas folhas.",
  "incorrectFeedback": "Revise a seção Conceito principal: o que fica nos nós internos e o que fica nas folhas?"
}
```

```quiz
{
  "question": "Por que a pesquisa na Patricia precisa comparar a chave inteira ao chegar a uma folha?",
  "options": [
    { "text": "Porque as folhas não guardam a chave", "correct": false },
    { "text": "Porque alguns bits são pulados na descida, e a chave procurada pode diferir justamente neles", "correct": true },
    { "text": "Porque a árvore pode estar desbalanceada", "correct": false }
  ],
  "correctFeedback": "Correto! É o que acontece na pesquisa por D, que chega à folha B: os bits testados batem, mas os bits pulados são diferentes.",
  "incorrectFeedback": "Lembre do exemplo da pesquisa por D: que bits foram testados e quais foram pulados?"
}
```

```quiz
{
  "question": "Uma árvore Patricia armazena 10 chaves. Quantos nós internos ela tem?",
  "options": [
    { "text": "10", "correct": false },
    { "text": "9", "correct": true },
    { "text": "20", "correct": false },
    { "text": "Depende do tamanho das chaves", "correct": false }
  ],
  "correctFeedback": "Correto! Com n chaves há n folhas e n − 1 nós internos, porque cada nó interno tem exatamente dois filhos.",
  "incorrectFeedback": "Cada nó interno tem dois filhos e as chaves ficam nas folhas. Quantos nós internos são necessários para separar n folhas?"
}
```

```quiz
{
  "question": "Na árvore do exemplo, a chave K = 01011 é inserida. Qual bit o novo nó interno vai testar?",
  "options": [
    { "text": "Bit 2", "correct": false },
    { "text": "Bit 4", "correct": false },
    { "text": "Bit 5", "correct": true },
    { "text": "Bit 3", "correct": false }
  ],
  "correctFeedback": "Correto! K desce pelos bits 1 (0), 2 (1) e 4 (1) até a folha J = 01010. O primeiro bit em que K e J diferem é o 5.",
  "incorrectFeedback": "Desça a árvore com K = 01011 até uma folha e compare K com a chave dessa folha, bit a bit."
}
```

```quiz
{
  "question": "Na pesquisa por W = 10111, quais bits são testados antes de chegar à folha?",
  "options": [
    { "text": "Os bits 1, 2, 3, 4 e 5, um por nível", "correct": false },
    { "text": "Só os bits 1 e 3", "correct": true },
    { "text": "Só o bit 1", "correct": false },
    { "text": "Os bits 1, 2 e 3", "correct": false }
  ],
  "correctFeedback": "Correto! O bit 1 vale 1 e leva ao nó do bit 3, que também vale 1 e leva à folha W. O bit 2 é pulado porque Q e W têm o mesmo valor nele.",
  "incorrectFeedback": "Comece pela raiz e siga só os nós internos que aparecem no caminho. Qual nó fica à direita da raiz?"
}
```

```quiz
{
  "question": "Pesquisando G = 00111 na árvore do exemplo, a que folha a descida chega e qual é o resultado?",
  "options": [
    { "text": "Folha C; como G ≠ C, a pesquisa responde que G não está na árvore", "correct": true },
    { "text": "Folha B; G está na árvore", "correct": false },
    { "text": "A pesquisa para num nó interno, porque falta um filho", "correct": false },
    { "text": "Folha H; G está na árvore", "correct": false }
  ],
  "correctFeedback": "Correto! Os bits 1 (0), 2 (0) e 5 (1) levam à folha C = 00011. A comparação final mostra a diferença no bit 3, um dos bits que a descida pulou (o 3 e o 4).",
  "incorrectFeedback": "Teste só os bits que os nós internos mandam testar e, na folha, compare a chave inteira."
}
```

```quiz
{
  "question": "Quanto vale bit(3, Q) para Q = 10001, com a função bit da aula?",
  "options": [
    { "text": "0", "correct": true },
    { "text": "1", "correct": false },
    { "text": "4", "correct": false }
  ],
  "correctFeedback": "Correto! Q >> (5 − 3) desloca dois bits e dá 100; & 1 pega o último bit, que vale 0.",
  "incorrectFeedback": "Conte os bits de 10001 da esquerda para a direita, começando em 1. Qual é o terceiro?"
}
```

```quiz
{
  "question": "Ao remover H da árvore do exemplo, o que acontece?",
  "options": [
    { "text": "Só a folha H é liberada; o nó do bit 4 fica com um filho", "correct": false },
    { "text": "A folha H e o nó que testa o bit 4 saem, e a folha J sobe para o lugar desse nó", "correct": true },
    { "text": "A árvore inteira é reconstruída a partir das chaves restantes", "correct": false }
  ],
  "correctFeedback": "Correto! Todo nó interno precisa de dois filhos. Sem H, o nó do bit 4 perde a razão de existir, e o irmão J ocupa o lugar dele.",
  "incorrectFeedback": "Lembre que, na Patricia, nenhum nó interno pode ter um filho só. O que acontece com o pai de H?"
}
```

```quiz
{
  "question": "Um nó que testa o bit 4 pode ter, abaixo dele, um nó que testa o bit 2?",
  "options": [
    { "text": "Sim, a ordem dos bits não importa", "correct": false },
    { "text": "Não: ao descer da raiz até uma folha, os índices testados são sempre crescentes", "correct": true },
    { "text": "Só se a árvore tiver mais de 8 chaves", "correct": false }
  ],
  "correctFeedback": "Correto! É por isso que a inserção desce de novo a partir da raiz para encaixar o nó novo no lugar certo.",
  "incorrectFeedback": "Releia as regras do Conceito principal sobre os índices testados ao longo de um caminho."
}
```

```quiz
{
  "question": "Comparada à Trie binária, qual é a principal vantagem da Patricia?",
  "options": [
    { "text": "A pesquisa não precisa comparar nenhuma chave", "correct": false },
    { "text": "Ela não tem nós com um filho só: usa sempre 2n − 1 nós, qualquer que seja o tamanho das chaves", "correct": true },
    { "text": "Ela guarda as chaves em ordem de inserção", "correct": false },
    { "text": "A pesquisa custa O(1)", "correct": false }
  ],
  "correctFeedback": "Correto! A Trie binária pode ter até O(n · b) nós, com longos caminhos sem bifurcação. A Patricia elimina esses caminhos.",
  "incorrectFeedback": "Releia a tabela de comparação: o que muda no espaço ocupado e nos nós com um filho só?"
}
```
