import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const colaboradorIdParam = searchParams.get('colaborador_id');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isRH = profile?.role === 'rh' || profile?.role === 'gestao';

  if (isRH && colaboradorIdParam) {
    const { data, error } = await supabase
      .from('disponibilidade')
      .select('*')
      .eq('colaborador_id', colaboradorIdParam)
      .order('criado_em', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (isRH) {
    const { data, error } = await supabase
      .from('disponibilidade')
      .select('*, colaboradores(nome)')
      .order('criado_em', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  if (!colab) return NextResponse.json([], { status: 200 });

  const { data, error } = await supabase
    .from('disponibilidade')
    .select('*')
    .eq('colaborador_id', colab.id)
    .order('criado_em', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  if (!colab) return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 403 });

  let body: { tipo: string; data_inicio: string; data_fim?: string; horarios?: string; dias_semana?: string[]; motivo: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  if (!body.tipo || !body.data_inicio || !body.motivo) return NextResponse.json({ error: 'tipo, data_inicio e motivo obrigatórios' }, { status: 400 });

  const tipos = ['indisponibilidade_futura', 'impossibilidade_dia', 'troca_turno', 'ajuste_rotina', 'horarios_disponiveis'];
  if (!tipos.includes(body.tipo)) return NextResponse.json({ error: 'tipo inválido' }, { status: 400 });

  const { data, error } = await supabase
    .from('disponibilidade')
    .insert({
      colaborador_id: colab.id,
      tipo: body.tipo,
      data_inicio: body.data_inicio,
      data_fim: body.data_fim || null,
      horarios: body.horarios || null,
      dias_semana: body.dias_semana || [],
      motivo: body.motivo,
      status: 'pendente',
    })
    .select('id, criado_em')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
