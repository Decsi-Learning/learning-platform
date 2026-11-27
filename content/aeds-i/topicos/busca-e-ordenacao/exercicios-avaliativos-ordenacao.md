## Exercícios avaliativos — Compressão de dados

Esta atividade reúne os conteúdos de compressão sem perdas: fundamentos, Run-Length Encoding (RLE), código de Huffman e LZW. Responda às questões e confira o feedback para revisar os pontos que ainda geram dúvida.

## Parte 1 — Fundamentos, propriedades e métodos elementares

### Questão 1 — Estabilidade e trocas distantes

```quiz
{
  "question": "Por que o Selection Sort padrão não é considerado um algoritmo de ordenação estável?",
  "options": [
    { "text": "Porque ele exige um vetor auxiliar O(n) para armazenar o menor elemento de cada rodada.", "correct": false },
    { "text": "Porque a troca de V[i] com V[min] pode mover um elemento para longe e ultrapassar elementos de mesma chave, alterando sua ordem relativa original.", "correct": true },
    { "text": "Porque ele só funciona corretamente quando todos os elementos do vetor são distintos.", "correct": false },
    { "text": "Porque ele realiza comparações apenas entre elementos vizinhos.", "correct": false }
  ],
  "correctFeedback": "Correto! Ao trocar V[i] com V[min] em um vetor como [3a, 3b, 2], o 3a vai para depois de 3b, quebrando a estabilidade.",
  "incorrectFeedback": "Analise o que acontece com elementos iguais quando ocorre uma troca entre posições não adjacentes no Selection Sort."
}
```

### Questão 2 — Bubble Sort e critério de parada

```quiz
{
  "question": "Na execução do Bubble Sort otimizado sobre [2, 4, 1, 3, 5], em qual passada o algoritmo encerra e quantos elementos já estão garantidamente na parte final ordenada após a 1ª passada?",
  "options": [
    { "text": "Encerra na 5ª passada; 0 elementos ficam no lugar após a 1ª passada.", "correct": false },
    { "text": "Encerra na 3ª passada (sem trocas); após a 1ª passada, o maior elemento (5) já ocupa sua posição definitiva no fim.", "correct": true },
    { "text": "Encerra na 1ª passada; todos os 5 elementos já estão fixados.", "correct": false },
    { "text": "Encerra na 4ª passada; os 2 menores elementos ficam no fim após a 1ª passada.", "correct": false }
  ],
  "correctFeedback": "Correto! Após a 1ª passada o 5 está no fim; na 2ª passada o 4 vai para a posição 3; na 3ª passada não há trocas (trocou == false) e o algoritmo para.",
  "incorrectFeedback": "Lembre-se de que cada passada do Bubble Sort leva o maior elemento restante até o fim e que, se uma passada não faz trocas, o vetor já está ordenado."
}
```

### Questão 3 — Selection Sort e número de comparações

```quiz
{
  "question": "Qual é o número de comparações realizadas pelo Selection Sort em um vetor de tamanho n que já se encontra completamente ordenado?",
  "options": [
    { "text": "n - 1 comparações, pois o algoritmo percebe que não há trocas.", "correct": false },
    { "text": "0 comparações, pois nenhum elemento precisa mudar de lugar.", "correct": false },
    { "text": "n(n - 1) / 2 comparações, pois o Selection Sort não é adaptativo.", "correct": true },
    { "text": "n log n comparações, pois a busca do mínimo usa divisão ao meio.", "correct": false }
  ],
  "correctFeedback": "Correto! O laço interno percorre todo o restante do vetor em todas as iterações, fazendo sempre n(n - 1)/2 comparações, independentemente da entrada.",
  "incorrectFeedback": "Lembre-se da diferença entre trocas e comparações no Selection Sort: o número de trocas é 0, mas o laço interno continua rodando."
}
```
### Questão 4 — Insertion Sort e deslocamentos
```quiz
{
  "question": "Por que o Insertion Sort costuma realizar menos atribuições de dados que o Bubble Sort ao inserir um elemento fora de ordem?",
  "options": [
    { "text": "Porque ele guarda a chave uma vez, desloca elementos maiores com uma atribuição cada e escreve a chave na posição final, em vez de fazer três atribuições por troca.", "correct": true },
    { "text": "Porque ele ignora elementos que sejam menores que a chave.", "correct": false },
    { "text": "Porque ele ordena apenas a metade direita do vetor.", "correct": false },
    { "text": "Porque ele aloca um vetor auxiliar do mesmo tamanho e copia tudo de uma vez.", "correct": false }
  ],
  "correctFeedback": "Exato! Deslocar k elementos custa k + 2 atribuições (guardar chave, k deslocamentos e inserir chave), em vez das 3k atribuições de k trocas.",
  "incorrectFeedback": "Compare o custo de uma troca completa (3 atribuições com variável temporária) com o deslocamento de um elemento para a direita."
}
```
## Parte 2 — Saltos e divisão e conquista

