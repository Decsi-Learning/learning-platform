## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar como a lista de espaços livres permite reaproveitar os registros removidos.
- Aplicar first-fit, best-fit e worst-fit a uma lista de vagas.
- Diferenciar fragmentação interna de fragmentação externa.
- Descrever como combater a fragmentação, incluindo a compactação.

## Conexão com a Trilha

Voltamos ao problema que ficou aberto no tópico de registros de tamanho variável: o que fazer com os buracos deixados pelos registros removidos. Veremos a lista de espaços livres, as estratégias first-fit, best-fit e worst-fit e a fragmentação.

### Reaproveitando o espaço dos registros removidos

Quando removemos um registro, sobra um **buraco** no arquivo. Esse buraco é uma **vaga**. Também surgem vagas quando um registro de tamanho variável muda de tamanho depois de uma atualização. Queremos **reaproveitar** essas vagas. Para isso precisamos de duas coisas:

- Uma **marca especial** nos registros removidos, por exemplo um `*` no começo.
- Um jeito de achar as vagas **sem ler o arquivo inteiro**. Esse jeito é a **lista de espaços livres**. O cabeçalho do arquivo guarda onde está o primeiro item dela.

Com registros de **tamanho fixo**, qualquer vaga serve, e usamos o RRN (tópico 5). Com registros de **tamanho variável**, a lista guarda o **offset** (a posição em bytes) e o **tamanho** de cada vaga. Não dá para calcular o offset, então ele fica guardado.

Para gravar um registro novo, percorremos a lista até achar uma vaga **onde ele caiba**. Podemos precisar olhar a lista toda. A escolha segue uma **estratégia**:

| Estratégia | Como a lista fica | Vaga escolhida | Comentário |
|---|---|---|---|
| **First-fit** | Sem ordem especial | A **primeira** em que o registro cabe | Simples e rápida |
| **Best-fit** | Em **ordem crescente** de tamanho | A **menor** em que o registro cabe | Desperdiça menos em cada gravação. Porém costuma aumentar a fragmentação externa, e remover custa mais, porque a vaga precisa entrar no lugar certo da lista |
| **Worst-fit** | Em **ordem decrescente** de tamanho | A **maior** vaga, a primeira da lista, se o registro couber | A sobra é grande e volta à lista como uma vaga nova que ainda serve |

Exemplo: a lista tem vagas de 100, 40, 70 e 30 bytes. O pedido é gravar um registro de 35 bytes.

| Estratégia | Vaga escolhida | Sobra |
|---|---|---|
| First-fit | 100 (a primeira que cabe) | 65 |
| Best-fit | 40 (a menor que cabe) | 5 |
| Worst-fit | 100 (a maior) | 65 |

Nenhuma estratégia é sempre a melhor. Depende da sequência de pedidos.

### Fragmentação interna e externa

- **Fragmentação interna:** usamos uma vaga **maior** que o registro e não a dividimos. A sobra fica desperdiçada **dentro** da área do registro. Exemplo: um registro de 35 bytes numa vaga de 40 desperdiça 5 bytes. Os registros de tamanho variável existem justamente para diminuir esse problema.
- **Fragmentação externa:** para evitar a interna, usamos só o espaço necessário e devolvemos a sobra à lista, como uma vaga nova. Mas vagas pequenas demais não servem para nenhum registro. Sobra espaço livre no total, só que dividido em buracos minúsculos **fora** dos registros.

### Como combater a fragmentação

- **Compactação:** gerar o arquivo de novo quando a fragmentação externa ficar ruim demais. Isso é feito de tempos em tempos, depois de várias remoções. O jeito mais simples, se houver espaço em disco, é **copiar o arquivo** para outro **pulando os registros removidos**. Também dá para compactar dentro do próprio arquivo, mas é mais difícil e mais lento. Serve para registros fixos e variáveis. Como os registros mudam de lugar, índices e referências guardadas precisam ser atualizados.
- **Juntar vagas vizinhas:** se duas vagas ficam lado a lado, somamos os tamanhos e guardamos uma vaga maior na lista.
- **Escolher bem a estratégia** (best-fit ou worst-fit): ajuda, mas não elimina o problema.

## Estrutura

A lista de espaços livres em um arquivo de registros de tamanho variável:

```estrutura
LISTA DE ESPAÇOS LIVRES (arquivo de registros variáveis)

 CABEÇALHO:  topoLivres -> byte 120

 byte 120:  [* | tamanho 100 | próximo -> 300]
 byte 300:  [* | tamanho  40 | próximo -> 540]
 byte 540:  [* | tamanho  70 | próximo -> -1 ]
            '*' = registro removido; -1 = fim da lista
            (o offset da próxima vaga é guardado diretamente; não dá para calculá-lo)
```

## Código em C

### Escolhendo a vaga

A função `escolheVaga` recebe a lista de vagas, o tamanho do pedido e a estratégia. Ela devolve a posição da vaga escolhida. Clique em **Executar** e veja as três estratégias com o mesmo pedido: 35 bytes para as vagas 100, 40, 70 e 30.

