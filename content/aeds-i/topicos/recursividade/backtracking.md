## Objetivos de aprendizagem

- Definir backtracking e reconhecer sua relação com recursividade.
- Identificar escolha, exploração, validação e desfazer escolha.
- Entender a busca em profundidade no espaço de possibilidades.
- Aplicar a técnica a um problema simples.

## Parte teórica

### O que é backtracking?

**Backtracking** (retrocesso) é uma técnica de projeto de algoritmos usada para explorar possibilidades na busca por uma ou mais soluções. O algoritmo constrói uma solução parcial, verifica se ela pode continuar sendo válida e, se o caminho não levar a uma solução, desfaz a última escolha e tenta outra.

A técnica costuma ser implementada com recursividade, pois cada chamada representa uma etapa da construção da solução. A pilha de chamadas mantém o histórico das escolhas feitas no caminho atual.

### Etapas do backtracking

1. **Escolher:** selecionar uma possibilidade para a próxima etapa.
2. **Validar:** verificar se a escolha respeita as restrições do problema.
3. **Avançar:** se for válida, continuar recursivamente.
4. **Desfazer:** remover a escolha atual ao retornar, permitindo testar outra possibilidade.
5. **Encerrar:** quando uma solução completa é encontrada ou todas as possibilidades foram exploradas.

### Backtracking e força bruta

Uma busca por força bruta pode testar todas as possibilidades sem eliminar caminhos antecipadamente. O backtracking também explora possibilidades, mas pode interromper um caminho assim que percebe que ele viola uma restrição ou não pode levar a uma solução. Essa interrupção é chamada de poda.

A eficiência depende do problema, da ordem das escolhas e da qualidade das restrições usadas para podar caminhos. No pior caso, o número de possibilidades ainda pode ser exponencial.

## Estrutura

```text
FUNÇÃO buscar(estado)
    SE estado representa uma solução completa ENTÃO
        REGISTRE ou EXIBA a solução
        RETORNE
    FIM SE

    PARA cada escolha possível FAÇA
        APLIQUE a escolha

        SE estado continua válido ENTÃO
            buscar(estado atualizado)
        FIM SE

        DESFAÇA a escolha
    FIM PARA
FIM FUNÇÃO
```

> O passo de desfazer a escolha é essencial quando o estado é alterado durante a exploração. Ele garante que uma tentativa não contamine a próxima.

## Demonstração: encontrar um caminho em uma grade

Imagine uma grade em que `0` representa uma posição livre e `1` representa uma parede. O objetivo é sair da posição inicial e chegar ao destino, movendo-se para cima, baixo, esquerda ou direita.

O algoritmo pode:

1. Marcar a posição atual como visitada no caminho.
2. Verificar se chegou ao destino.
3. Tentar cada movimento permitido.
4. Ignorar posições fora da grade, paredes ou posições já visitadas no caminho atual.
5. Se nenhum movimento levar ao destino, remover a marca da posição atual e retornar falso.

A remoção da marca ao retornar é o retrocesso: a posição deixa de fazer parte do caminho que está sendo testado, permitindo explorar outra rota.

## Pseudocódigo

```text
FUNÇÃO existe_caminho(linha, coluna)
    SE posição está fora da grade OU é parede ENTÃO
        RETORNE FALSO
    FIM SE

    SE posição é o destino ENTÃO
        RETORNE VERDADEIRO
    FIM SE

    SE posição já está no caminho atual ENTÃO
        RETORNE FALSO
    FIM SE

    marque posição como visitada

    PARA cada direção (cima, baixo, esquerda, direita) FAÇA
        SE existe_caminho(próxima_linha, próxima_coluna) ENTÃO
            RETORNE VERDADEIRO
        FIM SE
    FIM PARA

    desmarque posição
    RETORNE FALSO
FIM FUNÇÃO
```

Neste pseudocódigo, a marcação representa o caminho atual. Se o objetivo for enumerar todos os caminhos, inclusive depois de encontrar um deles, o tratamento do retorno deve ser ajustado para continuar a busca.

## Código em C — modelo simplificado

```c
int buscar(int linha, int coluna) {
    if (fora_da_grade(linha, coluna) || parede(linha, coluna)) {
        return 0;
    }

    if (eh_destino(linha, coluna)) {
        return 1;
    }

    if (visitado[linha][coluna]) {
        return 0;
    }

    visitado[linha][coluna] = 1;

    if (buscar(linha - 1, coluna) ||
        buscar(linha + 1, coluna) ||
        buscar(linha, coluna - 1) ||
        buscar(linha, coluna + 1)) {
        return 1;
    }

    visitado[linha][coluna] = 0; // desfaz a escolha
    return 0;
}
```

As funções `fora_da_grade`, `parede` e `eh_destino`, além da matriz `visitado`, representam estruturas auxiliares que precisam ser definidas na implementação completa. Neste exemplo, ao encontrar o destino, a função retorna imediatamente; por isso, a marcação do caminho encontrado permanece. Para procurar todos os caminhos, é necessário continuar explorando e desfazer também as marcações correspondentes.



## Teste rápido

```quiz
{
  "question": "Qual é a função do passo de desfazer uma escolha no backtracking?",
  "options": [
    { "text": "Garantir que a próxima tentativa comece sem carregar alterações indevidas do caminho anterior.", "correct": true },
    { "text": "Impedir que o algoritmo utilize recursividade.", "correct": false },
    { "text": "Transformar toda busca em tempo constante.", "correct": false }
  ],
  "correctFeedback": "Isso mesmo! O retrocesso restaura o estado para que outras possibilidades possam ser exploradas corretamente.",
  "incorrectFeedback": "Pense no que aconteceria se as posições escolhidas em um caminho sem saída continuassem marcadas para todas as próximas tentativas."
}
```

## Exercícios de fixação desta página

1. Quais são as principais etapas de um algoritmo de backtracking?
2. Explique a diferença entre explorar um caminho e desfazer uma escolha.
3. O que é poda? Como ela pode reduzir o trabalho de busca?
4. Por que o backtracking costuma ser implementado com recursividade?
