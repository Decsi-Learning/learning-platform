# Lista de Exercícios - Arquivos

Resolva a Lista de Exercícios para avançar para a próxima etapa.

```quiz
{
  "question": "Qual é a diferença entre a Visão Lógica e a Visão Física de um arquivo?",
  "options": [
    { "text": "Na visão lógica o arquivo é uma sequência contínua de bytes (do byte 0 ao EOF); na visão física ele é fatiado em blocos que podem estar espalhados pelo disco.", "correct": true },
    { "text": "Na visão lógica o arquivo é dividido em blocos de 4 KB; na visão física é uma sequência contínua de bytes.", "correct": false },
    { "text": "A visão lógica existe apenas em arquivos de texto e a física apenas em arquivos binários.", "correct": false }
  ],
  "correctFeedback": "Correto! O programador enxerga uma fita linear de bytes, enquanto o hardware armazena blocos possivelmente dispersos.",
  "incorrectFeedback": "Releia a Seção 1 (Visão Lógica vs. Visão Física)."
}
```

```quiz
{
  "question": "Qual componente é responsável por traduzir a Visão Lógica (bytes pedidos pelo programa) para a Visão Física (blocos no disco)?",
  "options": [
    { "text": "O Sistema Operacional, por meio do Sistema de Arquivos (como NTFS, ext4 ou APFS).", "correct": true },
    { "text": "O próprio programa do usuário, calculando o setor físico de cada byte.", "correct": false },
    { "text": "O buffer da memória RAM, que decide em qual trilha gravar os dados.", "correct": false }
  ],
  "correctFeedback": "Correto! O Sistema de Arquivos do SO faz a tradução entre bytes lógicos e blocos físicos.",
  "incorrectFeedback": "Veja a Seção 1.3 (O Papel do Sistema Operacional e do Sistema de Arquivos)."
}
```

```quiz
{
  "question": "Uma variável `int x = 123456789;` (4 bytes na RAM) é salva em um arquivo de texto e em um arquivo binário. Quantos bytes ela ocupa em cada um, respectivamente?",
  "options": [
    { "text": "9 bytes no arquivo de texto e 4 bytes no arquivo binário.", "correct": true },
    { "text": "4 bytes no arquivo de texto e 9 bytes no arquivo binário.", "correct": false },
    { "text": "9 bytes em ambos, pois o número possui 9 dígitos.", "correct": false }
  ],
  "correctFeedback": "Correto! No texto cada dígito é um caractere de 1 byte (9 bytes); no binário os bytes da variável são copiados diretamente (4 bytes).",
  "incorrectFeedback": "Revise o exemplo prático da Seção 2.1."
}
```

```quiz
{
  "question": "Por que arquivos binários são o padrão em AEDS 2 quando se deseja acesso direto aos registros?",
  "options": [
    { "text": "Porque têm tamanho previsível e sem conversão texto-número, facilitando calcular a posição exata de cada registro e copiando bytes diretamente entre RAM e disco.", "correct": true },
    { "text": "Porque podem ser lidos facilmente em qualquer editor de texto.", "correct": false },
    { "text": "Porque ocupam mais espaço, o que aumenta o fator de bloco.", "correct": false }
  ],
  "correctFeedback": "Correto! Economia de espaço, zero custo de conversão (fread/fwrite) e tamanho previsível são as vantagens.",
  "incorrectFeedback": "Veja a Seção 2.2 (Por que arquivos binários são o padrão em AEDS 2?)."
}
```

```quiz
{
  "question": "Uma struct de 64 bytes na RAM é gravada com fwrite em um arquivo binário. Quantos bytes ela ocupará no arquivo e qual a consequência prática?",
  "options": [
    { "text": "Exatamente 64 bytes, o que permite pular instantaneamente para qualquer registro calculando seu offset.", "correct": true },
    { "text": "Um tamanho variável, dependendo dos valores dos campos, exigindo leitura sequencial.", "correct": false },
    { "text": "128 bytes, pois o arquivo duplica a struct para segurança.", "correct": false }
  ],
  "correctFeedback": "Correto! O tamanho no arquivo binário é idêntico ao da RAM, tornando o acesso direto trivial.",
  "incorrectFeedback": "Releia o item 3 (Tamanho Previsível) da Seção 2.2."
}
```

