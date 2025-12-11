'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avaliacao11, Colaborador } from '@/types';
import { getAvaliacoes11ByGestor, getUserById, getColaboradorById } from '@/lib/data';
import { formatDate, calculateScore } from '@/lib/utils';
import { FileText, Eye } from 'lucide-react';

export default function HistoricoPage() {
  const router = useRouter();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      const gestor = getUserById(currentUser.id);
      if (!gestor || gestor.role !== 'gestor') {
        router.push('/');
        return;
      }

      const avals = getAvaliacoes11ByGestor(gestor.id);
      setAvaliacoes(avals);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Histórico de Avaliações</h1>
        <p className="mt-2 text-gray-600">Todas as avaliações 1:1 realizadas</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Avaliações</h2>
            <span className="text-sm text-gray-500">{avaliacoes.length} registros</span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {avaliacoes.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Nenhuma avaliação registrada ainda</p>
              <Link
                href="/gestor/registrar"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
              >
                Criar primeira avaliação
              </Link>
            </div>
          ) : (
            avaliacoes.map((aval) => {
              const colaborador = getColaboradorById(aval.colaboradorId);
              const score = calculateScore(aval);
              return (
                <div key={aval.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {colaborador?.name || 'Colaborador não encontrado'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          aval.status === 'finalizado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {aval.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(aval.data)}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          Leads: <span className="font-medium capitalize">{aval.leadsTrabalhados}</span>
                        </span>
                        <span className="text-gray-600">
                          CRM: <span className="font-medium capitalize">{aval.qualidadeCRM}</span>
                        </span>
                        <span className="text-gray-600">
                          Funil: <span className="font-medium capitalize">
                            {aval.conversaoFunil.replace('_', ' ')}
                          </span>
                        </span>
                        <span className={`font-semibold ${
                          score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          Score: {score}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/gestor/avaliacoes/${aval.id}`}
                      className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

