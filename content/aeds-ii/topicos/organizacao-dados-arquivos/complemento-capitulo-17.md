## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Diferenciar armazenamento primário, secundário e terciário.
- Explicar o buffering duplo e o que é um cluster.
- Comparar os métodos de alocação de blocos (contígua, ligada, combinada e indexada).
- Descrever as operações Open, Reset, Find e Read.

## Conexão com a Trilha

Fechamos o tópico com um complemento do material de Banco de Dados II: a hierarquia de armazenamento, os buffers e a alocação de blocos. Ele mostra o que acontece por baixo do que vimos nas páginas anteriores e prepara o próximo tópico, sobre registros de tamanho fixo.

### Complemento: a hierarquia de armazenamento

- **Armazenamento primário:** é a memória que a CPU acessa diretamente. Inclui a *cache* (RAM estática, a mais cara) e a DRAM, chamada de memória principal. É rápida, mas pequena e **volátil**, isto é, perde o conteúdo quando falta energia.
- **Armazenamento secundário e terciário:** são os discos magnéticos, os discos ópticos (CD, DVD) e as fitas. Têm mais capacidade, custam menos, são mais lentos e **não são voláteis**. A CPU não processa esses dados diretamente. Eles precisam ser copiados para a memória primária. O disco rígido é secundário. A mídia removível (óptica e fita) é terciária.
- **Memória flash:** fica entre a DRAM e o disco magnético. Tem acesso rápido e usa a tecnologia EEPROM. Uma desvantagem é que um bloco inteiro precisa ser apagado e gravado de uma só vez.
- **Fita magnética:** é um dispositivo de acesso **sequencial**. Para chegar ao n-ésimo bloco é preciso passar pelos n − 1 anteriores. Os blocos costumam ser maiores que os do disco. A fita é muito usada em *backup*, por causa do custo.

### Complemento: buffers, cluster e buffering duplo

Um **buffer** é uma área contígua da memória principal que guarda um bloco. Em um comando de leitura, o bloco é copiado do disco para o buffer. Em um comando de gravação, o conteúdo do buffer é copiado para o bloco.

Às vezes vários blocos contíguos são transferidos como uma unidade só, chamada de **cluster**. Nesse caso, o buffer passa a ter o tamanho do cluster.

No **buffering duplo** usamos dois buffers, A e B. Enquanto a CPU processa o bloco que está em A, o controlador de E/S já está enchendo B com o próximo. Isso funciona em paralelo quando processar um bloco leva menos tempo que ler o seguinte. É mais útil quando existe um processador de E/S separado ou várias CPUs. Com blocos consecutivos, elimina o *seek* e a latência de todas as transferências, exceto a primeira.

### Complemento: como os blocos de um arquivo ficam no disco

| Alocação | Como funciona | Consequência |
|---|---|---|
| **Alocação contígua** | Os blocos do arquivo ocupam blocos consecutivos do disco | A leitura do arquivo inteiro é muito rápida, mas é difícil expandir |
| **Alocação ligada** | Cada bloco guarda um ponteiro para o próximo | É fácil expandir, mas a leitura é mais lenta |
| **Alocação combinada** | Clusters (segmentos ou extensões) de blocos consecutivos, ligados entre si | Mistura as duas vantagens |
| **Alocação indexada** | Blocos de índice guardam ponteiros para os blocos do arquivo | Dá acesso direto a qualquer bloco. Também se combinam as técnicas |

### Complemento: operações básicas em arquivos

- **Open:** prepara o arquivo para leitura ou gravação, reserva buffers (em geral pelo menos dois), lê o cabeçalho e coloca o ponteiro no início do arquivo.
- **Reset:** volta o ponteiro do arquivo aberto para o início.
- **Find** (ou *Locate*): procura o primeiro registro que satisfaz uma condição, traz o bloco dele para o buffer e o torna o registro atual.
- **Read** (ou *Get*): copia o registro atual do buffer para uma variável do programa. Pode também avançar para o próximo registro.

As operações de **recuperação** só localizam registros. As de **atualização** inserem, excluem ou modificam. Elas usam uma **condição de seleção**.

A condição simples compara igualdade, como `CPF = '12345678966'`. A condição complexa usa outros operadores e combinações, como `Salario > 30000 AND Departamento = 'Pesquisa'`. Nesse caso extraímos a condição simples e localizamos os registros que a satisfazem. Depois testamos a condição inteira em cada um deles.

## Código em C

O programa abaixo simula o buffering duplo com 5 blocos. O disco leva 2 unidades de tempo para entregar um bloco, e a CPU leva 1 unidade para processá-lo.

Clique em **Executar**. Repare que, enquanto a CPU processa um buffer, o disco já está enchendo o outro. No fim, o tempo total é 11, contra 15 sem o buffering duplo.

