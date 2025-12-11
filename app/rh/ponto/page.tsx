'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Colaborador, RegistroPonto, Escala } from '@/types';
import { getAllColaboradores } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';

export default function RHPontoPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [view, setView] = useState<'espelho' | 'escalas' | 'banco-horas' | 'inconsistencias'>('espelho');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<string>('');
  const [mes, setMes] = useState<string>(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

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

      const cols = getAllColaboradores().filter(c => c.status === 'ativo');
      setColaboradores(cols);
      
      // Simular registros de ponto
      const registrosSimulados: RegistroPonto[] = [];
      cols.forEach(colab => {
        for (let i = 1; i <= 30; i++) {
          const data = new Date(2024, 0, i);
          if (data.getDay() !== 0 && data.getDay() !== 6) { // Apenas dias úteis
            registrosSimulados.push({
              id: `${colab.id}-${i}`,
              colaboradorId: colab.id,
              data: data.toISOString().split('T')[0],
              entrada: '08:00',
              saida: '17:00',
              entradaAlmoco: '12:00',
              saidaAlmoco: '13:00',
              horasTrabalhadas: 8,
              horasExtras: i % 7 === 0 ? 2 : 0,
              status: i % 10 === 0 ? 'atraso' : 'normal',
              aprovado: true,
            });
          }
        }
      });
      setRegistros(registrosSimulados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const registrosFiltrados = registros.filter(r => {
    const matchColab = colaboradorSelecionado === '' || r.colaboradorId === colaboradorSelecionado;
    const matchMes = r.data.startsWith(mes);
    return matchColab && matchMes;
  });

  const colaborador = colaboradores.find(c => c.id === colaboradorSelecionado);

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
      <div>
        <h1 className="text-3xl font-bold text-white">Controle de Jornada e Ponto</h1>
        <p className="mt-2 text-gray-300">Gestão completa de ponto, escalas e banco de horas</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setView('espelho')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'espelho' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Espelho de Ponto
        </button>
        <button
          onClick={() => setView('escalas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'escalas' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Escalas e Turnos
        </button>
        <button
          onClick={() => setView('banco-horas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'banco-horas' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Banco de Horas
        </button>
        <button
          onClick={() => setView('inconsistencias')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'inconsistencias' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Inconsistências
        </button>
      </div>

      {view === 'espelho' && (
        <div className="space-y-4">
          <div className="card-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Colaborador</label>
                <select
                  value={colaboradorSelecionado}
                  onChange={(e) => setColaboradorSelecionado(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="" className="bg-gray-800">Todos</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id} className="bg-gray-800">{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mês</label>
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-blue-500/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {colaborador && (
            <div className="card-white p-6">
              <h2 className="text-xl font-bold text-white mb-4">Espelho de Ponto - {colaborador.name}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-500/30">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Entrada</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Saída Almoço</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Retorno</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Saída</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Horas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/30">
                    {registrosFiltrados.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{formatDate(reg.data)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.entrada || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.saidaAlmoco || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.entradaAlmoco || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.saida || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{reg.horasTrabalhadas || 0}h</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            reg.status === 'normal' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            reg.status === 'atraso' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            'bg-red-500/20 text-red-400 border-red-500/50'
                          }`}>
                            {reg.status === 'normal' ? <CheckCircle size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'escalas' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Escalas e Turnos</h2>
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Gestão de escalas em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'banco-horas' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Banco de Horas</h2>
          <div className="text-center py-12 text-gray-400">
            <Clock size={48} className="mx-auto mb-4 text-gray-500" />
            <p>Gestão de banco de horas em desenvolvimento</p>
          </div>
        </div>
      )}

      {view === 'inconsistencias' && (
        <div className="card-white p-6">
          <h2 className="text-xl font-bold text-white mb-4">Inconsistências</h2>
          <div className="space-y-4">
            {registros.filter(r => r.status !== 'normal').map(reg => {
              const colab = colaboradores.find(c => c.id === reg.colaboradorId);
              return (
                <div key={reg.id} className="border border-yellow-500/50 rounded-lg p-4 bg-yellow-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{colab?.name}</p>
                      <p className="text-sm text-gray-400">{formatDate(reg.data)} - {reg.status}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Ajustar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
