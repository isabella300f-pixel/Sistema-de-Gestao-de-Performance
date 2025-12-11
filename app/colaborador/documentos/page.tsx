'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentoColaborador } from '@/types';
import { formatDate } from '@/lib/utils';
import { FolderOpen, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function ColaboradorDocumentosPage() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoColaborador[]>([]);
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
      setDocumentos([
        {
          id: '1',
          colaboradorId: currentUser.id,
          tipo: 'cpf',
          nome: 'CPF',
          status: 'valido',
        },
        {
          id: '2',
          colaboradorId: currentUser.id,
          tipo: 'rg',
          nome: 'RG',
          status: 'vencendo',
          dataVencimento: '2025-01-15',
        },
        {
          id: '3',
          colaboradorId: currentUser.id,
          tipo: 'certificado',
          nome: 'Certificado de Capacitação',
          status: 'valido',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="mt-1 text-gray-600">Envie e gerencie seus documentos obrigatórios</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Upload size={20} />
          Enviar Documento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos Obrigatórios</h2>
        <div className="space-y-4">
          {documentos.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="text-blue-600" size={24} />
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.tipo.toUpperCase()}
                      {doc.dataVencimento && ` • Vence em ${formatDate(doc.dataVencimento)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'valido' ? 'bg-green-100 text-green-800' :
                    doc.status === 'vencendo' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {doc.status === 'valido' && <CheckCircle size={12} />}
                    {doc.status === 'vencendo' && <AlertCircle size={12} />}
                    {doc.status === 'vencido' && <AlertCircle size={12} />}
                    {doc.status === 'valido' ? 'Válido' : doc.status === 'vencendo' ? 'Vencendo' : 'Vencido'}
                  </span>
                  {doc.arquivo ? (
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Visualizar</button>
                  ) : (
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Enviar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos Pessoais</h2>
        <div className="text-center py-12 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Área para documentos pessoais adicionais</p>
        </div>
      </div>
    </div>
  );
}


