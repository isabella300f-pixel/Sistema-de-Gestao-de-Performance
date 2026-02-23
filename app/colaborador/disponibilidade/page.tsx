'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Disponibilidade } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

function mapRowToDisp(r: Record<string, unknown>): Disponibilidade {
  return {
    id: String(r.id),
    colaboradorId: String(r.colaborador_id),
    tipo: (r.tipo as Disponibilidade['tipo']) || 'indisponibilidade_futura',
    dataInicio: String(r.data_inicio),
    dataFim: r.data_fim ? String(r.data_fim) : undefined,
    horarios: r.horarios ? String(r.horarios) : undefined,
    motivo: String(r.motivo),
    status: (r.status as Disponibilidade['status']) || 'pendente',
    dataCriacao: String(r.criado_em),
  };
}

export default function ColaboradorDisponibilidadePage() {
  const router = useRouter();
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tipo: 'indisponibilidade_futura', data_inicio: '', data_fim: '', horarios: '', motivo: '' });

  const load = async (): Promise<boolean> => {
    const res = await fetch('/api/disponibilidade', { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    setDisponibilidades(Array.isArray(data) ? data.map((r: Record<string, unknown>) => mapRowToDisp(r)) : []);
    return true;
  };

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
        if (currentUser.role !== 'colaborador') {
          router.push('/');
          return;
        }
        const ok = await load();
        if (!cancelled && !ok) {
          setDisponibilidades([
            { id: '1', colaboradorId: currentUser.id, tipo: 'indisponibilidade_futura', dataInicio: '2024-12-25', dataFim: '2024-12-26', motivo: 'Feriado de Natal', status: 'aprovado', dataCriacao: '2024-12-01' },
          ]);
        }
      } catch {
        if (!cancelled) {
          const currentUser = JSON.parse(currentUserStr || '{}');
          setDisponibilidades([
            { id: '1', colaboradorId: currentUser.id || 'colab-1', tipo: 'indisponibilidade_futura', dataInicio: '2024-12-25', dataFim: '2024-12-26', motivo: 'Feriado de Natal', status: 'aprovado', dataCriacao: '2024-12-01' },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.motivo.trim() || !form.data_inicio) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/disponibilidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim || undefined,
          horarios: form.horarios || undefined,
          motivo: form.motivo.trim(),
        }),
        credentials: 'include',
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ tipo: 'indisponibilidade_futura', data_inicio: '', data_fim: '', horarios: '', motivo: '' });
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status !== 401 && res.status !== 503) alert(err?.error || 'Erro ao criar.');
      }
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disponibilidade e Agenda</h1>
          <p className="mt-1 text-gray-600">Gerencie sua disponibilidade e solicite ajustes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Nova Solicitação
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nova disponibilidade / indisponibilidade</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="indisponibilidade_futura">Indisponibilidade futura</option>
                <option value="impossibilidade_dia">Impossibilidade em dia</option>
                <option value="troca_turno">Troca de turno</option>
                <option value="ajuste_rotina">Ajuste de rotina</option>
                <option value="horarios_disponiveis">Horários disponíveis</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data início *</label>
                <input type="date" value={form.data_inicio} onChange={(e) => setForm(f => ({ ...f, data_inicio: e.target.value }))} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data fim</label>
                <input type="date" value={form.data_fim} onChange={(e) => setForm(f => ({ ...f, data_fim: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horários (ex.: 08:00-12:00)</label>
              <input type="text" value={form.horarios} onChange={(e) => setForm(f => ({ ...f, horarios: e.target.value }))} placeholder="Opcional" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
              <textarea value={form.motivo} onChange={(e) => setForm(f => ({ ...f, motivo: e.target.value }))} required rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Descreva o motivo" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Indisponibilidades Futuras</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {disponibilidades.filter(d => d.tipo === 'indisponibilidade_futura').length}
              </p>
            </div>
            <Calendar className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Solicitações Pendentes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {disponibilidades.filter(d => d.status === 'pendente').length}
              </p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {disponibilidades.filter(d => d.status === 'aprovado').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Minhas Solicitações</h2>
        <div className="space-y-4">
          {disponibilidades.map((disp) => (
            <div key={disp.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{disp.motivo}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(disp.dataInicio)}
                    {disp.dataFim && ` até ${formatDate(disp.dataFim)}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  disp.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                  disp.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {disp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


