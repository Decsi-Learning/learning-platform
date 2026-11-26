## Exercícios avaliativos — Registros de tamanho fixo

Escolha uma alternativa em cada exercício e clique em **Conferir resposta**: o site mostra na hora se você acertou ou errou. Quando você acerta, aparece também a resolução completa. Se errar, é só escolher outra alternativa e conferir de novo. Os exercícios cobrem todas as páginas deste tópico.

## Exercícios

### Exercício 1: onde começa o registro

```quiz
{
  "question": "Um arquivo tem cabeçalho de 8 bytes e registros de 70 bytes. Os RRN começam em zero. a) Em que byte começa o registro de RRN 0? b) E o de RRN 5? c) E o de RRN 199? d) Se o arquivo tem 200 registros, qual é o tamanho total dele?",
  "options": [
    {
      "text": "a) 0; b) 350; c) 13 930; d) 14 000 bytes",
      "correct": false
    },
    {
      "text": "a) 8; b) 358; c) 13 938; d) 14 008 bytes",
      "correct": true
    },
    {
      "text": "a) 0; b) 390; c) 15 522; d) 15 600 bytes",
      "correct": false
    },
    {
      "text": "a) 8; b) 358; c) 13 938; d) 14 000 bytes",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! Use offset = cabeçalho + RRN x tamanho. a) 8 + 0 x 70 = 8. b) 8 + 5 x 70 = 8 + 350 = 358. c) 8 + 199 x 70 = 8 + 13 930 = 13 938. d) 8 + 200 x 70 = 8 + 14 000 = 14 008 bytes. Repare que o registro de RRN 199 termina exatamente onde o arquivo termina: 13 938 + 70 = 14 008.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"RRN e acesso direto\"."
}
```

### Exercício 2: quantos registros tem o arquivo

```quiz
{
  "question": "Um programa abre um arquivo de registros fixos de 70 bytes, com cabeçalho de 4 bytes. Ele usa fseek para ir ao fim do arquivo e ftell devolve 7 004. Quantos registros o arquivo guarda? Qual é o RRN do último?",
  "options": [
    {
      "text": "100 registros; o último tem RRN 100.",
      "correct": false
    },
    {
      "text": "101 registros; o último tem RRN 100.",
      "correct": false
    },
    {
      "text": "100 registros; o último tem RRN 99.",
      "correct": true
    },
    {
      "text": "99 registros; o último tem RRN 98.",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! Quantidade = (tamanho do arquivo - cabeçalho) / tamanho do registro = (7 004 - 4) / 70 = 7 000 / 70 = 100 registros. Como o RRN começa em zero, o último registro tem RRN 99. Um registro novo, inserido no fim, receberia o RRN 100.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"RRN e acesso direto\"."
}
```

### Exercício 3: o sizeof surpreende

```quiz
{
  "question": "Considere a struct abaixo, com int de 4 bytes e alinhamento em múltiplos de 4: struct Item { char tipo; int codigo; char sigla[3]; }; a) Qual é a soma dos tamanhos dos campos? b) Qual será o sizeof(struct Item)? Explique. c) Reordene os campos para diminuir o tamanho.",
  "options": [
    {
      "text": "a) 8 bytes; b) 8 bytes, sem preenchimento; c) A ordem dos campos não altera o tamanho.",
      "correct": false
    },
    {
      "text": "a) 8 bytes; b) 11 bytes; c) int codigo; char tipo; char sigla[3];",
      "correct": false
    },
    {
      "text": "a) 8 bytes; b) 12 bytes; c) Não existe ordem que reduza o tamanho.",
      "correct": false
    },
    {
      "text": "a) 8 bytes; b) 12 bytes (3 de preenchimento depois de tipo e 1 no final); c) int codigo; char tipo; char sigla[3]; (sizeof 8)",
      "correct": true
    }
  ],
  "correctFeedback": "✅ Correto! a) 1 + 4 + 3 = 8 bytes. b) O sizeof é 12 bytes. O compilador coloca 3 bytes de preenchimento depois de tipo, para que o int comece em um endereço múltiplo de 4. Depois de sigla, mais 1 byte de preenchimento completa o tamanho para um múltiplo de 4, que é o alinhamento da struct. c) Colocando o int primeiro: int codigo; char tipo; char sigla[3]; Os campos somam 4 + 1 + 3 = 8 bytes, já alinhados, e o sizeof fica 8. Em um arquivo com milhões de registros, essa diferença de 4 bytes por registro importa.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"Campos e registros fixos\"."
}
```

