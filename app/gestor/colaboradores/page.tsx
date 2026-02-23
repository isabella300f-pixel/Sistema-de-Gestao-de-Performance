'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Colaborador } from '@/types';
import { getColaboradoresByGestor, getUserById } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { fetchColaboradoresByGestor, type ColaboradorRow } from '@/lib/supabase-queries';
import { Users } from 'lucide-react';

function rowToColab(r: ColaboradorRow): Colaborador {
  return {
    id: r.id,
    name: r.nome,
    email: r.email ?? undefined,
    cargo: r.cargo_nome ?? '',
    area: r.area,
    gestorId: r.gestor_id ?? '',
    gestorNome: r.gestor_nome ?? '',
    dataAdmissao: r.data_admissao,
    dataDesligamento: r.data_desligamento ?? undefined,
    status: r.status as 'ativo' | 'desligado',
  };
}

export default function ColaboradoresPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then(async (u) => {
      if (!u || u.role !== 'gestor') {
        router.replace('/');
        return;
      }
      const supabase = createClient();
      if (supabase) {
        const rows = await fetchColaboradoresByGestor(supabase, u.id);
        if (!cancelled) setColaboradores(rows.map(rowToColab));
      } else {
        const gestor = getUserById(u.id);
        const cols = gestor ? getColaboradoresByGestor(gestor.id) : [];
        if (!cancelled) setColaboradores(cols);
      }
      if (!cancelled) setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [router]);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Meus Colaboradores</h1>
        <p className="mt-2 text-gray-300">Gerencie e acompanhe seus colaboradores</p>
      </div>

      <div className="card-white">
        <div className="card-white-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lista de Colaboradores</h2>
            <span className="text-sm text-gray-300">{colaboradores.length} colaboradores</span>
          </div>
        </div>
        <div className="divide-y divide-blue-500/30">
          {colaboradores.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p>Nenhum colaborador encontrado</p>
            </div>
          ) : (
            colaboradores.map((colab) => (
              <div key={colab.id} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{colab.name}</h3>
                    <p className="mt-1 text-sm text-gray-300">{colab.cargo} • {colab.area}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Admissão: {new Date(colab.dataAdmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/gestor/colaboradores/${colab.id}`}
                      className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-md border border-blue-500/50"
                    >
                      Ver Histórico
                    </Link>
                    <Link
                      href={`/gestor/registrar?colaborador=${colab.id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Novo 1:1
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

