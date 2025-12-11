'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, IndicadoresColaborador } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11 } from '@/lib/data';
import { calculateScore, formatDate } from '@/lib/utils';
import { ArrowLeft, TrendingDown, AlertTriangle, Search } from 'lucide-react';

export default function PioresPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'gestao') {
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

  const getIndicadores = (colaboradorId: string): IndicadoresColaborador => {
    const avalsColab = avaliacoes.filter(
      a => a.colaboradorId === colaboradorId && a.status === 'finalizado'
    );

    if (avalsColab.length === 0) {
      return {
        colaboradorId,
        mediaLeadsTrabalhados: 0,
        mediaQualidadeCRM: 0,
        mediaConversaoFunil: 0,
        totalAvaliacoes: 0,
        tendencia: 'estavel',
        riscoDesligamento: 'baixo',
        scoreGeral: 0,
      };
    }

    const scores = avalsColab.map(a => calculateScore(a));
    const scoreGeral = scores.reduce((a, b) => a + b, 0) / scores.length;

    const ultimaAvaliacao = avalsColab.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )[0];

    const penultimaAvaliacao = avalsColab.length > 1
      ? avalsColab.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[1]
      : null;

    let tendencia: 'melhora' | 'piora' | 'estavel' = 'estavel';
    if (penultimaAvaliacao) {
      const scoreAtual = calculateScore(ultimaAvaliacao);
      const scoreAnterior = calculateScore(penultimaAvaliacao);
      if (scoreAtual > scoreAnterior + 5) tendencia = 'melhora';
      else if (scoreAtual < scoreAnterior - 5) tendencia = 'piora';
    }

    let riscoDesligamento: 'baixo' | 'medio' | 'alto' = 'baixo';
    if (scoreGeral < 50) riscoDesligamento = 'alto';
    else if (scoreGeral < 70) riscoDesligamento = 'medio';

    return {
      colaboradorId,
      mediaLeadsTrabalhados: 0,
      mediaQualidadeCRM: 0,
      mediaConversaoFunil: 0,
      totalAvaliacoes: avalsColab.length,
      ultimaAvaliacao: ultimaAvaliacao.data,
      tendencia,
      riscoDesligamento,
      scoreGeral: Math.round(scoreGeral),
    };
  };

  const indicadores = colaboradores.map(c => ({
    colaborador: c,
    indicadores: getIndicadores(c.id),
  }));

  const piores = indicadores
    .filter(i => i.indicadores.tendencia === 'piora' || i.indicadores.riscoDesligamento === 'alto' || i.indicadores.scoreGeral < 60)
    .filter(i => {
      if (filtroArea && i.colaborador.area !== filtroArea) return false;
      if (busca && !i.colaborador.name.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.indicadores.scoreGeral - b.indicadores.scoreGeral);

  const areas = Array.from(new Set(colaboradores.map(c => c.area)));

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
          <Link
            href="/gestao/dashboard"
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 mb-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mr-2" />
            Colaboradores com Baixa Performance
          </h1>
          <p className="mt-2 text-gray-300">Colaboradores que precisam de atenção imediata</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome do colaborador..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Área</label>
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="" className="bg-gray-800">Todas as áreas</option>
              {areas.map((area) => (
                <option key={area} value={area} className="bg-gray-800">
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de piores */}
      <div className="card-white">
        <div className="card-white-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Colaboradores que Precisam de Atenção</h2>
            <span className="text-sm text-gray-300">{piores.length} colaboradores</span>
          </div>
        </div>
        <div className="divide-y divide-blue-500/30">
          {piores.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Nenhum colaborador com baixa performance identificado
            </div>
          ) : (
            piores.map((item, index) => (
              <div key={item.colaborador.id} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white border ${
                      item.indicadores.riscoDesligamento === 'alto' ? 'bg-red-500/20 border-red-500/50' : 'bg-orange-500/20 border-orange-500/50'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.colaborador.name}</h3>
                      <p className="text-sm text-gray-400">{item.colaborador.cargo} • {item.colaborador.area} • {item.colaborador.gestorNome}</p>
                      {item.indicadores.ultimaAvaliacao && (
                        <p className="text-xs text-gray-500 mt-1">
                          Última avaliação: {formatDate(item.indicadores.ultimaAvaliacao)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Score Geral</p>
                      <p className={`text-2xl font-bold ${
                        item.indicadores.scoreGeral >= 80 ? 'text-green-400' : 
                        item.indicadores.scoreGeral >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {item.indicadores.scoreGeral}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Risco</p>
                      <p className={`text-lg font-semibold ${
                        item.indicadores.riscoDesligamento === 'alto' ? 'text-red-400' : 
                        item.indicadores.riscoDesligamento === 'medio' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {item.indicadores.riscoDesligamento === 'alto' ? 'Alto' : 
                         item.indicadores.riscoDesligamento === 'medio' ? 'Médio' : 'Baixo'}
                      </p>
                    </div>
                    {item.indicadores.tendencia === 'piora' && (
                      <TrendingDown className="h-8 w-8 text-red-400" />
                    )}
                    {item.indicadores.riscoDesligamento === 'alto' && (
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    )}
                  </div>
                </div>
                {(item.indicadores.tendencia === 'piora' || item.indicadores.riscoDesligamento === 'alto') && (
                  <div className="mt-3 pt-3 border-t border-blue-500/30">
                    <div className="flex items-center space-x-4 text-sm">
                      {item.indicadores.tendencia === 'piora' && (
                        <div className="flex items-center text-red-400">
                          <TrendingDown size={16} className="mr-1" />
                          <span className="font-medium">Tendência de piora</span>
                        </div>
                      )}
                      {item.indicadores.riscoDesligamento === 'alto' && (
                        <div className="flex items-center text-red-400">
                          <AlertTriangle size={16} className="mr-1" />
                          <span className="font-medium">Alto risco de desligamento</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
