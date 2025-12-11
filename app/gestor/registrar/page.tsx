'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Colaborador, Avaliacao11 } from '@/types';
import { getColaboradoresByGestor, getColaboradorById, getUserById, createAvaliacao11 } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Save, Send } from 'lucide-react';

type FormData = {
  colaboradorId: string;
  data: string;
  dataProxima?: string;
  leadsTrabalhados: string;
  qualidadeCRM: string;
  conversaoFunil: string;
  motivosPerda: string[];
  pontosFortes: string[];
  pontosMelhoria: string[];
  estrategia: string;
  motivoEstrategia: string;
  acoesVendedor: string;
  acoesGerente: string;
  kpiFoco: string;
  status: 'rascunho' | 'finalizado';
};

function Registrar11Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const colaboradorParam = searchParams.get('colaborador');

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      status: 'rascunho',
      motivosPerda: [],
      pontosFortes: [],
      pontosMelhoria: [],
    },
  });

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      const gestor = getUserById(currentUser.id);
      if (!gestor || gestor.role !== 'gestor') {
        router.push('/');
        return;
      }

      const cols = getColaboradoresByGestor(gestor.id);
      setColaboradores(cols);

      if (colaboradorParam) {
        const colab = getColaboradorById(colaboradorParam);
        if (colab && colab.gestorId === gestor.id) {
          setValue('colaboradorId', colaboradorParam);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router, colaboradorParam, setValue]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) return;

      const currentUser = JSON.parse(currentUserStr);
      const gestor = getUserById(currentUser.id);
      if (!gestor) return;

      const avaliacao: Omit<Avaliacao11, 'id' | 'createdAt' | 'updatedAt'> = {
        colaboradorId: data.colaboradorId,
        gestorId: gestor.id,
        data: data.data,
        dataProxima: data.dataProxima || undefined,
        leadsTrabalhados: data.leadsTrabalhados as any,
        qualidadeCRM: data.qualidadeCRM as any,
        conversaoFunil: data.conversaoFunil as any,
        motivosPerda: data.motivosPerda as any[],
        pontosFortes: data.pontosFortes as any[],
        pontosMelhoria: data.pontosMelhoria as any[],
        estrategia: data.estrategia as any,
        motivoEstrategia: data.motivoEstrategia as any,
        acoesVendedor: data.acoesVendedor,
        acoesGerente: data.acoesGerente,
        kpiFoco: data.kpiFoco,
        status: data.status,
      };

      createAvaliacao11(avaliacao);

      if (data.status === 'finalizado') {
        alert('Avaliação 1:1 registrada com sucesso!');
        router.push('/gestor/dashboard');
      } else {
        alert('Rascunho salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (
    field: 'motivosPerda' | 'pontosFortes' | 'pontosMelhoria',
    value: string,
    checked: boolean
  ) => {
    const current = watch(field) || [];
    if (checked) {
      setValue(field, [...current, value]);
    } else {
      setValue(field, current.filter((v) => v !== value));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Registrar Avaliação 1:1</h1>
        <p className="mt-2 text-gray-600">Preencha os dados da avaliação do colaborador</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Colaborador e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colaborador *
            </label>
            <select
              {...register('colaboradorId', { required: 'Selecione um colaborador' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Selecione --</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.id}>
                  {colab.name}
                </option>
              ))}
            </select>
            {errors.colaboradorId && (
              <p className="mt-1 text-sm text-red-600">{errors.colaboradorId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data do 1:1 *
            </label>
            <input
              type="date"
              {...register('data', { required: 'Data é obrigatória' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.data && (
              <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
            )}
          </div>
        </div>

        {/* Leads Trabalhados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leads Trabalhados *
          </label>
          <select
            {...register('leadsTrabalhados', { required: 'Campo obrigatório' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Selecione --</option>
            <option value="excelente">Excelente (90-100%)</option>
            <option value="bom">Bom (75-89%)</option>
            <option value="regular">Regular (50-74%)</option>
            <option value="ruim">Ruim (&lt;50%)</option>
          </select>
          {errors.leadsTrabalhados && (
            <p className="mt-1 text-sm text-red-600">{errors.leadsTrabalhados.message}</p>
          )}
        </div>

        {/* Qualidade CRM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualidade das atividades registradas no CRM *
          </label>
          <select
            {...register('qualidadeCRM', { required: 'Campo obrigatório' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Selecione --</option>
            <option value="excelente">Excelente</option>
            <option value="boa">Boa</option>
            <option value="regular">Regular</option>
            <option value="ruim">Ruim</option>
          </select>
          {errors.qualidadeCRM && (
            <p className="mt-1 text-sm text-red-600">{errors.qualidadeCRM.message}</p>
          )}
        </div>

        {/* Conversão no Funil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversão no funil durante o período *
          </label>
          <select
            {...register('conversaoFunil', { required: 'Campo obrigatório' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Selecione --</option>
            <option value="acima_media">Acima da média</option>
            <option value="dentro_media">Dentro da média</option>
            <option value="abaixo_media">Abaixo da média</option>
            <option value="muito_abaixo_media">Muito abaixo da média</option>
          </select>
          {errors.conversaoFunil && (
            <p className="mt-1 text-sm text-red-600">{errors.conversaoFunil.message}</p>
          )}
        </div>

        {/* Motivos de Perda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivos de perda predominantes *
          </label>
          <div className="space-y-2">
            {[
              { value: 'baixo_empenho', label: 'Baixo empenho' },
              { value: 'lead_sem_resposta', label: 'Lead sem resposta' },
              { value: 'falta_followup', label: 'Falta de follow-up adequado' },
              { value: 'objecao_nao_trabalhada', label: 'Objeção não trabalhada' },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={watch('motivosPerda')?.includes(option.value)}
                  onChange={(e) =>
                    handleCheckboxChange('motivosPerda', option.value, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pontos Fortes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pontos fortes identificados *
          </label>
          <div className="space-y-2">
            {[
              { value: 'bom_relacionamento', label: 'Bom relacionamento com o cliente' },
              { value: 'constancia', label: 'Constância nas atividades' },
              { value: 'bom_fechamento', label: 'Bom fechamento' },
              { value: 'agilidade', label: 'Agilidade no atendimento' },
              { value: 'organizacao_crm', label: 'Organização no CRM' },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={watch('pontosFortes')?.includes(option.value)}
                  onChange={(e) =>
                    handleCheckboxChange('pontosFortes', option.value, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pontos de Melhoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pontos de melhoria *
          </label>
          <div className="space-y-2">
            {[
              { value: 'registrar_mais_crm', label: 'Registrar mais informações no CRM' },
              { value: 'seguir_funil', label: 'Seguir o funil corretamente' },
              { value: 'melhorar_followup', label: 'Melhorar follow-up' },
              { value: 'melhorar_fechamento', label: 'Melhorar fechamento' },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={watch('pontosMelhoria')?.includes(option.value)}
                  onChange={(e) =>
                    handleCheckboxChange('pontosMelhoria', option.value, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Estratégia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual estratégia principal será adotada para esse vendedor? *
          </label>
          <select
            {...register('estrategia', { required: 'Campo obrigatório' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Selecione --</option>
            <option value="aumentar_followup">Aumentar volume de follow-up</option>
            <option value="melhorar_crm">Melhorar registro e rotina no CRM</option>
            <option value="trabalhar_objecoes">Trabalhar melhor objeções</option>
            <option value="treinamento_fechamento">Treinamento de fechamento</option>
            <option value="organizacao_tarefas">Organização diária de tarefas</option>
            <option value="revisao_pitch">Revisão do pitch</option>
          </select>
          {errors.estrategia && (
            <p className="mt-1 text-sm text-red-600">{errors.estrategia.message}</p>
          )}
        </div>

        {/* Motivo da Estratégia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual o motivo dessa estratégia? *
          </label>
          <select
            {...register('motivoEstrategia', { required: 'Campo obrigatório' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Selecione --</option>
            <option value="maior_impacto">Maior impacto imediato</option>
            <option value="gargalo_crm">Gargalo identificado no CRM</option>
            <option value="necessidade_tecnica">Necessidade de técnica</option>
            <option value="baixa_disciplina">Baixa disciplina</option>
          </select>
          {errors.motivoEstrategia && (
            <p className="mt-1 text-sm text-red-600">{errors.motivoEstrategia.message}</p>
          )}
        </div>

        {/* Ações do Vendedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ações que o vendedor deve executar nos próximos 7 dias *
          </label>
          <textarea
            {...register('acoesVendedor', { required: 'Campo obrigatório' })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva as ações específicas..."
          />
          {errors.acoesVendedor && (
            <p className="mt-1 text-sm text-red-600">{errors.acoesVendedor.message}</p>
          )}
        </div>

        {/* Ações do Gerente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ações que o gerente irá acompanhar *
          </label>
          <textarea
            {...register('acoesGerente', { required: 'Campo obrigatório' })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva as ações de acompanhamento..."
          />
          {errors.acoesGerente && (
            <p className="mt-1 text-sm text-red-600">{errors.acoesGerente.message}</p>
          )}
        </div>

        {/* KPI de Foco */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KPI de foco para o próximo período *
          </label>
          <input
            type="text"
            {...register('kpiFoco', { required: 'Campo obrigatório' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Aumentar taxa de conversão em 15%"
          />
          {errors.kpiFoco && (
            <p className="mt-1 text-sm text-red-600">{errors.kpiFoco.message}</p>
          )}
        </div>

        {/* Próxima Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Próxima data do 1:1
          </label>
          <input
            type="date"
            {...register('dataProxima')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setValue('status', 'rascunho');
              handleSubmit(onSubmit)();
            }}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center"
          >
            <Save size={16} className="mr-2" />
            Salvar Rascunho
          </button>
          <button
            type="submit"
            onClick={() => setValue('status', 'finalizado')}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Send size={16} className="mr-2" />
            {saving ? 'Salvando...' : 'Finalizar e Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Registrar11Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <Registrar11Content />
    </Suspense>
  );
}

