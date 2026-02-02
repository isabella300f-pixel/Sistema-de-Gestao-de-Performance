-- Tabela registros_diarios: espelho das colunas da planilha (todas as colunas)
-- Execute no Supabase: SQL Editor → New query → Cole este conteúdo → Run

CREATE TABLE IF NOT EXISTS registros_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Colunas da planilha (todas)
  carimbo_data_hora TEXT,
  data DATE NOT NULL,
  dia_semana TEXT,
  numero_ligacoes INTEGER DEFAULT 0,
  numero_ligacoes_atendidas INTEGER DEFAULT 0,
  numero_aberturas INTEGER DEFAULT 0,
  algum_desqualificado BOOLEAN DEFAULT false,
  numero_formularios INTEGER DEFAULT 0,
  numero_onlines INTEGER DEFAULT 0,
  vendedor TEXT,
  numero_calls_agendadas INTEGER DEFAULT 0,
  numero_calls_realizadas INTEGER DEFAULT 0,
  numero_testes_vocacionais INTEGER DEFAULT 0,
  numero_diagnosticos INTEGER DEFAULT 0,
  avaliacao_performance TEXT,
  sugestao_melhoria TEXT,
  meta_proximo_dia TEXT,
  etapa_funil_foco TEXT,
  -- Controle interno (opcional)
  colaborador_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices para filtros e buscas
CREATE INDEX IF NOT EXISTS idx_registros_data ON registros_diarios(data);
CREATE INDEX IF NOT EXISTS idx_registros_vendedor ON registros_diarios(vendedor);
CREATE INDEX IF NOT EXISTS idx_registros_colaborador_id ON registros_diarios(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_registros_dia_semana ON registros_diarios(dia_semana);

-- RLS (Row Level Security)
ALTER TABLE registros_diarios ENABLE ROW LEVEL SECURITY;

-- Políticas: leitura permitida; escrita via service_role ou backend
DROP POLICY IF EXISTS "Leitura registros" ON registros_diarios;
CREATE POLICY "Leitura registros" ON registros_diarios
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserir registros" ON registros_diarios;
CREATE POLICY "Inserir registros" ON registros_diarios
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Atualizar registros" ON registros_diarios;
CREATE POLICY "Atualizar registros" ON registros_diarios
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Deletar registros" ON registros_diarios;
CREATE POLICY "Deletar registros" ON registros_diarios
  FOR DELETE USING (true);

-- Comentário das colunas (equivale à planilha)
COMMENT ON COLUMN registros_diarios.carimbo_data_hora IS 'Carimbo de data/hora';
COMMENT ON COLUMN registros_diarios.data IS 'Data';
COMMENT ON COLUMN registros_diarios.dia_semana IS 'Dia da Semana';
COMMENT ON COLUMN registros_diarios.numero_ligacoes IS 'Número de ligações';
COMMENT ON COLUMN registros_diarios.numero_ligacoes_atendidas IS 'Número de ligações atendidas';
COMMENT ON COLUMN registros_diarios.numero_aberturas IS 'Número de aberturas';
COMMENT ON COLUMN registros_diarios.algum_desqualificado IS 'Algum desqualificado?';
COMMENT ON COLUMN registros_diarios.numero_formularios IS 'Número de formulários';
COMMENT ON COLUMN registros_diarios.numero_onlines IS 'Número de onlines';
COMMENT ON COLUMN registros_diarios.vendedor IS 'Vendedor';
COMMENT ON COLUMN registros_diarios.numero_calls_agendadas IS 'Número de calls agendadas';
COMMENT ON COLUMN registros_diarios.numero_calls_realizadas IS 'Número de calls realizadas';
COMMENT ON COLUMN registros_diarios.numero_testes_vocacionais IS 'Número de testes vocacionais';
COMMENT ON COLUMN registros_diarios.numero_diagnosticos IS 'Número de diagnósticos';
COMMENT ON COLUMN registros_diarios.avaliacao_performance IS 'Como avalia sua performance hoje?';
COMMENT ON COLUMN registros_diarios.sugestao_melhoria IS 'Com base na resposta anterior, qual sua sugestão de melhoria?';
COMMENT ON COLUMN registros_diarios.meta_proximo_dia IS 'Qual a sua meta para o próximo dia?';
COMMENT ON COLUMN registros_diarios.etapa_funil_foco IS 'Em qual etapa do funil, pretende direcionar seu foco?';
