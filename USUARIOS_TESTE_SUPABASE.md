# Como criar usuários de teste no Supabase (login real)

Para testar **Ponto**, **Solicitações** e **Disponibilidade** em produção (ou com login Supabase), é preciso ter usuários no **Supabase Auth** e registros em **profiles** e **colaboradores**. Siga os passos abaixo.

---

## 1. Usuários de exemplo (login e senha)

Use estes e-mails e uma **mesma senha** para todos (ex.: `Teste@123`), ou troque depois no painel.

| Perfil        | E-mail               | Senha (exemplo) | Uso |
|---------------|----------------------|------------------|-----|
| **RH**        | `rh@empresa.com`     | `Teste@123`      | Painel RH, Solicitações, Ponto, Disponibilidade, Usuários |
| **Gestão**    | `gestao@empresa.com` | `Teste@123`      | Dashboard gestão, melhores/piores, turnover, tendências |
| **Gestor**    | `gestor@empresa.com` | `Teste@123`      | Dashboard gestor, colaboradores, 1:1, registros diários |
| **Colaborador** | `colaborador@empresa.com` | `Teste@123` | Solicitações, Ponto, Disponibilidade, documentos, comunicados |

---

## 2. Criar os usuários no Supabase (Auth)

**Opção A – Tudo por SQL (recomendado)**  
No **SQL Editor** do Supabase, abra e execute o arquivo **`supabase/seed_usuarios_teste_auth.sql`**. Esse script cria os 4 usuários em `auth.users` (senha `Teste@123`), o trigger cria os perfis em `profiles` e o colaborador é inserido em `colaboradores`. Depois disso, pule para o passo 4 (testar o login).

**Opção B – Pelo Dashboard**  
1. Acesse o **Supabase Dashboard** do projeto.
2. Vá em **Authentication** → **Users**.
3. Clique em **Add user** → **Create new user**.
4. Para **cada** um dos 4 e-mails acima:
   - **Email**: use exatamente o e-mail da tabela (ex.: `rh@empresa.com`).
   - **Password**: ex.: `Teste@123` (mínimo 6 caracteres; use letras e números para produção).
   - **Auto Confirm User**: marque **Sim** (para não precisar confirmar e-mail).
   - (Opcional) Em **User Metadata** adicione:
     - `nome`: nome de exibição (ex.: `RH Teste`).
     - `role`: um de `rh`, `gestao`, `gestor`, `colaborador`.
   - Clique em **Create user**.

Se não preencher **User Metadata**, o trigger `handle_new_user` vai criar o `profile` com `role = 'colaborador'` e `nome` a partir do e-mail. Nesse caso, você ajusta a **role** no passo 3.

---

## 3. Ajustar perfis e criar colaborador (SQL) – só se usou a Opção B

Se você criou os usuários pelo **Dashboard** (Opção B), depois de criar os **4 usuários** no Auth rode o SQL abaixo no **SQL Editor** do Supabase. Ele:

- Define **role** e **nome** em `profiles` para cada e-mail.
- Cria o registro em **colaboradores** para o usuário `colaborador@empresa.com` e associa a um **gestor**.

Arquivo sugerido: **`supabase/seed_usuarios_teste.sql`** (já criado no projeto). Copie o conteúdo desse arquivo no SQL Editor e execute.

**Importante**: use os **mesmos e-mails** que você usou no passo 2. Se tiver usado outros (ex.: `rh@teste.com`), altere no SQL antes de rodar.

---

## 4. Testar o login na aplicação

1. Na aplicação (ex.: Vercel), **desative** o modo demonstração:
   - Em **Vercel** → Project → **Settings** → **Environment Variables**:
   - Defina `NEXT_PUBLIC_DEV_LOGIN` = `false` (ou remova a variável).
2. Faça **redeploy** para aplicar a variável.
3. Acesse a tela de login e entre com um dos e-mails e a senha (ex.: `rh@empresa.com` / `Teste@123`).
4. Você deve ser redirecionado para o portal correspondente (RH, Gestão, Gestor ou Colaborador) e **Ponto**, **Solicitações** e **Disponibilidade** devem funcionar sem 401.

---

## 5. Resumo rápido

| O que fazer | Onde |
|-------------|------|
| Criar 4 usuários (email + senha) | Supabase → Authentication → Users → Add user |
| Ajustar roles e criar colaborador | Supabase → SQL Editor → rodar `seed_usuarios_teste.sql` |
| Desativar modo dev em produção | Vercel → Env Vars → `NEXT_PUBLIC_DEV_LOGIN` = `false` |
| Logar na aplicação | Tela de login → email + senha (ex.: `rh@empresa.com` / `Teste@123`) |

Se algo falhar (401, “Não autenticado”), confira:

- Os usuários existem em **Authentication → Users**.
- Os e-mails no SQL são os mesmos usados no Auth.
- O **colaborador** tem linha em `colaboradores` com `user_id` = ID do usuário Auth (o script SQL já faz isso para `colaborador@empresa.com`).

---

## 6. Criar novos usuários em produção (pelo RH ou Gestão)

Em produção, **RH** e **Gestão** podem criar novos usuários no sistema (Supabase Auth + `profiles` + `colaboradores`) pela tela:

- **RH** → **Gestão de Pessoas** → botão **Criar usuário** (modal com nome, e-mail, senha, perfil, área, data de admissão).

A API `POST /api/rh/criar-usuario` está restrita: só quem estiver logado com perfil **RH** ou **Gestão** pode chamá-la; demais usuários recebem 403.

A tela **RH** → **Usuários** hoje usa apenas dados em memória (modo demonstração); para listar e criar usuários reais do Supabase por essa tela seria necessário conectá-la à API e a um endpoint de listagem.
