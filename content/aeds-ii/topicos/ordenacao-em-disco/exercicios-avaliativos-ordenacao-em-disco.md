## Exercícios avaliativos — Ordenação em disco e reutilização de espaço

Marque uma alternativa em cada uma das 10 questões. Elas cobrem todas as páginas deste tópico. O botão para avançar só libera depois que todas forem respondidas.

## Questões de marcar

```quiz
{
  "question": "Intercale as runs A = [1, 4, 7, 10] e B = [2, 3, 8, 12, 15]. Qual é a saída?",
  "options": [
    { "text": "1, 2, 3, 4, 7, 8, 10, 15, 12", "correct": false },
    { "text": "1, 2, 3, 4, 7, 8, 10, 12, 15", "correct": true },
    { "text": "1, 4, 7, 10, 2, 3, 8, 12, 15", "correct": false }
  ],
  "correctFeedback": "✅ Correto! A cada passo sai o menor entre as cabeças das duas listas. Quando A acaba, copia-se o resto de B.",
  "incorrectFeedback": "❌ Ainda não. Compare sempre as cabeças das duas listas e leve o menor. A saída também precisa ficar em ordem crescente."
}
```

```quiz
{
  "question": "Na mesma intercalação, quantas comparações foram feitas?",
  "options": [
    { "text": "8, o máximo possível", "correct": false },
    { "text": "9", "correct": false },
    { "text": "7", "correct": true }
  ],
  "correctFeedback": "✅ Correto! A run A acabou depois de 7 comparações. O que sobrou de B (12 e 15) é copiado sem comparar.",
  "incorrectFeedback": "❌ Ainda não. O máximo seria 4 + 5 − 1 = 8, mas aqui a run A acabou antes: 7 comparações, e o resto de B é só copiado."
}
```

```quiz
{
  "question": "Um arquivo tem T = 2 000 000 de registros e a memória comporta n = 50 000 de cada vez. Quantos arquivos ordenados a fase 1 gera?",
  "options": [
    { "text": "40", "correct": true },
    { "text": "4", "correct": false },
    { "text": "400", "correct": false }
  ],
  "correctFeedback": "✅ Correto! k = 2 000 000 / 50 000 = 40 arquivos ordenados.",
  "incorrectFeedback": "❌ Ainda não. Divida o total de registros pelo que cabe na memória: 2 000 000 / 50 000 = 40."
}
```

```quiz
{
  "question": "Com k = 40 arquivos ordenados, quantas passadas de intercalação são necessárias com p = 2 vias e com p = 4 vias?",
  "options": [
    { "text": "20 passadas com p = 2 e 10 passadas com p = 4", "correct": false },
    { "text": "6 passadas com p = 2 e 3 passadas com p = 4", "correct": true },
    { "text": "5 passadas com p = 2 e 2 passadas com p = 4", "correct": false }
  ],
  "correctFeedback": "✅ Correto! ⌈log₂ 40⌉ = 6, pois 2⁵ = 32 < 40 ≤ 64 = 2⁶. E ⌈log₄ 40⌉ = 3, pois 4² = 16 < 40 ≤ 64 = 4³.",
  "incorrectFeedback": "❌ Ainda não. O número de passadas é ⌈logₚ k⌉. Para p = 2, 2⁵ = 32 ainda não chega a 40, então são 6. Para p = 4, 4² = 16 não chega, então são 3."
}
```

```quiz
{
  "question": "No esquema da aula, T = 20 000 registros e n = 1000 geram k = 20 arquivos ordenados. Quantos buffers existem na fase 2 e qual o tamanho de cada um?",
  "options": [
    { "text": "20 buffers de 50 registros", "correct": false },
    { "text": "21 buffers de 1000 registros", "correct": false },
    { "text": "21 buffers de 47 registros", "correct": true }
  ],
  "correctFeedback": "✅ Correto! São k + 1 = 21 buffers (20 de entrada e 1 de saída), cada um com ⌊1000 / 21⌋ = 47 registros.",
  "incorrectFeedback": "❌ Ainda não. Além dos 20 buffers de entrada existe 1 de saída, e a memória de 1000 registros é dividida entre os 21: ⌊1000 / 21⌋ = 47."
}
```

