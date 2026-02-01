'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RegistroDiario, Colaborador } from '@/types';
import { getAllColaboradores, getAllRegistrosDiarios, initializeRegistrosDiarios, pesquisarRegistrosDiarios, getColaboradorIdByName, setRegistrosDiariosFromSheet } from '@/lib/data';
import { mapSheetRowsToRegistros } from '@/lib/sheet';
import { formatDate } from '@/lib/utils';
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegistrosDiariosPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesquisaExecutada, setPesquisaExecutada] = useState(false);
  const [resultadoPesquisa, setResultadoPesquisa] = useState<RegistroDiario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Filtro padrão: mês atual ao abrir — dados já carregados na abertura
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [refreshing, setRefreshing] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [dropdownVendedorAberto, setDropdownVendedorAberto] = useState(false);
  const [dropdownDiaSemanaAberto, setDropdownDiaSemanaAberto] = useState(false);
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
  const vendedorRef = useRef<HTMLDivElement>(null);
  const diaSemanaRef = useRef<HTMLDivElement>(null);
  const dataInicioRef = useRef<HTMLDivElement>(null);
  const dataFimRef = useRef<HTMLDivElement>(null);

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

        setColaboradores(getAllColaboradores());

        // Sincronizar com a planilha publicada
        let dadosCarregados = false;
        try {
          const bust = Date.now();
          const res = await fetch(`/api/sheet/registros-diarios?_=${bust}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            const registros = mapSheetRowsToRegistros(json.data, getColaboradorIdByName);
            if (registros.length > 0) {
              setRegistrosDiariosFromSheet(registros);
              dadosCarregados = true;
            }
          }
        } catch (_) {}
        if (!dadosCarregados) initializeRegistrosDiarios();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        initializeRegistrosDiarios();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const carregarDadosPlanilha = async () => {
    try {
      const bust = Date.now();
      const res = await fetch(`/api/sheet/registros-diarios?_=${bust}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
      const json = await res.json();
      if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
        const registros = mapSheetRowsToRegistros(json.data, getColaboradorIdByName);
        if (registros.length > 0) {
          setRegistrosDiariosFromSheet(registros);
          return true;
        }
      }
    } catch (_) {}
    initializeRegistrosDiarios();
    return false;
  };

  const handleAtualizarDados = async () => {
    setRefreshing(true);
    await carregarDadosPlanilha();
    executarPesquisa();
    setRefreshing(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (vendedorRef.current && !vendedorRef.current.contains(target)) setDropdownVendedorAberto(false);
      if (diaSemanaRef.current && !diaSemanaRef.current.contains(target)) setDropdownDiaSemanaAberto(false);
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
  const registrosParaDatas = getAllRegistrosDiarios();
  const datasPlanilha = (() => {
    if (!registrosParaDatas.length) return { min: '', max: '' };
    const list = registrosParaDatas.map(r => r.data);
    return { min: list.reduce((a, b) => (a <= b ? a : b), list[0]), max: list.reduce((a, b) => (a >= b ? a : b), list[0]) };
  })();

  const classeDropdownBtn = 'w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between';
  const classeDropdownPanel = 'absolute z-10 mt-1 w-full rounded-md border border-blue-500/50 bg-gray-800 shadow-lg max-h-56 overflow-auto';
  const classeDatePickerPanel = 'absolute z-10 mt-1 rounded-md border border-blue-500/50 bg-gray-800 shadow-lg p-3 min-w-[280px]';
  const classeDropdownItem = 'flex items-center gap-2 px-4 py-2.5 hover:bg-gray-700 cursor-pointer text-sm text-white border-b border-gray-700/50 last:border-0';
  const colaboradoresOrdenados = [...colaboradores].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  // Ao terminar de carregar, executar pesquisa uma vez com filtros padrão (mês atual) para exibir dados
  const pesquisaInicialExecutada = useRef(false);
  useEffect(() => {
    if (loading || pesquisaInicialExecutada.current) return;
    pesquisaInicialExecutada.current = true;
    const resultado = pesquisarRegistrosDiarios({
      dataInicio: filterDataInicio || undefined,
      dataFim: filterDataFim || undefined,
    });
    setResultadoPesquisa(resultado);
    setPesquisaExecutada(true);
    setCurrentPage(1);
  }, [loading]);

  const getColaboradorName = (colaboradorId: string): string => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador?.name || colaboradorId;
  };

  const executarPesquisa = () => {
    const resultado = pesquisarRegistrosDiarios({
      colaboradorId: filterVendedor || undefined,
      dataInicio: filterDataInicio || undefined,
      dataFim: filterDataFim || undefined,
      diaSemana: filterDiaSemana || undefined,
      termoBusca: searchTerm.trim() || undefined,
    });
    setResultadoPesquisa(resultado);
    setPesquisaExecutada(true);
    setCurrentPage(1);
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !loading) {
        carregarDadosPlanilha().then(() => executarPesquisa());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [loading]);

  const COLUNAS_SORT: { key: string; label: string; align?: 'left' | 'right' }[] = [
    { key: 'data', label: 'Data', align: 'left' },
    { key: 'diaSemana', label: 'Dia da Semana', align: 'left' },
    { key: 'vendedor', label: 'Vendedor', align: 'left' },
    { key: 'numeroLigacoes', label: 'Ligações', align: 'right' },
    { key: 'ligacoesAtendidas', label: 'Atendidas', align: 'right' },
    { key: 'numeroAberturas', label: 'Aberturas', align: 'right' },
    { key: 'desqualificados', label: 'Desqualificados', align: 'right' },
    { key: 'numeroFormularios', label: 'Formulários', align: 'right' },
    { key: 'numeroOnlines', label: 'Onlines', align: 'right' },
    { key: 'callsAgendadas', label: 'Calls Agendadas', align: 'right' },
    { key: 'callsRealizadas', label: 'Calls Realizadas', align: 'right' },
    { key: 'testesVocacionais', label: 'Testes Voc.', align: 'right' },
    { key: 'diagnosticos', label: 'Diagnósticos', align: 'right' },
    { key: 'avaliacaoPerformance', label: 'Aval. Performance', align: 'left' },
    { key: 'sugestaoMelhoria', label: 'Sugestão Melhoria', align: 'left' },
    { key: 'metaProximoDia', label: 'Meta Próx. Dia', align: 'left' },
    { key: 'etapaFunilFoco', label: 'Etapa Funil Foco', align: 'left' },
  ];

  const getSortValue = (reg: RegistroDiario, key: string): string | number => {
    if (key === 'vendedor') return getColaboradorName(reg.colaboradorId).toLowerCase();
    if (key === 'desqualificados') return reg.desqualificados ? 1 : 0;
    const v = (reg as Record<string, unknown>)[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return v.toLowerCase();
    return '';
  };

  const resultadoOrdenado = [...resultadoPesquisa].sort((a, b) => {
    if (!sortColumn) return 0;
    const va = getSortValue(a, sortColumn);
    const vb = getSortValue(b, sortColumn);
    const cmp = typeof va === 'number' && typeof vb === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb), 'pt-BR');
    return sortAsc ? cmp : -cmp;
  });

  const totalPages = Math.ceil(resultadoOrdenado.length / itemsPerPage);
  const paginatedRegistros = resultadoOrdenado.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    if (sortColumn === key) setSortAsc(!sortAsc);
    else { setSortColumn(key); setSortAsc(true); }
    setCurrentPage(1);
  };

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  if (loading) {
    return <div className="text-center py-12 text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Registros Diários</h1>
          <p className="mt-2 text-gray-300">
            Dados sincronizados com a planilha. Defina os filtros e clique em Pesquisar. Clique no cabeçalho da coluna para ordenar.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAtualizarDados}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>

      {/* Filtros + Botão Pesquisar (layout igual ao Dashboard Executivo) */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <label className="block text-xs text-gray-400 mb-1">Buscar</label>
            <Search className="absolute left-3 top-8 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="vendedor, dia, números..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative" ref={vendedorRef}>
            <label className="block text-xs text-gray-400 mb-1">Vendedor</label>
            <button
              type="button"
              onClick={() => setDropdownVendedorAberto(!dropdownVendedorAberto)}
              className={classeDropdownBtn}
            >
              <span>{filterVendedor ? colaboradores.find(c => c.id === filterVendedor)?.name ?? 'Todos' : 'Todos os Vendedores'}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownVendedorAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownVendedorAberto && (
              <div className={classeDropdownPanel}>
                <div onClick={() => { setFilterVendedor(''); setDropdownVendedorAberto(false); }} className={`${classeDropdownItem} ${!filterVendedor ? 'bg-blue-500/20 text-blue-200' : ''}`}>Todos</div>
                {colaboradoresOrdenados.map((c) => (
                  <div key={c.id} onClick={() => { setFilterVendedor(c.id); setDropdownVendedorAberto(false); }} className={`${classeDropdownItem} ${filterVendedor === c.id ? 'bg-blue-500/20 text-blue-200' : ''}`}>{c.name}</div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={diaSemanaRef}>
            <label className="block text-xs text-gray-400 mb-1">Dia da Semana</label>
            <button type="button" onClick={() => setDropdownDiaSemanaAberto(!dropdownDiaSemanaAberto)} className={classeDropdownBtn}>
              <span>{filterDiaSemana || 'Todos'}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dropdownDiaSemanaAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownDiaSemanaAberto && (
              <div className={classeDropdownPanel}>
                <div onClick={() => { setFilterDiaSemana(''); setDropdownDiaSemanaAberto(false); }} className={`${classeDropdownItem} ${!filterDiaSemana ? 'bg-blue-500/20 text-blue-200' : ''}`}>Todos</div>
                {diasSemana.map((dia) => (
                  <div key={dia} onClick={() => { setFilterDiaSemana(dia); setDropdownDiaSemanaAberto(false); }} className={`${classeDropdownItem} ${filterDiaSemana === dia ? 'bg-blue-500/20 text-blue-200' : ''}`}>{dia}</div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={dataInicioRef}>
            <label className="block text-xs text-gray-400 mb-1">Data Início</label>
            <button
              type="button"
              onClick={() => { setDataInicioPickerAberto(!dataInicioPickerAberto); if (filterDataInicio) setDataInicioViewMonth(filterDataInicio.slice(0, 7)); }}
              className={classeDropdownBtn}
            >
              <span>{formatarDataExibicao(filterDataInicio)}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dataInicioPickerAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dataInicioPickerAberto && (
              <div className={classeDatePickerPanel}>
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => setDataInicioViewMonth(format(subMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM'))} className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(datasPlanilha.min && format(subMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM') < datasPlanilha.min.slice(0, 7))}><ChevronLeft size={20} /></button>
                  <span className="text-sm font-medium text-white capitalize">{format(parseAnoMesLocal(dataInicioViewMonth), 'MMMM yyyy', { locale: ptBR })}</span>
                  <button type="button" onClick={() => setDataInicioViewMonth(format(addMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM'))} className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(datasPlanilha.max && format(addMonths(parseAnoMesLocal(dataInicioViewMonth), 1), 'yyyy-MM') > datasPlanilha.max.slice(0, 7))}><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-2 text-center text-xs text-gray-400">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {gerarDiasCalendario(dataInicioViewMonth).map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const selecionado = filterDataInicio === dayStr;
                    const mesAtual = isSameMonth(day, parseAnoMesLocal(dataInicioViewMonth));
                    const hoje = isToday(day);
                    const foraDoRange = !!((datasPlanilha.min && dayStr < datasPlanilha.min) || (datasPlanilha.max && dayStr > datasPlanilha.max));
                    return (
                      <button key={dayStr} type="button" disabled={Boolean(foraDoRange)} onClick={() => { if (!foraDoRange) { setFilterDataInicio(dayStr); setDataInicioPickerAberto(false); } }} className={`w-8 h-8 rounded text-sm ${!mesAtual ? 'text-gray-500' : 'text-white'} ${foraDoRange ? 'opacity-40 cursor-not-allowed' : ''} ${selecionado ? 'bg-blue-500 text-white' : !foraDoRange && hoje ? 'border border-blue-400 text-blue-200' : !foraDoRange ? 'hover:bg-gray-700' : ''}`}>
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-700">
                  <button type="button" onClick={() => { setFilterDataInicio(''); setDataInicioPickerAberto(false); }} className="text-sm text-blue-400 hover:text-blue-300">Limpar</button>
                  <button type="button" onClick={() => { const h = format(new Date(), 'yyyy-MM-dd'); const permitido = (!datasPlanilha.min || h >= datasPlanilha.min) && (!datasPlanilha.max || h <= datasPlanilha.max); if (permitido) { setFilterDataInicio(h); setDataInicioViewMonth(h.slice(0, 7)); setDataInicioPickerAberto(false); } }} className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(datasPlanilha.min && format(new Date(), 'yyyy-MM-dd') < datasPlanilha.min || (datasPlanilha.max && format(new Date(), 'yyyy-MM-dd') > datasPlanilha.max))}>Hoje</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dataFimRef}>
            <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
            <button
              type="button"
              onClick={() => { setDataFimPickerAberto(!dataFimPickerAberto); if (filterDataFim) setDataFimViewMonth(filterDataFim.slice(0, 7)); }}
              className={classeDropdownBtn}
            >
              <span>{formatarDataExibicao(filterDataFim)}</span>
              <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${dataFimPickerAberto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dataFimPickerAberto && (
              <div className={classeDatePickerPanel}>
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => setDataFimViewMonth(format(subMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM'))} className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(datasPlanilha.min && format(subMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM') < datasPlanilha.min.slice(0, 7))}><ChevronLeft size={20} /></button>
                  <span className="text-sm font-medium text-white capitalize">{format(parseAnoMesLocal(dataFimViewMonth), 'MMMM yyyy', { locale: ptBR })}</span>
                  <button type="button" onClick={() => setDataFimViewMonth(format(addMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM'))} className="p-1 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(datasPlanilha.max && format(addMonths(parseAnoMesLocal(dataFimViewMonth), 1), 'yyyy-MM') > datasPlanilha.max.slice(0, 7))}><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-2 text-center text-xs text-gray-400">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className="py-1">{d}</span>)}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {gerarDiasCalendario(dataFimViewMonth).map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const selecionado = filterDataFim === dayStr;
                    const mesAtual = isSameMonth(day, parseAnoMesLocal(dataFimViewMonth));
                    const hoje = isToday(day);
                    const foraDoRange = !!((datasPlanilha.min && dayStr < datasPlanilha.min) || (datasPlanilha.max && dayStr > datasPlanilha.max));
                    return (
                      <button key={dayStr} type="button" disabled={Boolean(foraDoRange)} onClick={() => { if (!foraDoRange) { setFilterDataFim(dayStr); setDataFimPickerAberto(false); } }} className={`w-8 h-8 rounded text-sm ${!mesAtual ? 'text-gray-500' : 'text-white'} ${foraDoRange ? 'opacity-40 cursor-not-allowed' : ''} ${selecionado ? 'bg-blue-500 text-white' : !foraDoRange && hoje ? 'border border-blue-400 text-blue-200' : !foraDoRange ? 'hover:bg-gray-700' : ''}`}>
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-700">
                  <button type="button" onClick={() => { setFilterDataFim(''); setDataFimPickerAberto(false); }} className="text-sm text-blue-400 hover:text-blue-300">Limpar</button>
                  <button type="button" onClick={() => { const h = format(new Date(), 'yyyy-MM-dd'); const permitido = (!datasPlanilha.min || h >= datasPlanilha.min) && (!datasPlanilha.max || h <= datasPlanilha.max); if (permitido) { setFilterDataFim(h); setDataFimViewMonth(h.slice(0, 7)); setDataFimPickerAberto(false); } }} className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!(datasPlanilha.min && format(new Date(), 'yyyy-MM-dd') < datasPlanilha.min || (datasPlanilha.max && format(new Date(), 'yyyy-MM-dd') > datasPlanilha.max))}>Hoje</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end">
            <button onClick={executarPesquisa} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2">
              <Search size={18} />
              Pesquisar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela - só exibe resultado da pesquisa */}
      <div className="card-white">
        <div className="card-white-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {!pesquisaExecutada
              ? 'Defina os filtros e clique em Pesquisar para carregar os dados'
              : `Resultado da pesquisa: ${resultadoOrdenado.length} registro(s)`}
          </h2>
          {pesquisaExecutada && resultadoOrdenado.length > 0 && (
            <button
              onClick={() => {
                const csv = [
                  ['Data', 'Dia da Semana', 'Vendedor', 'Ligações', 'Atendidas', 'Aberturas', 'Desqualificados', 'Formulários', 'Onlines', 'Calls Agendadas', 'Calls Realizadas', 'Testes Vocacionais', 'Diagnósticos', 'Avaliação Performance', 'Sugestão Melhoria', 'Meta Próximo Dia', 'Etapa Funil Foco'].join(','),
                  ...resultadoOrdenado.map(reg => [
                    formatDate(reg.data),
                    reg.diaSemana,
                    getColaboradorName(reg.colaboradorId),
                    reg.numeroLigacoes,
                    reg.ligacoesAtendidas,
                    reg.numeroAberturas,
                    reg.desqualificados ? 'Sim' : 'Não',
                    reg.numeroFormularios,
                    reg.numeroOnlines,
                    reg.callsAgendadas ?? '',
                    reg.callsRealizadas ?? '',
                    reg.testesVocacionais ?? '',
                    reg.diagnosticos ?? '',
                    (reg.avaliacaoPerformance ?? '').replace(/"/g, '""'),
                    (reg.sugestaoMelhoria ?? '').replace(/"/g, '""'),
                    (reg.metaProximoDia ?? '').replace(/"/g, '""'),
                    (reg.etapaFunilFoco ?? '').replace(/"/g, '""'),
                  ].join(','))
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `registros-diarios-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Download size={18} />
              <span>Exportar CSV</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-500/30">
                {COLUNAS_SORT.map(({ key, label, align = 'left' }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {sortColumn === key ? (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={12} className="opacity-50" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/30">
              {!pesquisaExecutada ? (
                <tr>
                  <td colSpan={17} className="px-6 py-12 text-center text-gray-400">
                    Carregando dados...
                  </td>
                </tr>
              ) : paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={17} className="px-6 py-12 text-center text-gray-400">
                    Nenhum registro encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedRegistros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-white">{formatDate(reg.data)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{reg.diaSemana}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{getColaboradorName(reg.colaboradorId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.numeroLigacoes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.ligacoesAtendidas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.numeroAberturas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">
                      {reg.desqualificados ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.numeroFormularios}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.numeroOnlines}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.callsAgendadas ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.callsRealizadas ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.testesVocacionais ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white">{reg.diagnosticos ?? '-'}</td>
                    <td className="px-6 py-4 text-white max-w-[200px] truncate" title={reg.avaliacaoPerformance ?? ''}>{reg.avaliacaoPerformance ?? '-'}</td>
                    <td className="px-6 py-4 text-white max-w-[200px] truncate" title={reg.sugestaoMelhoria ?? ''}>{reg.sugestaoMelhoria ?? '-'}</td>
                    <td className="px-6 py-4 text-white max-w-[200px] truncate" title={reg.metaProximoDia ?? ''}>{reg.metaProximoDia ?? '-'}</td>
                    <td className="px-6 py-4 text-white max-w-[200px] truncate" title={reg.etapaFunilFoco ?? ''}>{reg.etapaFunilFoco ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pesquisaExecutada && totalPages > 1 && (
          <div className="card-white-header flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-300">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, resultadoOrdenado.length)} de {resultadoOrdenado.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-white">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
