/* Animação da remoção na árvore Radix. Gerar: node tools/animacoes/gerar-radix.js
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
#include <stdlib.h>
#include <string.h>

int contarFilhos(NoRadix *no) {
    int total = 0;
    for (int i = 0; i < TAM_ALFABETO; i++) {
        if (no->filhos[i] != NULL) total++;
    }
    return total;
}

/* junta o nó com seu único filho: "s" + "a" vira "sa" */
void fundir(NoRadix *no) {
    NoRadix *unico = NULL;
    for (int i = 0; i < TAM_ALFABETO; i++) {
        if (no->filhos[i] != NULL) unico = no->filhos[i];
    }
    char *junto = malloc(strlen(no->rotulo) + strlen(unico->rotulo) + 1);
    strcpy(junto, no->rotulo);
    strcat(junto, unico->rotulo);
    free(no->rotulo);
    no->rotulo = junto;
    no->fimDePalavra = unico->fimDePalavra;
    memcpy(no->filhos, unico->filhos, sizeof(no->filhos));
    free(unico->rotulo);
    free(unico);
}

/* devolve true quando o nó ficou inútil e o pai deve liberá-lo */
bool removerRec(NoRadix *no, const char *chave) {
    H(rFoco = no); H(rResto = chave); H(rCompara = 0);
    T("entra");
    if (*chave == '\0') {
        T("fimChave");
        if (!no->fimDePalavra) return false;
        no->fimDePalavra = false;
        T("desmarca", "filhos", contarFilhos(no));
        return contarFilhos(no) == 0;
    }
    int indice = chave[0] - 'a';
    NoRadix *filho = no->filhos[indice];
    if (filho == NULL) return false;
    int tam = strlen(filho->rotulo);
    if (strncmp(filho->rotulo, chave, tam) != 0) return false;
    H(rCompara = filho);
    T("desceRec", V(tam));
    if (removerRec(filho, chave + tam)) {
        H(rFoco = no); H(rResto = chave); H(rCompara = filho);
        T("libera");
        free(filho->rotulo);
        free(filho);
        no->filhos[indice] = NULL;
        H(rCompara = 0);
        T("liberado");
    } else if (!filho->fimDePalavra && contarFilhos(filho) == 1) {
        H(rFoco = no); H(rResto = chave); H(rCompara = filho);
        T("funde");
        fundir(filho);
        T("fundido");
    }
    H(rFoco = no); H(rResto = chave);
    T("volta", "filhos", contarFilhos(no));
    return !no->fimDePalavra && contarFilhos(no) == 0;
}

void remover(NoRadix *raiz, const char *chave) {
    H(rPalavra = chave);
    removerRec(raiz, chave);
}

int main(void) {
    NoRadix *raiz = criarNo("", 0, false);
    inserir(raiz, "casa");
    inserir(raiz, "caso");
    inserir(raiz, "cama");
    inserir(raiz, "ca");
    H(rRaiz = raiz);
    T("arvore");
    remover(raiz, "caso");
    remover(raiz, "ca");
    remover(raiz, "cama");
    H(rFoco = 0); H(rCompara = 0); H(rPalavra = ""); H(rResto = "");
    T("pronto");
    printf("%s\n", raiz->filhos['c' - 'a']->rotulo);   /* casa */
    return 0;
}
