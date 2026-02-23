-- ============================================================
-- SQL COMPLETO: adicionar novas bases do sistema RH/Performance
-- Você JÁ TEM: registros_diarios, aggregated_metrics, performance_data
-- Este script NÃO altera essas tabelas. Só cria as novas.
-- Execute no Supabase: SQL Editor → New query → Cole tudo → Run
-- ============================================================

-- Função usada pelo trigger existente em aggregated_metrics (evita erro se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ========== PARTE 1: NOVAS TABELAS (Auth, RH, Gestor, 1:1, etc.) ==========

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Perfis (vinculado a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('rh','gestor','gestao','colaborador')),
  ativo BOOLEAN DEFAULT true,
  avatar_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Cargos e Times
CREATE TABLE IF NOT EXISTS public.cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  area TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  area TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Colaboradores
CREATE TABLE IF NOT EXISTS public.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT,
  cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
  cargo_nome TEXT,
  area TEXT NOT NULL,
  time_id UUID REFERENCES public.times(id) ON DELETE SET NULL,
  gestor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_admissao DATE NOT NULL,
  data_desligamento DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','desligado')),
  senioridade TEXT CHECK (senioridade IN ('junior','pleno','senior')),
  cpf TEXT,
  telefone TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES public.profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_colab_gestor ON public.colaboradores(gestor_id);
CREATE INDEX IF NOT EXISTS idx_colab_user ON public.colaboradores(user_id);
CREATE INDEX IF NOT EXISTS idx_colab_status ON public.colaboradores(status);
CREATE INDEX IF NOT EXISTS idx_colab_area ON public.colaboradores(area);

-- Avaliações 1:1
CREATE TABLE IF NOT EXISTS public.avaliacoes_1_1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  gestor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_1_1 DATE NOT NULL,
  data_proxima DATE,
  leads_trabalhados TEXT NOT NULL CHECK (leads_trabalhados IN ('excelente','bom','regular','ruim')),
  qualidade_crm TEXT NOT NULL CHECK (qualidade_crm IN ('excelente','boa','regular','ruim')),
  conversao_funil TEXT NOT NULL CHECK (conversao_funil IN ('acima_media','dentro_media','abaixo_media','muito_abaixo_media')),
  motivos_perda TEXT[] DEFAULT '{}',
  pontos_fortes TEXT[] DEFAULT '{}',
  pontos_melhoria TEXT[] DEFAULT '{}',
  estrategia TEXT,
  motivo_estrategia TEXT,
  acoes_vendedor TEXT,
  acoes_gerente TEXT,
  kpi_foco TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','finalizado')),
  score_performance INTEGER,
  versao INTEGER DEFAULT 1,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_av11_colab ON public.avaliacoes_1_1(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_av11_gestor ON public.avaliacoes_1_1(gestor_id);
CREATE INDEX IF NOT EXISTS idx_av11_data ON public.avaliacoes_1_1(data_1_1);

CREATE OR REPLACE FUNCTION public.calcular_score_1_1(p_leads TEXT, p_crm TEXT, p_funil TEXT)
RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  s_leads INT := CASE p_leads WHEN 'excelente' THEN 25 WHEN 'bom' THEN 18 WHEN 'regular' THEN 10 ELSE 5 END;
  s_crm   INT := CASE p_crm   WHEN 'excelente' THEN 25 WHEN 'boa'   THEN 18 WHEN 'regular' THEN 10 ELSE 5 END;
  s_funil INT := CASE p_funil WHEN 'acima_media' THEN 50 WHEN 'dentro_media' THEN 35 WHEN 'abaixo_media' THEN 20 ELSE 10 END;
BEGIN
  RETURN LEAST(100, s_leads + s_crm + s_funil);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_score_avaliacao_1_1() RETURNS TRIGGER AS $$
BEGIN
  NEW.score_performance := public.calcular_score_1_1(NEW.leads_trabalhados, NEW.qualidade_crm, NEW.conversao_funil);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_set_score_av11 ON public.avaliacoes_1_1;
CREATE TRIGGER trg_set_score_av11
  BEFORE INSERT OR UPDATE OF leads_trabalhados, qualidade_crm, conversao_funil ON public.avaliacoes_1_1
  FOR EACH ROW EXECUTE PROCEDURE public.set_score_avaliacao_1_1();

-- Ponto
CREATE TABLE IF NOT EXISTS public.registros_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  entrada TIME,
  saida TIME,
  entrada_almoco TIME,
  saida_almoco TIME,
  horas_trabalhadas NUMERIC(5,2),
  horas_extras NUMERIC(5,2),
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal','atraso','falta','justificado','ferias','licenca')),
  justificativa TEXT,
  aprovado BOOLEAN DEFAULT false,
  aprovado_por UUID REFERENCES public.profiles(id),
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(colaborador_id, data)
);
CREATE INDEX IF NOT EXISTS idx_ponto_colab_data ON public.registros_ponto(colaborador_id, data);

-- Recrutamento
CREATE TABLE IF NOT EXISTS public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  area TEXT,
  cargo TEXT,
  descricao TEXT,
  requisitos TEXT[] DEFAULT '{}',
  salario_min NUMERIC(12,2),
  salario_max NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','pausada','fechada')),
  responsavel_id UUID REFERENCES public.profiles(id),
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fechamento DATE,
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.candidatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  curriculo_path TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.processo_seletivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id UUID NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL DEFAULT 'triagem' CHECK (etapa IN ('triagem','entrevista','teste','aprovado','reprovado')),
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento','aprovado','reprovado','cancelado')),
  parecer TEXT,
  score INTEGER,
  data_entrevista DATE,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vaga_id, candidato_id)
);
CREATE INDEX IF NOT EXISTS idx_ps_vaga ON public.processo_seletivo(vaga_id);

