/* Animação da construção da Segment Tree. Gerar: node tools/animacoes/gerar-segtree.js */
//---MOSTRAR---
#include <stdio.h>

#define MAX 100

int arvore[4 * MAX];   /* arvore[no] = soma do trecho do vetor que o nó cobre */
//---OCULTO---
#include "segtree-rastro.h"
//---FIM-OCULTO---

/* monta o nó no, que cobre v[ini..fim] */
void construir(int v[], int no, int ini, int fim) {
    H(rFoco = no);
    T("entra", V(no), V(ini), V(fim));
    if (ini == fim) {
        arvore[no] = v[ini];
        H(rFeito[no] = 1); H(rMarca[no] = 4);
        T("folha", V(no), V(ini));
        return;
    }
    int meio = (ini + fim) / 2;
    T("meio", V(no), V(ini), V(fim), V(meio));
    construir(v, 2 * no, ini, meio);
    H(rFoco = no); H(rLimpar());
    construir(v, 2 * no + 1, meio + 1, fim);
    H(rFoco = no); H(rLimpar());
    arvore[no] = arvore[2 * no] + arvore[2 * no + 1];
    H(rFeito[no] = 1); H(rMarca[no] = 4);
    T("soma", V(no), V(ini), V(fim));
    H(rLimpar());
}

int main(void) {
    int v[] = {2, 5, 1, 4, 9, 3};
    int n = 6;
    H(rV = v); H(rN = n); H(rFoco = 0);
    T("vetor");
    construir(v, 1, 0, n - 1);
    H(rFoco = 0);
    T("pronto");
    printf("%d\n", arvore[1]);
    return 0;
}
