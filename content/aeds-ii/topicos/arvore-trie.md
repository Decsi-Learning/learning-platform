## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- Explicar o que é uma árvore Trie e por que ela é chamada de árvore de prefixos.
- Representar um conjunto de palavras em uma Trie.
- Implementar as operações de inserção, busca, busca por prefixo e remoção.
- Analisar o custo dessas operações e compará-lo com outras estruturas de busca.

## Introdução

Muitas aplicações precisam guardar e consultar grandes conjuntos de palavras: o autocompletar de um buscador, o corretor ortográfico de um editor de texto, a tabela de roteamento de um roteador ou um dicionário de termos. Nessas situações, não basta saber se uma palavra existe; também é útil descobrir rapidamente **todas as palavras que começam com um prefixo**.

Uma árvore binária de busca compara chaves inteiras em cada nó, e uma tabela hash não preserva nenhuma relação entre chaves parecidas. A **Trie** resolve esse problema de outra forma: em vez de comparar a chave inteira, ela percorre a chave **caractere por caractere**, e palavras com o mesmo início compartilham o mesmo caminho na árvore.

## Conceito principal

Uma **Trie** (do inglês *re**trie**val*, recuperação) é uma árvore de busca digital em que:

- a raiz representa a cadeia vazia;
- cada aresta corresponde a um caractere do alfabeto;
- o caminho da raiz até um nó forma um prefixo;
- um nó recebe uma marca de **fim de palavra** quando o caminho até ele forma uma chave armazenada.

> A posição de um nó na Trie define a chave que ele representa. As chaves não ficam guardadas inteiras dentro dos nós: elas são formadas pelo caminho percorrido.

### Exemplo de estrutura

Considere as palavras `casa`, `caso`, `cama`, `cão` (sem acento, `cao`) e `dia`. A Trie correspondente fica assim (o símbolo `*` marca fim de palavra):

```text
(raiz)
├── c
│   └── a
│       ├── s
│       │   ├── a *      → "casa"
│       │   └── o *      → "caso"
│       ├── m
│       │   └── a *      → "cama"
│       └── o *          → "cao"
└── d
    └── i
        └── a *          → "dia"
```

Observe que o prefixo `ca` é armazenado uma única vez e compartilhado por quatro palavras.

### Por que marcar o fim da palavra?

Sem a marca, não seria possível distinguir uma palavra de um simples prefixo. Se inserirmos `car` e `carro`, o nó do `r` de `car` está no meio do caminho de `carro`. A marca `fimDePalavra` nesse nó indica que `car` também é uma chave válida, e não apenas o começo de outra.

## Representação em C

A forma mais direta usa um vetor de ponteiros em cada nó, com uma posição para cada letra do alfabeto. Neste exemplo, consideramos apenas as 26 letras minúsculas de `a` a `z`.

Nos trechos de código abaixo, passe o mouse sobre uma linha (ou toque nela, no celular) para ver o que ela faz.

### Estrutura do nó

```explicado c
#include <stdbool.h> @@ Inclui a biblioteca que define o tipo `bool` e os valores `true` e `false`.
#include <stdlib.h> @@ Inclui a biblioteca que contém `malloc` e `free`, usadas para alocar e liberar memória.

#define TAM_ALFABETO 26 @@ Cria a constante `TAM_ALFABETO` com o valor 26, uma posição para cada letra de `a` a `z`.

typedef struct NoTrie { @@ Começa a definição da estrutura `NoTrie`, que representa um nó da árvore.
    struct NoTrie *filhos[TAM_ALFABETO]; @@ Declara um vetor com 26 ponteiros para outros nós. A posição 0 aponta para o filho da letra `a`, a posição 1 para o da letra `b`, e assim por diante. Uma posição com `NULL` significa que aquela letra não continua o caminho.
    bool fimDePalavra; @@ Guarda se o caminho da raiz até este nó forma uma palavra completa (`true`) ou apenas um prefixo (`false`).
} NoTrie; @@ Fecha a estrutura e cria o apelido `NoTrie`, para escrever `NoTrie` em vez de `struct NoTrie`.
```

