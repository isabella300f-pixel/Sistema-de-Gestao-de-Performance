/**
 * Cliente Supabase
 * - Server (service_role): para sync planilha → Supabase (escrita)
 * - Anon: para leitura no cliente se necessário
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Cliente com service_role (apenas no servidor) — para escrita na tabela registros_diarios */
export function getSupabaseServer(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/** Cliente anon (leitura) — pode ser usado no cliente */
export function getSupabaseAnon(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Tipo da linha na tabela registros_diarios (Supabase) */
export interface RegistroDiarioRow {
  id?: string;
  carimbo_data_hora: string | null;
  data: string;
  dia_semana: string | null;
  numero_ligacoes: number;
  numero_ligacoes_atendidas: number;
  numero_aberturas: number;
  numero_desqualificados: number;
  numero_formularios: number;
  numero_onlines: number;
  vendedor: string | null;
  numero_calls_agendadas: number;
  numero_calls_realizadas: number;
  numero_testes_vocacionais: number;
  numero_diagnosticos: number;
  avaliacao_performance: string | null;
  sugestao_melhoria: string | null;
  meta_proximo_dia: string | null;
  etapa_funil_foco: string | null;
  colaborador_id: string | null;
}
