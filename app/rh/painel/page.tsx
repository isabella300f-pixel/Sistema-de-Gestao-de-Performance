'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, IndicadoresColaborador, RegistroDiario } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11, getAvaliacoes11ByColaborador, getAllRegistrosDiarios, initializeRegistrosDiarios } from '@/lib/data';
import { formatDate, calculateScore } from '@/lib/utils';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Search, Phone, PhoneCall, FileText, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function RHPainelPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [filtroGestor, setFiltroGestor] = useState<string>('');
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
      if (currentUser.role !== 'rh') {
        router.push('/');
        return;
      }

      initializeRegistrosDiarios();
      const cols = getAllColaboradores().filter(c => c.status === 'ativo');
      const avals = getAllAvaliacoes11();
      const registros = getAllRegistrosDiarios();

      setColaboradores(cols);
      setAvaliacoes(avals);
      setRegistrosDiarios(registros);
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

  const colaboradoresFiltrados = colaboradores.filter((colab) => {
    if (filtroArea && colab.area !== filtroArea) return false;
    if (filtroGestor && colab.gestorId !== filtroGestor) return false;
    if (busca && !colab.name.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const areas = Array.from(new Set(colaboradores.map(c => c.area)));
  const gestores = Array.from(new Set(colaboradores.map(c => c.gestorNome)));

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Painel Geral - RH</h1>
        <p className="mt-2 text-gray-300">Acompanhamento de todos os colaboradores</p>
      </div>

      {/* KPIs dos Registros Diários */}
      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Métricas Gerais de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroLigacoes, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Ligações</p>
            <p className="text-xs text-gray-400 mt-1">
              Conv Atendidas: {registrosDiarios.reduce((sum, r) => sum + r.ligacoesAtendidas, 0) > 0 
                ? ((registrosDiarios.reduce((sum, r) => sum + r.ligacoesAtendidas, 0) / registrosDiarios.reduce((sum, r) => sum + r.numeroLigacoes, 0)) * 100).toFixed(2)
                : '0.00'}%
            </p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.ligacoesAtendidas, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Atendidas</p>
            <p className="text-xs text-gray-400 mt-1">
              Conv Aberturas: {registrosDiarios.reduce((sum, r) => sum + r.ligacoesAtendidas, 0) > 0
                ? ((registrosDiarios.reduce((sum, r) => sum + r.numeroAberturas, 0) / registrosDiarios.reduce((sum, r) => sum + r.ligacoesAtendidas, 0)) * 100).toFixed(2)
                : '0.00'}%
            </p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroAberturas, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Aberturas</p>
            <p className="text-xs text-gray-400 mt-1">
              Conv Formulários: {registrosDiarios.reduce((sum, r) => sum + r.numeroAberturas, 0) > 0
                ? ((registrosDiarios.reduce((sum, r) => sum + r.numeroFormularios, 0) / registrosDiarios.reduce((sum, r) => sum + r.numeroAberturas, 0)) * 100).toFixed(2)
                : '0.00'}%
            </p>
          </div>
          
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {registrosDiarios.reduce((sum, r) => sum + r.numeroFormularios, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-gray-300">Formulários</p>
            <p className="text-xs text-gray-400 mt-1">
              Conv Onlines: {registrosDiarios.reduce((sum, r) => sum + r.numeroFormularios, 0) > 0
                ? ((registrosDiarios.reduce((sum, r) => sum + r.numeroOnlines, 0) / registrosDiarios.reduce((sum, r) => sum + r.numeroFormularios, 0)) * 100).toFixed(2)
                : '0.00'}%
            </p>
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

      {/* Gráficos de Performance Complexos */}
      {registrosDiarios.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de linha temporal com múltiplas séries */}
            <div className="card-white p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Evolução de Ligações por Vendedor</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={(() => {
                  const datas = Array.from(new Set(registrosDiarios.map(r => r.data))).sort();
                  const topColabs = colaboradores.map(col => {
                    const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
                    const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                    return { col, total };
                  }).sort((a, b) => b.total - a.total).slice(0, 4);

                  return datas.map(data => {
                    const item: any = { data };
                    topColabs.forEach(({ col }) => {
                      const regs = registrosDiarios.filter(r => r.colaboradorId === col.id && r.data === data);
                      const total = regs.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                      item[col.name.split(' ').slice(0, 2).join(' ')] = total;
                    });
                    return item;
                  });
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                  <XAxis 
                    dataKey="data" 
                    tick={{ fill: '#fff', fontSize: 11 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#fff' }} domain={[0, 250]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                  {colaboradores.map((col, index) => {
                    const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
                    const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                    const topColabs = colaboradores.map(c => {
                      const r = registrosDiarios.filter(reg => reg.colaboradorId === c.id);
                      return { c, total: r.reduce((sum, reg) => sum + reg.numeroLigacoes, 0) };
                    }).sort((a, b) => b.total - a.total).slice(0, 4);
                    
                    if (!topColabs.some(t => t.c.id === col.id)) return null;
                    
                    const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                    const idx = topColabs.findIndex(t => t.c.id === col.id);
                    return (
                      <Line 
                        key={col.id}
                        type="monotone" 
                        dataKey={col.name.split(' ').slice(0, 2).join(' ')} 
                        stroke={cores[idx % cores.length]} 
                        strokeWidth={2}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de barras empilhadas por dia da semana */}
            <div className="card-white p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Ligações por Dia da Semana</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={(() => {
                  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                  const topColabs = colaboradores.map(col => {
                    const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
                    const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                    return { col, total };
                  }).sort((a, b) => b.total - a.total).slice(0, 6);

                  return diasSemana.map(dia => {
                    const item: any = { dia };
                    topColabs.forEach(({ col }) => {
                      const regs = registrosDiarios.filter(r => r.colaboradorId === col.id && r.diaSemana === dia);
                      const total = regs.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                      item[col.name.split(' ').slice(0, 2).join(' ')] = total;
                    });
                    return item;
                  }).filter(d => Object.values(d).some((v: any) => typeof v === 'number' && v > 0));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                  <XAxis 
                    dataKey="dia" 
                    tick={{ fill: '#fff', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                  {colaboradores.map((col, index) => {
                    const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
                    const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                    const topColabs = colaboradores.map(c => {
                      const r = registrosDiarios.filter(reg => reg.colaboradorId === c.id);
                      return { c, total: r.reduce((sum, reg) => sum + reg.numeroLigacoes, 0) };
                    }).sort((a, b) => b.total - a.total).slice(0, 6);
                    
                    if (!topColabs.some(t => t.c.id === col.id)) return null;
                    
                    const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                    const idx = topColabs.findIndex(t => t.c.id === col.id);
                    return (
                      <Bar 
                        key={col.id}
                        dataKey={col.name.split(' ').slice(0, 2).join(' ')} 
                        stackId="a"
                        fill={cores[idx % cores.length]} 
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráficos Adicionais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de rosca - Distribuição */}
            <div className="card-white p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Call Realizadas por Vendedor</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={colaboradores.map(col => {
                      const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
                      const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                      return {
                        name: col.name.split(' ').slice(0, 2).join(' '),
                        value: total
                      };
                    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {colaboradores.map((_, index) => {
                      const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
                      return <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de área - Evolução temporal */}
            <div className="card-white p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Evolução Temporal de Ligações</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={(() => {
                  const registrosPorData = registrosDiarios.reduce((acc, reg) => {
                    const data = reg.data;
                    if (!acc[data]) {
                      acc[data] = { data, total: 0 };
                    }
                    acc[data].total += reg.numeroLigacoes;
                    return acc;
                  }, {} as Record<string, { data: string; total: number }>);

                  return Object.values(registrosPorData)
                    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                    .slice(-14);
                })()}>
                  <defs>
                    <linearGradient id="colorTotalRH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                  <XAxis 
                    dataKey="data" 
                    tick={{ fill: '#fff', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#fff' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotalRH)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de barras simples - Top 10 */}
          <div className="card-white p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Número de Ligações por Vendedor</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={colaboradores.map(col => {
                const regsColab = registrosDiarios.filter(r => r.colaboradorId === col.id);
                const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
                return {
                  nome: col.name.split(' ').slice(0, 2).join(' '),
                  total,
                };
              }).filter(d => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 10)}>
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
        </>
      )}

      {/* Filtros */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gestor</label>
            <select
              value={filtroGestor}
              onChange={(e) => setFiltroGestor(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="" className="bg-gray-800">Todos os gestores</option>
              {gestores.map((gestor) => (
                <option key={gestor} value={gestor} className="bg-gray-800">
                  {gestor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de colaboradores */}
      <div className="card-white">
        <div className="card-white-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Colaboradores</h2>
            <span className="text-sm text-gray-300">{colaboradoresFiltrados.length} colaboradores</span>
          </div>
        </div>
        <div className="divide-y divide-blue-500/30">
          {colaboradoresFiltrados.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p>Nenhum colaborador encontrado</p>
            </div>
          ) : (
            colaboradoresFiltrados.map((colab) => {
              const indicadores = getIndicadores(colab.id);
              return (
                <div key={colab.id} className="px-6 py-4 hover:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-white">{colab.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          indicadores.riscoDesligamento === 'alto'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : indicadores.riscoDesligamento === 'medio'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                            : 'bg-green-500/20 text-green-400 border-green-500/50'
                        }`}>
                          {indicadores.riscoDesligamento === 'alto' && <><AlertTriangle size={12} className="inline mr-1" /> Alto Risco</>}
                          {indicadores.riscoDesligamento === 'medio' && 'Médio Risco'}
                          {indicadores.riscoDesligamento === 'baixo' && 'Baixo Risco'}
                        </span>
                        {indicadores.tendencia === 'melhora' && (
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        )}
                        {indicadores.tendencia === 'piora' && (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-300">{colab.cargo} • {colab.area} • {colab.gestorNome}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="text-gray-300">
                          Score: <span className={`font-semibold ${
                            indicadores.scoreGeral >= 80 ? 'text-green-400' : 
                            indicadores.scoreGeral >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {indicadores.scoreGeral}
                          </span>
                        </span>
                        <span className="text-gray-300">
                          Avaliações: {indicadores.totalAvaliacoes}
                        </span>
                        {indicadores.ultimaAvaliacao && (
                          <span className="text-gray-300">
                            Última: {formatDate(indicadores.ultimaAvaliacao)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/rh/colaboradores/${colab.id}`}
                      className="ml-4 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-md border border-blue-500/50"
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

