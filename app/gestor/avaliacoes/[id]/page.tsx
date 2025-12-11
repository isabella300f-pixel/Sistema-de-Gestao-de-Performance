'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Avaliacao11, Colaborador } from '@/types';
import { getAllAvaliacoes11, getColaboradorById, getUserById } from '@/lib/data';
import { formatDate, calculateScore } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function AvaliacaoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const avaliacaoId = params.id as string;
  
  const [avaliacao, setAvaliacao] = useState<Avaliacao11 | null>(null);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
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

      const avals = getAllAvaliacoes11();
      const aval = avals.find(a => a.id === avaliacaoId);
      
      if (!aval || aval.gestorId !== gestor.id) {
        router.push('/gestor/dashboard');
        return;
      }

      const colab = getColaboradorById(aval.colaboradorId);

      setAvaliacao(aval);
      setColaborador(colab || null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router, avaliacaoId]);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!avaliacao) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Avaliação não encontrada</p>
        <Link href="/gestor/dashboard" className="mt-4 text-blue-600 hover:text-blue-700">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const score = calculateScore(avaliacao);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/gestor/historico"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Detalhes da Avaliação 1:1
        </h1>
        <p className="mt-2 text-gray-600">
          {colaborador?.name} • {formatDate(avaliacao.data)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Score */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Score Geral</h2>
            <span className={`text-3xl font-bold ${
              score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {score}
            </span>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leads Trabalhados</label>
            <p className="text-lg font-semibold text-gray-900 capitalize">{avaliacao.leadsTrabalhados}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade CRM</label>
            <p className="text-lg font-semibold text-gray-900 capitalize">{avaliacao.qualidadeCRM}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conversão no Funil</label>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {avaliacao.conversaoFunil.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Motivos de Perda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivos de Perda Predominantes</label>
          <div className="flex flex-wrap gap-2">
            {avaliacao.motivosPerda.map((motivo, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {motivo.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Pontos Fortes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pontos Fortes Identificados</label>
          <div className="flex flex-wrap gap-2">
            {avaliacao.pontosFortes.map((ponto, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {ponto.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Pontos de Melhoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pontos de Melhoria</label>
          <div className="flex flex-wrap gap-2">
            {avaliacao.pontosMelhoria.map((ponto, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {ponto.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Estratégia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estratégia Principal</label>
          <p className="text-gray-900">{avaliacao.estrategia.replace('_', ' ')}</p>
          <p className="text-sm text-gray-500 mt-1">Motivo: {avaliacao.motivoEstrategia.replace('_', ' ')}</p>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ações do Vendedor (próximos 7 dias)
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">{avaliacao.acoesVendedor}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ações do Gerente
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">{avaliacao.acoesGerente}</p>
          </div>
        </div>

        {/* KPI de Foco */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">KPI de Foco</label>
          <p className="text-gray-900">{avaliacao.kpiFoco}</p>
        </div>

        {/* Próxima Data */}
        {avaliacao.dataProxima && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Próxima Data do 1:1</label>
            <p className="text-gray-900">{formatDate(avaliacao.dataProxima)}</p>
          </div>
        )}

        {/* Status */}
        <div className="border-t border-gray-200 pt-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            avaliacao.status === 'finalizado'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {avaliacao.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
          </span>
        </div>
      </div>
    </div>
  );
}

