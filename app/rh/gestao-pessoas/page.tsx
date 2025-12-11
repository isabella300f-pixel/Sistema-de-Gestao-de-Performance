'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, PerfilColaborador, HistoricoProfissional, Competencia } from '@/types';
import { getAllColaboradores } from '@/lib/data';
import { formatDate, getDaysSince } from '@/lib/utils';
import { Users, User, TrendingUp, Clock, Search, FileText, Award, Building2 } from 'lucide-react';

export default function RHGestaoPessoasPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'colaboradores' | 'organograma' | 'talentos'>('dashboard');

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
      setColaboradores(cols);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const colaboradoresFiltrados = colaboradores.filter((colab) => {
    const matchBusca = busca === '' || 
      colab.name.toLowerCase().includes(busca.toLowerCase()) ||
      colab.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchArea = filtroArea === '' || colab.area === filtroArea;
    return matchBusca && matchArea;
  });

  const areas = Array.from(new Set(colaboradores.map(c => c.area))).sort();
  
  // Calcular métricas
  const totalColaboradores = colaboradores.length;
  const tempoMedioCasa = colaboradores.reduce((acc, c) => {
    return acc + getDaysSince(c.dataAdmissao);
  }, 0) / totalColaboradores || 0;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Pessoas</h1>
          <p className="mt-2 text-gray-300">Acompanhamento completo dos colaboradores</p>
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
            onClick={() => setView('colaboradores')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'colaboradores' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Colaboradores
          </button>
          <button
            onClick={() => setView('organograma')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'organograma' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Organograma
          </button>
          <button
            onClick={() => setView('talentos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'talentos' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Mapa de Talentos
          </button>
        </div>
      </div>

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total de Colaboradores</p>
                <p className="text-3xl font-bold text-white mt-2">{totalColaboradores}</p>
              </div>
              <Users className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Tempo Médio de Casa</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {Math.round(tempoMedioCasa / 30)} meses
                </p>
              </div>
              <Clock className="text-green-400" size={32} />
            </div>
          </div>

          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Áreas</p>
                <p className="text-3xl font-bold text-white mt-2">{areas.length}</p>
              </div>
              <Building2 className="text-purple-400" size={32} />
            </div>
          </div>

          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Evolução</p>
                <p className="text-3xl font-bold text-white mt-2">+12%</p>
                <p className="text-xs text-green-400 mt-1">vs mês anterior</p>
              </div>
              <TrendingUp className="text-green-400" size={32} />
            </div>
          </div>
        </div>
      )}

      {view === 'colaboradores' && (
        <div className="space-y-4">
          <div className="card-white p-4">
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

          <div className="card-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-500/30">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Colaborador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cargo / Área</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Admissão</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tempo de Casa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/30">
                  {colaboradoresFiltrados.map((colab) => (
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
                        <div className="text-sm text-white">{colab.cargo}</div>
                        <div className="text-sm text-gray-400">{colab.area}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(colab.dataAdmissao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {Math.round(getDaysSince(colab.dataAdmissao) / 30)} meses
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/rh/colaboradores/${colab.id}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Ver Perfil
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === 'organograma' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Organograma Dinâmico</h2>
          <div className="text-center py-12 text-gray-400">
            <Building2 size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Organograma dinâmico em desenvolvimento</p>
            <p className="text-sm mt-2">Visualização hierárquica da estrutura organizacional</p>
          </div>
        </div>
      )}

      {view === 'talentos' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Mapa de Talentos</h2>
          <div className="text-center py-12 text-gray-400">
            <Award size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Mapa de talentos em desenvolvimento</p>
            <p className="text-sm mt-2">Matriz de competências e habilidades dos colaboradores</p>
          </div>
        </div>
      )}
    </div>
  );
}