### Criação de um nó

```explicado c
NoTrie *criarNo(void) { @@ Declara a função `criarNo`, que não recebe parâmetros e devolve um ponteiro para um nó novo.
    NoTrie *no = malloc(sizeof(NoTrie)); @@ Reserva na memória o espaço de um `NoTrie` e guarda o endereço em `no`.
    if (no == NULL) return NULL; @@ Se não houver memória disponível, `malloc` devolve `NULL`; nesse caso, a função também devolve `NULL` para avisar o erro.
    no->fimDePalavra = false; @@ Marca que o nó novo ainda não é fim de nenhuma palavra.
    for (int i = 0; i < TAM_ALFABETO; i++) { @@ Inicia um laço que passa por cada uma das 26 posições do vetor de filhos.
        no->filhos[i] = NULL; @@ Coloca `NULL` em cada posição, indicando que o nó ainda não tem filhos. Sem isso, o vetor conteria lixo de memória.
    } @@ Fecha o laço.
    return no; @@ Devolve o endereço do nó criado e inicializado.
} @@ Fecha a função.
```

> O índice do filho é calculado a partir do caractere: `c - 'a'`. Como os caracteres são números na tabela ASCII e as letras minúsculas são consecutivas, `'a' - 'a'` vale 0, `'b' - 'a'` vale 1 e `'z' - 'a'` vale 25.

## Operações

### Inserção

Para inserir uma palavra, percorremos seus caracteres a partir da raiz. Se o filho correspondente ao caractere atual não existir, criamos um novo nó. Ao terminar a palavra, marcamos o último nó como fim de palavra.

```explicado c
void inserir(NoTrie *raiz, const char *palavra) { @@ Declara a função `inserir`, que recebe a raiz da Trie e a palavra a ser inserida. `const` indica que a palavra não será alterada.
    NoTrie *atual = raiz; @@ Cria o ponteiro `atual`, que começa na raiz e vai descendo pela árvore.
    for (int i = 0; palavra[i] != '\0'; i++) { @@ Percorre a palavra caractere por caractere até encontrar `'\0'`, o caractere que marca o fim de toda string em C.
        int indice = palavra[i] - 'a'; @@ Converte o caractere atual em um índice de 0 a 25.
        if (atual->filhos[indice] == NULL) { @@ Verifica se ainda não existe um filho para essa letra.
            atual->filhos[indice] = criarNo(); @@ Se não existir, cria um nó novo e o liga nessa posição do vetor.
        } @@ Fecha o `if`.
        atual = atual->filhos[indice]; @@ Desce para o filho da letra atual, que agora certamente existe.
    } @@ Fecha o laço: todos os caracteres foram percorridos.
    atual->fimDePalavra = true; @@ Marca o último nó do caminho como fim de palavra, registrando que a palavra inteira está na Trie.
} @@ Fecha a função.
```

### Busca

A busca segue o mesmo caminho. Se em algum momento o filho necessário não existir, a palavra não está na Trie. Se o caminho inteiro existir, a palavra só está armazenada quando o último nó estiver marcado como fim de palavra.

```explicado c
bool buscar(NoTrie *raiz, const char *palavra) { @@ Declara a função `buscar`, que devolve `true` se a palavra estiver na Trie e `false` caso contrário.
    NoTrie *atual = raiz; @@ Começa a busca pela raiz.
    for (int i = 0; palavra[i] != '\0'; i++) { @@ Percorre cada caractere da palavra procurada.
        int indice = palavra[i] - 'a'; @@ Converte o caractere em índice de 0 a 25.
        if (atual->filhos[indice] == NULL) { @@ Verifica se o caminho para essa letra não existe.
            return false; @@ Se não existe, nenhuma palavra armazenada segue esse caminho; a busca termina com `false`.
        } @@ Fecha o `if`.
        atual = atual->filhos[indice]; @@ Desce para o filho da letra atual.
    } @@ Fecha o laço: o caminho inteiro existe.
    return atual->fimDePalavra; @@ Devolve a marca do último nó. Se for `true`, a palavra está armazenada; se for `false`, ela é só um prefixo de outra palavra.
} @@ Fecha a função.
```

