# Especificação, Interface e Implementação de TADs

## 1. Do problema ao contrato

Projetar um TAD começa pela compreensão do problema. É preciso identificar quais informações serão manipuladas, quais operações os usuários precisam executar e quais regras devem ser respeitadas.

O resultado dessa etapa é um **contrato**: uma descrição do que cada operação recebe, do que produz e de como deve se comportar.

Uma especificação não precisa começar com código. Ela pode ser escrita em linguagem natural, tabela, pseudocódigo ou uma interface de funções.

## 2. Interface

A interface apresenta as operações disponíveis. Por exemplo, uma interface conceitual para um TAD Fila pode conter:

```text
criar()
enfileirar(elemento)
desenfileirar()
primeiro()
estaVazia()
```

A interface não precisa revelar se a fila usa vetor circular, lista encadeada ou outra representação.

## 3. Pré-condições e pós-condições

Uma **pré-condição** informa o que deve ser verdadeiro antes da execução de uma operação. Uma **pós-condição** descreve o que deve ser verdadeiro depois que ela termina corretamente.

Exemplo para `desenfileirar()`:

- Pré-condição: a fila não está vazia.
- Pós-condição: o elemento que estava no início foi removido e retornado.

Há diferentes maneiras de tratar uma chamada que viola uma pré-condição: lançar exceção, retornar um código de erro ou utilizar outro mecanismo documentado. O importante é que o contrato seja claro.

## 4. Implementação

A implementação escolhe as estruturas e os algoritmos que realizam as operações. Para uma fila, por exemplo:

- com vetor simples, pode ser necessário deslocar elementos em algumas estratégias;
- com vetor circular, índices avançam de forma circular;
- com lista encadeada, nós são ligados por referências ou ponteiros.

Essas escolhas podem afetar consumo de memória e tempo de execução, mas não devem alterar o comportamento público definido pelo TAD.

## 5. Encapsulamento e invariantes

O **encapsulamento** protege os detalhes internos e orienta o acesso por meio das operações da interface.

Um **invariante** é uma propriedade que deve permanecer verdadeira nos estados válidos da estrutura. Em uma fila implementada por vetor circular, por exemplo, os índices de início e fim devem respeitar as regras de ocupação e capacidade definidas pela implementação.

O cliente não deve modificar diretamente os campos internos de maneira que viole esses invariantes.

## 6. Troca de implementação

Suponha que um sistema use uma fila implementada por vetor circular. Mais tarde, a equipe decide utilizar uma lista encadeada porque a capacidade fixa deixou de ser adequada.

Se a nova implementação preservar as operações e o comportamento especificados, o código cliente pode continuar funcionando sem conhecer a mudança interna. Essa é uma das principais vantagens da separação entre interface e implementação.

## 7. Testes orientados ao contrato

Os testes devem verificar o comportamento prometido pela interface. Para uma fila, alguns casos importantes são:

- criar uma fila e verificar se está vazia;
- inserir um elemento e consultar o primeiro;
- inserir vários elementos e confirmar a ordem FIFO;
- remover elementos até esvaziar;
- testar a operação de remoção quando a fila está vazia, conforme o contrato.

## 8. Resumo

A especificação define o contrato; a interface apresenta as operações; a implementação realiza essas operações; e os invariantes ajudam a manter a estrutura em estados válidos.


## Exercícios interativos

### Questão 1

```quiz
{
  "question": "Uma operação `remover()` exige que a lista não esteja vazia. Essa exigência é um exemplo de:",
  "options": [
    {
      "text": "Pós-condição",
      "correct": false
    },
    {
      "text": "Pré-condição",
      "correct": true
    },
    {
      "text": "Invariante de ordenação",
      "correct": false
    },
    {
      "text": "Representação física",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A condição precisa ser verdadeira antes da chamada para que a operação seja executada conforme o contrato.",
  "incorrectFeedback": "A condição descreve o estado necessário antes da execução, portanto é uma pré-condição."
}
```

### Questão 2

```quiz
{
  "question": "Após `desenfileirar()` terminar corretamente, o elemento que estava no início não deve mais pertencer à fila. Isso descreve uma:",
  "options": [
    {
      "text": "Pré-condição",
      "correct": false
    },
    {
      "text": "Pós-condição",
      "correct": true
    },
    {
      "text": "Variável global",
      "correct": false
    },
    {
      "text": "Escolha de compilador",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A pós-condição descreve o resultado esperado depois da operação.",
  "incorrectFeedback": "Pergunte quando a propriedade deve valer: antes da chamada ou depois de sua conclusão?"
}
```

### Questão 3

```quiz
{
  "question": "Qual informação pertence à interface de um TAD?",
  "options": [
    {
      "text": "A lista exata de endereços dos nós",
      "correct": false
    },
    {
      "text": "As operações disponíveis e suas assinaturas",
      "correct": true
    },
    {
      "text": "O código interno de alocação de memória",
      "correct": false
    },
    {
      "text": "A disposição física dos dados na RAM",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A interface informa como o cliente pode interagir com o TAD.",
  "incorrectFeedback": "A interface mostra as operações públicas, não os detalhes de como elas são executadas."
}
```

