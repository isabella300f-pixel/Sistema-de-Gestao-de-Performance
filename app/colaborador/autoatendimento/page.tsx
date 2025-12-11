'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FAQ, ModeloDocumento } from '@/types';
import { HelpCircle, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function ColaboradorAutoatendimentoPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [modelos, setModelos] = useState<ModeloDocumento[]>([]);
  const [busca, setBusca] = useState('');
  const [faqAberto, setFaqAberto] = useState<string | null>(null);
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
      setFaqs([
        {
          id: '1',
          pergunta: 'Como solicito férias?',
          resposta: 'Acesse a área de Solicitações e selecione "Ausência Pontual" ou "Indisponibilidade Temporária". Preencha o formulário com as datas desejadas.',
          categoria: 'Férias e Ausências',
          ordem: 1,
          ativo: true,
        },
        {
          id: '2',
          pergunta: 'Como envio documentos?',
          resposta: 'Acesse "Meus Documentos" e clique em "Enviar Documento". Selecione o tipo de documento e faça o upload do arquivo.',
          categoria: 'Documentos',
          ordem: 2,
          ativo: true,
        },
      ]);

      setModelos([
        {
          id: '1',
          nome: 'Declaração de Prestação de Serviço',
          descricao: 'Modelo para declaração de prestação de serviço',
          arquivo: '/modelos/declaracao.pdf',
          categoria: 'Declarações',
          dataPublicacao: '2024-01-01',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const faqsFiltradas = faqs.filter(faq => 
    faq.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
    faq.resposta.toLowerCase().includes(busca.toLowerCase())
  );

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Autoatendimento</h1>
        <p className="mt-1 text-gray-600">FAQ, modelos de documentos e políticas internas</p>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no FAQ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle size={24} />
          Perguntas Frequentes (FAQ)
        </h2>
        <div className="space-y-4">
          {faqsFiltradas.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setFaqAberto(faqAberto === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{faq.pergunta}</span>
                {faqAberto === faq.id ? (
                  <ChevronUp className="text-gray-500" size={20} />
                ) : (
                  <ChevronDown className="text-gray-500" size={20} />
                )}
              </button>
              {faqAberto === faq.id && (
                <div className="p-4 pt-0 text-gray-700 border-t border-gray-200">
                  {faq.resposta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modelos de Documentos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={24} />
          Modelos de Documentos
        </h2>
        <div className="space-y-4">
          {modelos.map((modelo) => (
            <div key={modelo.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{modelo.nome}</h3>
                  <p className="text-sm text-gray-500">{modelo.descricao}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Baixar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Políticas Internas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Políticas Internas</h2>
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Biblioteca de políticas internas em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}


