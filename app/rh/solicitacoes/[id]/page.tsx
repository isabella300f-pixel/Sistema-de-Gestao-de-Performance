'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { SolicitacaoRH, TipoSolicitacao } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { mapRowToSolicitacao } from '@/lib/solicitacoes-api';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Send } from 'lucide-react';

function mapDetailToSolicitacao(raw: Record<string, unknown>): SolicitacaoRH {
  const sol = mapRowToSolicitacao(raw);
  const msgs = (raw.mensagens as Array<Record<string, unknown>>) || [];
  sol.mensagens = msgs.map((m: Record<string, unknown>) => ({
    id: String(m.id),
    solicitacaoId: String((m as { solicitacaoId?: string }).solicitacaoId ?? raw.id),
    remetenteId: String(m.remetenteId ?? m.remetente_id),
    remetenteNome: String((m as { remetenteNome?: string }).remetenteNome ?? ''),
    remetenteTipo: ((m as { remetenteTipo?: string }).remetenteTipo ?? m.remetente_tipo) as 'colaborador' | 'rh',
    mensagem: String(m.mensagem),
    data: String(m.data ?? m.criado_em),
  }));
  return sol;
}

export default function RHDetalheSolicitacaoPage() {
  const router = useRouter();
  const params = useParams();
  const solicitacaoId = params.id as string;
  const [solicitacao, setSolicitacao] = useState<SolicitacaoRH | null>(null);
  const [loading, setLoading] = useState(true);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  const loadDetail = async () => {
    const res = await fetch(`/api/solicitacoes/${solicitacaoId}`, { credentials: 'include' });
    if (!res.ok) return null;
    const raw = await res.json();
    return mapDetailToSolicitacao(raw);
  };

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
        const data = await loadDetail();
        if (cancelled) return;
        setSolicitacao(data || null);
      } catch {
        if (!cancelled) setSolicitacao(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, solicitacaoId]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = novaMensagem.trim();
    if (!msg || enviando) return;
    setEnviando(true);
    try {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: msg }),
        credentials: 'include',
      });
      if (res.ok) {
        setNovaMensagem('');
        const updated = await loadDetail();
        if (updated) setSolicitacao(updated);
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status !== 401 && res.status !== 503) alert(err?.error || 'Erro ao enviar mensagem.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const alterarStatus = async () => {
    if (!novoStatus || salvandoStatus) return;
    setSalvandoStatus(true);
    try {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
        credentials: 'include',
      });
      if (res.ok && solicitacao) {
        setSolicitacao({ ...solicitacao, status: novoStatus as SolicitacaoRH['status'] });
        setNovoStatus('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || 'Erro ao alterar status.');
      }
    } finally {
      setSalvandoStatus(false);
    }
  };

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
      case 'aprovado': return <CheckCircle className="text-green-600" size={24} />;
      case 'rejeitado': return <XCircle className="text-red-600" size={24} />;
      case 'em_analise': return <Clock className="text-yellow-600" size={24} />;
      case 'aguardando_documentos': return <AlertCircle className="text-orange-600" size={24} />;
      default: return <Clock className="text-blue-600" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Solicitação não encontrada</p>
        <Link href="/rh/solicitacoes" className="mt-4 text-blue-600 hover:text-blue-700">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rh/solicitacoes" className="text-gray-600 hover:text-gray-900"><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes da Solicitação</h1>
          <p className="mt-1 text-gray-600">Protocolo: {solicitacao.protocolo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {getStatusIcon(solicitacao.status)}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{getTipoLabel(solicitacao.tipo)}</h2>
                  <p className="text-sm text-gray-500 mt-1">Criada em {formatDate(solicitacao.dataCriacao)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                solicitacao.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                solicitacao.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                solicitacao.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800' :
                solicitacao.status === 'aguardando_documentos' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {solicitacao.status === 'aprovado' ? 'Aprovado' : solicitacao.status === 'rejeitado' ? 'Rejeitado' : solicitacao.status === 'em_analise' ? 'Em Análise' : solicitacao.status === 'aguardando_documentos' ? 'Aguardando Documentos' : 'Aberto'}
              </span>
            </div>
            <div className="space-y-4">
              <div><h3 className="font-medium text-gray-900 mb-2">Motivo</h3><p className="text-gray-700">{solicitacao.motivo}</p></div>
              {solicitacao.dataInicio && (
                <div><h3 className="font-medium text-gray-900 mb-2">Período</h3><p className="text-gray-700">{formatDate(solicitacao.dataInicio)}{solicitacao.dataTermino ? ` até ${formatDate(solicitacao.dataTermino)}` : ''}</p></div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={20} /> Mensagens</h2>
            {solicitacao.mensagens && solicitacao.mensagens.length > 0 ? (
              <div className="space-y-4 mb-4">
                {solicitacao.mensagens.map((msg) => (
                  <div key={msg.id} className={`p-4 rounded-lg ${msg.remetenteTipo === 'rh' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex justify-between mb-2"><span className="font-medium text-gray-900">{msg.remetenteNome}</span><span className="text-xs text-gray-500">{formatDateTime(msg.data)}</span></div>
                    <p className="text-gray-700">{msg.mensagem}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm mb-4">Nenhuma mensagem ainda.</p>}
            <form onSubmit={enviarMensagem} className="flex gap-2">
              <input type="text" value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} placeholder="Sua resposta..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={enviando} />
              <button type="submit" disabled={enviando || !novaMensagem.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Send size={18} /> Enviar</button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Alterar status</h2>
            <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2">
              <option value="">Selecione...</option>
              <option value="aberto">Aberto</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="aguardando_documentos">Aguardando Documentos</option>
            </select>
            <button onClick={alterarStatus} disabled={!novoStatus || salvandoStatus} className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
