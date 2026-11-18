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

/* grava um registro: 2 bytes com o tamanho, depois os dados */
void grava(FILE *f, const char *dados) {
    unsigned short tam = (unsigned short)strlen(dados);
    fwrite(&tam, sizeof(tam), 1, f);
    fwrite(dados, 1, tam, f);
}

/* vai até o registro n, pulando de prefixo em prefixo (sem ler os dados) */
void localiza(FILE *f, int n) {
    unsigned short tam;
    rewind(f);
    for (int i = 0; i < n; i++) {
        T("prefixo", V(i), "pos", (int)ftell(f));
        fread(&tam, sizeof(tam), 1, f);
        T("pula", V(i), V(tam), "pos", (int)ftell(f));
        fseek(f, tam, SEEK_CUR);
    }
    T("chegou", V(n), "pos", (int)ftell(f));
}

/* lê o registro que começa na posição atual */
void le(FILE *f, char *dados) {
    unsigned short tam;
    T("lePrefixo", "pos", (int)ftell(f));
    fread(&tam, sizeof(tam), 1, f);
    T("leDados", V(tam), "pos", (int)ftell(f));
    fread(dados, 1, tam, f);
    dados[tam] = '\0';
}

int main(void) {
    FILE *f = fopen("reg.dat", "w+b");
    grava(f, "Ana Souza;Sistemas;Mariana");
    grava(f, "Bruno Lima;Civil;Ouro Preto");
    grava(f, "Carla;Minas;Itabirito");
    T("criado", "pos", (int)ftell(f));
    char dados[64];

    T("pede", "reg", 2);
    localiza(f, 2);                                /* sem índice: pula os registros 0 e 1 */
    le(f, dados);
    T("mostra", "reg", 2);
    printf("registro 2: %s\n", dados);

    long indice[3];                                /* índice de byte offsets, montado em uma varredura */
    rewind(f);
    for (int i = 0; i < 3; i++) {
        unsigned short tam;
        indice[i] = ftell(f);
        T("indexa", V(i), "pos", (int)indice[i]);
        fread(&tam, sizeof(tam), 1, f);
        fseek(f, tam, SEEK_CUR);
    }
    T("vai", "reg", 1, "pos", (int)indice[1]);
    fseek(f, indice[1], SEEK_SET);                 /* com índice: um único fseek */
    le(f, dados);
    T("mostra2", "reg", 1);
    printf("registro 1: %s\n", dados);
    fclose(f);
    return 0;
}
