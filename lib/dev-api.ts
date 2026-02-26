/**
 * Modo dev (NEXT_PUBLIC_DEV_LOGIN=true): APIs usam cookie devUser e armazenamento em memória
 * para ponto, solicitações e disponibilidade sem Supabase.
 */
import type { NextRequest } from 'next/server';

const DEV = process.env.NEXT_PUBLIC_DEV_LOGIN === 'true';

export interface DevUser {
  id: string;
  role: string;
  name?: string;
}

export function getDevUser(request: NextRequest): DevUser | null {
  if (!DEV) return null;
  try {
    const cookie = request.cookies.get('devUser')?.value;
    if (!cookie) return null;
    const decoded = decodeURIComponent(cookie);
    const u = JSON.parse(decoded) as DevUser;
    if (u?.id && u?.role) return u;
  } catch {
    // ignore
  }
  return null;
}

// --- Ponto (registros por colaborador id dev, ex: colab-1) ---
interface DevRegistroPonto {
  id: string;
  colaborador_id: string;
  data: string;
  entrada?: string | null;
  saida?: string | null;
  entrada_almoco?: string | null;
  saida_almoco?: string | null;
  horas_trabalhadas?: number | null;
  status?: string;
  aprovado?: boolean;
}

const devPontoStore = new Map<string, DevRegistroPonto[]>();

function agoraTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

function calcularHoras(entrada: string | null, saida: string | null, entradaAlmoco: string | null, saidaAlmoco: string | null): number | null {
  if (!entrada || !saida) return null;
  const [eh, em] = (entrada || '00:00').split(':').map(Number);
  const [sh, sm] = (saida || '00:00').split(':').map(Number);
  let mins = (sh * 60 + sm) - (eh * 60 + em);
  if (entradaAlmoco && saidaAlmoco) {
    const [eah, eam] = entradaAlmoco.split(':').map(Number);
    const [sah, sam] = saidaAlmoco.split(':').map(Number);
    mins -= (sah * 60 + sam) - (eah * 60 + eam);
  }
  return Math.round((mins / 60) * 100) / 100;
}

export function devPontoGET(colabId: string, mes: string): DevRegistroPonto[] {
  const list = devPontoStore.get(colabId) ?? [];
  return list.filter(
    (r) => r.data >= `${mes}-01` && r.data < mes.slice(0, 5) + String(Number(mes.slice(5)) + 1).padStart(2, '0') + '-01'
  ).sort((a, b) => a.data.localeCompare(b.data));
}

/** Todos os registros do mês (para RH em dev). */
export function devPontoGETAll(mes: string): DevRegistroPonto[] {
  const nextMonth = mes.slice(0, 5) + String(Number(mes.slice(5)) + 1).padStart(2, '0') + '-01';
  const out: DevRegistroPonto[] = [];
  devPontoStore.forEach((list) => {
    list.filter((r) => r.data >= `${mes}-01` && r.data < nextMonth).forEach((r) => out.push(r));
  });
  return out.sort((a, b) => a.data.localeCompare(b.data));
}

export function devPontoPOST(colabId: string, tipo: string, dataReg: string): DevRegistroPonto | null {
  const list = devPontoStore.get(colabId) ?? [];
  const existente = list.find((r) => r.data === dataReg);
  const agora = agoraTime();

  if (existente) {
    if (tipo === 'entrada') existente.entrada = agora;
    else if (tipo === 'saida') existente.saida = agora;
    else if (tipo === 'entrada_almoco') existente.entrada_almoco = agora;
    else if (tipo === 'saida_almoco') existente.saida_almoco = agora;
    existente.horas_trabalhadas = calcularHoras(
      existente.entrada ?? null,
      existente.saida ?? null,
      existente.entrada_almoco ?? null,
      existente.saida_almoco ?? null
    );
    return existente;
  }

  const novo: DevRegistroPonto = {
    id: `dev-ponto-${Date.now()}`,
    colaborador_id: colabId,
    data: dataReg,
    entrada: tipo === 'entrada' ? agora : null,
    saida: tipo === 'saida' ? agora : null,
    entrada_almoco: tipo === 'entrada_almoco' ? agora : null,
    saida_almoco: tipo === 'saida_almoco' ? agora : null,
    horas_trabalhadas: null,
    status: 'normal',
    aprovado: false,
  };
  novo.horas_trabalhadas = calcularHoras(novo.entrada ?? null, novo.saida ?? null, novo.entrada_almoco ?? null, novo.saida_almoco ?? null);
  list.push(novo);
  devPontoStore.set(colabId, list);
  return novo;
}

export function devPontoPATCH(id: string, upd: { aprovado?: boolean; status?: string }): DevRegistroPonto | null {
  for (const list of devPontoStore.values()) {
    const r = list.find((x) => x.id === id);
    if (r) {
      if (typeof upd.aprovado === 'boolean') r.aprovado = upd.aprovado;
      if (upd.status) r.status = upd.status;
      return r;
    }
  }
  return null;
}

// --- Solicitações (lista global por role; colaborador vê as suas) ---
let devSolicitacoesCounter = 0;
let devMensagensCounter = 0;

export interface DevSolicitacao {
  id: string;
  protocolo: string;
  colaborador_id: string;
  tipo: string;
  tipo_detalhado?: string | null;
  motivo: string;
  prioridade?: string;
  data_inicio?: string | null;
  data_termino?: string | null;
  impacto_atividades?: boolean;
  reposicao?: string | null;
  status: string;
  criado_em: string;
  atualizado_em: string;
  colaboradores?: { nome?: string; email?: string } | null;
}

