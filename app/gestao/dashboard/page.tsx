'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, IndicadoresColaborador, RegistroDiario } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11, getAllRegistrosDiarios, initializeRegistrosDiarios, getColaboradorIdByName, setRegistrosDiariosFromSheet } from '@/lib/data';
import { mapSheetRowsToRegistros } from '@/lib/sheet';
import { calculateScore } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Award, XCircle, Phone, PhoneCall, FileText, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area, AreaChart } from 'recharts';

export default function GestaoDashboardPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVendedor, setFilterVendedor] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>('');
  const [filterDataFim, setFilterDataFim] = useState<string>('');
  const [filterDiaSemana, setFilterDiaSemana] = useState<string>('');

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    const load = async () => {
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

        // Sincronizar com a planilha publicada (atualiza ao carregar/atualizar a página)
        let dadosFinais: RegistroDiario[] = [];
        try {
          const res = await fetch('/api/sheet/registros-diarios', { cache: 'no-store' });
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            const registros = mapSheetRowsToRegistros(json.data, getColaboradorIdByName);
            if (registros.length > 0) {
              dadosFinais = registros;
              setRegistrosDiariosFromSheet(registros);
            }
          }
        } catch (_) {
          // segue para fallback
        }
        if (dadosFinais.length === 0) {
          initializeRegistrosDiarios();
          dadosFinais = getAllRegistrosDiarios();
        }
        setRegistrosDiarios(dadosFinais);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        initializeRegistrosDiarios();
        setRegistrosDiarios(getAllRegistrosDiarios());
      } finally {
        setLoading(false);
      }
    };

    load();
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

  // Aplicar filtros do dashboard (Vendedor, Dia da Semana, Período)
  const registrosFiltrados = (() => {
    let list = [...registrosDiarios];
    if (filterVendedor) {
      list = list.filter(r => r.colaboradorId === filterVendedor);
    }
    if (filterDataInicio) {
      const inicio = new Date(filterDataInicio);
      list = list.filter(r => new Date(r.data) >= inicio);
    }
    if (filterDataFim) {
      const fim = new Date(filterDataFim);
      list = list.filter(r => new Date(r.data) <= fim);
    }
    if (filterDiaSemana) {
      list = list.filter(r => r.diaSemana === filterDiaSemana);
    }
    return list;
  })();

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Calcular KPIs dos registros diários (respeitando filtros)
  const totalLigacoes = registrosFiltrados.reduce((sum, r) => sum + r.numeroLigacoes, 0);
  const totalAtendidas = registrosFiltrados.reduce((sum, r) => sum + r.ligacoesAtendidas, 0);
  const totalAberturas = registrosFiltrados.reduce((sum, r) => sum + r.numeroAberturas, 0);
  const totalFormularios = registrosFiltrados.reduce((sum, r) => sum + r.numeroFormularios, 0);
  const totalOnlines = registrosFiltrados.reduce((sum, r) => sum + r.numeroOnlines, 0);
  const totalCallsAgendadas = registrosFiltrados.reduce((sum, r) => sum + (r.callsAgendadas ?? 0), 0);
  const totalCallsRealizadas = registrosFiltrados.reduce((sum, r) => sum + (r.callsRealizadas ?? 0), 0);

  // Conversões no funil (cada etapa em relação à anterior)
  // Conv Atendidas = % das ligações que foram atendidas
  const convAtendidas = totalLigacoes > 0 ? ((totalAtendidas / totalLigacoes) * 100).toFixed(2) : '0.00';
  // Conv Aberturas = % das atendidas que chegaram em aberturas
  const convAberturas = totalAtendidas > 0 ? ((totalAberturas / totalAtendidas) * 100).toFixed(2) : '0.00';
  // Conv Formulários = % das aberturas que viraram formulários
  const convFormularios = totalAberturas > 0 ? ((totalFormularios / totalAberturas) * 100).toFixed(2) : '0.00';
  // Conv Onlines = % dos formulários que viraram onlines
  const convOnlines = totalFormularios > 0 ? ((totalOnlines / totalFormularios) * 100).toFixed(2) : '0.00';
  // Conv Calls Agendadas = % dos onlines que viraram calls agendadas
  const convCallsAgendadas = totalOnlines > 0 ? ((totalCallsAgendadas / totalOnlines) * 100).toFixed(2) : '0.00';
  // Conv Calls Realizadas = % das calls agendadas que foram realizadas
  const convCallsRealizadas = totalCallsAgendadas > 0 ? ((totalCallsRealizadas / totalCallsAgendadas) * 100).toFixed(2) : '0.00';

  // Preparar dados para gráfico de linha por vendedor (usando dados filtrados)
  const registrosPorVendedor = colaboradores.map(col => {
    const regsColab = registrosFiltrados.filter(r => r.colaboradorId === col.id);
    const totalPorVendedor = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
    return {
      vendedor: col.name,
      total: totalPorVendedor,
    };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  // Preparar dados para gráfico de linha temporal (dados filtrados)
  const registrosPorData = registrosFiltrados.reduce((acc, reg) => {
    const data = reg.data;
    if (!acc[data]) {
      acc[data] = { data, total: 0 };
    }
    acc[data].total += reg.numeroLigacoes;
    return acc;
  }, {} as Record<string, { data: string; total: number }>);

  const chartDataTemporal = Object.values(registrosPorData)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-90); // Últimos 90 dias (todos os períodos disponíveis quando há menos datas)

  // Preparar dados para gráfico de linha por vendedor (múltiplas séries, dados filtrados)
  const topVendedores = colaboradores.map(col => {
    const regsColab = registrosFiltrados.filter(r => r.colaboradorId === col.id);
    const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
    return { col, total, regs: regsColab };
  }).sort((a, b) => b.total - a.total).slice(0, 4);

  // Preparar dados para gráfico de barras empilhadas por dia da semana
  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const chartDataPorDiaSemana = diasSemana.map(dia => {
    const item: any = { dia };
    topVendedores.forEach(({ col }) => {
      const regs = registrosFiltrados.filter(r => r.colaboradorId === col.id && r.diaSemana === dia);
      const total = regs.reduce((sum, r) => sum + r.numeroLigacoes, 0);
      item[col.name.split(' ').slice(0, 2).join(' ')] = total;
    });
    return item;
  }).filter(d => Object.values(d).some((v: any) => typeof v === 'number' && v > 0));

  // Preparar dados para gráfico de rosca (distribuição de ligações por vendedor, dados filtrados)
  const distribLigacoesPorVendedor = colaboradores.map(col => {
    const regsColab = registrosFiltrados.filter(r => r.colaboradorId === col.id);
    const total = regsColab.reduce((sum, r) => sum + r.numeroLigacoes, 0);
    return {
      name: col.name.split(' ').slice(0, 2).join(' '),
      value: total
    };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 8);

  // Preparar dados para tabela de calor semanal (dados filtrados)
  const registrosPorSemana = registrosFiltrados.reduce((acc, reg) => {
    const data = new Date(reg.data);
    const semana = `Semana ${Math.ceil(data.getDate() / 7)}`;
    const colab = colaboradores.find(c => c.id === reg.colaboradorId);
    const nome = colab?.name || 'Outro';
    
    if (!acc[semana]) {
      acc[semana] = {};
    }
    if (!acc[semana][nome]) {
      acc[semana][nome] = 0;
    }
    acc[semana][nome] += reg.numeroLigacoes;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const tabelaCalor = Object.entries(registrosPorSemana).map(([semana, vendedores]) => {
    const total = Object.values(vendedores).reduce((sum, val) => sum + val, 0);
    return {
      semana,
      vendedor: Object.keys(vendedores)[0] || 'N/A',
      valor: total,
      detalhes: vendedores
    };
  }).sort((a, b) => a.semana.localeCompare(b.semana));

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Executivo</h1>
        <p className="mt-2 text-gray-300">Visão geral de performance e indicadores — dados sincronizados com a planilha ao carregar/atualizar a página</p>
      </div>

      {/* Filtros */}
      <div className="card-white p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Vendedor</label>
            <select
              value={filterVendedor}
              onChange={(e) => setFilterVendedor(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Dia da Semana</label>
            <select
              value={filterDiaSemana}
              onChange={(e) => setFilterDiaSemana(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {diasSemana.map((dia) => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data Início</label>
            <input
              type="date"
              value={filterDataInicio}
              onChange={(e) => setFilterDataInicio(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
            <input
              type="date"
              value={filterDataFim}
              onChange={(e) => setFilterDataFim(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setFilterVendedor('');
                setFilterDiaSemana('');
                setFilterDataInicio('');
                setFilterDataFim('');
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-500 rounded-md text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* KPIs dos Registros Diários (respeitando filtros) */}
      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Métricas de Performance (funil de conversão)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{totalLigacoes.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Ligações</p>
            <p className="text-xs text-gray-400 mt-1">Conv Atendidas: {convAtendidas}% (ligações atendidas)</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{totalAtendidas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Atendidas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Aberturas: {convAberturas}% (atendidas → aberturas)</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{totalAberturas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Aberturas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Formulários: {convFormularios}% (aberturas → formulários)</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">{totalFormularios.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Formulários</p>
            <p className="text-xs text-gray-400 mt-1">Conv Onlines: {convOnlines}% (formulários → onlines)</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              <span className="text-2xl font-bold text-white">{totalOnlines.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Onlines</p>
            <p className="text-xs text-gray-400 mt-1">Conv Calls Agend.: {convCallsAgendadas}% (onlines → agendadas)</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 text-indigo-400" />
              <span className="text-2xl font-bold text-white">{totalCallsAgendadas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Calls Agendadas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Realizadas: {convCallsRealizadas}% (agendadas → realizadas)</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="h-5 w-5 text-teal-400" />
              <span className="text-2xl font-bold text-white">{totalCallsRealizadas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Calls Realizadas</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-pink-400" />
              <span className="text-2xl font-bold text-white">{colaboradores.length}</span>
            </div>
            <p className="text-sm text-gray-300">Vendedores</p>
          </div>
        </div>
      </div>

      {/* Gráficos de Performance - Complexos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de linha temporal com múltiplas séries por vendedor */}
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Valor da Métrica Total por Vendedor</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={(() => {
              const datas = Array.from(new Set(registrosFiltrados.map(r => r.data))).sort();
              return datas.map(data => {
                const item: any = { data };
                topVendedores.forEach(({ col }) => {
                  const regs = registrosFiltrados.filter(r => r.colaboradorId === col.id && r.data === data);
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
              {topVendedores.map(({ col }, index) => {
                const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                return (
                  <Line 
                    key={col.id}
                    type="monotone" 
                    dataKey={col.name.split(' ').slice(0, 2).join(' ')} 
                    stroke={cores[index % cores.length]} 
                    strokeWidth={2}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras empilhadas por dia da semana */}
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Valor da Métrica por Dia por Vendedor</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartDataPorDiaSemana}>
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
              <Legend wrapperStyle={{ color: '#fff' }} />
              {topVendedores.map(({ col }, index) => {
                const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                return (
                  <Bar 
                    key={col.id}
                    dataKey={col.name.split(' ').slice(0, 2).join(' ')} 
                    stackId="a"
                    fill={cores[index % cores.length]} 
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de rosca - Distribuição de ligações por vendedor */}
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Call Realizadas por Vendedor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribLigacoesPorVendedor}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {distribLigacoesPorVendedor.map((entry, index) => {
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
          <h2 className="text-lg font-semibold text-white mb-4">Evolução de Ligações ao Longo do Tempo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartDataTemporal}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Calor Semanal */}
      <div className="card-white">
        <div className="card-white-header">
          <h2 className="text-lg font-semibold text-white">Tabela de Calor da Métrica por Semana</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data (Semana)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Valor da Métrica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/30">
              {tabelaCalor.slice(0, 20).map((item, index) => {
                const maxValor = Math.max(...tabelaCalor.map(t => t.valor));
                const intensidade = item.valor / maxValor;
                const bgColor = `rgba(59, 130, 246, ${0.3 + intensidade * 0.7})`;
                return (
                  <tr key={index} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">{item.vendedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{item.semana}</td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-right text-white font-semibold"
                      style={{ backgroundColor: bgColor }}
                    >
                      {item.valor}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

