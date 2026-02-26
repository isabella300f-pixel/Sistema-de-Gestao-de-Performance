'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import type { User } from '@/types';
import { LogOut, Menu, X } from 'lucide-react';
import { storage } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';
import Logo300F from '@/components/Logo300F';

const DEV = process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  menuItems: Array<{ label: string; href: string; icon?: React.ReactNode }>;
}

export default function Layout({ children, user, menuItems }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('currentUser');
        document.cookie = 'devUser=; path=/; max-age=0';
      } catch {
        if (DEV) storage.removeItem('currentUser');
      }
    }
    if (!DEV) {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    }
    router.push('/');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gestor':
        return 'Gestor';
      case 'rh':
        return 'RH';
      case 'gestao':
        return 'Gestão de Pessoas';
      default:
        return role;
    }
  };

  const headerHeight = '64px';

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header: sempre no topo, nunca sobreposto pela sidebar */}
      <header
        className="flex-shrink-0 bg-white border-b border-gray-200 sticky top-0 z-50"
        style={{ minHeight: headerHeight }}
      >
        <div className="px-3 sm:px-4 lg:px-6 h-full">
          <div className="flex justify-between items-center gap-2 min-h-[64px] py-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 flex-shrink-0"
                aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ecosystem-red/50 transition-opacity min-w-0"
                title="Voltar para a página de login"
              >
                <div className="w-10 h-10 bg-ecosystem-red flex items-center justify-center flex-shrink-0 rounded">
                  <span className="text-white font-bold text-lg">300</span>
                </div>
                <span className="hidden sm:block flex-shrink-0">
                  <Logo300F variant="light" size="small" />
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[140px] sm:max-w-none">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Área abaixo do header: sidebar + conteúdo */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: sempre ABAIXO do header (mobile: fixed com top = headerHeight) */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed left-0 z-[45] w-64 max-w-[85vw] bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 lg:z-auto lg:max-w-none border-r border-gray-800`}
          style={{ top: headerHeight, bottom: 0 }}
        >
          <nav className="h-full overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setSidebarOpen(false)}
                    className={`${
                      isActive
                        ? 'bg-ecosystem-red text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors`}
                  >
                    {item.icon && <span className="mr-3 flex-shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Overlay para mobile: abaixo do header; clique fecha a sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[42] lg:hidden"
            style={{ top: headerHeight }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content: key por pathname força remontagem ao trocar de rota (evita mesma tela em prod) */}
        <main key={pathname} className="flex-1 min-w-0 bg-black">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