### Exercício 4: blocagem

```quiz
{
  "question": "Os blocos do disco têm 2 048 bytes e os registros têm 100 bytes. O arquivo tem 10 000 registros. Na organização NÃO espalhada, calcule: a) o fator de bloco; b) a sobra em cada bloco; c) o número de blocos; d) quantos bytes são desperdiçados em sobras (considere todos os blocos cheios). E na organização espalhada, de quantos blocos o arquivo precisa?",
  "options": [
    {
      "text": "a) 20 registros por bloco; b) 48 bytes de sobra por bloco; c) 500 blocos; d) 24 000 bytes de sobra; Espalhada: 489 blocos",
      "correct": true
    },
    {
      "text": "a) 20 registros por bloco; b) 48 bytes de sobra por bloco; c) 500 blocos; d) 24 000 bytes de sobra; Espalhada: 500 blocos",
      "correct": false
    },
    {
      "text": "a) 20 registros por bloco; b) 48 bytes de sobra por bloco; c) 489 blocos; d) 23 472 bytes de sobra; Espalhada: 489 blocos",
      "correct": false
    },
    {
      "text": "a) 20 registros por bloco; b) 48 bytes de sobra por bloco; c) 500 blocos; d) 48 bytes de sobra; Espalhada: 489 blocos",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! a) Fator de bloco = 2 048 / 100 = 20 (divisão inteira). b) Sobra = 2 048 - 20 x 100 = 48 bytes por bloco. c) Blocos = 10 000 / 20 = 500 blocos. d) 500 x 48 = 24 000 bytes de sobra, cerca de 2,3% do espaço ocupado (500 x 2 048 = 1 024 000 bytes para 1 000 000 de bytes de dados). Na organização espalhada não há sobra entre registros: 1 000 000 / 2 048 = 488,3, então o arquivo ocupa 489 blocos. A economia de 11 blocos custa o fato de alguns registros ficarem divididos entre dois blocos, o que exige duas leituras.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"Blocos, fragmentação e limites\"."
}
```

### Exercício 5: fragmentação interna

```quiz
{
  "question": "Um cadastro tem 50 000 registros. O campo nome tem 40 bytes e os nomes têm, em média, 12 caracteres. O campo curso tem 20 bytes e os cursos têm, em média, 9 caracteres. a) Quantos bytes são desperdiçados por registro nesses dois campos? b) Quantos bytes são desperdiçados no arquivo todo? c) O que você poderia fazer para reduzir esse desperdício?",
  "options": [
    {
      "text": "a) 21 bytes por registro; b) 1 050 000 bytes no arquivo; c) Reduzir o tamanho dos campos ou usar registros variáveis.",
      "correct": false
    },
    {
      "text": "a) 39 bytes por registro; b) 1 950 000 bytes no arquivo; c) Aumentar o tamanho dos campos para caber nomes mais longos.",
      "correct": false
    },
    {
      "text": "a) 39 bytes por registro; b) 1 950 000 bytes no arquivo; c) Reduzir o tamanho dos campos ou usar registros variáveis.",
      "correct": true
    },
    {
      "text": "a) 39 bytes por registro; b) 195 000 bytes no arquivo; c) Reduzir o tamanho dos campos ou usar registros variáveis.",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! a) nome: 40 - 12 = 28 bytes. curso: 20 - 9 = 11 bytes. Total: 28 + 11 = 39 bytes por registro. b) 39 x 50 000 = 1 950 000 bytes, cerca de 1,95 MB. c) Reduzir o tamanho dos campos para perto do maior valor realmente esperado (sem cortar dados), ou, se os tamanhos variam muito, passar para registros de tamanho variável, assunto do próximo tópico.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"Blocos, fragmentação e limites\"."
}
```

### Exercício 6: atualizando um registro

