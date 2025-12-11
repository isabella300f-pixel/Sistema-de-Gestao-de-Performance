'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Colaborador, Avaliacao11 } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11 } from '@/lib/data';
import { calculateScore } from '@/lib/utils';
import { FileText, Download } from 'lucide-react';

export default function RelatoriosPage() {
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

  const exportarCSV = () => {
    const dados = colaboradores.map(colab => {
      const avals = avaliacoes.filter(a => a.colaboradorId === colab.id && a.status === 'finalizado');
      const scores = avals.map(a => calculateScore(a));
      const scoreMedio = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      return {
        Nome: colab.name,
        Cargo: colab.cargo,
        Área: colab.area,
        Gestor: colab.gestorNome,
        'Score Médio': scoreMedio,
        'Total Avaliações': avals.length,
      };
    });

    const headers = Object.keys(dados[0] || {});
    const csv = [
      headers.join(','),
      ...dados.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-colaboradores-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FileText className="h-8 w-8 text-blue-400 mr-2" />
            Relatórios
          </h1>
          <p className="mt-2 text-gray-300">Exporte dados e relatórios do sistema</p>
        </div>
        <button
          onClick={exportarCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Download size={16} className="mr-2" />
          Exportar CSV
        </button>
      </div>

      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Relatórios Disponíveis</h2>
        <div className="space-y-4">
          <div className="p-4 border border-blue-500/30 rounded-lg bg-gray-800/50">
            <h3 className="font-medium text-white">Relatório de Colaboradores</h3>
            <p className="text-sm text-gray-300 mt-1">
              Exporta lista completa de colaboradores com scores e métricas
            </p>
            <button
              onClick={exportarCSV}
              className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
