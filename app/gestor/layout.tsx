'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import { LayoutDashboard, Users, FileText, History, Table } from 'lucide-react';

export default function GestorLayout({
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
      if (!u) {
        router.replace('/');
        return;
      }
      if (u.role !== 'gestor') {
        router.replace('/');
        return;
      }
      setUser(u as User);
    }).catch(() => router.replace('/'));
    return () => { cancelled = true; };
  }, [router]);

  const menuItems = [
    { label: 'Dashboard', href: '/gestor/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Registros Diários', href: '/gestor/registros-diarios', icon: <Table size={20} /> },
    { label: 'Meus Colaboradores', href: '/gestor/colaboradores', icon: <Users size={20} /> },
    { label: 'Registrar 1:1', href: '/gestor/registrar', icon: <FileText size={20} /> },
    { label: 'Histórico', href: '/gestor/historico', icon: <History size={20} /> },
  ];

  // Renderizar children sempre - sem condições que bloqueiem
  if (!mounted || !user) {
    return <div>{children}</div>;
  }

  return <Layout user={user} menuItems={menuItems}>{children}</Layout>;
}
