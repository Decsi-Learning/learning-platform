## Exercícios avaliativos — Registros de tamanho variável

Marque uma alternativa em cada uma das 10 questões. Elas cobrem todas as páginas deste tópico. O botão para avançar só libera depois que todas forem respondidas.

## Questões de marcar

```quiz
{
  "question": "O registro tem três campos: \"Rui\", \"Fisica\" e \"Ouro Preto\" (1 byte por caractere, o espaço conta). Quantos bytes ele ocupa com \";\" entre os campos e \"#\" no fim do registro?",
  "options": [
    {
      "text": "19 bytes",
      "correct": false
    },
    {
      "text": "22 bytes",
      "correct": true
    },
    {
      "text": "25 bytes",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! Os dados somam 3 + 6 + 10 = 19 bytes. Com 2 separadores (;) e 1 delimitador de registro (#), são 22.",
  "incorrectFeedback": "❌ Ainda não. Some os dados (3 + 6 + 10 = 19) e depois os 2 separadores de campo e o delimitador de registro: 19 + 3 = 22."
}
```

```quiz
{
  "question": "Com os mesmos dados (19 bytes), usando prefixo de 2 bytes no registro e \";\" entre os campos, quantos bytes ocupa o registro?",
  "options": [
    {
      "text": "21 bytes",
      "correct": false
    },
    {
      "text": "22 bytes",
      "correct": false
    },
    {
      "text": "23 bytes",
      "correct": true
    }
  ],
  "correctFeedback": "✅ Correto! Os dados com 2 separadores têm 19 + 2 = 21 bytes. Somando os 2 bytes do prefixo, são 23.",
  "incorrectFeedback": "❌ Ainda não. Dentro do registro há 2 separadores (21 bytes de dados). Falta somar os 2 bytes do prefixo."
}
```

```quiz
{
  "question": "Um arquivo tem 1 000 000 de registros fixos de 100 bytes, mas os dados ocupam em média 40 bytes. Com registros variáveis e prefixo de 2 bytes, qual é o tamanho aproximado do arquivo?",
  "options": [
    {
      "text": "42 MB",
      "correct": true
    },
    {
      "text": "40 MB",
      "correct": false
    },
    {
      "text": "58 MB",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! Cada registro passa a ocupar em média 40 + 2 = 42 bytes. São 42 milhões de bytes, uma economia de 58 MB.",
  "incorrectFeedback": "❌ Ainda não. Cada registro ocupa em média 40 bytes de dados mais 2 de prefixo, 42 bytes. Multiplique por 1 000 000. Os 58 MB são a economia, e não o novo tamanho."
}
```

```quiz
{
  "question": "Um arquivo usa \";\" como separador de campos e um registro tem o endereço \"Rua das Flores; apto 12\". O que acontece na leitura?",
  "options": [
    {
      "text": "O programa acha um campo a mais, e os campos seguintes ficam deslocados",
      "correct": true
    },
    {
      "text": "O programa lê o endereço certo, pois o espaço protege o \";\"",
      "correct": false
    },
    {
      "text": "O programa para de ler o arquivo e perde os registros anteriores",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! O \";\" dentro do endereço é tomado como separador, então \"Rua das Flores\" e \" apto 12\" viram dois campos.",
  "incorrectFeedback": "❌ Ainda não. O programa não olha o contexto: todo \";\" é separador. Isso parte o endereço em dois campos e desloca os seguintes."
}
```

```quiz
{
  "question": "Qual solução resolve o problema de um separador aparecer dentro dos dados?",
  "options": [
    {
      "text": "Trocar o \";\" por \",\", que nunca aparece em textos",
      "correct": false
    },
    {
      "text": "Gravar os campos sem nenhum separador nem prefixo",
      "correct": false
    },
    {
      "text": "Usar prefixo de tamanho em cada campo",
      "correct": true
    }
  ],
  "correctFeedback": "✅ Correto! Com o prefixo o programa lê exatamente os bytes indicados e nunca olha o conteúdo, então nenhum caractere dos dados atrapalha.",
  "incorrectFeedback": "❌ Ainda não. A vírgula também pode aparecer nos dados, e sem separador nem prefixo não há como achar o fim do campo. O prefixo de tamanho (ou um caractere de escape) resolve."
}
```

