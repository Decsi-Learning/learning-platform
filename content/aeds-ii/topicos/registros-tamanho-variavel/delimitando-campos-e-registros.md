## Objetivos de aprendizagem

Ao final desta página, você vai conseguir:

- Explicar por que usar registros de tamanho variável.
- Comparar as técnicas para delimitar campos (tamanho, separador, keyword=value e código de tipo).
- Comparar os métodos para delimitar registros.
- Reconhecer o problema do separador e como evitá-lo.

## Conexão com a Trilha

No tópico anterior, todo campo tinha um tamanho combinado de antemão, e isso desperdiçava espaço quando os dados variam. Este tópico resolve esse problema: como guardar registros de tamanho variável e ainda saber onde cada campo e cada registro termina.

### Por que registros de tamanho variável?

No tópico anterior vimos que os registros de tamanho fixo desperdiçam espaço. O campo `nome` reserva 30 bytes, mesmo que o nome seja "Rui". Quando os dados variam muito (endereços, comentários, biografias), esse desperdício, a fragmentação interna, fica grande.

Nos **registros de tamanho variável**, cada registro ocupa só o que precisa. O arquivo fica menor. Em troca, surgem dois problemas novos:

1. **Onde termina um campo e começa o próximo?**
2. **Onde termina um registro e começa o próximo?**

Com tamanho fixo, a resposta vinha de uma conta. Agora precisamos **marcar** esses limites de algum jeito.

### Como delimitar os campos

| Técnica | Como funciona | Exemplo |
|---|---|---|
| **Estrutura (tamanho fixo)** | Cada campo tem um tamanho combinado de antemão, como em uma `struct` de C (tópico anterior) | `Ana Souza___________Sistemas____________` |
| **Prefixo de tamanho** | Antes de cada campo, um número diz quantos bytes ele tem | `[9]Ana Souza[8]Sistemas` |
| **Separador (delimitador)** | Um caractere especial marca o fim do campo | `Ana Souza;Sistemas;Mariana` |
| **Palavra-chave** (*keyword=value*) | Cada campo vem com o seu nome | `nome=Ana Souza;curso=Sistemas` |
| **Código do tipo de campo** | Em vez do nome inteiro, cada campo recebe um código curto, que é um número inteiro | `1=Ana Souza;2=Sistemas` |

A palavra-chave gasta mais espaço, porque o nome do campo se repete em todo registro. Em troca, ela é bem flexível. O campo informa o próprio significado, campos podem faltar ou mudar de ordem, e é fácil perceber campos perdidos. É o princípio de formatos como o JSON.

Uma opção mais econômica é trocar o nome por um **código do tipo de campo**. O registro vira uma sequência de pares `<tipo-do-campo, valor>`, em vez de `<nome-do-campo, valor>`. O arquivo guarda em algum lugar, por exemplo no cabeçalho, o significado de cada código.

Em um registro *keyword=value* podem aparecer três tipos de separador. Um separa o nome do valor (`=`). Outro separa um campo do seguinte. O terceiro termina o registro. Os caracteres escolhidos (como `?`, `%` ou `$`) **não podem aparecer** nos valores dos campos.

### Como delimitar os registros

| Técnica | Como funciona |
|---|---|
| **Tamanho fixo** | Todos os registros têm o mesmo número de bytes (tópico anterior) |
| **Prefixo com o tamanho do registro** | Antes de cada registro, um número (por exemplo, 2 bytes) diz quantos bytes de dados vêm depois |
| **Delimitador de registro** | Um caractere especial (por exemplo `#` ou a quebra de linha) marca o fim do registro |
| **Número fixo de campos** | Todo registro tem, digamos, 3 campos. Ao ler o terceiro, o registro acabou |
| **Arquivo de índice** | Um arquivo à parte guarda o *byte offset* (a posição em bytes) onde cada registro começa |

### O problema do separador

O separador só funciona se o caractere **nunca aparecer dentro dos dados**. Suponha que um endereço seja `Rua A; casa 2` e que o separador seja `;`. O programa vai achar que existe um campo a mais.

Há três saídas:

- Escolher um caractere que não pode aparecer nos dados.
- Usar um "caractere de escape".
- Usar **prefixo de tamanho**. Ele não tem esse problema, porque o programa nunca olha o conteúdo para saber onde o campo acaba.

