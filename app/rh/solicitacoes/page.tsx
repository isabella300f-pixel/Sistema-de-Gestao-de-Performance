'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SolicitacaoRH, TipoSolicitacao } from '@/types';
import { formatDate } from '@/lib/utils';
import { mapRowToSolicitacao } from '@/lib/solicitacoes-api';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

export default function RHSolicitacoesPage() {
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
        if (currentUser.role !== 'rh') {
          router.push('/');
          return;
        }
        const res = await fetch('/api/solicitacoes', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data.map((r: Record<string, unknown>) => mapRowToSolicitacao(r)) : [];
          setSolicitacoes(list);
        } else {
          setSolicitacoes([
            { id: 'mock-1', colaboradorId: 'colab-1', protocolo: 'SOL-2024-001', tipo: 'indisponibilidade_temporaria', motivo: 'Exemplo (dados demonstrativos)', impactoAtividades: false, reposicao: 'nao_se_aplica', status: 'em_analise', dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
          ]);
        }
      } catch {
        setSolicitacoes([
          { id: 'mock-1', colaboradorId: 'colab-1', protocolo: 'SOL-2024-001', tipo: 'indisponibilidade_temporaria', motivo: 'Exemplo (dados demonstrativos)', impactoAtividades: false, reposicao: 'nao_se_aplica', status: 'em_analise', dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const getTipoLabel = (tipo: TipoSolicitacao): string => {
    const labels: Record<string, string> = {
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
      case 'aprovado': return <CheckCircle className="text-green-600" size={20} />;
      case 'rejeitado': return <XCircle className="text-red-600" size={20} />;
      case 'em_analise': return <Clock className="text-yellow-600" size={20} />;
      case 'aguardando_documentos': return <AlertCircle className="text-orange-600" size={20} />;
      default: return <FileText className="text-blue-600" size={20} />;
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      aberto: 'Aberto', em_analise: 'Em Análise', aprovado: 'Aprovado',
      rejeitado: 'Rejeitado', aguardando_documentos: 'Aguardando Documentos',
    };
    return labels[status] || status;
  };

  const filtradas = solicitacoes.filter(s => {
    const matchStatus = !filtroStatus || s.status === filtroStatus;
    const matchBusca = !busca ||
      s.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
      getTipoLabel(s.tipo).toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitações dos Colaboradores</h1>
        <p className="mt-1 text-gray-600">Visualize, responda e altere o status das solicitações</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Protocolo ou tipo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
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
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          filtradas.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getStatusIcon(s.status)}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{getTipoLabel(s.tipo)}</h3>
                    <p className="text-sm text-gray-500">Protocolo: {s.protocolo}</p>
                    <p className="text-sm text-gray-500">Criada em: {formatDate(s.dataCriacao)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  s.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                  s.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                  s.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800' :
                  s.status === 'aguardando_documentos' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {getStatusLabel(s.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4"><strong>Motivo:</strong> {s.motivo}</p>
              <Link
                href={`/rh/solicitacoes/${s.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver detalhes e responder →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
