// Tipos de usuário e permissões
export type UserRole = 'gestor' | 'rh' | 'gestao' | 'colaborador';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Senha de 4 dígitos
  role: UserRole;
  area?: string;
  managedUsers?: string[]; // IDs dos colaboradores gerenciados (para gestores)
  ativo?: boolean; // Se o usuário está ativo
  criadoEm?: string; // Data de criação
  criadoPor?: string; // ID do usuário RH que criou
}

// Avaliação 1:1 (baseada no forms)
export type LeadsTrabalhados = 'excelente' | 'bom' | 'regular' | 'ruim';
export type QualidadeCRM = 'excelente' | 'boa' | 'regular' | 'ruim';
export type ConversaoFunil = 'acima_media' | 'dentro_media' | 'abaixo_media' | 'muito_abaixo_media';
export type MotivoPerda = 'baixo_empenho' | 'lead_sem_resposta' | 'falta_followup' | 'objecao_nao_trabalhada' | 'outro';
export type PontoForte = 'bom_relacionamento' | 'constancia' | 'bom_fechamento' | 'agilidade' | 'organizacao_crm' | 'outro';
export type PontoMelhoria = 'registrar_mais_crm' | 'seguir_funil' | 'melhorar_followup' | 'melhorar_fechamento';
export type Estrategia = 'aumentar_followup' | 'melhorar_crm' | 'trabalhar_objecoes' | 'treinamento_fechamento' | 'organizacao_tarefas' | 'revisao_pitch';
export type MotivoEstrategia = 'maior_impacto' | 'gargalo_crm' | 'necessidade_tecnica' | 'baixa_disciplina';

export interface Avaliacao11 {
  id: string;
  colaboradorId: string;
  gestorId: string;
  data: string; // ISO date string
  dataProxima?: string;
  
  // Campos do forms
  leadsTrabalhados: LeadsTrabalhados;
  qualidadeCRM: QualidadeCRM;
  conversaoFunil: ConversaoFunil;
  motivosPerda: MotivoPerda[];
  pontosFortes: PontoForte[];
  pontosMelhoria: PontoMelhoria[];
  estrategia: Estrategia;
  motivoEstrategia: MotivoEstrategia;
  acoesVendedor: string;
  acoesGerente: string;
  kpiFoco: string;
  
  // Campos adicionais para análise
  status: 'rascunho' | 'finalizado';
  createdAt: string;
  updatedAt: string;
}

// Dados diários do colaborador (baseado na planilha)
export interface RegistroDiario {
  id: string;
  colaboradorId: string;
  data: string;
  diaSemana: string;
  numeroLigacoes: number;
  ligacoesAtendidas: number;
  numeroAberturas: number;
  desqualificados: number;
  numeroFormularios: number;
  numeroOnlines: number;
  callsAgendadas: number;
  callsRealizadas: number;
  testesVocacionais: number;
  diagnosticos: number;
  avaliacaoPerformance?: string;
  sugestaoMelhoria?: string;
  metaProximoDia?: string;
  etapaFunilFoco?: string;
  /** Nome do vendedor da planilha quando não mapeado em colaboradores */
  vendedorNome?: string;
}

// Colaborador
export interface Colaborador {
  id: string;
  name: string;
  email?: string;
  cargo: string;
  area: string;
  gestorId: string;
  gestorNome: string;
  dataAdmissao: string;
  dataDesligamento?: string;
  status: 'ativo' | 'desligado';
  senioridade?: 'junior' | 'pleno' | 'senior';
}

// Avaliação do RH
export interface AvaliacaoRH {
  id: string;
  colaboradorId: string;
  avaliadorId: string; // ID do usuário do RH
  data: string;
  classificacao: 'alerta' | 'neutro' | 'positivo';
  observacoes: string;
  intervencoes?: string[];
  riscoDesligamento: 'baixo' | 'medio' | 'alto';
  createdAt: string;
}

// Indicadores e métricas
export interface IndicadoresColaborador {
  colaboradorId: string;
  mediaLeadsTrabalhados: number;
  mediaQualidadeCRM: number;
  mediaConversaoFunil: number;
  totalAvaliacoes: number;
  ultimaAvaliacao?: string;
  tendencia: 'melhora' | 'piora' | 'estavel';
  riscoDesligamento: 'baixo' | 'medio' | 'alto';
  scoreGeral: number; // 0-100
}

