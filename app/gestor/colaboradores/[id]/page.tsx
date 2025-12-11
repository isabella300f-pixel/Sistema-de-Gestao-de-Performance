'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11 } from '@/types';
import { getColaboradorById, getAvaliacoes11ByColaborador, getUserById } from '@/lib/data';
import { formatDate, calculateScore } from '@/lib/utils';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ColaboradorHistoricoPage() {
  const router = useRouter();
  const params = useParams();
  const colaboradorId = params.id as string;
  
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
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

      const colab = getColaboradorById(colaboradorId);
      if (!colab || colab.gestorId !== gestor.id) {
        router.push('/gestor/dashboard');
        return;
      }

      const avals = getAvaliacoes11ByColaborador(colaboradorId);

      setColaborador(colab);
      setAvaliacoes(avals);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router, colaboradorId]);

  const getTendencia = (index: number) => {
    if (index === 0 || avaliacoes.length < 2) return 'estavel';
    const atual = calculateScore(avaliacoes[index]);
    const anterior = calculateScore(avaliacoes[index - 1]);
    if (atual > anterior) return 'melhora';
    if (atual < anterior) return 'piora';
    return 'estavel';
  };

  const chartData = avaliacoes
    .filter(a => a.status === 'finalizado')
    .map(a => ({
      data: formatDate(a.data),
      score: calculateScore(a),
    }))
    .reverse();

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!colaborador) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Colaborador não encontrado</p>
        <Link href="/gestor/dashboard" className="mt-4 text-blue-600 hover:text-blue-700">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/gestor/colaboradores"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{colaborador.name}</h1>
          <p className="mt-1 text-gray-600">{colaborador.cargo} • {colaborador.area}</p>
        </div>
        <Link
          href={`/gestor/registrar?colaborador=${colaborador.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Novo 1:1
        </Link>
      </div>

      {/* Gráfico de evolução */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Score</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista de avaliações */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Avaliações 1:1</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {avaliacoes.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Nenhuma avaliação registrada ainda
            </div>
          ) : (
            avaliacoes.map((aval, index) => {
              const score = calculateScore(aval);
              const tendencia = getTendencia(index);
              return (
                <div key={aval.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatDate(aval.data)}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          aval.status === 'finalizado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {aval.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </span>
                        {tendencia === 'melhora' && (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                        {tendencia === 'piora' && (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        {tendencia === 'estavel' && (
                          <Minus className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Leads Trabalhados:</span>
                          <span className="ml-2 font-medium capitalize">{aval.leadsTrabalhados}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Qualidade CRM:</span>
                          <span className="ml-2 font-medium capitalize">{aval.qualidadeCRM}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Conversão Funil:</span>
                          <span className="ml-2 font-medium capitalize">
                            {aval.conversaoFunil.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-gray-700">Score: </span>
                        <span className={`text-lg font-bold ${
                          score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {score}
                        </span>
                      </div>
                      {aval.estrategia && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Estratégia:</span> {aval.estrategia.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/gestor/avaliacoes/${aval.id}`}
                      className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    >
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

