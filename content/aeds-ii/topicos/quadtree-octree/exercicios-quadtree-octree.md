# Lista de Exercícios - QuadTree e Octree

Resolva a lista de exercícios para avançar para a próxima etapa.

Quando a questão citar o exemplo da aula, considere a QuadTree do plano de 8 por 8 (x e y de 0 a 7, com y para cima), em que cada folha guarda no máximo um ponto, com A = (2, 1), B = (6, 6), C = (1, 6), D = (3, 7) e E = (5, 1). O meio do plano é 4: um ponto está a leste se x ≥ 4 e ao norte se y ≥ 4.

## Questões interativas

Insira o ponto F na QuadTree do exemplo e depois faça uma consulta de região. Você vai escolher o quadrante, clicar na folha onde F cai, decidir o que acontece com a folha cheia e marcar os nós descartados e os pontos encontrados. Se errar, a mensagem explica o que falta; depois da primeira tentativa, o botão **Ver resposta** aparece.

```pratica
{
  "tipo": "quadtree",
  "title": "Pratique: inserção e consulta na QuadTree",
  "lado": 8,
  "pontos": [
    { "nome": "A", "x": 2, "y": 1 },
    { "nome": "B", "x": 6, "y": 6 },
    { "nome": "C", "x": 1, "y": 6 },
    { "nome": "D", "x": 3, "y": 7 },
    { "nome": "E", "x": 5, "y": 1 }
  ],
  "novo": { "nome": "F", "x": 3, "y": 2 },
  "consulta": { "x0": 2, "y0": 0, "x1": 5, "y1": 2 }
}
```

## Questões de múltipla escolha

```quiz
{
  "question": "Que problema a QuadTree resolve melhor do que uma lista de pontos?",
  "options": [
    { "text": "Ordenar os pontos pela coordenada x", "correct": false },
    { "text": "Encontrar os pontos de uma região sem olhar todos os pontos, descartando regiões inteiras que não encostam nela", "correct": true },
    { "text": "Guardar os pontos usando menos memória que uma lista", "correct": false },
    { "text": "Calcular a distância entre dois pontos", "correct": false }
  ],
  "correctFeedback": "Correto! Numa lista, toda consulta de região olha os n pontos. A QuadTree descarta de uma vez os quadrantes que não encostam na área procurada.",
  "incorrectFeedback": "Releia a introdução: qual pergunta sobre os pontos é cara numa lista?"
}
```

```quiz
{
  "question": "Quantos filhos tem um nó dividido de uma QuadTree e de uma Octree, respectivamente?",
  "options": [
    { "text": "2 e 3", "correct": false },
    { "text": "4 e 8", "correct": true },
    { "text": "4 e 6", "correct": false },
    { "text": "8 e 16", "correct": false }
  ],
  "correctFeedback": "Correto! Cortar ao meio em x e y dá 2 × 2 = 4 quadrantes; cortar também em z dá 2 × 2 × 2 = 8 octantes.",
  "incorrectFeedback": "Conte quantas partes surgem ao cortar ao meio em cada eixo: dois eixos no plano, três no espaço."
}
```

```quiz
{
  "question": "Num nó que cobre o plano inteiro de 8 por 8, em que quadrante fica o ponto (5, 2)?",
  "options": [
    { "text": "NO", "correct": false },
    { "text": "NE", "correct": false },
    { "text": "SO", "correct": false },
    { "text": "SE", "correct": true }
  ],
  "correctFeedback": "Correto! x = 5 ≥ 4 fica a leste, e y = 2 < 4 fica ao sul: sudeste.",
  "incorrectFeedback": "Compare cada coordenada com o meio, 4: x ≥ 4 é leste, y ≥ 4 é norte."
}
```

```quiz
{
  "question": "Na QuadTree desta aula, o que acontece quando um ponto novo cai numa folha que já guarda um ponto?",
  "options": [
    { "text": "O ponto novo substitui o antigo", "correct": false },
    { "text": "A folha é dividida em quatro quadrantes, e os dois pontos são inseridos de novo a partir dela", "correct": true },
    { "text": "O ponto novo é descartado", "correct": false },
    { "text": "A árvore inteira é reconstruída", "correct": false }
  ],
  "correctFeedback": "Correto! Cada folha guarda no máximo um ponto, então a folha cheia vira um nó dividido, e cada ponto desce para o seu quadrante.",
  "incorrectFeedback": "Reveja a animação da inserção: o que acontece quando chega o ponto B?"
}
```

