-- =============================================================================
-- Seed: criar os 4 usuários de teste DIRETAMENTE em auth.users (Supabase)
-- Senha de todos: Teste@123
-- Execute no Supabase: SQL Editor → New query → Cole tudo → Run
--
-- Requisitos: extensão pgcrypto (já existe no Supabase). O trigger handle_new_user
-- criará os perfis em public.profiles automaticamente.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Senha usada para todos (bcrypt). Para trocar: altere 'Teste@123' abaixo.
DO $$
DECLARE
  senha_hash TEXT := crypt('Teste@123', gen_salt('bf'));
  inst_id UUID := (SELECT id FROM auth.instances LIMIT 1);
BEGIN
  IF inst_id IS NULL THEN
    inst_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  -- RH (só insere se o email ainda não existir)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rh@empresa.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      inst_id, gen_random_uuid(), 'authenticated', 'authenticated', 'rh@empresa.com', senha_hash,
      '{"provider":"email","providers":["email"]}'::jsonb, '{"nome":"RH Teste","role":"rh"}'::jsonb, now(), now()
    );
  END IF;

  -- Gestão
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gestao@empresa.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      inst_id, gen_random_uuid(), 'authenticated', 'authenticated', 'gestao@empresa.com', senha_hash,
      '{"provider":"email","providers":["email"]}'::jsonb, '{"nome":"Gestão Teste","role":"gestao"}'::jsonb, now(), now()
    );
  END IF;

  -- Gestor
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gestor@empresa.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      inst_id, gen_random_uuid(), 'authenticated', 'authenticated', 'gestor@empresa.com', senha_hash,
      '{"provider":"email","providers":["email"]}'::jsonb, '{"nome":"Gestor Teste","role":"gestor"}'::jsonb, now(), now()
    );
  END IF;

  -- Colaborador
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'colaborador@empresa.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      inst_id, gen_random_uuid(), 'authenticated', 'authenticated', 'colaborador@empresa.com', senha_hash,
      '{"provider":"email","providers":["email"]}'::jsonb, '{"nome":"Colaborador Teste","role":"colaborador"}'::jsonb, now(), now()
    );
  END IF;

END $$;

-- O trigger on_auth_user_created já criou os perfis em public.profiles.
-- Agora inserir o colaborador em public.colaboradores (para Ponto, Solicitações, Disponibilidade).
INSERT INTO public.colaboradores (
  user_id, nome, email, area, data_admissao, status, gestor_id
)
SELECT
  p.id, p.nome, p.email, 'Comercial', CURRENT_DATE, 'ativo',
  (SELECT id FROM public.profiles WHERE role = 'gestor' LIMIT 1)
FROM public.profiles p
WHERE p.email = 'colaborador@empresa.com'
  AND NOT EXISTS (SELECT 1 FROM public.colaboradores c WHERE c.user_id = p.id);
