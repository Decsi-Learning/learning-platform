# Projeto e Comparação de Implementações de TADs

## 1. Um TAD, diferentes implementações

Um mesmo TAD pode ser implementado de diferentes maneiras. A escolha deve considerar as operações mais frequentes, os limites de memória, o volume de dados e os requisitos do problema.

Por exemplo, uma pilha pode usar:

- **Vetor:** os elementos ficam em posições contíguas; uma variável pode indicar o topo.
- **Lista encadeada:** cada nó armazena um elemento e uma ligação para o próximo nó; o topo pode apontar para o primeiro nó.

As duas alternativas podem respeitar o mesmo contrato de pilha.

## 2. Comparação qualitativa: pilha

| Aspecto | Vetor | Lista encadeada |
|---|---|---|
| Armazenamento | posições contíguas | nós ligados |
| Capacidade | pode ser fixa ou redimensionável | cresce conforme a memória disponível |
| `topo` | acesso direto pelo índice | acesso direto ao nó do topo, se mantido um ponteiro |
| `empilhar` | geralmente O(1) amortizado em vetor dinâmico; pode haver redimensionamento | O(1), inserindo no início |
| `desempilhar` | O(1) | O(1), removendo do início |
| Memória extra | baixa por elemento | ponteiro(s) por nó |

Os custos dependem dos detalhes da implementação. A tabela apresenta implementações comuns, não uma regra obrigatória para toda solução.

## 3. Comparação qualitativa: fila

Uma fila com vetor circular mantém índices para o início e para a próxima posição de inserção. O avanço dos índices é feito de forma circular, evitando deslocar todos os elementos a cada remoção.

Uma fila com lista encadeada pode manter referências para o primeiro e o último nó. Assim, inserir no final e remover do início podem ser realizadas em tempo constante.

## 4. Complexidade não muda a definição do TAD

A complexidade ajuda a comparar implementações, mas não define sozinha o TAD. Duas implementações podem ter custos diferentes e ainda oferecer exatamente o mesmo comportamento público.

Por exemplo, duas implementações de conjunto podem permitir `inserir`, `remover` e `pertence`, mas apresentar tempos diferentes dependendo de como os elementos são organizados.

## 5. Critérios para escolher

Antes de escolher, responda:

1. Quais operações serão mais frequentes?
2. O acesso por posição é importante?
3. A quantidade de elementos é conhecida ou varia bastante?
4. Há limite rígido de memória?
5. A simplicidade ou a eficiência de determinada operação é prioritária?

A melhor escolha depende do cenário. Evite afirmar que vetor ou lista encadeada é sempre superior.

## 6. Exemplo de decisão

Considere um sistema de atendimento que insere pessoas no final e remove sempre do início. Uma fila com vetor circular ou uma lista encadeada com ponteiros para início e fim pode atender ao contrato. A decisão pode depender de capacidade máxima conhecida, política de alocação e requisitos de desempenho.

## 7. Resumo

O TAD define o contrato. A implementação escolhe estruturas e algoritmos para cumprir esse contrato. A análise de complexidade permite comparar essas escolhas de maneira fundamentada.


## Exercícios interativos

### Questão 1

```quiz
{
  "question": "Duas implementações de pilha oferecem as mesmas operações e regras, mas possuem custos de memória diferentes. Isso significa que:",
  "options": [
    {
      "text": "Elas não podem implementar o mesmo TAD",
      "correct": false
    },
    {
      "text": "O TAD define o comportamento, não exige custos internos idênticos",
      "correct": true
    },
    {
      "text": "Uma delas obrigatoriamente está incorreta",
      "correct": false
    },
    {
      "text": "A pilha deixou de seguir LIFO",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. O mesmo contrato pode ser implementado com custos e representações diferentes.",
  "incorrectFeedback": "A equivalência do TAD depende do comportamento especificado, não de as implementações terem os mesmos custos."
}
```

### Questão 2

```quiz
{
  "question": "Uma pilha implementada por vetor dinâmico precisa aumentar sua capacidade quando fica cheia. O que pode ocorrer nesse momento?",
  "options": [
    {
      "text": "Uma operação de redimensionamento com custo maior que o usual",
      "correct": true
    },
    {
      "text": "A pilha passa a seguir FIFO",
      "correct": false
    },
    {
      "text": "O TAD muda automaticamente para fila",
      "correct": false
    },
    {
      "text": "O topo deixa de existir",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. Redimensionar pode exigir alocar outro vetor e copiar elementos, embora o custo de empilhar seja O(1) amortizado em implementações dinâmicas comuns.",
  "incorrectFeedback": "O crescimento do vetor pode exigir copiar elementos para uma área maior."
}
```

### Questão 3

```quiz
{
  "question": "Uma lista encadeada usada como pilha insere e remove elementos pelo início. Qual é o custo típico dessas operações?",
  "options": [
    {
      "text": "O(1) para ambas, mantendo o ponteiro do início",
      "correct": true
    },
    {
      "text": "O(n) para ambas obrigatoriamente",
      "correct": false
    },
    {
      "text": "O(log n) para ambas",
      "correct": false
    },
    {
      "text": "O(n²) para ambas",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. Com acesso direto ao primeiro nó, inserir e remover no início exigem quantidade constante de operações.",
  "incorrectFeedback": "A chave é que o ponteiro para o início já está disponível; não é necessário percorrer a lista."
}
```

