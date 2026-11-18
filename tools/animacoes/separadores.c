#include <stdio.h>
#include <string.h>
#include <stdarg.h>

/* ---- Rastreador: T(...), H(...) e o trecho OCULTO não aparecem na aula (ver lib.js) ---- */
#define V(x) #x, (int)(x)
#define T(tag, ...) trace(tag, ##__VA_ARGS__, (const char *)0)
#define H(x) x
static void trace(const char *tag, ...) {
    va_list ap;
    const char *nome;
    va_start(ap, tag);
    printf("%s", tag);
    while ((nome = va_arg(ap, const char *)) != 0) printf(" %s=%d", nome, va_arg(ap, int));
    va_end(ap);
    printf("\n");
}
//---MOSTRAR---
#include <stdio.h>
#include <string.h>

/* Lê um registro: campos separados por ';' e registro terminado por '#'.
   Devolve quantos campos leu. */
int lerRegistro(FILE *f, char campos[][20]) {
    int n = 0, tam = 0, c;
    while ((c = fgetc(f)) != EOF) {
        T("le", "byte", c, V(n), V(tam));
        if (c == ';' || c == '#') {
            T("fimCampo", "byte", c, V(n), V(tam));
            campos[n][tam] = '\0';
            n++;
            tam = 0;
            if (c == '#') {
                T("fimRegistro", V(n));
                break;
            }
        } else {
            T("junta", "byte", c, V(n), V(tam));
            campos[n][tam++] = (char)c;
        }
    }
    return n;
}

int main(void) {
    FILE *f = fopen("reg.txt", "w+");
    fputs("Ana;TI;BH#", f);
    rewind(f);
    char campos[3][20];
    int n = lerRegistro(f, campos);
    T("fim", V(n));
    for (int i = 0; i < n; i++) {
        printf("campo %d: %s\n", i, campos[i]);
    }
    fclose(f);
    return 0;
}