O prefixo tem um limite. Com 1 byte, só dá para representar tamanhos até 255. Com 2 bytes, até 65 535.

### Um mesmo registro de quatro formas

O registro é: `Ana Souza`, `Sistemas`, `Mariana`.

| Forma | Como fica | Bytes |
|---|---|---|
| Fixo (30 + 20 + 20) | Cada campo ocupa o espaço reservado | 70 |
| Separadores de campo `;` e de registro `#` | `Ana Souza;Sistemas;Mariana#` | 27 |
| Prefixo de 2 bytes no registro e `;` entre os campos | `[26]Ana Souza;Sistemas;Mariana` | 28 |
| Prefixo de 1 byte em cada campo (3 campos) | `[9]Ana Souza[8]Sistemas[7]Mariana` | 27 |

## Estrutura

Os campos nome = "Ana Souza" e curso = "Sistemas" de cinco maneiras. Abaixo também há um registro *keyword=value* com os três separadores:

[Vídeo: Estrutura da tabela explicada](videos/estrutura_da_tabela.mp4)

## Código em C

O programa abaixo monta o mesmo registro nas quatro formas da tabela e conta os bytes de cada uma. Rode no seu computador e confira o resultado.

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    const char *nome = "Ana Souza", *curso = "Sistemas", *cidade = "Mariana";
    char buf[128];

    /* 1. Separadores: ';' entre os campos e '#' no fim do registro */
    int n1 = sprintf(buf, "%s;%s;%s#", nome, curso, cidade);
    printf("separadores: %s (%d bytes)\n", buf, n1);

    /* 2. Prefixo de 2 bytes no registro, com ';' entre os campos */
    int dados = sprintf(buf, "%s;%s;%s", nome, curso, cidade);
    printf("prefixo no registro: [%d]%s (%d bytes)\n", dados, buf, 2 + dados);

    /* 3. Prefixo de 1 byte em cada campo */
    int a = (int)strlen(nome), b = (int)strlen(curso), c = (int)strlen(cidade);
    printf("prefixo em cada campo: [%d]%s[%d]%s[%d]%s (%d bytes)\n", a, nome, b, curso, c, cidade, 3 + a + b + c);

    /* 4. Tamanho fixo: 30 + 20 + 20 bytes reservados */
    printf("tamanho fixo: %d bytes\n", 30 + 20 + 20);
    return 0;
}
```

A saída do programa é:

```text
separadores:            Ana Souza;Sistemas;Mariana# (27 bytes)
prefixo no registro:    [26]Ana Souza;Sistemas;Mariana (28 bytes)
prefixo em cada campo:  [9]Ana Souza[8]Sistemas[7]Mariana (27 bytes)
tamanho fixo: 70 bytes
```

Na próxima página você vai ver como o programa **lê** esses registros de volta.

## Teste rápido

```quiz
{
  "question": "Qual técnica de delimitação NÃO corre o risco de o caractere especial aparecer dentro dos dados?",
  "options": [
    { "text": "Separador de campo \";\"", "correct": false },
    { "text": "Prefixo com o tamanho do campo", "correct": true },
    { "text": "Delimitador de registro \"#\"", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Com o prefixo sabemos quantos bytes ler, sem olhar o conteúdo, então nenhum caractere dos dados atrapalha.",
  "incorrectFeedback": "❌ Ainda não. Separadores e delimitadores só funcionam se o caractere nunca aparecer nos dados. O prefixo de tamanho não depende disso."
}
```

```quiz
{
  "question": "Em um arquivo, cada campo vem no formato nome=valor, por exemplo curso=Sistemas. Qual é uma VANTAGEM dessa técnica?",
  "options": [
    { "text": "O arquivo fica menor do que com delimitadores", "correct": false },
    { "text": "O campo informa o próprio significado e é fácil perceber campos que faltam", "correct": true },
    { "text": "Dispensa qualquer caractere separador", "correct": false }
  ],
  "correctFeedback": "✅ Correto! Em troca, os nomes repetidos ocupam espaço (overhead).",
  "incorrectFeedback": "❌ Ainda não. A vantagem do keyword=value é a clareza: o campo diz o que é. O custo é o espaço extra dos nomes, e ainda são necessários separadores."
}
```

## Vídeo-resumo do tópico

[Resumo em vídeo: Delimitando campos e registros](videos/delimitando_dados_variaveis.mp4)
