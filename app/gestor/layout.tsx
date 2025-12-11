'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User } from '@/types';
import { LayoutDashboard, Users, FileText, History } from 'lucide-react';

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
    
    const timer = setTimeout(() => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          router.replace('/');
          return;
        }

        const currentUser = JSON.parse(currentUserStr) as User;
        if (currentUser.role !== 'gestor') {
          router.replace('/');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        router.replace('/');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [router]);

  const menuItems = [
    { label: 'Dashboard', href: '/gestor/dashboard', icon: <LayoutDashboard size={20} /> },
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