-- Documentos
CREATE TABLE IF NOT EXISTS public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('cpf','rg','ctps','reservista','certificado','diploma','outro')),
  nome TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  data_vencimento DATE,
  status TEXT DEFAULT 'valido' CHECK (status IN ('valido','vencido','vencendo')),
  criado_em TIMESTAMPTZ DEFAULT now(),
  criado_por UUID REFERENCES public.profiles(id)
);
CREATE INDEX IF NOT EXISTS idx_docs_colab ON public.documentos(colaborador_id);

-- Clima
CREATE TABLE IF NOT EXISTS public.pesquisas_clima (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT DEFAULT 'pulse' CHECK (tipo IN ('pulse','completa')),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada','ativa','finalizada','cancelada')),
  perguntas JSONB DEFAULT '[]',
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.respostas_clima (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesquisa_id UUID NOT NULL REFERENCES public.pesquisas_clima(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  respostas JSONB NOT NULL DEFAULT '{}',
  data_resposta TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pesquisa_id, colaborador_id)
);
CREATE INDEX IF NOT EXISTS idx_resp_clima_pesquisa ON public.respostas_clima(pesquisa_id);

-- Comunicados
CREATE TABLE IF NOT EXISTS public.comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'geral' CHECK (tipo IN ('geral','area','individual')),
  destinatarios TEXT[] DEFAULT '{}',
  autor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_publicacao TIMESTAMPTZ DEFAULT now(),
  data_expiracao TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'publicado' CHECK (status IN ('rascunho','publicado','arquivado')),
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comunicados_autor ON public.comunicados(autor_id);
CREATE TABLE IF NOT EXISTS public.comunicado_leitura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicado_id UUID NOT NULL REFERENCES public.comunicados(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comunicado_id, colaborador_id)
);

