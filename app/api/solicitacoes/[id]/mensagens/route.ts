import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: solicitacaoId } = await params;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  let body: { mensagem: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  if (!body.mensagem?.trim()) return NextResponse.json({ error: 'mensagem obrigatória' }, { status: 400 });

  const { data: sol } = await supabase.from('solicitacoes').select('colaborador_id').eq('id', solicitacaoId).single();
  if (!sol) return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const { data: colab } = await supabase.from('colaboradores').select('id').eq('user_id', user.id).single();
  const isRH = profile?.role === 'rh' || profile?.role === 'gestao';
  const isOwner = colab && sol.colaborador_id === colab.id;
  if (!isRH && !isOwner) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const remetenteTipo = isRH ? 'rh' : 'colaborador';

  const { data, error } = await supabase
    .from('solicitacao_mensagens')
    .insert({
      solicitacao_id: solicitacaoId,
      remetente_id: user.id,
      remetente_tipo: remetenteTipo,
      mensagem: body.mensagem.trim(),
    })
    .select('id, criado_em')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, criado_em: data.criado_em }, { status: 201 });
}