export interface DevMensagem {
  id: string;
  solicitacao_id: string;
  remetente_id: string;
  remetente_tipo: string;
  mensagem: string;
  criado_em: string;
}

const devSolicitacoesStore: DevSolicitacao[] = [];
const devMensagensStore: DevMensagem[] = [];

export function devSolicitacoesGET(devUser: DevUser): DevSolicitacao[] {
  if (devUser.role === 'rh' || devUser.role === 'gestao') return [...devSolicitacoesStore].reverse();
  return devSolicitacoesStore.filter((s) => s.colaborador_id === devUser.id).reverse();
}

export function devSolicitacoesPOST(devUser: DevUser, body: Record<string, unknown>): DevSolicitacao | null {
  devSolicitacoesCounter += 1;
  const now = new Date().toISOString();
  const sol: DevSolicitacao = {
    id: `dev-sol-${devSolicitacoesCounter}`,
    protocolo: `SOL-DEV-${String(devSolicitacoesCounter).padStart(4, '0')}`,
    colaborador_id: devUser.id,
    tipo: String(body.tipo ?? 'indisponibilidade_temporaria'),
    tipo_detalhado: body.tipo_detalhado ? String(body.tipo_detalhado) : null,
    motivo: String(body.motivo ?? ''),
    prioridade: String(body.prioridade ?? 'media'),
    data_inicio: body.data_inicio ? String(body.data_inicio) : null,
    data_termino: body.data_termino ? String(body.data_termino) : null,
    impacto_atividades: Boolean(body.impacto_atividades),
    reposicao: body.reposicao ? String(body.reposicao) : null,
    status: 'aberto',
    criado_em: now,
    atualizado_em: now,
    colaboradores: { nome: devUser.name ?? devUser.id, email: '' },
  };
  devSolicitacoesStore.unshift(sol);
  return sol;
}

export function devSolicitacaoGET(id: string, devUser: DevUser): (DevSolicitacao & { mensagens: DevMensagem[] }) | null {
  const sol = devSolicitacoesStore.find((s) => s.id === id);
  if (!sol) return null;
  if (devUser.role !== 'rh' && devUser.role !== 'gestao' && sol.colaborador_id !== devUser.id) return null;
  const mensagens = devMensagensStore.filter((m) => m.solicitacao_id === id).sort((a, b) => a.criado_em.localeCompare(b.criado_em));
  return { ...sol, mensagens };
}

export function devSolicitacaoPATCH(id: string, status: string, _devUser: DevUser): boolean {
  const sol = devSolicitacoesStore.find((s) => s.id === id);
  if (!sol) return false;
  sol.status = status;
  sol.atualizado_em = new Date().toISOString();
  return true;
}

export function devSolicitacaoMensagemPOST(solicitacaoId: string, devUser: DevUser, mensagem: string): DevMensagem | null {
  const sol = devSolicitacoesStore.find((s) => s.id === solicitacaoId);
  if (!sol) return null;
  if (devUser.role !== 'rh' && devUser.role !== 'gestao' && sol.colaborador_id !== devUser.id) return null;
  devMensagensCounter += 1;
  const now = new Date().toISOString();
  const msg: DevMensagem = {
    id: `dev-msg-${devMensagensCounter}`,
    solicitacao_id: solicitacaoId,
    remetente_id: devUser.id,
    remetente_tipo: devUser.role === 'rh' || devUser.role === 'gestao' ? 'rh' : 'colaborador',
    mensagem: mensagem.trim(),
    criado_em: now,
  };
  devMensagensStore.push(msg);
  return msg;
}

// --- Disponibilidade ---
export interface DevDisponibilidade {
  id: string;
  colaborador_id: string;
  tipo: string;
  data_inicio: string;
  data_fim?: string | null;
  horarios?: string | null;
  motivo: string;
  status: string;
  criado_em: string;
  colaboradores?: { nome?: string } | null;
}

let devDispCounter = 0;
const devDisponibilidadeStore: DevDisponibilidade[] = [];

export function devDisponibilidadeGET(devUser: DevUser): DevDisponibilidade[] {
  if (devUser.role === 'rh' || devUser.role === 'gestao') return [...devDisponibilidadeStore].reverse();
  return devDisponibilidadeStore.filter((d) => d.colaborador_id === devUser.id).reverse();
}

export function devDisponibilidadePOST(devUser: DevUser, body: Record<string, unknown>): DevDisponibilidade | null {
  devDispCounter += 1;
  const now = new Date().toISOString();
  const disp: DevDisponibilidade = {
    id: `dev-disp-${devDispCounter}`,
    colaborador_id: devUser.id,
    tipo: String(body.tipo ?? 'horarios_disponiveis'),
    data_inicio: String(body.data_inicio ?? now.slice(0, 10)),
    data_fim: body.data_fim ? String(body.data_fim) : null,
    horarios: body.horarios ? String(body.horarios) : null,
    motivo: String(body.motivo ?? ''),
    status: 'pendente',
    criado_em: now,
    colaboradores: { nome: devUser.name ?? devUser.id },
  };
  devDisponibilidadeStore.unshift(disp);
  return disp;
}
