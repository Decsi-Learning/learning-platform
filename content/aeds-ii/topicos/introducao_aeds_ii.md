## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Compreender a transição entre as estruturas em memória principal (AEDS I) e o armazenamento persistente em memória secundária (AEDS II).
- Explicar por que a volatilidade e a capacidade da memória RAM exigem técnicas específicas de organização em disco.
- Identificar a visão geral e o propósito de cada módulo abordado na trilha de AEDS II.

## Revisão de AEDS I e volatilidade

Em **Algoritmos e Estruturas de Dados I (AEDS I)**, o foco está na manipulação de dados diretamente na **memória principal (RAM)** por meio de estruturas como vetores, listas encadeadas, pilhas, filas e árvores binárias.

Embora a RAM ofereça acesso extremamente rápido às posições de memória, ela possui duas limitações críticas para sistemas reais:

- **Volatilidade:** os dados existem apenas enquanto o programa está em execução e há fornecimento de energia. Ao encerrar a aplicação, toda a estrutura é perdida.
- **Capacidade limitada:** grandes volumes de dados não cabem integralmente na memória principal.

> **Mudança de paradigma:** em **AEDS II**, o objetivo passa a ser a **persistência** e a recuperação eficiente de grandes volumes de informação em **memória secundária** (discos rígidos e SSDs), onde o principal gargalo não é o processamento da CPU, mas o custo das operações de entrada e saída (E/S).

## Comparação de ambientes

| Aspecto | Memória Principal (AEDS I) | Memória Secundária (AEDS II) |
|:--|:--|:--|
| Persistência | Volátil (dados perdidos ao desligar) | Não volátil (dados persistem em arquivos) |
| Tempo de acesso | Muito rápido (nanossegundos) | Mais lento (milissegundos/microssegundos) |
| Unidade de transferência | Palavra ou byte | Blocos ou páginas de disco |
| Principal gargalo | Número de instruções e ponteiros | Número de acessos ao disco (E/S) |

---

## Roteiro dos tópicos de AEDS II

A disciplina organiza as técnicas necessárias para armazenar, localizar, compactar e processar dados persistentes:

- **Organização em memória secundária e arquivos:** funcionamento físico e lógico de dispositivos de armazenamento, noções de arquivos, formas de **acesso sequencial e randômico** e métodos de organização interna.
- **Registros de tamanho fixo e variável:** estratégias para estruturar campos e delimitar registros dentro de um arquivo, equilibrando facilidade de acesso e economia de espaço.
- **Ordenação em disco e reutilização de espaço:** algoritmos de ordenação externa (**interpolação** e **interpolação polifásica**) para arquivos maiores que a RAM, além do reaproveitamento de registros removidos e controle de **fragmentação interna e externa**.
- **Indexação de dados em disco:** uso de estruturas balanceadas de múltiplos caminhos — **Árvores B, B+ e B\*** — para localizar registros com o mínimo de leituras em disco.
- **Compressão de dados:** redução do tamanho de arquivos para economizar armazenamento e diminuir transferências de E/S, estudando **Run-Length Encoding (RLE)**, **código de Huffman** e **LZW**.
- **Hash:** mapeamento direto de chaves por meio de **funções de dispersão**, análise de eficiência e estratégias para **tratamento de colisões**.
- **Casamento de padrões em texto:** algoritmos para busca exata de subcadeias em grandes textos, incluindo **Força Bruta**, **Shift-And**, **Boyer-Moore**, **Boyer-Moore-Horspool** e **Knuth-Morris-Pratt (KMP)**.

## Teste de conhecimento

```quiz
{
  "question": "Qual é a principal limitação das estruturas estudadas exclusivamente em memória principal (AEDS I) quando aplicadas a sistemas de informação reais?",
  "options": [
    { "text": "Estruturas em memória principal não permitem ordenação nem busca binária.", "correct": false },
    { "text": "A memória RAM é volátil e tem capacidade limitada, perdendo os dados quando o programa encerra.", "correct": true },
    { "text": "Ponteiros em memória principal não conseguem referenciar registros com mais de um campo.", "correct": false }
  ],
  "correctFeedback": "Correto! Por ser volátil e finita, a RAM exige que os dados sejam gravados em memória secundária para sobreviverem ao fim da execução.",
  "incorrectFeedback": "Lembre-se do que acontece com as variáveis e estruturas alocadas na RAM quando o computador é desligado ou o processo termina."
}
```

```quiz
{
  "question": "Ao projetar algoritmos para arquivos em memória secundária, qual fator costuma dominar o tempo total de execução?",
  "options": [
    { "text": "A quantidade de operações de entrada e saída (acessos a blocos de disco).", "correct": true },
    { "text": "O número de declarações de variáveis locais na função main.", "correct": false },
    { "text": "A conversão de números inteiros para ponto flutuante na CPU.", "correct": false }
  ],
  "correctFeedback": "Exato! Acessar a memória secundária é ordens de grandeza mais lento que operar na RAM, tornando a redução de E/S a prioridade central.",
  "incorrectFeedback": "Compare a velocidade de operações na CPU/RAM com o tempo necessário para ler ou gravar blocos em um disco."
}
```

```quiz
{
  "question": "Qual grupo de técnicas da ementa de AEDS II tem como objetivo específico reduzir o volume de bytes armazenados em arquivo?",
  "options": [
    { "text": "Força Bruta, Boyer-Moore e KMP.", "correct": false },
    { "text": "Run-Length Encoding (RLE), código de Huffman e LZW.", "correct": true },
    { "text": "Interpolação polifásica e acesso sequencial.", "correct": false }
  ],
  "correctFeedback": "Correto! RLE, Huffman e LZW são algoritmos clássicos de compressão de dados.",
  "incorrectFeedback": "Revise a lista de tópicos e identifique quais algoritmos atuam na compactação de arquivos."
}
```