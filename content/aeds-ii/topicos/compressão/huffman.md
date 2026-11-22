## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Explicar por que códigos de tamanho variável comprimem melhor que códigos de tamanho fixo quando as frequências são desiguais.
- Construir a **árvore de Huffman** com uma fila de prioridade (Min-Heap) e gerar o código de prefixo ótimo.
- Calcular o custo total, em bits, de um texto codificado com Huffman.
- Decodificar uma sequência de bits percorrendo a árvore.

## Introdução

O **Código de Huffman** é um algoritmo de compressão **sem perdas** que explora símbolos com **frequências desiguais**. Em vez de usar um número fixo de bits por símbolo (ex.: 8 bits do ASCII), atribui-se **códigos curtos aos símbolos frequentes** e **códigos longos aos raros**. Ele é usado como etapa de formatos amplamente conhecidos, como ZIP/Deflate, JPEG e MP3.

## Conceito principal

Os códigos são lidos nos caminhos de uma árvore binária onde os símbolos ficam **somente nas folhas**, o que gera um **código livre de prefixo** (*prefix-free*): nenhum código é prefixo de outro, e a decodificação é inequívoca, sem separadores.

Para uma árvore com frequências $f_s$ e profundidade $p_s$ de cada folha, o custo total é:

$$\text{Bits} = \sum_{s} f_s \cdot p_s$$

O algoritmo guloso de Huffman minimiza essa soma entre todos os códigos de prefixo símbolo a símbolo.

### Como funciona

Para construir a árvore, usamos uma fila de prioridade — um **Min-Heap**, estrutura vista no tópico de Heaps — que sempre entrega os nós de menor frequência:

1. Contamos a frequência de cada símbolo e criamos uma folha por símbolo.
2. Inserimos todas as folhas em um Min-Heap ordenado pela frequência.
3. Enquanto houver mais de um nó no heap: extraímos os **dois nós de menor frequência**, criamos um nó interno com a **soma** das frequências (o primeiro extraído como filho esquerdo, o segundo como direito) e o reinserimos.
4. O último nó restante é a raiz. O código de cada símbolo é o caminho da raiz até sua folha (`0` = esquerda, `1` = direita).

> **Atenção:** a árvore (ou a tabela de frequências) precisa ser armazenada junto aos dados comprimidos, pois o decodificador depende dela. Empates entre frequências podem gerar árvores diferentes, mas o custo total em bits é sempre o mesmo (todas são ótimas).

---

## Exemplo
### Rastreamento da construção para ABRACADABRA

Frequências: `A = 5`, `B = 2`, `R = 2`, `C = 1`, `D = 1` (11 símbolos no total).

1. Extraímos `C(1)` e `D(1)` → novo nó `N1(2)`.
2. Extraímos `B(2)` e `R(2)` → novo nó `N2(4)`. (Em caso de empate, usamos o nó mais antigo primeiro.)
3. Extraímos `N1(2)` e `N2(4)` → novo nó `N3(6)`.
4. Extraímos `A(5)` e `N3(6)` → raiz com frequência `11`.

Lendo os caminhos: `A = 0`, `C = 100`, `D = 101`, `B = 110`, `R = 111`.

Custo total: $5\cdot1 + 2\cdot3 + 2\cdot3 + 1\cdot3 + 1\cdot3 = 23$ bits, contra $11 \cdot 3 = 33$ bits com código fixo de 3 bits e $11 \cdot 8 = 88$ bits em ASCII.

Texto codificado: `0 110 111 0 100 0 101 0 110 111 0` (23 bits).

### Visualização passo a passo