```quiz
{
  "question": "Qual estratégia de alocação de blocos funciona como uma lista encadeada, mas é péssima para acesso direto?",
  "options": [
    { "text": "Alocação Encadeada, pois para chegar ao 50º bloco é preciso ler os 49 anteriores seguindo os ponteiros.", "correct": true },
    { "text": "Alocação Contígua, pois os blocos ficam sempre espalhados.", "correct": false },
    { "text": "Alocação Indexada, pois o bloco de índice precisa ser percorrido byte a byte.", "correct": false }
  ],
  "correctFeedback": "Correto! Na alocação encadeada cada bloco aponta para o próximo, tornando o acesso direto lento.",
  "incorrectFeedback": "Veja a Seção 3.2 (Alocação Encadeada)."
}
```

```quiz
{
  "question": "Qual é a principal desvantagem da Alocação Contígua de arquivos no disco?",
  "options": [
    { "text": "Gera fragmentação externa e dificulta o crescimento do arquivo se houver outro arquivo logo à frente.", "correct": true },
    { "text": "Possui alto tempo de seek, pois os blocos ficam distantes entre si.", "correct": false },
    { "text": "Não permite acesso sequencial.", "correct": false }
  ],
  "correctFeedback": "Correto! Apesar de muito rápida, a alocação contígua sofre com fragmentação externa e dificuldade de crescimento.",
  "incorrectFeedback": "Revise a Seção 3.1 (Alocação Contígua)."
}
```

```quiz
{
  "question": "Qual alocação combina acesso direto rápido e ausência de fragmentação externa, sendo base dos sistemas de arquivos modernos e das Árvores B?",
  "options": [
    { "text": "Alocação Indexada, que usa um bloco de índice com os ponteiros para todos os blocos de dados.", "correct": true },
    { "text": "Alocação Encadeada, que guarda um ponteiro ao final de cada bloco.", "correct": false },
    { "text": "Alocação Contígua, que guarda os blocos lado a lado.", "correct": false }
  ],
  "correctFeedback": "Correto! O bloco de índice funciona como um sumário (vetor de ponteiros) dos blocos do arquivo.",
  "incorrectFeedback": "Veja a Seção 3.3 (Alocação Indexada)."
}
```

```quiz
{
  "question": "Qual é a função do Cabeçalho (File Header) no início de um arquivo de dados?",
  "options": [
    { "text": "Guardar metadados (como quantidade de registros, topo da lista de removidos, assinatura/versão e status de consistência) para gerenciar o arquivo sem lê-lo inteiro.", "correct": true },
    { "text": "Armazenar o primeiro registro de dados do arquivo para acelerar sua leitura.", "correct": false },
    { "text": "Substituir o Sistema de Arquivos na tradução entre visão lógica e física.", "correct": false }
  ],
  "correctFeedback": "Correto! O cabeçalho guarda metadados essenciais ao gerenciamento do arquivo.",
  "incorrectFeedback": "Releia a Seção 4 (Cabeçalho de Arquivo)."
}
```

```quiz
{
  "question": "Para que serve a assinatura (Magic Number) armazenada nos primeiros bytes de um arquivo?",
  "options": [
    { "text": "Identificar o formato real do arquivo, independentemente de alguém ter mudado seu nome ou extensão.", "correct": true },
    { "text": "Contar quantos registros ativos existem no arquivo.", "correct": false },
    { "text": "Indicar o endereço do primeiro espaço livre para reaproveitamento.", "correct": false }
  ],
  "correctFeedback": "Correto! É assim que o sistema sabe que um arquivo é de fato um .pdf ou .png.",
  "incorrectFeedback": "Veja a lista 'O que geralmente colocamos no Cabeçalho?' na Seção 4."
}
```

```quiz
{
  "question": "Qual é a utilidade de uma flag de 'Status de Consistência' no cabeçalho do arquivo?",
  "options": [
    { "text": "Indicar se o arquivo foi fechado corretamente na última vez ou se o programa travou no meio de uma escrita.", "correct": true },
    { "text": "Informar o tamanho total de cada registro de dados.", "correct": false },
    { "text": "Definir se o arquivo é de texto ou binário.", "correct": false }
  ],
  "correctFeedback": "Correto! Ela permite detectar um arquivo possivelmente corrompido por falha durante escrita.",
  "incorrectFeedback": "Revise a Seção 4, item 'Status de Consistência'."
}
```