Repare no que muda: o first-fit para na primeira vaga que cabe. O best-fit e o worst-fit olham a lista toda. No final de cada estratégia você vê a **sobra**.

```codigo
{
  "title": "First-fit, best-fit e worst-fit passo a passo",
  "code": [
    "#include <stdio.h>",
    "",
    "#define FIRST 0",
    "#define BEST  1",
    "#define WORST 2",
    "",
    "/* devolve a posição da vaga escolhida em vagas[], ou -1 se nenhuma serve */",
    "int escolheVaga(int vagas[], int qtd, int pedido, int estrategia) {",
    "    int escolhida = -1;",
    "    for (int i = 0; i < qtd; i++) {",
    "        if (vagas[i] < pedido) {",
    "            continue;                                 /* não cabe: próxima vaga */",
    "        }",
    "        if (escolhida == -1) {",
    "            escolhida = i;                            /* primeira que cabe */",
    "        } else if (estrategia == BEST && vagas[i] < vagas[escolhida]) {",
    "            escolhida = i;                            /* menor que cabe */",
    "        } else if (estrategia == WORST && vagas[i] > vagas[escolhida]) {",
    "            escolhida = i;                            /* maior que cabe */",
    "        }",
    "        if (estrategia == FIRST) {",
    "            break;                                    /* first-fit para na primeira */",
    "        }",
    "    }",
    "    return escolhida;",
    "}",
    "",
    "int main(void) {",
    "    int vagas[4] = {100, 40, 70, 30};",
    "    int pedido = 35;",
    "    for (int e = FIRST; e <= WORST; e++) {",
    "        int i = escolheVaga(vagas, 4, pedido, e);",
    "        printf(\"estrategia %d: vaga %d, sobra %d\\n\", e, vagas[i], vagas[i] - pedido);",
    "    }",
    "    return 0;",
    "}"
  ],
  "steps": [
    {
      "line": 32,
      "caption": "Vamos testar o **first-fit**. A lista tem vagas de 100, 40, 70, 30 bytes e o pedido é gravar um registro de 35 bytes.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 1 (100 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "100 é maior ou igual a 35: cabe! Ainda não temos nenhuma vaga escolhida.",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 15,
      "caption": "Esta é a primeira vaga que cabe (100 bytes). Ela passa a ser a escolhida, por enquanto.",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 22,
      "caption": "No first-fit não precisamos procurar mais: ficamos com a primeira vaga em que o registro coube. Por isso o laço para aqui.",
      "vars": {"i": 0, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 25,
      "caption": "Fim da procura. A vaga escolhida é a de 100 bytes.",
      "vars": {"escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 33,
      "caption": "first-fit: o registro de 35 bytes vai para a vaga de 100 bytes e sobram **65 bytes**. Se a sobra ficar dentro do registro, é fragmentação interna. Se voltar para a lista como uma vaga nova, é um pedaço que pode ficar pequeno demais e causar fragmentação externa.",
      "vars": {"vaga": 0, "sobra": 65},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (first-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}, {"i": [[65, "p", 7]], "l": "sobra"}]],
      "stack": "main"
    },
    {
      "line": 32,
      "caption": "Vamos testar o **best-fit**. A lista tem vagas de 100, 40, 70, 30 bytes e o pedido é gravar um registro de 35 bytes.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 1 (100 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "100 é maior ou igual a 35: cabe! Ainda não temos nenhuma vaga escolhida.",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 15,
      "caption": "Esta é a primeira vaga que cabe (100 bytes). Ela passa a ser a escolhida, por enquanto.",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 2 (40 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 1, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "c", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "40 também cabe. No best-fit queremos a menor vaga que serve. A escolhida até agora tem 100: 40 é menor, então vamos trocar.",
      "vars": {"i": 1, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "c", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 17,
      "caption": "Trocamos: a vaga de 40 bytes é menor que a de 100 e também serve. Ela vira a escolhida.",
      "vars": {"i": 1, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "p", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 3 (70 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 2, "escolhida": 1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "p", 2], [70, "c", 3], [30, "", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "70 também cabe. No best-fit queremos a menor vaga que serve. A escolhida até agora tem 40: 70 não é menor, então ela fica como está.",
      "vars": {"i": 2, "escolhida": 1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "p", 2], [70, "c", 3], [30, "", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 4 (30 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 3, "escolhida": 1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "p", 2], [70, "", 3], [30, "c", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 12,
      "caption": "30 é menor que 35: não cabe. Passamos para a próxima vaga.",
      "vars": {"i": 3, "escolhida": 1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "p", 2], [70, "", 3], [30, "c", 4]], "l": "lista de vagas (best-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 25,
      "caption": "Fim da procura. A vaga escolhida é a de 40 bytes.",
      "vars": {"escolhida": 1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "p", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 33,
      "caption": "best-fit: o registro de 35 bytes vai para a vaga de 40 bytes e sobram **5 bytes**. Se a sobra ficar dentro do registro, é fragmentação interna. Se voltar para a lista como uma vaga nova, é um pedaço que pode ficar pequeno demais e causar fragmentação externa.",
      "vars": {"vaga": 1, "sobra": 5},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "p", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (best-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}, {"i": [[5, "p", 7]], "l": "sobra"}]],
      "stack": "main"
    },
    {
      "line": 32,
      "caption": "Vamos testar o **worst-fit**. A lista tem vagas de 100, 40, 70, 30 bytes e o pedido é gravar um registro de 35 bytes.",
      "vars": {},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 1 (100 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "100 é maior ou igual a 35: cabe! Ainda não temos nenhuma vaga escolhida.",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "c", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 15,
      "caption": "Esta é a primeira vaga que cabe (100 bytes). Ela passa a ser a escolhida, por enquanto.",
      "vars": {"i": 0, "escolhida": -1},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 2 (40 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 1, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "c", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "40 também cabe. No worst-fit queremos a maior vaga que serve. A escolhida até agora tem 100: 40 não é maior, então ela fica como está.",
      "vars": {"i": 1, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "c", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 3 (70 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 2, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "c", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 14,
      "caption": "70 também cabe. No worst-fit queremos a maior vaga que serve. A escolhida até agora tem 100: 70 não é maior, então ela fica como está.",
      "vars": {"i": 2, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "c", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 11,
      "caption": "Olhamos a vaga 4 (30 bytes). O pedido é de 35 bytes. Será que cabe?",
      "vars": {"i": 3, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "c", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 12,
      "caption": "30 é menor que 35: não cabe. Passamos para a próxima vaga.",
      "vars": {"i": 3, "escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "c", 4]], "l": "lista de vagas (worst-fit)", "a": 1}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 25,
      "caption": "Fim da procura. A vaga escolhida é a de 100 bytes.",
      "vars": {"escolhida": 0},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}]],
      "stack": "escolheVaga ← main"
    },
    {
      "line": 33,
      "caption": "worst-fit: o registro de 35 bytes vai para a vaga de 100 bytes e sobram **65 bytes**. Se a sobra ficar dentro do registro, é fragmentação interna. Se voltar para a lista como uma vaga nova, é um pedaço que pode ficar pequeno demais e causar fragmentação externa.",
      "vars": {"vaga": 0, "sobra": 65},
      "rows": [[{"s": 0, "n": 4, "i": [[100, "p", 1], [40, "", 2], [70, "", 3], [30, "", 4]], "l": "lista de vagas (worst-fit)"}], [{"i": [[35, "", 6]], "l": "pedido"}, {"i": [[65, "p", 7]], "l": "sobra"}]],
      "stack": "main"
    }
  ]
}
```

