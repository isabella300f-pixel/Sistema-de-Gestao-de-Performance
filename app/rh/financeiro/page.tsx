'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustoColaborador, Headcount } from '@/types';
import { DollarSign, Users, TrendingUp, Calculator, FileText } from 'lucide-react';

export default function RHFinanceiroPage() {
  const router = useRouter();
  const [headcount, setHeadcount] = useState<Headcount | null>(null);
  const [custos, setCustos] = useState<CustoColaborador[]>([]);
  const [view, setView] = useState<'dashboard' | 'headcount' | 'custos' | 'simulacoes'>('dashboard');
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
      setHeadcount({
        total: 50,
        porArea: { 'Vendas': 20, 'Tecnologia': 15, 'RH': 5, 'Financeiro': 10 },
        porCargo: { 'Vendedor': 20, 'Desenvolvedor': 15, 'Analista': 10, 'Gerente': 5 },
        porSenioridade: { 'junior': 20, 'pleno': 20, 'senior': 10 },
        periodo: '2024-01',
      });
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
        <h1 className="text-3xl font-bold text-white">Financeiro (RH)</h1>
        <p className="mt-2 text-gray-300">Gestão dos custos de pessoal</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('headcount')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'headcount' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Headcount
        </button>
        <button
          onClick={() => setView('custos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'custos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Custos
        </button>
        <button
          onClick={() => setView('simulacoes')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'simulacoes' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Simulações
        </button>
      </div>

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Headcount Total</p>
                <p className="text-3xl font-bold text-white mt-2">{headcount?.total || 0}</p>
              </div>
              <Users className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Custo Total Mensal</p>
                <p className="text-3xl font-bold text-white mt-2">R$ 450K</p>
              </div>
              <DollarSign className="text-green-400" size={32} />
            </div>
          </div>
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Custo Médio/Colaborador</p>
                <p className="text-3xl font-bold text-white mt-2">R$ 9K</p>
              </div>
              <Calculator className="text-purple-400" size={32} />
            </div>
          </div>
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Variação vs Mês Anterior</p>
                <p className="text-3xl font-bold text-white mt-2">+5%</p>
              </div>
              <TrendingUp className="text-green-400" size={32} />
            </div>
          </div>
        </div>
      )}

      {view === 'headcount' && headcount && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Headcount por Área</h2>
          <div className="space-y-4">
            {Object.entries(headcount.porArea).map(([area, count]) => (
              <div key={area} className="flex items-center justify-between p-4 border border-blue-500/30 rounded-lg">
                <span className="font-medium text-white">{area}</span>
                <span className="text-lg font-bold text-blue-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'custos' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Custos por Colaborador e Setor</h2>
          <div className="text-center py-12 text-gray-400">
            <DollarSign size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Análise de custos em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'simulacoes' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Simulações de Impacto Financeiro</h2>
          <div className="text-center py-12 text-gray-400">
            <Calculator size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Simulações financeiras em desenvolvimento</p>
          </div>
        </div>
      )}
    </div>
  );
}


