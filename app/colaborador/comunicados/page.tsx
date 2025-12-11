'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Comunicado } from '@/types';
import { formatDate } from '@/lib/utils';
import { Bell, Mail, MessageSquare, Send } from 'lucide-react';

export default function ColaboradorComunicadosPage() {
  const router = useRouter();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'colaborador') {
        router.push('/');
        return;
      }

      // Dados simulados
      setComunicados([
        {
          id: '1',
          titulo: 'Novo Regulamento Interno',
          conteudo: 'Informamos sobre as atualizações no regulamento interno da empresa. Por favor, leia atentamente.',
          tipo: 'geral',
          canais: ['email', 'app'],
          dataPublicacao: new Date().toISOString().split('T')[0],
          autorId: 'rh-1',
          status: 'publicado',
        },
        {
          id: '2',
          titulo: 'Solicitação de Envio de Documentos',
          conteudo: 'Solicitamos o envio dos seguintes documentos: RG atualizado, comprovante de residência.',
          tipo: 'individual',
          canais: ['email'],
          dataPublicacao: new Date().toISOString().split('T')[0],
          autorId: 'rh-1',
          status: 'publicado',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comunicados e Informações</h1>
        <p className="mt-1 text-gray-600">Fique por dentro das informações e avisos importantes</p>
      </div>

      <div className="space-y-4">
        {comunicados.map((comunicado) => (
          <div key={comunicado.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{comunicado.titulo}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Publicado em {formatDate(comunicado.dataPublicacao)}
                </p>
              </div>
              <Bell className="text-blue-600" size={24} />
            </div>
            <p className="text-gray-700 mb-4">{comunicado.conteudo}</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Canais:</span>
              {comunicado.canais.map(canal => (
                <span key={canal} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {canal === 'email' && <Mail size={12} />}
                  {canal === 'whatsapp' && <Send size={12} />}
                  {canal === 'app' && <MessageSquare size={12} />}
                  {canal}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


