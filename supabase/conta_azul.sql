-- Tabelas Conta Azul: cache dos dados da API para leitura e fallback
-- Execute no Supabase: SQL Editor → New query → Cole este conteúdo → Run

-- Categorias
CREATE TABLE IF NOT EXISTS conta_azul_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id TEXT,
  color TEXT,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Contas (contas contábeis)
CREATE TABLE IF NOT EXISTS conta_azul_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Resumo financeiro (última sincronização; payload completo)
CREATE TABLE IF NOT EXISTS conta_azul_summary (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload JSONB NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now()
);

-- Fluxo de caixa por período (date + period_start/period_end para identificar o conjunto)
CREATE TABLE IF NOT EXISTS conta_azul_cashflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  income NUMERIC DEFAULT 0,
  expense NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(data, period_start, period_end)
);

-- Vendas por período
CREATE TABLE IF NOT EXISTS conta_azul_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  amount NUMERIC DEFAULT 0,
  quantity INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(data, period_start, period_end)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conta_azul_cashflow_period ON conta_azul_cashflow(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_conta_azul_sales_period ON conta_azul_sales(period_start, period_end);

-- RLS
ALTER TABLE conta_azul_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_azul_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_azul_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_azul_cashflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE conta_azul_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura conta_azul_categories" ON conta_azul_categories;
CREATE POLICY "Leitura conta_azul_categories" ON conta_azul_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserir conta_azul_categories" ON conta_azul_categories;
CREATE POLICY "Inserir conta_azul_categories" ON conta_azul_categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualizar conta_azul_categories" ON conta_azul_categories;
CREATE POLICY "Atualizar conta_azul_categories" ON conta_azul_categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Deletar conta_azul_categories" ON conta_azul_categories;
CREATE POLICY "Deletar conta_azul_categories" ON conta_azul_categories FOR DELETE USING (true);

DROP POLICY IF EXISTS "Leitura conta_azul_accounts" ON conta_azul_accounts;
CREATE POLICY "Leitura conta_azul_accounts" ON conta_azul_accounts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserir conta_azul_accounts" ON conta_azul_accounts;
CREATE POLICY "Inserir conta_azul_accounts" ON conta_azul_accounts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualizar conta_azul_accounts" ON conta_azul_accounts;
CREATE POLICY "Atualizar conta_azul_accounts" ON conta_azul_accounts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Deletar conta_azul_accounts" ON conta_azul_accounts;
CREATE POLICY "Deletar conta_azul_accounts" ON conta_azul_accounts FOR DELETE USING (true);

DROP POLICY IF EXISTS "Leitura conta_azul_summary" ON conta_azul_summary;
CREATE POLICY "Leitura conta_azul_summary" ON conta_azul_summary FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserir conta_azul_summary" ON conta_azul_summary;
CREATE POLICY "Inserir conta_azul_summary" ON conta_azul_summary FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualizar conta_azul_summary" ON conta_azul_summary;
CREATE POLICY "Atualizar conta_azul_summary" ON conta_azul_summary FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Leitura conta_azul_cashflow" ON conta_azul_cashflow;
CREATE POLICY "Leitura conta_azul_cashflow" ON conta_azul_cashflow FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserir conta_azul_cashflow" ON conta_azul_cashflow;
CREATE POLICY "Inserir conta_azul_cashflow" ON conta_azul_cashflow FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Deletar conta_azul_cashflow" ON conta_azul_cashflow;
CREATE POLICY "Deletar conta_azul_cashflow" ON conta_azul_cashflow FOR DELETE USING (true);

DROP POLICY IF EXISTS "Leitura conta_azul_sales" ON conta_azul_sales;
CREATE POLICY "Leitura conta_azul_sales" ON conta_azul_sales FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserir conta_azul_sales" ON conta_azul_sales;
CREATE POLICY "Inserir conta_azul_sales" ON conta_azul_sales FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Deletar conta_azul_sales" ON conta_azul_sales;
CREATE POLICY "Deletar conta_azul_sales" ON conta_azul_sales FOR DELETE USING (true);
