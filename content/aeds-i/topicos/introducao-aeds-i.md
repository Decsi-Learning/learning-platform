## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Conectar os conceitos aprendidos em Programação I e II (como vetores, registros, alocação dinâmica e ponteiros) ao projeto de estruturas de dados.
- Compreender por que organizar dados e analisar a eficiência dos algoritmos são passos essenciais além de fazer o código funcionar.
- Identificar a visão geral e o propósito de cada módulo estudado na trilha de AEDS I.

## De Programação I e II para AEDS I

Em **Programação I**, você aprendeu os fundamentos da construção de programas: variáveis, estruturas condicionais, laços de repetição, funções e vetores estáticos. Em **Programação II**, ganhou controle direto sobre a memória ao trabalhar com registros (`struct`), alocação dinâmica (`malloc` e `free`) e **ponteiros** — aprendendo a manipular endereços de memória em vez de apenas copiar valores.

Se Programação I e II ensinaram a usar as ferramentas básicas da linguagem, **Algoritmos e Estruturas de Dados I (AEDS I)** ensina a projetar soluções escaláveis. O foco deixa de ser apenas *"o código produz a saída certa?"* e passa a ser *"como organizar os dados e quanto tempo e memória o algoritmo consome quando a entrada cresce?"*.

> **O papel dos ponteiros na prática:** em Programação II, ponteiros costumam parecer apenas um recurso para passagem por referência ou vetores dinâmicos. Em AEDS I, eles se tornam o elo que conecta elementos espalhados na memória, permitindo criar listas, pilhas e árvores que crescem e encolhem sob demanda.

## Comparação de evolução

| Aspecto | Programação I e II | AEDS I |
|:--|:--|:--|
| Foco principal | Sintaxe, lógica de controle e manipulação básica de memória | Organização eficiente de dados e desempenho algorítmico |
| Registros e vetores | Armazenamento direto de dados do problema | Base para construir Tipos Abstratos de Dados e estruturas |
| Uso de ponteiros | Endereçamento e alocação dinâmica simples | Encadeamento dinâmico de nós e navegação em estruturas |
| Critério de qualidade | Correção funcional da saída | Complexidade de tempo, uso de memória e escalabilidade |

---

## Roteiro dos tópicos de AEDS I

A disciplina organiza os fundamentos necessários para estruturar, buscar e ordenar dados em memória principal:

- **Recursividade:** funções que chamam a si mesmas para dividir problemas em instâncias menores, explorando **recursão de cauda, indireta e aninhada**, os cuidados com **recursão excessiva** e a técnica de **backtracking**.
- **Análise de complexidade de algoritmos:** estudo do comportamento assintótico das funções de custo para avaliar **melhor caso, pior caso e caso médio** independentemente do computador utilizado.
- **Tipos Abstratos de Dados (TADs):** abstração e modelagem de problemas separando a interface de operações (*o que* a estrutura faz) da sua implementação interna (*como* ela faz).
- **Estruturas de Dados lineares — Lista:** sequências dinâmicas baseadas em nós interligados por ponteiros, nas variações **simplesmente encadeada**, **duplamente encadeada** e **circular**, com operações de inserção, remoção e busca.
- **Estruturas de Dados lineares — Pilha:** estrutura com política de acesso restrita ao topo, implementada tanto com vetores quanto com listas encadeadas.
- **Estruturas de Dados hierárquicas:** organização não linear em níveis de ramificação, cobrindo **Árvores Binárias**, **Árvores Vermelho e Preto** e **Heaps**.
- **Algoritmos e técnicas de busca e ordenação:** estratégias de **busca sequencial e binária**, análise de eficiência e estabilidade, e os métodos clássicos de ordenação (**Bubble**, **Selection**, **Insertion**, **Shellsort**, **Quicksort**, **Mergesort** e **Heapsort**).

## Teste de conhecimento

```quiz
{
  "question": "Qual recurso estudado em Programação II serve como base direta para conectar nós não contíguos em listas encadeadas e árvores em AEDS I?",
  "options": [
    { "text": "Laços de repetição aninhados (for dentro de for).", "correct": false },
    { "text": "Ponteiros combinados com registros (structs) e alocação dinâmica.", "correct": true },
    { "text": "Constantes simbólicas definidas com #define.", "correct": false }
  ],
  "correctFeedback": "Correto! Registros armazenam os dados e ponteiros guardam o endereço de memória dos próximos nós alocados dinamicamente.",
  "incorrectFeedback": "Pense em qual mecanismo da linguagem permite que uma estrutura armazene o endereço de outra posição na memória."
}
```

```quiz
{
  "question": "Qual é a principal mudança de perspectiva ao avançar de Programação I e II para Algoritmos e Estruturas de Dados I?",
  "options": [
    { "text": "Deixar de usar funções e passar a escrever todo o programa dentro da função main.", "correct": false },
    { "text": "Avaliar não apenas se o código funciona, mas como os dados são organizados e qual o custo assintótico das operações.", "correct": true },
    { "text": "Substituir todas as variáveis numéricas por arquivos de texto em disco.", "correct": false }
  ],
  "correctFeedback": "Exato! Em AEDS I, a escolha da estrutura de dados e a análise de complexidade determinam se uma solução escala para grandes entradas.",
  "incorrectFeedback": "Revise a comparação entre o critério de qualidade de Programação I/II e o foco de AEDS I."
}
```

```quiz
{
  "question": "Qual módulo de AEDS I trata especificamente da separação entre a interface de operações de uma estrutura e os detalhes de sua implementação interna?",
  "options": [
    { "text": "Tipos Abstratos de Dados (TADs).", "correct": true },
    { "text": "Recursão de cauda e backtracking.", "correct": false },
    { "text": "Algoritmos de ordenação por comparação.", "correct": false }
  ],
  "correctFeedback": "Correto! Os Tipos Abstratos de Dados permitem modelar problemas definindo operações bem especificadas independentemente de como os dados estão guardados.",
  "incorrectFeedback": "Consulte o roteiro dos tópicos e observe qual conceito foca em abstração e modelagem de problemas."
}
```