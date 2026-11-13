Simulado: Estruturas de Dados - Pilha (Stack)

Chegou a hora de testar seus conhecimentos sobre Pilhas! Responda às questões abaixo para avaliar o seu entendimento sobre a regra LIFO, as operações básicas e as aplicações práticas dessa estrutura.

Boa sorte!

Questão 1: Regras de Organização
```quiz
{
  "question": "A estrutura de dados Pilha (Stack) é baseada em qual princípio de organização de elementos?",
  "options": [
    { "text": "FIFO (First In, First Out - O primeiro a entrar é o primeiro a sair).", "correct": false },
    { "text": "LIFO (Last In, First Out - O último a entrar é o primeiro a sair).", "correct": true },
    { "text": "Acesso Aleatório (Qualquer elemento pode ser acessado a qualquer momento).", "correct": false }
  ],
  "correctFeedback": "✅ Correto! A regra LIFO garante que sempre interagimos com o elemento que foi inserido mais recentemente (o topo da pilha).",
  "incorrectFeedback": "❌ Incorreto. Lembre-se da analogia da pilha de pratos na pia: por onde você começa a lavar?"
}
```

Questão 2: Operações Básicas
```quiz
{
  "question": "Qual é a operação utilizada para INSERIR um novo elemento no topo de uma pilha?",
  "options": [
    { "text": "Pop", "correct": false },
    { "text": "Peek", "correct": false },
    { "text": "Push", "correct": true }
  ],
  "correctFeedback": "✅ Exatamente! A operação 'Push' (empilhar) é responsável por adicionar um novo dado ao topo da estrutura.",
  "incorrectFeedback": "❌ Quase lá! Pense no termo em inglês para 'empurrar' ou inserir um elemento no topo."
}
```

Questão 3: Manipulação de Dados
```quiz
{
  "question": "Se uma pilha inicialmente vazia recebe as operações Push(10), Push(20), Push(30) e, em seguida, dois comandos Pop(). Qual será o valor no topo da pilha ao final?",
  "options": [
    { "text": "10", "correct": true },
    { "text": "20", "correct": false },
    { "text": "30", "correct": false }
  ],
  "correctFeedback": "✅ Perfeito! A pilha ficou com [10, 20, 30]. O primeiro Pop() removeu o 30. O segundo Pop() removeu o 20. Sobrou apenas o 10 no topo!",
  "incorrectFeedback": "❌ Pense passo a passo. Os elementos entram: 10, depois 20 por cima, depois 30 por cima. Se tirarmos os dois elementos de cima, quem sobra?"
}
```

Questão 4: Casos de Uso Prático
```quiz
{
  "question": "Em qual dos cenários abaixo a estrutura de dados Pilha seria a escolha mais adequada para a implementação?",
  "options": [
    { "text": "Um sistema de fila de impressão, onde o primeiro arquivo enviado deve ser impresso primeiro.", "correct": false },
    { "text": "Um recurso de 'Desfazer' (Ctrl+Z) em um editor de texto, onde a ação mais recente deve ser desfeita primeiro.", "correct": true },
    { "text": "Um sistema de GPS para calcular a rota mais curta entre duas cidades.", "correct": false }
  ],
  "correctFeedback": "✅ Muito bem! O recurso 'Desfazer' precisa voltar no tempo revertendo sempre a ação mais recente, o que se encaixa perfeitamente no conceito LIFO.",
  "incorrectFeedback": "❌ Analise a ordem de entrada e saída. A opção correta deve exigir que o ÚLTIMO dado inserido seja o PRIMEIRO a ser utilizado."
}
```

Questão 5: Limites da Estrutura
```quiz
{
  "question": "O que acontece se tentarmos executar a operação 'Pop()' em uma pilha que já está completamente vazia?",
  "options": [
    { "text": "Ocorre um erro conhecido como 'Stack Underflow' (Subfluxo de Pilha).", "correct": true },
    { "text": "Ocorre um erro conhecido como 'Stack Overflow' (Estouro de Pilha).", "correct": false },
    { "text": "O programa insere o valor 0 (zero) automaticamente para evitar travamentos.", "correct": false }
  ],
  "correctFeedback": "✅ Correto! 'Stack Underflow' acontece quando tentamos remover um elemento de uma pilha vazia. (Nota: 'Stack Overflow' seria tentar inserir numa pilha cheia).",
  "incorrectFeedback": "❌ Cuidado com os termos! Overflow significa 'transbordar' (quando está cheia). Como se chama quando tentamos tirar algo de onde não tem nada?"
}
```