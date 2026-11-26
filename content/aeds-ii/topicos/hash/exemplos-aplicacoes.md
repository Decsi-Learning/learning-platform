## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- **Reconhecer** aplicações reais de tabelas hash e justificar por que elas são escolhidas no lugar de outras estruturas.
- **Relacionar** cada caso de uso às decisões de projeto: função de dispersão, tratamento de colisões e fator de carga.
- **Simular** inserção, busca e remoção, observando colisões e o caminho de sondagem.
- **Comparar** a distribuição de diferentes funções de dispersão e explicar por que algumas funcionam melhor.
- **Distinguir** o hash usado em tabelas do hash criptográfico.

## Como este tópico se liga à trilha

Os três tópicos anteriores construíram a teoria de **Tabelas Hash**. Aqui ela é aplicada em casos reais e laboratórios interativos, conectando-se também a estruturas de busca e compressão vistas em AEDS I e AEDS II.

1. [Função de dispersão](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=funcao-dispersao)
2. [Tratamento de colisões](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=tratamento-colisoes)
3. [Eficiência de tabelas hash](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=eficiencia)
4. **Exemplos e aplicações** *(você está aqui)*
5. [Exercícios](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=exercicios)

| Conteúdo relacionado | Trilha | Como se conecta a esta página |
|:---|:---|:---|
| [Função de dispersão](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=funcao-dispersao), [Tratamento de colisões](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=tratamento-colisoes) e [Eficiência](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=eficiencia) | AEDS II · Hash | Aparecem juntos nos laboratórios: escolha da função, sondagem com marcador de remoção, fator de carga $\alpha$ e rehashing |
| [LZW](../../../../topico.html?trilha=aeds-ii&id=compressao-dados&pagina=lzw) | AEDS II | Usa tabela hash para consultar o dicionário de subsequências em tempo médio $O(1)$ durante a compressão |
| [Árvore Trie](../../../../topico.html?trilha=aeds-ii&id=arvore-trie) e [Árvore Patricia](../../../../topico.html?trilha=aeds-ii&id=arvore-patricia) | AEDS II | Complementam tabelas hash na busca de textos: hash busca igualdade exata; Tries preservam prefixos e ordem |
| [Árvores Binárias](../../../../topico.html?trilha=aeds-i&id=estruturas-dados-hierarquicas&pagina=arvores-binarias) e [Árvores Vermelho e Preto](../../../../topico.html?trilha=aeds-i&id=estruturas-dados-hierarquicas&pagina=arvores-vermelho-preto) | AEDS I | Contraste com buscas em $O(\log n)$ e uso em buckets longos de bibliotecas como o `HashMap` do Java |

---

## Casos de uso reais

Sempre que o problema é "dada uma chave, encontrar rapidamente o valor associado", uma tabela hash é candidata natural. Veja seis situações comuns:

### Dicionários e conjuntos nas linguagens

**Mapeamento:** `chave → qualquer objeto`

O `dict` e o `set` do Python, o `HashMap` do Java e o `unordered_map` do C++ são tabelas hash. Os detalhes variam: em geral, o Java usa encadeamento (e pode converter baldes muito longos em árvores) com fator de carga padrão de 0,75, enquanto o Python usa endereçamento aberto e redimensiona antes de a tabela ficar cheia.

### Cache e memoização

**Mapeamento:** `chave → resultado já calculado`

Guardar o resultado de uma operação cara, usando os parâmetros ou a URL como chave, evita recalculá-la. Sistemas de cache como Redis e Memcached funcionam como armazenamentos chave-valor.

### Contagem e duplicatas

**Mapeamento:** `palavra → contador`

Contar a frequência de palavras em um texto ou de eventos em um log, e detectar elementos repetidos, custa $O(1)$ em média por item. Com um vetor ordenado, cada operação custaria $O(\log n)$ ou mais.

### Tabela de símbolos

**Mapeamento:** `nome da variável → tipo e endereço`

Compiladores e interpretadores consultam a tabela de símbolos a cada identificador lido. A busca rápida por nome é essencial para analisar programas grandes.

### Bancos de dados

**Mapeamento:** `valor da coluna → linhas`

Índices hash aceleram buscas por igualdade, e a junção por hash (*hash join*) monta uma tabela hash com a menor das tabelas e consulta cada linha da outra nela.

### Distribuição de carga

**Mapeamento:** `hash(chave) mod N → servidor`

Sistemas distribuídos usam o hash da chave para decidir em qual dos $N$ servidores um dado fica. Se $N$ muda, quase todas as chaves mudam de lugar, o mesmo problema do rehashing. Por isso existe o *hashing consistente*, que remaneja só uma fração delas.

## Atenção: hash de tabela não é hash criptográfico

