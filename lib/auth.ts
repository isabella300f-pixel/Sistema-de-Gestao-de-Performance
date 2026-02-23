'use client';

import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const DEV = process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';

/** Retorna o usuário atual: em dev do localStorage, em prod da sessão Supabase + profile */
export async function getCurrentUser(): Promise<AppUser | null> {
  if (typeof window === 'undefined') return null;

  if (DEV) {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const u = JSON.parse(raw) as { id: string; name: string; email: string; role: UserRole };
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    } catch {
      return null;
    }
  }

  const supabase = createClient();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nome, email, role')
    .eq('id', session.user.id)
    .single();

  if (!profile || !profile.role) return null;
  if (profile.role !== 'rh' && profile.role !== 'gestor' && profile.role !== 'gestao' && profile.role !== 'colaborador') return null;

  return {
    id: profile.id,
    name: profile.nome ?? session.user.email ?? '',
    email: profile.email ?? session.user.email ?? '',
    role: profile.role as UserRole,
  };
}