// Turnover
export interface TurnoverData {
  total: number;
  voluntario: number;
  involuntario: number;
  porArea: Record<string, { total: number; voluntario: number; involuntario: number }>;
  porGestor: Record<string, { total: number; voluntario: number; involuntario: number }>;
  tempoMedioPermanencia: number; // em dias
  motivosSaida: Record<string, number>;
}

// Filtros
export interface FiltrosColaboradores {
  area?: string;
  gestorId?: string;
  cargo?: string;
  senioridade?: string;
  status?: 'ativo' | 'desligado';
  periodo?: {
    inicio: string;
    fim: string;
  };
}

// ========== NOVOS TIPOS PARA MÓDULOS DE RH ==========

// 1. Gestão de Pessoas
export interface PerfilColaborador extends Colaborador {
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  telefone?: string;
  endereco?: string;
  salario?: number;
  jornadaTrabalho?: string;
  documentos?: DocumentoColaborador[];
}

export interface DocumentoColaborador {
  id: string;
  colaboradorId: string;
  tipo: 'cpf' | 'rg' | 'ctps' | 'reservista' | 'certificado' | 'diploma' | 'outro';
  nome: string;
  arquivo?: string;
  dataVencimento?: string;
  status: 'valido' | 'vencido' | 'vencendo';
}

export interface HistoricoProfissional {
  id: string;
  colaboradorId: string;
  tipo: 'promocao' | 'trocasetor' | 'advertencia' | 'reconhecimento' | 'treinamento';
  data: string;
  descricao: string;
  observacoes?: string;
}

export interface Competencia {
  id: string;
  colaboradorId: string;
  nome: string;
  nivel: 'basico' | 'intermediario' | 'avancado' | 'expert';
  categoria: string;
  dataAvaliacao: string;
}

// 2. Controle de Jornada e Ponto
export interface RegistroPonto {
  id: string;
  colaboradorId: string;
  data: string;
  entrada?: string;
  saida?: string;
  entradaAlmoco?: string;
  saidaAlmoco?: string;
  horasTrabalhadas?: number;
  horasExtras?: number;
  bancoHoras?: number;
  justificativa?: string;
  status: 'normal' | 'atraso' | 'falta' | 'justificado' | 'ferias' | 'licenca';
  aprovado?: boolean;
  aprovadoPor?: string;
}

export interface Escala {
  id: string;
  colaboradorId: string;
  turno: string;
  diasSemana: string[];
  horarioEntrada: string;
  horarioSaida: string;
  dataInicio: string;
  dataFim?: string;
}

// 3. Recrutamento e Seleção
export interface Vaga {
  id: string;
  titulo: string;
  area: string;
  cargo: string;
  descricao: string;
  requisitos: string[];
  salarioMin?: number;
  salarioMax?: number;
  status: 'aberta' | 'pausada' | 'fechada';
  dataAbertura: string;
  dataFechamento?: string;
  responsavelId: string;
}

export interface ProcessoSeletivo {
  id: string;
  vagaId: string;
  candidatoId: string;
  etapa: 'triagem' | 'entrevista' | 'teste' | 'aprovado' | 'reprovado';
  dataEntrevista?: string;
  parecer?: string;
  score?: number;
  status: 'em_andamento' | 'aprovado' | 'reprovado' | 'cancelado';
}

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  linkedin?: string;
  curriculo?: string;
  experiencia?: string;
  formacao?: string;
  dataCadastro: string;
}

// 4. Treinamentos e Desenvolvimento
export interface Treinamento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'online' | 'presencial' | 'hibrido';
  cargaHoraria: number;
  trilha?: string;
  dataInicio: string;
  dataFim: string;
  instrutor?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
}

export interface Certificado {
  id: string;
  colaboradorId: string;
  treinamentoId: string;
  dataConclusao: string;
  dataVencimento?: string;
  arquivo?: string;
  validade?: number; // em meses
}

export interface TrilhaAprendizagem {
  id: string;
  nome: string;
  descricao: string;
  treinamentos: string[]; // IDs dos treinamentos
  duracaoEstimada: number; // em horas
  nivel: 'basico' | 'intermediario' | 'avancado';
}

// 5. Documentos e Compliance
export interface DocumentoCompliance {
  id: string;
  tipo: 'politica' | 'manual' | 'procedimento' | 'contrato' | 'aso' | 'outro';
  titulo: string;
  descricao?: string;
  arquivo: string;
  versao: string;
  dataPublicacao: string;
  dataVencimento?: string;
  status: 'ativo' | 'arquivado' | 'vencido';
  assinadoPor?: string[];
}

