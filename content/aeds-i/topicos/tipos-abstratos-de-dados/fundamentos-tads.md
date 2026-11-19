# Fundamentos dos Tipos Abstratos de Dados (TADs)

## 1. O que é um TAD?

Um **Tipo Abstrato de Dados (TAD)** é uma especificação de um conjunto de valores e das operações que podem ser realizadas sobre esses valores. Ele descreve o comportamento esperado de uma estrutura, sem obrigar que uma implementação específica seja utilizada.

A palavra *abstrato* é importante: primeiro definimos o que o tipo oferece; depois decidimos como construir isso no código.

Por exemplo, uma pilha permite inserir um elemento no topo, remover o elemento do topo e consultar qual elemento está no topo. A especificação da pilha não exige que ela seja construída com vetor ou lista encadeada.

## 2. Dados e operações

Ao estudar um TAD, procure identificar:

- **Conjunto de dados:** quais valores podem ser armazenados.
- **Operações:** quais ações são permitidas.
- **Regras de comportamento:** o que cada operação deve fazer e quais condições precisam ser respeitadas.

Considere o TAD de uma pilha de números inteiros. Podemos especificar operações como:

| Operação | Comportamento |
|---|---|
| `criar()` | Cria uma pilha vazia |
| `empilhar(x)` | Insere `x` no topo |
| `desempilhar()` | Remove e retorna o elemento do topo |
| `topo()` | Consulta o elemento do topo sem removê-lo |
| `estaVazia()` | Informa se não há elementos |

A especificação também deve definir o que acontece quando tentamos desempilhar ou consultar o topo de uma pilha vazia. Uma implementação pode lançar uma exceção, retornar um indicador de erro ou adotar outra convenção documentada.

## 3. Abstração: o que importa para quem utiliza?

Quem utiliza uma pilha precisa conhecer suas operações e suas regras. Não precisa saber se os elementos estão armazenados em um vetor, em nós ligados por ponteiros ou em outra representação.

Essa separação reduz o acoplamento: o código cliente depende do contrato do TAD, e não dos detalhes internos de uma implementação.

## 4. TAD não é sinônimo de estrutura de dados

Os conceitos são relacionados, mas não idênticos:

- **TAD:** especificação lógica do comportamento e das operações.
- **Estrutura de dados:** organização concreta dos dados na memória para implementar esse comportamento.

Uma pilha é um TAD. Um vetor usado para guardar seus elementos é uma escolha de implementação. Uma lista encadeada também pode implementar o mesmo TAD.

## 5. Por que estudar TADs?

TADs ajudam a:

1. separar a interface da implementação;
2. trocar a implementação sem alterar o código que utiliza o tipo, desde que o contrato seja preservado;
3. organizar programas em módulos;
4. testar operações de maneira isolada;
5. raciocinar sobre o comportamento antes de escrever código.

## 6. Exemplo de raciocínio

Imagine um sistema que precisa controlar atendimentos por ordem de chegada. Antes de escolher vetor ou lista encadeada, podemos especificar o comportamento desejado: inserir no final e retirar do início. Essa especificação corresponde ao TAD fila.

A escolha de como armazenar os elementos é uma etapa posterior. Primeiro identificamos o comportamento; depois selecionamos uma implementação adequada.

## 7. Resumo

Um TAD descreve **o que** um tipo de dado faz, por meio de seus valores, operações e regras. A estrutura de dados escolhida determina **como** esse comportamento será realizado na memória.


## Exercícios interativos

### Questão 1

```quiz
{
  "question": "Uma equipe define que uma pilha deve permitir inserir e remover elementos pelo topo, mas ainda não escolheu como armazená-los. O que foi definido até aqui?",
  "options": [
    {
      "text": "Uma implementação com vetor",
      "correct": false
    },
    {
      "text": "A especificação de um TAD",
      "correct": true
    },
    {
      "text": "Um algoritmo de ordenação",
      "correct": false
    },
    {
      "text": "Uma lista duplamente encadeada",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. O comportamento e as operações foram definidos sem fixar a representação interna: isso é a especificação de um TAD.",
  "incorrectFeedback": "Observe que a equipe ainda não escolheu a organização concreta na memória. Ela definiu o comportamento oferecido pelo tipo."
}
```

### Questão 2

```quiz
{
  "question": "Qual alternativa expressa melhor a ideia de abstração em um TAD?",
  "options": [
    {
      "text": "Esconder todos os dados do programa, inclusive suas operações",
      "correct": false
    },
    {
      "text": "Descrever o comportamento oferecido sem expor detalhes desnecessários da implementação",
      "correct": true
    },
    {
      "text": "Usar obrigatoriamente classes e herança",
      "correct": false
    },
    {
      "text": "Armazenar todos os elementos em um vetor",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A abstração destaca a interface e o comportamento relevante, deixando detalhes internos separados.",
  "incorrectFeedback": "Abstração não significa ausência de operações. Ela separa o que o usuário precisa saber dos detalhes de como o tipo funciona internamente."
}
```

### Questão 3

```quiz
{
  "question": "Duas pilhas possuem as mesmas operações e obedecem às mesmas regras, mas uma usa vetor e outra usa lista encadeada. Qual afirmação é correta?",
  "options": [
    {
      "text": "São necessariamente TADs diferentes",
      "correct": false
    },
    {
      "text": "Somente a pilha com vetor é um TAD",
      "correct": false
    },
    {
      "text": "Podem ser duas implementações do mesmo TAD",
      "correct": true
    },
    {
      "text": "A lista encadeada deixa de ser uma estrutura de dados",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. A representação interna pode mudar sem alterar o comportamento especificado pelo TAD.",
  "incorrectFeedback": "A implementação não define sozinha o TAD. Compare as operações e as regras observáveis pelas pessoas que utilizam a pilha."
}
```

