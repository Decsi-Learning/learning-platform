## Objetivos de aprendizagem

Ao final deste tópico, você deverá ser capaz de:

- **Revisar** e consolidar os conceitos de função de dispersão, tratamento de colisões, eficiência e aplicações de tabelas hash.
- **Identificar** eventuais lacunas nos conceitos estudados por meio das dicas com retorno direto ao tópico correspondente.
- **Resolver** corretamente questões conceituais e numéricas sobre toda a trilha de Tabelas Hash.

## Como este tópico se liga à trilha

Esta última página reúne questões sobre todo o percurso de **Tabelas Hash** e retoma fundamentos de complexidade e estruturas de dados de AEDS I que sustentam a análise das tabelas.

1. [Função de dispersão](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=funcao-dispersao)
2. [Tratamento de colisões](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=tratamento-colisoes)
3. [Eficiência de tabelas hash](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=eficiencia)
4. [Exemplos e aplicações](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=exemplos-aplicacoes)
5. **Exercícios** *(você está aqui)*

| Conteúdo relacionado | Trilha | Como se conecta a esta página |
|:---|:---|:---|
| [Função de dispersão](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=funcao-dispersao) | AEDS II · Hash | Questões 1 e 2: método da divisão e escolha de $m$ primo |
| [Tratamento de colisões](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=tratamento-colisoes) | AEDS II · Hash | Questões 3 a 5: inevitabilidade de colisões, sondagem linear e hash duplo |
| [Eficiência de tabelas hash](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=eficiencia) | AEDS II · Hash | Questões 6 a 8: fator de carga $\alpha$, sondagens esperadas e rehashing |
| [Exemplos e aplicações](../../../../topico.html?trilha=aeds-ii&id=hash&pagina=exemplos-aplicacoes) | AEDS II · Hash | Questões 9 e 10: distribuição de carga e diferença para hash criptográfico |
| [Análise Assintótica](../../../../topico.html?trilha=aeds-i&id=analise-de-complexidade&pagina=analise-assintotica) e [Implementação e Complexidade dos TADs](../../../../topico.html?trilha=aeds-i&id=tipos-abstratos-de-dados&pagina=implementacao-e-complexidade-tads) | AEDS I | Pré-requisitos úteis para interpretar os custos médios, piores casos e escolhas de estrutura |

---

## Como funciona

As questões cobrem os quatro tópicos da trilha: função de dispersão, tratamento de colisões, eficiência e aplicações.

1. Marque uma alternativa em cada questão e clique em **Verificar respostas**.
2. Em cada questão errada aparece uma dica com o tópico a revisar e um link. O link abre em outra aba, para você não perder o que já respondeu.
3. As questões certas ficam travadas. Você só precisa refazer as erradas.
4. O botão **Finalizar tópico** só é liberado com **10 de 10** acertos.

> **Dica:** se tiver dúvida em alguma questão, use os links da tabela acima ou as dicas após a verificação para revisar a teoria antes de tentar novamente.

---

## Resumo

- **Função de dispersão:** mapeia chaves para índices de $0$ a $m - 1$ de forma determinística, rápida e uniforme.
- **Tratamento de colisões:** escolhe entre encadeamento separado (listas) ou endereçamento aberto (sondagens e marcador de remoção).
- **Eficiência:** acompanha o fator de carga $\alpha$ e aplica rehashing para manter tempo médio $O(1)$.
- **Aplicações:** sustenta dicionários, caches, índices e sistemas distribuídos, com objetivos distintos do hash criptográfico.

## Teste de conhecimento