-- Solicitações
CREATE TABLE IF NOT EXISTS public.solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  protocolo TEXT UNIQUE,
  tipo TEXT NOT NULL,
  tipo_detalhado TEXT,
  data_inicio DATE,
  data_termino DATE,
  motivo TEXT NOT NULL,
  impacto_atividades BOOLEAN DEFAULT false,
  reposicao TEXT CHECK (reposicao IN ('precisa','alinhado','nao_precisa','nao_se_aplica')),
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','em_analise','aprovado','rejeitado','aguardando_documentos')),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_solic_colab ON public.solicitacoes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_solic_status ON public.solicitacoes(status);
CREATE TABLE IF NOT EXISTS public.solicitacao_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES public.profiles(id),
  remetente_tipo TEXT NOT NULL CHECK (remetente_tipo IN ('colaborador','rh')),
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Chat
CREATE TABLE IF NOT EXISTS public.chat_canais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'dm' CHECK (tipo IN ('dm','grupo')),
  nome TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.chat_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id UUID NOT NULL REFERENCES public.chat_canais(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(canal_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.chat_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id UUID NOT NULL REFERENCES public.chat_canais(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_msg_canal ON public.chat_mensagens(canal_id);

-- Avaliações RH
CREATE TABLE IF NOT EXISTS public.avaliacoes_rh (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  avaliador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_avaliacao DATE NOT NULL,
  classificacao TEXT CHECK (classificacao IN ('alerta','neutro','positivo')),
  observacoes TEXT,
  risco_desligamento TEXT CHECK (risco_desligamento IN ('baixo','medio','alto')),
  criado_em TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_avrh_colab ON public.avaliacoes_rh(colaborador_id);

-- Views
CREATE OR REPLACE VIEW public.v_dashboard_gestor AS
SELECT p.id AS gestor_id, p.nome AS gestor_nome,
  COUNT(DISTINCT c.id) AS total_colaboradores,
  COUNT(DISTINCT a.id) FILTER (WHERE a.data_1_1 >= CURRENT_DATE - INTERVAL '30 days') AS av11_ultimos_30d,
  ROUND(AVG(a.score_performance)::numeric, 1) AS media_score,
  COUNT(DISTINCT a.id) FILTER (WHERE a.data_proxima IS NOT NULL AND a.data_proxima < CURRENT_DATE AND a.status = 'finalizado') AS pendentes_1_1
FROM public.profiles p
LEFT JOIN public.colaboradores c ON c.gestor_id = p.id AND c.status = 'ativo'
LEFT JOIN public.avaliacoes_1_1 a ON a.colaborador_id = c.id
WHERE p.role = 'gestor'
GROUP BY p.id, p.nome;

CREATE OR REPLACE VIEW public.v_rh_headcount AS
SELECT
  COUNT(*) FILTER (WHERE status = 'ativo') AS ativos,
  COUNT(*) FILTER (WHERE status = 'desligado' AND data_desligamento >= CURRENT_DATE - INTERVAL '1 year') AS desligados_12m,
  COUNT(DISTINCT area) AS total_areas
FROM public.colaboradores;

CREATE OR REPLACE VIEW public.v_ranking_performance AS
SELECT c.id AS colaborador_id, c.nome, c.area, c.gestor_id, p.nome AS gestor_nome,
  (SELECT AVG(a2.score_performance) FROM public.avaliacoes_1_1 a2 WHERE a2.colaborador_id = c.id AND a2.status = 'finalizado') AS media_score,
  (SELECT COUNT(*) FROM public.avaliacoes_1_1 a2 WHERE a2.colaborador_id = c.id AND a2.status = 'finalizado') AS total_av11
FROM public.colaboradores c
LEFT JOIN public.profiles p ON p.id = c.gestor_id
WHERE c.status = 'ativo';

-- Protocolo solicitações
CREATE SEQUENCE IF NOT EXISTS public.solicitacao_seq;
CREATE OR REPLACE FUNCTION public.gerar_protocolo_solicitacao() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protocolo IS NULL OR NEW.protocolo = '' THEN
    NEW.protocolo := 'SOL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('public.solicitacao_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_protocolo_solicitacao ON public.solicitacoes;
CREATE TRIGGER trg_protocolo_solicitacao BEFORE INSERT ON public.solicitacoes
  FOR EACH ROW EXECUTE PROCEDURE public.gerar_protocolo_solicitacao();

-- Trigger: criar profile ao cadastrar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'colaborador'));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========== PARTE 2: RLS (Row Level Security) ==========

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.sou_gestor_de(colab_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.colaboradores WHERE id = colab_id AND gestor_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.sou_rh_ou_gestao() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.get_my_role() IN ('rh','gestao') $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_select_all_rh_gestao" ON public.profiles;
CREATE POLICY "profiles_select_all_rh_gestao" ON public.profiles FOR SELECT USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cargos_select" ON public.cargos;
CREATE POLICY "cargos_select" ON public.cargos FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "cargos_all_rh" ON public.cargos;
CREATE POLICY "cargos_all_rh" ON public.cargos FOR ALL USING (public.sou_rh_ou_gestao());

ALTER TABLE public.times ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "times_select" ON public.times;
CREATE POLICY "times_select" ON public.times FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "times_all_rh" ON public.times;
CREATE POLICY "times_all_rh" ON public.times FOR ALL USING (public.sou_rh_ou_gestao());

ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "colab_select" ON public.colaboradores;
CREATE POLICY "colab_select" ON public.colaboradores FOR SELECT USING (
  auth.uid() = user_id OR gestor_id = auth.uid() OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "colab_insert_rh" ON public.colaboradores;
CREATE POLICY "colab_insert_rh" ON public.colaboradores FOR INSERT WITH CHECK (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "colab_update_rh_gestor" ON public.colaboradores;
CREATE POLICY "colab_update_rh_gestor" ON public.colaboradores FOR UPDATE USING (public.sou_rh_ou_gestao() OR gestor_id = auth.uid());
DROP POLICY IF EXISTS "colab_delete_rh" ON public.colaboradores;
CREATE POLICY "colab_delete_rh" ON public.colaboradores FOR DELETE USING (public.sou_rh_ou_gestao());

ALTER TABLE public.avaliacoes_1_1 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "av11_select" ON public.avaliacoes_1_1;
CREATE POLICY "av11_select" ON public.avaliacoes_1_1 FOR SELECT USING (
  gestor_id = auth.uid() OR colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "av11_insert_gestor" ON public.avaliacoes_1_1;
CREATE POLICY "av11_insert_gestor" ON public.avaliacoes_1_1 FOR INSERT WITH CHECK (gestor_id = auth.uid() AND public.sou_gestor_de(colaborador_id));
DROP POLICY IF EXISTS "av11_update_gestor" ON public.avaliacoes_1_1;
CREATE POLICY "av11_update_gestor" ON public.avaliacoes_1_1 FOR UPDATE USING (gestor_id = auth.uid());
DROP POLICY IF EXISTS "av11_delete_gestor" ON public.avaliacoes_1_1;
CREATE POLICY "av11_delete_gestor" ON public.avaliacoes_1_1 FOR DELETE USING (gestor_id = auth.uid() OR public.sou_rh_ou_gestao());

ALTER TABLE public.registros_ponto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ponto_select" ON public.registros_ponto;
CREATE POLICY "ponto_select" ON public.registros_ponto FOR SELECT USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid() OR gestor_id = auth.uid()) OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "ponto_insert_rh" ON public.registros_ponto;
CREATE POLICY "ponto_insert_rh" ON public.registros_ponto FOR INSERT WITH CHECK (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "ponto_update_rh" ON public.registros_ponto;
CREATE POLICY "ponto_update_rh" ON public.registros_ponto FOR UPDATE USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "ponto_delete_rh" ON public.registros_ponto;
CREATE POLICY "ponto_delete_rh" ON public.registros_ponto FOR DELETE USING (public.sou_rh_ou_gestao());

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processo_seletivo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vagas_select" ON public.vagas;
CREATE POLICY "vagas_select" ON public.vagas FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "vagas_all_rh" ON public.vagas;
CREATE POLICY "vagas_all_rh" ON public.vagas FOR ALL USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "candidatos_select" ON public.candidatos;
CREATE POLICY "candidatos_select" ON public.candidatos FOR SELECT USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "candidatos_all_rh" ON public.candidatos;
CREATE POLICY "candidatos_all_rh" ON public.candidatos FOR ALL USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "ps_select" ON public.processo_seletivo;
CREATE POLICY "ps_select" ON public.processo_seletivo FOR SELECT USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "ps_all_rh" ON public.processo_seletivo;
CREATE POLICY "ps_all_rh" ON public.processo_seletivo FOR ALL USING (public.sou_rh_ou_gestao());

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "docs_select" ON public.documentos;
CREATE POLICY "docs_select" ON public.documentos FOR SELECT USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid())
  OR public.sou_rh_ou_gestao()
  OR colaborador_id IN (SELECT id FROM public.colaboradores WHERE gestor_id = auth.uid()));
DROP POLICY IF EXISTS "docs_insert_rh" ON public.documentos;
CREATE POLICY "docs_insert_rh" ON public.documentos FOR INSERT WITH CHECK (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "docs_update_rh" ON public.documentos;
CREATE POLICY "docs_update_rh" ON public.documentos FOR UPDATE USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "docs_delete_rh" ON public.documentos;
CREATE POLICY "docs_delete_rh" ON public.documentos FOR DELETE USING (public.sou_rh_ou_gestao());

ALTER TABLE public.pesquisas_clima ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_clima ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clima_select" ON public.pesquisas_clima;
CREATE POLICY "clima_select" ON public.pesquisas_clima FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "clima_all_rh" ON public.pesquisas_clima;
CREATE POLICY "clima_all_rh" ON public.pesquisas_clima FOR ALL USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "resp_clima_select" ON public.respostas_clima;
CREATE POLICY "resp_clima_select" ON public.respostas_clima FOR SELECT USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "resp_clima_insert_own" ON public.respostas_clima;
CREATE POLICY "resp_clima_insert_own" ON public.respostas_clima FOR INSERT WITH CHECK (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()));

ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicado_leitura ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comunicados_select" ON public.comunicados;
CREATE POLICY "comunicados_select" ON public.comunicados FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "comunicados_all_rh" ON public.comunicados;
CREATE POLICY "comunicados_all_rh" ON public.comunicados FOR ALL USING (public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "comunicado_leitura_select" ON public.comunicado_leitura;
CREATE POLICY "comunicado_leitura_select" ON public.comunicado_leitura FOR SELECT USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "comunicado_leitura_insert_own" ON public.comunicado_leitura;
CREATE POLICY "comunicado_leitura_insert_own" ON public.comunicado_leitura FOR INSERT WITH CHECK (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()));

ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacao_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "solic_select" ON public.solicitacoes;
CREATE POLICY "solic_select" ON public.solicitacoes FOR SELECT USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "solic_insert_colab" ON public.solicitacoes;
CREATE POLICY "solic_insert_colab" ON public.solicitacoes FOR INSERT WITH CHECK (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "solic_update_rh_colab" ON public.solicitacoes;
CREATE POLICY "solic_update_rh_colab" ON public.solicitacoes FOR UPDATE USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "solic_msg_select" ON public.solicitacao_mensagens;
CREATE POLICY "solic_msg_select" ON public.solicitacao_mensagens FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.solicitacoes s WHERE s.id = solicitacao_id
    AND (s.colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao())));
DROP POLICY IF EXISTS "solic_msg_insert" ON public.solicitacao_mensagens;
CREATE POLICY "solic_msg_insert" ON public.solicitacao_mensagens FOR INSERT WITH CHECK (
  remetente_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.solicitacoes s WHERE s.id = solicitacao_id
    AND (s.colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()) OR public.sou_rh_ou_gestao())
  ));

ALTER TABLE public.chat_canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_canais_select" ON public.chat_canais;
CREATE POLICY "chat_canais_select" ON public.chat_canais FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_participantes WHERE canal_id = id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "chat_part_select" ON public.chat_participantes;
CREATE POLICY "chat_part_select" ON public.chat_participantes FOR SELECT USING (user_id = auth.uid() OR public.sou_rh_ou_gestao());
DROP POLICY IF EXISTS "chat_part_insert" ON public.chat_participantes;
CREATE POLICY "chat_part_insert" ON public.chat_participantes FOR INSERT WITH CHECK (public.sou_rh_ou_gestao() OR user_id = auth.uid());
DROP POLICY IF EXISTS "chat_msg_select" ON public.chat_mensagens;
CREATE POLICY "chat_msg_select" ON public.chat_mensagens FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_participantes WHERE canal_id = chat_mensagens.canal_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "chat_msg_insert" ON public.chat_mensagens;
CREATE POLICY "chat_msg_insert" ON public.chat_mensagens FOR INSERT WITH CHECK (
  remetente_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_participantes WHERE canal_id = chat_mensagens.canal_id AND user_id = auth.uid()));