### Questão 4

```quiz
{
  "question": "Uma fila implementada com vetor circular evita deslocar todos os elementos quando remove o primeiro. Qual é a ideia principal?",
  "options": [
    {
      "text": "Reordenar os elementos alfabeticamente",
      "correct": false
    },
    {
      "text": "Atualizar índices de forma circular",
      "correct": true
    },
    {
      "text": "Converter o vetor em árvore",
      "correct": false
    },
    {
      "text": "Duplicar todos os elementos",
      "correct": false
    }
  ],
  "correctFeedback": "Perfeito. O índice avança e, ao chegar ao fim do vetor, retorna ao início respeitando a capacidade.",
  "incorrectFeedback": "O vetor é tratado como um círculo lógico por meio de índices que dão a volta."
}
```

### Questão 5

```quiz
{
  "question": "Uma fila encadeada mantém ponteiros para o primeiro e o último nó. Qual vantagem isso oferece?",
  "options": [
    {
      "text": "Permite inserir no final sem percorrer toda a lista",
      "correct": true
    },
    {
      "text": "Garante ordenação crescente",
      "correct": false
    },
    {
      "text": "Elimina a necessidade de memória",
      "correct": false
    },
    {
      "text": "Faz a fila remover pelo final",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. O ponteiro para o último nó permite acessar diretamente o local de inserção.",
  "incorrectFeedback": "Sem o ponteiro final, seria necessário percorrer os nós para encontrar o último."
}
```

### Questão 6

```quiz
{
  "question": "Uma aplicação consulta elementos por índice com muita frequência. Qual implementação tende a oferecer acesso direto por posição?",
  "options": [
    {
      "text": "Vetor",
      "correct": true
    },
    {
      "text": "Lista simplesmente encadeada",
      "correct": false
    },
    {
      "text": "Pilha ligada sem índice",
      "correct": false
    },
    {
      "text": "Fila ligada sem índice",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. O vetor permite calcular diretamente a posição de memória associada ao índice.",
  "incorrectFeedback": "Em uma lista encadeada, normalmente é preciso percorrer os nós até alcançar a posição desejada."
}
```

### Questão 7

```quiz
{
  "question": "Uma equipe afirma: 'A implementação com menor complexidade para uma operação é sempre a melhor'. Qual avaliação é mais adequada?",
  "options": [
    {
      "text": "Verdadeiro em qualquer contexto",
      "correct": false
    },
    {
      "text": "Falso: também é preciso considerar outras operações, memória e requisitos",
      "correct": true
    },
    {
      "text": "Verdadeiro apenas para pilhas",
      "correct": false
    },
    {
      "text": "Falso porque complexidade nunca importa",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. A decisão deve considerar o conjunto de requisitos, não uma única operação isolada.",
  "incorrectFeedback": "Uma otimização local pode aumentar o custo de outras operações ou o consumo de memória."
}
```

### Questão 8

```quiz
{
  "question": "Duas tabelas hash e árvores podem implementar um TAD conjunto. O que a análise de complexidade ajuda a avaliar?",
  "options": [
    {
      "text": "Se o conjunto pode ter elementos",
      "correct": false
    },
    {
      "text": "Os custos esperados ou garantidos das operações em cada implementação",
      "correct": true
    },
    {
      "text": "Se o conjunto deve permitir duplicatas",
      "correct": false
    },
    {
      "text": "O significado da palavra abstração",
      "correct": false
    }
  ],
  "correctFeedback": "Isso mesmo. A análise permite comparar operações como inserir, remover e verificar pertinência.",
  "incorrectFeedback": "A complexidade compara o custo das operações; a semântica de conjunto vem da especificação."
}
```

### Questão 9

```quiz
{
  "question": "Uma fila precisa atender milhões de inserções e remoções, sempre nas extremidades. Qual informação é mais útil antes de escolher uma implementação?",
  "options": [
    {
      "text": "A cor dos elementos",
      "correct": false
    },
    {
      "text": "O custo de enfileirar e desenfileirar e o comportamento de memória",
      "correct": true
    },
    {
      "text": "O nome do arquivo fonte",
      "correct": false
    },
    {
      "text": "A quantidade de comentários no código",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. As operações dominantes e os custos associados orientam a escolha.",
  "incorrectFeedback": "A decisão deve partir do padrão real de uso e dos requisitos de desempenho."
}
```

### Questão 10

```quiz
{
  "question": "Uma implementação é substituída e os testes mostram que todas as operações continuam respeitando o contrato. Qual conclusão é apropriada?",
  "options": [
    {
      "text": "A implementação antiga e a nova são necessariamente idênticas",
      "correct": false
    },
    {
      "text": "A nova implementação parece preservar o comportamento do TAD nos casos testados",
      "correct": true
    },
    {
      "text": "A complexidade das duas é igual",
      "correct": false
    },
    {
      "text": "Não é mais necessário testar",
      "correct": false
    }
  ],
  "correctFeedback": "Exatamente. Os testes dão evidência de conformidade com o contrato nos cenários verificados, mas não provam que os custos são iguais nem dispensam outros testes.",
  "incorrectFeedback": "Os testes sustentam a conformidade observada; não demonstram identidade interna nem igualdade de desempenho."
}
```