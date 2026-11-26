## Exercícios avaliativos — Compressão de dados

Esta atividade reúne os conteúdos de compressão sem perdas: fundamentos, Run-Length Encoding (RLE), código de Huffman e LZW. Responda às questões e confira o feedback para revisar os pontos que ainda geram dúvida.

## Parte 1 — Fundamentos e RLE

### Questão 1 — Compressão sem perdas

```quiz
{
  "question": "O que caracteriza um algoritmo de compressão sem perdas?",
  "options": [
    { "text": "Parte da informação é descartada para que o arquivo fique menor.", "correct": false },
    { "text": "O dado original é recuperado exatamente após a descompressão.", "correct": true },
    { "text": "O arquivo comprimido nunca é maior que o original.", "correct": false },
    { "text": "Só pode ser aplicado a imagens e áudio.", "correct": false }
  ],
  "correctFeedback": "Correto! Na compressão sem perdas, a descompressão devolve exatamente o dado original, requisito para textos, código-fonte e executáveis.",
  "incorrectFeedback": "Compare com a compressão com perdas: o que acontece com o dado original depois de descomprimir?"
}
```

### Questão 2 — Codificação RLE

```quiz
{
  "question": "Qual é a saída da codificação RLE da entrada AAABCCCCDD, emitindo cada corrida como contagem seguida do símbolo?",
  "options": [
    { "text": "3A1B4C2D", "correct": true },
    { "text": "3A4C2D", "correct": false },
    { "text": "A3B1C4D2", "correct": false },
    { "text": "3A1B4C1D", "correct": false }
  ],
  "correctFeedback": "Correto! As corridas são AAA, B, CCCC e DD, gerando 3A, 1B, 4C e 2D. Corridas de tamanho 1 também geram um par.",
  "incorrectFeedback": "Separe a entrada em corridas de símbolos iguais e escreva, para cada uma, a contagem seguida do símbolo."
}
```

### Questão 3 — Pior caso do RLE

```quiz
{
  "question": "Em qual das entradas abaixo o RLE, com pares (contagem, símbolo), produz uma saída com o dobro do tamanho original?",
  "options": [
    { "text": "AAAAAAAA", "correct": false },
    { "text": "AABBCCDD", "correct": false },
    { "text": "AAAABBBB", "correct": false },
    { "text": "ABCDEFGH", "correct": true }
  ],
  "correctFeedback": "Correto! Sem repetições, cada símbolo vira o par (1, símbolo): 8 símbolos geram 16. É o pior caso do RLE.",
  "incorrectFeedback": "Calcule o tamanho da saída de cada opção: o dobro só ocorre quando todas as corridas têm tamanho 1."
}
```

## Parte 2 — Código de Huffman

### Questão 4 — Ideia central

```quiz
{
  "question": "Qual é a ideia central do código de Huffman?",
  "options": [
    { "text": "Substituir sequências repetidas de um mesmo símbolo por um par (contagem, símbolo).", "correct": false },
    { "text": "Atribuir códigos mais curtos aos símbolos mais frequentes e mais longos aos mais raros.", "correct": true },
    { "text": "Guardar em um dicionário as subsequências já vistas.", "correct": false },
    { "text": "Usar o mesmo número de bits para todos os símbolos.", "correct": false }
  ],
  "correctFeedback": "Correto! O Huffman usa códigos de tamanho variável: quanto mais frequente o símbolo, mais curto o seu código.",
  "incorrectFeedback": "Pense em qual redundância o Huffman explora: as frequências dos símbolos."
}
```

### Questão 5 — Primeira junção

Considere os símbolos e as frequências de um texto de 10 caracteres:

```text
Símbolo   Frequência
A         4
B         3
C         2
D         1
```

```quiz
{
  "question": "Na primeira junção da construção da árvore de Huffman, quais nós são extraídos e qual é a frequência do novo nó interno?",
  "options": [
    { "text": "D (1) e C (2); novo nó com frequência 3.", "correct": true },
    { "text": "A (4) e B (3); novo nó com frequência 7.", "correct": false },
    { "text": "D (1) e B (3); novo nó com frequência 4.", "correct": false },
    { "text": "C (2) e B (3); novo nó com frequência 5.", "correct": false }
  ],
  "correctFeedback": "Correto! Os dois menores são D (1) e C (2), e o nó interno tem frequência 1 + 2 = 3.",
  "incorrectFeedback": "O algoritmo sempre extrai os dois nós de menor frequência da fila."
}
```