### Busca por prefixo

Verificar se existe alguma palavra que começa com um prefixo é quase igual à busca, mas não exige a marca de fim de palavra: basta que o caminho exista.

```explicado c
bool comecaCom(NoTrie *raiz, const char *prefixo) { @@ Declara a função `comecaCom`, que verifica se alguma palavra da Trie começa com `prefixo`.
    NoTrie *atual = raiz; @@ Começa pela raiz.
    for (int i = 0; prefixo[i] != '\0'; i++) { @@ Percorre cada caractere do prefixo.
        int indice = prefixo[i] - 'a'; @@ Converte o caractere em índice de 0 a 25.
        if (atual->filhos[indice] == NULL) { @@ Verifica se o caminho para essa letra não existe.
            return false; @@ Se não existe, nenhuma palavra começa com esse prefixo; devolve `false`.
        } @@ Fecha o `if`.
        atual = atual->filhos[indice]; @@ Desce para o filho da letra atual.
    } @@ Fecha o laço: o prefixo inteiro foi encontrado.
    return true; @@ Devolve `true` sem olhar `fimDePalavra`. Essa é a única diferença em relação a `buscar`: aqui basta o caminho existir.
} @@ Fecha a função.
```

Para implementar um **autocompletar**, desce-se até o nó do prefixo e, a partir dele, faz-se um percurso em profundidade listando todos os nós marcados como fim de palavra.

### Remoção

A remoção desmarca o fim de palavra e, em seguida, libera os nós que deixaram de ser úteis, isto é, nós que não marcam fim de palavra e não têm filhos. A solução é dividida em três funções.

**Função auxiliar `temFilhos`**

```explicado c
static bool temFilhos(NoTrie *no) { @@ Declara a função `temFilhos`. `static` limita seu uso a este arquivo, pois ela é só uma ajudante da remoção.
    for (int i = 0; i < TAM_ALFABETO; i++) { @@ Percorre as 26 posições do vetor de filhos.
        if (no->filhos[i] != NULL) return true; @@ Se encontrar qualquer posição diferente de `NULL`, o nó tem pelo menos um filho; devolve `true` na hora.
    } @@ Fecha o laço.
    return false; @@ Se o laço terminou sem encontrar filhos, devolve `false`.
} @@ Fecha a função.
```

**Função recursiva `removerRec`**

```explicado c
static bool removerRec(NoTrie *no, const char *palavra, int profundidade) { @@ Declara a função recursiva. Ela recebe o nó atual, a palavra e a `profundidade`, que é a posição do caractere sendo analisado. Devolve `true` quando o nó recebido ficou inútil e deve ser liberado pelo pai.
    if (no == NULL) return false; @@ Caso base de erro: se o nó não existe, a palavra não está na Trie; nada deve ser liberado.

    if (palavra[profundidade] == '\0') { @@ Verifica se chegamos ao fim da palavra, ou seja, se este é o nó do último caractere.
        if (!no->fimDePalavra) return false; @@ Se o nó não está marcado como fim de palavra, a palavra não existe na Trie; nada é removido.
        no->fimDePalavra = false; @@ Desmarca o fim de palavra: a partir daqui, a palavra deixa de existir na Trie.
        return !temFilhos(no); @@ Avisa ao pai se este nó pode ser liberado: só pode se não tiver filhos, pois filhos indicam que ele faz parte de outras palavras.
    } @@ Fecha o `if` do fim da palavra.

    int indice = palavra[profundidade] - 'a'; @@ Ainda não chegamos ao fim: calcula o índice do caractere atual.
    if (removerRec(no->filhos[indice], palavra, profundidade + 1)) { @@ Chama a função para o filho correspondente, avançando um caractere. Se ela devolver `true`, o filho ficou inútil.
        free(no->filhos[indice]); @@ Libera a memória do filho inútil.
        no->filhos[indice] = NULL; @@ Coloca `NULL` na posição do filho removido, para não deixar um ponteiro apontando para memória liberada.
        return !no->fimDePalavra && !temFilhos(no); @@ Depois de remover o filho, verifica se o próprio nó também ficou inútil: ele não marca fim de palavra e não tem mais filhos. O resultado sobe para o pai.
    } @@ Fecha o `if`.
    return false; @@ Se o filho não foi liberado, este nó também continua necessário; devolve `false`.
} @@ Fecha a função.
```