```avaliacao
{
  "title": "Responda e verifique",
  "requirePerfect": true,
  "questions": [
    {
      "question": "Usando o método da divisão com m = 13, qual é o índice da chave 47?",
      "options": ["3", "8", "13", "34"],
      "correct": 1,
      "topic": "Função de dispersão",
      "section": "Métodos clássicos",
      "page": "funcao-dispersao"
    },
    {
      "question": "Por que se recomenda que m seja um número primo no método da divisão?",
      "options": [
        "Para que a tabela caiba na memória",
        "Para que a sondagem seja sempre linear",
        "Para que a função deixe de ser determinística",
        "Para reduzir padrões na distribuição, evitando que chaves com fatores em comum com m se agrupem"
      ],
      "correct": 3,
      "topic": "Função de dispersão",
      "section": "Métodos clássicos",
      "page": "funcao-dispersao"
    },
    {
      "question": "Por que colisões são inevitáveis em uma tabela hash?",
      "options": [
        "Porque o universo de chaves possíveis é muito maior que o número de posições m",
        "Porque a função de dispersão é aleatória",
        "Porque o vetor nunca é grande o bastante para uma chave",
        "Porque o encadeamento exige colisões para funcionar"
      ],
      "correct": 0,
      "topic": "Tratamento de colisões",
      "section": "O que é uma colisão",
      "page": "tratamento-colisoes"
    },
    {
      "question": "Qual problema é típico da sondagem linear?",
      "options": [
        "A necessidade de uma segunda função hash",
        "A impossibilidade de inserir chaves repetidas",
        "O agrupamento primário: blocos contíguos de posições ocupadas que crescem e atraem novas chaves",
        "O uso obrigatório de listas encadeadas"
      ],
      "correct": 2,
      "topic": "Tratamento de colisões",
      "section": "Endereçamento aberto",
      "page": "tratamento-colisoes"
    },
    {
      "question": "No hash duplo, h(k, i) = (h₁(k) + i·h₂(k)) mod m. Qual condição h₂(k) precisa respeitar?",
      "options": [
        "Pode valer 0 quando a tabela está vazia",
        "Nunca deve ser 0 e deve ser coprimo com m",
        "Deve ser sempre igual a h₁(k)",
        "Deve ser par"
      ],
      "correct": 1,
      "topic": "Tratamento de colisões",
      "section": "Endereçamento aberto",
      "page": "tratamento-colisoes"
    },
    {
      "question": "Uma tabela tem m = 20 posições e armazena n = 15 elementos. Qual é o fator de carga α?",
      "options": ["1,33", "5", "0,25", "0,75"],
      "correct": 3,
      "topic": "Eficiência de tabelas hash",
      "section": "Fator de carga",
      "page": "eficiencia"
    },
    {
      "question": "Em endereçamento aberto com hashing uniforme e α = 0,75, quantas sondagens são esperadas, em média, em uma busca sem sucesso?",
      "options": ["4", "3", "1,33", "75"],
      "correct": 0,
      "topic": "Eficiência de tabelas hash",
      "section": "Análise com endereçamento aberto",
      "page": "eficiencia"
    },
    {
      "question": "Ao redimensionar a tabela, por que cada elemento precisa ser reinserido com a função hash?",
      "options": [
        "Para eliminar todas as colisões da tabela",
        "Porque o vetor antigo é apagado automaticamente",
        "Porque o índice h(k) mod m depende de m e muda quando m muda",
        "Para ordenar as chaves"
      ],
      "correct": 2,
      "topic": "Eficiência de tabelas hash",
      "section": "Rehashing",
      "page": "eficiencia"
    },
    {
      "question": "Um sistema distribuído escolhe o servidor de cada dado por hash(chave) mod N. O que acontece quando N muda?",
      "options": [
        "Nenhuma chave muda de servidor",
        "Só as chaves do servidor novo mudam",
        "Os servidores antigos deixam de ser usados",
        "Quase todas as chaves passam a ter outro servidor, e por isso se usa o hashing consistente"
      ],
      "correct": 3,
      "topic": "Exemplos e aplicações",
      "section": "Casos de uso reais",
      "page": "exemplos-aplicacoes"
    },
    {
      "question": "Uma equipe vai armazenar senhas de usuários. Qual abordagem é apropriada?",
      "options": [
        "Uma função de hash criptográfica lenta, como o bcrypt, projetada para segurança",
        "A função polinomial ×31, por ser rápida",
        "A soma dos códigos dos caracteres",
        "O resto da divisão k mod m"
      ],
      "correct": 0,
      "topic": "Exemplos e aplicações",
      "section": "Hash criptográfico",
      "page": "exemplos-aplicacoes"
    }
  ]
}
```
