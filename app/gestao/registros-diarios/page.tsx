'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RegistroDiario, Colaborador } from '@/types';
import { getAllColaboradores, initializeRegistrosDiarios, pesquisarRegistrosDiarios, getColaboradorIdByName, setRegistrosDiariosFromSheet } from '@/lib/data';
import { mapSheetRowsToRegistros } from '@/lib/sheet';
import { formatDate } from '@/lib/utils';
import { Search, Download } from 'lucide-react';

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

        // Sincronizar com a planilha publicada (ao carregar/atualizar a página)
        try {
          const res = await fetch('/api/sheet/registros-diarios', { cache: 'no-store' });
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            const registros = mapSheetRowsToRegistros(json.data, getColaboradorIdByName);
            setRegistrosDiariosFromSheet(registros);
          } else {
            initializeRegistrosDiarios();
          }
        } catch (_) {
          initializeRegistrosDiarios();
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        initializeRegistrosDiarios();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

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

  const totalPages = Math.ceil(resultadoPesquisa.length / itemsPerPage);
  const paginatedRegistros = resultadoPesquisa.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  if (loading) {
    return <div className="text-center py-12 text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Registros Diários</h1>
        <p className="mt-2 text-gray-300">
          Dados sincronizados com a planilha ao carregar a página. Defina os filtros e clique em Pesquisar. Sem filtros = todos os períodos e vendedores.
        </p>
      </div>

      {/* Filtros + Botão Pesquisar */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
        <div className="card-white-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {!pesquisaExecutada
              ? 'Defina os filtros e clique em Pesquisar para carregar os dados'
              : `Resultado da pesquisa: ${resultadoPesquisa.length} registro(s)`}
          </h2>
          {pesquisaExecutada && resultadoPesquisa.length > 0 && (
            <button
              onClick={() => {
                const csv = [
                  ['Data', 'Dia da Semana', 'Vendedor', 'Ligações', 'Atendidas', 'Aberturas', 'Desqualificados', 'Formulários', 'Onlines', 'Calls Agendadas', 'Calls Realizadas', 'Testes Vocacionais', 'Diagnósticos', 'Avaliação Performance', 'Sugestão Melhoria', 'Meta Próximo Dia', 'Etapa Funil Foco'].join(','),
                  ...resultadoPesquisa.map(reg => [
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dia da Semana</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ligações</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Atendidas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aberturas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Desqualificados</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Formulários</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Onlines</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Calls Agendadas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Calls Realizadas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Testes Voc.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Diagnósticos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aval. Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sugestão Melhoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Meta Próx. Dia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Etapa Funil Foco</th>
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
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, resultadoPesquisa.length)} de {resultadoPesquisa.length}
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
