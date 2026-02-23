'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchRhHeadcount } from '@/lib/supabase-queries';
import { Users, TrendingUp, UserMinus, FileText } from 'lucide-react';

export default function RHPainelPage() {
  const [headcount, setHeadcount] = useState<{ ativos?: number; desligados_12m?: number; total_areas?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      fetchRhHeadcount(supabase).then(setHeadcount).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ecosystem-red" />
      </div>
    );
  }

  const cards = [
    { label: 'Headcount ativo', value: headcount?.ativos ?? '—', icon: <Users size={24} /> },
    { label: 'Desligados (12m)', value: headcount?.desligados_12m ?? '—', icon: <UserMinus size={24} /> },
    { label: 'Áreas', value: headcount?.total_areas ?? '—', icon: <TrendingUp size={24} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Painel RH</h1>
        <p className="mt-2 text-gray-300">Visão geral da empresa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-ecosystem-red/20 rounded-lg text-ecosystem-red">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText size={20} /> Módulos
        </h2>
        <p className="text-gray-400 text-sm">
          Absenteísmo, turnover, clima, performance média, recrutamento e documentos pendentes serão exibidos aqui conforme os dados forem integrados.
        </p>
      </div>
    </div>
  );
}
