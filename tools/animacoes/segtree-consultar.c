/* Animação da consulta de soma num intervalo da Segment Tree. Gerar: node tools/animacoes/gerar-segtree.js */
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

/* soma de v[a..b], olhando o nó no, que cobre v[ini..fim] */
int consultar(int no, int ini, int fim, int a, int b) {
    H(rFoco = no);
    T("entra", V(no), V(ini), V(fim));
    if (b < ini || fim < a) {
        H(rMarca[no] = 3);
        T("fora", V(no), V(ini), V(fim));
        return 0;                  /* fora: nada a somar */
    }
    if (a <= ini && fim <= b) {
        H(rMarca[no] = 2);
        T("dentro", V(no), V(ini), V(fim), V(arvore[no]));
        return arvore[no];         /* dentro: o nó serve inteiro */
    }
    int meio = (ini + fim) / 2;    /* parcial: pergunta aos dois filhos */
    H(rMarca[no] = 1);
    T("parcial", V(no), V(ini), V(fim), V(meio));
    int esq = consultar(2 * no, ini, meio, a, b);
    H(rFoco = no);
    int dir = consultar(2 * no + 1, meio + 1, fim, a, b);
    H(rFoco = no);
    T("volta", V(no), V(ini), V(fim), V(esq), V(dir));
    return esq + dir;
}

int main(void) {
    int v[] = {2, 5, 1, 4, 9, 3};
    int n = 6;
    construir(v, 1, 0, n - 1);
    H(for (int i = 1; i < 4 * MAX; i++) rFeito[i] = 1);
    H(rV = v); H(rN = n); H(rFoco = 0);
    T("arvore");
    H(rA = 1); H(rB = 4);
    int s = consultar(1, 0, n - 1, 1, 4);
    H(rFoco = 0);
    T("res1", V(s));
    printf("%d\n", s);
    H(rLimpar()); H(rA = 0); H(rB = 2);
    s = consultar(1, 0, n - 1, 0, 2);
    H(rFoco = 0);
    T("res2", V(s));
    printf("%d\n", s);
    return 0;
}
