'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatRH, MensagemChat } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { MessageSquare, Send, Paperclip } from 'lucide-react';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const solicitacaoId = searchParams.get('solicitacao');
  const [chat, setChat] = useState<ChatRH | null>(null);
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
      if (currentUser.role !== 'colaborador') {
        router.push('/');
        return;
      }

      // Dados simulados
      setChat({
        id: '1',
        colaboradorId: currentUser.id,
        solicitacaoId: solicitacaoId || undefined,
        mensagens: [
          {
            id: '1',
            chatId: '1',
            remetenteId: currentUser.id,
            remetenteNome: currentUser.name,
            remetenteTipo: 'colaborador',
            mensagem: 'Olá, gostaria de saber o status da minha solicitação.',
            data: new Date().toISOString(),
            lida: true,
          },
          {
            id: '2',
            chatId: '1',
            remetenteId: 'rh-1',
            remetenteNome: 'Adriana (RH)',
            remetenteTipo: 'rh',
            mensagem: 'Olá! Sua solicitação está em análise. Retornaremos em até 48h.',
            data: new Date().toISOString(),
            lida: true,
          },
        ],
        status: 'aberto',
        dataAbertura: new Date().toISOString(),
        dataUltimaMensagem: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router, solicitacaoId]);

  const enviarMensagem = () => {
    if (!novaMensagem.trim()) return;

    // Simular envio
    const novaMsg: MensagemChat = {
      id: String(Date.now()),
      chatId: chat!.id,
      remetenteId: 'colab-1',
      remetenteNome: 'Você',
      remetenteTipo: 'colaborador',
      mensagem: novaMensagem,
      data: new Date().toISOString(),
      lida: false,
    };

    setChat({
      ...chat!,
      mensagens: [...chat!.mensagens, novaMsg],
      dataUltimaMensagem: new Date().toISOString(),
    });

    setNovaMensagem('');
  };

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
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat com RH</h1>
        <p className="mt-1 text-gray-600">Converse diretamente com o time de RH</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat?.mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.remetenteTipo === 'colaborador' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md rounded-lg p-4 ${
                  msg.remetenteTipo === 'colaborador'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">{msg.remetenteNome}</p>
                <p className="text-sm">{msg.mensagem}</p>
                <p className={`text-xs mt-2 ${
                  msg.remetenteTipo === 'colaborador' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatDateTime(msg.data)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input de mensagem */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={enviarMensagem}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColaboradorChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

