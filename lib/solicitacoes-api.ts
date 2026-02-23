import type { SolicitacaoRH, MensagemSolicitacao } from '@/types';

/** Converte linha do Supabase (snake_case) para SolicitacaoRH (camelCase). */
export function mapRowToSolicitacao(row: Record<string, unknown>): SolicitacaoRH {
  const r = row as Record<string, unknown> & {
    colaboradores?: { nome?: string; email?: string };
  };
  return {
    id: String(r.id),
    colaboradorId: String(r.colaborador_id),
    protocolo: String(r.protocolo ?? ''),
    tipo: String(r.tipo) as SolicitacaoRH['tipo'],
    tipoDetalhado: r.tipo_detalhado ? String(r.tipo_detalhado) : undefined,
    dataInicio: r.data_inicio ? String(r.data_inicio) : undefined,
    dataTermino: r.data_termino ? String(r.data_termino) : undefined,
    motivo: String(r.motivo),
    impactoAtividades: Boolean(r.impacto_atividades),
    reposicao: (r.reposicao as SolicitacaoRH['reposicao']) ?? 'nao_se_aplica',
    status: (r.status as SolicitacaoRH['status']) ?? 'aberto',
    prioridade: r.prioridade ? (r.prioridade as 'baixa' | 'media' | 'alta') : undefined,
    dataCriacao: String(r.criado_em),
    dataAtualizacao: String(r.atualizado_em ?? r.criado_em),
  };
}

/** Converte mensagem da API para MensagemSolicitacao. */
export function mapRowToMensagem(row: Record<string, unknown>): MensagemSolicitacao {
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    solicitacaoId: String(r.solicitacao_id),
    remetenteId: String(r.remetente_id),
    remetenteNome: String((r as { remetenteNome?: string }).remetenteNome ?? ''),
    remetenteTipo: (r.remetente_tipo as 'colaborador' | 'rh') ?? 'colaborador',
    mensagem: String(r.mensagem),
    data: String(r.criado_em),
  };
}
