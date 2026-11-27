/* Rastreador das animações da QuadTree (não aparece na aula).
   Incluído logo depois da definição de NoQuad, dentro de um trecho //---OCULTO---.
   Cada T("tag", V(x), ...) imprime numa única linha: a tag, os inteiros e a árvore inteira em pré-ordem.
   Compilando com -DSEM_RASTRO, T e H somem e o programa fica igual ao mostrado na aula. */
#ifdef SEM_RASTRO
#define T(...) ((void)0)
#define H(x) ((void)0)
#else
#include <stdio.h>
#include <stdarg.h>

#define V(x) #x, (int)(x)
#define T(tag, ...) rastro(tag, ##__VA_ARGS__, (const char *)0)
#define H(x) x

static NoQuad *rRaiz, *rFoco;
static char rPonto = '-';          /* ponto em uso (inserção) */
static NoQuad *rNos[128];          /* marcas: 2 = novo/alterado, 3 = descartado, 4 = contado */
static int rMarcas[128], rQtd;

__attribute__((unused)) static void rMarca(NoQuad *no, int m) {
    for (int i = 0; i < rQtd; i++) if (rNos[i] == no) { rMarcas[i] = m; return; }
    rNos[rQtd] = no; rMarcas[rQtd++] = m;
}
static int rMarcaDe(NoQuad *no) {
    for (int i = 0; i < rQtd; i++) if (rNos[i] == no) return rMarcas[i];
    return 0;
}
__attribute__((unused)) static void rLimpar(void) { rQtd = 0; }

/* pré-ordem: @profundidade:x0:y0:lado:folha:ponto:marca (ponto = letra ou -; marca 1 = foco) */
static void rNo(NoQuad *no, int d) {
    int folha = no->filhos[0] == NULL;
    int marca = no == rFoco ? 1 : rMarcaDe(no);
    printf(" @%d:%d:%d:%d:%d:%c:%d", d, no->x0, no->y0, no->lado, folha, no->ponto ? no->ponto->nome : '-', marca);
    if (!folha) for (int i = 0; i < 4; i++) rNo(no->filhos[i], d + 1);
}

static void rastro(const char *tag, ...) {
    va_list ap;
    const char *nome;
    va_start(ap, tag);
    printf("%s", tag);
    while ((nome = va_arg(ap, const char *)) != 0) printf(" %s=%d", nome, va_arg(ap, int));
    va_end(ap);
    printf(" $ponto=%c #", rPonto);
    if (rRaiz) rNo(rRaiz, 0);
    printf("\n");
}
#endif
