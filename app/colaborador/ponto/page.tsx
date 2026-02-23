'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistroPonto } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, LogIn, LogOut, Coffee, Calendar } from 'lucide-react';

function mapRowToRegistro(r: Record<string, unknown>): RegistroPonto {
  return {
    id: String(r.id),
    colaboradorId: String(r.colaborador_id),
    data: String(r.data),
    entrada: r.entrada ? String(r.entrada).slice(0, 5) : undefined,
    saida: r.saida ? String(r.saida).slice(0, 5) : undefined,
    entradaAlmoco: r.entrada_almoco ? String(r.entrada_almoco).slice(0, 5) : undefined,
    saidaAlmoco: r.saida_almoco ? String(r.saida_almoco).slice(0, 5) : undefined,
    horasTrabalhadas: r.horas_trabalhadas != null ? Number(r.horas_trabalhadas) : undefined,
    status: (r.status as RegistroPonto['status']) || 'normal',
    aprovado: Boolean(r.aprovado),
  };
}

export default function ColaboradorPontoPage() {
  const router = useRouter();
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [mes, setMes] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState<'entrada' | 'saida' | 'entrada_almoco' | 'saida_almoco' | null>(null);

  const hoje = new Date().toISOString().slice(0, 10);

  const load = async () => {
    const res = await fetch(`/api/ponto?mes=${mes}`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setRegistros(Array.isArray(data) ? data.map((r: Record<string, unknown>) => mapRowToRegistro(r)) : []);
  };

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
    } catch {
      router.push('/');
      return;
    }
    let cancelled = false;
    load().then(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [router, mes]);

  const registrar = async (tipo: 'entrada' | 'saida' | 'entrada_almoco' | 'saida_almoco') => {
    setRegistrando(tipo);
    try {
      const res = await fetch('/api/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, data: hoje }),
        credentials: 'include',
      });
      if (res.ok) {
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 503) {
          alert('Registro de ponto indisponível no momento. Use o modo demonstração ou faça login com Supabase.');
        } else {
          alert(err?.error || 'Erro ao registrar.');
        }
      }
    } catch {
      alert('Erro de conexão.');
    } finally {
      setRegistrando(null);
    }
  };

  const registroHoje = registros.find(r => r.data === hoje);

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
        <h1 className="text-3xl font-bold text-gray-900">Controle de Ponto</h1>
        <p className="mt-1 text-gray-600">Registre sua entrada e saída</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={20} />
          Hoje ({formatDate(hoje)})
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => registrar('entrada')}
            disabled={!!registrando || (!!registroHoje?.entrada && !registroHoje?.saida)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <LogIn size={20} />
            {registrando === 'entrada' ? 'Registrando...' : 'Entrada'}
          </button>
          <button
            onClick={() => registrar('entrada_almoco')}
            disabled={!!registrando}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Coffee size={20} />
            {registrando === 'entrada_almoco' ? '...' : 'Saída almoço'}
          </button>
          <button
            onClick={() => registrar('saida_almoco')}
            disabled={!!registrando}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Coffee size={20} />
            {registrando === 'saida_almoco' ? '...' : 'Retorno almoço'}
          </button>
          <button
            onClick={() => registrar('saida')}
            disabled={!!registrando}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <LogOut size={20} />
            {registrando === 'saida' ? 'Registrando...' : 'Saída'}
          </button>
        </div>
        {registroHoje && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Entrada: {registroHoje.entrada || '-'} &nbsp;|&nbsp;
              Saída almoço: {registroHoje.saidaAlmoco || '-'} &nbsp;|&nbsp;
              Retorno: {registroHoje.entradaAlmoco || '-'} &nbsp;|&nbsp;
              Saída: {registroHoje.saida || '-'}
              {registroHoje.horasTrabalhadas != null && (
                <> &nbsp;|&nbsp; <strong>Horas: {registroHoje.horasTrabalhadas}h</strong></>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={20} />
            Histórico do mês
          </h2>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {registros.length === 0 ? (
          <p className="text-gray-500">Nenhum registro neste mês.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entrada</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saída almoço</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Retorno</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saída</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registros.map((reg) => (
                  <tr key={reg.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatDate(reg.data)}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{reg.entrada || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{reg.saidaAlmoco || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{reg.entradaAlmoco || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{reg.saida || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{reg.horasTrabalhadas != null ? `${reg.horasTrabalhadas}h` : '-'}</td>
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
