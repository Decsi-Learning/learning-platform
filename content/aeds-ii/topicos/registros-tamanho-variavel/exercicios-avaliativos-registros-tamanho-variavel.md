## Exercícios avaliativos — Registros de tamanho variável

Resolva os exercícios abaixo e abra o gabarito de cada um para conferir. Eles cobrem todas as páginas deste tópico.

## Exercícios com gabarito

```exercicio
{
  "title": "Exercício 1: contando bytes",
  "statement": "O registro tem três campos: 'Rui', 'Fisica' e 'Ouro Preto' (sem acentos, 1 byte por caractere). Quantos bytes ele ocupa em cada forma?\n\na) Separador ';' entre campos e '#' no fim do registro.\nb) Prefixo de 2 bytes no registro e ';' entre os campos.\nc) Prefixo de 1 byte em cada campo (3 campos, sem separadores).",
  "answer": "Tamanhos dos campos: Rui = 3, Fisica = 6, Ouro Preto = 10 (o espaço conta). Total de dados: 3 + 6 + 10 = 19.\n\na) 19 + 2 separadores de campo (;) + 1 delimitador de registro (#) = 22 bytes.\n\nb) 19 + 2 separadores (;) = 21 bytes de dados, mais 2 bytes de prefixo = 23 bytes.\n\nc) 19 + 3 prefixos de 1 byte = 22 bytes."
}
```

```exercicio
{
  "title": "Exercício 2: quanto se economiza",
  "statement": "Um arquivo de 1 000 000 de registros usa registros fixos de 100 bytes. Os dados reais ocupam, em média, 40 bytes por registro. Se o arquivo passar a usar registros variáveis com prefixo de 2 bytes, qual será o novo tamanho aproximado e qual a economia?",
  "answer": "Antes: 1 000 000 x 100 = 100 000 000 bytes (100 MB).\n\nDepois: cada registro ocupa em média 40 + 2 = 42 bytes. 1 000 000 x 42 = 42 000 000 bytes (42 MB).\n\nEconomia: 100 000 000 - 42 000 000 = 58 000 000 bytes (58 MB), ou 58% do tamanho original.\n\nO preço dessa economia: perdemos a conta direta com o RRN e a reutilização de espaço fica mais complexa."
}
```

```exercicio
{
  "title": "Exercício 3: o separador e o endereço",
  "statement": "Um arquivo usa ';' como separador de campos. Um dos registros tem o endereço 'Rua das Flores; apto 12'. O que acontece quando o programa lê esse registro? Proponha duas soluções.",
  "answer": "O programa vai interpretar o ';' dentro do endereço como separador e achar um campo a mais: 'Rua das Flores' e ' apto 12' viram campos separados. Todos os campos seguintes ficam deslocados e o registro é lido de forma errada.\n\nSoluções possíveis:\n1) Usar um separador que nunca aparece nos dados (por exemplo um caractere de controle) ou um caractere de escape ('\\;') para representar um ponto e vírgula que faz parte do texto.\n2) Usar prefixo de tamanho em cada campo: '[23]Rua das Flores; apto 12'. O programa lê exatamente 23 bytes e o conteúdo não importa."
}
```

```exercicio
{
  "title": "Exercício 4: lendo os bytes",
  "statement": "Um arquivo usa prefixo de 1 byte em cada campo. Seu conteúdo (com o prefixo entre colchetes) é:\n\n[3]Ana[5]Maria[4]Rita[6]Joaquim\n\nSe cada registro tem 2 campos (nome e apelido, nessa ordem), quais são os registros? Em qual byte começa o segundo registro? (Conte os prefixos como 1 byte cada.)",
  "answer": "Ler campo a campo: Ana (3), Maria (5), Rita (4), Joaquim (6). Com 2 campos por registro:\n\nRegistro 1: Ana, Maria.\nRegistro 2: Rita, Joaquim.\n\nO primeiro registro ocupa (1 + 3) + (1 + 5) = 10 bytes, então o segundo registro começa no byte 10 (contando a partir de 0)."
}
```

```exercicio
{
  "title": "Exercício 5: atualização que não cabe",
  "statement": "Em um arquivo de registros variáveis com prefixo de tamanho, um registro de 40 bytes de dados precisa ser atualizado e os dados novos têm 55 bytes. Descreva o que fazer. E se os dados novos tivessem 30 bytes?",
  "answer": "Com 55 bytes: o registro novo não cabe no espaço antigo (40 bytes). Gravamos o registro atualizado no fim do arquivo e marcamos o registro antigo como removido, deixando um buraco de 42 bytes (40 + 2 do prefixo). Se existe um índice de offsets, ele deve ser atualizado para apontar para a nova posição.\n\nCom 30 bytes: o registro cabe no lugar. Podemos regravá-lo no mesmo local e preencher a sobra de 10 bytes com algum marcador de espaço vago (ou manter o prefixo antigo e deixar a sobra dentro do registro). Esses 10 bytes são fragmentação interna: espaço desperdiçado dentro do registro."
}
```

```exercicio
{
  "title": "Exercício 6: keyword=value e código de tipo de campo",
  "statement": "Um registro tem nome = Rui, curso = Fisica e cidade = Mariana. Use ';' entre os campos e '#' no fim do registro.\n\na) Escreva o registro no formato keyword=value e conte os bytes.\nb) Escreva no formato com código do tipo de campo (1 = nome, 2 = curso, 3 = cidade) e conte os bytes.\nc) Qual formato gasta menos espaço? Qual é mais fácil de entender sem a documentação?",
  "answer": "a) nome=Rui;curso=Fisica;cidade=Mariana#\nContagem: nome=Rui (8) + ; (1) + curso=Fisica (12) + ; (1) + cidade=Mariana (14) + # (1) = 37 bytes.\n\nb) 1=Rui;2=Fisica;3=Mariana#\nContagem: 1=Rui (5) + ; (1) + 2=Fisica (8) + ; (1) + 3=Mariana (9) + # (1) = 25 bytes.\n\nc) O formato com código gasta menos (25 contra 37 bytes), porque o código é bem mais curto que o nome. O keyword=value é mais fácil de entender sozinho, pois o próprio arquivo diz o que é cada campo; com códigos é preciso ter a tabela de códigos (por exemplo, no cabeçalho)."
}
```

```exercicio
{
  "title": "Exercício 7: arquivo misto e BLOB",
  "statement": "Um sistema guarda, no mesmo arquivo, registros de alunos e registros de disciplinas. Cada aluno tem também uma foto de 200 KB.\n\na) Como o programa distingue um registro de aluno de um de disciplina?\nb) Como você guardaria as fotos? Por quê?",
  "answer": "a) É um arquivo misto. Cada registro começa com um código de tipo de registro (por exemplo, 1 para aluno e 2 para disciplina), e o cabeçalho do arquivo descreve esses códigos. O programa lê o código e interpreta o resto do registro de acordo com ele.\n\nb) A foto é um BLOB (objeto grande e não estruturado). Guardamos cada foto separadamente, em blocos de disco próprios, e o registro do aluno guarda só um ponteiro para ela. Assim os registros continuam pequenos e rápidos de percorrer, e o arquivo de registros não é inflado por 200 KB por aluno."
}
```