### Questão 6 — Código livre de prefixo

```quiz
{
  "question": "Qual dos conjuntos de códigos abaixo NÃO pode ser um código de Huffman, por não ser livre de prefixo?",
  "options": [
    { "text": "A = 0, B = 10, C = 11", "correct": false },
    { "text": "A = 00, B = 01, C = 1", "correct": false },
    { "text": "A = 1, B = 00, C = 01", "correct": false },
    { "text": "A = 0, B = 01, C = 11", "correct": true }
  ],
  "correctFeedback": "Correto! O código 0 é prefixo de 01: ao ler um 0 não saberíamos se o símbolo terminou. Em um código de Huffman todos os símbolos ficam nas folhas.",
  "incorrectFeedback": "Procure um código que seja o início de outro código do mesmo conjunto."
}
```

## Parte 3 — LZW

### Questão 7 — Dicionário inicial

```quiz
{
  "question": "Como começa o dicionário do LZW ao codificar bytes?",
  "options": [
    { "text": "Com os 256 bytes possíveis, nos códigos de 0 a 255.", "correct": true },
    { "text": "Vazio, e cada símbolo só é inserido quando aparece pela primeira vez.", "correct": false },
    { "text": "Com as sequências mais frequentes do texto, calculadas em uma primeira passagem.", "correct": false },
    { "text": "Com a árvore de frequências do texto.", "correct": false }
  ],
  "correctFeedback": "Correto! Com os 256 bytes iniciais, qualquer entrada já pode ser representada; as novas sequências são aprendidas durante a leitura, a partir do código 256.",
  "incorrectFeedback": "Lembre que o LZW faz uma única passagem e não precisa conhecer o texto antes de começar."
}
```

### Questão 8 — Codificação LZW

```quiz
{
  "question": "Qual é a saída da codificação LZW de ABABAB, considerando A = 65, B = 66 e novas entradas a partir do código 256?",
  "options": [
    { "text": "65 66 65 66 65 66", "correct": false },
    { "text": "65 66 256 258", "correct": false },
    { "text": "65 256 66 257", "correct": false },
    { "text": "65 66 256 256", "correct": true }
  ],
  "correctFeedback": "Correto! Emitimos 65 (cria AB = 256), 66 (cria BA = 257), 256 (cria ABA = 258) e, no fim da entrada, 256, o código de w = AB.",
  "incorrectFeedback": "A cada sequência inédita, emita o código de w e insira w + c no dicionário. Não esqueça de emitir o código final de w."
}
```

## Parte 4 — Comparação entre os algoritmos

### Questão 9 — Redundância explorada

```quiz
{
  "question": "Associe corretamente cada algoritmo à redundância que ele explora principalmente.",
  "options": [
    { "text": "RLE: corridas de símbolos iguais; Huffman: frequências desiguais; LZW: subsequências repetidas.", "correct": true },
    { "text": "RLE: frequências desiguais; Huffman: subsequências repetidas; LZW: corridas de símbolos iguais.", "correct": false },
    { "text": "RLE: subsequências repetidas; Huffman: corridas de símbolos iguais; LZW: frequências desiguais.", "correct": false },
    { "text": "Os três exploram exclusivamente a frequência dos símbolos.", "correct": false }
  ],
  "correctFeedback": "Correto! O RLE usa corridas, o Huffman usa frequências e o LZW usa subsequências que se repetem, guardadas em um dicionário.",
  "incorrectFeedback": "Revise a tabela de redundâncias de cada algoritmo: corridas, frequências e subsequências."
}
```

### Questão 10 — Metadados e passagens

```quiz
{
  "question": "Qual algoritmo exige armazenar a árvore (ou a tabela de frequências) junto aos dados comprimidos e faz duas passagens sobre a entrada?",
  "options": [
    { "text": "RLE.", "correct": false },
    { "text": "LZW.", "correct": false },
    { "text": "Huffman.", "correct": true },
    { "text": "Nenhum dos três.", "correct": false }
  ],
  "correctFeedback": "Correto! O Huffman precisa de uma passagem para contar frequências e outra para codificar, e o decodificador depende da árvore para recuperar os símbolos.",
  "incorrectFeedback": "Pense em qual algoritmo precisa conhecer as frequências antes de começar a codificar."
}
```