### Compactação por cópia

Para compactar, copiamos o arquivo para outro e pulamos os registros removidos. Cada registro começa com 2 bytes que guardam o tamanho dele. Um registro removido tem `*` no primeiro byte dos dados.

```c
#include <stdio.h>

/* Copia o arquivo, pulando os registros removidos.
   Cada registro: 2 bytes com o tamanho, seguidos dos dados.
   Removido: o primeiro byte dos dados é '*'. */
void compactar(const char *origem, const char *destino) {
    FILE *in = fopen(origem, "rb");
    FILE *out = fopen(destino, "wb");
    unsigned short tam;
    char dados[256];
    while (fread(&tam, sizeof(tam), 1, in) == 1) {
        fread(dados, 1, tam, in);
        if (dados[0] != '*') {                    /* pula os removidos */
            fwrite(&tam, sizeof(tam), 1, out);
            fwrite(dados, 1, tam, out);
        }
    }
    fclose(in);
    fclose(out);
}
```

No fim, o arquivo novo não tem nenhuma vaga. A lista de espaços livres do cabeçalho deve ser esvaziada.

## Teste rápido

```quiz
{
  "question": "Um arquivo tem 5 vagas de 10 bytes cada, espalhadas, e precisa gravar um registro de 30 bytes. Há 50 bytes livres no total, mas nenhuma vaga única serve. Esse problema é:",
  "options": [
    { "text": "Fragmentação interna", "correct": false },
    { "text": "Fragmentação externa", "correct": true },
    { "text": "Um erro de intercalação", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Há espaço livre suficiente no total, mas dividido em vagas pequenas demais. Compactar ou juntar vagas vizinhas resolve.",
  "incorrectFeedback": "❌ Ainda não. O espaço desperdiçado está FORA dos registros, dividido em várias vagas pequenas. Isso é a fragmentação externa."
}
```

```quiz
{
  "question": "Qual estratégia escolhe, entre as vagas em que o registro cabe, a MENOR delas?",
  "options": [
    { "text": "First-fit", "correct": false },
    { "text": "Worst-fit", "correct": false },
    { "text": "Best-fit", "correct": true }
  ],
  "correctFeedback": "✅ Correto! O best-fit desperdiça menos em cada gravação, mas costuma aumentar a fragmentação externa.",
  "incorrectFeedback": "❌ Ainda não. First-fit usa a primeira vaga em que o registro cabe, e worst-fit usa a maior. A menor vaga que serve é a do best-fit."
}
```


