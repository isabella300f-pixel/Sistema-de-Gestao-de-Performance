'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Colaborador, Avaliacao11, IndicadoresColaborador, RegistroDiario } from '@/types';
import { getAllColaboradores, getAllAvaliacoes11, getAllRegistrosDiarios, initializeRegistrosDiarios, getColaboradorIdByName, setRegistrosDiariosFromSheet } from '@/lib/data';
import { mapSheetRowsToRegistros } from '@/lib/sheet';
import { calculateScore } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Award, XCircle, Phone, PhoneCall, FileText, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area, AreaChart } from 'recharts';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GestaoDashboardPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao11[]>([]);
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
  const [loading, setLoading] = useState(true);
  // Filtro padrão: mês atual ao abrir o relatório
  const [filterVendedor, setFilterVendedor] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [filterDataFim, setFilterDataFim] = useState<string>(() => {
    const n = new Date();
    const ultimoDia = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  });
  const [filterDiaSemana, setFilterDiaSemana] = useState<string>('');
  // Valor da métrica a avaliar nos gráficos (ligações, atendidas, aberturas, etc.)
  const METRICAS_OPCOES: { value: keyof RegistroDiario; label: string }[] = [
    { value: 'numeroLigacoes', label: 'Ligações' },
    { value: 'ligacoesAtendidas', label: 'Atendidas' },
    { value: 'numeroAberturas', label: 'Aberturas' },
    { value: 'numeroFormularios', label: 'Formulários' },
    { value: 'numeroOnlines', label: 'Onlines' },
    { value: 'callsAgendadas', label: 'Calls Agendadas' },
    { value: 'callsRealizadas', label: 'Calls Realizadas' },
  ];
  const [filterValorMetrica, setFilterValorMetrica] = useState<keyof RegistroDiario>('numeroLigacoes');
  const getValorMetrica = (r: RegistroDiario): number => {
    const v = r[filterValorMetrica];
    if (typeof v === 'number') return v;
    return 0;
  };
  const labelMetricaSelecionada = METRICAS_OPCOES.find(m => m.value === filterValorMetrica)?.label ?? 'Ligações';
  // Gráfico comparativo de semanas: vendedor + semanas a comparar (segunda a domingo)
  const [chartComparativoVendedor, setChartComparativoVendedor] = useState<string>('');
  const [chartComparativoSemanas, setChartComparativoSemanas] = useState<string[]>([]);
  const [semanasDropdownAberto, setSemanasDropdownAberto] = useState(false);
  const [dropdownValorMetricaAberto, setDropdownValorMetricaAberto] = useState(false);
  const [dropdownVendedorAberto, setDropdownVendedorAberto] = useState(false);
  const [dropdownDiaSemanaAberto, setDropdownDiaSemanaAberto] = useState(false);
  const [dropdownComparativoVendedorAberto, setDropdownComparativoVendedorAberto] = useState(false);
  const semanasDropdownRef = useRef<HTMLDivElement>(null);
  const valorMetricaRef = useRef<HTMLDivElement>(null);
  const vendedorRef = useRef<HTMLDivElement>(null);
  const diaSemanaRef = useRef<HTMLDivElement>(null);
  const comparativoVendedorRef = useRef<HTMLDivElement>(null);
  const [dataInicioPickerAberto, setDataInicioPickerAberto] = useState(false);
  const [dataFimPickerAberto, setDataFimPickerAberto] = useState(false);
  const [dataInicioViewMonth, setDataInicioViewMonth] = useState<string>(() => {
    const n = new Date();
    return format(n, 'yyyy-MM');
  });
  const [dataFimViewMonth, setDataFimViewMonth] = useState<string>(() => {
    const n = new Date();
    return format(n, 'yyyy-MM');
  });
  const dataInicioRef = useRef<HTMLDivElement>(null);
  const dataFimRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (semanasDropdownRef.current && !semanasDropdownRef.current.contains(target)) setSemanasDropdownAberto(false);
      if (valorMetricaRef.current && !valorMetricaRef.current.contains(target)) setDropdownValorMetricaAberto(false);
      if (vendedorRef.current && !vendedorRef.current.contains(target)) setDropdownVendedorAberto(false);
      if (diaSemanaRef.current && !diaSemanaRef.current.contains(target)) setDropdownDiaSemanaAberto(false);
      if (comparativoVendedorRef.current && !comparativoVendedorRef.current.contains(target)) setDropdownComparativoVendedorAberto(false);
      if (dataInicioRef.current && !dataInicioRef.current.contains(target)) setDataInicioPickerAberto(false);
      if (dataFimRef.current && !dataFimRef.current.contains(target)) setDataFimPickerAberto(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const formatarDataExibicao = (valor: string) => {
    if (!valor) return 'Selecione a data';
    const [y, m, d] = valor.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  };
  // Usar data local (evita bug de timezone: new Date('2025-12-01') vira 30/11 em UTC-3)
  const parseAnoMesLocal = (anoMes: string): Date => {
    const [y, m] = anoMes.split('-').map(Number);
    return new Date(y, m - 1, 1);
  };
  const gerarDiasCalendario = (anoMes: string) => {
    const mes = parseAnoMesLocal(anoMes);
    const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 0 });
    const fim = endOfWeek(endOfMonth(mes), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicio, end: fim });
  };
  // Datas disponíveis na planilha (registros diários) para restringir o calendário
  const datasPlanilha = (() => {
    if (!registrosDiarios.length) return { min: '', max: '' };
    const list = registrosDiarios.map(r => r.data);
    return { min: list.reduce((a, b) => (a <= b ? a : b), list[0]), max: list.reduce((a, b) => (a >= b ? a : b), list[0]) };
  })();
  const classeDropdownBtn = 'w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between';
  const classeDropdownPanel = 'absolute z-10 mt-1 w-full rounded-md border border-blue-500/50 bg-gray-800 shadow-lg max-h-56 overflow-auto';
  const classeDropdownItem = 'flex items-center gap-2 px-4 py-2.5 hover:bg-gray-700 cursor-pointer text-sm text-white border-b border-gray-700/50 last:border-0';

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
  const colaboradoresOrdenados = [...colaboradores].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

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

  // Preparar dados para gráfico de linha por vendedor (usando métrica selecionada)
  const registrosPorVendedor = colaboradores.map(col => {
    const regsColab = registrosFiltrados.filter(r => r.colaboradorId === col.id);
    const totalPorVendedor = regsColab.reduce((sum, r) => sum + getValorMetrica(r), 0);
    return {
      vendedor: col.name,
      total: totalPorVendedor,
    };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  // Preparar dados para gráfico de linha temporal (métrica selecionada)
  const registrosPorData = registrosFiltrados.reduce((acc, reg) => {
    const data = reg.data;
    if (!acc[data]) {
      acc[data] = { data, total: 0 };
    }
    acc[data].total += getValorMetrica(reg);
    return acc;
  }, {} as Record<string, { data: string; total: number }>);

  const chartDataTemporal = Object.values(registrosPorData)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-90);

  // Preparar dados para gráfico de linha por vendedor (múltiplas séries, métrica selecionada)
  const topVendedores = colaboradores.map(col => {
    const regsColab = registrosFiltrados.filter(r => r.colaboradorId === col.id);
    const total = regsColab.reduce((sum, r) => sum + getValorMetrica(r), 0);
    return { col, total, regs: regsColab };
  }).sort((a, b) => b.total - a.total).slice(0, 4);

  // Preparar dados para gráfico de barras empilhadas por dia da semana (métrica selecionada)
  const chartDataPorDiaSemana = diasSemana.map(dia => {
    const item: any = { dia };
    topVendedores.forEach(({ col }) => {
      const regs = registrosFiltrados.filter(r => r.colaboradorId === col.id && r.diaSemana === dia);
      const total = regs.reduce((sum, r) => sum + getValorMetrica(r), 0);
      item[col.name.split(' ').slice(0, 2).join(' ')] = total;
    });
    return item;
  }).filter(d => Object.values(d).some((v: any) => typeof v === 'number' && v > 0));

  // Preparar dados para gráfico de rosca (métrica selecionada por vendedor)
  const distribLigacoesPorVendedor = colaboradores.map(col => {
    const regsColab = registrosFiltrados.filter(r => r.colaboradorId === col.id);
    const total = regsColab.reduce((sum, r) => sum + getValorMetrica(r), 0);
    return {
      name: col.name.split(' ').slice(0, 2).join(' '),
      value: total
    };
  }).filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 8);

  // Semanas no formato segunda a domingo (Monday = início da semana)
  const getMonday = (d: Date): string => {
    const date = new Date(d);
    const day = date.getDay(); // 0=dom, 1=seg, ...
    const diff = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() - diff);
    return date.toISOString().slice(0, 10);
  };
  const formatDDMM = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
  };
  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const diasSemanaChart = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const semanasUnicas = Array.from(
    new Set(registrosFiltrados.map(r => getMonday(new Date(r.data))))
  ).sort();
  const semanasComLabels: { key: string; label: string }[] = semanasUnicas.map((key, i) => {
    const seg = key;
    const dom = addDays(key, 6);
    return { key, label: `Semana ${i + 1} (${formatDDMM(seg)} - ${formatDDMM(dom)})` };
  });

  // Dados do gráfico de linha: comparar semanas por vendedor (métrica selecionada por dia da semana)
  const chartDataComparativo = (() => {
    if (!chartComparativoVendedor || chartComparativoSemanas.length === 0) return [];
    return diasSemanaChart.map((dia, idx) => {
      const point: Record<string, string | number> = { dia };
      chartComparativoSemanas.forEach((weekKey) => {
        const weekLabel = semanasComLabels.find(s => s.key === weekKey)?.label ?? weekKey;
        const dateStr = addDays(weekKey, idx);
        const total = registrosFiltrados
          .filter(r => r.colaboradorId === chartComparativoVendedor && r.data === dateStr)
          .reduce((s, r) => s + getValorMetrica(r), 0);
        point[weekLabel] = total;
      });
      return point;
    });
  })();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative" ref={valorMetricaRef}>
            <label className="block text-xs text-gray-400 mb-1">Valor da métrica</label>
            <button
              type="button"
              onClick={() => setDropdownValorMetricaAberto(!dropdownValorMetricaAberto)}
              className={classeDropdownBtn}
            >
              <span>{labelMetricaSelecionada}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownValorMetricaAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownValorMetricaAberto && (
              <div className={classeDropdownPanel}>
                {METRICAS_OPCOES.map((m) => (
                  <div
                    key={m.value}
                    onClick={() => { setFilterValorMetrica(m.value); setDropdownValorMetricaAberto(false); }}
                    className={`${classeDropdownItem} ${filterValorMetrica === m.value ? 'bg-blue-500/20 text-blue-200' : ''}`}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={vendedorRef}>
            <label className="block text-xs text-gray-400 mb-1">Vendedor</label>
            <button
              type="button"
              onClick={() => setDropdownVendedorAberto(!dropdownVendedorAberto)}
              className={classeDropdownBtn}
            >
              <span className="truncate">
                {filterVendedor ? colaboradoresOrdenados.find(c => c.id === filterVendedor)?.name ?? 'Todos' : 'Todos'}
              </span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownVendedorAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownVendedorAberto && (
              <div className={classeDropdownPanel}>
                <div
                  onClick={() => { setFilterVendedor(''); setDropdownVendedorAberto(false); }}
                  className={`${classeDropdownItem} ${!filterVendedor ? 'bg-blue-500/20 text-blue-200' : ''}`}
                >
                  Todos
                </div>
                {colaboradoresOrdenados.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { setFilterVendedor(c.id); setDropdownVendedorAberto(false); }}
                    className={`${classeDropdownItem} ${filterVendedor === c.id ? 'bg-blue-500/20 text-blue-200' : ''}`}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={diaSemanaRef}>
            <label className="block text-xs text-gray-400 mb-1">Dia da Semana</label>
            <button
              type="button"
              onClick={() => setDropdownDiaSemanaAberto(!dropdownDiaSemanaAberto)}
              className={classeDropdownBtn}
            >
              <span>{filterDiaSemana || 'Todos'}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownDiaSemanaAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownDiaSemanaAberto && (
              <div className={classeDropdownPanel}>
                <div
                  onClick={() => { setFilterDiaSemana(''); setDropdownDiaSemanaAberto(false); }}
                  className={`${classeDropdownItem} ${!filterDiaSemana ? 'bg-blue-500/20 text-blue-200' : ''}`}
                >
                  Todos
                </div>
                {diasSemana.map((dia) => (
                  <div
                    key={dia}
                    onClick={() => { setFilterDiaSemana(dia); setDropdownDiaSemanaAberto(false); }}
                    className={`${classeDropdownItem} ${filterDiaSemana === dia ? 'bg-blue-500/20 text-blue-200' : ''}`}
                  >
                    {dia}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={dataInicioRef}>
            <label className="block text-xs text-gray-400 mb-1">Data Início</label>
            <button
              type="button"
              onClick={() => { setDataInicioPickerAberto(!dataInicioPickerAberto); if (!filterDataInicio) setDataInicioViewMonth(format(new Date(), 'yyyy-MM')); else setDataInicioViewMonth(filterDataInicio.slice(0, 7)); }}
              className={classeDropdownBtn}
            >
              <span>{formatarDataExibicao(filterDataInicio)}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dataInicioPickerAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dataInicioPickerAberto && (
              <div className={`${classeDropdownPanel} p-3 min-w-[280px]`}>
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setDataInicioViewMonth(format(subMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM'))}
                    className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={datasPlanilha.min && format(subMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM') < datasPlanilha.min.slice(0, 7)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium text-white capitalize">
                    {format(parseAnoMesLocal(dataInicioViewMonth), 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDataInicioViewMonth(format(addMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM'))}
                    className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={datasPlanilha.max && format(addMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM') > datasPlanilha.max.slice(0, 7)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-2 text-center text-xs text-gray-400">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {gerarDiasCalendario(dataInicioViewMonth).map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const selecionado = filterDataInicio === dayStr;
                    const mesAtual = isSameMonth(day, parseAnoMesLocal(dataInicioViewMonth));
                    const hoje = isToday(day);
                    const foraDoRange = (datasPlanilha.min && dayStr < datasPlanilha.min) || (datasPlanilha.max && dayStr > datasPlanilha.max);
                    return (
                      <button
                        key={dayStr}
                        type="button"
                        disabled={foraDoRange}
                        onClick={() => { if (!foraDoRange) { setFilterDataInicio(dayStr); setDataInicioPickerAberto(false); } }}
                        className={`w-8 h-8 rounded text-sm ${!mesAtual ? 'text-gray-500' : 'text-white'} ${foraDoRange ? 'opacity-40 cursor-not-allowed' : ''} ${selecionado ? 'bg-blue-500 text-white' : !foraDoRange && hoje ? 'border border-blue-400 text-blue-200' : !foraDoRange ? 'hover:bg-gray-700' : ''}`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-700">
                  <button type="button" onClick={() => { setFilterDataInicio(''); setDataInicioPickerAberto(false); }} className="text-sm text-blue-400 hover:text-blue-300">Limpar</button>
                  <button
                    type="button"
                    onClick={() => {
                      const h = format(new Date(), 'yyyy-MM-dd');
                      const permitido = (!datasPlanilha.min || h >= datasPlanilha.min) && (!datasPlanilha.max || h <= datasPlanilha.max);
                      if (permitido) { setFilterDataInicio(h); setDataInicioViewMonth(h.slice(0, 7)); setDataInicioPickerAberto(false); }
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={datasPlanilha.min && format(new Date(), 'yyyy-MM-dd') < datasPlanilha.min || (datasPlanilha.max && format(new Date(), 'yyyy-MM-dd') > datasPlanilha.max)}
                  >
                    Hoje
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={dataFimRef}>
            <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
            <button
              type="button"
              onClick={() => { setDataFimPickerAberto(!dataFimPickerAberto); if (!filterDataFim) setDataFimViewMonth(format(new Date(), 'yyyy-MM')); else setDataFimViewMonth(filterDataFim.slice(0, 7)); }}
              className={classeDropdownBtn}
            >
              <span>{formatarDataExibicao(filterDataFim)}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dataFimPickerAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dataFimPickerAberto && (
              <div className={`${classeDropdownPanel} p-3 min-w-[280px]`}>
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setDataFimViewMonth(format(subMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM'))}
                    className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={datasPlanilha.min && format(subMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM') < datasPlanilha.min.slice(0, 7)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium text-white capitalize">
                    {format(parseAnoMesLocal(dataFimViewMonth), 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDataFimViewMonth(format(addMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM'))}
                    className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={datasPlanilha.max && format(addMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM') > datasPlanilha.max.slice(0, 7)}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-2 text-center text-xs text-gray-400">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {gerarDiasCalendario(dataFimViewMonth).map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const selecionado = filterDataFim === dayStr;
                    const mesAtual = isSameMonth(day, parseAnoMesLocal(dataFimViewMonth));
                    const hoje = isToday(day);
                    const foraDoRange = (datasPlanilha.min && dayStr < datasPlanilha.min) || (datasPlanilha.max && dayStr > datasPlanilha.max);
                    return (
                      <button
                        key={dayStr}
                        type="button"
                        disabled={foraDoRange}
                        onClick={() => { if (!foraDoRange) { setFilterDataFim(dayStr); setDataFimPickerAberto(false); } }}
                        className={`w-8 h-8 rounded text-sm ${!mesAtual ? 'text-gray-500' : 'text-white'} ${foraDoRange ? 'opacity-40 cursor-not-allowed' : ''} ${selecionado ? 'bg-blue-500 text-white' : !foraDoRange && hoje ? 'border border-blue-400 text-blue-200' : !foraDoRange ? 'hover:bg-gray-700' : ''}`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-700">
                  <button type="button" onClick={() => { setFilterDataFim(''); setDataFimPickerAberto(false); }} className="text-sm text-blue-400 hover:text-blue-300">Limpar</button>
                  <button
                    type="button"
                    onClick={() => {
                      const h = format(new Date(), 'yyyy-MM-dd');
                      const permitido = (!datasPlanilha.min || h >= datasPlanilha.min) && (!datasPlanilha.max || h <= datasPlanilha.max);
                      if (permitido) { setFilterDataFim(h); setDataFimViewMonth(h.slice(0, 7)); setDataFimPickerAberto(false); }
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={datasPlanilha.min && format(new Date(), 'yyyy-MM-dd') < datasPlanilha.min || (datasPlanilha.max && format(new Date(), 'yyyy-MM-dd') > datasPlanilha.max)}
                  >
                    Hoje
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setFilterValorMetrica('numeroLigacoes');
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
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{totalAtendidas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Atendidas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Atendidas: {convAtendidas}%</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{totalAberturas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Aberturas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Aberturas: {convAberturas}%</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">{totalFormularios.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Formulários</p>
            <p className="text-xs text-gray-400 mt-1">Conv Formulários: {convFormularios}%</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              <span className="text-2xl font-bold text-white">{totalOnlines.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Onlines</p>
            <p className="text-xs text-gray-400 mt-1">Conv Onlines: {convOnlines}%</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <Phone className="h-5 w-5 text-indigo-400" />
              <span className="text-2xl font-bold text-white">{totalCallsAgendadas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Calls Agendadas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Calls Agend.: {convCallsAgendadas}%</p>
          </div>
          <div className="card-white p-4 border border-blue-500/50">
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="h-5 w-5 text-teal-400" />
              <span className="text-2xl font-bold text-white">{totalCallsRealizadas.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm text-gray-300">Calls Realizadas</p>
            <p className="text-xs text-gray-400 mt-1">Conv Realizadas: {convCallsRealizadas}%</p>
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
          <h2 className="text-lg font-semibold text-white mb-4">Valor da Métrica ({labelMetricaSelecionada}) Total por Vendedor</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={(() => {
              const datas = Array.from(new Set(registrosFiltrados.map(r => r.data))).sort();
              return datas.map(data => {
                const item: any = { data };
                topVendedores.forEach(({ col }) => {
                  const regs = registrosFiltrados.filter(r => r.colaboradorId === col.id && r.data === data);
                  const total = regs.reduce((sum, r) => sum + getValorMetrica(r), 0);
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
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const sorted = [...payload].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
                  return (
                    <div className="px-3 py-2 rounded border border-blue-500/50 bg-gray-900">
                      <p className="font-medium text-white mb-2">{label}</p>
                      <ul className="space-y-1">
                        {sorted.map((entry, i) => (
                          <li key={i} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toLocaleString('pt-BR')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }}
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
          <h2 className="text-lg font-semibold text-white mb-4">Valor da Métrica ({labelMetricaSelecionada}) por Dia por Vendedor</h2>
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
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const sorted = [...payload].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
                  return (
                    <div className="px-3 py-2 rounded border border-blue-500/50 bg-gray-900">
                      <p className="font-medium text-white mb-2">{label}</p>
                      <ul className="space-y-1">
                        {sorted.map((entry, i) => (
                          <li key={i} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toLocaleString('pt-BR')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }}
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
          <h2 className="text-lg font-semibold text-white mb-4">{labelMetricaSelecionada} por Vendedor</h2>
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
          <h2 className="text-lg font-semibold text-white mb-4">Evolução de {labelMetricaSelecionada} ao Longo do Tempo</h2>
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

      {/* Gráfico comparativo de semanas por vendedor (segunda a domingo) */}
      <div className="card-white p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Comparativo de semanas por vendedor</h2>
        <p className="text-sm text-gray-400 mb-4">Compare a métrica ({labelMetricaSelecionada}) do vendedor entre semanas. Cada semana é de segunda a domingo.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative" ref={comparativoVendedorRef}>
            <label className="block text-xs text-gray-400 mb-1">Vendedor</label>
            <button
              type="button"
              onClick={() => setDropdownComparativoVendedorAberto(!dropdownComparativoVendedorAberto)}
              className={classeDropdownBtn}
            >
              <span className="truncate">
                {chartComparativoVendedor ? colaboradoresOrdenados.find(c => c.id === chartComparativoVendedor)?.name ?? 'Selecione o vendedor' : 'Selecione o vendedor'}
              </span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownComparativoVendedorAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownComparativoVendedorAberto && (
              <div className={classeDropdownPanel}>
                <div
                  onClick={() => { setChartComparativoVendedor(''); setDropdownComparativoVendedorAberto(false); }}
                  className={`${classeDropdownItem} ${!chartComparativoVendedor ? 'bg-blue-500/20 text-blue-200' : ''}`}
                >
                  Selecione o vendedor
                </div>
                {colaboradoresOrdenados.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { setChartComparativoVendedor(c.id); setDropdownComparativoVendedorAberto(false); }}
                    className={`${classeDropdownItem} ${chartComparativoVendedor === c.id ? 'bg-blue-500/20 text-blue-200' : ''}`}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={semanasDropdownRef}>
            <label className="block text-xs text-gray-400 mb-1">Semanas a comparar (segunda a domingo)</label>
            <button
              type="button"
              onClick={() => setSemanasDropdownAberto(!semanasDropdownAberto)}
              className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
              <span className="truncate">
                {chartComparativoSemanas.length === 0
                  ? 'Selecione uma ou mais semanas'
                  : chartComparativoSemanas.length === 1
                    ? semanasComLabels.find(s => s.key === chartComparativoSemanas[0])?.label ?? '1 semana'
                    : `${chartComparativoSemanas.length} semanas selecionadas`}
              </span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${semanasDropdownAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {semanasDropdownAberto && (
              <div className={classeDropdownPanel}>
                {semanasComLabels.map((s) => (
                  <label
                    key={s.key}
                    className={`${classeDropdownItem} ${chartComparativoSemanas.includes(s.key) ? 'bg-blue-500/10' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={chartComparativoSemanas.includes(s.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setChartComparativoSemanas(prev => [...prev, s.key].sort());
                        } else {
                          setChartComparativoSemanas(prev => prev.filter(k => k !== s.key));
                        }
                      }}
                      className="rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                    />
                    {s.label}
                  </label>
                ))}
                {semanasComLabels.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">Nenhuma semana nos dados filtrados</div>
                )}
              </div>
            )}
          </div>
        </div>
        {chartComparativoVendedor && chartComparativoSemanas.length > 0 && chartDataComparativo.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartDataComparativo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
              <XAxis dataKey="dia" tick={{ fill: '#fff', fontSize: 12 }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const sorted = [...payload].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
                  return (
                    <div className="px-3 py-2 rounded border border-blue-500/50 bg-gray-900">
                      <p className="font-medium text-white mb-2">{label}</p>
                      <ul className="space-y-1">
                        {sorted.map((entry, i) => (
                          <li key={i} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toLocaleString('pt-BR')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
              {chartComparativoSemanas.map((weekKey, index) => {
                const label = semanasComLabels.find(s => s.key === weekKey)?.label ?? weekKey;
                const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                return (
                  <Line
                    key={weekKey}
                    type="monotone"
                    dataKey={label}
                    stroke={cores[index % cores.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
        {(!chartComparativoVendedor || chartComparativoSemanas.length === 0) && (
          <div className="py-12 text-center text-gray-400">
            Selecione um vendedor e pelo menos uma semana para exibir o gráfico.
          </div>
        )}
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