// 6. Clima Organizacional
export interface PesquisaClima {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'pulse' | 'completa';
  dataInicio: string;
  dataFim: string;
  perguntas: PerguntaPesquisa[];
  status: 'planejada' | 'ativa' | 'finalizada' | 'cancelada';
}

export interface PerguntaPesquisa {
  id: string;
  texto: string;
  tipo: 'escala' | 'multipla_escolha' | 'texto' | 'sim_nao';
  opcoes?: string[];
}

export interface RespostaPesquisa {
  id: string;
  pesquisaId: string;
  colaboradorId: string;
  respostas: Record<string, string | number>;
  dataResposta: string;
}

// 7. Financeiro (RH)
export interface CustoColaborador {
  colaboradorId: string;
  salario: number;
  beneficios: number;
  encargos: number;
  custoTotal: number;
  periodo: string;
}

export interface Headcount {
  total: number;
  porArea: Record<string, number>;
  porCargo: Record<string, number>;
  porSenioridade: Record<string, number>;
  periodo: string;
}

// 8. Comunicação Interna
export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'geral' | 'area' | 'individual';
  destinatarios?: string[]; // IDs de áreas ou colaboradores
  canais: ('email' | 'whatsapp' | 'app')[];
  dataPublicacao: string;
  dataExpiracao?: string;
  autorId: string;
  status: 'rascunho' | 'publicado' | 'arquivado';
}

export interface Sugestao {
  id: string;
  colaboradorId: string;
  titulo: string;
  descricao: string;
  categoria: string;
  data: string;
  status: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada';
  resposta?: string;
}

// ========== TIPOS PARA PORTAL DO COLABORADOR ==========

// Solicitações ao RH
export type TipoSolicitacao = 
  | 'atualizacao_cadastral'
  | 'declaracao_prestacao_servico'
  | 'ajuste_escala'
  | 'comunicacao_indisponibilidade'
  | 'envio_documentos'
  | 'pedido_administrativo'
  | 'indisponibilidade_temporaria'
  | 'indisponibilidade_definitiva'
  | 'troca_horario'
  | 'ausencia_pontual'
  | 'impedimento_tecnico'
  | 'dificuldade_comparecimento'
  | 'outro';

export interface SolicitacaoRH {
  id: string;
  colaboradorId: string;
  protocolo: string;
  tipo: TipoSolicitacao;
  tipoDetalhado?: string; // Para "outro"
  dataInicio?: string;
  dataTermino?: string;
  tipoPeriodo?: 'parcial' | 'integral';
  horariosAfetados?: string;
  motivo: string;
  impactoAtividades: boolean;
  impactoDetalhado?: string;
  reposicao: 'precisa' | 'alinhado' | 'nao_precisa' | 'nao_se_aplica';
  pessoaReposicao?: string;
  anexos?: string[]; // URLs dos arquivos
  prioridade?: 'baixa' | 'media' | 'alta';
  status: 'aberto' | 'em_analise' | 'aprovado' | 'rejeitado' | 'aguardando_documentos';
  dataCriacao: string;
  dataAtualizacao: string;
  mensagens?: MensagemSolicitacao[];
}

export interface MensagemSolicitacao {
  id: string;
  solicitacaoId: string;
  remetenteId: string;
  remetenteNome: string;
  remetenteTipo: 'colaborador' | 'rh';
  mensagem: string;
  data: string;
  anexos?: string[];
}

// Chat com RH
export interface ChatRH {
  id: string;
  colaboradorId: string;
  solicitacaoId?: string; // Se vinculado a uma solicitação
  mensagens: MensagemChat[];
  status: 'aberto' | 'fechado';
  dataAbertura: string;
  dataUltimaMensagem: string;
}

export interface MensagemChat {
  id: string;
  chatId: string;
  remetenteId: string;
  remetenteNome: string;
  remetenteTipo: 'colaborador' | 'rh';
  mensagem: string;
  data: string;
  lida: boolean;
  anexos?: string[];
}

// Disponibilidade e Agenda
export interface Disponibilidade {
  id: string;
  colaboradorId: string;
  tipo: 'indisponibilidade_futura' | 'impossibilidade_dia' | 'troca_turno' | 'ajuste_rotina';
  dataInicio: string;
  dataFim?: string;
  horarios?: string;
  motivo: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  dataCriacao: string;
}

// FAQ e Autoatendimento
export interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: string;
  ordem: number;
  ativo: boolean;
}

export interface ModeloDocumento {
  id: string;
  nome: string;
  descricao: string;
  arquivo: string;
  categoria: string;
  dataPublicacao: string;
}