```quiz
{
  "question": "Um arquivo usa prefixo de 1 byte em cada campo: [3]Ana[5]Maria[4]Rita[6]Joaquim. Cada registro tem 2 campos. Em qual byte começa o segundo registro (contando a partir de 0)?",
  "options": [
    {
      "text": "No byte 8",
      "correct": false
    },
    {
      "text": "No byte 10",
      "correct": true
    },
    {
      "text": "No byte 12",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! O primeiro registro ocupa (1 + 3) + (1 + 5) = 10 bytes. Ele traz Ana e Maria. O segundo traz Rita e Joaquim.",
  "incorrectFeedback": "❌ Ainda não. Cada campo ocupa o prefixo (1 byte) mais os dados: (1 + 3) + (1 + 5) = 10 bytes. O segundo registro começa depois deles."
}
```

```quiz
{
  "question": "Um registro de 40 bytes de dados precisa ser atualizado e os dados novos têm 55 bytes. O que fazer?",
  "options": [
    {
      "text": "Gravar o registro novo no fim do arquivo e marcar o antigo como removido",
      "correct": true
    },
    {
      "text": "Gravar por cima do registro seguinte",
      "correct": false
    },
    {
      "text": "Gravar no mesmo lugar e cortar os 15 bytes que sobram",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! O registro antigo vira um buraco (42 bytes, com o prefixo). Se houver índice de offsets, ele passa a apontar para a nova posição.",
  "incorrectFeedback": "❌ Ainda não. Gravar por cima do vizinho destrói dados, e cortar os dados novos perde informação. O registro maior vai para o fim do arquivo."
}
```

```quiz
{
  "question": "Agora os dados novos têm só 30 bytes, em vez dos 40 do registro antigo. O que acontece?",
  "options": [
    {
      "text": "Precisam ir para o fim do arquivo, como no caso anterior",
      "correct": false
    },
    {
      "text": "Os registros seguintes andam 10 bytes para trás sozinhos",
      "correct": false
    },
    {
      "text": "Cabem no mesmo lugar, mas sobram 10 bytes (fragmentação interna)",
      "correct": true
    }
  ],
  "correctFeedback": "✅ Correto! Os 10 bytes sobrando dentro do registro são espaço desperdiçado, a fragmentação interna.",
  "incorrectFeedback": "❌ Ainda não. Um registro menor cabe no lugar do antigo. Os registros seguintes não se movem sozinhos, e a sobra de 10 bytes fica como espaço desperdiçado."
}
```

```quiz
{
  "question": "O registro nome = Rui, curso = Fisica, cidade = Mariana foi gravado em dois formatos: nome=Rui;curso=Fisica;cidade=Mariana# (37 bytes) e 1=Rui;2=Fisica;3=Mariana# (25 bytes). Qual afirmação é verdadeira?",
  "options": [
    {
      "text": "O formato com código gasta menos, mas precisa de uma tabela dos códigos",
      "correct": true
    },
    {
      "text": "O formato keyword=value gasta menos, porque repete os nomes",
      "correct": false
    },
    {
      "text": "Os dois gastam o mesmo, pois guardam os mesmos dados",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! O código é bem mais curto que o nome do campo. Em troca, é preciso guardar o significado dos códigos, por exemplo no cabeçalho.",
  "incorrectFeedback": "❌ Ainda não. Repetir o nome do campo em todo registro gasta mais espaço (37 contra 25 bytes). O keyword=value compensa por ser mais fácil de entender."
}
```

```quiz
{
  "question": "Cada aluno tem uma foto de 200 KB, e alunos e disciplinas ficam no mesmo arquivo. Como guardar as fotos?",
  "options": [
    {
      "text": "Dentro de cada registro de aluno, para ler tudo de uma vez",
      "correct": false
    },
    {
      "text": "Cada foto fica à parte, como BLOB, e o registro do aluno guarda só um ponteiro",
      "correct": true
    },
    {
      "text": "No cabeçalho do arquivo, antes dos registros",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! Assim os registros continuam pequenos e rápidos de percorrer. O código de tipo de registro continua separando alunos de disciplinas.",
  "incorrectFeedback": "❌ Ainda não. Uma foto de 200 KB dentro de cada registro deixaria o arquivo enorme e lento de percorrer. O BLOB fica em blocos próprios, e o registro guarda um ponteiro."
}
```
