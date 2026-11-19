# TADs na Prática: Pilha, Fila, Lista e Conjunto

Este material aplica a ideia de TAD a tipos comuns em AEDS I. Em cada caso, observe primeiro o comportamento e as operações; depois pense em possíveis implementações.

## 1. TAD Pilha

A pilha segue a política **LIFO** (*Last In, First Out*): o último elemento inserido é o primeiro removido.

Operações comuns:

- `empilhar(x)`: insere `x` no topo;
- `desempilhar()`: remove e retorna o topo;
- `topo()`: consulta o topo sem remover;
- `estaVazia()`: verifica se não há elementos.

Exemplo: empilhar A, depois B, depois C. A próxima remoção retorna C.

Possíveis implementações: vetor ou lista encadeada.

## 2. TAD Fila

A fila segue a política **FIFO** (*First In, First Out*): o primeiro elemento inserido é o primeiro removido.

Operações comuns:

- `enfileirar(x)`: insere no final;
- `desenfileirar()`: remove e retorna o primeiro;
- `primeiro()`: consulta o elemento da frente;
- `estaVazia()`: verifica se está vazia.

Exemplo: enfileirar A, B e C. A próxima remoção retorna A.

Possíveis implementações: vetor circular ou lista encadeada.

## 3. TAD Lista

Uma lista representa uma sequência de elementos. Dependendo do contrato definido, pode permitir inserção e remoção em posições específicas, consulta por posição e busca de valores.

Operações possíveis:

- `inserir(posicao, x)`;
- `remover(posicao)`;
- `consultar(posicao)`;
- `tamanho()`;
- `estaVazia()`.

O contrato precisa esclarecer, por exemplo, se as posições começam em zero ou um e o que acontece quando uma posição inválida é informada.

Possíveis implementações: vetor ou lista encadeada (simples ou dupla).

## 4. TAD Conjunto

Um conjunto representa uma coleção sem elementos repetidos. Operações comuns:

- `inserir(x)`;
- `remover(x)`;
- `pertence(x)`;
- `uniao(A, B)`;
- `intersecao(A, B)`.

Se o conjunto já contém o elemento `x`, uma nova inserção não deve criar uma segunda ocorrência, conforme a semântica usual desse TAD.

Possíveis implementações: vetor, lista, árvore de busca ou tabela hash, dependendo dos requisitos.

## 5. Comparando os TADs

| TAD | Regra ou característica central | Operação característica |
|---|---|---|
| Pilha | LIFO | `empilhar` / `desempilhar` |
| Fila | FIFO | `enfileirar` / `desenfileirar` |
| Lista | Sequência com posições | inserir/remover em posição |
| Conjunto | Sem repetição | `pertence` |

## 6. Escolhendo uma implementação

A escolha depende de requisitos como:

- quantidade de elementos esperada;
- frequência de inserções, remoções e consultas;
- necessidade de acesso por posição;
- uso de memória;
- simplicidade de implementação.

Não existe uma implementação universalmente melhor. A escolha deve considerar as operações mais importantes para o problema.

## 7. Situações do cotidiano

- Histórico de chamadas de função pode ser compreendido como uma pilha de execução.
- Atendimento por ordem de chegada pode ser modelado como fila.
- Uma sequência de tarefas editável pode ser representada por uma lista.
- Um catálogo de etiquetas únicas pode ser modelado como conjunto.

Essas analogias ajudam a reconhecer o comportamento, mas a implementação real depende dos requisitos do sistema.


## Exercícios interativos

### Questão 1

```quiz
{
  "question": "Uma pilha recebe os valores 4, 7 e 9, nessa ordem. Qual valor será removido primeiro?",
  "options": [
    {
      "text": "4",
      "correct": false
    },
    {
      "text": "7",
      "correct": false
    },
    {
      "text": "9",
      "correct": true
    },
    {
      "text": "Nenhum, pois pilhas não removem",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A pilha é LIFO: o último valor inserido, 9, está no topo e sai primeiro.",
  "incorrectFeedback": "Em uma pilha, a remoção acontece pelo topo. O último elemento inserido fica nessa posição."
}
```

### Questão 2

```quiz
{
  "question": "Uma fila recebe os elementos X, Y e Z, nessa ordem. Qual será o primeiro removido?",
  "options": [
    {
      "text": "X",
      "correct": true
    },
    {
      "text": "Y",
      "correct": false
    },
    {
      "text": "Z",
      "correct": false
    },
    {
      "text": "A ordem é aleatória",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A fila segue FIFO: o primeiro que entrou é o primeiro que sai.",
  "incorrectFeedback": "FIFO significa primeiro a entrar, primeiro a sair."
}
```

### Questão 3

