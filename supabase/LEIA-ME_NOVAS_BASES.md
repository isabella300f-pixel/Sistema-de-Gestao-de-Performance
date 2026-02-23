# Novas bases no Supabase

## O que você já tem

- **registros_diarios** – mantida como está (não é recriada).
- **aggregated_metrics** – mantida como está. O script só garante que a função `update_updated_at_column()` exista para o trigger que você já usa.
- **performance_data** – não é alterada (uso em outro projeto).

## O que rodar

1. Abra o **SQL Editor** do Supabase (Dashboard do projeto → SQL Editor).
2. Crie uma **New query**.
3. Copie todo o conteúdo do arquivo **`ADD_NOVAS_BASES.sql`** e cole na query.
4. Clique em **Run**.

O script faz, em uma única execução:

- Cria a função `update_updated_at_column()` (para o trigger existente em `aggregated_metrics`).
- Cria todas as **novas tabelas**: `profiles`, `cargos`, `times`, `colaboradores`, `avaliacoes_1_1`, `registros_ponto`, `vagas`, `candidatos`, `processo_seletivo`, `documentos`, `pesquisas_clima`, `respostas_clima`, `comunicados`, `comunicado_leitura`, `solicitacoes`, `solicitacao_mensagens`, `chat_canais`, `chat_participantes`, `chat_mensagens`, `avaliacoes_rh`.
- Cria **views**: `v_dashboard_gestor`, `v_rh_headcount`, `v_ranking_performance`.
- Cria **triggers**: score em `avaliacoes_1_1`, protocolo em `solicitacoes`, `handle_new_user` em `auth.users`.
- Ativa **RLS** e cria todas as **políticas** nas novas tabelas.
- Cria o **bucket** `documentos` no Storage e as políticas de acesso.

## Depois de rodar

1. **Auth (Supabase Auth)**  
   - Quem for usar login por email/senha ou magic link precisa ter usuário em **Authentication → Users**.  
   - Cada novo usuário criado no Auth ganha uma linha em `profiles` pelo trigger `on_auth_user_created` (com role padrão `colaborador` se não for passado em `user_metadata`).

2. **Criar usuários pelo RH**  
   - A aplicação usa a API `POST /api/rh/criar-usuario` (com `SUPABASE_SERVICE_ROLE_KEY` no servidor) para criar usuário no Auth e inserir/atualizar `profiles` e, quando for o caso, `colaboradores`.

3. **Redirect URL (produção)**  
   - Em **Authentication → URL Configuration**, adicione em **Redirect URLs** a URL do callback da sua app, por exemplo:  
     `https://seu-dominio.vercel.app/auth/callback`

4. **Variáveis de ambiente (app)**  
   - No `.env.local` (ou nas variáveis do Vercel):  
     - `NEXT_PUBLIC_SUPABASE_URL`  
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     - `SUPABASE_SERVICE_ROLE_KEY` (apenas no servidor; nunca no client)  
   - Para desenvolvimento com login por seleção: `NEXT_PUBLIC_DEV_LOGIN=true`.

5. **Dados iniciais (opcional)**  
   - Cargos e times: pode inserir direto em `cargos` e `times`.  
   - Colaboradores e 1:1 dependem de ter `profiles` (e, se for colaborador, `colaboradores`). Crie primeiro os usuários no Auth (ou pela API do RH) e, se quiser, use o `supabase/seed.sql` como base para inserir exemplos.

## Erros comuns

- **"relation auth.users does not exist"** – o script precisa rodar em um projeto Supabase (não em Postgres solto).  
- **Trigger em `aggregated_metrics`** – se já existir `update_updated_at_column()` com outra assinatura, o `CREATE OR REPLACE` ajusta; se o trigger falhar, confira o nome da função no trigger (deve ser `update_updated_at_column()`).  
- **Storage** – se o bucket `documentos` já existir, o script faz `ON CONFLICT (id) DO UPDATE` nos metadados; as políticas são recriadas com `DROP POLICY IF EXISTS` + `CREATE POLICY`.
