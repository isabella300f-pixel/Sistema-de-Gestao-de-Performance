'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Calendar, Search } from 'lucide-react';

interface DispRow {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  tipo: string;
  dataInicio: string;
  dataFim?: string;
  horarios?: string;
  motivo: string;
  status: string;
  dataCriacao: string;
}

function mapRow(r: Record<string, unknown> & { colaboradores?: { nome?: string } }): DispRow {
  return {
    id: String(r.id),
    colaboradorId: String(r.colaborador_id),
    colaboradorNome: r.colaboradores?.nome,
    tipo: String(r.tipo),
    dataInicio: String(r.data_inicio),
    dataFim: r.data_fim ? String(r.data_fim) : undefined,
    horarios: r.horarios ? String(r.horarios) : undefined,
    motivo: String(r.motivo),
    status: String(r.status),
    dataCriacao: String(r.criado_em),
  };
}

const tipoLabel: Record<string, string> = {
  indisponibilidade_futura: 'Indisponibilidade futura',
  impossibilidade_dia: 'Impossibilidade em dia',
  troca_turno: 'Troca de turno',
  ajuste_rotina: 'Ajuste de rotina',
  horarios_disponiveis: 'Horários disponíveis',
};

export default function RHDisponibilidadePage() {
  const router = useRouter();
  const [list, setList] = useState<DispRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.role !== 'rh') {
          router.push('/');
          return;
        }
        const res = await fetch('/api/disponibilidade', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setList(Array.isArray(data) ? data.map((r: Record<string, unknown>) => mapRow(r)) : []);
        }
      } catch {
        setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const filtradas = list.filter(d => {
    const nome = (d.colaboradorNome || '').toLowerCase();
    const motivo = (d.motivo || '').toLowerCase();
    return !busca || nome.includes(busca.toLowerCase()) || motivo.includes(busca.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disponibilidade dos Colaboradores</h1>
        <p className="mt-1 text-gray-600">Visualize dias e horários informados pelos colaboradores</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por nome ou motivo</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome ou motivo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filtradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Nenhum registro de disponibilidade encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colaborador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horários</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtradas.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{d.colaboradorNome || d.colaboradorId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tipoLabel[d.tipo] || d.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(d.dataInicio)}{d.dataFim ? ` a ${formatDate(d.dataFim)}` : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.horarios || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.motivo}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        d.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                        d.status === 'rejeitado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
