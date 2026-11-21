# Exercícios Avaliativos — Tipos Abstratos de Dados

Esta página reúne questões de revisão sobre os conceitos de TAD, especificação, interface, implementação e exemplos clássicos.

Procure justificar mentalmente cada alternativa antes de conferir a resposta. As questões foram pensadas para exigir interpretação e aplicação dos conceitos, não apenas memorização.


## Exercícios interativos

### Questão 1

```quiz
{
  "question": "Uma equipe precisa criar um tipo para controlar documentos aguardando processamento. O documento mais antigo deve ser processado primeiro. Qual comportamento deve constar na especificação?",
  "options": [
    {
      "text": "LIFO",
      "correct": false
    },
    {
      "text": "FIFO",
      "correct": true
    },
    {
      "text": "Acesso apenas pelo meio",
      "correct": false
    },
    {
      "text": "Proibição de remoção",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. O requisito descreve FIFO, comportamento característico de uma fila.",
  "incorrectFeedback": "O documento mais antigo deve sair primeiro: primeiro a entrar, primeiro a sair."
}
```

### Questão 2

```quiz
{
  "question": "Um desenvolvedor diz que 'lista encadeada é o TAD e lista é a implementação'. Qual correção é mais adequada?",
  "options": [
    {
      "text": "Lista pode ser o TAD; lista encadeada é uma possível implementação",
      "correct": true
    },
    {
      "text": "Lista encadeada e lista são sempre conceitos sem relação",
      "correct": false
    },
    {
      "text": "TAD só existe em linguagens orientadas a objetos",
      "correct": false
    },
    {
      "text": "A afirmação está correta em qualquer contexto",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A lista pode ser especificada como TAD, enquanto a lista encadeada é uma representação possível.",
  "incorrectFeedback": "Separe o comportamento abstrato da organização concreta dos nós e ligações."
}
```

### Questão 3

```quiz
{
  "question": "Uma operação `remover(x)` de um conjunto deve manter a propriedade de não haver duplicatas. Qual aspecto do contrato ela precisa esclarecer?",
  "options": [
    {
      "text": "O que acontece quando `x` não está presente",
      "correct": true
    },
    {
      "text": "A cor do nó",
      "correct": false
    },
    {
      "text": "O endereço do processador",
      "correct": false
    },
    {
      "text": "O nome do sistema operacional",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Casos como remover um elemento ausente precisam ter comportamento documentado.",
  "incorrectFeedback": "Uma especificação deve cobrir também entradas e estados-limite relevantes."
}
```

### Questão 4

```quiz
{
  "question": "Um módulo cliente usa uma fila apenas por meio de `enfileirar` e `desenfileirar`. A equipe altera a fila de vetor circular para lista encadeada. Qual condição permite manter o módulo cliente sem alterações?",
  "options": [
    {
      "text": "A nova implementação deve preservar o contrato da fila",
      "correct": true
    },
    {
      "text": "A nova implementação deve usar os mesmos índices",
      "correct": false
    },
    {
      "text": "A nova implementação deve ter o mesmo código fonte",
      "correct": false
    },
    {
      "text": "O cliente deve acessar os nós diretamente",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito. Preservando interface e comportamento, o detalhe interno pode mudar sem afetar o cliente.",
  "incorrectFeedback": "O cliente depende do contrato. Se ele continuar válido, a representação interna pode ser substituída."
}
```

### Questão 5

```quiz
{
  "question": "Uma pilha contém [A, B, C], com C no topo. A aplicação chama `topo()` e depois `desempilhar()`. Quais resultados são esperados?",
  "options": [
    {
      "text": "`topo()` retorna C e `desempilhar()` remove C",
      "correct": true
    },
    {
      "text": "`topo()` remove C e `desempilhar()` retorna B",
      "correct": false
    },
    {
      "text": "Ambas retornam A",
      "correct": false
    },
    {
      "text": "A pilha fica inalterada após as duas chamadas",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Consultar retorna C sem removê-lo; em seguida, desempilhar remove C.",
  "incorrectFeedback": "A primeira operação observa o topo. A segunda efetivamente remove o elemento."
}
```

