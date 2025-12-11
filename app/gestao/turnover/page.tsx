'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, TurnoverData } from '@/types';
import { getAllColaboradores } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Users, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TurnoverPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [turnover, setTurnover] = useState<TurnoverData | null>(null);
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

      const cols = getAllColaboradores();
      setColaboradores(cols);

      // Calcular turnover
      const desligados = cols.filter(c => c.status === 'desligado');
      const voluntarios = desligados.length; // Simplificado - em produção, teria campo específico
      const involuntarios = 0; // Simplificado

      const porArea: Record<string, { total: number; voluntario: number; involuntario: number }> = {};
      const porGestor: Record<string, { total: number; voluntario: number; involuntario: number }> = {};

      desligados.forEach(colab => {
        if (!porArea[colab.area]) {
          porArea[colab.area] = { total: 0, voluntario: 0, involuntario: 0 };
        }
        porArea[colab.area].total++;
        porArea[colab.area].voluntario++;

        if (!porGestor[colab.gestorNome]) {
          porGestor[colab.gestorNome] = { total: 0, voluntario: 0, involuntario: 0 };
        }
        porGestor[colab.gestorNome].total++;
        porGestor[colab.gestorNome].voluntario++;
      });

      const tempoMedio = desligados.length > 0
        ? desligados.reduce((acc, colab) => {
            const admissao = new Date(colab.dataAdmissao);
            const desligamento = colab.dataDesligamento ? new Date(colab.dataDesligamento) : new Date();
            const dias = Math.floor((desligamento.getTime() - admissao.getTime()) / (1000 * 60 * 60 * 24));
            return acc + dias;
          }, 0) / desligados.length
        : 0;

      setTurnover({
        total: desligados.length,
        voluntario: voluntarios,
        involuntario: involuntarios,
        porArea,
        porGestor,
        tempoMedioPermanencia: Math.round(tempoMedio),
        motivosSaida: {}, // Simplificado
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const desligados = colaboradores.filter(c => c.status === 'desligado');
  const ativos = colaboradores.filter(c => c.status === 'ativo');

  const turnoverPorAreaData = turnover
    ? Object.entries(turnover.porArea).map(([area, data]) => ({
        name: area,
        total: data.total,
        voluntario: data.voluntario,
        involuntario: data.involuntario,
      }))
    : [];

  const turnoverPorGestorData = turnover
    ? Object.entries(turnover.porGestor).map(([gestor, data]) => ({
        name: gestor,
        total: data.total,
        voluntario: data.voluntario,
        involuntario: data.involuntario,
      }))
    : [];

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
            <Users className="h-8 w-8 text-blue-400 mr-2" />
            Análise de Turnover
          </h1>
          <p className="mt-2 text-gray-300">Indicadores de rotatividade e desligamentos</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Turnover Total</p>
              <p className="text-2xl font-bold text-white">{turnover?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/50">
              <Users className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Turnover Voluntário</p>
              <p className="text-2xl font-bold text-white">{turnover?.voluntario || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Turnover Involuntário</p>
              <p className="text-2xl font-bold text-white">{turnover?.involuntario || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Tempo Médio</p>
              <p className="text-2xl font-bold text-white">
                {turnover?.tempoMedioPermanencia || 0} dias
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico por Área */}
      {turnoverPorAreaData.length > 0 && (
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Turnover por Área</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={turnoverPorAreaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Bar dataKey="total" fill="#ef4444" name="Total" />
              <Bar dataKey="voluntario" fill="#f59e0b" name="Voluntário" />
              <Bar dataKey="involuntario" fill="#fbbf24" name="Involuntário" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico por Gestor */}
      {turnoverPorGestorData.length > 0 && (
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Turnover por Gestor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={turnoverPorGestorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Bar dataKey="total" fill="#ef4444" name="Total" />
              <Bar dataKey="voluntario" fill="#f59e0b" name="Voluntário" />
              <Bar dataKey="involuntario" fill="#fbbf24" name="Involuntário" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista de desligados */}
      <div className="card-white">
        <div className="card-white-header">
          <h2 className="text-lg font-semibold text-white">Colaboradores Desligados</h2>
        </div>
        <div className="divide-y divide-blue-500/30">
          {desligados.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              nenhum colaborador desligado registrado
            </div>
          ) : (
            desligados.map((colab) => {
              const admissao = new Date(colab.dataAdmissao);
              const desligamento = colab.dataDesligamento ? new Date(colab.dataDesligamento) : new Date();
              const dias = Math.floor((desligamento.getTime() - admissao.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={colab.id} className="px-6 py-4 hover:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{colab.name}</h3>
                      <p className="text-sm text-gray-400">{colab.cargo} • {colab.area} • {colab.gestorNome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        Admissão: {formatDate(colab.dataAdmissao)}
                      </p>
                      {colab.dataDesligamento && (
                        <p className="text-sm text-gray-400">
                          Desligamento: {formatDate(colab.dataDesligamento)}
                        </p>
                      )}
                      <p className="text-sm font-medium text-white mt-1">
                        Permanência: {dias} dias
                      </p>
                    </div>
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
