# Como rodar o DECSI Learning localmente

Este guia explica como baixar o projeto e abrir o site no computador. O site é estático; não é necessário instalar dependências para visualizar as páginas e os conteúdos.

## 1. Instale o Git e o Python 3

Se ainda não tiver esses programas, instale o [Git](https://git-scm.com/downloads) e o [Python 3](https://www.python.org/downloads/). O Python será usado apenas para servir os arquivos no navegador.

## 2. Baixe o projeto

Abra o terminal e clone a branch que contém este guia. Troque `NOME-DA-BRANCH` pelo nome publicado no GitHub:

```bash
git clone --branch NOME-DA-BRANCH https://github.com/decsi-learning/learning-platform.git
cd learning-platform
```

Se já tiver uma cópia do projeto, entre na pasta e atualize para essa branch:

```bash
git fetch origin
git switch NOME-DA-BRANCH
git pull
```

## 3. Inicie um servidor local

Na pasta do projeto, rode:

```bash
python3 -m http.server 8000
```

No Windows, se `python3` não for reconhecido, tente:

```bash
py -m http.server 8000
```

Mantenha o terminal aberto enquanto estiver usando o site. O servidor mostra o endereço local e registra os acessos.

## 4. Abra o site

No navegador, acesse:

```text
http://localhost:8000
```

Para encerrar o servidor, volte ao terminal e pressione `Ctrl+C`.

## O que funciona localmente

- Navegar pelas páginas e pelos tópicos cadastrados em `content/`.
- Abrir e testar a interface do site servida em `localhost`.
- Ver o assistente de estudos, que envia perguntas ao Worker remoto já configurado no projeto. Ele precisa de conexão com a internet e pode depender da disponibilidade desse serviço.

O projeto também contém funções de cadastro, login e sincronização de progresso que usam o Worker remoto e o banco D1. Esses recursos dependem da configuração e disponibilidade dos serviços compartilhados; iniciar o servidor local, por si só, não cria uma conta de desenvolvimento nem um banco local. O progresso sem login é guardado no armazenamento do próprio navegador.

## Solução de problemas

- **A página não abre:** confirme que o terminal ainda está executando o servidor e tente `http://127.0.0.1:8000`.
- **Erro de endereço em uso:** outra aplicação já pode estar usando a porta 8000. Tente, por exemplo, `python3 -m http.server 5500` e abra `http://localhost:5500`.
- **Abriu uma página de listagem de arquivos:** confira se o terminal está na pasta `learning-platform` antes de iniciar o servidor.
- **O assistente, cadastro ou login falha:** confira a conexão com a internet. Essas funções dependem do Worker remoto e de suas configurações, não apenas dos arquivos locais.
