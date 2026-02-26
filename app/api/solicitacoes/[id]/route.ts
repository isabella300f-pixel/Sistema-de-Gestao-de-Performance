import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDevUser, devSolicitacaoGET, devSolicitacaoPATCH } from '@/lib/dev-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const devUser = getDevUser(request);
  if (devUser) {
    const sol = devSolicitacaoGET(id, devUser);
    if (!sol) return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    const mensagens = sol.mensagens.map((m) => ({
      id: m.id,
      solicitacaoId: id,
      remetenteId: m.remetente_id,
      remetenteNome: m.remetente_tipo === 'rh' ? 'RH' : (devUser.id === m.remetente_id ? devUser.name ?? 'Você' : 'Colaborador'),
      remetenteTipo: m.remetente_tipo,
      mensagem: m.mensagem,
      data: m.criado_em,
    }));
    return NextResponse.json({ ...sol, mensagens });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: sol, error: errSol } = await supabase
    .from('solicitacoes')
    .select('*')
    .eq('id', id)
    .single();
  if (errSol || !sol) return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isRH = profile?.role === 'rh' || profile?.role === 'gestao';
  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  const isOwner = colab && sol.colaborador_id === colab.id;
  if (!isRH && !isOwner) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { data: mensagens } = await supabase
    .from('solicitacao_mensagens')
    .select('*')
    .eq('solicitacao_id', id)
    .order('criado_em', { ascending: true });

  const { data: profiles } = await supabase.from('profiles').select('id, nome');
  const mapNome: Record<string, string> = {};
  profiles?.forEach((p: { id: string; nome: string }) => { mapNome[p.id] = p.nome; });

  const msgs = (mensagens ?? []).map((m: { id: string; remetente_id: string; remetente_tipo: string; mensagem: string; criado_em: string }) => ({
    id: m.id,
    solicitacaoId: id,
    remetenteId: m.remetente_id,
    remetenteNome: mapNome[m.remetente_id] ?? (m.remetente_tipo === 'rh' ? 'RH' : 'Colaborador'),
    remetenteTipo: m.remetente_tipo,
    mensagem: m.mensagem,
    data: m.criado_em,
  }));

  return NextResponse.json({ ...sol, mensagens: msgs });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const devUser = getDevUser(request);
  if (devUser && (devUser.role === 'rh' || devUser.role === 'gestao')) {
    let body: { status?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }
    const status = body.status;
    if (!status || !['aberto','em_analise','aprovado','rejeitado','aguardando_documentos'].includes(status))
      return NextResponse.json({ error: 'status inválido' }, { status: 400 });
    if (devSolicitacaoPATCH(id, status, devUser)) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'rh' && profile?.role !== 'gestao')
    return NextResponse.json({ error: 'Apenas RH pode alterar status' }, { status: 403 });

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  const status = body.status;
  if (!status || !['aberto','em_analise','aprovado','rejeitado','aguardando_documentos'].includes(status))
    return NextResponse.json({ error: 'status inválido' }, { status: 400 });

  const { error } = await supabase
    .from('solicitacoes')
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