```quiz
{
  "question": "No exemplo da aula, por que só o quadrante NO foi dividido de novo?",
  "options": [
    { "text": "Porque ele foi o primeiro quadrante a receber um ponto", "correct": false },
    { "text": "Porque ele tem dois pontos próximos, C e D, e cada folha guarda no máximo um ponto", "correct": true },
    { "text": "Porque a árvore sempre divide o quadrante NO primeiro", "correct": false }
  ],
  "correctFeedback": "Correto! A árvore só se aprofunda onde os pontos estão próximos; os quadrantes com um ponto continuam como uma folha só.",
  "incorrectFeedback": "Conte quantos pontos caem em cada quadrante da raiz."
}
```

```quiz
{
  "question": "Na QuadTree do exemplo, a busca por (3, 6) termina numa folha que guarda D = (3, 7). O que buscar devolve?",
  "options": [
    { "text": "1, porque a folha da região tem um ponto", "correct": false },
    { "text": "0, porque o ponto da folha tem outras coordenadas", "correct": true },
    { "text": "1, porque x é igual", "correct": false }
  ],
  "correctFeedback": "Correto! Chegar a uma folha com um ponto não basta: a busca compara as coordenadas no fim, e (3, 7) ≠ (3, 6).",
  "incorrectFeedback": "Releia a busca de um ponto: o que ela faz ao chegar na folha?"
}
```

```quiz
{
  "question": "A consulta procura os pontos com x de 0 a 3 e y de 5 a 7. O que ela faz com o quadrante SE da raiz, que cobre x de 4 a 7 e y de 0 a 3?",
  "options": [
    { "text": "Desce até as folhas para conferir cada ponto", "correct": false },
    { "text": "Descarta o quadrante inteiro, porque a região dele não encosta no retângulo", "correct": true },
    { "text": "Conta o ponto E, que está nesse quadrante", "correct": false }
  ],
  "correctFeedback": "Correto! A região do SE fica toda fora do retângulo, então nada abaixo dele pode entrar na resposta.",
  "incorrectFeedback": "Compare a região do nó com o retângulo: elas têm algum ponto em comum?"
}
```

```quiz
{
  "question": "Num plano de 8 por 8 com coordenadas inteiras e pontos diferentes, qual é a maior profundidade possível da QuadTree?",
  "options": [
    { "text": "8, uma por coordenada", "correct": false },
    { "text": "3, porque cada divisão corta o lado ao meio, de 8 até 1", "correct": true },
    { "text": "Não há limite: depende de quantos pontos existem", "correct": false }
  ],
  "correctFeedback": "Correto! O lado passa por 8, 4, 2 e 1, e uma região de lado 1 só tem um ponto possível. A profundidade fica limitada a log₂ 8 = 3.",
  "incorrectFeedback": "Releia a análise de complexidade: o que acontece com o lado da região a cada divisão?"
}
```

```quiz
{
  "question": "Quando a QuadTree fica desequilibrada, com um ramo muito mais fundo que os outros?",
  "options": [
    { "text": "Quando os pontos são inseridos em ordem crescente de x", "correct": false },
    { "text": "Quando muitos pontos estão amontoados numa região pequena", "correct": true },
    { "text": "Quando o plano tem lado ímpar", "correct": false }
  ],
  "correctFeedback": "Correto! A forma da árvore depende de onde os pontos estão, e não da ordem de inserção: pontos amontoados exigem várias divisões naquele canto.",
  "incorrectFeedback": "Lembre que os mesmos pontos, em qualquer ordem, geram a mesma QuadTree. O que faz uma região ser dividida muitas vezes?"
}
```

```quiz
{
  "question": "Um jogo 3D quer evitar comparar cada par de objetos para testar colisões, olhando primeiro só os objetos próximos. Que estrutura é a mais indicada?",
  "options": [
    { "text": "Uma QuadTree, porque os objetos estão num plano", "correct": false },
    { "text": "Uma Octree, que divide o espaço em cubos e descarta regiões inteiras longe do objeto", "correct": true },
    { "text": "Uma Segment Tree, que soma trechos de um vetor", "correct": false },
    { "text": "Uma lista, comparando todos os pares de objetos", "correct": false }
  ],
  "correctFeedback": "Correto! A Octree encontra os pares candidatos: os objetos que estão nos cubos que a área de cada objeto encosta. Um objeto pode cruzar o limite entre cubos, então ele é procurado em todos eles, e o teste final de colisão ainda compara as áreas ocupadas.",
  "incorrectFeedback": "O jogo é em três dimensões. Qual das estruturas divide o espaço em x, y e z?"
}
```
