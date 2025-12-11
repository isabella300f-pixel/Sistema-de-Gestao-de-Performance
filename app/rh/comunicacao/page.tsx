'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Comunicado, Sugestao } from '@/types';
import { MessageSquare, Mail, Send, Inbox, FileText, Plus, X } from 'lucide-react';

export default function RHComunicacaoPage() {
  const router = useRouter();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [view, setView] = useState<'comunicados' | 'sugestoes' | 'biblioteca'>('comunicados');
  const [loading, setLoading] = useState(true);
  const [showModalNovoComunicado, setShowModalNovoComunicado] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'geral' as 'geral' | 'area' | 'individual',
    canais: [] as ('email' | 'whatsapp' | 'app')[],
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
      setComunicados([
        {
          id: '1',
          titulo: 'Novo Regulamento Interno',
          conteudo: 'Informamos sobre as atualizações no regulamento interno da empresa.',
          tipo: 'geral',
          canais: ['email', 'app'],
          dataPublicacao: new Date().toISOString().split('T')[0],
          autorId: currentUser.id,
          status: 'publicado',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleNovoComunicado = () => {
    setFormData({
      titulo: '',
      conteudo: '',
      tipo: 'geral',
      canais: [],
    });
    setShowModalNovoComunicado(true);
  };

  const handleSalvarComunicado = () => {
    if (!formData.titulo || !formData.conteudo) {
      alert('Preencha título e conteúdo');
      return;
    }

    if (formData.canais.length === 0) {
      alert('Selecione pelo menos um canal');
      return;
    }

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const novoComunicado: Comunicado = {
      id: `comunicado-${Date.now()}`,
      titulo: formData.titulo,
      conteudo: formData.conteudo,
      tipo: formData.tipo,
      canais: formData.canais,
      dataPublicacao: new Date().toISOString().split('T')[0],
      autorId: currentUser?.id || 'rh-1',
      status: 'publicado',
    };

    setComunicados([...comunicados, novoComunicado]);
    setShowModalNovoComunicado(false);
    alert('Comunicado criado com sucesso!');
  };

  const toggleCanal = (canal: 'email' | 'whatsapp' | 'app') => {
    setFormData({
      ...formData,
      canais: formData.canais.includes(canal)
        ? formData.canais.filter((c) => c !== canal)
        : [...formData.canais, canal],
    });
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
          <h1 className="text-3xl font-bold text-white">Comunicação Interna</h1>
          <p className="mt-2 text-gray-300">Central de comunicação do RH e empresa</p>
        </div>
        <button
          onClick={handleNovoComunicado}
          className="bg-ecosystem-red text-white px-6 py-3 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Comunicado
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('comunicados')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'comunicados'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Comunicados
        </button>
        <button
          onClick={() => setView('sugestoes')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'sugestoes'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Caixa de Sugestões
        </button>
        <button
          onClick={() => setView('biblioteca')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'biblioteca'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Biblioteca
        </button>
      </div>

      {view === 'comunicados' && (
        <div className="space-y-4">
          {comunicados.length === 0 ? (
            <div className="card-white p-12 text-center">
              <MessageSquare className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400">Nenhum comunicado publicado</p>
            </div>
          ) : (
            comunicados.map((comunicado) => (
              <div key={comunicado.id} className="card-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{comunicado.titulo}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(comunicado.dataPublicacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      comunicado.status === 'publicado'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : comunicado.status === 'rascunho'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    }`}
                  >
                    {comunicado.status}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">{comunicado.conteudo}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Canais:</span>
                  {comunicado.canais.map((canal) => (
                    <span
                      key={canal}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded text-xs"
                    >
                      {canal === 'email' && <Mail size={12} />}
                      {canal === 'whatsapp' && <Send size={12} />}
                      {canal === 'app' && <MessageSquare size={12} />}
                      {canal}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'sugestoes' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Caixa de Sugestões</h2>
          <div className="text-center py-12 text-gray-400">
            <Inbox size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Caixa de sugestões em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'biblioteca' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Biblioteca de Documentos</h2>
          <div className="text-center py-12 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Biblioteca de documentos em desenvolvimento</p>
          </div>
        </div>
      )}

      {/* Modal Novo Comunicado */}
      {showModalNovoComunicado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Novo Comunicado</h2>
              <button onClick={() => setShowModalNovoComunicado(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ex: Novo Regulamento Interno"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Conteúdo *</label>
                <textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Digite o conteúdo do comunicado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="geral" className="bg-gray-800">Geral</option>
                  <option value="area" className="bg-gray-800">Área</option>
                  <option value="individual" className="bg-gray-800">Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Canais de Divulgação *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canais.includes('email')}
                      onChange={() => toggleCanal('email')}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-blue-500/50 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300 flex items-center gap-1">
                      <Mail size={16} />
                      Email
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canais.includes('whatsapp')}
                      onChange={() => toggleCanal('whatsapp')}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-blue-500/50 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300 flex items-center gap-1">
                      <Send size={16} />
                      WhatsApp
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canais.includes('app')}
                      onChange={() => toggleCanal('app')}
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-blue-500/50 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300 flex items-center gap-1">
                      <MessageSquare size={16} />
                      App
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSalvarComunicado}
                  className="flex-1 bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold"
                >
                  Publicar Comunicado
                </button>
                <button
                  onClick={() => setShowModalNovoComunicado(false)}
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
