'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User } from '@/types';
import { LayoutDashboard, Users, FileText, BarChart3, Clock, Briefcase, GraduationCap, FolderOpen, Heart, DollarSign, MessageSquare, Settings } from 'lucide-react';

export default function RHLayout({
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
        if (currentUser.role !== 'rh') {
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
    { label: 'Painel Geral', href: '/rh/painel', icon: <LayoutDashboard size={20} /> },
    { label: 'Usuários', href: '/rh/usuarios', icon: <Settings size={20} /> },
    { label: 'Chat', href: '/rh/chat', icon: <MessageSquare size={20} /> },
    { label: 'Gestão de Pessoas', href: '/rh/gestao-pessoas', icon: <Users size={20} /> },
    { label: 'Controle de Ponto', href: '/rh/ponto', icon: <Clock size={20} /> },
    { label: 'Recrutamento', href: '/rh/recrutamento', icon: <Briefcase size={20} /> },
    { label: 'Treinamentos', href: '/rh/treinamentos', icon: <GraduationCap size={20} /> },
    { label: 'Documentos', href: '/rh/documentos', icon: <FolderOpen size={20} /> },
    { label: 'Clima Organizacional', href: '/rh/clima', icon: <Heart size={20} /> },
    { label: 'Financeiro', href: '/rh/financeiro', icon: <DollarSign size={20} /> },
    { label: 'Comunicação', href: '/rh/comunicacao', icon: <MessageSquare size={20} /> },
    { label: 'Avaliação Individual', href: '/rh/avaliacao', icon: <FileText size={20} /> },
    { label: 'Comparativo', href: '/rh/comparativo', icon: <BarChart3 size={20} /> },
    { label: 'Relatórios', href: '/rh/relatorios', icon: <BarChart3 size={20} /> },
  ];

  // Renderizar children sempre - sem condições que bloqueiem
  if (!mounted || !user) {
    return <div>{children}</div>;
  }

  return <Layout user={user} menuItems={menuItems}>{children}</Layout>;
}
