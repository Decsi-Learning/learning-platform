## Objetivos de aprendizagem

- Calcular o fator de bloco e o número de blocos.
- Comparar organização espalhada e não espalhada.
- Saber quando o tamanho fixo é uma boa escolha.

## Blocos

O disco lê **blocos** inteiros, não registros soltos.

> **fator de bloco = ⌊ bloco ÷ registro ⌋** (divisão inteira)
>
> **blocos = ⌈ registros ÷ fator de bloco ⌉** (arredonda para cima)

## Encaixe os registros

```blocos
{
  "title": "Registros dentro dos blocos",
  "dica": "Mexa nos tamanhos e alterne entre as duas organizações. Procure um registro que não cabe, ou uma sobra que some.",
  "bloco": 200,
  "registro": 70,
  "registros": 5
}
```

| Organização | Vantagem | Desvantagem |
|:---|:---|:---|
| **Não espalhada** | Registro nunca exige 2 leituras | Desperdiça a sobra de cada bloco |
| **Espalhada** | Aproveita todo o espaço | Alguns registros ficam em 2 blocos |

## Fragmentação interna

Espaço **reservado e não usado** dentro do registro. Em `Ana Souza`, só 24 dos 70 bytes são dados: **46 bytes** (66%) são desperdício.

Quem decide é o projeto: meça o maior valor esperado e dimensione o campo para ele.

## Quando usar tamanho fixo?

| Vantagens | Limites |
|:---|:---|
| Acesso direto pelo RRN | Fragmentação interna se os dados variam |
| Código simples: `fread`, `fwrite`, `fseek` | Tamanho dos campos difícil de mudar |
| Atualização no lugar | Valores grandes são cortados |
| Buraco de remoção serve para qualquer registro novo | Arquivo maior que o necessário |

> Bom para dados de tamanho **parecido** (códigos, datas, números). Para tamanhos muito diferentes, veja os registros de tamanho variável.

## Código em C

Calcula fator de bloco, sobra e número de blocos.

```c
#include <stdio.h>

int main(void) {
    int bloco = 4096;                       /* tamanho do bloco, em bytes */
    int reg = 70;                           /* tamanho de cada registro */
    int n = 1000;                           /* número de registros */

    int fb = bloco / reg;                   /* fator de bloco: divisão inteira */
    int sobra = bloco - fb * reg;           /* sobra no fim de cada bloco */
    int blocos = (n + fb - 1) / fb;         /* blocos necessários (arredonda para cima) */

    printf("fator de bloco: %d registros por bloco\n", fb);
    printf("sobra por bloco: %d bytes\n", sobra);
    printf("blocos para %d registros: %d\n", n, blocos);
    printf("espaço ocupado: %d bytes (dados: %d bytes)\n", blocos * bloco, n * reg);
    return 0;
}
```

A saída do programa é:

```text
fator de bloco: 58 registros por bloco
sobra por bloco: 36 bytes
blocos para 1000 registros: 18
espaço ocupado: 73728 bytes (dados: 70000 bytes)
```

> `(n + fb - 1) / fb` arredonda para cima com divisão inteira: 1 000 ÷ 58 dá 17, mas o certo são **18** blocos.

## Teste rápido

```quiz
{
  "question": "Os blocos têm 1 024 bytes e os registros têm 100 bytes. Qual é o fator de bloco e quantos bytes sobram em cada bloco (organização não espalhada)?",
  "options": [
    { "text": "Fator 10, sobram 24 bytes", "correct": true },
    { "text": "Fator 11, sobram 0 bytes", "correct": false },
    { "text": "Fator 10, sobram 100 bytes", "correct": false }
  ],
  "correctFeedback": "✅ Correto! 1024 / 100 = 10 (divisão inteira) e 1024 - 10 x 100 = 24.",
  "incorrectFeedback": "❌ Ainda não. O fator de bloco é a divisão inteira 1024 / 100, e a sobra é o que resta: 1024 menos o espaço dos registros que cabem."
}
```

```quiz
{
  "question": "O que é fragmentação interna em um arquivo de registros de tamanho fixo?",
  "options": [
    { "text": "Registros espalhados por blocos que não são vizinhos no disco", "correct": false },
    { "text": "Espaço reservado dentro do registro e não usado pelos dados", "correct": true },
    { "text": "Registros removidos que não foram apagados do arquivo", "correct": false }
  ],
  "correctFeedback": "✅ Correto! É o espaço sobrando dentro de cada campo, como os 21 bytes vazios de um nome de 9 letras em um campo de 30.",
  "incorrectFeedback": "❌ Ainda não. Fragmentação interna é desperdício DENTRO do registro, entre o dado e o limite do campo reservado."
}
```
