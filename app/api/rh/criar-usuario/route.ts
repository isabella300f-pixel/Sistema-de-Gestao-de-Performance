import { NextRequest, NextResponse } from 'next/server';
import { createClient, getServiceRoleClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

const ROLES: UserRole[] = ['rh', 'gestor', 'gestao', 'colaborador'];

/** Apenas RH ou Gestão podem criar usuários no sistema (Supabase Auth + profiles + colaboradores). */
export async function POST(request: NextRequest) {
  const authClient = await createClient();
  if (authClient) {
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Faça login para criar usuários.' }, { status: 401 });
    }
    const { data: profile } = await authClient.from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role as string | undefined;
    if (role !== 'rh' && role !== 'gestao') {
      return NextResponse.json({ error: 'Apenas RH ou Gestão podem criar usuários.' }, { status: 403 });
    }
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  let body: {
    email: string;
    password?: string;
    nome: string;
    role: UserRole;
    gestor_id?: string;
    time_id?: string;
    cargo_id?: string;
    cargo_nome?: string;
    area?: string;
    data_admissao?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 });
  }

  const { email, password, nome, role, gestor_id, time_id, cargo_id, cargo_nome, area, data_admissao } = body;

  if (!email?.trim() || !nome?.trim() || !role || !ROLES.includes(role)) {
    return NextResponse.json(
      { error: 'Campos obrigatórios: email, nome, role (rh|gestor|gestao|colaborador)' },
      { status: 400 }
    );
  }

  const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: password ?? undefined,
    email_confirm: true,
    user_metadata: { nome: nome.trim(), role },
  });

  if (authError) {
    console.error('Erro ao criar usuário Auth:', authError.message);
    return NextResponse.json(
      { error: authError.message === 'A user with this email already exists' ? 'Email já cadastrado.' : authError.message },
      { status: 400 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: 'Usuário não criado' }, { status: 500 });
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email!,
      nome: nome.trim(),
      role,
      ativo: true,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.error('Erro ao upsert profile:', profileError.message);
    return NextResponse.json({ error: 'Perfil não atualizado' }, { status: 500 });
  }

  if (role === 'colaborador' && (gestor_id || area || data_admissao)) {
    const { error: colabError } = await supabase.from('colaboradores').insert({
      user_id: user.id,
      nome: nome.trim(),
      email: user.email ?? undefined,
      gestor_id: gestor_id ?? null,
      time_id: time_id ?? null,
      cargo_id: cargo_id ?? null,
      cargo_nome: cargo_nome ?? null,
      area: area ?? 'Geral',
      data_admissao: data_admissao ? new Date(data_admissao).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: 'ativo',
    });

    if (colabError) {
      console.error('Erro ao criar colaborador:', colabError.message);
      return NextResponse.json(
        { ok: true, user_id: user.id, message: 'Usuário e perfil criados; colaborador falhou: ' + colabError.message },
        { status: 201 }
      );
    }
  }

  return NextResponse.json({ ok: true, user_id: user.id }, { status: 201 });
}
