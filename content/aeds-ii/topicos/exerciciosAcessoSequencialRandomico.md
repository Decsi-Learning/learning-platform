# Lista de Exercícios - Acesso Sequencial e Acesso Randômico

Resolva a Lista de Exercícios para avançar para a próxima etapa.

```quiz
{
  "question": "O que representa o ponteiro de arquivo (cursor ou file offset) mantido pelo Sistema Operacional quando um arquivo é aberto?",
  "options": [
    { "text": "O número inteiro que indica em qual byte do arquivo ocorrerá a próxima operação de leitura ou escrita.", "correct": true },
    { "text": "O endereço físico do setor de disco onde o cabeçalho do arquivo foi gravado.", "correct": false },
    { "text": "A quantidade total de registros válidos armazenados dentro do arquivo.", "correct": false }
  ],
  "correctFeedback": "Correto! O cursor (offset) aponta para o próximo byte a ser lido ou escrito e avança conforme as operações ocorrem.",
  "incorrectFeedback": "Releia 'O Ponteiro de Arquivo (Cursor)' na Seção 1."
}
```

```quiz
{
  "question": "No acesso sequencial, como o cursor se comporta e qual é a analogia clássica usada para explicar esse modelo?",
  "options": [
    { "text": "O cursor avança em ordem do início ao fim, como ler um caderno sem índice ou ouvir uma fita cassete.", "correct": true },
    { "text": "O cursor salta diretamente para qualquer byte por meio de cálculo de RRN, como abrir um livro em uma página específica.", "correct": false },
    { "text": "O cursor lê apenas os registros pares do arquivo até encontrar o EOF.", "correct": false }
  ],
  "correctFeedback": "Correto! No acesso sequencial, os registros são percorridos em ordem a partir do início até o alvo ou o EOF, sem saltos diretos.",
  "incorrectFeedback": "Revise a Seção 2 ('Acesso Sequencial') e compare com a analogia do livro/vetor da Seção 3."
}
```

```quiz
{
  "question": "Qual das opções a seguir descreve corretamente como o acesso sequencial lida com registros de tamanho variável?",
  "options": [
    { "text": "Funciona naturalmente com delimitadores (como ';' ou '\\n') ou indicadores de tamanho antes de cada registro, pois a leitura ocorre em ordem.", "correct": true },
    { "text": "Exige preencher todos os registros com espaços em branco até atingirem o maior tamanho possível.", "correct": false },
    { "text": "Não pode ser usado com registros de tamanho variável, sendo restrito a tamanho fixo.", "correct": false }
  ],
  "correctFeedback": "Correto! Como o programa lê em sequência, consegue identificar o fim/tamanho de cada registro variável sem precisar de padding obrigatório.",
  "incorrectFeedback": "Veja 'Compatibilidade com Tipos de Registro' na Seção 2."
}
```

```quiz
{
  "question": "Considerando um arquivo com N registros distribuídos em B blocos de disco, qual é o custo assintótico em operações de E/S (blocos) de um percurso completo (leitura de todo o arquivo) no acesso sequencial?",
  "options": [
    { "text": "O(B), pois cada um dos B blocos é lido uma única vez.", "correct": true },
    { "text": "O(1), independentemente do tamanho do arquivo em blocos.", "correct": false },
    { "text": "O(B^2), pois cada bloco precisa ser relido a cada novo registro.", "correct": false }
  ],
  "correctFeedback": "Correto! A varredura completa lê os B blocos do arquivo uma vez, resultando em custo O(B) em acessos a blocos de disco.",
  "incorrectFeedback": "Consulte a tabela 'Operações Principais e Custo em E/S' na Seção 2."
}
```

```quiz
{
  "question": "Um arquivo binário não possui cabeçalho (tamanho_cabecalho = 0) e armazena registros de tamanho fixo de 64 bytes (RRN começando em 0). Em qual byte começa o registro de RRN 5?",
  "options": [
    { "text": "320 bytes", "correct": true },
    { "text": "256 bytes", "correct": false },
    { "text": "384 bytes", "correct": false }
  ],
  "correctFeedback": "Correto! Sem cabeçalho, offset = RRN * tamanho_registro = 5 * 64 = 320 bytes.",
  "incorrectFeedback": "Aplique offset = tamanho_cabecalho + RRN * tamanho_registro com tamanho_cabecalho = 0 e RRN = 5."
}
```

