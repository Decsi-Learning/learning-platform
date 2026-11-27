/* Animação da atualização de uma posição na Segment Tree. Gerar: node tools/animacoes/gerar-segtree.js */
//---MOSTRAR---
/* arvore e construir: veja o primeiro programa */
//---OCULTO---
#include <stdio.h>

#define MAX 100

int arvore[4 * MAX];   /* arvore[no] = soma do trecho do vetor que o nó cobre */

/* monta o nó no, que cobre v[ini..fim] */
void construir(int v[], int no, int ini, int fim) {
    if (ini == fim) {
        arvore[no] = v[ini];
        return;
    }
    int meio = (ini + fim) / 2;
    construir(v, 2 * no, ini, meio);
    construir(v, 2 * no + 1, meio + 1, fim);
    arvore[no] = arvore[2 * no] + arvore[2 * no + 1];
}
#include "segtree-rastro.h"
//---FIM-OCULTO---

/* v[pos] passa a valer valor; corrige as somas do caminho até a folha */
void atualizar(int no, int ini, int fim, int pos, int valor) {
    H(rFoco = no); H(rMarca[no] = 1);
    T("entra", V(no), V(ini), V(fim));
    if (ini == fim) {
        H(int antes = arvore[no]);
        arvore[no] = valor;
        H(rMarca[no] = 4);
        T("folha", V(no), V(ini), V(antes), V(valor));
        return;
    }
    int meio = (ini + fim) / 2;
    T("meio", V(no), V(ini), V(fim), V(meio), V(pos));
    if (pos <= meio) {
        atualizar(2 * no, ini, meio, pos, valor);
    } else {
        atualizar(2 * no + 1, meio + 1, fim, pos, valor);
    }
    H(rFoco = no); H(int antes = arvore[no]);
    arvore[no] = arvore[2 * no] + arvore[2 * no + 1];
    H(rMarca[no] = 4);
    T("soma", V(no), V(ini), V(fim), V(antes));
}

int main(void) {
    int v[] = {2, 5, 1, 4, 9, 3};
    int n = 6;
    construir(v, 1, 0, n - 1);
    H(for (int i = 1; i < 4 * MAX; i++) rFeito[i] = 1);
    H(rV = v); H(rN = n); H(rFoco = 0);
    T("arvore", V(arvore[1]));
    atualizar(1, 0, n - 1, 2, 6);   /* v[2]: de 1 para 6 */
    H(rFoco = 0); H(rLimpar());
    T("pronto", V(arvore[1]));
    printf("%d\n", arvore[1]);
    return 0;
}
