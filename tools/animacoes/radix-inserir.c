/* Animação da inserção na árvore Radix. Gerar: node tools/animacoes/gerar-radix.js */
//---MOSTRAR---
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#define TAM_ALFABETO 26

typedef struct NoRadix {
    char *rotulo;                          /* pedaço da chave guardado neste nó */
    struct NoRadix *filhos[TAM_ALFABETO];  /* posição = 1ª letra do rótulo do filho */
    bool fimDePalavra;                     /* o caminho até aqui é uma palavra? */
} NoRadix;
//---OCULTO---
#include "radix-rastro.h"
//---FIM-OCULTO---

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
    H(rPalavra = chave); H(rResto = chave); H(rFoco = raiz); H(rCompara = 0); H(rNovo = 0);
    T("inicio");
    NoRadix *atual = raiz;
    while (*chave != '\0') {
        int indice = chave[0] - 'a';
        NoRadix *filho = atual->filhos[indice];
        H(rCompara = filho);
        T("olha", V(indice));
        if (filho == NULL) {
            atual->filhos[indice] = criarNo(chave, strlen(chave), true);
            H(rCompara = 0); H(rNovo = atual->filhos[indice]);
            T("folha", V(indice));
            return;
        }
        int k = prefixoComum(filho->rotulo, chave);
        T("comum", V(k));
        if (filho->rotulo[k] != '\0') {
            NoRadix *meio = criarNo(filho->rotulo, k, false);
            H(rSolto = meio); H(rNovo = meio);
            T("meio", V(k));
            memmove(filho->rotulo, filho->rotulo + k, strlen(filho->rotulo) - k + 1);
            T("encurta", V(k));
            meio->filhos[filho->rotulo[0] - 'a'] = filho;
            T("liga", V(k));
            atual->filhos[indice] = meio;
            H(rSolto = 0); H(rCompara = meio);
            T("troca", V(k));
            filho = meio;
        }
        atual = filho;
        H(rFoco = atual); H(rCompara = 0); H(rNovo = 0);
        T("desce", V(k));
        chave += k;
        H(rResto = chave);
    }
    T("acabou");
    atual->fimDePalavra = true;
    T("marca");
}

int main(void) {
    NoRadix *raiz = criarNo("", 0, false);
    H(rRaiz = raiz);
    T("raiz");
    inserir(raiz, "casa");
    inserir(raiz, "caso");
    inserir(raiz, "cama");
    inserir(raiz, "ca");
    H(rFoco = 0); H(rNovo = 0); H(rPalavra = ""); H(rResto = "");
    T("pronto");
    return 0;
}
