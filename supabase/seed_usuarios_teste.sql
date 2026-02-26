-- =============================================================================
-- Seed: usuários de teste (rode DEPOIS de criar os 4 usuários no Auth)
-- Authentication → Users → Add user para cada email abaixo.
-- =============================================================================

-- Ajusta role e nome em profiles (use os mesmos emails criados no Auth)
UPDATE public.profiles SET role = 'rh', nome = 'RH Teste' WHERE email = 'rh@empresa.com';
UPDATE public.profiles SET role = 'gestao', nome = 'Gestão Teste' WHERE email = 'gestao@empresa.com';
UPDATE public.profiles SET role = 'gestor', nome = 'Gestor Teste' WHERE email = 'gestor@empresa.com';
UPDATE public.profiles SET role = 'colaborador', nome = 'Colaborador Teste' WHERE email = 'colaborador@empresa.com';

-- Insere colaborador vinculado ao user_id do Auth (necessário para Ponto, Solicitações, Disponibilidade)
-- gestor_id = primeiro gestor encontrado em profiles
INSERT INTO public.colaboradores (
  user_id,
  nome,
  email,
  area,
  data_admissao,
  status,
  gestor_id
)
SELECT
  p.id,
  p.nome,
  p.email,
  'Comercial',
  CURRENT_DATE,
  'ativo',
  (SELECT id FROM public.profiles WHERE role = 'gestor' LIMIT 1)
FROM public.profiles p
WHERE p.email = 'colaborador@empresa.com'
  AND NOT EXISTS (SELECT 1 FROM public.colaboradores c WHERE c.user_id = p.id);
