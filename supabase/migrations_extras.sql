-- Execute apos ADD_NOVAS_BASES.sql
-- Adiciona prioridade em solicitacoes e tabela disponibilidade

ALTER TABLE public.solicitacoes
  ADD COLUMN IF NOT EXISTS prioridade TEXT CHECK (prioridade IN ('baixa','media','alta'));

CREATE TABLE IF NOT EXISTS public.disponibilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('indisponibilidade_futura','impossibilidade_dia','troca_turno','ajuste_rotina','horarios_disponiveis')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  horarios TEXT,
  dias_semana TEXT[] DEFAULT '{}',
  motivo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado')),
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disp_colab ON public.disponibilidade(colaborador_id);

ALTER TABLE public.disponibilidade ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "disp_select" ON public.disponibilidade;
CREATE POLICY "disp_select" ON public.disponibilidade FOR SELECT USING (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid() OR gestor_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('rh','gestao'))
);

DROP POLICY IF EXISTS "disp_insert_colab" ON public.disponibilidade;
CREATE POLICY "disp_insert_colab" ON public.disponibilidade FOR INSERT WITH CHECK (
  colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "disp_update_rh" ON public.disponibilidade;
CREATE POLICY "disp_update_rh" ON public.disponibilidade FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('rh','gestao'))
);

-- Ponto: permitir que colaborador registre entrada/saída no próprio registro
DROP POLICY IF EXISTS "ponto_insert_rh" ON public.registros_ponto;
CREATE POLICY "ponto_insert_rh" ON public.registros_ponto FOR INSERT WITH CHECK (
  public.sou_rh_ou_gestao() OR colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "ponto_update_rh" ON public.registros_ponto;
CREATE POLICY "ponto_update_rh" ON public.registros_ponto FOR UPDATE USING (
  public.sou_rh_ou_gestao() OR colaborador_id IN (SELECT id FROM public.colaboradores WHERE user_id = auth.uid())
);
