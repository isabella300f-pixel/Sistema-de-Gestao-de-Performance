-- ============================================================
-- Seed opcional - dados de exemplo (execute após 001_schema + 002_rls)
-- Requer que existam usuários em auth.users; IDs abaixo são exemplos.
-- Em dev, use Supabase Auth para criar usuários e depois atualize os IDs aqui
-- ou insira profiles/colaboradores via API/dashboard.
-- ============================================================

-- Exemplo: inserir cargos e times (não dependem de auth)
INSERT INTO public.cargos (id, nome, area) VALUES
  (gen_random_uuid(), 'Vendedor de Franquia', 'Vendas'),
  (gen_random_uuid(), 'Analista de RH', 'RH'),
  (gen_random_uuid(), 'Gerente Comercial', 'Vendas')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO public.times (id, nome, area) VALUES
  (gen_random_uuid(), 'Time Comercial Sul', 'Vendas'),
  (gen_random_uuid(), 'Time Comercial Norte', 'Vendas')
ON CONFLICT DO NOTHING;

-- Colaboradores e avaliacoes dependem de profiles (auth.uid).
-- Para seed real: 1) crie usuários no Auth (Dashboard ou API), 2) profiles são criados pelo trigger,
-- 3) insira colaboradores com gestor_id = id do profile do gestor.
-- Exemplo (substitua UUIDs pelos reais):
/*
INSERT INTO public.colaboradores (user_id, nome, email, cargo_nome, area, gestor_id, data_admissao, status)
SELECT
  p.id, p.nome, p.email, 'Vendedor de Franquia', 'Vendas',
  (SELECT id FROM profiles WHERE role = 'gestor' LIMIT 1),
  CURRENT_DATE - INTERVAL '6 months', 'ativo'
FROM profiles p
WHERE p.role = 'colaborador'
LIMIT 5;
*/