### Questão 5 — Shellsort e sequência de incrementos

```quiz
{
  "question": "Por que todo Shellsort válido deve terminar com o incremento h = 1?",
  "options": [
    { "text": "Porque com h = 1 ele passa a usar um vetor auxiliar O(n) para corrigir empates.", "correct": false },
    { "text": "Porque as etapas com h > 1 ordenam apenas subvetores espaçados; somente a passada com h = 1 faz a inserção final entre vizinhos adjacentes para garantir a ordenação global.", "correct": true },
    { "text": "Porque a sequência de Knuth começa em 1 e não pode ser decrementada.", "correct": false },
    { "text": "Porque h = 1 transforma o Shellsort em um algoritmo estável.", "correct": false }
  ],
  "correctFeedback": "Correto! Com h > 1, o vetor fica h-ordenado (subgrupos intercalados em ordem), mas ainda pode haver pares adjacentes fora de ordem até a passada final com h = 1.",
  "incorrectFeedback": "Pense no que significa o vetor estar h-ordenado quando h > 1: os elementos vizinhos imediatos já foram comparados entre si?"
}
```

### Questão 6 — Quicksort e particionamento

```quiz
{
  "question": "Ao final da etapa de particionamento do Quicksort, o que se pode afirmar sobre o elemento escolhido como pivô?",
  "options": [
    { "text": "Ele será obrigatoriamente o menor elemento de todo o vetor.", "correct": false },
    { "text": "Ele já ocupa sua posição definitiva no vetor ordenado, com elementos <= pivô à esquerda e elementos > pivô à direita.", "correct": true },
    { "text": "Ele é descartado e não entra nas chamadas recursivas seguintes.", "correct": false },
    { "text": "Ele sempre termina na última posição do intervalo [inicio..fim].", "correct": false }
  ],
  "correctFeedback": "Correto! Como todos os elementos à esquerda são menores ou iguais e os à direita são maiores, o pivô já está no seu lugar final e não precisa mais ser movido.",
  "incorrectFeedback": "Observe a organização das duas regiões criadas ao redor do pivô após o particionamento."
}
```

### Questão 7 — Quicksort: pior caso e mediana de três

```quiz
{
  "question": "Em um Quicksort simples que sempre escolhe o último elemento (V[fim]) como pivô, qual entrada provoca o pior caso O(n²) e como a 'Mediana de Três' ajuda a evitá-lo?",
  "options": [
    { "text": "Ocorre em vetores aleatórios; a Mediana de Três ordena o vetor inteiro antes de particionar.", "correct": false },
    { "text": "Ocorre em vetores já ordenados (crescentes ou decrescentes); a Mediana de Três escolhe a mediana entre início, meio e fim, reduzindo a chance de pivôs extremos.", "correct": true },
    { "text": "Ocorre quando há números negativos; a Mediana de Três troca o sinal do pivô.", "correct": false },
    { "text": "Ocorre apenas em vetores de tamanho par; a Mediana de Três ignora o último elemento.", "correct": false }
  ],
  "correctFeedback": "Correto! Escolher sempre V[fim] em um vetor já ordenado gera partições muito desiguais (n - 1 e 0); usar a mediana entre início, meio e fim favorece partições mais equilibradas.",
  "incorrectFeedback": "Veja o que acontece ao escolher o último elemento de um vetor já ordenado e como comparar início, meio e fim altera a escolha do pivô."
}
```

