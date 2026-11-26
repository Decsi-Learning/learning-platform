/* Animação da busca na árvore Radix. Gerar: node tools/animacoes/gerar-radix.js
   O trecho OCULTO repete, sem rastro, as definições do primeiro programa (o gerador confere que são iguais). */
//---MOSTRAR---
#include <stdio.h>
/* NoRadix, criarNo, prefixoComum e inserir: veja o primeiro programa */
//---OCULTO---
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#define TAM_ALFABETO 26

typedef struct NoRadix {
    char *rotulo;                          /* pedaço da chave guardado neste nó */
    struct NoRadix *filhos[TAM_ALFABETO];  /* posição = 1ª letra do rótulo do filho */
    bool fimDePalavra;                     /* o caminho até aqui é uma palavra? */
} NoRadix;

/* cria um nó cujo rótulo é uma cópia dos tam primeiros caracteres de texto */
NoRadix *criarNo(const char *texto, int tam, bool fim) {
    NoRadix *no = malloc(sizeof(NoRadix));
    no->rotulo = malloc(tam + 1);
    memcpy(no->rotulo, texto, tam);
    no->rotulo[tam] = '\0';
    for (int i = 0; i < TAM_ALFABETO; i++) {
        no->filhos[i] = NULL;
    }
    no->fimDePalavra = fim;
    return no;
}

/* quantos caracteres do início de a e b são iguais */
int prefixoComum(const char *a, const char *b) {
    int k = 0;
    while (a[k] != '\0' && a[k] == b[k]) {
        k++;
    }
    return k;
}

void inserir(NoRadix *raiz, const char *chave) {
    NoRadix *atual = raiz;
    while (*chave != '\0') {
        int indice = chave[0] - 'a';
        NoRadix *filho = atual->filhos[indice];
        if (filho == NULL) {
            atual->filhos[indice] = criarNo(chave, strlen(chave), true);
            return;
        }
        int k = prefixoComum(filho->rotulo, chave);
        if (filho->rotulo[k] != '\0') {
            NoRadix *meio = criarNo(filho->rotulo, k, false);
            memmove(filho->rotulo, filho->rotulo + k, strlen(filho->rotulo) - k + 1);
            meio->filhos[filho->rotulo[0] - 'a'] = filho;
            atual->filhos[indice] = meio;
            filho = meio;
        }
        atual = filho;
        chave += k;
    }
    atual->fimDePalavra = true;
}
#include "radix-rastro.h"
//---FIM-OCULTO---

bool buscar(NoRadix *raiz, const char *chave) {
    H(rPalavra = chave); H(rResto = chave); H(rFoco = raiz); H(rCompara = 0);
    T("inicio");
    NoRadix *atual = raiz;
    while (*chave != '\0') {
        NoRadix *filho = atual->filhos[chave[0] - 'a'];
        H(rCompara = filho);
        T("olha");
        if (filho == NULL) {
            T("semFilho");
            return false;
        }
        int tam = strlen(filho->rotulo);
        T("tamanho", V(tam));
        if (strncmp(filho->rotulo, chave, tam) != 0) {
            T("diverge", V(tam));
            return false;
        }
        atual = filho;
        H(rFoco = atual); H(rCompara = 0);
        T("desce", V(tam));
        chave += tam;
        H(rResto = chave);
    }
    T("acabou");
    return atual->fimDePalavra;
}

int main(void) {
    NoRadix *raiz = criarNo("", 0, false);
    inserir(raiz, "casa");
    inserir(raiz, "caso");
    inserir(raiz, "cama");
    inserir(raiz, "ca");
    H(rRaiz = raiz);
    T("arvore");
    printf("%d\n", buscar(raiz, "caso"));   /* 1 */
    printf("%d\n", buscar(raiz, "cam"));    /* 0 */
    printf("%d\n", buscar(raiz, "cas"));    /* 0 */
    printf("%d\n", buscar(raiz, "dia"));    /* 0 */
    return 0;
}
