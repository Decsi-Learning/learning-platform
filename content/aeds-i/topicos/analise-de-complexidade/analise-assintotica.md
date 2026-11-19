# Análise Assintótica: O, Ω e Θ

## 1. O que é análise assintótica?

A análise assintótica descreve como o custo de um algoritmo cresce quando o tamanho da entrada aumenta. Em vez de nos preocuparmos com valores exatos, observamos a tendência de crescimento.

Exemplo:

`T(n) = 3n² + 5n + 10`

Para valores grandes de `n`, o termo `n²` domina. O comportamento assintótico é Θ(n²). Os outros termos não são literalmente zero; apenas não alteram a classe de crescimento.

## 2. Big O — O

A notação O descreve um **limite superior assintótico**.

Dizer que `T(n) = O(g(n))` significa que, para entradas suficientemente grandes, o custo não cresce mais rapidamente que uma constante multiplicada por `g(n)`.

Formalmente, existem constantes positivas `c` e `n₀` tais que:

`0 ≤ T(n) ≤ c · g(n)`, para todo `n ≥ n₀`.

Exemplo: `T(n) = 3n + 2` é O(n).

Big O é frequentemente usado para expressar limites superiores de pior caso, mas a notação, por si só, não significa “pior caso”. É necessário informar qual função de custo ou cenário está sendo analisado.

## 3. Ômega — Ω

A notação Ω descreve um **limite inferior assintótico**.

Dizer que `T(n) = Ω(g(n))` significa que, para entradas suficientemente grandes, o custo é pelo menos uma constante multiplicada por `g(n)`.

Formalmente, existem constantes positivas `c` e `n₀` tais que:

`0 ≤ c · g(n) ≤ T(n)`, para todo `n ≥ n₀`.

Exemplo: `T(n) = 3n + 2` é Ω(n).

Ômega não significa automaticamente “melhor caso”. É um limite inferior da função de custo escolhida.

## 4. Teta — Θ

A notação Θ descreve um **limite assintótico justo**: a função cresce na mesma ordem que outra função.

Dizer que `T(n) = Θ(g(n))` significa que o custo é limitado superior e inferiormente por constantes multiplicadas por `g(n)`.

Formalmente, existem constantes positivas `c₁`, `c₂` e `n₀` tais que:

`0 ≤ c₁ · g(n) ≤ T(n) ≤ c₂ · g(n)`, para todo `n ≥ n₀`.

Para `T(n) = 3n + 2`, temos O(n), Ω(n) e, portanto, Θ(n).

## 5. Comparação

| Notação | O que expressa? | Ideia intuitiva |
|---|---|---|
| O(g(n)) | Limite superior | Cresce no máximo nessa ordem |
| Ω(g(n)) | Limite inferior | Cresce pelo menos nessa ordem |
| Θ(g(n)) | Limite justo | Cresce nessa mesma ordem |

Uma função pode pertencer a várias classes O e Ω. Por exemplo, `n` também é O(n²), mas Θ(n) descreve seu crescimento de maneira mais justa.

## 6. Exemplo guiado: termo dominante

Considere `T(n) = 4n² + 3n + 8`.

1. Identifique os termos: `4n²`, `3n` e `8`.
2. Observe que `n²` cresce mais rapidamente que `n` e que uma constante.
3. Desconsidere constantes multiplicativas e termos de menor ordem na classificação.

Resultado: `T(n) = Θ(n²)`. Consequentemente, também é O(n²) e Ω(n²).

## 7. Exemplo em código: busca sequencial

```c
int busca(int v[], int n, int x) {
    for (int i = 0; i < n; i++) {
        if (v[i] == x) return i;
    }
    return -1;
}
```

No **pior caso**, podem ocorrer `n` comparações: custo Θ(n), portanto O(n). No **melhor caso**, o primeiro elemento é o procurado e ocorre uma comparação: custo Θ(1).

Primeiro escolhemos o cenário (melhor ou pior caso); depois descrevemos seu crescimento com uma notação assintótica.

## 8. Erros comuns

- Dizer que Big O significa sempre pior caso.
- Dizer que Ômega significa sempre melhor caso.
- Confundir O(n²) com Θ(n²).
- Manter constantes e termos menores na classificação final.
- Analisar apenas o número de linhas sem considerar quantas vezes são executadas.

## 9. Exercícios rápidos

1. Simplifique: `T(n) = 7n + 20`.
2. Simplifique: `T(n) = 5n² + 2n + 100`.
3. Se `T(n) = Θ(n)`, podemos afirmar que `T(n) = O(n²)`? Explique.
4. O que a notação Ω descreve?
5. Por que é incorreto afirmar que Big O significa necessariamente pior caso?
6. Na busca sequencial, compare o melhor e o pior caso e indique a complexidade de cada um.


## Exercícios interativos de fixação

Responda às questões e clique em **Conferir resposta** para receber o feedback.

### Questão 1

```quiz
{
  "question": "O que a notação O(g(n)) expressa?",
  "options": [
    {
      "text": "Um limite superior assintótico.",
      "correct": true
    },
    {
      "text": "Um limite inferior assintótico.",
      "correct": false
    },
    {
      "text": "Sempre o caso médio.",
      "correct": false
    }
  ],
  "correctFeedback": "Correto! O descreve um limite superior.",
  "incorrectFeedback": "O não significa automaticamente pior caso; descreve um limite superior."
}
```

### Questão 2

```quiz
{
  "question": "O que a notação Ω(g(n)) expressa?",
  "options": [
    {
      "text": "Um limite justo.",
      "correct": false
    },
    {
      "text": "Um limite inferior assintótico.",
      "correct": true
    },
    {
      "text": "Sempre o melhor caso.",
      "correct": false
    }
  ],
  "correctFeedback": "Isso! Ω estabelece um limite inferior.",
  "incorrectFeedback": "Ômega não é sinônimo automático de melhor caso."
}
```

### Questão 3

```quiz
{
  "question": "O que a notação Θ(g(n)) expressa?",
  "options": [
    {
      "text": "Apenas limite superior.",
      "correct": false
    },
    {
      "text": "Apenas limite inferior.",
      "correct": false
    },
    {
      "text": "Limite superior e inferior da mesma ordem.",
      "correct": true
    }
  ],
  "correctFeedback": "Perfeito! Θ representa um limite assintótico justo.",
  "incorrectFeedback": "Theta exige que a função seja limitada pelos dois lados por constantes vezes g(n)."
}
```