```quiz
{
  "question": "Qual sequência de funções em C permite descobrir o tamanho total do arquivo em bytes para calcular a quantidade de registros de tamanho fixo em O(1)?",
  "options": [
    { "text": "fseek(fp, 0, SEEK_END) seguida de ftell(fp), dividindo o total de bytes pelo tamanho do registro.", "correct": true },
    { "text": "rewind(fp) seguida de fwrite, contando quantas vezes o cursor anda.", "correct": false },
    { "text": "ftell(fp) seguida de fseek(fp, 0, SEEK_CUR), sem dividir pelo tamanho do registro.", "correct": false }
  ],
  "correctFeedback": "Correto! Posicionar no final com SEEK_END e chamar ftell(fp) retorna o total de bytes, permitindo calcular o número de registros em O(1).",
  "incorrectFeedback": "Releia a 'Dica de AEDS 2' logo após a tabela de primitivas na Seção 3 e veja o Exemplo 3 na Seção 5."
}
```

```quiz
{
  "question": "Por que a pesquisa binária diretamente em arquivo atinge complexidade O(log n) em leituras de disco quando aplicada a um arquivo ordenado com registros de tamanho fixo?",
  "options": [
    { "text": "Porque calcula o índice médio, salta diretamente para o offset correspondente com fseek, lê 1 registro e descarta metade do intervalo a cada passo.", "correct": true },
    { "text": "Porque carrega o arquivo inteiro para a memória principal e ordena os registros antes de cada busca.", "correct": false },
    { "text": "Porque lê sequencialmente do início até a metade do arquivo em todas as iterações.", "correct": false }
  ],
  "correctFeedback": "Correto! O acesso randômico permite ir direto ao registro 'meio' em cada iteração, reduzindo o espaço de busca pela metade a cada comparação.",
  "incorrectFeedback": "Revise o item 2 ('Pesquisa Binária diretamente em Arquivo') na Seção 3 e o Exemplo 3 na Seção 5."
}
```

```quiz
{
  "question": "Em uma atualização in-place em arquivo de acesso randômico, o que permite sobrescrever um registro no mesmo local sem deslocar os demais registros?",
  "options": [
    { "text": "O fato de o registro ter tamanho fixo, mantendo o mesmo número de bytes após alterar os campos.", "correct": true },
    { "text": "O uso obrigatório de delimitadores '\\n' ao final de cada campo modificado.", "correct": false },
    { "text": "A criação automática de um arquivo temporário pelo modo de abertura 'r+b'.", "correct": false }
  ],
  "correctFeedback": "Correto! Como o tamanho do registro não muda em estruturas de tamanho fixo, ele cabe no mesmo espaço após reposicionar o cursor para o offset inicial do registro.",
  "incorrectFeedback": "Veja o item 3 ('Atualização in-place') na Seção 3 e a função atualizarNota na Seção 5."
}
```

```quiz
{
  "question": "Qual problema ocorre se você apagar fisicamente bytes do meio de um arquivo de registros de tamanho fixo usado com acesso randômico por RRN?",
  "options": [
    { "text": "Exige deslocar registros seguintes e altera os offsets/RRNs dos registros posteriores, quebrando referências por RRN.", "correct": true },
    { "text": "O arquivo passa a aceitar apenas leitura sequencial e bloqueia novas chamadas a fseek.", "correct": false },
    { "text": "O tamanho do cabeçalho é zerado automaticamente pelo sistema operacional.", "correct": false }
  ],
  "correctFeedback": "Correto! Deslocar bytes altera a posição dos registros seguintes e invalida os RRNs esperados, motivo pelo qual se usa remoção lógica (lápide).",
  "incorrectFeedback": "Leia o início do item 4 ('Remoção Lógica (Lápide / Tombstone)') na Seção 3."
}
```

```quiz
{
  "question": "Como funciona a estratégia de 'Lista de Espaços Livres' (Avail List) combinada à remoção lógica (lápide) em registros de tamanho fixo?",
  "options": [
    { "text": "Registra os RRNs liberados para que futuras inserções possam reutilizar esses espaços em O(1) em vez de apenas crescer o arquivo ao final.", "correct": true },
    { "text": "Compacta o arquivo inteiro após cada remoção individual para eliminar qualquer registro inativo.", "correct": false },
    { "text": "Converte registros removidos em registros de tamanho variável para economizar bytes.", "correct": false }
  ],
  "correctFeedback": "Correto! A avail list encadeia posições marcadas como removidas para reaproveitá-las em novas inserções em O(1), reduzindo desperdício de espaço.",
  "incorrectFeedback": "Revise o item 4 da Seção 3 e o Exercício 3 da Seção 7."
}
```