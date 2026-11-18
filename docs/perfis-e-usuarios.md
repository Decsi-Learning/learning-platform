# Perfis e lista de usuários

As contas começam com o perfil `student` (Comum). O perfil `admin` pode abrir **Usuários** no menu lateral para consultar, cadastrar e editar contas, incluindo nome, e-mail e perfil. A lista também mostra a data e hora do último login; contas sem registro aparecem como **Sem registro**. No cadastro administrativo, a senha inicial é obrigatória e segue as mesmas regras de segurança do cadastro público. Na edição, a senha é opcional; deixá-la em branco mantém a senha atual. O Worker verifica o perfil atual no D1 em cada operação administrativa; esconder o link na interface não é usado como controle de acesso.

O último administrador não pode ser rebaixado para o perfil comum. Isso evita deixar o sistema sem uma conta capaz de administrar usuários.

## Configurar o primeiro administrador

1. Aplique as migrações pendentes do D1 e publique o Worker atualizado.
2. No banco `chat-db`, promova a conta autorizada usando o e-mail cadastrado:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@exemplo.com';
   ```

3. Atualize uma página do sistema. O cabeçalho passará a indicar **Administrador** e o menu exibirá **Usuários**.

Para voltar a conta ao perfil comum, altere o papel para `student`. As permissões são consultadas no banco em cada chamada administrativa.
