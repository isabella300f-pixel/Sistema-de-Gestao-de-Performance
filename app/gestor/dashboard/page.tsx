'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, RegistroDiario } from '@/types';
import { getColaboradoresByGestor, getAvaliacoes11ByGestor, getUserById, getAllRegistrosDiarios, initializeRegistrosDiarios } from '@/lib/data';
import { formatDate, getDaysSince } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Users, Phone, PhoneCall, FileText, Globe, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function GestorDashboard() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
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

      initializeRegistrosDiarios();
      const cols = getColaboradoresByGestor(gestor.id);
      const avals = getAvaliacoes11ByGestor(gestor.id);
      const registros = getAllRegistrosDiarios().filter(r => 
        cols.some(c => c.id === r.colaboradorId)
      );

      setColaboradores(cols);
      setAvaliacoes(avals);
      setRegistrosDiarios(registros);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const getStatus11 = (colaboradorId: string) => {
    const ultimaAvaliacao = avaliacoes
      .filter(a => a.colaboradorId === colaboradorId && a.status === 'finalizado')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

    if (!ultimaAvaliacao) {
      return { status: 'pendente', dias: null, proxima: null };
    }

    const diasDesde = getDaysSince(ultimaAvaliacao.data);
    const proxima = ultimaAvaliacao.dataProxima ? new Date(ultimaAvaliacao.dataProxima) : null;

    if (proxima && proxima < new Date()) {
      return { status: 'atrasado', dias: Math.abs(getDaysSince(ultimaAvaliacao.dataProxima!)), proxima };
    }

    if (diasDesde > 30) {
      return { status: 'atrasado', dias: diasDesde, proxima };
    }

    return { status: 'em-dia', dias: diasDesde, proxima };
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard do Gestor</h1>
        <p className="mt-2 text-gray-300">Acompanhe seus colaboradores e reuniões 1:1</p>
      </div>

      {/* KPIs dos Registros Diários */}
      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Métricas de Performance da Equipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroLigacoes, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Ligações</p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.ligacoesAtendidas, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Atendidas</p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroAberturas, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Aberturas</p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroFormularios, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Formulários</p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroOnlines, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Onlines</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Performance por Colaborador */}
      {registrosDiarios.length > 0 && (
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ligações por Colaborador</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={colaboradores.map(col => {
              const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
              const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
              return {
                nome: col.name.split(' ').slice(0, 2).join(' '),
                total,
              };
            }).filter(d => d.total > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
              <XAxis 
                dataKey="nome" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: '#fff', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="total" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total de Colaboradores</p>
              <p className="text-2xl font-bold text-white">{colaboradores.length}</p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">1:1 em Dia</p>
              <p className="text-2xl font-bold text-white">
                {colaboradores.filter(c => getStatus11(c.id).status === 'em-dia').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-white p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">1:1 Atrasados</p>
              <p className="text-2xl font-bold text-white">
                {colaboradores.filter(c => getStatus11(c.id).status === 'atrasado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de colaboradores */}
      <div className="card-white">
        <div className="card-white-header">
          <h2 className="text-lg font-semibold text-white">Meus Colaboradores</h2>
        </div>
        <div className="divide-y divide-blue-500/30">
          {colaboradores.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              Nenhum colaborador encontrado
            </div>
          ) : (
            colaboradores.map((colab) => {
              const status = getStatus11(colab.id);
              return (
                <div key={colab.id} className="px-6 py-4 hover:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-white">{colab.name}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full border ${
                          status.status === 'em-dia'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : status.status === 'atrasado'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        }`}>
                          {status.status === 'em-dia' && <><CheckCircle size={12} className="inline mr-1" /> Em dia</>}
                          {status.status === 'atrasado' && <><AlertCircle size={12} className="inline mr-1" /> Atrasado {status.dias} dias</>}
                          {status.status === 'pendente' && <><Clock size={12} className="inline mr-1" /> Pendente</>}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-300">{colab.cargo} • {colab.area}</p>
                      {status.proxima && (
                        <p className="mt-1 text-xs text-gray-400">
                          Próxima reunião: {formatDate(status.proxima)}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/gestor/colaboradores/${colab.id}`}
                        className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-md border border-blue-500/50"
                      >
                        Ver Histórico
                      </Link>
                      <Link
                        href={`/gestor/registrar?colaborador=${colab.id}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        Registrar 1:1
                      </Link>
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

