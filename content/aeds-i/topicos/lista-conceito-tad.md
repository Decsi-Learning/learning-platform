## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Definir o que é uma lista linear e o que significa a ordem entre seus elementos.
- Descrever as operações padrão do TAD Lista com seus protótipos.
- Distinguir o TAD (o que a estrutura faz) das implementações (como ela é feita).
- Relacionar listas com pilhas e filas.

## Introdução

Pense na sua lista de tarefas do dia: cada tarefa ocupa uma posição, e faz sentido dizer "a terceira tarefa" ou "a tarefa que vem depois desta". Diferente de um conjunto, em que a ordem não importa, em uma **lista** cada elemento tem uma posição e um sucessor bem definidos.

Em computação, a lista é um dos TADs mais usados: ela serve de base para várias outras estruturas. A pilha e a fila, que você já viu, nada mais são do que listas com restrições sobre onde inserir e remover.

## Conceito principal

Uma **lista linear** é uma sequência de elementos em que cada elemento, exceto o último, tem exatamente um sucessor. Sobre essa sequência, queremos poder inserir, remover e buscar elementos em qualquer posição, não só nas pontas.

### O TAD Lista

O TAD define **o que** a estrutura deve oferecer, sem dizer **como** ela é implementada. Um conjunto padrão de operações para listas é:

```text
Lista_Inicia(Lista)          inicia uma lista vazia.
Lista_Insere(Lista, x, pos)  insere o item x na posição pos.
Lista_Remove(Lista, pos)     remove e retorna o item da posição pos.
Lista_Busca(Lista, x)        retorna a posição do item x, se ele existir.
Lista_EhVazia(Lista)         retorna true se a lista está vazia.
Lista_Tamanho(Lista)         retorna quantos itens a lista tem.
```

O conjunto exato depende de cada aplicação, mas inserir, remover e buscar aparecem em praticamente todas.

> **Ponto-chave:** pilha e fila são listas com restrição. A pilha restringe inserção e remoção a uma só ponta (LIFO); a fila insere em uma ponta e remove da outra (FIFO). A lista é o TAD mais geral dos três.

## Implementações

Existem várias formas de representar uma lista na memória. As duas mais usadas são:

- **Por vetor (array):** os itens ficam em posições contíguas de memória. Simples e com acesso direto por índice, mas inserir ou remover no meio exige deslocar elementos.
- **Por ponteiros (nós encadeados):** cada item fica em um nó que guarda também a referência para o próximo nó. Inserir e remover não deslocam nada, mas o acesso a uma posição exige percorrer a lista.

As próximas páginas detalham cada uma dessas implementações, incluindo as variações encadeadas: simples, dupla e circular.

## Teste de conhecimento

```quiz
{
  "question": "Qual é a principal diferença entre o TAD Lista e suas implementações (por vetor ou por ponteiros)?",
  "options": [
    { "text": "O TAD define as operações e o comportamento esperado; as implementações definem como os dados são organizados na memória para realizar essas operações.", "correct": true },
    { "text": "O TAD só existe na linguagem C; as implementações só existem em pseudocódigo.", "correct": false },
    { "text": "O TAD Lista só permite inserir no final, enquanto as implementações permitem inserir em qualquer posição.", "correct": false }
  ],
  "correctFeedback": "Isso mesmo! O TAD é o contrato (o que fazer); a implementação é a forma concreta de cumpri-lo (como fazer).",
  "incorrectFeedback": "Pense no TAD como uma especificação: ele diz quais operações existem, sem escolher a estrutura de memória. Tente novamente."
}
```

```quiz
{
  "question": "Por que dizemos que pilha e fila são casos particulares de lista?",
  "options": [
    { "text": "Porque ambas são implementadas obrigatoriamente com vetores.", "correct": false },
    { "text": "Porque são listas com restrições sobre as posições em que se pode inserir e remover elementos.", "correct": true },
    { "text": "Porque listas só podem armazenar pilhas e filas como elementos.", "correct": false }
  ],
  "correctFeedback": "Correto! A pilha restringe tudo ao topo (LIFO) e a fila separa entrada e saída (FIFO); a lista é o caso geral, sem essas restrições.",
  "incorrectFeedback": "Compare as regras: na pilha só se mexe no topo, na fila só nas pontas. O que a lista permite a mais? Tente novamente."
}
```
