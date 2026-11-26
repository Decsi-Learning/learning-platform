```aula-narrada
{
  "tema": "Lista - Conceito e TAD",
  "videoFolder": "videos",
  "config": {
    "personagem": "Rafa IA",
    "maxClipSeconds": 15,
    "charsPorSegundo": 14.5,
    "maxSlides": 18,
    "maxClipes": 36,
    "glossarioPronuncia": {
      "TAD": "tê a dê"
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
      "title": "O que você vai aprender",
      "layout": "abertura",
      "body": "Lista · Conceito e TAD",
      "visual": {
        "topicos": [
          "Reconhecer posição e sucessor",
          "Descrever as operações do TAD Lista",
          "Distinguir contrato e implementação",
          "Relacionar lista, pilha e fila"
        ]
      },
      "clips": [
        {
          "speech": "Você vai aprender a descrever uma lista e a usar suas operações. Vamos separar o que a lista oferece de como ela funciona na memória e descobrir onde entram pilhas e filas.",
          "durationSeconds": 13,
          "direction": "warm smile, welcoming",
          "flow": {
            "arquivo": "s01-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, warm smile, welcoming. He says in a warm, unhurried voice: \"Você vai aprender a descrever uma lista e a usar suas operações. Vamos separar o que a lista oferece de como ela funciona na memória e descobrir onde entram pilhas e filas.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s02",
      "title": "A ordem muda o plano",
      "layout": "comparativo",
      "body": "Imagine duas versões da sua lista de tarefas.",
      "visual": {
        "colunas": [
          "Posição",
          "Plano inicial",
          "Plano revisado"
        ],
        "linhas": [
          [
            "1ª",
            "Ler",
            "Ler"
          ],
          [
            "2ª",
            "Revisar",
            "Praticar"
          ],
          [
            "3ª",
            "Praticar",
            "Revisar"
          ]
        ]
      },
      "clips": [
        {
          "speech": "Nos dois planos você tem as mesmas tarefas. Mas o que vem depois de ler? A resposta muda quando você troca a ordem. Um conjunto de tarefas, sozinho, perderia essa informação.",
          "durationSeconds": 13,
          "direction": "raises eyebrows and tilts head slightly, curious",
          "flow": {
            "arquivo": "s02-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, raises eyebrows and tilts head slightly, curious. He says in a warm, unhurried voice: \"Nos dois planos você tem as mesmas tarefas. Mas o que vem depois de ler? A resposta muda quando você troca a ordem. Um conjunto de tarefas, sozinho, perderia essa informação.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s03",
      "title": "Cada tarefa ocupa uma posição",
      "layout": "conceito",
      "body": "Ler → Revisar → Praticar",
      "visual": {
        "pontos": [
          "Primeiro elemento: Ler",
          "Sucessor de Ler: Revisar",
          "Último elemento: Praticar"
        ]
      },
      "clips": [
        {
          "speech": "Parta de ler e dê um passo na sequência. Você chega a revisar. Essa é a ideia de sucessor. Numa lista linear, cada elemento tem exatamente um sucessor, exceto o último.",
          "durationSeconds": 13,
          "direction": "glances briefly to the side as if looking at the slide",
          "flow": {
            "arquivo": "s03-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: \"Parta de ler e dê um passo na sequência. Você chega a revisar. Essa é a ideia de sucessor. Numa lista linear, cada elemento tem exatamente um sucessor, exceto o último.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s04",
      "title": "O TAD define um contrato",
      "layout": "conceito",
      "body": "TAD significa tipo abstrato de dados.",
      "visual": {
        "pontos": [
          "Quais operações posso pedir?",
          "Quais dados preciso fornecer?",
          "Que resultado devo esperar?"
        ]
      },
      "clips": [
        {
          "speech": "Se você pedir a remoção da segunda tarefa, já sabe qual item deve sair. O tipo abstrato de dados especifica esse comportamento. A escolha de como guardar as tarefas vem depois.",
          "durationSeconds": 14,
          "direction": "calm and explanatory, small natural head movements",
          "flow": {
            "arquivo": "s04-c1.mp4",
            "duracaoSegundos": 14,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: \"Se você pedir a remoção da segunda tarefa, já sabe qual item deve sair. O tipo abstrato de dados especifica esse comportamento. A escolha de como guardar as tarefas vem depois.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 14
    },
    {
      "id": "s05",
      "title": "Uma lista começa vazia",
      "layout": "tabela",
      "body": "Antes de cadastrar a primeira tarefa",
      "visual": {
        "colunas": [
          "Operação",
          "Resultado neste momento"
        ],
        "linhas": [
          [
            "Lista_Inicia(Lista)",
            "Lista vazia"
          ],
          [
            "Lista_EhVazia(Lista)",
            "Verdadeiro"
          ],
          [
            "Lista_Tamanho(Lista)",
            "0"
          ]
        ]
      },
      "clips": [
        {
          "speech": "Você acabou de iniciar a lista. Perguntar se ela está vazia dá uma resposta de sim ou não. Perguntar pelo tamanho dá uma quantidade. Nesse momento, ela vale zero.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements",
          "flow": {
            "arquivo": "s05-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: \"Você acabou de iniciar a lista. Perguntar se ela está vazia dá uma resposta de sim ou não. Perguntar pelo tamanho dá uma quantidade. Nesse momento, ela vale zero.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s06",
      "title": "Inserir escolhe o lugar da tarefa",
      "layout": "conceito",
      "body": "Lista_Insere(Lista, x, pos)",
      "visual": {
        "pontos": [
          "Antes: Ler → Praticar",
          "Item: Revisar",
          "Posição escolhida: entre Ler e Praticar",
          "Depois: Ler → Revisar → Praticar"
        ]
      },
      "clips": [
        {
          "speech": "Você quer revisar antes de praticar. Para inserir, informe a tarefa e a posição desejada. A tarefa que vinha depois de ler continua na lista, agora uma posição adiante.",
          "durationSeconds": 13,
          "direction": "glances briefly to the side as if looking at the slide",
          "flow": {
            "arquivo": "s06-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: \"Você quer revisar antes de praticar. Para inserir, informe a tarefa e a posição desejada. A tarefa que vinha depois de ler continua na lista, agora uma posição adiante.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s07",
      "title": "Buscar devolve uma posição",
      "layout": "conceito",
      "body": "Lista_Busca(Lista, x)",
      "visual": {
        "pontos": [
          "Sequência: Ler → Revisar → Praticar",
          "Item procurado: Revisar",
          "Resultado: segunda posição"
        ]
      },
      "clips": [
        {
          "speech": "Você lembra o nome da tarefa, mas esqueceu onde ela está. A busca recebe o item e devolve sua posição, se ele existir. Buscar mantém a sequência das tarefas.",
          "durationSeconds": 12,
          "direction": "calm and explanatory, small natural head movements",
          "flow": {
            "arquivo": "s07-c1.mp4",
            "duracaoSegundos": 12,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: \"Você lembra o nome da tarefa, mas esqueceu onde ela está. A busca recebe o item e devolve sua posição, se ele existir. Buscar mantém a sequência das tarefas.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 12
    },
    {
      "id": "s08",
      "title": "Remover devolve o item",
      "layout": "conceito",
      "body": "Lista_Remove(Lista, pos)",
      "visual": {
        "pontos": [
          "Antes: Ler → Revisar → Praticar",
          "Posição escolhida: segunda",
          "Item devolvido: Revisar",
          "Depois: Ler → Praticar"
        ]
      },
      "clips": [
        {
          "speech": "Agora você conhece a posição de revisar. Ao pedir a remoção nessa posição, recebe a tarefa que saiu. O tamanho cai para dois, e praticar passa a ser o sucessor de ler.",
          "durationSeconds": 13,
          "direction": "slow nod on the key word",
          "flow": {
            "arquivo": "s08-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, slow nod on the key word. He says in a warm, unhurried voice: \"Agora você conhece a posição de revisar. Ao pedir a remoção nessa posição, recebe a tarefa que saiu. O tamanho cai para dois, e praticar passa a ser o sucessor de ler.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s09",
      "title": "Pilha e fila restringem as pontas",
      "layout": "comparativo",
      "body": "Imagine que Ler entrou primeiro e Revisar entrou depois.",
      "visual": {
        "colunas": [
          "Estrutura",
          "Onde insere",
          "Onde remove"
        ],
        "linhas": [
          [
            "Lista",
            "Posição escolhida",
            "Posição escolhida"
          ],
          [
            "Pilha · LIFO",
            "Topo",
            "Topo"
          ],
          [
            "Fila · FIFO",
            "Fim",
            "Início"
          ]
        ]
      },
      "clips": [
        {
          "speech": "Na pilha, revisar sai primeiro porque entrou por último. Na fila, ler sai primeiro porque chegou antes. A lista permite escolher a posição de inserção ou remoção.",
          "durationSeconds": 13,
          "direction": "glances briefly to the side as if looking at the slide",
          "flow": {
            "arquivo": "s09-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: \"Na pilha, revisar sai primeiro porque entrou por último. Na fila, ler sai primeiro porque chegou antes. A lista permite escolher a posição de inserção ou remoção.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 13
    },
    {
      "id": "s10",
      "title": "Um contrato, duas representações",
      "layout": "comparativo",
      "body": "A sequência lógica é a mesma nas duas implementações.",
      "visual": {
        "colunas": [
          "Representação",
          "Chegar à posição",
          "Inserir no meio"
        ],
        "linhas": [
          [
            "Vetor",
            "Acesso por índice",
            "Deslocar itens"
          ],
          [
            "Nós encadeados",
            "Percorrer os nós",
            "Ajustar ligações"
          ]
        ]
      },
      "clips": [
        {
          "speech": "No vetor, as tarefas ocupam posições contíguas na memória. Você chega direto pelo índice. Para inserir no meio, precisa deslocar os itens seguintes e abrir espaço.",
          "durationSeconds": 13,
          "direction": "glances briefly to the side as if looking at the slide",
          "flow": {
            "arquivo": "s10-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, glances briefly to the side as if looking at the slide. He says in a warm, unhurried voice: \"No vetor, as tarefas ocupam posições contíguas na memória. Você chega direto pelo índice. Para inserir no meio, precisa deslocar os itens seguintes e abrir espaço.\" No background music. No on-screen text."
          },
          "focus": {
            "linhas": [
              1,
              1
            ]
          }
        },
        {
          "speech": "Na lista encadeada, cada nó guarda um item e a referência para o próximo. Você percorre os nós até o ponto desejado. Ali, basta ajustar as ligações para inserir.",
          "durationSeconds": 13,
          "direction": "calm and explanatory, small natural head movements",
          "flow": {
            "arquivo": "s10-c2.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, calm and explanatory, small natural head movements. He says in a warm, unhurried voice: \"Na lista encadeada, cada nó guarda um item e a referência para o próximo. Você percorre os nós até o ponto desejado. Ali, basta ajustar as ligações para inserir.\" No background music. No on-screen text."
          },
          "focus": {
            "linhas": [
              2,
              2
            ]
          }
        }
      ],
      "durationSeconds": 26,
      "motivoClipeExtra": "O destaque muda de linha para acompanhar cada representação."
    },
    {
      "id": "s11",
      "title": "Teste o contrato da lista",
      "layout": "quiz",
      "body": "",
      "visual": {
        "pergunta": "Ao trocar vetor por nós, o que o TAD preserva?",
        "opcoes": [
          "A posição física de cada item",
          "As operações e seus resultados",
          "O acesso direto por índice"
        ],
        "correta": 1
      },
      "clips": [
        {
          "speech": "Imagine que a lista de tarefas passou de vetor para nós encadeados. Quem usa a operação de busca pode continuar esperando o mesmo resultado? Pense antes de responder.",
          "durationSeconds": 13,
          "direction": "raises eyebrows and tilts head slightly, curious",
          "flow": {
            "arquivo": "s11-c1.mp4",
            "duracaoSegundos": 13,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, raises eyebrows and tilts head slightly, curious. He says in a warm, unhurried voice: \"Imagine que a lista de tarefas passou de vetor para nós encadeados. Quem usa a operação de busca pode continuar esperando o mesmo resultado? Pense antes de responder.\" No background music. No on-screen text."
          },
          "focus": {
            "mostrar": "pergunta e opções"
          }
        },
        {
          "speech": "Sim. O contrato da busca continua o mesmo. Se revisar ocupa a segunda posição, essa é a posição devolvida nas duas implementações.",
          "durationSeconds": 10,
          "direction": "slow nod on the key word",
          "flow": {
            "arquivo": "s11-c2.mp4",
            "duracaoSegundos": 10,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, slow nod on the key word. He says in a warm, unhurried voice: \"Sim. O contrato da busca continua o mesmo. Se revisar ocupa a segunda posição, essa é a posição devolvida nas duas implementações.\" No background music. No on-screen text."
          },
          "focus": {
            "mostrar": "opção correta"
          }
        }
      ],
      "durationSeconds": 23,
      "motivoClipeExtra": "A pergunta e a explicação da resposta aparecem em momentos distintos."
    },
    {
      "id": "s12",
      "title": "Reconheça a regra das pontas",
      "layout": "quiz",
      "body": "",
      "visual": {
        "pergunta": "Por que pilha e fila são casos particulares de lista?",
        "opcoes": [
          "Exigem armazenamento por vetor",
          "Aceitam apenas números",
          "Restringem onde inserir e remover"
        ],
        "correta": 2
      },
      "clips": [
        {
          "speech": "Pense nas tarefas ler e revisar outra vez. O que explica a diferença entre a próxima tarefa a sair de uma pilha e a próxima a sair de uma fila?",
          "durationSeconds": 11,
          "direction": "raises eyebrows and tilts head slightly, curious",
          "flow": {
            "arquivo": "s12-c1.mp4",
            "duracaoSegundos": 11,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, raises eyebrows and tilts head slightly, curious. He says in a warm, unhurried voice: \"Pense nas tarefas ler e revisar outra vez. O que explica a diferença entre a próxima tarefa a sair de uma pilha e a próxima a sair de uma fila?\" No background music. No on-screen text."
          },
          "focus": {
            "mostrar": "pergunta e opções"
          }
        },
        {
          "speech": "A regra das pontas. Na pilha você insere e remove pelo topo. Na fila você insere no fim e remove do início. Essas restrições explicam a ordem de saída.",
          "durationSeconds": 12,
          "direction": "slow nod on the key word",
          "flow": {
            "arquivo": "s12-c2.mp4",
            "duracaoSegundos": 12,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, slow nod on the key word. He says in a warm, unhurried voice: \"A regra das pontas. Na pilha você insere e remove pelo topo. Na fila você insere no fim e remove do início. Essas restrições explicam a ordem de saída.\" No background music. No on-screen text."
          },
          "focus": {
            "mostrar": "opção correta"
          }
        }
      ],
      "durationSeconds": 23,
      "motivoClipeExtra": "A pergunta e a explicação da resposta aparecem em momentos distintos."
    },
    {
      "id": "s13",
      "title": "Três ideias para levar",
      "layout": "recap",
      "body": "",
      "visual": {
        "pontos": [
          "A posição dá sentido à sequência.",
          "O TAD especifica as operações.",
          "Vetor e nós realizam o mesmo contrato."
        ]
      },
      "clips": [
        {
          "speech": "Você já pode explicar uma lista usando suas tarefas. Mostre quem vem depois de quem, escolha uma operação e descreva o resultado. Essa explicação vale tanto para vetor quanto para nós.",
          "durationSeconds": 14,
          "direction": "satisfied smile, confident tone",
          "flow": {
            "arquivo": "s13-c1.mp4",
            "duracaoSegundos": 14,
            "prompt": "@Rafa IA, medium close-up, centered, plain white background, static camera, soft studio light. He looks at the camera like a friendly professor, satisfied smile, confident tone. He says in a warm, unhurried voice: \"Você já pode explicar uma lista usando suas tarefas. Mostre quem vem depois de quem, escolha uma operação e descreva o resultado. Essa explicação vale tanto para vetor quanto para nós.\" No background music. No on-screen text."
          }
        }
      ],
      "durationSeconds": 14
    }
  ]
}
```
