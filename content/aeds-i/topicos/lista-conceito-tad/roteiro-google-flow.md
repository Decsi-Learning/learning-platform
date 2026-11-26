# Lista - Conceito e TAD · Roteiro de produção

No Google Flow, use @Rafa IA no modo Ingredients. Gere cada clipe em 9:16 (vertical) e 360p. Confira o enquadramento e a fala. Ao exportar o MP4, escolha 720p e mantenha 9:16. Salve os arquivos separadamente em `videos/`.

**Slide 1: "O que você vai aprender"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s01-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, warm smile, welcoming. He says in a warm, unhurried voice: "Você vai aprender a descrever uma lista e a usar suas operações. Vamos separar o que a lista oferece de como ela funciona na memória e descobrir onde entram pilhas e filas." No background music. No on-screen text.
```

**Slide 2: "A ordem muda o plano"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s02-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, raises eyebrows and tilts head slightly, curious. He says in a warm, unhurried voice: "Nos dois planos você tem as mesmas tarefas. Mas o que vem depois de ler? A resposta muda quando você troca a ordem. Um conjunto de tarefas, sozinho, perderia essa informação." No background music. No on-screen text.
```

**Slide 3: "Cada tarefa ocupa uma posição"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s03-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: "Parta de ler e dê um passo na sequência. Você chega a revisar. Essa é a ideia de sucessor. Numa lista linear, cada elemento tem exatamente um sucessor, exceto o último." No background music. No on-screen text.
```

**Slide 4: "O TAD define um contrato"** (duração 14 s)

Clipe 1 de 1 · 14 s · `s04-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: "Se você pedir a remoção da segunda tarefa, já sabe qual item deve sair. O tipo abstrato de dados especifica esse comportamento. A escolha de como guardar as tarefas vem depois." No background music. No on-screen text.
```

**Slide 5: "Uma lista começa vazia"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s05-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: "Você acabou de iniciar a lista. Perguntar se ela está vazia dá uma resposta de sim ou não. Perguntar pelo tamanho dá uma quantidade. Nesse momento, ela vale zero." No background music. No on-screen text.
```

**Slide 6: "Inserir escolhe o lugar da tarefa"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s06-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: "Você quer revisar antes de praticar. Para inserir, informe a tarefa e a posição desejada. A tarefa que vinha depois de ler continua na lista, agora uma posição adiante." No background music. No on-screen text.
```

**Slide 7: "Buscar devolve uma posição"** (duração 12 s)

Clipe 1 de 1 · 12 s · `s07-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: "Você lembra o nome da tarefa, mas esqueceu onde ela está. A busca recebe o item e devolve sua posição, se ele existir. Buscar mantém a sequência das tarefas." No background music. No on-screen text.
```

**Slide 8: "Remover devolve o item"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s08-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, slow nod on the key word. He says in a warm, unhurried voice: "Agora você conhece a posição de revisar. Ao pedir a remoção nessa posição, recebe a tarefa que saiu. O tamanho cai para dois, e praticar passa a ser o sucessor de ler." No background music. No on-screen text.
```

**Slide 9: "Pilha e fila restringem as pontas"** (duração 13 s)

Clipe 1 de 1 · 13 s · `s09-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: "Na pilha, revisar sai primeiro porque entrou por último. Na fila, ler sai primeiro porque chegou antes. A lista permite escolher a posição de inserção ou remoção." No background music. No on-screen text.
```

**Slide 10: "Um contrato, duas representações"** (duração 26 s)

Clipe 1 de 2 · 13 s · `s10-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: "No vetor, as tarefas ocupam posições contíguas na memória. Você chega direto pelo índice. Para inserir no meio, precisa deslocar os itens seguintes e abrir espaço." No background music. No on-screen text.
```

Clipe 2 de 2 · 13 s · `s10-c2.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: "Na lista encadeada, cada nó guarda um item e a referência para o próximo. Você percorre os nós até o ponto desejado. Ali, basta ajustar as ligações para inserir." No background music. No on-screen text.
```

**Slide 11: "Teste o contrato da lista"** (duração 23 s)

Clipe 1 de 2 · 13 s · `s11-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, raises eyebrows and tilts head slightly, curious. He says in a warm, unhurried voice: "Imagine que a lista de tarefas passou de vetor para nós encadeados. Quem usa a operação de busca pode continuar esperando o mesmo resultado? Pense antes de responder." No background music. No on-screen text.
```

Clipe 2 de 2 · 10 s · `s11-c2.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, slow nod on the key word. He says in a warm, unhurried voice: "Sim. O contrato da busca continua o mesmo. Se revisar ocupa a segunda posição, essa é a posição devolvida nas duas implementações." No background music. No on-screen text.
```

**Slide 12: "Reconheça a regra das pontas"** (duração 23 s)

Clipe 1 de 2 · 11 s · `s12-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, raises eyebrows and tilts head slightly, curious. He says in a warm, unhurried voice: "Pense nas tarefas ler e revisar outra vez. O que explica a diferença entre a próxima tarefa a sair de uma pilha e a próxima a sair de uma fila?" No background music. No on-screen text.
```

Clipe 2 de 2 · 12 s · `s12-c2.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, slow nod on the key word. He says in a warm, unhurried voice: "A regra das pontas. Na pilha você insere e remove pelo topo. Na fila você insere no fim e remove do início. Essas restrições explicam a ordem de saída." No background music. No on-screen text.
```

**Slide 13: "Três ideias para levar"** (duração 14 s)

Clipe 1 de 1 · 14 s · `s13-c1.mp4`

```text
@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, satisfied smile, confident tone. He says in a warm, unhurried voice: "Você já pode explicar uma lista usando suas tarefas. Mostre quem vem depois de quem, escolha uma operação e descreva o resultado. Essa explicação vale tanto para vetor quanto para nós." No background music. No on-screen text.
```