```codigo
{
  "title": "Buffering duplo passo a passo",
  "code": [
    "#include <stdio.h>",
    "",
    "#define BLOCOS 5",
    "#define T_LEITURA 2                /* tempo para o disco entregar um bloco */",
    "#define T_CPU 1                    /* tempo para a CPU processar um bloco */",
    "",
    "int main(void) {",
    "    int buffer[2] = {-1, -1};      /* bloco que está em cada buffer (A = 0, B = 1) */",
    "    int tempo = 0;",
    "",
    "    buffer[0] = 0;                 /* o primeiro bloco precisa ser lido antes de tudo */",
    "    tempo += T_LEITURA;",
    "    for (int i = 0; i < BLOCOS; i++) {",
    "        int outro = 1 - i % 2;     /* o buffer que não está sendo processado */",
    "        int passo = T_CPU;",
    "        if (i + 1 < BLOCOS) {",
    "            buffer[outro] = i + 1; /* o disco enche o outro buffer... */",
    "            if (T_LEITURA > passo) {",
    "                passo = T_LEITURA; /* ...enquanto a CPU processa o bloco i */",
    "            }",
    "        }",
    "        tempo += passo;",
    "    }",
    "    printf(\"com buffering duplo: %d, sem: %d\\n\", tempo, BLOCOS * (T_LEITURA + T_CPU));",
    "    printf(\"no fim: buffer A tem o bloco %d, buffer B tem o bloco %d\\n\", buffer[0], buffer[1]);",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 11,
      "caption": "Vamos ler 5 blocos. Cada bloco leva 2 unidades de tempo para o disco entregar e 1 unidade para a CPU processar. No buffering duplo há dois buffers, A e B. Cada bichinho é um bloco.",
      "vars": {"tempo": 0},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["·", "g", 0]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["·", "g", 0]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["0", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 13,
      "caption": "O bloco 0 foi lido para o buffer A. Nesse começo ninguém tem o que processar, então o tempo gasto até aqui é 2.",
      "vars": {"tempo": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["0", "", 2]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["·", "g", 0]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["2", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 16,
      "caption": "A CPU vai processar o bloco 0, que está no buffer A.",
      "vars": {"CPU processa": "bloco 0 (buffer A)", "i": 0, "tempo": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "c", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["0", "c", 2]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["·", "g", 0]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["2", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 17,
      "caption": "Ao mesmo tempo, o disco começa a encher o outro buffer (B) com o bloco 1. A CPU e o disco trabalham em paralelo.",
      "vars": {"CPU processa": "bloco 0 (buffer A)", "disco enche": "bloco 1 (buffer B)", "i": 0, "tempo": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "c", 2], ["1", "p", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["0", "c", 2]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["1", "p", 3]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["2", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 22,
      "caption": "A CPU precisa de 1 unidade e o disco precisa de 2. Como trabalham juntos, o passo dura o maior dos dois: 2. O tempo vai de 2 para 4.",
      "vars": {"CPU processa": "bloco 0 (buffer A)", "disco enche": "bloco 1 (buffer B)", "i": 0, "passo": 2, "tempo": 2},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "c", 2], ["1", "p", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["0", "c", 2]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["1", "", 3]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["2", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 16,
      "caption": "A CPU vai processar o bloco 1, que está no buffer B.",
      "vars": {"CPU processa": "bloco 1 (buffer B)", "i": 1, "tempo": 4},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "c", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["0", "", 2]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["1", "c", 3]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["4", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 17,
      "caption": "Ao mesmo tempo, o disco começa a encher o outro buffer (A) com o bloco 2. A CPU e o disco trabalham em paralelo.",
      "vars": {"CPU processa": "bloco 1 (buffer B)", "disco enche": "bloco 2 (buffer A)", "i": 1, "tempo": 4},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "c", 3], ["2", "p", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["2", "p", 4]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["1", "c", 3]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["4", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 22,
      "caption": "A CPU precisa de 1 unidade e o disco precisa de 2. Como trabalham juntos, o passo dura o maior dos dois: 2. O tempo vai de 4 para 6.",
      "vars": {"CPU processa": "bloco 1 (buffer B)", "disco enche": "bloco 2 (buffer A)", "i": 1, "passo": 2, "tempo": 4},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "c", 3], ["2", "p", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["2", "", 4]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["1", "c", 3]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["4", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 16,
      "caption": "A CPU vai processar o bloco 2, que está no buffer A.",
      "vars": {"CPU processa": "bloco 2 (buffer A)", "i": 2, "tempo": 6},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "c", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["2", "c", 4]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["1", "", 3]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["6", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 17,
      "caption": "Ao mesmo tempo, o disco começa a encher o outro buffer (B) com o bloco 3. A CPU e o disco trabalham em paralelo.",
      "vars": {"CPU processa": "bloco 2 (buffer A)", "disco enche": "bloco 3 (buffer B)", "i": 2, "tempo": 6},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "c", 4], ["3", "p", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["2", "c", 4]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "p", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["6", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 22,
      "caption": "A CPU precisa de 1 unidade e o disco precisa de 2. Como trabalham juntos, o passo dura o maior dos dois: 2. O tempo vai de 6 para 8.",
      "vars": {"CPU processa": "bloco 2 (buffer A)", "disco enche": "bloco 3 (buffer B)", "i": 2, "passo": 2, "tempo": 6},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "c", 4], ["3", "p", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["2", "c", 4]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["6", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 16,
      "caption": "A CPU vai processar o bloco 3, que está no buffer B.",
      "vars": {"CPU processa": "bloco 3 (buffer B)", "i": 3, "tempo": 8},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "c", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["2", "", 4]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "c", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["8", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 17,
      "caption": "Ao mesmo tempo, o disco começa a encher o outro buffer (A) com o bloco 4. A CPU e o disco trabalham em paralelo.",
      "vars": {"CPU processa": "bloco 3 (buffer B)", "disco enche": "bloco 4 (buffer A)", "i": 3, "tempo": 8},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "c", 5], ["4", "p", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["4", "p", 6]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "c", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["8", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 22,
      "caption": "A CPU precisa de 1 unidade e o disco precisa de 2. Como trabalham juntos, o passo dura o maior dos dois: 2. O tempo vai de 8 para 10.",
      "vars": {"CPU processa": "bloco 3 (buffer B)", "disco enche": "bloco 4 (buffer A)", "i": 3, "passo": 2, "tempo": 8},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "c", 5], ["4", "p", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["4", "", 6]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "c", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["8", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 16,
      "caption": "A CPU vai processar o bloco 4, que está no buffer A.",
      "vars": {"CPU processa": "bloco 4 (buffer A)", "i": 4, "tempo": 10},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5], ["4", "c", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["4", "c", 6]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["10", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 22,
      "caption": "Último bloco: não há mais nada para ler, só a CPU trabalha. Gasta 1 unidade. O tempo vai de 10 para 11.",
      "vars": {"CPU processa": "bloco 4 (buffer A)", "i": 4, "passo": 1, "tempo": 10},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5], ["4", "c", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["4", "c", 6]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["10", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    },
    {
      "line": 24,
      "caption": "Pronto: com buffering duplo, o tempo total foi 11. Sem ele, a CPU esperaria cada leitura terminar, e o total seria 5 × (2 + 1) = 15.",
      "vars": {"tempo": 11},
      "rows": [[{"s": 0, "n": 5, "i": [["0", "", 2], ["1", "", 3], ["2", "", 4], ["3", "", 5], ["4", "", 6]], "l": "blocos no disco"}], [{"s": 0, "n": 2, "i": [["4", "", 6]], "l": "buffer A"}, {"s": 3, "n": 2, "i": [["3", "", 5]], "l": "buffer B"}], [{"s": 0, "n": 5, "i": [["11", "", 5]], "l": "tempo gasto"}]],
      "stack": "main"
    }
  ]
}
```

