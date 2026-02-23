import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function hoje(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function agoraTime(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function calcularHoras(entrada: string | null, saida: string | null, entradaAlmoco: string | null, saidaAlmoco: string | null): number | null {
  if (!entrada || !saida) return null;
  const [eh, em] = (entrada || '00:00').split(':').map(Number);
  const [sh, sm] = (saida || '00:00').split(':').map(Number);
  let mins = (sh * 60 + sm) - (eh * 60 + em);
  if (entradaAlmoco && saidaAlmoco) {
    const [eah, eam] = entradaAlmoco.split(':').map(Number);
    const [sah, sam] = saidaAlmoco.split(':').map(Number);
    mins -= (sah * 60 + sam) - (eah * 60 + eam);
  }
  return Math.round((mins / 60) * 100) / 100;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const colaboradorIdParam = searchParams.get('colaborador_id');
  const mes = searchParams.get('mes') || hoje().slice(0, 7);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isRH = profile?.role === 'rh' || profile?.role === 'gestao';

  if (isRH && colaboradorIdParam) {
    const { data, error } = await supabase
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaboradorIdParam)
      .gte('data', `${mes}-01`)
      .lt('data', mes.slice(0, 5) + String(Number(mes.slice(5)) + 1).padStart(2, '0') + '-01')
      .order('data', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  if (!colab && !isRH) return NextResponse.json([], { status: 200 });

  if (isRH) {
    const { data, error } = await supabase
      .from('registros_ponto')
      .select('*, colaboradores(nome)')
      .gte('data', `${mes}-01`)
      .lt('data', mes.slice(0, 5) + String(Number(mes.slice(5)) + 1).padStart(2, '0') + '-01')
      .order('data', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const { data, error } = await supabase
    .from('registros_ponto')
    .select('*')
    .eq('colaborador_id', colab.id)
    .gte('data', `${mes}-01`)
    .lt('data', mes.slice(0, 5) + String(Number(mes.slice(5)) + 1).padStart(2, '0') + '-01')
    .order('data', { ascending: true });
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

  let body: { tipo: string; data?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  const tipo = body.tipo === 'entrada' || body.tipo === 'saida' || body.tipo === 'entrada_almoco' || body.tipo === 'saida_almoco' ? body.tipo : 'entrada';
  const dataReg = body.data && /^\d{4}-\d{2}-\d{2}$/.test(body.data) ? body.data : hoje();
  const agora = agoraTime();

  const { data: existente } = await supabase
    .from('registros_ponto')
    .select('*')
    .eq('colaborador_id', colab.id)
    .eq('data', dataReg)
    .single();

  if (existente) {
    const upd: Record<string, unknown> = {};
    if (tipo === 'entrada') upd.entrada = agora;
    else if (tipo === 'saida') upd.saida = agora;
    else if (tipo === 'entrada_almoco') upd.entrada_almoco = agora;
    else if (tipo === 'saida_almoco') upd.saida_almoco = agora;
    const entrada = tipo === 'entrada' ? agora : (existente.entrada as string);
    const saida = tipo === 'saida' ? agora : (existente.saida as string);
    const entradaAlmoco = tipo === 'entrada_almoco' ? agora : (existente.entrada_almoco as string);
    const saidaAlmoco = tipo === 'saida_almoco' ? agora : (existente.saida_almoco as string);
    upd.horas_trabalhadas = calcularHoras(entrada, saida, entradaAlmoco, saidaAlmoco);
    const { data: updated, error } = await supabase
      .from('registros_ponto')
      .update(upd)
      .eq('id', existente.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updated, { status: 200 });
  }

  const ins: Record<string, unknown> = {
    colaborador_id: colab.id,
    data: dataReg,
    entrada: tipo === 'entrada' ? agora : null,
    saida: tipo === 'saida' ? agora : null,
    entrada_almoco: tipo === 'entrada_almoco' ? agora : null,
    saida_almoco: tipo === 'saida_almoco' ? agora : null,
  };
  const { data: inserted, error } = await supabase
    .from('registros_ponto')
    .insert(ins)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(inserted, { status: 201 });
}
