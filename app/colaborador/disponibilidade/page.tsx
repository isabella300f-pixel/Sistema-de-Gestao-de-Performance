'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Disponibilidade } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ColaboradorDisponibilidadePage() {
  const router = useRouter();
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
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
      setDisponibilidades([
        {
          id: '1',
          colaboradorId: currentUser.id,
          tipo: 'indisponibilidade_futura',
          dataInicio: '2024-12-25',
          dataFim: '2024-12-26',
          motivo: 'Feriado de Natal',
          status: 'aprovado',
          dataCriacao: '2024-12-01',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disponibilidade e Agenda</h1>
          <p className="mt-1 text-gray-600">Gerencie sua disponibilidade e solicite ajustes</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Nova Solicitação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Indisponibilidades Futuras</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {disponibilidades.filter(d => d.tipo === 'indisponibilidade_futura').length}
              </p>
            </div>
            <Calendar className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Solicitações Pendentes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {disponibilidades.filter(d => d.status === 'pendente').length}
              </p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {disponibilidades.filter(d => d.status === 'aprovado').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Minhas Solicitações</h2>
        <div className="space-y-4">
          {disponibilidades.map((disp) => (
            <div key={disp.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{disp.motivo}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(disp.dataInicio)}
                    {disp.dataFim && ` até ${formatDate(disp.dataFim)}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  disp.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                  disp.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {disp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


