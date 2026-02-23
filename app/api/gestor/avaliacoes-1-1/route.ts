import { NextRequest, NextResponse } from 'next/server';
import { createClient, getServiceRoleClient } from '@/lib/supabase/server';

const LEADS = ['excelente', 'bom', 'regular', 'ruim'];
const CRM = ['excelente', 'boa', 'regular', 'ruim'];
const FUNIL = ['acima_media', 'dentro_media', 'abaixo_media', 'muito_abaixo_media'];

export async function POST(request: NextRequest) {
  const supabaseCookie = await createClient();
  const { data: { user } } = supabaseCookie ? await supabaseCookie.auth.getUser() : { data: { user: null } };

  const DEV = process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';
  const bodyRaw = await request.json().catch(() => ({}));
  const gestorIdFromBody = bodyRaw?.gestor_id as string | undefined;

  let supabase = supabaseCookie;
  let gestorId: string | null = user?.id ?? null;

  if (!user && DEV && gestorIdFromBody && getServiceRoleClient()) {
    supabase = getServiceRoleClient();
    gestorId = gestorIdFromBody;
  }

  if (!supabase || !gestorId) {
    return NextResponse.json(
      supabase ? { error: 'Não autenticado' } : { error: 'Supabase não configurado' },
      { status: supabase ? 401 : 500 }
    );
  }

  type Body = {
    colaborador_id: string;
    data_1_1: string;
    data_proxima?: string;
    leads_trabalhados: string;
    qualidade_crm: string;
    conversao_funil: string;
    motivos_perda?: string[];
    pontos_fortes?: string[];
    pontos_melhoria?: string[];
    estrategia?: string;
    motivo_estrategia?: string;
    acoes_vendedor?: string;
    acoes_gerente?: string;
    kpi_foco?: string;
    status?: 'rascunho' | 'finalizado';
  };
  const body = bodyRaw as Body;

  const {
    colaborador_id,
    data_1_1,
    data_proxima,
    leads_trabalhados,
    qualidade_crm,
    conversao_funil,
    motivos_perda,
    pontos_fortes,
    pontos_melhoria,
    estrategia,
    motivo_estrategia,
    acoes_vendedor,
    acoes_gerente,
    kpi_foco,
    status,
  } = body;

  if (!colaborador_id || !data_1_1 || !LEADS.includes(leads_trabalhados) || !CRM.includes(qualidade_crm) || !FUNIL.includes(conversao_funil)) {
    return NextResponse.json(
      { error: 'Campos obrigatórios: colaborador_id, data_1_1, leads_trabalhados, qualidade_crm, conversao_funil' },
      { status: 400 }
    );
  }

  const row = {
    colaborador_id,
    gestor_id: gestorId,
    data_1_1: data_1_1.slice(0, 10),
    data_proxima: data_proxima?.slice(0, 10) ?? null,
    leads_trabalhados,
    qualidade_crm,
    conversao_funil,
    motivos_perda: motivos_perda ?? [],
    pontos_fortes: pontos_fortes ?? [],
    pontos_melhoria: pontos_melhoria ?? [],
    estrategia: estrategia ?? null,
    motivo_estrategia: motivo_estrategia ?? null,
    acoes_vendedor: acoes_vendedor ?? null,
    acoes_gerente: acoes_gerente ?? null,
    kpi_foco: kpi_foco ?? null,
    status: status ?? 'finalizado',
  };

  const { data, error } = await supabase.from('avaliacoes_1_1').insert(row).select('id, score_performance').single();

  if (error) {
    console.error('Erro ao inserir 1:1:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data?.id, score_performance: data?.score_performance }, { status: 201 });
}