```codigo
{"title":"Código de Huffman: construção da árvore e códigos","code":"/* Código de Huffman: ABRACADABRA */","steps":[{"line":1,"caption":"Vamos codificar ABRACADABRA (11 símbolos). Em ASCII seriam 88 bits. O Huffman dá códigos curtos aos símbolos frequentes e códigos longos aos raros.","vars":{},"rows":[[{"s":0,"n":11,"i":[["A","",1],["B","",2],["R","",5],["A","",1],["C","",3],["A","",1],["D","",4],["A","",1],["B","",2],["R","",5],["A","",1]],"l":"texto"}]],"stack":""},{"line":1,"caption":"Contamos quantas vezes cada símbolo aparece: A = 5, B = 2, R = 2, C = 1 e D = 1.","vars":{},"rows":[[{"s":0,"n":11,"i":[["A","p",1],["B","p",2],["R","p",5],["A","p",1],["C","p",3],["A","p",1],["D","p",4],["A","p",1],["B","p",2],["R","p",5],["A","p",1]],"l":"texto"}],[{"i":[["A:5","p",1],["B:2","p",2],["C:1","p",3],["D:1","p",4],["R:2","p",5]],"l":"frequências (símbolo:contagem)"}]],"stack":""},{"line":1,"caption":"Cada símbolo vira uma folha (uma árvore de um só nó) e todas entram na fila de prioridade, que sempre entrega primeiro o nó de menor frequência. Em caso de empate, sai o nó mais antigo.","vars":{"fila":5},"rows":[[{"i":[["C:1","p",3],["D:1","p",4],["B:2","p",2],["R:2","p",5],["A:5","p",1]],"l":"fila de prioridade (menor frequência primeiro)"}]],"stack":""},{"line":1,"caption":"Retiramos da fila os dois nós de menor frequência: C:1 e D:1.","vars":{"fila":5},"rows":[[{"i":[["C:1","c",3],["D:1","c",4],["B:2","",2],["R:2","",5],["A:5","",1]],"l":"fila de prioridade (menor frequência primeiro)"}]],"stack":""},{"line":1,"caption":"Juntamos os dois em um novo nó interno N1 = (C,D): o primeiro retirado fica à esquerda e o segundo à direita. Frequência: 1 + 1 = 2. O novo nó volta para a fila.","vars":{"fila":4},"rows":[[{"i":[["B:2","",2],["R:2","",5],["N1:2","p",0],["A:5","",1]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","p",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Retiramos da fila os dois nós de menor frequência: B:2 e R:2. N1:2 também tem frequência 2, mas B e R são mais antigos e saem primeiro.","vars":{"fila":4},"rows":[[{"i":[["B:2","c",2],["R:2","c",5],["N1:2","",0],["A:5","",1]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Juntamos os dois em um novo nó interno N2 = (B,R): o primeiro retirado fica à esquerda e o segundo à direita. Frequência: 2 + 2 = 4. O novo nó volta para a fila.","vars":{"fila":3},"rows":[[{"i":[["N1:2","",0],["N2:4","p",0],["A:5","",1]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","p",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Retiramos da fila os dois nós de menor frequência: N1:2 e N2:4.","vars":{"fila":3},"rows":[[{"i":[["N1:2","c",0],["N2:4","c",0],["A:5","",1]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Juntamos os dois em um novo nó interno N3 = (N1,N2): o primeiro retirado fica à esquerda e o segundo à direita. Frequência: 2 + 4 = 6. O novo nó volta para a fila.","vars":{"fila":2},"rows":[[{"i":[["A:5","",1],["N3:6","p",0]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","p",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Retiramos da fila os dois nós de menor frequência: A:5 e N3:6.","vars":{"fila":2},"rows":[[{"i":[["A:5","c",1],["N3:6","c",0]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Juntamos os dois em um novo nó interno N4 = (A,N3): o primeiro retirado fica à esquerda e o segundo à direita. Frequência: 5 + 6 = 11. O novo nó volta para a fila. Sobrou um único nó na fila: é a raiz da árvore de Huffman.","vars":{"fila":1},"rows":[[{"i":[["N4:11","p",0]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","p",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"A árvore está pronta. A raiz N4 (frequência 11) liga A à esquerda e N3 à direita; N3 liga N1 e N2; N1 liga C e D; N2 liga B e R. Agora rotulamos as arestas: ir para a esquerda vale 0 e ir para a direita vale 1. O código de cada símbolo é o caminho da raiz até a sua folha.","vars":{"fila":1},"rows":[[{"i":[["N4:11","p",0]],"l":"fila de prioridade (menor frequência primeiro)"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"A: partindo da raiz N4, vamos à esquerda (0) até A. O código de A é 0. Como A aparece 5 vez(es) e o código tem 1 bit(s), ele gasta 5 bit(s) no total.","vars":{"codigo":"\"0\""},"rows":[[{"i":[["0","c",0]],"l":"caminho da raiz até A (0 = esquerda, 1 = direita)"}],[{"i":[["A=0","p",1]],"l":"códigos"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"C: partindo da raiz N4, vamos à direita (1) até N3, à esquerda (0) até N1, à esquerda (0) até C. O código de C é 100. Como C aparece 1 vez(es) e o código tem 3 bit(s), ele gasta 3 bit(s) no total.","vars":{"codigo":"\"100\""},"rows":[[{"i":[["1","c",0],["0","c",0],["0","c",0]],"l":"caminho da raiz até C (0 = esquerda, 1 = direita)"}],[{"i":[["A=0","",1],["C=100","p",3]],"l":"códigos"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"D: partindo da raiz N4, vamos à direita (1) até N3, à esquerda (0) até N1, à direita (1) até D. O código de D é 101. Como D aparece 1 vez(es) e o código tem 3 bit(s), ele gasta 3 bit(s) no total.","vars":{"codigo":"\"101\""},"rows":[[{"i":[["1","c",0],["0","c",0],["1","c",0]],"l":"caminho da raiz até D (0 = esquerda, 1 = direita)"}],[{"i":[["A=0","",1],["C=100","",3],["D=101","p",4]],"l":"códigos"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"B: partindo da raiz N4, vamos à direita (1) até N3, à direita (1) até N2, à esquerda (0) até B. O código de B é 110. Como B aparece 2 vez(es) e o código tem 3 bit(s), ele gasta 6 bit(s) no total.","vars":{"codigo":"\"110\""},"rows":[[{"i":[["1","c",0],["1","c",0],["0","c",0]],"l":"caminho da raiz até B (0 = esquerda, 1 = direita)"}],[{"i":[["A=0","",1],["C=100","",3],["D=101","",4],["B=110","p",2]],"l":"códigos"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"R: partindo da raiz N4, vamos à direita (1) até N3, à direita (1) até N2, à direita (1) até R. O código de R é 111. Como R aparece 2 vez(es) e o código tem 3 bit(s), ele gasta 6 bit(s) no total.","vars":{"codigo":"\"111\""},"rows":[[{"i":[["1","c",0],["1","c",0],["1","c",0]],"l":"caminho da raiz até R (0 = esquerda, 1 = direita)"}],[{"i":[["A=0","",1],["C=100","",3],["D=101","",4],["B=110","",2],["R=111","p",5]],"l":"códigos"}],[{"i":[["N1=(C,D)","",0],["N2=(B,R)","",0],["N3=(N1,N2)","",0],["N4=(A,N3)","",0]],"l":"nós internos criados"}]],"stack":""},{"line":1,"caption":"Pronto. O texto codificado ocupa 23 bits: 5·1 + 2·3 + 2·3 + 1·3 + 1·3 = 23, contra 88 bits em ASCII e 33 bits com código fixo de 3 bits. Nenhum código é prefixo de outro, porque todos os símbolos estão nas folhas.","vars":{"bits":23},"rows":[[{"i":[["A=0","",1],["C=100","",3],["D=101","",4],["B=110","",2],["R=111","",5]],"l":"códigos"}],[{"s":0,"n":11,"i":[["0","",1],["110","",2],["111","",5],["0","",1],["100","",3],["0","",1],["101","",4],["0","",1],["110","",2],["111","",5],["0","",1]],"l":"texto codificado (23 bits)"}]],"stack":""}]}
```

