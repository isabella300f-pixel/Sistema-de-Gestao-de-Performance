'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatRH, MensagemChat } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { MessageSquare, Send, Paperclip, User } from 'lucide-react';
import { getAllColaboradores } from '@/lib/data';

export default function RHChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatRH[]>([]);
  const [chatSelecionado, setChatSelecionado] = useState<ChatRH | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);

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

      const colaboradores = getAllColaboradores();

      // Dados simulados - criar chats para alguns colaboradores
      const chatsSimulados: ChatRH[] = colaboradores.slice(0, 3).map((colab, index) => ({
        id: `chat-${colab.id}`,
        colaboradorId: colab.id,
        mensagens: [
          {
            id: `msg-${index}-1`,
            chatId: `chat-${colab.id}`,
            remetenteId: colab.id,
            remetenteNome: colab.name,
            remetenteTipo: 'colaborador',
            mensagem: `Olá, gostaria de saber sobre ${index === 0 ? 'minha solicitação' : index === 1 ? 'documentos pendentes' : 'férias'}.`,
            data: new Date(Date.now() - 3600000 * (index + 1)).toISOString(),
            lida: false,
          },
        ],
        status: 'aberto',
        dataAbertura: new Date(Date.now() - 3600000 * (index + 1)).toISOString(),
        dataUltimaMensagem: new Date(Date.now() - 3600000 * (index + 1)).toISOString(),
      }));

      setChats(chatsSimulados);
      if (chatsSimulados.length > 0) {
        setChatSelecionado(chatsSimulados[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim() || !chatSelecionado) return;

    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const novaMsg: MensagemChat = {
      id: `msg-${Date.now()}`,
      chatId: chatSelecionado.id,
      remetenteId: currentUser?.id || 'rh-1',
      remetenteNome: `${currentUser?.name || 'RH'} (RH)`,
      remetenteTipo: 'rh',
      mensagem: novaMensagem,
      data: new Date().toISOString(),
      lida: false,
    };

    const chatAtualizado: ChatRH = {
      ...chatSelecionado,
      mensagens: [...chatSelecionado.mensagens, novaMsg],
      dataUltimaMensagem: new Date().toISOString(),
    };

    setChatSelecionado(chatAtualizado);
    setChats(chats.map((c) => (c.id === chatSelecionado.id ? chatAtualizado : c)));
    setNovaMensagem('');
  };

  const colaboradorNome = chatSelecionado
    ? getAllColaboradores().find((c) => c.id === chatSelecionado.colaboradorId)?.name || 'Colaborador'
    : '';

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
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Lista de Chats */}
      <div className="w-80 card-white">
        <div className="card-white-header">
          <h2 className="text-lg font-semibold text-white">Conversas</h2>
        </div>
        <div className="divide-y divide-blue-500/30 overflow-y-auto max-h-[calc(100vh-300px)]">
          {chats.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <MessageSquare className="mx-auto mb-4 text-gray-500" size={48} />
              <p>Nenhuma conversa</p>
            </div>
          ) : (
            chats.map((chat) => {
              const colab = getAllColaboradores().find((c) => c.id === chat.colaboradorId);
              const ultimaMsg = chat.mensagens[chat.mensagens.length - 1];
              const naoLidas = chat.mensagens.filter((m) => !m.lida && m.remetenteTipo === 'colaborador').length;

              return (
                <button
                  key={chat.id}
                  onClick={() => setChatSelecionado(chat)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors ${
                    chatSelecionado?.id === chat.id ? 'bg-gray-800/70' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <User className="text-blue-400" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{colab?.name || 'Colaborador'}</p>
                        {naoLidas > 0 && (
                          <span className="bg-ecosystem-red text-white text-xs px-2 py-1 rounded-full">
                            {naoLidas}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {ultimaMsg?.mensagem || 'Sem mensagens'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 card-white flex flex-col">
        {chatSelecionado ? (
          <>
            <div className="card-white-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{colaboradorNome}</h3>
                  <p className="text-xs text-gray-400">Chat com colaborador</p>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatSelecionado.mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.remetenteTipo === 'rh' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md rounded-lg p-4 ${
                      msg.remetenteTipo === 'rh'
                        ? 'bg-ecosystem-red text-white'
                        : 'bg-gray-800 text-white border border-blue-500/50'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{msg.remetenteNome}</p>
                    <p className="text-sm">{msg.mensagem}</p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.remetenteTipo === 'rh' ? 'text-red-100' : 'text-gray-400'
                      }`}
                    >
                      {formatDateTime(msg.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de mensagem */}
            <div className="border-t border-blue-500/30 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEnviarMensagem();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                />
                <button
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className="px-4 py-2 bg-ecosystem-red text-white rounded-lg hover:bg-ecosystem-red-dark disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MessageSquare className="mx-auto mb-4 text-gray-500" size={48} />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

