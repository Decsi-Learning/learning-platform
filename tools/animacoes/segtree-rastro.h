/* Rastreador das animações da Segment Tree (não aparece na aula).
   Incluído logo depois da definição de arvore, dentro de um trecho //---OCULTO---.
   Cada T("tag", V(x), ...) imprime numa única linha: a tag, os inteiros, o vetor e todos os nós da árvore.
   Compilando com -DSEM_RASTRO, T e H somem e o programa fica igual ao mostrado na aula. */
#ifdef SEM_RASTRO
#define T(...) ((void)0)
#define H(x) ((void)0)
#else
#include <stdio.h>
#include <stdarg.h>
#include <string.h>

#define V(x) #x, (int)(x)
#define T(tag, ...) rastro(tag, ##__VA_ARGS__, (const char *)0)
#define H(x) x

static int *rV, rN, rFoco, rA = -1, rB = -1;
static int rFeito[4 * MAX];   /* 1 = o valor do nó já foi calculado */
static int rMarca[4 * MAX];   /* 1 = parcial, 2 = dentro, 3 = fora, 4 = acabou de mudar */

static void rLimpar(void) { memset(rMarca, 0, sizeof rMarca); }

/* pré-ordem: no:ini:fim:valor:feito:marca */
static void rNo(int no, int ini, int fim) {
    printf(" %d:%d:%d:%d:%d:%d", no, ini, fim, arvore[no], rFeito[no], rMarca[no]);
    if (ini == fim) return;
    int meio = (ini + fim) / 2;
    rNo(2 * no, ini, meio);
    rNo(2 * no + 1, meio + 1, fim);
}

static void rastro(const char *tag, ...) {
    va_list ap;
    const char *nome;
    va_start(ap, tag);
    printf("%s", tag);
    while ((nome = va_arg(ap, const char *)) != 0) printf(" %s=%d", nome, va_arg(ap, int));
    va_end(ap);
    printf(" foco=%d a=%d b=%d @v=", rFoco, rA, rB);
    for (int i = 0; i < rN; i++) printf("%s%d", i ? "," : "", rV[i]);
    printf(" #");
    if (rN) rNo(1, 0, rN - 1);
    printf("\n");
}
#endif
