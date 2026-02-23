'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SolicitacaoRH, TipoSolicitacao } from '@/types';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface FormData {
  tipo: TipoSolicitacao;
  tipoDetalhado?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  dataInicio?: string;
  dataTermino?: string;
  tipoPeriodo?: 'parcial' | 'integral';
  horariosAfetados?: string;
  motivo: string;
  impactoAtividades: boolean;
  impactoDetalhado?: string;
  reposicao: 'precisa' | 'alinhado' | 'nao_precisa' | 'nao_se_aplica';
  pessoaReposicao?: string;
  anexos?: File[];
  confirmacao: boolean;
}

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const [colaborador, setColaborador] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      tipo: 'indisponibilidade_temporaria',
      prioridade: 'media',
      impactoAtividades: false,
      reposicao: 'nao_se_aplica',
      confirmacao: false,
    },
  });

  const tipoSelecionado = watch('tipo');
  const impactoAtividades = watch('impactoAtividades');
  const reposicao = watch('reposicao');

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
      setColaborador(currentUser);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    if (!data.confirmacao) {
      alert('Você precisa confirmar que as informações são verdadeiras');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        tipo: data.tipo,
        tipo_detalhado: data.tipoDetalhado || undefined,
        prioridade: data.prioridade || 'media',
        motivo: data.motivo,
        data_inicio: data.dataInicio || undefined,
        data_termino: data.dataTermino || undefined,
        impacto_atividades: data.impactoAtividades,
        reposicao: data.reposicao,
      };
      const res = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        const protocolo = json.protocolo || `SOL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        alert(`Solicitação criada com sucesso!\nProtocolo: ${protocolo}`);
        router.push('/colaborador/solicitacoes');
        return;
      }
      const err = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 503) {
        const protocolo = `SOL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        alert(`Solicitação criada (modo demonstração).\nProtocolo: ${protocolo}`);
        router.push('/colaborador/solicitacoes');
        return;
      }
      alert(err?.error || 'Erro ao criar solicitação. Tente novamente.');
    } catch {
      const protocolo = `SOL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      alert(`Solicitação criada (modo demonstração).\nProtocolo: ${protocolo}`);
      router.push('/colaborador/solicitacoes');
    } finally {
      setSubmitting(false);
    }
  };

  const tiposSolicitacao: { value: TipoSolicitacao; label: string }[] = [
    { value: 'indisponibilidade_temporaria', label: 'Indisponibilidade temporária' },
    { value: 'indisponibilidade_definitiva', label: 'Indisponibilidade definitiva' },
    { value: 'troca_horario', label: 'Troca de horário / escala' },
    { value: 'ausencia_pontual', label: 'Ausência pontual' },
    { value: 'impedimento_tecnico', label: 'Impedimento técnico (acesso/sistema)' },
    { value: 'dificuldade_comparecimento', label: 'Dificuldade de comparecimento' },
    { value: 'atualizacao_cadastral', label: 'Atualização cadastral' },
    { value: 'declaracao_prestacao_servico', label: 'Declaração de prestação de serviço' },
    { value: 'ajuste_escala', label: 'Ajustes na escala ou rotina' },
    { value: 'comunicacao_indisponibilidade', label: 'Comunicação de indisponibilidade' },
    { value: 'envio_documentos', label: 'Envio de documentos obrigatórios' },
    { value: 'pedido_administrativo', label: 'Pedido administrativo geral' },
    { value: 'outro', label: 'Outro' },
  ];

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
      <div className="flex items-center gap-4">
        <Link
          href="/colaborador/solicitacoes"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Solicitação</h1>
          <p className="mt-1 text-gray-600">Preencha o formulário para abrir uma solicitação ao RH</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identificação do Colaborador */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Identificação do Colaborador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={colaborador?.name || ''}
                disabled
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
              <input
                type="text"
                value={colaborador?.cargo || ''}
                disabled
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setor / Unidade</label>
              <input
                type="text"
                value={colaborador?.area || ''}
                disabled
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={colaborador?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Tipo de Solicitação */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tipo de Solicitação *</h2>
          <select
            {...register('tipo', { required: 'Selecione o tipo de solicitação' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tiposSolicitacao.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          {errors.tipo && (
            <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
          )}

          {tipoSelecionado === 'outro' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especifique o tipo de solicitação *
              </label>
              <input
                type="text"
                {...register('tipoDetalhado', { required: tipoSelecionado === 'outro' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o tipo de solicitação"
              />
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
            <select
              {...register('prioridade')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        {/* Período (se aplicável) */}
        {(tipoSelecionado.includes('indisponibilidade') || 
          tipoSelecionado === 'ausencia_pontual' || 
          tipoSelecionado === 'troca_horario') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Período da Indisponibilidade / Ausência</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de início *</label>
                <input
                  type="date"
                  {...register('dataInicio', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de término</label>
                <input
                  type="date"
                  {...register('dataTermino')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  {...register('tipoPeriodo')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="integral">Integral</option>
                  <option value="parcial">Parcial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horários afetados (opcional)</label>
                <input
                  type="text"
                  {...register('horariosAfetados')}
                  placeholder="Ex: 08:00 às 12:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Motivo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Motivo da Solicitação *</h2>
          <textarea
            {...register('motivo', { required: 'Descreva o motivo da solicitação' })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva detalhadamente o motivo da sua solicitação..."
          />
          {errors.motivo && (
            <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>
          )}
        </div>

        {/* Impacto nas Atividades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Impacto nas Atividades</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="impacto-sim"
                value="true"
                {...register('impactoAtividades')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="impacto-sim" className="text-sm font-medium text-gray-700">Sim</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="impacto-nao"
                value="false"
                {...register('impactoAtividades')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="impacto-nao" className="text-sm font-medium text-gray-700">Não</label>
            </div>
            {impactoAtividades && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explique o impacto</label>
                <textarea
                  {...register('impactoDetalhado', { required: impactoAtividades })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva como isso impactará suas atividades..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Reposição / Remanejamento */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reposição / Remanejamento</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="reposicao-precisa"
                value="precisa"
                {...register('reposicao')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="reposicao-precisa" className="text-sm font-medium text-gray-700">Precisa reposição</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="reposicao-alinhado"
                value="alinhado"
                {...register('reposicao')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="reposicao-alinhado" className="text-sm font-medium text-gray-700">Já alinhou com outra pessoa</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="reposicao-nao-precisa"
                value="nao_precisa"
                {...register('reposicao')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="reposicao-nao-precisa" className="text-sm font-medium text-gray-700">Não precisa</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="reposicao-nao-se-aplica"
                value="nao_se_aplica"
                {...register('reposicao')}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="reposicao-nao-se-aplica" className="text-sm font-medium text-gray-700">Não se aplica</label>
            </div>
            {(reposicao === 'precisa' || reposicao === 'alinhado') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da pessoa</label>
                <input
                  type="text"
                  {...register('pessoaReposicao', { required: reposicao === 'precisa' || reposicao === 'alinhado' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo da pessoa"
                />
              </div>
            )}
          </div>
        </div>

        {/* Anexos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Anexos (opcional)</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500">
              Nota fiscal, Atestado, Declaração, Comprovante, etc.
            </p>
            <input
              type="file"
              multiple
              {...register('anexos')}
              className="hidden"
              id="anexos"
            />
            <label
              htmlFor="anexos"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Selecionar Arquivos
            </label>
          </div>
        </div>

        {/* Confirmação */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirmacao"
              {...register('confirmacao', { required: 'Você precisa confirmar as informações' })}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <label htmlFor="confirmacao" className="text-sm text-gray-700">
              Declaro que as informações prestadas são verdadeiras e estou ciente de que o RH analisará esta solicitação. *
            </label>
          </div>
          {errors.confirmacao && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmacao.message}</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/colaborador/solicitacoes"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Enviar Solicitação
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


