'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import { FileText, FolderOpen, Bell, Calendar, HelpCircle, User as UserIcon, Clock } from 'lucide-react';

export default function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (cancelled) return;
      if (!u) { router.replace('/'); return; }
      if (u.role !== 'colaborador') { router.replace('/'); return; }
      setUser(u as User);
    }).catch(() => router.replace('/'));
    return () => { cancelled = true; };
  }, [router]);

  const menuItems = [
    { label: 'Solicitações', href: '/colaborador/solicitacoes', icon: <FileText size={20} /> },
    { label: 'Ponto', href: '/colaborador/ponto', icon: <Clock size={20} /> },
    { label: 'Meus Documentos', href: '/colaborador/documentos', icon: <FolderOpen size={20} /> },
    { label: 'Comunicados', href: '/colaborador/comunicados', icon: <Bell size={20} /> },
    { label: 'Disponibilidade', href: '/colaborador/disponibilidade', icon: <Calendar size={20} /> },
    { label: 'Autoatendimento', href: '/colaborador/autoatendimento', icon: <HelpCircle size={20} /> },
    { label: 'Meu Perfil', href: '/colaborador/perfil', icon: <UserIcon size={20} /> },
  ];

  // Renderizar children sempre - sem condições que bloqueiem
  if (!mounted || !user) {
    return <div>{children}</div>;
  }

  return <Layout user={user} menuItems={menuItems}>{children}</Layout>;
}


