'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, AvaliacaoRH } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11, getAvaliacoes11ByColaborador, getAvaliacoesRHByColaborador } from '@/lib/data';
import { formatDate, calculateScore } from '@/lib/utils';
import { Search, User, TrendingUp, TrendingDown, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

export default function RHAvaliacaoPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [filtroArea, setFiltroArea] = useState<string>('');
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

      const cols = getAllColaboradores().filter(c => c.status === 'ativo');
      const avals = getAllAvaliacoes11();

      setColaboradores(cols);
      setAvaliacoes(avals);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const getUltimaAvaliacao = (colaboradorId: string) => {
    const avals = avaliacoes.filter(
      a => a.colaboradorId === colaboradorId && a.status === 'finalizado'
    );
    if (avals.length === 0) return null;
    return avals.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
  };

  const getScoreAtual = (colaboradorId: string) => {
    const ultima = getUltimaAvaliacao(colaboradorId);
    if (!ultima) return 0;
    return calculateScore(ultima);
  };

  const getRiscoDesligamento = (colaboradorId: string): 'baixo' | 'medio' | 'alto' => {
    const score = getScoreAtual(colaboradorId);
    if (score < 50) return 'alto';
    if (score < 70) return 'medio';
    return 'baixo';
  };

  const colaboradoresFiltrados = colaboradores.filter((colab) => {
    const matchBusca = busca === '' || 
      colab.name.toLowerCase().includes(busca.toLowerCase()) ||
      colab.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchArea = filtroArea === '' || colab.area === filtroArea;
    return matchBusca && matchArea;
  });

  const areas = Array.from(new Set(colaboradores.map(c => c.area))).sort();

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
        <h1 className="text-3xl font-bold text-white">Avaliação Individual</h1>
        <p className="mt-2 text-gray-300">Selecione um colaborador para visualizar e criar avaliações</p>
      </div>

      {/* Filtros */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar colaborador
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome ou cargo..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por área
            </label>
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="" className="bg-gray-800">Todas as áreas</option>
              {areas.map(area => (
                <option key={area} value={area} className="bg-gray-800">{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de colaboradores */}
      <div className="card-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-500/30">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Área / Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Última Avaliação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Risco
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/30">
              {colaboradoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Nenhum colaborador encontrado
                  </td>
                </tr>
              ) : (
                colaboradoresFiltrados.map((colab) => {
                  const ultimaAvaliacao = getUltimaAvaliacao(colab.id);
                  const score = getScoreAtual(colab.id);
                  const risco = getRiscoDesligamento(colab.id);

                  return (
                    <tr key={colab.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/50">
                            <User className="text-blue-400" size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{colab.name}</div>
                            <div className="text-sm text-gray-400">{colab.gestorNome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{colab.area}</div>
                        <div className="text-sm text-gray-400">{colab.cargo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-semibold ${
                            score >= 80 ? 'text-green-400' :
                            score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {score}
                          </span>
                          {ultimaAvaliacao && (
                            <span className="ml-2 text-xs text-gray-400">/ 100</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {ultimaAvaliacao ? formatDate(ultimaAvaliacao.data) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          risco === 'alto' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          risco === 'medio' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          'bg-green-500/20 text-green-400 border-green-500/50'
                        }`}>
                          {risco === 'alto' && <AlertTriangle size={12} className="mr-1" />}
                          {risco === 'medio' && <TrendingDown size={12} className="mr-1" />}
                          {risco === 'baixo' && <TrendingUp size={12} className="mr-1" />}
                          {risco === 'alto' ? 'Alto' : risco === 'medio' ? 'Médio' : 'Baixo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/rh/colaboradores/${colab.id}`}
                          className="inline-flex items-center text-blue-400 hover:text-blue-300"
                        >
                          Avaliar
                          <ArrowRight size={16} className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {colaboradoresFiltrados.length > 0 && (
        <div className="text-sm text-gray-400 text-center">
          Mostrando {colaboradoresFiltrados.length} de {colaboradores.length} colaboradores
        </div>
      )}
    </div>
  );
}