```quiz
{
  "question": "Por que não usar sempre o maior número de vias possível na intercalação?",
  "options": [
    { "text": "Com mais vias os buffers ficam menores e há mais seeks entre os arquivos, o que pode anular o ganho de ter menos passadas", "correct": true },
    { "text": "Porque o número de passadas aumenta quando aumenta o número de vias", "correct": false },
    { "text": "Porque o disco só consegue abrir dois arquivos ao mesmo tempo", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Com p vias há p + 1 buffers de tamanho n / (p + 1). Com a memória de n = 50 000 registros, p = 40 deixa cada buffer com apenas 1219 registros, contra 16 666 com p = 2.",
  "incorrectFeedback": "❌ Ainda não. Mais vias reduzem as passadas, e não as aumentam. O problema é que a memória é dividida entre mais buffers, que ficam pequenos."
}
```

```quiz
{
  "question": "A memória comporta 3 registros e a entrada é 29, 14, 38, 11, 24, 7, 33, 10, 45, 3, 18, 26. Quantas runs a seleção por substituição gera?",
  "options": [
    { "text": "4 runs, igual ao método de ordenar blocos", "correct": false },
    { "text": "3 runs, de tamanhos 3, 5 e 4 (ordenar blocos de 3 geraria 4 runs de tamanho 3)", "correct": true },
    { "text": "12 runs, uma para cada registro", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Run 1 = [14, 29, 38], run 2 = [7, 11, 24, 33, 45] e run 3 = [3, 10, 18, 26]. Menos runs significam menos trabalho na fase 2.",
  "incorrectFeedback": "❌ Ainda não. A seleção por substituição aproveita os valores que ainda cabem na run atual, gerando runs maiores que a memória: aqui, 3 runs."
}
```

```quiz
{
  "question": "Há 13 runs distribuídas em 3 arquivos: 8 no arquivo 1, 5 no arquivo 2 e 0 no arquivo 3. Quantas fases tem a intercalação polifásica?",
  "options": [
    { "text": "13 fases", "correct": false },
    { "text": "3 fases", "correct": false },
    { "text": "5 fases", "correct": true }
  ],
  "correctFeedback": "✅ Correto! (8, 5, 0) → (3, 0, 5) → (0, 3, 2) → (2, 1, 0) → (1, 0, 1) → (0, 1, 0). Como 8 e 5 são números de Fibonacci consecutivos, não foi preciso run fictícia.",
  "incorrectFeedback": "❌ Ainda não. A cada fase, o arquivo que esvazia vira a saída da próxima. Simulando (8, 5, 0) até sobrar uma única run, são 5 fases."
}
```

```quiz
{
  "question": "A lista de vagas, na ordem do arquivo, é 100, 40, 70 e 30 bytes. Chega um pedido de 35 bytes. Qual vaga cada estratégia usa?",
  "options": [
    { "text": "First-fit: 100. Best-fit: 70. Worst-fit: 100", "correct": false },
    { "text": "First-fit: 100. Best-fit: 40. Worst-fit: 100", "correct": true },
    { "text": "First-fit: 40. Best-fit: 40. Worst-fit: 70", "correct": false }
  ],
  "correctFeedback": "✅ Correto! First-fit usa a primeira que cabe (100), best-fit a menor que cabe (40) e worst-fit a maior (100).",
  "incorrectFeedback": "❌ Ainda não. First-fit pega a primeira vaga em que o registro cabe, best-fit a menor em que cabe e worst-fit a maior de todas."
}
```

```quiz
{
  "question": "Um arquivo de registros variáveis tem 40% do espaço em vagas pequenas e espalhadas, e as gravações de registros maiores que qualquer vaga falham. Qual é o problema e uma solução?",
  "options": [
    { "text": "Fragmentação interna; compactar o arquivo, sem nenhum custo", "correct": false },
    { "text": "Fragmentação externa; apagar todos os registros pequenos", "correct": false },
    { "text": "Fragmentação externa; compactar o arquivo, ao custo de ler e reescrever grande parte dele", "correct": true }
  ],
  "correctFeedback": "✅ Correto! Há espaço livre suficiente no total, mas nenhuma vaga serve sozinha. A compactação junta o espaço livre no fim, mas custa muitos acessos ao disco.",
  "incorrectFeedback": "❌ Ainda não. O espaço desperdiçado está fora dos registros, em vagas pequenas e separadas: é fragmentação externa. Apagar dados não é solução."
}
```
