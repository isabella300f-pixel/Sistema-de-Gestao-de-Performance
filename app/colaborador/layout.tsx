'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { User } from '@/types';
import { FileText, MessageSquare, FolderOpen, Bell, Calendar, HelpCircle, User as UserIcon } from 'lucide-react';

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
    
    const timer = setTimeout(() => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          router.replace('/');
          return;
        }

        const currentUser = JSON.parse(currentUserStr) as User;
        if (currentUser.role !== 'colaborador') {
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
    { label: 'Solicitações', href: '/colaborador/solicitacoes', icon: <FileText size={20} /> },
    { label: 'Chat com RH', href: '/colaborador/chat', icon: <MessageSquare size={20} /> },
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


