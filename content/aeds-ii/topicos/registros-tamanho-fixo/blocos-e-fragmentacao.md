## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Calcular o fator de bloco e o número de blocos de um arquivo de registros fixos.
- Comparar a organização espalhada e a não espalhada.
- Calcular a fragmentação interna de um registro.
- Dizer quando os registros de tamanho fixo são uma boa escolha e quais são seus limites.

### Registros e blocos

O disco não transfere registro por registro. Ele transfere **blocos**, que são pedaços de tamanho fixo, em geral de alguns milhares de bytes (4 096, por exemplo). Cada leitura traz um bloco inteiro para a memória. Por isso importa saber **quantos registros cabem em um bloco**.

Esse número é o **fator de bloco**, e a conta é uma divisão inteira:

> **fator de bloco = ⌊ tamanho do bloco ÷ tamanho do registro ⌋**

Com blocos de 4 096 bytes e registros de 70 bytes, o fator de bloco é 58. Os 58 registros ocupam 58 × 70 = 4 060 bytes, e **sobram 36 bytes** no fim do bloco.

O número de blocos que o arquivo precisa vem da quantidade de registros, **arredondada para cima**:

> **blocos = ⌈ registros ÷ fator de bloco ⌉**

Para 1 000 registros: 1 000 ÷ 58 = 17,2, então são **18 blocos**.

### Espalhada ou não espalhada?

Quando o tamanho do bloco não é múltiplo do tamanho do registro, sobra espaço no fim de cada bloco. Há duas maneiras de lidar com isso:

| Organização | Como funciona | Vantagem | Desvantagem |
|:---|:---|:---|:---|
| **Não espalhada** | Cada registro fica inteiro em um bloco. A sobra do fim do bloco não é usada | Um registro nunca exige dois acessos | Desperdiça a sobra de cada bloco |
| **Espalhada** | O registro pode começar em um bloco e continuar no seguinte | Aproveita todo o espaço | Alguns registros exigem ler dois blocos |

Com registros de tamanho fixo, a sobra é **igual em todos os blocos**. No exemplo dos blocos de 4 096 bytes, são sempre 36 bytes. Com registros de tamanho variável essa sobra muda de bloco para bloco, e isso aparece no próximo tópico.

### Fragmentação interna

Já vimos que o registro reserva o espaço de cada campo, e que os dados quase nunca preenchem tudo. O espaço reservado e não usado dentro do registro é a **fragmentação interna**. Veja o caso do registro de `Ana Souza`:

| Campo | Reservado | Usado | Desperdiçado |
|:---|---:|---:|---:|
| `nome` | 30 | 9 | 21 |
| `curso` | 20 | 8 | 12 |
| `cidade` | 20 | 7 | 13 |
| **Registro** | **70** | **24** | **46** |

Dos 70 bytes, só 24 guardam informação, ou seja, cerca de 34%. Os outros 46 bytes (66%) são fragmentação interna. Se o arquivo tem 1 milhão de registros assim, são 46 milhões de bytes desperdiçados.

Por isso **escolher o tamanho do campo é uma decisão de projeto**:

- Campo **pequeno demais**: nomes longos são cortados e a informação se perde.
- Campo **grande demais**: cada registro desperdiça espaço.

Uma regra comum é medir o maior valor esperado e dimensionar o campo para ele. Mesmo assim, se poucos registros têm valores muito grandes, o campo fica largo para todos.

### Remoção e buracos

Quando um registro é removido, ele deixa um **buraco** com o tamanho de um registro. Como todos os registros têm o mesmo tamanho, **qualquer registro novo cabe nesse buraco**. Isso torna o reaproveitamento do espaço simples. O tópico "Ordenação em disco e reutilização de espaço" mostra como fazer isso.

### Quando usar tamanho fixo?

| Vantagens | Limites |
|:---|:---|
| Acesso direto pelo RRN, com uma conta simples | Fragmentação interna quando os dados variam de tamanho |
| Código simples: `fread`, `fwrite` e `fseek` | O tamanho dos campos é escolhido de antemão e é difícil de mudar |
| Atualização no lugar, sempre cabe | Valores maiores que o campo precisam ser cortados |
| Buracos reaproveitáveis por qualquer registro | Arquivo maior que o necessário quando os dados são variados |

O tamanho fixo é uma boa escolha quando os dados têm tamanho **parecido** (códigos, datas, números). Quando os tamanhos variam muito (comentários, endereços, biografias), a fragmentação interna pesa, e o próximo tópico apresenta os **registros de tamanho variável**.

## Estrutura

Blocos de 4 096 bytes em organização não espalhada, com quatro tamanhos de registro. O fator de bloco é a divisão inteira do tamanho do bloco pelo tamanho do registro, e a sobra é o que resta no fim de cada bloco:

| Registro (bytes) | Fator de bloco | Sobra por bloco (bytes) | Aproveitamento |
|---:|---:|---:|---:|
| 64 | 64 | 0 | 100,0% |
| 70 | 58 | 36 | 99,1% |
| 100 | 40 | 96 | 97,7% |
| 1 000 | 4 | 96 | 97,7% |

Com registros de 70 bytes, cabem 58 por bloco (58 × 70 = 4 060) e sobram 36 bytes. Com 64 bytes a divisão é exata e não sobra nada. O aproveitamento é a parte do bloco ocupada por registros.

## Demonstração

Veja como 5 registros ficam distribuídos nas duas organizações. Os números são pequenos de propósito, para caber na tela.

```demo
{
  "title": "Registros de 70 bytes em blocos de 200 bytes",
  "steps": [
    {
      "caption": "Cada bloco do disco tem 200 bytes (um número pequeno, só para caber na tela). Cada registro tem 70 bytes. Queremos guardar 5 registros: R0 a R4.",
      "state": "bloco = 200 bytes\nregistro = 70 bytes\n\n200 / 70 = 2, e sobram 60 bytes\n\nfator de bloco = 2 registros por bloco"
    },
    {
      "caption": "Organização NÃO ESPALHADA: cada registro fica inteiro dentro de um bloco. Em cada bloco cabem 2 registros, e os 60 bytes que sobram ficam sem uso.",
      "state": "bloco 0: [R0 70][R1 70][sobra 60]\nbloco 1: [R2 70][R3 70][sobra 60]\nbloco 2: [R4 70][vazio 130]\n\n5 registros -> 3 blocos"
    },
    {
      "caption": "Organização ESPALHADA: o registro pode começar em um bloco e terminar no seguinte. Não sobra espaço entre registros.",
      "state": "bloco 0: [R0 70][R1 70][R2: 60 de 70 bytes]\nbloco 1: [R2: 10 bytes finais][R3 70][R4 70][vazio 50]\n\n5 registros -> 2 blocos"
    },
    {
      "caption": "Em compensação, ler o R2 exige acessar dois blocos. Na não espalhada, qualquer registro está em um bloco só.",
      "state": "ler R1 (não espalhada) -> bloco 0\nler R2 (não espalhada) -> bloco 1\n\nler R2 (espalhada)     -> blocos 0 e 1"
    }
  ]
}
```

## Código em C

O programa calcula o fator de bloco, a sobra e o número de blocos de um arquivo. Rode no seu computador e confira o resultado.

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

A conta `(n + fb - 1) / fb` é um truque para **arredondar para cima** usando só divisão inteira: 1 000 ÷ 58 daria 17, e o resultado correto é 18 blocos.

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
