'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Calendar, Wallet, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart, Legend } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContaAzulAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface ContaAzulFinancialSummary {
  overdue: {
    income: number;
    expense: number;
  };
  dueToday: {
    income: number;
    expense: number;
  };
  remainingMonth: {
    income: number;
    expense: number;
  };
}

interface ContaAzulCashFlow {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

interface ContaAzulSalesData {
  date: string;
  amount: number;
}

interface ContaAzulCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  color?: string;
}

export default function ContaAzulDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<ContaAzulCategory[]>([]);
  const [accounts, setAccounts] = useState<ContaAzulAccount[]>([]);
  const [summary, setSummary] = useState<ContaAzulFinancialSummary | null>(null);
  const [cashFlow, setCashFlow] = useState<ContaAzulCashFlow[]>([]);
  const [sales, setSales] = useState<ContaAzulSalesData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = async () => {
    // Helper: tenta API; se 401/500, tenta cache Supabase
    const fetchWithCacheFallback = async (url: string) => {
      const res = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
      const json = await res.json();
      if (json.ok) return { ...json, status: res.status };
      if (res.status === 401 || res.status === 500) {
        const cacheUrl = url.includes('?') ? `${url}&source=cache` : `${url}?source=cache`;
        const cacheRes = await fetch(cacheUrl, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
        const cacheJson = await cacheRes.json();
        if (cacheJson.ok) return { ...cacheJson, status: cacheRes.status, fromCache: true };
      }
      return { ...json, status: res.status };
    };

    try {
      setRefreshing(true);
      setError(null);

      console.log('🔄 Iniciando carregamento de dados do Conta Azul...');

      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const ts = `_=${Date.now()}`;

      // Buscar categorias
      console.log('📊 Buscando categorias...');
      const categoriesData = await fetchWithCacheFallback(`/api/contaazul?type=categories&${ts}`);
      if (categoriesData.ok) {
        setCategories(categoriesData.data || []);
        if (categoriesData.fromCache) console.log('✅ Categorias (cache Supabase)');
      } else if (categoriesData.status === 401) {
        setError('Erro de autenticação (401). Configure CONTA_AZUL_REFRESH_TOKEN no Vercel (recomendado) ou CONTA_AZUL_USERNAME/PASSWORD. Veja VARIAVEIS_CONTA_AZUL.md.');
      }

      // Buscar contas
      const accountsData = await fetchWithCacheFallback(`/api/contaazul?type=accounts&${ts}`);
      if (accountsData.ok) setAccounts(accountsData.data || []);

      // Buscar resumo
      const summaryData = await fetchWithCacheFallback(`/api/contaazul?type=summary&${ts}`);
      if (summaryData.ok) setSummary(summaryData.data);

      // Buscar fluxo de caixa
      const cashFlowData = await fetchWithCacheFallback(
        `/api/contaazul?type=cashflow&startDate=${startDate}&endDate=${endDate}&${ts}`
      );
      if (cashFlowData.ok) setCashFlow(cashFlowData.data || []);

      // Buscar vendas
      const salesData = await fetchWithCacheFallback(
        `/api/contaazul?type=sales&startDate=${startDate}&endDate=${endDate}&${ts}`
      );
      if (salesData.ok) setSales(salesData.data || []);

      // Mensagem de erro só se nada veio da API nem do cache
      const anyOk = categoriesData.ok || accountsData.ok || summaryData.ok || cashFlowData.ok || salesData.ok;
      if (!anyOk && categoriesData.status === 401) {
        setError(
          'Erro de autenticação (401). Configure CONTA_AZUL_REFRESH_TOKEN no Vercel (veja VARIAVEIS_CONTA_AZUL.md) ou CONTA_AZUL_USERNAME e CONTA_AZUL_PASSWORD.'
        );
      } else if (!anyOk) {
        setError(
          `Erro ao carregar dados do Conta Azul. Verifique as credenciais no Vercel. Se já sincronizou antes, os dados em cache (Supabase) serão usados automaticamente.`
        );
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao conectar com a API do Conta Azul');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      router.push('/');
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'gestao') {
        router.push('/');
        return;
      }
    } catch {
      router.push('/');
      return;
    }

    carregarDados();
  }, [router]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !loading) {
        carregarDados();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [loading]);

  // Atualização automática periódica (a cada 5 minutos)
  useEffect(() => {
    if (loading) return;
    
    const interval = setInterval(() => {
      carregarDados();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [loading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalAccounts = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Carregando dados do Conta Azul...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Conta Azul</h1>
          <p className="mt-2 text-gray-300">
            Dados financeiros em tempo real da API do Conta Azul
          </p>
        </div>
        <button
          type="button"
          onClick={carregarDados}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>

      {error && (
        <div className="card-white p-4 bg-red-500/10 border border-red-500/50">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Resumo Financeiro */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-white p-6 border border-green-500/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {formatCurrency(summary.overdue.income)}
              </span>
            </div>
            <p className="text-sm text-gray-300">Receitas Vencidas</p>
          </div>

          <div className="card-white p-6 border border-green-500/50">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                {formatCurrency(summary.dueToday.income)}
              </span>
            </div>
            <p className="text-sm text-gray-300">Vencem Hoje (Receitas)</p>
            <p className="text-xs text-gray-400 mt-1">
              Restante do mês: {formatCurrency(summary.remainingMonth.income)}
            </p>
          </div>

          <div className="card-white p-6 border border-red-500/50">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {formatCurrency(summary.overdue.expense)}
              </span>
            </div>
            <p className="text-sm text-gray-300">Despesas Vencidas</p>
          </div>

          <div className="card-white p-6 border border-red-500/50">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-red-400" />
              <span className="text-2xl font-bold text-red-400">
                {formatCurrency(summary.dueToday.expense)}
              </span>
            </div>
            <p className="text-sm text-gray-300">Vencem Hoje (Despesas)</p>
            <p className="text-xs text-gray-400 mt-1">
              Restante do mês: {formatCurrency(summary.remainingMonth.expense)}
            </p>
          </div>
        </div>
      )}

      {/* Categorias Financeiras */}
      {categories.length > 0 && (
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Categorias Financeiras ({categories.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-3 rounded-md border ${
                  category.type === 'income'
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{category.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {category.type === 'income' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded-full border border-gray-600"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contas Financeiras */}
      {accounts.length > 0 && (
        <div className="card-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Contas Financeiras
          </h2>
          <div className="mb-4">
            <p className="text-sm text-gray-400">Valor total</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalAccounts)}</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center border border-blue-500/50">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{account.name}</p>
                    <p className="text-xs text-gray-400">{account.type}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo de Caixa Diário */}
        {cashFlow.length > 0 && (
          <div className="card-white p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Fluxo de Caixa Diário
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={cashFlow}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#fff', fontSize: 11 }}
                  tickFormatter={(value) => {
                    try {
                      return format(new Date(value), 'dd/MM', { locale: ptBR });
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Saldo"
                />
                <Bar dataKey="income" fill="#10b981" name="Entradas" />
                <Bar dataKey="expense" fill="#ef4444" name="Saídas" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Vendas */}
        {sales.length > 0 && (
          <div className="card-white p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Gráfico de Vendas
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B82F6" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#fff', fontSize: 11 }}
                  tickFormatter={(value) => {
                    try {
                      return format(new Date(value), 'dd/MM', { locale: ptBR });
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis tick={{ fill: '#fff' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#10b981" name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!summary && categories.length === 0 && accounts.length === 0 && cashFlow.length === 0 && sales.length === 0 && !error && (
        <div className="card-white p-12 text-center">
          <p className="text-gray-400 mb-4">
            Nenhum dado disponível. Verifique a conexão com a API do Conta Azul.
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>💡 Configure as 4 variáveis OAuth no Vercel:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-800 px-2 py-1 rounded">CONTA_AZUL_CLIENT_ID</code></li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">CONTA_AZUL_CLIENT_SECRET</code></li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">CONTA_AZUL_USERNAME</code></li>
              <li><code className="bg-gray-800 px-2 py-1 rounded">CONTA_AZUL_PASSWORD</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

