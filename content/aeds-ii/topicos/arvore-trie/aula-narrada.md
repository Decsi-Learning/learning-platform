```aula-narrada
{
  "tema": "Árvore Trie",
  "config": {
    "personagem": "Rafa IA",
    "maxClipSeconds": 15,
    "charsPorSegundo": 14.5,
    "maxSlides": 18,
    "maxClipes": 36,
    "glossarioPronuncia": {
      "Trie": "trai"
    },
    "flow": {
      "modelo": "Omni Flash 1.2",
      "modo": "Ingredients",
      "aspecto": "9:16",
      "resolucaoTeste": "360p",
      "resolucaoFinal": "720p",
      "mencaoPersonagem": "@Rafa IA",
      "cena": "medium close-up, centered, plain white background, static camera, soft studio light"
    }
  },
  "slides": [
    {
      "id": "s01",
      "title": "Uma árvore para procurar palavras",
      "layout": "abertura",
      "body": "Árvore Trie · AEDS II",
      "visual": {
        "topicos": [
          "Desenhar palavras por prefixos",
          "Inserir, consultar e remover chaves",
          "Comparar tempo e memória"
        ]
      },
      "clips": [
        {
          "speech": "Imagine guardar sol e solo. Quantas letras você desenharia para representar as duas palavras juntas? Vamos construir esse caminho e acompanhar o que muda quando uma palavra sai.",
          "durationSeconds": 14,
          "direction": "warm smile, welcoming"
        }
      ],
      "durationSeconds": 14
    },
    {
      "id": "s02",
      "title": "O começo já orienta a consulta",
      "layout": "conceito",
      "body": "Ao digitar ca, quais palavras ainda podem completar a busca?",
      "visual": {
        "pontos": [
          "casa · caso · cama",
          "dia começa em outro ramo"
        ]
      },
      "clips": [
        {
          "speech": "Você começa a digitar uma palavra e o teclado já sugere finais. Se as primeiras letras coincidem, faz sentido reunir essas opções no mesmo ramo e explorar só o que vem depois.",
          "durationSeconds": 14,
          "direction": "calm and explanatory, small natural head movements"
        }
      ],
      "durationSeconds": 14
    },
    {
      "id": "s03",
      "title": "O caminho forma a chave",
      "layout": "diagrama",
      "body": "Comece na raiz e siga uma aresta por letra.",
      "visual": {
        "figura": "img/trie-exemplo.svg",
        "legenda": "Árvore Trie com as palavras casa, caso, cama, cao e dia; o prefixo ca é compartilhado por quatro palavras"
      },
      "clips": [
        {
          "speech": "Parta da raiz vazia e tente localizar casa. Leia uma letra em cada aresta até alcançar o nó de contorno duplo. Esse contorno indica uma palavra guardada.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide"
        }
      ],
      "durationSeconds": 12
    },
    {
      "id": "s04",
      "title": "Um prefixo pode ser palavra",
      "layout": "conceito",
      "body": "car e carro terminam em pontos diferentes do mesmo ramo.",
      "visual": {
        "pontos": [
          "Caminho existente: prefixo",
          "Nó marcado: chave armazenada"
        ]
      },
      "clips": [
        {
          "speech": "Imagine que só carro foi inserida. Você consegue percorrer car, mas a busca exata ainda falha. Para cadastrar car, basta marcar o nó que você já alcançou.",
          "durationSeconds": 12,
          "direction": "calm and explanatory, small natural head movements"
        }
      ],
      "durationSeconds": 12
    },
    {
      "id": "s05",
      "title": "Cada letra escolhe um filho",
      "layout": "codigo",
      "body": "O exemplo usa as 26 letras minúsculas de a até z.",
      "visual": {
        "linguagem": "c",
        "origem": "Inserção · criarNo",
        "trecho": "NoTrie *criarNo(void) {\n    NoTrie *no = malloc(sizeof(NoTrie));\n    if (no == NULL) return NULL;\n    no->fimDePalavra = false;\n    for (int i = 0; i < TAM_ALFABETO; i++) {\n        no->filhos[i] = NULL;\n    }\n    return no;\n}"
      },
      "clips": [
        {
          "speech": "Ao criar um nó, começamos com a marca desligada e todos os filhos vazios. A letra indica uma posição no vetor. Assim sabemos onde procurar a próxima aresta.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide"
        }
      ],
      "durationSeconds": 12
    },
    {
      "id": "s06",
      "title": "Inserir aproveita o caminho existente",
      "layout": "codigo",
      "body": "Inserções sucessivas: sol → solo → sal.",
      "visual": {
        "linguagem": "c",
        "origem": "Inserção",
        "trecho": "void inserir(NoTrie *raiz, const char *palavra) {\n    NoTrie *atual = raiz;\n    for (int i = 0; palavra[i] != '\\0'; i++) {\n        int indice = palavra[i] - 'a';\n        if (atual->filhos[indice] == NULL) {\n            atual->filhos[indice] = criarNo();\n        }\n        atual = atual->filhos[indice];\n    }\n    atual->fimDePalavra = true;\n}"
      },
      "clips": [
        {
          "speech": "Insira sol na árvore vazia. Cada letra exige um novo filho. Quando o percurso termina, a marca no último nó registra que sol faz parte do conjunto.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide",
          "focus": {
            "linhas": [
              5,
              7
            ]
          }
        },
        {
          "speech": "Agora insira solo. As três primeiras letras já têm caminho. Basta criar o último filho e marcá-lo. Ao inserir sal, o caminho se separa de sol na segunda letra.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide",
          "focus": {
            "linhas": [
              8,
              10
            ]
          }
        }
      ],
      "durationSeconds": 24,
      "motivoClipeExtra": "A primeira passagem mostra a criação; a segunda acompanha o reaproveitamento."
    },
    {
      "id": "s07",
      "title": "A busca exata verifica a marca",
      "layout": "codigo",
      "body": "Na árvore com sol, solo e sal, experimente buscar so e sul.",
      "visual": {
        "linguagem": "c",
        "origem": "Busca",
        "trecho": "bool buscar(NoTrie *raiz, const char *palavra) {\n    NoTrie *atual = raiz;\n    for (int i = 0; palavra[i] != '\\0'; i++) {\n        int indice = palavra[i] - 'a';\n        if (atual->filhos[indice] == NULL) {\n            return false;\n        }\n        atual = atual->filhos[indice];\n    }\n    return atual->fimDePalavra;\n}"
      },
      "clips": [
        {
          "speech": "Tente buscar sul. Depois do esse, o ramo da letra u está ausente. A função já pode encerrar a consulta, mesmo que ainda sobrem letras para examinar.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide",
          "focus": {
            "linhas": [
              5,
              7
            ]
          }
        },
        {
          "speech": "Agora tente buscar so. As duas arestas existem, mas o último nó está desmarcado. É a verificação final que distingue esse caso de uma busca por sol.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide",
          "focus": {
            "linhas": [
              10,
              10
            ]
          }
        }
      ],
      "durationSeconds": 24,
      "motivoClipeExtra": "As duas consultas terminam em testes diferentes do código."
    },
    {
      "id": "s08",
      "title": "Para prefixos basta alcançar o nó",
      "layout": "codigo",
      "body": "comecaCom(\"so\") encontra o início compartilhado por sol e solo.",
      "visual": {
        "linguagem": "c",
        "origem": "Busca por prefixo",
        "trecho": "bool comecaCom(NoTrie *raiz, const char *prefixo) {\n    NoTrie *atual = raiz;\n    for (int i = 0; prefixo[i] != '\\0'; i++) {\n        int indice = prefixo[i] - 'a';\n        if (atual->filhos[indice] == NULL) {\n            return false;\n        }\n        atual = atual->filhos[indice];\n    }\n    return true;\n}"
      },
      "clips": [
        {
          "speech": "Ao consultar o prefixo so, você quer saber se existe uma continuação possível. Percorra as duas letras. Para listar as sugestões, ainda é preciso visitar as terminações abaixo.",
          "durationSeconds": 14,
          "direction": "glances briefly to the side as if looking at the slide"
        }
      ],
      "durationSeconds": 14
    },
    {
      "id": "s09",
      "title": "Remover preserva as outras palavras",
      "layout": "codigo",
      "body": "Remova solo e observe onde a poda precisa parar.",
      "visual": {
        "linguagem": "c",
        "origem": "Remoção",
        "trecho": "    if (palavra[profundidade] == '\\0') {\n        if (!no->fimDePalavra) return false;\n        no->fimDePalavra = false;\n        return !temFilhos(no);\n    }"
      },
      "clips": [
        {
          "speech": "Ao retirar solo, desligue a marca do último o. Como ele não tem filhos, pode ser liberado pelo pai. Ao voltar ao ele de sol, pare: ali termina outra palavra.",
          "durationSeconds": 12,
          "direction": "glances briefly to the side as if looking at the slide"
        }
      ],
      "durationSeconds": 12
    },
    {
      "id": "s10",
      "title": "A poda também para nas bifurcações",
      "layout": "conceito",
      "body": "Depois de excluir solo, remova sal. A palavra sol deve continuar acessível.",
      "visual": {
        "pontos": [
          "Libere o l e o a de sal",
          "Preserve o s que leva a sol"
        ]
      },
      "clips": [
        {
          "speech": "Na volta da recursão, o ramo de sal fica vazio. O esse ainda leva a sol e precisa ficar. Um nó só pode ser podado quando está sem filhos e sem marca.",
          "durationSeconds": 12,
          "direction": "calm and explanatory, small natural head movements"
        }
      ],
      "durationSeconds": 12
    },
    {
      "id": "s11",
      "title": "O tamanho da chave governa a busca",
      "layout": "tabela",
      "body": "m = tamanho consultado · σ = tamanho do alfabeto · N = número de nós",
      "visual": {
        "colunas": [
          "Operação",
          "Custo"
        ],
        "linhas": [
          [
            "Inserir ou buscar",
            "O(m)"
          ],
          [
            "Localizar prefixo",
            "O(m)"
          ],
          [
            "Remover",
            "O(m · σ)"
          ],
          [
            "Guardar os nós",
            "O(N · σ)"
          ]
        ]
      },
      "clips": [
        {
          "speech": "Com alfabeto fixo, inserir ou buscar custa ó de eme. Para localizar um prefixo, eme conta apenas suas letras. Listar todas as respostas exige visitar outros nós.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements",
          "focus": {
            "linhas": [
              1,
              2
            ]
          }
        },
        {
          "speech": "Na remoção, testar se sobraram filhos pode percorrer todo o vetor a cada nível. O espaço também cresce com o alfabeto, porque até posições vazias ocupam memória.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements",
          "focus": {
            "linhas": [
              3,
              4
            ]
          }
        }
      ],
      "durationSeconds": 26,
      "motivoClipeExtra": "Primeiro a tabela mostra o percurso; depois, o custo dos vetores."
    },
    {
      "id": "s12",
      "title": "A representação muda o espaço ocupado",
      "layout": "comparativo",
      "body": "Uma cadeia longa sem bifurcações abre espaço para compactação.",
      "visual": {
        "colunas": [
          "Variação",
          "Ideia"
        ],
        "linhas": [
          [
            "Filhos em mapa",
            "Guardar filhos existentes"
          ],
          [
            "Trie compacta",
            "Fundir trechos sem desvio"
          ],
          [
            "Trie ternária",
            "Menor, igual ou maior"
          ],
          [
            "Árvore de sufixos",
            "Indexar sufixos de um texto"
          ]
        ]
      },
      "clips": [
        {
          "speech": "Imagine um corredor longo sem portas laterais. A árvore compacta reúne esse trecho numa aresta. Já um mapa economiza posições quando poucas letras saem de cada nó.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements"
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s13",
      "title": "A consulta orienta a escolha",
      "layout": "comparativo",
      "body": "m = tamanho da chave · n = quantidade de chaves",
      "visual": {
        "colunas": [
          "Estrutura",
          "Busca exata",
          "Prefixos"
        ],
        "linhas": [
          [
            "Trie",
            "O(m)",
            "Ramo compartilhado"
          ],
          [
            "Hash",
            "O(m) em média",
            "Sem índice de prefixos"
          ],
          [
            "Árvore balanceada",
            "O(m · log n)",
            "Busca e percurso"
          ]
        ]
      },
      "clips": [
        {
          "speech": "Se você só verifica palavras inteiras, uma tabela hash pode servir bem. Quando precisa completar o que foi digitado, a árvore de prefixos já reúne as opções no mesmo ramo.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements"
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s14",
      "title": "O roteador guarda a última saída",
      "layout": "aplicacao",
      "body": "Destino 1011 · rotas do exemplo em AEDS II",
      "visual": {
        "itens": [
          {
            "nome": "1 → B",
            "detalhe": "Primeira rota específica"
          },
          {
            "nome": "10 → C",
            "detalhe": "Mais um bit coincide"
          },
          {
            "nome": "101 → D",
            "detalhe": "Saída escolhida"
          }
        ]
      },
      "clips": [
        {
          "speech": "Siga os bits do destino e guarde a saída a cada rota encontrada. Depois de um, zero, um, a melhor saída é dê. Sem outro ramo válido, vale a última rota registrada.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements"
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s15",
      "title": "Teste sua leitura do caminho",
      "layout": "quiz",
      "body": "",
      "visual": {
        "pergunta": "A Trie guarda apenas carro. O que buscar(\"car\") devolve?",
        "opcoes": [
          "Verdadeiro, pois o caminho existe",
          "Falso, pois falta a marca final",
          "Erro, pois falta uma aresta"
        ],
        "correta": 1
      },
      "clips": [
        {
          "speech": "Percorra mentalmente as três primeiras letras de carro. O caminho existe. Isso já basta para que a busca exata reconheça car como palavra? Escolha uma resposta.",
          "durationSeconds": 13,
          "direction": "looks expectantly at the camera, encouraging smile",
          "focus": {
            "mostrar": "pergunta e opções"
          }
        },
        {
          "speech": "A segunda opção está correta. Só carro foi cadastrada, então o primeiro erre ficou sem marca. Uma consulta por prefixo aceitaria car nesse mesmo ponto.",
          "durationSeconds": 12,
          "direction": "slow nod on the key word",
          "focus": {
            "mostrar": "opção correta"
          }
        }
      ],
      "durationSeconds": 25,
      "motivoClipeExtra": "O aluno vê as opções antes da explicação da resposta."
    },
    {
      "id": "s16",
      "title": "Três ideias para reconstruir a árvore",
      "layout": "recap",
      "body": "Para revisar, desenhe sol, solo e sal e retire uma palavra de cada vez.",
      "visual": {
        "pontos": [
          "O caminho guarda o prefixo",
          "A marca identifica a palavra",
          "A poda preserva os caminhos úteis"
        ]
      },
      "clips": [
        {
          "speech": "Ao revisar seu desenho, faça três perguntas. Quais letras as palavras compartilham? Onde cada palavra termina? Que nós podem sair sem interromper o caminho de outra chave?",
          "durationSeconds": 13,
          "direction": "satisfied smile, confident tone"
        }
      ],
      "durationSeconds": 13
    }
  ]
}
```
