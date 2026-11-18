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

/* Arquivo misto: cada linha é um registro e o primeiro caractere é o código do tipo.
   'A' = aluno (nome;curso)    'D' = disciplina (nome;carga horária) */
void lerMisto(FILE *f) {
    char linha[64];
    for (int n = 0; fgets(linha, sizeof(linha), f) != NULL; n++) {
        linha[strcspn(linha, "\n")] = '\0';
        char tipo = linha[0];
        char *dados = linha + 2;
        T("le", V(n), "tipo", tipo);
        if (tipo == 'A') {
            char nome[20], curso[20];
            T("aluno", V(n));
            sscanf(dados, "%19[^;];%19s", nome, curso);
            printf("aluno: nome = %s, curso = %s\n", nome, curso);
        } else if (tipo == 'D') {
            char nome[20];
            int carga;
            T("disciplina", V(n));
            sscanf(dados, "%19[^;];%d", nome, &carga);
            printf("disciplina: nome = %s, carga = %d horas\n", nome, carga);
        } else {
            T("desconhecido", V(n), "tipo", tipo);
            printf("tipo desconhecido: %c\n", tipo);
        }
    }
    T("fim");
}

int main(void) {
    FILE *f = fopen("misto.txt", "w+");
    fputs("A Ana;Sistemas\n", f);
    fputs("D AEDS2;60\n", f);
    fputs("A Bruno;Civil\n", f);
    fputs("D BD;45\n", f);
    fputs("X ???\n", f);
    rewind(f);
    lerMisto(f);
    fclose(f);
    return 0;
}