## Parte 3 — Garantias assintóticas, memória e estabilidade

### Questão 8 — Mergesort e intercalação

```quiz
{
  "question": "No Mergesort, qual condição na etapa de intercalação garante que o algoritmo seja estável e qual é seu custo de memória auxiliar?",
  "options": [
    { "text": "Usar esq[i] <= dir[j] para dar prioridade à esquerda em empates; exige memória auxiliar O(n) para os vetores temporários da intercalação.", "correct": true },
    { "text": "Usar esq[i] < dir[j] sem prioridade; exige memória auxiliar O(1) estritamente in-place.", "correct": false },
    { "text": "Comparar apenas o último elemento de cada metade; exige memória auxiliar O(n²).", "correct": false },
    { "text": "Inverter a metade direita antes de mesclar; exige memória auxiliar O(1).", "correct": false }
  ],
  "correctFeedback": "Correto! Priorizar a metade esquerda em empates (<=) preserva a ordem original, e a intercalação em vetores utiliza espaço extra O(n) além da pilha recursiva.",
  "incorrectFeedback": "Lembre-se de qual metade contém os elementos que vinham antes na entrada e de quanto espaço extra a função intercalar aloca."
}
```

### Questão 9 — Heapsort e Max-Heap

```quiz
{
  "question": "Na Fase 2 do Heapsort, após trocar a raiz V[0] com V[fim], por que chamamos sift_down(V, fim, 0)?",
  "options": [
    { "text": "Para ordenar também a região já extraída em V[fim..n-1].", "correct": false },
    { "text": "Para restaurar a propriedade de Max-Heap na porção ativa [0..fim-1] após colocar o elemento do final na raiz.", "correct": true },
    { "text": "Para transformar o Max-Heap em um vetor ordenado de forma estável.", "correct": false },
    { "text": "Para aumentar o tamanho lógico do heap em 1 posição.", "correct": false }
  ],
  "correctFeedback": "Correto! O elemento trazido de V[fim] para V[0] pode violar a propriedade de Max-Heap, e sift_down o faz descer até a posição correta dentro do heap reduzido de tamanho fim.",
  "incorrectFeedback": "Considere o efeito de colocar um elemento qualquer na raiz V[0] e reduzir o tamanho ativo do heap para fim."
}
```

### Questão 10 — Escolha de algoritmo por restrição

```quiz
{
  "question": "Você precisa ordenar um vetor grande em um ambiente com memória RAM muito restrita (exigindo execução in-place O(1)) e não pode aceitar o risco de degradação para O(n²) no pior caso. Qual algoritmo é o mais indicado entre os estudados?",
  "options": [
    { "text": "Mergesort, pois é estável e nunca degrada para O(n²).", "correct": false },
    { "text": "Heapsort, pois garante tempo O(n log n) no pior caso operando in-place com espaço auxiliar O(1).", "correct": true },
    { "text": "Bubble Sort, pois usa O(1) de espaço extra e é estável.", "correct": false },
    { "text": "Selection Sort, pois faz no máximo n - 1 trocas com espaço O(1).", "correct": false }
  ],
  "correctFeedback": "Correto! O Mergesort exige O(n) de memória auxiliar, e Bubble Sort e Selection Sort têm custo quadrático O(n²); o Heapsort combina pior caso O(n log n) com espaço extra O(1).",
  "incorrectFeedback": "Cruze os dois requisitos do enunciado: memória auxiliar O(1) e garantia de O(n log n) mesmo no pior caso."
}
```