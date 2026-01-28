'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistroDiario, Colaborador } from '@/types';
import { getAllRegistrosDiarios, getAllColaboradores, initializeRegistrosDiarios } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { Search, Filter, Download } from 'lucide-react';

export default function RegistrosDiariosPage() {
  const router = useRouter();
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendedor, setFilterVendedor] = useState<string>('');
  const [filterDataInicio, setFilterDataInicio] = useState<string>('');
  const [filterDataFim, setFilterDataFim] = useState<string>('');
  const [filterDiaSemana, setFilterDiaSemana] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (!['gestao', 'rh', 'gestor'].includes(currentUser.role)) {
        router.push('/');
        return;
      }

      // Inicializar dados se necessário
      initializeRegistrosDiarios();
      
      const regs = getAllRegistrosDiarios();
      const cols = getAllColaboradores();

      setRegistros(regs);
      setColaboradores(cols);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const getColaboradorName = (colaboradorId: string): string => {
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    return colaborador?.name || colaboradorId;
  };

  const filteredRegistros = registros.filter(reg => {
    const colaboradorNome = getColaboradorName(reg.colaboradorId).toUpperCase();
    const searchUpper = searchTerm.toUpperCase();
    
    const matchSearch = !searchTerm || 
      colaboradorNome.includes(searchUpper) ||
      reg.diaSemana.toUpperCase().includes(searchUpper) ||
      reg.numeroLigacoes.toString().includes(searchTerm) ||
      reg.ligacoesAtendidas.toString().includes(searchTerm);
    
    const matchVendedor = !filterVendedor || reg.colaboradorId === filterVendedor;
    
    const matchDataInicio = !filterDataInicio || new Date(reg.data) >= new Date(filterDataInicio);
    const matchDataFim = !filterDataFim || new Date(reg.data) <= new Date(filterDataFim);
    
    const matchDiaSemana = !filterDiaSemana || reg.diaSemana === filterDiaSemana;
    
    return matchSearch && matchVendedor && matchDataInicio && matchDataFim && matchDiaSemana;
  });

  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);
  const paginatedRegistros = filteredRegistros.slice(
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
        <p className="mt-2 text-gray-300">Tabela completa com todos os dados da planilha de resultados</p>
      </div>

      {/* Filtros */}
      <div className="card-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterVendedor}
            onChange={(e) => {
              setFilterVendedor(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setFilterDataInicio(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Data Início"
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={filterDataFim}
            onChange={(e) => {
              setFilterDataFim(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Data Fim"
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterDiaSemana}
            onChange={(e) => {
              setFilterDiaSemana(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Dias</option>
            {diasSemana.map(dia => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="card-white">
        <div className="card-white-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Total de Registros: {filteredRegistros.length}
          </h2>
          <button
            onClick={() => {
              // Exportar para CSV
              const csv = [
                ['Data', 'Dia da Semana', 'Vendedor', 'Ligações', 'Atendidas', 'Aberturas', 'Desqualificados', 'Formulários', 'Onlines'].join(','),
                ...filteredRegistros.map(reg => [
                  formatDate(reg.data),
                  reg.diaSemana,
                  getColaboradorName(reg.colaboradorId),
                  reg.numeroLigacoes,
                  reg.ligacoesAtendidas,
                  reg.numeroAberturas,
                  reg.desqualificados ? 'Sim' : 'Não',
                  reg.numeroFormularios,
                  reg.numeroOnlines,
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
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/30">
              {paginatedRegistros.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    Nenhum registro encontrado
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="card-white-header flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-300">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRegistros.length)} de {filteredRegistros.length}
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
