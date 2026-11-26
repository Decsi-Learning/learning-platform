## Exercícios avaliativos — Organização de dados em arquivos

Marque uma alternativa em cada uma das 10 questões. Elas cobrem todas as páginas deste tópico. O botão para avançar só libera depois que todas forem respondidas.

## Questões de marcar

```quiz
{
  "question": "Uma biblioteca guarda, para cada livro, o código, o título, o autor e o ano, todos em um único arquivo. Qual campo é a melhor chave?",
  "options": [
    { "text": "O título, que identifica o livro", "correct": false },
    { "text": "O código, que é diferente para cada livro", "correct": true },
    { "text": "O autor, que aparece em todos os livros dele", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Uma chave deve identificar o registro de forma única. Título e autor podem se repetir, e o código não.",
  "incorrectFeedback": "❌ Ainda não. Título e autor podem se repetir (dois livros com o mesmo título, um autor com vários livros). A chave precisa ser única."
}
```

```quiz
{
  "question": "Um arquivo tem 2000 registros e cada bloco do disco comporta 8 registros. Quantos blocos o arquivo ocupa?",
  "options": [
    { "text": "200 blocos", "correct": false },
    { "text": "16 000 blocos", "correct": false },
    { "text": "250 blocos", "correct": true }
  ],
  "correctFeedback": "✅ Correto! 2000 / 8 = 250 blocos.",
  "incorrectFeedback": "❌ Ainda não. Divida o número de registros pelo número de registros por bloco: 2000 / 8 = 250."
}
```

```quiz
{
  "question": "Nesse mesmo arquivo (250 blocos), uma busca sequencial por um registro que existe, com qualquer posição igualmente provável, faz em média quantos acessos?",
  "options": [
    { "text": "Cerca de 125", "correct": true },
    { "text": "250, o pior caso", "correct": false },
    { "text": "Apenas 1", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Em média o registro está no meio do arquivo: cerca de 250 / 2 = 125 acessos.",
  "incorrectFeedback": "❌ Ainda não. 250 acessos é o pior caso (registro no último bloco). Em média, o registro está no meio do arquivo."
}
```

```quiz
{
  "question": "O número 123456789 é guardado em um arquivo de texto (1 byte por dígito) e em um arquivo binário (inteiro de 4 bytes). Quantos bytes ocupa em cada um?",
  "options": [
    { "text": "4 bytes em texto e 9 bytes em binário", "correct": false },
    { "text": "9 bytes em texto e 4 bytes em binário", "correct": true },
    { "text": "9 bytes nos dois", "correct": false }
  ],
  "correctFeedback": "✅ Correto! São 9 dígitos de 1 byte cada. Em binário cabe em um inteiro de 32 bits, que usa 4 bytes.",
  "incorrectFeedback": "❌ Ainda não. No texto, cada dígito é um caractere de 1 byte (9 bytes). No binário, o número cabe em um inteiro de 4 bytes."
}
```

```quiz
{
  "question": "Um arquivo binário tem registros de 100 bytes e um cabeçalho com o tamanho do registro e a quantidade de registros. O que pode dar errado se o cabeçalho for apagado?",
  "options": [
    { "text": "Nada: o programa descobre sozinho o tamanho do registro", "correct": false },
    { "text": "O arquivo deixa de existir no disco", "correct": false },
    { "text": "O programa não sabe onde os registros começam nem o tamanho deles, e pode misturar campos de registros diferentes", "correct": true }
  ],
  "correctFeedback": "✅ Correto! Sem o cabeçalho, supor um tamanho errado corta os registros no lugar errado e produz dados sem sentido.",
  "incorrectFeedback": "❌ Ainda não. Os bytes continuam no disco, mas sem o cabeçalho o programa não sabe como dividi-los em registros."
}
```

