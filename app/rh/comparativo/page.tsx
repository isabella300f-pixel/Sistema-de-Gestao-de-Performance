'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Colaborador, Avaliacao11 } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11 } from '@/lib/data';
import { calculateScore } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparativoPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
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

  const toggleColaborador = (id: string) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter(s => s !== id));
    } else if (selecionados.length < 3) {
      setSelecionados([...selecionados, id]);
    }
  };

  const getScoreMedio = (colaboradorId: string) => {
    const avals = avaliacoes.filter(
      a => a.colaboradorId === colaboradorId && a.status === 'finalizado'
    );
    if (avals.length === 0) return 0;
    const scores = avals.map(a => calculateScore(a));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const chartData = selecionados.map(id => {
    const colab = colaboradores.find(c => c.id === id);
    return {
      name: colab?.name || '',
      score: getScoreMedio(id),
    };
  });

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
        <h1 className="text-3xl font-bold text-white">Comparativo de Colaboradores</h1>
        <p className="mt-2 text-gray-300">Compare até 3 colaboradores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Selecione Colaboradores</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {colaboradores.map((colab) => {
              const selecionado = selecionados.includes(colab.id);
              const desabilitado = !selecionado && selecionados.length >= 3;
              return (
                <label
                  key={colab.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${
                    selecionado
                      ? 'border-blue-500 bg-blue-500/20'
                      : desabilitado
                      ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                      : 'border-blue-500/30 hover:border-blue-500/50 bg-gray-800/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => toggleColaborador(colab.id)}
                    disabled={desabilitado}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-800"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-white">{colab.name}</p>
                    <p className="text-sm text-gray-400">{colab.cargo} • {colab.area}</p>
                    <p className="text-xs text-gray-500">Score médio: {getScoreMedio(colab.id)}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Comparativo</h2>
          {selecionados.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Selecione até 3 colaboradores para comparar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="score" fill="#3B82F6" name="Score Médio" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