### Questão 6

```quiz
{
  "question": "Uma implementação de fila usa lista encadeada e mantém apenas um ponteiro para o primeiro nó. Para inserir no final, qual dificuldade pode surgir?",
  "options": [
    {
      "text": "Pode ser necessário percorrer a lista para encontrar o último nó",
      "correct": true
    },
    {
      "text": "A fila passa a ser LIFO",
      "correct": false
    },
    {
      "text": "Não é possível remover o primeiro",
      "correct": false
    },
    {
      "text": "A lista não pode armazenar elementos",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. Sem um ponteiro para o último nó, a inserção no final pode exigir uma travessia.",
  "incorrectFeedback": "Pense em como alcançar o final da lista se apenas o primeiro nó é conhecido."
}
```

### Questão 7

```quiz
{
  "question": "Qual situação ilustra melhor a diferença entre interface e implementação?",
  "options": [
    {
      "text": "`desenfileirar()` é operação pública; usar índices circulares é detalhe interno",
      "correct": true
    },
    {
      "text": "FIFO é um tipo de ponteiro",
      "correct": false
    },
    {
      "text": "Vetor é uma regra de atendimento",
      "correct": false
    },
    {
      "text": "Uma pré-condição é uma linguagem de programação",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A operação faz parte da interface; o mecanismo de índices circulares pertence à implementação.",
  "incorrectFeedback": "A interface descreve como interagir. O detalhe interno explica como a operação é realizada."
}
```

### Questão 8

```quiz
{
  "question": "Uma operação exige que a pilha não esteja vazia antes de consultar o topo. Se essa condição não for satisfeita, o que deve acontecer?",
  "options": [
    {
      "text": "O comportamento deve seguir a política definida no contrato para esse caso",
      "correct": true
    },
    {
      "text": "O programa deve inventar um elemento",
      "correct": false
    },
    {
      "text": "A pilha deve se transformar em fila",
      "correct": false
    },
    {
      "text": "A operação deve sempre retornar o último valor removido",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. O contrato precisa definir como tratar chamadas em estados inválidos, como exceção ou código de erro.",
  "incorrectFeedback": "Não existe uma única política obrigatória; é necessário seguir a estratégia documentada."
}
```

### Questão 9

```quiz
{
  "question": "Um sistema de desfazer ações precisa recuperar a última ação realizada. Qual escolha de TAD e justificativa são adequadas?",
  "options": [
    {
      "text": "Fila, pois remove a ação mais antiga",
      "correct": false
    },
    {
      "text": "Pilha, pois a última ação registrada é recuperada primeiro",
      "correct": true
    },
    {
      "text": "Conjunto, pois elimina ações repetidas",
      "correct": false
    },
    {
      "text": "Lista ordenada, pois sempre remove o menor valor",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. O comportamento de desfazer normalmente é LIFO, portanto uma pilha é uma abstração natural.",
  "incorrectFeedback": "A ação mais recente deve ser desfeita antes das anteriores."
}
```

### Questão 10

```quiz
{
  "question": "Uma implementação de TAD conjunto usa uma árvore de busca. Outra usa tabela hash. Ambas impedem duplicatas e oferecem as mesmas operações. Qual afirmação é correta?",
  "options": [
    {
      "text": "São implementações possíveis do mesmo TAD, com características de desempenho distintas",
      "correct": true
    },
    {
      "text": "Uma delas não pode ser chamada de conjunto",
      "correct": false
    },
    {
      "text": "O TAD exige obrigatoriamente uma árvore",
      "correct": false
    },
    {
      "text": "A tabela hash altera a definição de conjunto",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A especificação do conjunto pode ser atendida por diferentes estruturas, que apresentam custos e propriedades diferentes.",
  "incorrectFeedback": "O comportamento sem duplicatas e as operações definidas caracterizam o TAD; árvore e tabela hash são escolhas de implementação."
}
```