### Decodificação

Para decodificar, lemos os bits a partir da raiz, descendo à esquerda em `0` e à direita em `1`. Ao chegar a uma folha, emitimos o símbolo e **voltamos à raiz**.

### Rastreamento da decodificação de 0110111

1. Bit `0` → esquerda da raiz → folha `A`. Emite `A` e volta à raiz.
2. Bits `1`, `1`, `0` → direita, direita, esquerda → folha `B`. Emite `B` e volta à raiz.
3. Bits `1`, `1`, `1` → folha `R`. Emite `R`.
4. Resultado: `ABR`.

### Exemplo visual

![Exemplo visual da codificação utilizando huffman de ABRACADABRA](imagens/huffman-arvore.svg)

## Comparação e complexidade

Considere uma entrada de $n$ símbolos e um alfabeto com $\sigma$ símbolos distintos ($\sigma \le 256$ para bytes):

| Etapa | Descrição | Custo |
|:--|:--|--:|
| Contar frequências | Uma passagem pela entrada | $O(n)$ |
| Construir a árvore | $\sigma - 1$ junções, cada uma com extrações e inserção no Min-Heap | $O(\sigma \log \sigma)$ |
| Gerar os códigos | Percorre a árvore uma vez | $O(\sigma)$ |
| Codificar | Segunda passagem pela entrada, trocando cada símbolo pelo seu código | $O(n)$ |
| Decodificar | Percorre a árvore a cada bit lido | $O(\text{bits})$ |

O custo total de compressão é $O(n + \sigma \log \sigma)$. O melhor caso é uma distribuição muito desigual de frequências; com frequências uniformes não há ganho. O algoritmo exige duas passagens sobre a entrada e o armazenamento da árvore.

## Teste de conhecimento

```quiz
{
  "question": "Por que o código de Huffman pode ser decodificado sem ambiguidade, mesmo sem separadores entre os códigos dos símbolos?",
  "options": [
    { "text": "Porque os símbolos ficam apenas nas folhas da árvore, então nenhum código é prefixo de outro.", "correct": true },
    { "text": "Porque todos os códigos têm exatamente o mesmo número de bits.", "correct": false },
    { "text": "Porque os símbolos mais frequentes sempre recebem códigos terminados em 0.", "correct": false }
  ],
  "correctFeedback": "Exato! Como cada caminho termina em uma folha, ao chegar nela sabemos que o símbolo terminou e voltamos à raiz.",
  "incorrectFeedback": "Pense em onde ficam os símbolos na árvore de Huffman e no que isso garante sobre os caminhos."
}
```

```quiz
{
  "question": "Os símbolos de ABRACADABRA têm frequências A=5, B=2, R=2, C=1 e D=1. Quantos bits no total são necessários para codificar o texto com o código de Huffman?",
  "options": [
    { "text": "23 bits.", "correct": true },
    { "text": "33 bits.", "correct": false },
    { "text": "88 bits.", "correct": false }
  ],
  "correctFeedback": "Correto! Com A=0, B=110, R=111, C=100 e D=101: 5·1 + 2·3 + 2·3 + 1·3 + 1·3 = 23 bits (33 seria o código fixo de 3 bits e 88 o ASCII).",
  "incorrectFeedback": "Some, para cada símbolo, frequência × comprimento do código. O símbolo A, o mais frequente, recebe um código de apenas 1 bit."
}
```