'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SolicitacaoRH, TipoSolicitacao } from '@/types';
import { formatDate } from '@/lib/utils';
import { mapRowToSolicitacao } from '@/lib/solicitacoes-api';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

export default function ColaboradorSolicitacoesPage() {
  const router = useRouter();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRH[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.role !== 'colaborador') {
          router.push('/');
          return;
        }

        const res = await fetch('/api/solicitacoes', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data.map((r: Record<string, unknown>) => mapRowToSolicitacao(r)) : [];
          setSolicitacoes(list);
          setLoading(false);
          return;
        }
        // 401/503: sem sessão Supabase ou API indisponível → usar mock
        setSolicitacoes([
          {
            id: '1',
            colaboradorId: currentUser.id,
            protocolo: 'SOL-2024-001',
            tipo: 'indisponibilidade_temporaria',
            dataInicio: '2024-12-20',
            dataTermino: '2024-12-22',
            tipoPeriodo: 'integral',
            motivo: 'Compromisso médico',
            impactoAtividades: true,
            reposicao: 'alinhado',
            status: 'em_analise',
            dataCriacao: '2024-12-10',
            dataAtualizacao: '2024-12-10',
          },
        ]);
      } catch (error) {
        if (!cancelled) {
          const currentUser = JSON.parse(currentUserStr || '{}');
          setSolicitacoes([
            {
              id: '1',
              colaboradorId: currentUser.id || 'colab-1',
              protocolo: 'SOL-2024-001',
              tipo: 'indisponibilidade_temporaria',
              dataInicio: '2024-12-20',
              dataTermino: '2024-12-22',
              motivo: 'Compromisso médico',
              impactoAtividades: true,
              reposicao: 'alinhado',
              status: 'em_analise',
              dataCriacao: '2024-12-10',
              dataAtualizacao: '2024-12-10',
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const getTipoLabel = (tipo: TipoSolicitacao): string => {
    const labels: Record<TipoSolicitacao, string> = {
      atualizacao_cadastral: 'Atualização Cadastral',
      declaracao_prestacao_servico: 'Declaração de Prestação de Serviço',
      ajuste_escala: 'Ajuste na Escala',
      comunicacao_indisponibilidade: 'Comunicação de Indisponibilidade',
      envio_documentos: 'Envio de Documentos',
      pedido_administrativo: 'Pedido Administrativo',
      indisponibilidade_temporaria: 'Indisponibilidade Temporária',
      indisponibilidade_definitiva: 'Indisponibilidade Definitiva',
      troca_horario: 'Troca de Horário/Escala',
      ausencia_pontual: 'Ausência Pontual',
      impedimento_tecnico: 'Impedimento Técnico',
      dificuldade_comparecimento: 'Dificuldade de Comparecimento',
      outro: 'Outro',
    };
    return labels[tipo] || tipo;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejeitado':
        return <XCircle className="text-red-600" size={20} />;
      case 'em_analise':
        return <Clock className="text-yellow-600" size={20} />;
      case 'aguardando_documentos':
        return <AlertCircle className="text-orange-600" size={20} />;
      default:
        return <FileText className="text-blue-600" size={20} />;
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
      aguardando_documentos: 'Aguardando Documentos',
    };
    return labels[status] || status;
  };

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    const matchStatus = filtroStatus === '' || s.status === filtroStatus;
    const matchBusca = busca === '' || 
      s.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
      getTipoLabel(s.tipo).toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitações ao RH</h1>
          <p className="mt-1 text-gray-600">Acompanhe e gerencie suas solicitações</p>
        </div>
        <Link
          href="/colaborador/solicitacoes/nova"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Solicitação
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Protocolo ou tipo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="aberto">Aberto</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="aguardando_documentos">Aguardando Documentos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {solicitacoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Nenhuma solicitação encontrada</p>
            <Link
              href="/colaborador/solicitacoes/nova"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Criar Primeira Solicitação
            </Link>
          </div>
        ) : (
          solicitacoesFiltradas.map((solicitacao) => (
            <div key={solicitacao.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(solicitacao.status)}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {getTipoLabel(solicitacao.tipo)}
                    </h3>
                    <p className="text-sm text-gray-500">Protocolo: {solicitacao.protocolo}</p>
                    <p className="text-sm text-gray-500">
                      Criada em: {formatDate(solicitacao.dataCriacao)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  solicitacao.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                  solicitacao.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                  solicitacao.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800' :
                  solicitacao.status === 'aguardando_documentos' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {getStatusLabel(solicitacao.status)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Motivo:</strong> {solicitacao.motivo}
                </p>
                {solicitacao.dataInicio && (
                  <p className="text-sm text-gray-600">
                    <strong>Período:</strong> {formatDate(solicitacao.dataInicio)}
                    {solicitacao.dataTermino && ` até ${formatDate(solicitacao.dataTermino)}`}
                    {solicitacao.tipoPeriodo && ` (${solicitacao.tipoPeriodo === 'integral' ? 'Integral' : 'Parcial'})`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href={`/colaborador/solicitacoes/${solicitacao.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver detalhes e mensagens
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


