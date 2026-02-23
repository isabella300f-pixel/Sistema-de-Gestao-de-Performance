'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

export type ColaboradorRow = {
  id: string;
  user_id: string | null;
  nome: string;
  email: string | null;
  cargo_id: string | null;
  cargo_nome: string | null;
  area: string;
  time_id: string | null;
  gestor_id: string | null;
  data_admissao: string;
  data_desligamento: string | null;
  status: string;
  senioridade: string | null;
  gestor_nome?: string;
};

export type Avaliacao11Row = {
  id: string;
  colaborador_id: string;
  gestor_id: string;
  data_1_1: string;
  data_proxima: string | null;
  leads_trabalhados: string;
  qualidade_crm: string;
  conversao_funil: string;
  motivos_perda: string[];
  pontos_fortes: string[];
  pontos_melhoria: string[];
  estrategia: string | null;
  acoes_vendedor: string | null;
  acoes_gerente: string | null;
  kpi_foco: string | null;
  status: string;
  score_performance: number | null;
  criado_em: string;
};

export async function fetchColaboradoresByGestor(supabase: SupabaseClient | null, gestorId: string): Promise<ColaboradorRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('colaboradores')
    .select('id, user_id, nome, email, cargo_nome, area, gestor_id, data_admissao, data_desligamento, status, senioridade')
    .eq('gestor_id', gestorId)
    .order('nome');
  if (error) {
    console.error('fetchColaboradoresByGestor', error);
    return [];
  }
  const rows = (data ?? []) as ColaboradorRow[];
  for (const r of rows) {
    if (r.gestor_id) {
      const { data: p } = await supabase.from('profiles').select('nome').eq('id', r.gestor_id).single();
      if (p) r.gestor_nome = p.nome;
    }
  }
  return rows;
}

export async function fetchColaboradoresRH(supabase: SupabaseClient | null): Promise<ColaboradorRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('colaboradores')
    .select('id, user_id, nome, email, cargo_nome, area, gestor_id, data_admissao, data_desligamento, status, senioridade')
    .order('nome');
  if (error) {
    console.error('fetchColaboradoresRH', error);
    return [];
  }
  const rows = (data ?? []) as ColaboradorRow[];
  for (const r of rows) {
    if (r.gestor_id) {
      const { data: p } = await supabase.from('profiles').select('nome').eq('id', r.gestor_id).single();
      if (p) r.gestor_nome = p.nome;
    }
  }
  return rows;
}

export async function fetchColaboradorById(supabase: SupabaseClient | null, id: string): Promise<ColaboradorRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  const row = data as ColaboradorRow;
  if (row.gestor_id) {
    const { data: p } = await supabase.from('profiles').select('nome').eq('id', row.gestor_id).single();
    if (p) row.gestor_nome = p.nome;
  }
  return row;
}

export async function fetchAvaliacoes11ByColaborador(supabase: SupabaseClient | null, colaboradorId: string): Promise<Avaliacao11Row[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('avaliacoes_1_1')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('data_1_1', { ascending: false });
  if (error) {
    console.error('fetchAvaliacoes11ByColaborador', error);
    return [];
  }
  return (data ?? []) as Avaliacao11Row[];
}

export async function fetchDashboardGestor(supabase: SupabaseClient | null, gestorId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('v_dashboard_gestor')
    .select('*')
    .eq('gestor_id', gestorId)
    .single();
  if (error) return null;
  return data;
}

export async function fetchRhHeadcount(supabase: SupabaseClient | null) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('v_rh_headcount').select('*').single();
  if (error) return null;
  return data;
}
