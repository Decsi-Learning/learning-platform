#  Tópico 1: Organização de Dados em Memória Secundária

> **Material de Apoio — Algoritmos e Estruturas de Dados II (AEDS 2)**

## 1. Contextualizando o Tema: A Transição de AED 1 para AED 2

Em **Algoritmos e Estruturas de Dados I (AED 1)**, todas as estruturas que você construiu — vetores, listas encadeadas, pilhas, filas e árvores binárias — viviam exclusivamente na **Memória Principal (RAM)**.

Lá, o acesso aos dados era quase instantâneo (na casa dos nanosegundos), mas havia dois problemas fundamentais:

1. **Volatilidade:** Ao fechar o programa ou desligar o computador, todos os dados desapareciam.

2. **Espaço Limitado:** A memória RAM é cara e possui capacidade reduzida (geralmente de $8\text{ GB}$ a $32\text{ GB}$ em computadores pessoais).

Em **AEDS 2**, damos um passo em direção ao mundo real dos sistemas de grande porte (como bancos de dados, sistemas bancários e redes sociais). O volume de dados cresce para a casa dos Terabytes ou Petabytes e precisa sobreviver após o desligamento da máquina. É aqui que entra a **Memória Secundária** (HDs, SSDs, NVMe).

No entanto, ler e escrever no disco é **milhares de vezes mais lento** do que na RAM. Por isso, não basta apenas "jogar" os dados em um arquivo: precisamos **organizá-los estrategicamente** para que o computador faça o menor número possível de viagens até o disco.

## 2. Por que é necessário estudar isso?

Você pode se perguntar: *"Por que não usar apenas as mesmas estruturas de dados da memória RAM direto no disco?"*

A resposta está no **Gargalo de Entrada/Saída (I/O)**.

| Característica | Memória Principal (RAM) | Memória Secundária (Disco/SSD) | 
| ----- | ----- | ----- | 
| **Velocidade de Acesso** | Nanosegundos ($10^{-9}\text{ s}$) | Milissegundos ($10^{-3}\text{ s}$) a Microssegundos ($10^{-6}\text{ s}$) | 
| **Persistência** | Volátil (perde dados sem energia) | Não-volátil (dados permanecem salvos) | 
| **Unidade de Acesso** | *Byte* ou Palavra (acesso direto) | **Bloco / Página** (ex: $4\text{ KB}$ por vez) | 
| **Custo por Gigabyte** | Alto | Baixo | 

### Uma analogia prática:

Imagine que a **CPU** é você estudando na sua mesa, a **Memória RAM** é um caderno aberto bem na sua frente, e a **Memória Secundária (Disco)** é uma biblioteca que fica a 2 quarteirões da sua casa.

* Ler uma linha no seu caderno (RAM) leva 1 segundo.

* Ir até a biblioteca buscar um livro (Disco) leva 20 minutos.

Se você construir uma Árvore Binária comum no disco e precisar descer $20$ níveis para achar um dado, você fará $20$ viagens até a biblioteca! Em AEDS 2, aprendemos a organizar os dados para que, em **uma única viagem**, você traga uma "caixa inteira de informações úteis" (um bloco) para a sua mesa.

## 3. Conceitos Importantes

Para dominar a organização de arquivos e estruturas em memória secundária, você precisa se familiarizar com o vocabulário básico da área:

### 3.1. Hierarquia de Dados em Arquivos

* **Campo (*Field*):** A menor unidade lógica de dado com significado. *Exemplo: `CPF`, `Nome`, `Nota`.*

* **Registro (*Record*):** Um conjunto de campos relacionados que descrevem uma entidade (equivale a uma `struct` em C ou a um objeto em Java/Python). *Exemplo: Os dados completos de um único aluno. (1 Registro)*

* **Arquivo (*File*):** Uma coleção de registros armazenados na memória secundária.

* **Chave (*Key*):** Um campo (ou combinação de campos) usado para identificar e buscar um registro. A **Chave Primária** identifica um registro de forma única (ex: `Matrícula`).

### 3.2. Bloco (ou Página de Disco)

O sistema operacional **não lê um único byte ou um único registro por vez** do disco. Ele lê e grava dados em pacotes de tamanho fixo chamados **Blocos** (geralmente de $4\text{ KB}$, $8\text{ KB}$ ou $16\text{ KB}$).

* **Fator de Bloco (**$B$**):** É a quantidade de registros que cabem dentro de um único bloco de disco. Se um bloco tem $4096\text{ bytes}$ e cada registro de aluno ocupa $512\text{ bytes}$, o fator de bloco é:
  

  $$
  B = \left\lfloor \frac{4096}{512} \right\rfloor = 8\text{ registros por bloco}
  $$

### 3.3. Complexidade de E/S (I/O Complexity)

Em AED 1, medíamos a eficiência de um algoritmo contando quantas **comparações na CPU** ele fazia. Em AED 2, a CPU é tão rápida perto do disco que o tempo de processamento na RAM se torna quase irrelevante.

* **Regra de Ouro de AED 2:** O custo de um algoritmo em memória secundária é medido pela **quantidade de acessos a disco (leituras e escritas de blocos)** que ele realiza.

### 3.4. Registros e Campos de Tamanho Fixo vs. Variável

* **Tamanho Fixo:** Todos os registros ocupam exatamente a mesma quantidade de bytes. É muito fácil calcular onde o $n$-ésimo registro está (acesso direto via cálculo de deslocamento/*offset*), mas desperdiça espaço (fragmentação interna).

* **Tamanho Variável:** Cada registro ocupa apenas o espaço necessário. Economiza disco, mas exige marcadores especiais (delimitadores ou indicadores de tamanho) e dificulta a atualização e a busca direta.

### 3.5. Fragmentação e Exclusão Lógica

Remover um registro do meio de um arquivo de $10\text{ GB}$ "puxando" todos os outros registros para trás é inviável (exigiria reescrever o arquivo inteiro no disco).

* **Exclusão Lógica (*Tombstone*):** Em vez de apagar de verdade na hora, marcamos o registro com uma *flag* (uma "lápide") indicando que ele foi removido.

* **Fragmentação:** São os "buracos" de espaço livre deixados por registros excluídos ou por sobras dentro dos blocos. Esse espaço pode ser reaproveitado futuramente (usando listas de espaços disponíveis, como a *AVAIL LIST*) ou limpo através de uma **compactação**.

  ## 

## 💡 Resumo para Fixação

1. **Memória secundária é grande e persistente, mas lenta.**

2. **O disco lê dados em blocos**, não byte a byte.

3. **O objetivo principal em AEDS 2** é projetar estruturas de dados que **minimizem o número de transferências de blocos** entre o disco e a memória RAM.