**Função principal `remover`**

```explicado c
void remover(NoTrie *raiz, const char *palavra) { @@ Declara a função que o usuário chama para remover uma palavra.
    removerRec(raiz, palavra, 0); @@ Inicia a recursão pela raiz, na posição 0 da palavra. O valor devolvido é ignorado porque a raiz nunca é liberada, mesmo que a Trie fique vazia.
} @@ Fecha a função.
```

> Ao remover `carro` de uma Trie que também contém `car`, apenas os nós de `r` e `o` finais são liberados. O nó do `r` de `car` continua existindo, porque ainda marca fim de palavra.

## Exemplo passo a passo

Vamos inserir `sol`, `solo` e `sal` em uma Trie vazia.

1. **Inserir `sol`**: criamos os nós `s`, `o` e `l`, e marcamos `l` como fim de palavra.
2. **Inserir `solo`**: os nós `s`, `o` e `l` já existem e são reaproveitados; criamos apenas o nó `o` final e o marcamos.
3. **Inserir `sal`**: o nó `s` é reaproveitado; a partir dele, criamos um novo ramo com `a` e `l`.

```text
(raiz)
└── s
    ├── o
    │   └── l *        → "sol"
    │       └── o *    → "solo"
    └── a
        └── l *        → "sal"
```

Agora, as consultas:

| Consulta | Caminho existe? | Último nó marcado? | Resultado |
|:--|:--:|:--:|:--|
| `buscar("sol")` | sim | sim | encontrada |
| `buscar("so")` | sim | não | não encontrada |
| `buscar("sul")` | não | — | não encontrada |
| `comecaCom("so")` | sim | — | existe palavra com o prefixo |

## Análise de complexidade

Sejam *m* o tamanho da chave consultada, *n* o número de chaves armazenadas e *σ* o tamanho do alfabeto.

| Operação | Custo | Observação |
|:--|:--|:--|
| Inserção | O(m) | Um passo por caractere da chave |
| Busca | O(m) | Não depende de *n* |
| Busca por prefixo | O(m) | *m* é o tamanho do prefixo |
| Remoção | O(m · σ) | `temFilhos` percorre o vetor de cada nó; com contador de filhos, cai para O(m) |
| Espaço | O(N · σ) | *N* é o total de nós; cada nó reserva σ ponteiros |

O grande ponto forte da Trie é que o tempo das operações depende do **tamanho da chave**, e não da quantidade de chaves. Uma árvore binária de busca balanceada gasta O(log n) comparações, e cada comparação de cadeias pode custar O(m), totalizando O(m · log n).

O ponto fraco é o **espaço**: com vetor de ponteiros, cada nó reserva σ posições, mesmo que use apenas uma ou duas. Para alfabetos grandes (Unicode, por exemplo), isso fica inviável.

## Variações

| Variação | Ideia | Quando usar |
|:--|:--|:--|
| Trie com lista ou mapa de filhos | Cada nó guarda só os filhos existentes, em lista encadeada, vetor ordenado ou tabela hash | Alfabetos grandes ou nós com poucos filhos |
| Trie compacta (árvore Patricia / *radix tree*) | Cadeias de nós com um único filho são fundidas em uma única aresta rotulada com uma subcadeia | Economizar espaço quando há muitos ramos longos sem bifurcação |
| Trie ternária de busca | Cada nó tem três filhos: menor, igual e maior, como uma árvore binária por caractere | Equilíbrio entre espaço e tempo |
| Árvore de sufixos | Trie compacta com todos os sufixos de um texto | Casamento de padrões e busca de subcadeias |