```quiz
{
  "question": "O que acontece ao abrir (open) um arquivo e qual recurso é alocado na memória RAM nessa operação?",
  "options": [
    { "text": "Abre-se um canal de comunicação (stream) com o arquivo e aloca-se um buffer na RAM.", "correct": true },
    { "text": "O arquivo inteiro é copiado para a RAM e fechado no disco.", "correct": false },
    { "text": "O arquivo é recriado do zero, apagando seu conteúdo anterior.", "correct": false }
  ],
  "correctFeedback": "Correto! A abertura cria a stream e um buffer para reduzir viagens ao disco.",
  "incorrectFeedback": "Veja a Seção 5.1 (Operações de Controle e Gerenciamento)."
}
```

```quiz
{
  "question": "Por que a operação close()/flush é considerada crítica?",
  "options": [
    { "text": "Porque descarrega os dados pendentes do buffer na RAM para o disco físico e libera o arquivo.", "correct": true },
    { "text": "Porque apaga o buffer para liberar memória, sem gravar nada no disco.", "correct": false },
    { "text": "Porque converte o arquivo binário em texto antes de salvá-lo.", "correct": false }
  ],
  "correctFeedback": "Correto! Sem o close/flush, dados retidos no buffer podem ser perdidos.",
  "incorrectFeedback": "Releia o item 'Fechamento (close / flush)' na Seção 5.1."
}
```

```quiz
{
  "question": "Qual operação de CRUD permite sobrescrever um registro no próprio lugar (in-place) e sob qual condição?",
  "options": [
    { "text": "Atualização (update), desde que o registro mantenha o mesmo tamanho em bytes.", "correct": true },
    { "text": "Remoção (remove), desde que o arquivo esteja ordenado.", "correct": false },
    { "text": "Criação (create), desde que o cabeçalho esteja vazio.", "correct": false }
  ],
  "correctFeedback": "Correto! Com o mesmo tamanho, o novo registro cabe exatamente no espaço do anterior.",
  "incorrectFeedback": "Veja a Seção 5.2 (Operações de Manipulação de Conteúdo)."
}
```

```quiz
{
  "question": "Por que a remoção de registros é geralmente feita de forma lógica em vez de física?",
  "options": [
    { "text": "Para evitar reescrever todo o arquivo: o espaço é apenas marcado como livre e pode ser reaproveitado.", "correct": true },
    { "text": "Porque o Sistema Operacional proíbe apagar bytes de arquivos binários.", "correct": false },
    { "text": "Porque a remoção lógica reduz imediatamente o tamanho do arquivo em disco.", "correct": false }
  ],
  "correctFeedback": "Correto! A remoção lógica é barata e deixa o espaço disponível para reaproveitamento.",
  "incorrectFeedback": "Revise o item 'Remoção (remove)' na Seção 5.2."
}
```

```quiz
{
  "question": "Qual operação de navegação move o cursor diretamente para um byte específico, sendo a base do Acesso Randômico?",
  "options": [
    { "text": "Posicionamento (seek).", "correct": true },
    { "text": "Compactação.", "correct": false },
    { "text": "Ordenação Externa.", "correct": false }
  ],
  "correctFeedback": "Correto! O seek posiciona o cursor em qualquer byte sem percorrer o arquivo.",
  "incorrectFeedback": "Veja a Seção 5.3 (Operações de Navegação e Manutenção)."
}
```

```quiz
{
  "question": "Qual técnica permite ordenar arquivos de 100 GB usando apenas alguns megabytes de RAM?",
  "options": [
    { "text": "Ordenação Externa, como o MergeSort Externo.", "correct": true },
    { "text": "Carregar todo o arquivo na RAM e aplicar QuickSort.", "correct": false },
    { "text": "Compactação do arquivo antes da leitura.", "correct": false }
  ],
  "correctFeedback": "Correto! Algoritmos de ordenação externa trabalham em partes do arquivo, combinando-as depois.",
  "incorrectFeedback": "Revise o item 'Ordenação Externa (Sort)' na Seção 5.3."
}
```
