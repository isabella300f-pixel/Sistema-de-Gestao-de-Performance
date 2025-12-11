'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, IndicadoresColaborador } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11 } from '@/lib/data';
import { calculateScore } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Award, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function GestaoDashboardPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
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

  const melhores = indicadores
    .filter(i => i.indicadores.tendencia === 'melhora')
    .sort((a, b) => b.indicadores.scoreGeral - a.indicadores.scoreGeral)
    .slice(0, 5);

  const piores = indicadores
    .filter(i => i.indicadores.tendencia === 'piora' || i.indicadores.riscoDesligamento === 'alto')
    .sort((a, b) => a.indicadores.scoreGeral - b.indicadores.scoreGeral)
    .slice(0, 5);

  const altoRisco = indicadores.filter(i => i.indicadores.riscoDesligamento === 'alto');

  const distribuicaoRisco = {
    alto: indicadores.filter(i => i.indicadores.riscoDesligamento === 'alto').length,
    medio: indicadores.filter(i => i.indicadores.riscoDesligamento === 'medio').length,
    baixo: indicadores.filter(i => i.indicadores.riscoDesligamento === 'baixo').length,
  };

  const chartData = [
    { name: 'Alto Risco', value: distribuicaoRisco.alto, color: '#ef4444' },
    { name: 'Médio Risco', value: distribuicaoRisco.medio, color: '#f59e0b' },
    { name: 'Baixo Risco', value: distribuicaoRisco.baixo, color: '#10b981' },
  ];

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Executivo</h1>
        <p className="mt-2 text-gray-300">Visão geral de performance e indicadores</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/50">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Melhor Evolução</p>
              <p className="text-2xl font-bold text-white">{melhores.length}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Pior Evolução</p>
              <p className="text-2xl font-bold text-white">{piores.length}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/50">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Alto Risco</p>
              <p className="text-2xl font-bold text-white">{altoRisco.length}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Ativos</p>
              <p className="text-2xl font-bold text-white">{colaboradores.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de distribuição de risco */}
      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Distribuição de Risco</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Melhor Evolução */}
      <div className="card-white">
        <div className="card-white-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Award className="h-5 w-5 text-green-400 mr-2" />
            Top 5 Melhor Evolução
          </h2>
          <Link href="/gestao/melhores" className="text-sm text-blue-400 hover:text-blue-300">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-blue-500/30">
          {melhores.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Nenhum colaborador com melhora identificada
            </div>
          ) : (
            melhores.map((item, index) => (
              <div key={item.colaborador.id} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold border border-green-500/50">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.colaborador.name}</h3>
                      <p className="text-sm text-gray-400">{item.colaborador.cargo} • {item.colaborador.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Score</p>
                      <p className={`text-lg font-bold ${
                        item.indicadores.scoreGeral >= 80 ? 'text-green-400' : 
                        item.indicadores.scoreGeral >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {item.indicadores.scoreGeral}
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top 5 Pior Evolução */}
      <div className="card-white">
        <div className="card-white-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            Top 5 Pior Evolução / Alto Risco
          </h2>
          <Link href="/gestao/piores" className="text-sm text-blue-400 hover:text-blue-300">
            Ver todos →
          </Link>
        </div>
        <div className="divide-y divide-blue-500/30">
          {piores.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Nenhum colaborador com piora identificada
            </div>
          ) : (
            piores.map((item, index) => (
              <div key={item.colaborador.id} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/50">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.colaborador.name}</h3>
                      <p className="text-sm text-gray-400">{item.colaborador.cargo} • {item.colaborador.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Score</p>
                      <p className={`text-lg font-bold ${
                        item.indicadores.scoreGeral >= 80 ? 'text-green-400' : 
                        item.indicadores.scoreGeral >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {item.indicadores.scoreGeral}
                      </p>
                    </div>
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

