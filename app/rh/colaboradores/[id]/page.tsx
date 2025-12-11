'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, AvaliacaoRH } from '@/types';
import { getColaboradorById, getAvaliacoes11ByColaborador, getAvaliacoesRHByColaborador, getUserById, createAvaliacaoRH } from '@/lib/data';
import { formatDate, calculateScore } from '@/lib/utils';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useForm } from 'react-hook-form';

export default function RHColaboradorPage() {
  const router = useRouter();
  const params = useParams();
  const colaboradorId = params.id as string;
  
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [avaliacoes11, setAvaliacoes11] = useState<Avaliacao11[]>([]);
  const [avaliacoesRH, setAvaliacoesRH] = useState<AvaliacaoRH[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      classificacao: 'neutro',
      observacoes: '',
      riscoDesligamento: 'baixo',
      intervencoes: '',
    },
  });

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

      const colab = getColaboradorById(colaboradorId);
      if (!colab) {
        router.push('/rh/painel');
        return;
      }

      const avals11 = getAvaliacoes11ByColaborador(colaboradorId);
      const avalsRH = getAvaliacoesRHByColaborador(colaboradorId);

      setColaborador(colab);
      setAvaliacoes11(avals11);
      setAvaliacoesRH(avalsRH);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router, colaboradorId]);

  const onSubmitRH = (data: any) => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;

    const currentUser = JSON.parse(currentUserStr);
    const rhUser = getUserById(currentUser.id);
    if (!rhUser) return;

    const avaliacao: Omit<AvaliacaoRH, 'id' | 'createdAt'> = {
      colaboradorId,
      avaliadorId: rhUser.id,
      data: new Date().toISOString().split('T')[0],
      classificacao: data.classificacao,
      observacoes: data.observacoes,
      riscoDesligamento: data.riscoDesligamento,
      intervencoes: data.intervencoes ? [data.intervencoes] : [],
    };

    createAvaliacaoRH(avaliacao);
    setAvaliacoesRH([...avaliacoesRH, { ...avaliacao, id: `rh-${Date.now()}`, createdAt: new Date().toISOString() }]);
    setShowForm(false);
    alert('Avaliação do RH registrada com sucesso!');
  };

  const chartData = avaliacoes11
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
        <Link href="/rh/painel" className="mt-4 text-blue-600 hover:text-blue-700">
          Voltar ao Painel
        </Link>
      </div>
    );
  }

  const ultimaAvaliacao = avaliacoes11
    .filter(a => a.status === 'finalizado')
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

  const scoreAtual = ultimaAvaliacao ? calculateScore(ultimaAvaliacao) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/rh/painel"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{colaborador.name}</h1>
          <p className="mt-1 text-gray-600">{colaborador.cargo} • {colaborador.area} • {colaborador.gestorNome}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Nova Avaliação RH'}
        </button>
      </div>

      {/* Formulário de avaliação RH */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Avaliação do RH</h2>
          <form onSubmit={handleSubmit(onSubmitRH)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classificação</label>
              <select
                {...register('classificacao', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="positivo">Positivo</option>
                <option value="neutro">Neutro</option>
                <option value="alerta">Alerta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risco de Desligamento</label>
              <select
                {...register('riscoDesligamento', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="baixo">Baixo</option>
                <option value="medio">Médio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea
                {...register('observacoes', { required: true })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Descreva suas observações..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intervenções</label>
              <textarea
                {...register('intervencoes')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Descreva as intervenções realizadas ou planejadas..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar Avaliação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Score Atual</p>
          <p className={`text-3xl font-bold mt-2 ${
            scoreAtual >= 80 ? 'text-green-600' : scoreAtual >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {scoreAtual}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total de Avaliações 1:1</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{avaliacoes11.filter(a => a.status === 'finalizado').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Avaliações do RH</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{avaliacoesRH.length}</p>
        </div>
      </div>

      {/* Gráfico */}
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

      {/* Histórico de avaliações 1:1 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Avaliações 1:1</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {avaliacoes11.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Nenhuma avaliação 1:1 registrada
            </div>
          ) : (
            avaliacoes11.map((aval) => {
              const score = calculateScore(aval);
              return (
                <div key={aval.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{formatDate(aval.data)}</h3>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Leads:</span>
                          <span className="ml-2 font-medium capitalize">{aval.leadsTrabalhados}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CRM:</span>
                          <span className="ml-2 font-medium capitalize">{aval.qualidadeCRM}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Funil:</span>
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
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Avaliações do RH */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Avaliações do RH</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {avaliacoesRH.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Nenhuma avaliação do RH registrada
            </div>
          ) : (
            avaliacoesRH.map((aval) => (
              <div key={aval.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{formatDate(aval.data)}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        aval.classificacao === 'positivo'
                          ? 'bg-green-100 text-green-800'
                          : aval.classificacao === 'alerta'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {aval.classificacao === 'positivo' ? 'Positivo' : aval.classificacao === 'alerta' ? 'Alerta' : 'Neutro'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        aval.riscoDesligamento === 'alto'
                          ? 'bg-red-100 text-red-800'
                          : aval.riscoDesligamento === 'medio'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Risco: {aval.riscoDesligamento === 'alto' ? 'Alto' : aval.riscoDesligamento === 'medio' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{aval.observacoes}</p>
                    {aval.intervencoes && aval.intervencoes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Intervenções:</p>
                        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                          {aval.intervencoes.map((interv, idx) => (
                            <li key={idx}>{interv}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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