### Questão 4

```quiz
{
  "question": "Qual item pertence mais diretamente à especificação de um TAD Fila?",
  "options": [
    {
      "text": "Os endereços de memória dos nós",
      "correct": false
    },
    {
      "text": "A quantidade exata de bytes de cada elemento",
      "correct": false
    },
    {
      "text": "A regra de remover primeiro o elemento que chegou primeiro",
      "correct": true
    },
    {
      "text": "O nome da variável que guarda o vetor",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A regra FIFO é parte do comportamento da fila e deve aparecer na especificação.",
  "incorrectFeedback": "A especificação trata do comportamento observável, não de endereços de memória ou nomes de variáveis."
}
```

### Questão 5

```quiz
{
  "question": "Um programa cliente utiliza apenas `empilhar`, `desempilhar` e `topo`. O programador troca o vetor por uma lista encadeada sem mudar essas operações. Qual benefício dos TADs aparece nesse caso?",
  "options": [
    {
      "text": "Aumento obrigatório da velocidade",
      "correct": false
    },
    {
      "text": "Separação entre interface e implementação",
      "correct": true
    },
    {
      "text": "Eliminação de todos os testes",
      "correct": false
    },
    {
      "text": "Conversão automática da pilha em fila",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. Como o cliente depende da interface, a implementação pode ser substituída preservando o contrato.",
  "incorrectFeedback": "A vantagem está em não obrigar o código cliente a conhecer a representação interna."
}
```

### Questão 6

```quiz
{
  "question": "Ao especificar a operação `desempilhar`, por que é importante definir o comportamento para uma pilha vazia?",
  "options": [
    {
      "text": "Porque toda operação precisa ter regras também para situações-limite",
      "correct": true
    },
    {
      "text": "Porque uma pilha vazia sempre contém zero",
      "correct": false
    },
    {
      "text": "Porque o vetor precisa ter tamanho infinito",
      "correct": false
    },
    {
      "text": "Porque pilhas não podem ficar vazias",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito. Uma especificação completa define o comportamento esperado inclusive em casos-limite.",
  "incorrectFeedback": "Pense no que acontece quando uma operação é solicitada em um estado no qual não existe elemento no topo."
}
```

### Questão 7

```quiz
{
  "question": "Qual afirmação diferencia corretamente TAD e estrutura de dados?",
  "options": [
    {
      "text": "TAD descreve comportamento; estrutura de dados é uma forma concreta de organizar os dados",
      "correct": true
    },
    {
      "text": "TAD é sempre implementado por árvore",
      "correct": false
    },
    {
      "text": "Estrutura de dados descreve apenas a interface",
      "correct": false
    },
    {
      "text": "Não existe diferença entre os termos",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Essa distinção é central: especificação lógica de um lado, representação concreta do outro.",
  "incorrectFeedback": "Lembre-se: o TAD responde o que o tipo oferece; a estrutura de dados ajuda a responder como implementar."
}
```

### Questão 8

```quiz
{
  "question": "Uma biblioteca oferece um TAD conjunto com operações de inserir, remover e verificar pertinência. O usuário não precisa saber como os elementos são organizados. Isso é um exemplo de:",
  "options": [
    {
      "text": "Acoplamento direto à memória",
      "correct": false
    },
    {
      "text": "Encapsulamento da implementação por uma interface",
      "correct": true
    },
    {
      "text": "Recursividade obrigatória",
      "correct": false
    },
    {
      "text": "Ordenação por seleção",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A biblioteca oferece operações bem definidas sem exigir que o cliente conheça os detalhes internos.",
  "incorrectFeedback": "A ideia é disponibilizar uma interface estável e manter a representação interna como detalhe da implementação."
}
```

### Questão 9

```quiz
{
  "question": "Qual decisão deve ser tomada primeiro ao projetar um TAD para um problema?",
  "options": [
    {
      "text": "Escolher o nome de cada ponteiro",
      "correct": false
    },
    {
      "text": "Definir os comportamentos e operações necessários",
      "correct": true
    },
    {
      "text": "Escolher imediatamente o tamanho do vetor",
      "correct": false
    },
    {
      "text": "Escrever todos os detalhes de alocação",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Primeiro compreenda o comportamento necessário; depois escolha uma implementação que o realize.",
  "incorrectFeedback": "Comece pelo problema e pelo contrato de operações, não por detalhes de memória."
}
```

### Questão 10

```quiz
{
  "question": "Um TAD é considerado abstrato principalmente porque:",
  "options": [
    {
      "text": "Não pode ser implementado em uma linguagem de programação",
      "correct": false
    },
    {
      "text": "Não armazena valores",
      "correct": false
    },
    {
      "text": "Sua definição não depende de uma representação interna específica",
      "correct": true
    },
    {
      "text": "Só pode ser utilizado em programas acadêmicos",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. A abstração permite que diferentes representações implementem o mesmo comportamento.",
  "incorrectFeedback": "Um TAD pode ser implementado normalmente. O ponto é que sua especificação não fica presa a uma única representação."
}
```