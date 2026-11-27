/* Animação da busca de um ponto na QuadTree. Gerar: node tools/animacoes/gerar-quadtree.js */
//---MOSTRAR---
#include <stdio.h>
/* Ponto, NoQuad, criarNo, ehFolha, quadrante, dividir e inserir: veja o primeiro programa */
//---OCULTO---
#include <stdlib.h>

typedef struct {
    int x, y;
    char nome;
} Ponto;

typedef struct NoQuad {
    int x0, y0, lado;              /* região: x0 <= x < x0 + lado e y0 <= y < y0 + lado */
    Ponto *ponto;                  /* numa folha: o ponto guardado, ou NULL */
    struct NoQuad *filhos[4];      /* 0 = NO, 1 = NE, 2 = SO, 3 = SE; NULL numa folha */
} NoQuad;

NoQuad *criarNo(int x0, int y0, int lado) {
    NoQuad *no = malloc(sizeof(NoQuad));
    no->x0 = x0;
    no->y0 = y0;
    no->lado = lado;
    no->ponto = NULL;
    for (int i = 0; i < 4; i++) {
        no->filhos[i] = NULL;
    }
    return no;
}

int ehFolha(NoQuad *no) {
    return no->filhos[0] == NULL;
}

/* em qual quadrante de no fica (x, y): 0 = NO, 1 = NE, 2 = SO, 3 = SE */
int quadrante(NoQuad *no, int x, int y) {
    int meio = no->lado / 2;
    int leste = x >= no->x0 + meio;
    int norte = y >= no->y0 + meio;
    if (norte) return leste ? 1 : 0;
    return leste ? 3 : 2;
}

/* transforma a folha no em um nó com 4 filhos vazios */
void dividir(NoQuad *no) {
    int m = no->lado / 2;
    no->filhos[0] = criarNo(no->x0, no->y0 + m, m);
    no->filhos[1] = criarNo(no->x0 + m, no->y0 + m, m);
    no->filhos[2] = criarNo(no->x0, no->y0, m);
    no->filhos[3] = criarNo(no->x0 + m, no->y0, m);
}

void inserir(NoQuad *no, Ponto *p) {
    while (!ehFolha(no)) {
        int q = quadrante(no, p->x, p->y);
        no = no->filhos[q];
    }
    if (no->ponto == NULL) {
        no->ponto = p;
        return;
    }
    Ponto *antigo = no->ponto;
    no->ponto = NULL;
    dividir(no);
    inserir(no, antigo);
    inserir(no, p);
}
#include "quad-rastro.h"
//---FIM-OCULTO---

/* devolve 1 se o ponto (x, y) está na árvore */
int buscar(NoQuad *no, int x, int y) {
    H(rFoco = no);
    T("inicio", V(x), V(y));
    while (!ehFolha(no)) {
        int q = quadrante(no, x, y);
        H(rFoco = no->filhos[q]);
        T("desce", V(q), V(x), V(y));
        no = no->filhos[q];
    }
    T("folha", V(x), V(y));
    Ponto *p = no->ponto;
    return p != NULL && p->x == x && p->y == y;
}

int main(void) {
    Ponto pontos[] = {{2, 1, 'A'}, {6, 6, 'B'}, {1, 6, 'C'}, {3, 7, 'D'}, {5, 1, 'E'}};
    NoQuad *raiz = criarNo(0, 0, 8);
    for (int i = 0; i < 5; i++) {
        inserir(raiz, &pontos[i]);
    }
    H(rRaiz = raiz); H(rFoco = 0);
    T("arvore");
    printf("%d\n", buscar(raiz, 3, 7));
    printf("%d\n", buscar(raiz, 3, 6));
    printf("%d\n", buscar(raiz, 7, 2));
    return 0;
}