```quiz
{
  "question": "Um arquivo tem cabeçalho de 16 bytes e registros de 64 bytes. Descreva, em passos, como atualizar o registro de RRN 7. Em que byte ele começa? É preciso mover algum outro registro?",
  "options": [
    {
      "text": "Offset = 7 × 64 = 448; fseek(f, 448, SEEK_SET) e fwrite dos 64 bytes. Nenhum outro registro é movido.",
      "correct": false
    },
    {
      "text": "Offset = 16 + 7 × 64 = 464; fseek(f, 464, SEEK_SET) e fwrite dos 64 bytes. Nenhum outro registro é movido.",
      "correct": true
    },
    {
      "text": "Offset = 16 + 7 × 64 = 464; fseek, fwrite e depois deslocar os registros seguintes para acomodar o novo.",
      "correct": false
    },
    {
      "text": "Offset = 16 + 8 × 64 = 528; fseek(f, 528, SEEK_SET) e fwrite dos 64 bytes.",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! 1) Ler o registro de RRN 7 para uma variável (opcional, se for alterar só alguns campos). 2) Calcular o offset: 16 + 7 x 64 = 16 + 448 = 464. 3) Posicionar com fseek(f, 464, SEEK_SET). 4) Gravar os 64 bytes com fwrite(&registro, 64, 1, f) por cima do registro antigo. Não é preciso mover nenhum outro registro, porque o registro novo tem o mesmo tamanho do antigo e ocupa exatamente o mesmo espaço.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"RRN e acesso direto\"."
}
```

### Exercício 7: busca binária e RRN

```quiz
{
  "question": "Um arquivo de registros fixos, ordenado pela matrícula, tem 1 000 000 de registros. Quantas leituras de registro, no máximo, a busca binária faz para achar uma matrícula? Compare com a busca sequencial. Por que a busca binária só funciona bem porque o tamanho é fixo?",
  "options": [
    {
      "text": "Cerca de 1 000 leituras, a raiz quadrada de 1 000 000. A busca sequencial faria 500 000 em média.",
      "correct": false
    },
    {
      "text": "Cerca de 20 leituras. Funciona do mesmo jeito com registros fixos ou variáveis.",
      "correct": false
    },
    {
      "text": "Cerca de 500 000 leituras, igual à sequencial. O tamanho fixo não faz diferença.",
      "correct": false
    },
    {
      "text": "Cerca de 20 leituras, contra 500 000 em média na sequencial. Só funciona porque o RRN dá o offset do registro do meio: cabeçalho + RRN × tamanho.",
      "correct": true
    }
  ],
  "correctFeedback": "✅ Correto! A busca binária divide o intervalo ao meio a cada leitura. Como 2 elevado a 20 vale 1 048 576, bastam cerca de 20 leituras. Na busca sequencial seriam, em média, uns 500 000 registros lidos, e no pior caso 1 000 000. A busca binária precisa ir direto ao registro do meio do intervalo, e isso é o acesso por RRN: offset = cabeçalho + RRN x tamanho. Com registros de tamanho variável essa conta não existe, e a busca binária não pode pular direto para o meio.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"RRN e acesso direto\"."
}
```

### Exercício 8: fixo ou variável?

```quiz
{
  "question": "Para cada situação, diga se registros de tamanho fixo são uma boa escolha e justifique. a) Um arquivo de leituras de sensor, cada uma com data, hora e valor numérico. b) Um arquivo de comentários de usuários, de 0 a 5 000 caracteres. c) Um cadastro de alunos com matrícula, nome, curso e cidade.",
  "options": [
    {
      "text": "a) Sim; b) Não; c) Depende: serve se os campos forem bem dimensionados.",
      "correct": true
    },
    {
      "text": "a) Sim; b) Sim; c) Sim, sempre",
      "correct": false
    },
    {
      "text": "a) Não; b) Não; c) Não",
      "correct": false
    },
    {
      "text": "a) Sim; b) Não; c) Não, nunca",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! a) Sim. Data, hora e valor têm tamanho conhecido e igual em todos os registros. Quase não há fragmentação interna, e o acesso por RRN é simples. b) Não. O tamanho do comentário varia de 0 a 5 000 bytes. Reservar 5 000 bytes para todos desperdiçaria quase tudo na maioria dos registros. Registros de tamanho variável (ou um BLOB guardado à parte) são melhores. c) Depende. A matrícula tem tamanho fixo. Nome, curso e cidade variam pouco, e com campos bem dimensionados o desperdício é aceitável. Vale pela simplicidade e pelo acesso direto, desde que os campos de texto não variem muito de tamanho.",
  "incorrectFeedback": "❌ Ainda não. Releia o enunciado com calma e tente outra alternativa. Se precisar, revise a página \"Blocos, fragmentação e limites\"."
}
```
