'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PesquisaClima, RespostaPesquisa } from '@/types';
import { Heart, BarChart3, Plus, TrendingUp, Users, X } from 'lucide-react';

export default function RHClimaPage() {
  const router = useRouter();
  const [pesquisas, setPesquisas] = useState<PesquisaClima[]>([]);
  const [view, setView] = useState<'pesquisas' | 'resultados' | 'dashboard'>('pesquisas');
  const [loading, setLoading] = useState(true);
  const [showModalNovaPesquisa, setShowModalNovaPesquisa] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'completa' as 'pulse' | 'completa',
    dataInicio: '',
    dataFim: '',
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
      setPesquisas([
        {
          id: '1',
          titulo: 'Pesquisa de Clima - Q1 2024',
          descricao: 'Avaliação do clima organizacional do primeiro trimestre',
          tipo: 'completa',
          dataInicio: '2024-01-01',
          dataFim: '2024-01-31',
          perguntas: [],
          status: 'finalizada',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleNovaPesquisa = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'completa',
      dataInicio: '',
      dataFim: '',
    });
    setShowModalNovaPesquisa(true);
  };

  const handleSalvarPesquisa = () => {
    if (!formData.titulo || !formData.dataInicio || !formData.dataFim) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const novaPesquisa: PesquisaClima = {
      id: `pesquisa-${Date.now()}`,
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      perguntas: [],
      status: 'planejada',
    };

    setPesquisas([...pesquisas, novaPesquisa]);
    setShowModalNovaPesquisa(false);
    alert('Pesquisa criada com sucesso!');
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
          <h1 className="text-3xl font-bold text-white">Clima Organizacional</h1>
          <p className="mt-2 text-gray-300">Monitoramento de percepção interna</p>
        </div>
        <button
          onClick={handleNovaPesquisa}
          className="bg-ecosystem-red text-white px-6 py-3 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Pesquisa
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('pesquisas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'pesquisas'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Pesquisas
        </button>
        <button
          onClick={() => setView('resultados')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'resultados'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Resultados
        </button>
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'dashboard'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Dashboard
        </button>
      </div>

      {view === 'pesquisas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pesquisas.length === 0 ? (
            <div className="col-span-full card-white p-12 text-center">
              <Heart className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400">Nenhuma pesquisa cadastrada</p>
            </div>
          ) : (
            pesquisas.map((pesquisa) => (
              <div key={pesquisa.id} className="card-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <Heart className="text-red-400" size={32} />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      pesquisa.status === 'ativa'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : pesquisa.status === 'finalizada'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    }`}
                  >
                    {pesquisa.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{pesquisa.titulo}</h3>
                <p className="text-sm text-gray-300 mb-4">{pesquisa.descricao}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{pesquisa.tipo === 'pulse' ? 'Pulse' : 'Completa'}</span>
                  <span>{pesquisa.perguntas.length} perguntas</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'resultados' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Resultados das Pesquisas</h2>
          <div className="text-center py-12 text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Análise automática de respostas em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Taxa de Resposta</p>
                <p className="text-3xl font-bold text-white mt-2">85%</p>
              </div>
              <Users className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Satisfação Geral</p>
                <p className="text-3xl font-bold text-white mt-2">4.2/5</p>
              </div>
              <TrendingUp className="text-green-400" size={32} />
            </div>
          </div>
          <div className="card-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Pesquisas Ativas</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {pesquisas.filter((p) => p.status === 'ativa').length}
                </p>
              </div>
              <Heart className="text-red-400" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Pesquisa */}
      {showModalNovaPesquisa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nova Pesquisa de Clima</h2>
              <button onClick={() => setShowModalNovaPesquisa(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título da Pesquisa *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ex: Pesquisa de Clima - Q1 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Descreva o objetivo da pesquisa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="completa" className="bg-gray-800">Completa</option>
                  <option value="pulse" className="bg-gray-800">Pulse</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data de Início *</label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data de Término *</label>
                  <input
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSalvarPesquisa}
                  className="flex-1 bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold"
                >
                  Criar Pesquisa
                </button>
                <button
                  onClick={() => setShowModalNovaPesquisa(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
