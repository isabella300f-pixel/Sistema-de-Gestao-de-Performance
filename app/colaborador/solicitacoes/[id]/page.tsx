'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { SolicitacaoRH, TipoSolicitacao } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function DetalhesSolicitacaoPage() {
  const router = useRouter();
  const params = useParams();
  const solicitacaoId = params.id as string;
  const [solicitacao, setSolicitacao] = useState<SolicitacaoRH | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'colaborador') {
        router.push('/');
        return;
      }

      // Dados simulados
      setSolicitacao({
        id: solicitacaoId,
        colaboradorId: currentUser.id,
        protocolo: 'SOL-2024-001',
        tipo: 'indisponibilidade_temporaria',
        dataInicio: '2024-12-20',
        dataTermino: '2024-12-22',
        tipoPeriodo: 'integral',
        motivo: 'Compromisso médico',
        impactoAtividades: true,
        impactoDetalhado: 'Não conseguirei atender ligações durante o período',
        reposicao: 'alinhado',
        pessoaReposicao: 'Maria Santos',
        status: 'em_analise',
        dataCriacao: '2024-12-10',
        dataAtualizacao: '2024-12-10',
        mensagens: [
          {
            id: '1',
            solicitacaoId: solicitacaoId,
            remetenteId: 'rh-1',
            remetenteNome: 'Adriana (RH)',
            remetenteTipo: 'rh',
            mensagem: 'Sua solicitação está em análise. Retornaremos em até 48h.',
            data: '2024-12-10T10:00:00',
          },
        ],
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router, solicitacaoId]);

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
        return <CheckCircle className="text-green-600" size={24} />;
      case 'rejeitado':
        return <XCircle className="text-red-600" size={24} />;
      case 'em_analise':
        return <Clock className="text-yellow-600" size={24} />;
      case 'aguardando_documentos':
        return <AlertCircle className="text-orange-600" size={24} />;
      default:
        return <Clock className="text-blue-600" size={24} />;
    }
  };

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

  if (!solicitacao) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Solicitação não encontrada</p>
        <Link href="/colaborador/solicitacoes" className="mt-4 text-blue-600 hover:text-blue-700">
          Voltar para Solicitações
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/colaborador/solicitacoes"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes da Solicitação</h1>
          <p className="mt-1 text-gray-600">Protocolo: {solicitacao.protocolo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {getStatusIcon(solicitacao.status)}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {getTipoLabel(solicitacao.tipo)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Criada em {formatDate(solicitacao.dataCriacao)}
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
                {solicitacao.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Motivo</h3>
                <p className="text-gray-700">{solicitacao.motivo}</p>
              </div>

              {solicitacao.dataInicio && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Período</h3>
                  <p className="text-gray-700">
                    {formatDate(solicitacao.dataInicio)}
                    {solicitacao.dataTermino && ` até ${formatDate(solicitacao.dataTermino)}`}
                    {solicitacao.tipoPeriodo && ` (${solicitacao.tipoPeriodo === 'integral' ? 'Integral' : 'Parcial'})`}
                  </p>
                </div>
              )}

              {solicitacao.impactoAtividades && solicitacao.impactoDetalhado && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Impacto nas Atividades</h3>
                  <p className="text-gray-700">{solicitacao.impactoDetalhado}</p>
                </div>
              )}

              {solicitacao.reposicao !== 'nao_se_aplica' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reposição</h3>
                  <p className="text-gray-700">
                    {solicitacao.reposicao === 'alinhado' && solicitacao.pessoaReposicao
                      ? `Já alinhado com ${solicitacao.pessoaReposicao}`
                      : solicitacao.reposicao === 'precisa'
                      ? 'Precisa reposição'
                      : 'Não precisa'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mensagens */}
          {solicitacao.mensagens && solicitacao.mensagens.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Histórico de Mensagens
              </h2>
              <div className="space-y-4">
                {solicitacao.mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.remetenteTipo === 'rh' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{msg.remetenteNome}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(msg.data)}</span>
                    </div>
                    <p className="text-gray-700">{msg.mensagem}</p>
                  </div>
                ))}
              </div>
              <Link
                href={`/colaborador/chat?solicitacao=${solicitacao.id}`}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Continuar Conversa
              </Link>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Linha do Tempo</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Solicitação criada</p>
                <p className="text-xs text-gray-500">{formatDateTime(solicitacao.dataCriacao)}</p>
              </div>
            </div>
            {solicitacao.status === 'em_analise' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Em análise</p>
                  <p className="text-xs text-gray-500">{formatDateTime(solicitacao.dataAtualizacao)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


