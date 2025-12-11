'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PerfilColaborador } from '@/types';
import { formatDate } from '@/lib/utils';
import { getColaboradorById } from '@/lib/data';
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';

export default function ColaboradorPerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilColaborador | null>(null);
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

      // Buscar dados reais do colaborador
      const colaborador = getColaboradorById(currentUser.id);
      if (colaborador) {
        setPerfil({
          id: colaborador.id,
          name: colaborador.name,
          email: currentUser.email || '',
          cargo: colaborador.cargo,
          area: colaborador.area,
          gestorId: colaborador.gestorId,
          gestorNome: colaborador.gestorNome,
          dataAdmissao: colaborador.dataAdmissao,
          status: colaborador.status,
          telefone: '(11) 99999-9999', // Dados adicionais podem ser adicionados depois
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
        });
      } else {
        // Fallback para dados simulados se não encontrar
        setPerfil({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          cargo: 'Vendedor',
          area: 'Vendas',
          gestorId: 'gestor-1',
          gestorNome: 'DANILO LOURENÇO TEIXEIRA DE MIRANDA',
          dataAdmissao: '2023-01-15',
          status: 'ativo',
          telefone: '(11) 99999-9999',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
        });
      }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-1 text-gray-600">Visualize e atualize suas informações pessoais</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{perfil?.name}</h2>
            <p className="text-gray-600">{perfil?.cargo} • {perfil?.area}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dados Pessoais</h3>
            
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">E-mail</p>
                <p className="font-medium text-gray-900">{perfil?.email}</p>
              </div>
            </div>

            {perfil?.telefone && (
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-gray-900">{perfil.telefone}</p>
                </div>
              </div>
            )}

            {perfil?.cpf && (
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-medium text-gray-900">{perfil.cpf}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dados Profissionais</h3>
            
            <div className="flex items-center gap-3">
              <Briefcase className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Cargo</p>
                <p className="font-medium text-gray-900">{perfil?.cargo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="font-medium text-gray-900">{perfil?.area}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Gestor</p>
                <p className="font-medium text-gray-900">{perfil?.gestorNome}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Data de Admissão</p>
                <p className="font-medium text-gray-900">
                  {perfil?.dataAdmissao ? formatDate(perfil.dataAdmissao) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Solicitar Atualização Cadastral
          </button>
        </div>
      </div>
    </div>
  );
}


