'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RegistroDiario, Colaborador } from '@/types';
import { getAllRegistrosDiarios, getColaboradoresByGestor, getUserById, pesquisarRegistrosDiarios, getColaboradorIdByName, setRegistrosDiariosFromSheet } from '@/lib/data';
import { mapSheetRowsToRegistros } from '@/lib/sheet';
import { formatDate } from '@/lib/utils';
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GestorRegistrosDiariosPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorIdsEquipe, setColaboradorIdsEquipe] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesquisaExecutada, setPesquisaExecutada] = useState(false);
  const [resultadoPesquisa, setResultadoPesquisa] = useState<RegistroDiario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendedor, setFilterVendedor] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [filterDataFim, setFilterDataFim] = useState<string>(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
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
  const [dataInicioViewMonth, setDataInicioViewMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));
  const [dataFimViewMonth, setDataFimViewMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'));
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
        if (currentUser.role !== 'gestor') {
          router.push('/');
          return;
        }

        const gestor = getUserById(currentUser.id);
        if (!gestor) {
          router.push('/');
          return;
        }

        const cols = getColaboradoresByGestor(gestor.id);
        setColaboradores(cols);
        setColaboradorIdsEquipe(cols.map(c => c.id));

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
        if (!dadosCarregados) setRegistrosDiariosFromSheet([]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setRegistrosDiariosFromSheet([]);
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
    setRegistrosDiariosFromSheet([]);
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

  const getColaboradorName = (colaboradorId: string): string => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador?.name || colaboradorId;
  };
  const getVendedorDisplayName = (reg: RegistroDiario): string =>
    reg.vendedorNome ?? getColaboradorName(reg.colaboradorId);

  const executarPesquisa = () => {
    const resultado = pesquisarRegistrosDiarios({
      colaboradorIds: colaboradorIdsEquipe,
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
    if (key === 'vendedor') return getVendedorDisplayName(reg).toLowerCase();
    if (key === 'desqualificados') return reg.desqualificados ? 1 : 0;
    const v = (reg as unknown as Record<string, unknown>)[key];
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Registros Diários</h1>
          <p className="mt-2 text-gray-300">
            Dados exatamente da planilha — atualização automática ao recarregar ou ao clicar em Atualizar dados.
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

      {/* Filtros + Botão Pesquisar */}
      <div className="card-white p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar (vendedor, dia, números)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterVendedor}
            onChange={(e) => setFilterVendedor(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Vendedores</option>
            {colaboradores.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDataInicio}
            onChange={(e) => setFilterDataInicio(e.target.value)}
            placeholder="Data Início"
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={filterDataFim}
            onChange={(e) => setFilterDataFim(e.target.value)}
            placeholder="Data Fim"
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterDiaSemana}
            onChange={(e) => setFilterDiaSemana(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Dias</option>
            {diasSemana.map(dia => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>

          <button
            onClick={executarPesquisa}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Search size={18} />
            Pesquisar
          </button>
        </div>
      </div>

      {/* Tabela - só exibe resultado da pesquisa */}
      <div className="card-white">
        <div className="card-white-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            {!pesquisaExecutada
              ? 'Defina os filtros e clique em Pesquisar para carregar os dados'
              : `Resultado da pesquisa: ${resultadoOrdenado.length} registro(s)`}
          </h2>
          {pesquisaExecutada && resultadoOrdenado.length > 0 && (
            <button
              onClick={() => {
                const csv = [
                  ['Data', 'Dia da Semana', 'Vendedor', 'Ligações', 'Atendidas', 'Aberturas', 'Desqualificados', 'Formulários', 'Onlines', 'Calls Agendadas', 'Calls Realizadas', 'Testes Voc.', 'Diagnósticos', 'Aval. Performance', 'Sugestão Melhoria', 'Meta Próx. Dia', 'Etapa Funil Foco'].join(','),
                  ...resultadoOrdenado.map(reg => [
                    formatDate(reg.data),
                    reg.diaSemana,
                    getVendedorDisplayName(reg),
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

        <div className="table-responsive-wrapper overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
                    Defina os filtros e clique em Pesquisar para carregar os dados da planilha.
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
                    <td className="px-6 py-4 whitespace-nowrap text-white">{getVendedorDisplayName(reg)}</td>
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