## Comparação com outras estruturas

| Estrutura | Busca exata | Busca por prefixo | Ordem alfabética | Espaço |
|:--|:--|:--|:--|:--|
| Árvore binária de busca balanceada | O(m · log n) | possível, com percurso | sim | baixo |
| Tabela hash | O(m) em média | não suporta | não | médio |
| Trie | O(m) no pior caso | O(m) até o prefixo | sim, por percurso em profundidade | alto |

## Aplicações

- **Autocompletar** em buscadores, teclados de celular e IDEs.
- **Corretores ortográficos**, que verificam palavras e sugerem alternativas próximas.
- **Roteamento IP**, buscando o maior prefixo comum entre o endereço e as rotas cadastradas.
- **Compressão de dados**: o algoritmo LZW mantém seu dicionário de sequências em uma estrutura semelhante a uma Trie.
- **Casamento de padrões**, com árvores de sufixos e o algoritmo de Aho-Corasick.

## Teste de conhecimento

```quiz
{
  "question": "Qual é o custo de buscar uma palavra de tamanho m em uma Trie que armazena n palavras?",
  "options": [
    { "text": "O(log n)", "correct": false },
    { "text": "O(m)", "correct": true },
    { "text": "O(n · m)", "correct": false },
    { "text": "O(n)", "correct": false }
  ],
  "correctFeedback": "Correto! A busca percorre um nó por caractere da chave, independentemente de quantas palavras existem na Trie.",
  "incorrectFeedback": "Lembre-se de que a Trie desce um nível por caractere. Quantos passos são necessários para uma palavra de tamanho m?"
}
```

```quiz
{
  "question": "Uma Trie contém apenas a palavra \"carro\". O que retorna buscar(\"car\")?",
  "options": [
    { "text": "true, porque o caminho c-a-r existe", "correct": false },
    { "text": "false, porque o nó do r não está marcado como fim de palavra", "correct": true },
    { "text": "Gera erro, porque o caminho não existe", "correct": false }
  ],
  "correctFeedback": "Correto! O caminho existe, mas \"car\" é apenas um prefixo de \"carro\", não uma palavra armazenada.",
  "incorrectFeedback": "Revise a seção sobre a marca de fim de palavra: existir o caminho não basta para a busca exata."
}
```

```quiz
{
  "question": "Qual é a principal desvantagem de uma Trie implementada com vetor de ponteiros em cada nó?",
  "options": [
    { "text": "A busca é mais lenta que em uma árvore binária de busca", "correct": false },
    { "text": "Não permite buscar palavras por prefixo", "correct": false },
    { "text": "Consome muita memória, pois cada nó reserva espaço para todo o alfabeto", "correct": true }
  ],
  "correctFeedback": "Correto! Cada nó reserva σ ponteiros, mesmo que a maioria fique nula. Variações como a Trie compacta reduzem esse custo.",
  "incorrectFeedback": "Pense no tamanho de cada nó: quantos ponteiros ele guarda e quantos são realmente usados?"
}
```

```quiz
{
  "question": "Qual variação funde cadeias de nós com um único filho em uma única aresta rotulada por uma subcadeia?",
  "options": [
    { "text": "Trie ternária de busca", "correct": false },
    { "text": "Trie compacta (Patricia / radix tree)", "correct": true },
    { "text": "Árvore B", "correct": false }
  ],
  "correctFeedback": "Correto! A Trie compacta elimina nós intermediários sem bifurcação, economizando espaço.",
  "incorrectFeedback": "Revise a tabela de variações e procure a que trata de ramos sem bifurcação."
}
```
