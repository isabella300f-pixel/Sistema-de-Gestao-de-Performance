'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Treinamento, Certificado, TrilhaAprendizagem } from '@/types';
import { GraduationCap, Award, BookOpen, Calendar, AlertTriangle } from 'lucide-react';

export default function RHTreinamentosPage() {
  const router = useRouter();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [trilhas, setTrilhas] = useState<TrilhaAprendizagem[]>([]);
  const [view, setView] = useState<'treinamentos' | 'trilhas' | 'certificados' | 'vencimentos'>('treinamentos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'rh') {
        router.push('/');
        return;
      }

      // Dados simulados
      setTreinamentos([
        {
          id: '1',
          titulo: 'Gestão de Equipes',
          descricao: 'Treinamento completo sobre liderança e gestão',
          tipo: 'online',
          cargaHoraria: 40,
          dataInicio: '2024-01-15',
          dataFim: '2024-02-15',
          status: 'em_andamento',
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red mx-auto mb-4"></div>
          <p className="text-gray-300 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Treinamentos e Desenvolvimento</h1>
        <p className="mt-2 text-gray-300">Controle e gestão de capacitações</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('treinamentos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'treinamentos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Treinamentos
        </button>
        <button
          onClick={() => setView('trilhas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'trilhas' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Trilhas de Aprendizagem
        </button>
        <button
          onClick={() => setView('certificados')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'certificados' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Certificados
        </button>
        <button
          onClick={() => setView('vencimentos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'vencimentos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Vencimentos
        </button>
      </div>

      {view === 'treinamentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treinamentos.map((treinamento) => (
            <div key={treinamento.id} className="card-white p-6">
              <div className="flex items-start justify-between mb-4">
                <GraduationCap className="text-blue-400" size={32} />
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  treinamento.status === 'em_andamento' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                  treinamento.status === 'concluido' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/50'
                }`}>
                  {treinamento.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{treinamento.titulo}</h3>
              <p className="text-sm text-gray-300 mb-4">{treinamento.descricao}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{treinamento.cargaHoraria}h</span>
                <span>{treinamento.tipo}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'trilhas' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Trilhas de Aprendizagem</h2>
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Trilhas de aprendizagem em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'certificados' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Certificados</h2>
          <div className="text-center py-12 text-gray-400">
            <Award size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Gestão de certificados em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'vencimentos' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Controle de Vencimento</h2>
          <div className="text-center py-12 text-gray-400">
            <AlertTriangle size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Controle de vencimento de cursos em desenvolvimento</p>
          </div>
        </div>
      )}
    </div>
  );
}


