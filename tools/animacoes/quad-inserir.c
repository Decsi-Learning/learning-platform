/* Animação da inserção na QuadTree. Gerar: node tools/animacoes/gerar-quadtree.js */
//---MOSTRAR---
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
//---OCULTO---
#include "quad-rastro.h"
//---FIM-OCULTO---

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
    H(rPonto = p->nome); H(rFoco = no);
    T("inicio", V(p->x), V(p->y));
    while (!ehFolha(no)) {
        int q = quadrante(no, p->x, p->y);
        H(rFoco = no->filhos[q]);
        T("desce", V(q), V(p->x), V(p->y));
        no = no->filhos[q];
    }
    T("folha", V(p->x), V(p->y));
    if (no->ponto == NULL) {
        no->ponto = p;
        H(rMarca(no, 2));
        T("guarda", V(p->x), V(p->y));
        H(rLimpar());
        return;
    }
    Ponto *antigo = no->ponto;
    no->ponto = NULL;
    dividir(no);
    H(rMarca(no->filhos[0], 2)); H(rMarca(no->filhos[1], 2)); H(rMarca(no->filhos[2], 2)); H(rMarca(no->filhos[3], 2));
    T("divide", V(no->x0), V(no->y0), V(no->lado), V(antigo->x), V(antigo->y));
    H(rLimpar());
    inserir(no, antigo);
    H(rPonto = p->nome);
    inserir(no, p);
}

int main(void) {
    Ponto pontos[] = {{2, 1, 'A'}, {6, 6, 'B'}, {1, 6, 'C'}, {3, 7, 'D'}, {5, 1, 'E'}};
    NoQuad *raiz = criarNo(0, 0, 8);
    H(rRaiz = raiz); H(rFoco = raiz);
    T("raiz");
    for (int i = 0; i < 5; i++) {
        inserir(raiz, &pontos[i]);
    }
    H(rFoco = 0); H(rPonto = '-');
    T("pronto");
    return 0;
}