```quiz
{
  "question": "Um sistema precisa consultar frequentemente o elemento na posição 20 de uma sequência. Qual característica deve ser considerada ao escolher a implementação de lista?",
  "options": [
    {
      "text": "A lista precisa obrigatoriamente ser uma pilha",
      "correct": false
    },
    {
      "text": "O custo de acesso por posição na implementação escolhida",
      "correct": true
    },
    {
      "text": "A regra FIFO",
      "correct": false
    },
    {
      "text": "A proibição de armazenar inteiros",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. O padrão de acesso influencia a escolha entre implementações, como vetor e lista encadeada.",
  "incorrectFeedback": "Acesso por posição pode ter custos diferentes conforme a representação interna."
}
```

### Questão 4

```quiz
{
  "question": "Um conjunto já contém o valor 12. O usuário solicita inserir 12 novamente. Qual comportamento é esperado na semântica usual de conjunto?",
  "options": [
    {
      "text": "Criar uma segunda ocorrência",
      "correct": false
    },
    {
      "text": "Ignorar a duplicata ou manter o conjunto sem repetição",
      "correct": true
    },
    {
      "text": "Remover todos os elementos",
      "correct": false
    },
    {
      "text": "Transformar o conjunto em fila",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito. A característica central do conjunto é não manter elementos repetidos.",
  "incorrectFeedback": "Pense na propriedade que diferencia um conjunto de uma sequência que permite duplicatas."
}
```

### Questão 5

```quiz
{
  "question": "Um atendimento deve respeitar a ordem de chegada. Qual TAD representa diretamente esse comportamento?",
  "options": [
    {
      "text": "Pilha",
      "correct": false
    },
    {
      "text": "Fila",
      "correct": true
    },
    {
      "text": "Conjunto",
      "correct": false
    },
    {
      "text": "Árvore AVL",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A fila modela naturalmente o atendimento FIFO.",
  "incorrectFeedback": "A primeira pessoa que chega deve ser a primeira atendida: essa é a regra FIFO."
}
```

### Questão 6

```quiz
{
  "question": "Uma operação `topo()` é executada em uma pilha. Qual deve ser seu efeito, segundo a especificação apresentada?",
  "options": [
    {
      "text": "Retornar o elemento do topo sem removê-lo",
      "correct": true
    },
    {
      "text": "Remover dois elementos",
      "correct": false
    },
    {
      "text": "Inserir um novo elemento",
      "correct": false
    },
    {
      "text": "Ordenar a pilha",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. Consultar o topo observa o elemento, mas não altera a pilha.",
  "incorrectFeedback": "Diferencie consultar de desempilhar: somente a segunda operação remove o elemento."
}
```

### Questão 7

```quiz
{
  "question": "Uma sequência precisa permitir inserir um elemento em uma posição escolhida pelo usuário. Qual TAD é o candidato mais direto?",
  "options": [
    {
      "text": "Lista",
      "correct": true
    },
    {
      "text": "Pilha",
      "correct": false
    },
    {
      "text": "Fila",
      "correct": false
    },
    {
      "text": "Conjunto sem ordem",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A lista oferece operações que podem manipular elementos em posições da sequência.",
  "incorrectFeedback": "A necessidade de trabalhar com posições específicas aponta para o comportamento de lista."
}
```

### Questão 8

```quiz
{
  "question": "Uma aplicação precisa verificar rapidamente se um identificador já está presente em uma coleção sem duplicatas. Qual TAD expressa melhor essa necessidade?",
  "options": [
    {
      "text": "Fila",
      "correct": false
    },
    {
      "text": "Pilha",
      "correct": false
    },
    {
      "text": "Conjunto",
      "correct": true
    },
    {
      "text": "Fila circular",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A operação de pertinência (`pertence`) é característica de conjuntos.",
  "incorrectFeedback": "A coleção precisa representar valores únicos e oferecer uma operação para verificar pertencimento."
}
```

### Questão 9

```quiz
{
  "question": "Uma equipe escolhe vetor circular para implementar uma fila. O que mudou?",
  "options": [
    {
      "text": "A regra FIFO do TAD",
      "correct": false
    },
    {
      "text": "A especificação pública da fila necessariamente",
      "correct": false
    },
    {
      "text": "A implementação interna da fila",
      "correct": true
    },
    {
      "text": "A fila deixou de ser um TAD",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Vetor circular é uma decisão de implementação; o comportamento FIFO permanece.",
  "incorrectFeedback": "A representação muda, mas a fila continua oferecendo o comportamento definido pelo TAD."
}
```

### Questão 10

```quiz
{
  "question": "Um programa precisa desfazer a última ação realizada antes das anteriores. Qual TAD é uma boa abstração para esse comportamento?",
  "options": [
    {
      "text": "Fila, porque atende em ordem de chegada",
      "correct": false
    },
    {
      "text": "Pilha, porque a última ação registrada deve ser recuperada primeiro",
      "correct": true
    },
    {
      "text": "Conjunto, porque elimina duplicatas",
      "correct": false
    },
    {
      "text": "Lista ordenada, obrigatoriamente",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. O desfazer costuma seguir LIFO: a última ação é a primeira a ser desfeita.",
  "incorrectFeedback": "A operação mais recente precisa ser tratada antes das mais antigas, como em uma pilha."
}
```