### Questão 4

```quiz
{
  "question": "Uma fila muda de vetor circular para lista encadeada. Para preservar o TAD, o que deve permanecer igual para o cliente?",
  "options": [
    {
      "text": "A quantidade de ponteiros internos",
      "correct": false
    },
    {
      "text": "A disposição dos elementos na memória",
      "correct": false
    },
    {
      "text": "O comportamento das operações especificadas",
      "correct": true
    },
    {
      "text": "O nome das variáveis privadas",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. A implementação pode mudar, mas o contrato observável deve ser preservado.",
  "incorrectFeedback": "A mudança interna é permitida justamente porque o cliente depende do comportamento, não da representação."
}
```

### Questão 5

```quiz
{
  "question": "Uma estrutura possui a regra de que `inicio` sempre aponta para o primeiro elemento válido quando não está vazia. Essa regra interna é um exemplo de:",
  "options": [
    {
      "text": "Invariante",
      "correct": true
    },
    {
      "text": "Pós-condição universal",
      "correct": false
    },
    {
      "text": "Interface gráfica",
      "correct": false
    },
    {
      "text": "Parâmetro de compilação",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Um invariante é uma propriedade que deve permanecer verdadeira nos estados válidos da implementação.",
  "incorrectFeedback": "A regra descreve uma propriedade que a implementação precisa manter ao longo das operações."
}
```

### Questão 6

```quiz
{
  "question": "Por que não é recomendável permitir que o código cliente altere diretamente os ponteiros internos de uma lista?",
  "options": [
    {
      "text": "Porque ponteiros não podem ser utilizados em TADs",
      "correct": false
    },
    {
      "text": "Porque isso pode violar invariantes e corromper a estrutura",
      "correct": true
    },
    {
      "text": "Porque toda lista deve ser ordenada",
      "correct": false
    },
    {
      "text": "Porque a interface precisa ser escrita em Java",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. O acesso controlado pelas operações ajuda a preservar os invariantes da estrutura.",
  "incorrectFeedback": "Alterações diretas podem deixar ligações inconsistentes ou quebrar propriedades que a implementação espera manter."
}
```

### Questão 7

```quiz
{
  "question": "Um contrato informa que `consultarTopo()` retorna o elemento do topo sem removê-lo. Qual teste verifica diretamente esse comportamento?",
  "options": [
    {
      "text": "Consultar o topo duas vezes e verificar que o elemento continua lá",
      "correct": true
    },
    {
      "text": "Inserir um elemento e apagar o programa",
      "correct": false
    },
    {
      "text": "Mudar o vetor interno manualmente",
      "correct": false
    },
    {
      "text": "Verificar apenas o nome do método",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito. Consultar repetidamente sem alterar o estado verifica que a operação apenas observa o topo.",
  "incorrectFeedback": "O ponto central é confirmar que consultar não modifica a pilha."
}
```

### Questão 8

```quiz
{
  "question": "Uma função retorna um código de erro ao tentar remover de uma fila vazia. Isso é aceitável?",
  "options": [
    {
      "text": "Não, toda operação inválida deve encerrar o computador",
      "correct": false
    },
    {
      "text": "Sim, se esse comportamento estiver definido no contrato",
      "correct": true
    },
    {
      "text": "Não, porque TADs não podem tratar erros",
      "correct": false
    },
    {
      "text": "Sim, mesmo que a interface não documente esse comportamento",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Há diferentes estratégias para situações inválidas; o essencial é documentar e cumprir a escolhida.",
  "incorrectFeedback": "O contrato pode definir retorno de erro, exceção ou outra política. A consistência é fundamental."
}
```

### Questão 9

```quiz
{
  "question": "Qual alternativa apresenta uma boa ordem de projeto?",
  "options": [
    {
      "text": "Implementar ponteiros, depois descobrir o problema",
      "correct": false
    },
    {
      "text": "Definir comportamento e operações, especificar o contrato e escolher uma implementação",
      "correct": true
    },
    {
      "text": "Escolher uma linguagem e ignorar os requisitos",
      "correct": false
    },
    {
      "text": "Escrever testes apenas depois de publicar",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. O projeto parte do problema e da especificação para então escolher a representação e os algoritmos.",
  "incorrectFeedback": "A ordem mais segura é compreender o que o tipo deve fazer antes de decidir como será construído."
}
```

### Questão 10

```quiz
{
  "question": "Dois módulos utilizam a mesma interface de TAD. Uma implementação interna é substituída e os testes de contrato continuam passando. O que isso indica?",
  "options": [
    {
      "text": "A interface foi necessariamente alterada",
      "correct": false
    },
    {
      "text": "A substituição preservou o comportamento esperado",
      "correct": true
    },
    {
      "text": "O TAD deixou de existir",
      "correct": false
    },
    {
      "text": "Os testes não têm utilidade",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Testes de contrato ajudam a verificar se uma implementação substituta continua respeitando o comportamento definido.",
  "incorrectFeedback": "Se os comportamentos prometidos continuam válidos, a troca interna pode ser transparente para os clientes."
}
```