```quiz
{
  "question": "Um sistema consulta o cadastro de clientes pelo CPF milhares de vezes por dia. Qual organização é mais adequada?",
  "options": [
    { "text": "Sequencial, lendo o arquivo inteiro a cada consulta", "correct": false },
    { "text": "Indexada ou hash, para chegar ao registro com poucos acessos", "correct": true },
    { "text": "Sequencial, porque é a mais simples de programar", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Cada consulta busca um único registro pela chave. Um índice ou uma função hash evitam percorrer o arquivo todo.",
  "incorrectFeedback": "❌ Ainda não. Percorrer o arquivo inteiro a cada consulta seria caro demais. A organização sequencial serve melhor quando todos os registros serão lidos."
}
```

```quiz
{
  "question": "Os blocos do disco têm 1024 bytes e os registros têm 100 bytes (organização não espalhada). Qual é o fator de blocagem e quanto sobra em cada bloco?",
  "options": [
    { "text": "10 registros por bloco e 24 bytes de sobra", "correct": true },
    { "text": "11 registros por bloco, sem sobra", "correct": false },
    { "text": "10 registros por bloco e 100 bytes de sobra", "correct": false }
  ],
  "correctFeedback": "✅ Correto! bfr = ⌊1024 / 100⌋ = 10. Dez registros ocupam 1000 bytes, e sobram 1024 − 1000 = 24 bytes.",
  "incorrectFeedback": "❌ Ainda não. O fator de blocagem arredonda para baixo: ⌊1024 / 100⌋ = 10. A sobra é 1024 − 10 × 100 = 24 bytes."
}
```

```quiz
{
  "question": "Os blocos têm 1000 bytes, os registros têm 300 bytes e o arquivo tem 1000 registros. Quantos blocos ele ocupa na organização não espalhada?",
  "options": [
    { "text": "300 blocos", "correct": false },
    { "text": "1000 blocos", "correct": false },
    { "text": "334 blocos", "correct": true }
  ],
  "correctFeedback": "✅ Correto! bfr = ⌊1000 / 300⌋ = 3 registros por bloco, e ⌈1000 / 3⌉ = 334 blocos. Na espalhada seriam 300 blocos.",
  "incorrectFeedback": "❌ Ainda não. 300 blocos é o resultado da organização espalhada. Na não espalhada, cabem só 3 registros por bloco: ⌈1000 / 3⌉ = 334."
}
```

```quiz
{
  "question": "A regra da forma canônica é \"letras maiúsculas\". Qual é a forma canônica de \"ana souza\" e por que ela é necessária?",
  "options": [
    { "text": "ana souza; a forma canônica não altera a chave", "correct": false },
    { "text": "ANA SOUZA; sem ela, \"ana souza\" e \"ANA SOUZA\" seriam chaves diferentes e a pesquisa falharia", "correct": true },
    { "text": "Ana Souza; serve só para o nome ficar mais bonito na tela", "correct": false }
  ],
  "correctFeedback": "✅ Correto! A chave é convertida para a forma canônica antes da pesquisa, e o arquivo também a guarda assim.",
  "incorrectFeedback": "❌ Ainda não. A forma canônica aplica a regra (aqui, maiúsculas). Sem ela, a mesma chave escrita de jeitos diferentes não seria encontrada."
}
```

```quiz
{
  "question": "Precisamos pular direto para o k-ésimo registro de um arquivo cujos registros têm tamanhos diferentes. O que usar?",
  "options": [
    { "text": "Um índice com o byte offset de cada registro", "correct": true },
    { "text": "A conta cabeçalho + RRN × tamanho do registro", "correct": false },
    { "text": "Uma busca sequencial, porque os tamanhos variam", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Com tamanho variável não há fórmula com RRN, mas o índice diz em que byte cada registro começa.",
  "incorrectFeedback": "❌ Ainda não. A conta com RRN exige registros do mesmo tamanho. A busca sequencial funciona, mas não pula direto ao registro. O índice de offsets resolve."
}
```
