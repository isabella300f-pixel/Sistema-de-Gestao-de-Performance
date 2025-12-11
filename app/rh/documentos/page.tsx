'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentoCompliance, DocumentoColaborador } from '@/types';
import { FolderOpen, FileText, AlertCircle, CheckCircle, Upload, Search, X, Eye, Download } from 'lucide-react';

export default function RHDocumentosPage() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoCompliance[]>([]);
  const [view, setView] = useState<'compliance' | 'colaboradores' | 'vencimentos'>('compliance');
  const [loading, setLoading] = useState(true);
  const [showModalUpload, setShowModalUpload] = useState(false);
  const [showModalVisualizar, setShowModalVisualizar] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoCompliance | null>(null);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);

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
      setDocumentos([
        {
          id: '1',
          tipo: 'politica',
          titulo: 'Política de Segurança da Informação',
          descricao: 'Política completa de segurança da informação da empresa',
          versao: '2.0',
          dataPublicacao: '2024-01-01',
          status: 'ativo',
          arquivo: '/documentos/politica-seguranca.pdf',
        },
        {
          id: '2',
          tipo: 'manual',
          titulo: 'Manual do Colaborador',
          descricao: 'Manual completo com todas as diretrizes e procedimentos',
          versao: '1.5',
          dataPublicacao: '2024-02-15',
          status: 'ativo',
          arquivo: '/documentos/manual-colaborador.pdf',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleUpload = () => {
    setShowModalUpload(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivoSelecionado(e.target.files[0]);
    }
  };

  const handleSalvarDocumento = () => {
    if (!arquivoSelecionado) {
      alert('Selecione um arquivo para anexar');
      return;
    }

    // Simular upload
    const novoDocumento: DocumentoCompliance = {
      id: `doc-${Date.now()}`,
      tipo: 'politica',
      titulo: arquivoSelecionado.name,
      descricao: `Documento anexado: ${arquivoSelecionado.name}`,
      versao: '1.0',
      dataPublicacao: new Date().toISOString().split('T')[0],
      status: 'ativo',
      arquivo: URL.createObjectURL(arquivoSelecionado),
    };

    setDocumentos([...documentos, novoDocumento]);
    setShowModalUpload(false);
    setArquivoSelecionado(null);
    alert('Documento anexado com sucesso!');
  };

  const handleVisualizar = (doc: DocumentoCompliance) => {
    setDocumentoSelecionado(doc);
    setShowModalVisualizar(true);
  };

  const handleDownload = (doc: DocumentoCompliance) => {
    if (doc.arquivo) {
      // Simular download
      const link = document.createElement('a');
      link.href = doc.arquivo;
      link.download = doc.titulo;
      link.click();
    }
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
          <h1 className="text-3xl font-bold text-white">Documentos e Compliance</h1>
          <p className="mt-2 text-gray-300">Centralização de documentos e políticas</p>
        </div>
        <button
          onClick={handleUpload}
          className="bg-ecosystem-red text-white px-6 py-3 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold flex items-center gap-2"
        >
          <Upload size={20} />
          Novo Documento
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('compliance')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'compliance'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Compliance
        </button>
        <button
          onClick={() => setView('colaboradores')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'colaboradores'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Documentos de Colaboradores
        </button>
        <button
          onClick={() => setView('vencimentos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'vencimentos'
              ? 'bg-ecosystem-red text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-blue-500/50'
          }`}
        >
          Vencimentos
        </button>
      </div>

      {view === 'compliance' && (
        <div className="card-white">
          <div className="card-white-header">
            <h2 className="text-lg font-semibold text-white">Documentos de Compliance</h2>
          </div>
          <div className="divide-y divide-blue-500/30">
            {documentos.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400">
                <FileText size={48} className="mx-auto mb-4 text-gray-500" />
                <p>Nenhum documento cadastrado</p>
              </div>
            ) : (
              documentos.map((doc) => (
                <div key={doc.id} className="px-6 py-4 hover:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="text-blue-400" size={24} />
                      <div>
                        <h3 className="font-medium text-white">{doc.titulo}</h3>
                        <p className="text-sm text-gray-400">Versão {doc.versao} • {doc.tipo}</p>
                        {doc.descricao && <p className="text-xs text-gray-500 mt-1">{doc.descricao}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          doc.status === 'ativo'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <button
                        onClick={() => handleVisualizar(doc)}
                        className="px-3 py-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-md border border-blue-500/50 text-sm flex items-center gap-1"
                      >
                        <Eye size={16} />
                        Visualizar
                      </button>
                      {doc.arquivo && (
                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-3 py-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-md border border-green-500/50 text-sm flex items-center gap-1"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'colaboradores' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Documentos por Colaborador</h2>
          <div className="text-center py-12 text-gray-400">
            <FolderOpen size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Pasta digital por colaborador em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'vencimentos' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Controle de Vencimento</h2>
          <div className="text-center py-12 text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Controle de vencimento de documentos em desenvolvimento</p>
          </div>
        </div>
      )}

      {/* Modal Upload */}
      {showModalUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-2xl w-full">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Anexar Documento</h2>
              <button onClick={() => setShowModalUpload(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título do Documento</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Ex: Política de Segurança"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <select className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white">
                  <option value="politica" className="bg-gray-800">Política</option>
                  <option value="manual" className="bg-gray-800">Manual</option>
                  <option value="procedimento" className="bg-gray-800">Procedimento</option>
                  <option value="contrato" className="bg-gray-800">Contrato</option>
                  <option value="aso" className="bg-gray-800">ASO</option>
                  <option value="outro" className="bg-gray-800">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Arquivo</label>
                <div className="border-2 border-dashed border-blue-500/50 rounded-lg p-6 text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-400 hover:text-blue-300"
                  >
                    Clique para selecionar ou arraste o arquivo aqui
                  </label>
                  {arquivoSelecionado && (
                    <p className="mt-2 text-sm text-gray-300">{arquivoSelecionado.name}</p>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSalvarDocumento}
                  className="flex-1 bg-ecosystem-red text-white py-3 px-6 rounded-lg hover:bg-ecosystem-red-dark transition-colors font-semibold"
                >
                  Anexar Documento
                </button>
                <button
                  onClick={() => setShowModalUpload(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar */}
      {showModalVisualizar && documentoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-blue-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-white-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Visualizar Documento</h2>
              <button onClick={() => setShowModalVisualizar(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{documentoSelecionado.titulo}</h3>
                <p className="text-gray-300">Versão {documentoSelecionado.versao} • {documentoSelecionado.tipo}</p>
              </div>

              {documentoSelecionado.descricao && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Descrição</h4>
                  <p className="text-gray-300">{documentoSelecionado.descricao}</p>
                </div>
              )}

              {documentoSelecionado.arquivo ? (
                <div className="border border-blue-500/50 rounded-lg p-4 bg-gray-800/50">
                  <iframe
                    src={documentoSelecionado.arquivo}
                    className="w-full h-96 rounded"
                    title={documentoSelecionado.titulo}
                  />
                </div>
              ) : (
                <div className="border border-blue-500/50 rounded-lg p-12 text-center bg-gray-800/50">
                  <FileText className="mx-auto mb-4 text-gray-500" size={48} />
                  <p className="text-gray-400">Arquivo não disponível</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {documentoSelecionado.arquivo && (
                  <button
                    onClick={() => handleDownload(documentoSelecionado!)}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download
                  </button>
                )}
                <button
                  onClick={() => setShowModalVisualizar(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