> **Não confunda:** funções como SHA-256 e bcrypt são projetadas para serem difíceis de reverter e para tornar colisões praticamente impossíveis de encontrar, o que as torna mais lentas. Já a função de dispersão de uma tabela hash prioriza **velocidade e boa distribuição**, e não precisa resistir a ataques. Em ambos os casos, a mesma entrada sempre gera a mesma saída.

## Laboratório 1: simulador de tabela hash

Insira, busque e remova chaves e veja o que acontece. As células destacadas mostram o caminho percorrido na última operação.

> **Sugestão:** clique em *Exemplo* (quatro chaves com o mesmo índice) e alterne a estratégia para ver a diferença entre encadeamento e sondagem. Depois remova uma chave do meio da sequência e busque outra que estava depois dela.

```hash-simulador
{ "title": "Simulador de tabela hash", "m": 7, "strategy": "enc", "fn": "poli" }
```

## Laboratório 2: distribuição das chaves

Uma boa função espalha as chaves de forma uniforme. Escolha um conjunto de 30 chaves, uma função e um tamanho $m$, e veja quantas chaves caem em cada posição.

> **Sugestão:** use os múltiplos de 10 com a divisão e $m = 10$, e depois troque para $m = 11$. Compare também a soma dos caracteres com a função polinomial nos nomes.

```hash-distribuicao
{ "title": "Distribuição das chaves" }
```

Repare no que ocorre com $m = 10$: todos os múltiplos de 10 têm resto 0, então caem na mesma posição. É por isso que se recomenda um $m$ primo para o método da divisão.

---

## Resumo

- Tabelas hash são a escolha natural quando o problema é buscar um valor a partir de uma chave: dicionários, caches, contagens, tabelas de símbolos, índices de bancos de dados e distribuição de carga.
- Bibliotecas reais combinam função de dispersão, tratamento de colisões e controle do fator de carga, exatamente os três temas da trilha.
- A escolha de $m$ influencia a distribuição: com a divisão, prefira $m$ primo.
- O hash de uma tabela prioriza velocidade; o hash criptográfico prioriza segurança.

## Teste de conhecimento

```quiz
{
  "question": "Um sistema precisa contar quantas vezes cada palavra aparece em um texto muito grande. Qual estrutura oferece custo médio O(1) por palavra?",
  "options": [
    { "text": "Vetor ordenado com busca binária", "correct": false },
    { "text": "Lista encadeada simples", "correct": false },
    { "text": "Tabela hash com a palavra como chave", "correct": true },
    { "text": "Pilha", "correct": false }
  ],
  "correctFeedback": "Correto! Cada palavra é uma chave e o contador é o valor. A tabela hash permite localizar e atualizar o contador em O(1) em média, sem ordenar nada.",
  "incorrectFeedback": "Incorreto. Cada palavra é uma chave e o contador é o valor. A tabela hash permite localizar e atualizar o contador em O(1) em média, sem ordenar nada."
}
```

```quiz
{
  "question": "Por que o hash criptográfico (como o SHA-256) não é usado como função de dispersão comum em tabelas hash?",
  "options": [
    { "text": "Porque ele não é determinístico", "correct": false },
    { "text": "Porque ele gera sempre índices menores que m", "correct": false },
    { "text": "Porque tabelas hash não aceitam strings como chave", "correct": false },
    { "text": "Porque ele é projetado para resistir a ataques e por isso é mais lento do que o necessário", "correct": true }
  ],
  "correctFeedback": "Correto! O hash criptográfico é projetado para ser irreversível e resistente a colisões, o que o torna mais lento. A função de uma tabela hash prioriza velocidade e boa distribuição.",
  "incorrectFeedback": "Incorreto. O hash criptográfico é projetado para ser irreversível e resistente a colisões, o que o torna mais lento. A função de uma tabela hash prioriza velocidade e boa distribuição."
}
```

```quiz
{
  "question": "No comparador, as chaves 10, 20, …, 300 com divisão e m = 10 caem todas na mesma posição. Qual a causa?",
  "options": [
    { "text": "Todas as chaves são múltiplas de 10, e 10 divide m, então k mod 10 = 0", "correct": true },
    { "text": "A função divisão não é determinística", "correct": false },
    { "text": "Há poucas chaves para a tabela", "correct": false },
    { "text": "O valor de m é primo", "correct": false }
  ],
  "correctFeedback": "Correto! Todos os múltiplos de 10 deixam resto 0 na divisão por 10, então caem na mesma posição. Com m primo (como 11), os restos se espalham.",
  "incorrectFeedback": "Incorreto. Todos os múltiplos de 10 deixam resto 0 na divisão por 10, então caem na mesma posição. Com m primo (como 11), os restos se espalham."
}
```
