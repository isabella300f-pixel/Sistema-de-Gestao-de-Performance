import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDevUser, devPontoPATCH } from '@/lib/dev-api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const devUser = getDevUser(request);
  if (devUser && (devUser.role === 'rh' || devUser.role === 'gestao')) {
    let body: { aprovado?: boolean; status?: string; justificativa?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }
    const upd: { aprovado?: boolean; status?: string } = {};
    if (typeof body.aprovado === 'boolean') upd.aprovado = body.aprovado;
    if (body.status && ['normal', 'atraso', 'falta', 'justificado', 'ferias', 'licenca'].includes(body.status)) upd.status = body.status;
    if (Object.keys(upd).length === 0) return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    const data = devPontoPATCH(id, upd);
    if (data) return NextResponse.json(data);
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: 'Não configurado' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'rh' && profile?.role !== 'gestao')
    return NextResponse.json({ error: 'Apenas RH pode validar registro' }, { status: 403 });

  let body: { aprovado?: boolean; status?: string; justificativa?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const upd: Record<string, unknown> = {};
  if (typeof body.aprovado === 'boolean') {
    upd.aprovado = body.aprovado;
    upd.aprovado_por = body.aprovado ? user.id : null;
  }
  if (body.status && ['normal', 'atraso', 'falta', 'justificado', 'ferias', 'licenca'].includes(body.status))
    upd.status = body.status;
  if (body.justificativa !== undefined) upd.justificativa = body.justificativa;

  if (Object.keys(upd).length === 0) return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });

  const { data, error } = await supabase
    .from('registros_ponto')
    .update(upd)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
