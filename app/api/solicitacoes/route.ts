import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDevUser, devSolicitacoesGET, devSolicitacoesPOST } from '@/lib/dev-api';

export async function GET(request: NextRequest) {
  const devUser = getDevUser(request);
  if (devUser) {
    const list = devSolicitacoesGET(devUser);
    return NextResponse.json(list);
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role;

  if (role === 'rh' || role === 'gestao') {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('*, colaboradores(nome, email)')
      .order('criado_em', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  if (!colab) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*')
    .eq('colaborador_id', colab.id)
    .order('criado_em', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const devUser = getDevUser(request);
  if (devUser && devUser.role === 'colaborador') {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }
    if (!body.tipo || !body.motivo) return NextResponse.json({ error: 'tipo e motivo obrigatórios' }, { status: 400 });
    const data = devSolicitacoesPOST(devUser, body);
    if (data) return NextResponse.json({ id: data.id, protocolo: data.protocolo }, { status: 201 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  if (!colab) return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 403 });

  let body: { tipo: string; tipo_detalhado?: string; motivo: string; prioridade?: string; data_inicio?: string; data_termino?: string; impacto_atividades?: boolean; reposicao?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  if (!body.tipo || !body.motivo) return NextResponse.json({ error: 'tipo e motivo obrigatórios' }, { status: 400 });

  const { data, error } = await supabase
    .from('solicitacoes')
    .insert({
      colaborador_id: colab.id,
      tipo: body.tipo,
      tipo_detalhado: body.tipo_detalhado ?? null,
      motivo: body.motivo,
      prioridade: body.prioridade ?? 'media',
      data_inicio: body.data_inicio ?? null,
      data_termino: body.data_termino ?? null,
      impacto_atividades: body.impacto_atividades ?? false,
      reposicao: body.reposicao ?? null,
      status: 'aberto',
    })
    .select('id, protocolo')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
