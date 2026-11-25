Simulado: Estruturas de Dados - Listas

Chegou a hora de testar seus conhecimentos sobre Listas! Responda às questões abaixo para avaliar o seu entendimento sobre o TAD Lista, a implementação por vetor e as listas encadeadas (simples, dupla e circular).

Boa sorte!

Questão 1: O TAD Lista

```quiz
{
  "question": "O que o TAD Lista especifica?",
  "options": [
    { "text": "A linguagem de programação e o compilador que devem ser usados.", "correct": false },
    { "text": "As operações e o comportamento esperado da estrutura, sem definir como os dados são organizados na memória.", "correct": true },
    { "text": "A quantidade máxima de memória que a lista pode ocupar.", "correct": false }
  ],
  "correctFeedback": "✅ Correto! O TAD é o contrato: inserir, remover, buscar etc. As implementações por vetor ou por ponteiros cumprem esse contrato de formas diferentes.",
  "incorrectFeedback": "❌ Lembre-se da separação: o TAD diz o QUE a estrutura faz; a implementação diz COMO. Tente novamente."
}
```

Questão 2: Lista por vetor

```quiz
{
  "question": "Uma lista com 5 elementos [10, 20, 30, 40, 50] em um vetor recebe uma remoção na posição 1 (valor 20). Quantos elementos precisam ser deslocados?",
  "options": [
    { "text": "Nenhum, pois a remoção em vetor é sempre O(1).", "correct": false },
    { "text": "3 elementos: o 30, o 40 e o 50 movem-se uma posição para a esquerda.", "correct": true },
    { "text": "5 elementos: todo o vetor é sempre recopiado.", "correct": false }
  ],
  "correctFeedback": "✅ Perfeito! Apenas os elementos depois da posição removida se movem: 30, 40 e 50 descem uma casa, fechando o buraco do 20.",
  "incorrectFeedback": "❌ Desenhe o vetor: quem precisa se mover para o buraco da posição 1 desaparecer? Tente novamente."
}
```

Questão 3: Lista simplesmente encadeada

```quiz
{
  "question": "Ao inserir um nó 'novo' no início de uma lista simplesmente encadeada, qual é a sequência correta?",
  "options": [
    { "text": "head = novo; e depois novo->prox = head;", "correct": false },
    { "text": "novo->prox = head; e depois head = novo;", "correct": true },
    { "text": "Basta fazer head = novo; as demais referências se ajustam sozinhas.", "correct": false }
  ],
  "correctFeedback": "✅ Exato! Primeiro o novo nó aponta para o antigo primeiro; só então head passa a apontar para o novo nó. Inverter a ordem perde o endereço da lista original.",
  "incorrectFeedback": "❌ Se head mudar primeiro, quem guarda o endereço do antigo primeiro nó? Tente novamente."
}
```

Questão 4: Lista duplamente encadeada

```quiz
{
  "question": "Qual é a principal vantagem da lista duplamente encadeada sobre a simplesmente encadeada, e qual é o seu custo?",
  "options": [
    { "text": "Vantagem: acesso por índice em O(1). Custo: não permitir remoções.", "correct": false },
    { "text": "Vantagem: remover um nó conhecido em O(1) e percorrer nos dois sentidos. Custo: uma referência a mais por nó e operações com mais atribuições.", "correct": true },
    { "text": "Vantagem: usar menos memória por nó. Custo: busca mais lenta.", "correct": false }
  ],
  "correctFeedback": "✅ Muito bem! O campo ant elimina o percurso para achar o anterior, mas cada nó carrega uma referência extra e toda alteração mexe nos dois encadeamentos.",
  "incorrectFeedback": "❌ Pense no que o campo 'ant' oferece e no que cada nó precisa armazenar a mais. Tente novamente."
}
```

Questão 5: Lista circular

```quiz
{
  "question": "Um programador percorreu uma lista circular com o laço 'while (atual != NULL)'. O que aconteceu?",
  "options": [
    { "text": "O programa funcionou, pois toda lista termina em NULL.", "correct": false },
    { "text": "O laço nunca executou, pois atual começou valendo NULL.", "correct": false },
    { "text": "O programa entrou em loop infinito, pois na lista circular nenhum nó tem prox igual a NULL.", "correct": true }
  ],
  "correctFeedback": "✅ Correto! Sem NULL no encadeamento, a condição nunca fica falsa. O certo é parar ao voltar ao nó de partida, com um do...while.",
  "incorrectFeedback": "❌ Reveja o diagrama da lista circular: para onde aponta o prox do último nó? Tente novamente."
}
```