ALTER TABLE public.avaliacoes_rh ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "avrh_select" ON public.avaliacoes_rh;
CREATE POLICY "avrh_select" ON public.avaliacoes_rh FOR SELECT USING (
  avaliador_id = auth.uid() OR public.sou_rh_ou_gestao()
  OR colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "avrh_all_rh" ON public.avaliacoes_rh;
CREATE POLICY "avrh_all_rh" ON public.avaliacoes_rh FOR ALL USING (public.sou_rh_ou_gestao());

GRANT SELECT ON public.v_dashboard_gestor TO authenticated;
GRANT SELECT ON public.v_rh_headcount TO authenticated;
GRANT SELECT ON public.v_ranking_performance TO authenticated;

-- ========== PARTE 3: STORAGE (bucket documentos) ==========

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documentos', 'documentos', false, 10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "documentos_select" ON storage.objects;
CREATE POLICY "documentos_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'documentos' AND (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('rh', 'gestao'))
    OR EXISTS (SELECT 1 FROM public.colaboradores c WHERE c.id::text = (storage.foldername(name))[1] AND (c.user_id = auth.uid() OR c.gestor_id = auth.uid()))
  ));

DROP POLICY IF EXISTS "documentos_insert" ON storage.objects;
CREATE POLICY "documentos_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documentos' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('rh', 'gestao')));

DROP POLICY IF EXISTS "documentos_update" ON storage.objects;
CREATE POLICY "documentos_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'documentos' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('rh', 'gestao')));

DROP POLICY IF EXISTS "documentos_delete" ON storage.objects;
CREATE POLICY "documentos_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'documentos' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('rh', 'gestao')));

-- Fim do script
