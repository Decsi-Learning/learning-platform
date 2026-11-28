## Backtracking (retrocesso)

### Conceito

**Backtracking** explora possibilidades para encontrar soluções. O algoritmo escolhe uma opção, verifica se ela é válida e avança. Se o caminho não funcionar, desfaz a escolha e tenta outra.

### Etapas

1. Escolher uma possibilidade.
2. Verificar se respeita as restrições.
3. Avançar recursivamente, se válida.
4. Desfazer a escolha ao retornar.

### Exemplo: caminho em uma grade

Considere `0` como espaço livre e `1` como parede. A busca tenta movimentos permitidos; se encontrar uma parede, sair da grade ou revisitar uma posição do caminho atual, interrompe aquele caminho.

```c
int buscar(int linha, int coluna) {
    if (fora_da_grade(linha, coluna) || parede(linha, coluna)) return 0;
    if (eh_destino(linha, coluna)) return 1;
    if (visitado[linha][coluna]) return 0;

    visitado[linha][coluna] = 1;
    if (buscar(linha - 1, coluna) || buscar(linha + 1, coluna) ||
        buscar(linha, coluna - 1) || buscar(linha, coluna + 1)) return 1;

    visitado[linha][coluna] = 0; // desfaz a escolha
    return 0;
}
```

As funções auxiliares e a matriz `visitado` devem ser definidas no programa.

### Rastreio simplificado

`início → tenta direita → encontra parede → retorna → desfaz a marca → tenta baixo`.

O **retrocesso** é desfazer a escolha. A **poda** é interromper um caminho que já viola uma restrição.

## Demonstração interativa

Avance e volte pelos passos para acompanhar o rastreio.

```demo
{
  "title": "Explore e desfaça um caminho",
  "steps": [
    {
      "caption": "A busca escolhe o primeiro movimento e marca a posição como visitada.",
      "state": "início → tenta cima\n\nvisitado = 1\nsegue recursivamente"
    },
    {
      "caption": "O caminho escolhido encontra uma parede ou uma posição inválida. Esse ramo falha.",
      "state": "início → cima → parede\n\nretorno: falha\neste caminho não chega ao destino"
    },
    {
      "caption": "Ao retornar, a função desfaz a marca da posição para permitir outra tentativa.",
      "state": "desfaz a escolha\nvisitado = 0\n\nestado restaurado para tentar outro caminho"
    },
    {
      "caption": "A busca escolhe outra direção e continua até encontrar o destino ou esgotar as possibilidades.",
      "state": "início → direita → baixo → destino\n\nretorno: sucesso\n\nBacktracking = tentar, falhar, desfazer e tentar outra opção"
    }
  ]
}
```

### Teste rápido

```quiz
{
  "question": "Qual ação é essencial no backtracking quando uma tentativa falha?",
  "options": [
    { "text": "Manter todas as escolhas marcadas.", "correct": false },
    { "text": "Desfazer a escolha e explorar outra possibilidade.", "correct": true },
    { "text": "Ignorar todas as restrições.", "correct": false },
    { "text": "Reiniciar sempre o programa.", "correct": false }
  ],
  "correctFeedback": "Isso: desfazer permite testar outro caminho.",
  "incorrectFeedback": "Pense em como restaurar o estado antes de tentar uma alternativa."
}
```


### Mais questões de fixação

```quiz
{
  "question": "Quando um caminho não funciona, qual é a ação característica do backtracking?",
  "options": [
    {
      "text": "Desfazer a escolha e tentar outra possibilidade",
      "correct": true
    },
    {
      "text": "Continuar no mesmo caminho sem verificar",
      "correct": false
    },
    {
      "text": "Apagar todas as soluções anteriores",
      "correct": false
    }
  ],
  "correctFeedback": "Correto. O algoritmo restaura o estado e explora outra opção.",
  "incorrectFeedback": "Backtracking combina exploração com retrocesso quando um ramo falha."
}
```

```quiz
{
  "question": "Por que uma posição pode ser desmarcada como visitada ao retornar?",
  "options": [
    {
      "text": "Para permitir que outra tentativa explore um caminho diferente",
      "correct": true
    },
    {
      "text": "Para impedir que o algoritmo chegue ao destino",
      "correct": false
    },
    {
      "text": "Porque a posição deixa de existir na grade",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! O estado é restaurado para explorar outro ramo.",
  "incorrectFeedback": "A marcação deve refletir o caminho atual, não bloquear todas as alternativas."
}
```