## Teste rápido

```quiz
{
  "question": "Qual método de alocação de blocos facilita a expansão do arquivo, mas torna a leitura dele mais lenta?",
  "options": [
    {
      "text": "Alocação contígua",
      "correct": false
    },
    {
      "text": "Alocação ligada",
      "correct": true
    },
    {
      "text": "Nenhum: todos deixam a leitura rápida",
      "correct": false
    }
  ],
  "correctFeedback": "✅ Correto! Na alocação ligada cada bloco aponta para o próximo: expandir é fácil, mas a leitura segue os ponteiros e é mais lenta.",
  "incorrectFeedback": "❌ Ainda não. Na contígua é a expansão que é difícil. A que expande fácil e lê mais devagar é a ligada."
}
```

```quiz
{
  "question": "Qual afirmação sobre a fita magnética é verdadeira?",
  "options": [
    { "text": "Permite ir direto a qualquer bloco, como o disco", "correct": false },
    { "text": "É de acesso sequencial: para chegar ao n-ésimo bloco é preciso passar pelos n − 1 anteriores", "correct": true },
    { "text": "É memória volátil: perde o conteúdo quando falta energia", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Por isso a fita é muito usada em backup, em que se lê tudo em sequência.",
  "incorrectFeedback": "❌ Ainda não. A fita não é volátil e não permite acesso direto. Ela é um dispositivo sequencial."
}
```

