'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11 } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11 } from '@/lib/data';
import { calculateScore, formatDate } from '@/lib/utils';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TendenciasPage() {
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

  // Agrupar avaliações por mês
  const avaliacoesPorMes = avaliacoes
    .filter(a => a.status === 'finalizado')
    .reduce((acc, aval) => {
      const mes = new Date(aval.data).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
      if (!acc[mes]) {
        acc[mes] = [];
      }
      acc[mes].push(aval);
      return acc;
    }, {} as Record<string, Avaliacao11[]>);

  const chartData = Object.entries(avaliacoesPorMes)
    .map(([mes, avals]) => {
      const scores = avals.map(a => calculateScore(a));
      const media = scores.reduce((a, b) => a + b, 0) / scores.length;
      return {
        mes,
        media: Math.round(media),
        quantidade: avals.length,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.mes);
      const dateB = new Date(b.mes);
      return dateA.getTime() - dateB.getTime();
    });

  // Áreas que mais melhoraram
  const areas = Array.from(new Set(colaboradores.map(c => c.area)));
  const areasMelhoria = areas.map(area => {
    const colsArea = colaboradores.filter(c => c.area === area);
    const avalsArea = avaliacoes.filter(a => 
      colsArea.some(c => c.id === a.colaboradorId) && a.status === 'finalizado'
    );
    
    if (avalsArea.length < 2) return { area, melhoria: 0 };

    const avalsOrdenadas = avalsArea.sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    
    const primeira = calculateScore(avalsOrdenadas[0]);
    const ultima = calculateScore(avalsOrdenadas[avalsOrdenadas.length - 1]);
    
    return {
      area,
      melhoria: ultima - primeira,
      quantidade: avalsArea.length,
    };
  }).filter(a => a.quantidade > 0).sort((a, b) => b.melhoria - a.melhoria);

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
            <BarChart3 className="h-8 w-8 text-blue-400 mr-2" />
            Tendências e Evolução
          </h1>
          <p className="mt-2 text-gray-300">Análise de evolução geral da empresa</p>
        </div>
      </div>

      {/* Gráfico de evolução geral */}
      {chartData.length > 0 && (
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Evolução Geral da Performance</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9CA3AF" />
              <YAxis domain={[0, 100]} stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="media" stroke="#3B82F6" strokeWidth={2} name="Score Médio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Áreas que mais melhoraram */}
      <div className="card-white">
        <div className="card-white-header">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
            Áreas com Maior Melhoria
          </h2>
        </div>
        <div className="divide-y divide-blue-500/30">
          {areasMelhoria.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Dados insuficientes para análise
            </div>
          ) : (
            areasMelhoria.map((item, index) => (
              <div key={item.area} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 font-bold border border-green-500/50">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.area}</h3>
                      <p className="text-sm text-gray-400">{item.quantidade} avaliações</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Melhoria</p>
                      <p className={`text-2xl font-bold ${
                        item.melhoria > 0 ? 'text-green-400' : item.melhoria < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {item.melhoria > 0 ? '+' : ''}{item.melhoria.toFixed(1)}
                      </p>
                    </div>
                    {item.melhoria > 0 && <TrendingUp className="h-8 w-8 text-green-400" />}
                    {item.melhoria < 0 && <TrendingDown className="h-8 w-8 text-red-400" />}
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
