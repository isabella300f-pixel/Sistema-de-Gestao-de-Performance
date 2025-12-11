'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vaga, ProcessoSeletivo, Candidato } from '@/types';
import { Briefcase, Users, FileText, CheckCircle, XCircle, Clock, Plus, X } from 'lucide-react';

export default function RHRecrutamentoPage() {
  const router = useRouter();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [processos, setProcessos] = useState<ProcessoSeletivo[]>([]);
  const [view, setView] = useState<'vagas' | 'processos' | 'candidatos'>('vagas');
  const [loading, setLoading] = useState(true);
  const [showModalVaga, setShowModalVaga] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    area: '',
    cargo: '',
    descricao: '',
    requisitos: '',
    salarioMin: '',
    salarioMax: '',
    status: 'aberta' as 'aberta' | 'pausada' | 'fechada',
  });

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'rh') {
        router.push('/');
        return;
      }

      // Dados simulados
      setVagas([
        {
          id: '1',
          titulo: 'Desenvolvedor Full Stack',
          area: 'Tecnologia',
          cargo: 'Desenvolvedor',
          descricao: 'Desenvolver e manter aplicações web utilizando React, Node.js e TypeScript. Trabalhar em equipe ágil e participar de code reviews.',
          requisitos: ['React', 'Node.js', 'TypeScript', 'Experiência com APIs REST'],
          salarioMin: 5000,
          salarioMax: 8000,
          status: 'aberta',
          dataAbertura: new Date().toISOString().split('T')[0],
          responsavelId: currentUser.id,
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleNovaVaga = () => {
    setFormData({
      titulo: '',
      area: '',
      cargo: '',
      descricao: '',
      requisitos: '',
      salarioMin: '',
      salarioMax: '',
      status: 'aberta',
    });
    setShowModalVaga(true);
  };

  const handleSalvarVaga = () => {
    if (!formData.titulo || !formData.area || !formData.cargo) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const novaVaga: Vaga = {
      id: `vaga-${Date.now()}`,
      titulo: formData.titulo,
      area: formData.area,
      cargo: formData.cargo,
      descricao: formData.descricao,
      requisitos: formData.requisitos.split(',').map(r => r.trim()).filter(r => r),
      salarioMin: formData.salarioMin ? Number(formData.salarioMin) : undefined,
      salarioMax: formData.salarioMax ? Number(formData.salarioMax) : undefined,
      status: formData.status,
      dataAbertura: new Date().toISOString().split('T')[0],
      responsavelId: currentUser?.id || 'rh-1',
    };

    setVagas([...vagas, novaVaga]);
    setShowModalVaga(false);
    alert('Vaga criada com sucesso!');
  };

  const handleVerDetalhes = (vaga: Vaga) => {
    setVagaSelecionada(vaga);
    setShowModalDetalhes(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red mx-auto mb-4"></div>
          <p className="text-gray-300 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Recrutamento e Seleção</h1>
          <p className="mt-2 text-gray-300">Gestão completa do funil de contratação</p>
        </div>
        <button
          onClick={handleNovaVaga}
          className="bg-ecosystem-red text-white px-6 py-3 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Vaga
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('vagas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'vagas'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Vagas
        </button>
        <button
          onClick={() => setView('processos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'processos'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Processos Seletivos
        </button>
        <button
          onClick={() => setView('candidatos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'candidatos'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Candidatos
        </button>
      </div>

      {view === 'vagas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vagas.length === 0 ? (
            <div className="col-span-full card-white p-12 text-center">
              <Briefcase className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400">Nenhuma vaga cadastrada</p>
            </div>
          ) : (
            vagas.map((vaga) => (
              <div key={vaga.id} className="card-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{vaga.titulo}</h3>
                    <p className="text-sm text-gray-300">{vaga.area} • {vaga.cargo}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      vaga.status === 'aberta'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : vaga.status === 'pausada'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    }`}
                  >
                    {vaga.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{vaga.descricao}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {vaga.salarioMin && vaga.salarioMax
                      ? `R$ ${vaga.salarioMin.toLocaleString('pt-BR')} - R$ ${vaga.salarioMax.toLocaleString('pt-BR')}`
                      : 'Salário a combinar'}
                  </span>
                  <button
                    onClick={() => handleVerDetalhes(vaga)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'processos' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Processos Seletivos</h2>
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Gestão de processos seletivos em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'candidatos' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Candidatos</h2>
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Base de candidatos em desenvolvimento</p>
          </div>
        </div>
      )}

      {/* Modal Nova Vaga */}
      {showModalVaga && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nova Vaga</h2>
              <button onClick={() => setShowModalVaga(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título da Vaga *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Área *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Ex: Tecnologia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cargo *</label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Ex: Desenvolvedor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Descreva as responsabilidades e atividades da vaga..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requisitos (separados por vírgula)</label>
                <input
                  type="text"
                  value={formData.requisitos}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ex: React, Node.js, TypeScript"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Salário Mínimo (R$)</label>
                  <input
                    type="number"
                    value={formData.salarioMin}
                    onChange={(e) => setFormData({ ...formData, salarioMin: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Salário Máximo (R$)</label>
                  <input
                    type="number"
                    value={formData.salarioMax}
                    onChange={(e) => setFormData({ ...formData, salarioMax: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="8000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="aberta" className="bg-gray-800">Aberta</option>
                  <option value="pausada" className="bg-gray-800">Pausada</option>
                  <option value="fechada" className="bg-gray-800">Fechada</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSalvarVaga}
                  className="flex-1 bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold"
                >
                  Criar Vaga
                </button>
                <button
                  onClick={() => setShowModalVaga(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Vaga */}
      {showModalDetalhes && vagaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Detalhes da Vaga</h2>
              <button onClick={() => setShowModalDetalhes(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{vagaSelecionada.titulo}</h3>
                <p className="text-gray-300">{vagaSelecionada.area} • {vagaSelecionada.cargo}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    vagaSelecionada.status === 'aberta'
                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                      : vagaSelecionada.status === 'pausada'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                  }`}
                >
                  {vagaSelecionada.status}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Descrição</h4>
                <p className="text-gray-300">{vagaSelecionada.descricao}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Requisitos</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {vagaSelecionada.requisitos.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Remuneração</h4>
                <p className="text-gray-300">
                  {vagaSelecionada.salarioMin && vagaSelecionada.salarioMax
                    ? `R$ ${vagaSelecionada.salarioMin.toLocaleString('pt-BR')} - R$ ${vagaSelecionada.salarioMax.toLocaleString('pt-BR')}`
                    : 'Salário a combinar'}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Informações</h4>
                <p className="text-gray-300">Data de abertura: {new Date(vagaSelecionada.dataAbertura).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModalDetalhes(false)}
                  className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
