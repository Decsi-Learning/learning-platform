# Fórum

O fórum fica disponível em `forum.html`, com acesso pelo menu lateral das páginas principais. Qualquer pessoa pode consultar as publicações; é necessário entrar na conta para criar, responder, editar, excluir, reagir, denunciar e receber notificações.

As publicações podem ser gerais ou associadas a uma trilha e a um conteúdo. O feed permite filtrar por esses campos e ordenar por data ou quantidade de respostas. A autoria é verificada no Worker para que somente a própria pessoa edite ou exclua seu conteúdo.

Respostas novas e reações úteis geram notificações para a pessoa autora, exibidas no sino do cabeçalho. O cabeçalho consulta notificações a cada 45 segundos e também quando o painel é aberto.

Publicações e respostas de contas com perfil `admin` exibem o badge **Admin**. Administradores podem remover publicações e respostas pela ação **Remover**; o formulário exige um motivo e o envia por notificação à pessoa autora. Ao remover uma publicação, as respostas também são removidas e cada autor afetado recebe uma notificação com o motivo. A remoção e os avisos são gravados juntos no D1.

Denúncias registram o motivo informado e enviam o título e o texto da publicação ou resposta para uma análise auxiliar da Gemini. O resultado e o status ficam armazenados em `forum_reports`; a avaliação automática é uma recomendação para moderação humana. Se a chamada da IA falhar, a denúncia permanece salva como pendente.

## Ativar no ambiente publicado

1. Na pasta `gemini-proxy`, aplique a migração do banco: `npx wrangler d1 migrations apply chat-db --remote`.
2. Publique o Worker atualizado com `npx wrangler deploy`.
3. Publique os arquivos estáticos do projeto.

Para um banco novo, `schema.sql` também inclui as tabelas do fórum. O Worker deve manter configurados `SESSION_SECRET`, `GEMINI_API_KEY` e as origens permitidas em `ALLOWED_ORIGINS`.
