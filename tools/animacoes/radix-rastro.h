/* Rastreador das animações da árvore Radix (não aparece na aula).
   Incluído logo depois da definição de NoRadix, dentro de um trecho //---OCULTO---.
   Cada T("tag", V(x), ...) imprime numa única linha: a tag, os inteiros, a chave e a árvore inteira.
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

static NoRadix *rRaiz, *rFoco, *rSolto, *rCompara, *rNovo;
static const char *rPalavra = "", *rResto = "";

/* pré-ordem: @profundidade:rotulo:fim:marca (marca 1 = foco, 2 = comparando, 3 = novo) */
static void rNo(NoRadix *no, int d) {
    int marca = no == rFoco ? 1 : no == rCompara ? 2 : no == rNovo ? 3 : 0;
    printf(" @%d:%s:%d:%d", d, no->rotulo, no->fimDePalavra ? 1 : 0, marca);
    for (int i = 0; i < TAM_ALFABETO; i++)
        if (no->filhos[i] != NULL) rNo(no->filhos[i], d + 1);
}

static void rastro(const char *tag, ...) {
    va_list ap;
    const char *nome;
    va_start(ap, tag);
    printf("%s", tag);
    while ((nome = va_arg(ap, const char *)) != 0) printf(" %s=%d", nome, va_arg(ap, int));
    va_end(ap);
    printf(" $palavra=%s $resto=%s #", rPalavra, rResto);
    if (rRaiz) rNo(rRaiz, 0);
    if (rSolto) { printf(" &"); rNo(rSolto, 0); }
    printf("\n");
}
#endif
