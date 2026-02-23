'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import { LayoutDashboard, TrendingUp, TrendingDown, Users, BarChart3, Table } from 'lucide-react';

export default function GestaoLayout({
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
      if (u.role !== 'gestao') { router.replace('/'); return; }
      setUser(u as User);
    }).catch(() => router.replace('/'));
    return () => { cancelled = true; };
  }, [router]);

  const menuItems = [
    { label: 'Dashboard Executivo', href: '/gestao/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Registros Diários', href: '/gestao/registros-diarios', icon: <Table size={20} /> },
    { label: 'Melhores', href: '/gestao/melhores', icon: <TrendingUp size={20} /> },
    { label: 'Piores', href: '/gestao/piores', icon: <TrendingDown size={20} /> },
    { label: 'Turnover', href: '/gestao/turnover', icon: <Users size={20} /> },
    { label: 'Tendências', href: '/gestao/tendencias', icon: <BarChart3 size={20} /> },
  ];

  // Renderizar children sempre - sem condições que bloqueiem
  if (!mounted || !user) {
    return <div>{children}</div>;
  }

  return <Layout user={user} menuItems={menuItems}>{children}</Layout>;
}
