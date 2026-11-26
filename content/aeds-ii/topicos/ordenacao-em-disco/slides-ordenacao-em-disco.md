# Slides — Ordenação em disco e reutilização de espaço

Esta apresentação reúne os conteúdos estudados neste tópico.

## Slides

Use os botões ou as setas do teclado para passar os slides.

```slides
{
  "slides": [
    { "title": "O problema", "bullets": ["Como ordenar um arquivo maior que a memória principal?", "O custo é o número de passadas pelo disco.", "Intercalação = 'Interpolação' no plano de ensino."] },
    { "title": "Intercalar duas listas ordenadas", "bullets": ["Compare as cabeças das duas listas.", "Copie o menor e avance.", "Cada lista é lida uma vez, em sequência."] },
    { "title": "Mergesort externo: fase 1", "bullets": ["A RAM comporta n registros.", "Carrega n registros, ordena na RAM (Quicksort) e salva em um arquivo.", "Repete até acabar: k = T / n arquivos ordenados."] },
    { "title": "Mergesort externo: fase 2", "bullets": ["Multi-way merging com k + 1 buffers de tamanho n / (k + 1).", "1 buffer de saída e k de entrada.", "Entrada vazio: lê mais. Saída cheio: grava.", "O menor é achado olhando a cabeça dos k buffers."] },
    { "title": "Custo da escolha do menor", "bullets": ["Varredura linear: até k - 1 comparações por registro.", "Um heap reduziria para O(log k).", "Se k + 1 > n, intercala p arquivos por vez em várias passadas."] },
    { "title": "Seleção por substituição", "bullets": ["Mantém n registros em memória.", "Tira o menor e lê o próximo.", "Se o novo for menor, espera a próxima run.", "Runs com cerca de 2n registros, em média."] },
    { "title": "Quantas passadas?", "bullets": ["p vias: ⌈log_p k⌉ passadas.", "k = 100, p = 2: 7 passadas.", "k = 100, p = 10: 2 passadas.", "p grande: buffers menores e mais seeks."] },
    { "title": "Balanceada e polifásica", "bullets": ["Balanceada: 2p arquivos, copia tudo a cada passada.", "Polifásica: p + 1 arquivos; o que esvazia vira a saída.", "Distribuição inicial por números de Fibonacci."] },
    { "title": "Reutilizando espaço", "bullets": ["Registros removidos recebem uma marca.", "Lista de vagas guarda tamanho e offset.", "First-fit: a primeira que cabe.", "Best-fit: lista crescente, a menor que cabe.", "Worst-fit: lista decrescente, a maior."] },
    { "title": "Fragmentação interna", "bullets": ["Vaga maior que o registro: a sobra fica DENTRO da área dele.", "Ex.: 35 bytes em uma vaga de 40: sobram 5 dentro."] },
    { "title": "Fragmentação externa", "bullets": ["A sobra volta à lista como uma vaga pequena.", "Muitas vagas minúsculas: nenhuma serve sozinha.", "Remédios: juntar vagas vizinhas e compactar."] },
    { "title": "Compactação", "bullets": ["Recupera o espaço de todos os removidos de uma vez.", "Mais simples: copiar o arquivo pulando os removidos.", "No próprio arquivo: mais complicado e lento.", "Os offsets e RRNs mudam."] }
  ]
}
```

## Vídeo explicativo

```video
{ "title": "Ordenação em disco e reutilização de espaço", "url": null }
```

## Conteúdos abordados

- Intercalação e mergesort externo
- Passadas, balanceada e polifásica
- Reutilização de espaço e fragmentação

## Referências

- FOLK, M. J.; ZOELLICK, B. *File Structures: An Object-Oriented Approach with C++*, 3ª ed., Addison-Wesley. Assuntos: processamento cossequencial (intercalação) e ordenação de arquivos grandes; reaproveitamento de espaço, estratégias de colocação (first-fit, best-fit) e fragmentação.
- THARP, A. L. *File Organization and Processing*, Wiley. Assuntos: ordenação externa, intercalação e métodos para ordenar arquivos grandes.
- ZIVIANI, N. *Projeto de Algoritmos*, 2ª ed., Thomson Pioneira. Assuntos: ordenação externa (intercalação balanceada de vários caminhos, seleção por substituição e intercalação polifásica).
- CORMEN, T. H.; LEISERSON, C. E.; RIVEST, R. L.; STEIN, C. *Introduction to Algorithms*, 3ª ed., MIT Press. Assunto: a operação de intercalação (*merge*) usada no Mergesort.
- ALEXANDRE, R. F. Slides das aulas "Organização dos dados em memória secundária" (ordenação externa, 28/10/2025) e "Manipulação de arquivos de registros" (Estrutura de Dados II), UFOP.


