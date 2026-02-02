/**
 * Integração com a API do Conta Azul
 * Documentação: https://developers.contaazul.com/
 */

const CONTA_AZUL_BASE_URL = 'https://api.contaazul.com/v1';
const CONTA_AZUL_AUTH_URL = 'https://auth.contaazul.com/oauth2/token';

export interface ContaAzulTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface ContaAzulAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface ContaAzulTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: {
    id: string;
    name: string;
  };
  account: {
    id: string;
    name: string;
  };
  status: 'paid' | 'pending' | 'overdue';
  due_date?: string;
}

export interface ContaAzulCashFlow {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ContaAzulSalesData {
  date: string;
  amount: number;
  quantity?: number;
}

export interface ContaAzulFinancialSummary {
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

/**
 * Obtém token de acesso usando client credentials (OAuth 2.0)
 */
export async function getContaAzulAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  try {
    // Tentar authorization code flow primeiro (se tiver refresh token)
    // Caso contrário, tentar client credentials
    const response = await fetch(CONTA_AZUL_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'https://contaazul.com',
      }),
    });

    if (!response.ok) {
      // Se authorization_code falhar, tentar client_credentials
      const response2 = await fetch(CONTA_AZUL_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        console.error('Erro ao obter token do Conta Azul:', response2.status, errorText);
        return null;
      }

      const data: ContaAzulTokenResponse = await response2.json();
      return data.access_token;
    }

    const data: ContaAzulTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Erro ao obter token do Conta Azul:', error);
    return null;
  }
}

/**
 * Busca contas financeiras
 */
export async function getContaAzulAccounts(
  accessToken: string
): Promise<ContaAzulAccount[]> {
  try {
    const response = await fetch(`${CONTA_AZUL_BASE_URL}/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro ao buscar contas:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.accounts || [];
  } catch (error) {
    console.error('Erro ao buscar contas do Conta Azul:', error);
    return [];
  }
}

/**
 * Busca transações financeiras
 */
export async function getContaAzulTransactions(
  accessToken: string,
  params?: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    type?: 'income' | 'expense';
    status?: 'paid' | 'pending' | 'overdue';
  }
): Promise<ContaAzulTransaction[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    if (params?.accountId) queryParams.append('account_id', params.accountId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const url = `${CONTA_AZUL_BASE_URL}/transactions?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro ao buscar transações:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error('Erro ao buscar transações do Conta Azul:', error);
    return [];
  }
}

/**
 * Busca resumo financeiro (vencidos, vencem hoje, restante do mês)
 */
export async function getContaAzulFinancialSummary(
  accessToken: string
): Promise<ContaAzulFinancialSummary | null> {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Buscar todas as transações do mês
    const allTransactions = await getContaAzulTransactions(accessToken, {
      startDate,
      endDate,
    });

    // Separar por tipo e status
    const overdueIncome = allTransactions
      .filter(t => t.type === 'income' && t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueExpense = allTransactions
      .filter(t => t.type === 'expense' && t.status === 'overdue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const dueTodayIncome = allTransactions
      .filter(t => t.type === 'income' && t.due_date === todayStr && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const dueTodayExpense = allTransactions
      .filter(t => t.type === 'expense' && t.due_date === todayStr && t.status === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const remainingIncome = allTransactions
      .filter(t => t.type === 'income' && (!t.due_date || t.due_date > todayStr) && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingExpense = allTransactions
      .filter(t => t.type === 'expense' && (!t.due_date || t.due_date > todayStr) && t.status === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      overdue: {
        income: overdueIncome,
        expense: overdueExpense,
      },
      dueToday: {
        income: dueTodayIncome,
        expense: dueTodayExpense,
      },
      remainingMonth: {
        income: remainingIncome,
        expense: remainingExpense,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    return null;
  }
}

/**
 * Busca fluxo de caixa diário
 */
export async function getContaAzulCashFlow(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<ContaAzulCashFlow[]> {
  try {
    const transactions = await getContaAzulTransactions(accessToken, {
      startDate,
      endDate,
    });

    // Agrupar por data
    const byDate: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byDate[date].income += t.amount;
      } else {
        byDate[date].expense += Math.abs(t.amount);
      }
    });

    // Converter para array e calcular saldo acumulado
    const dates = Object.keys(byDate).sort();
    let balance = 0;
    
    return dates.map(date => {
      const { income, expense } = byDate[date];
      balance += income - expense;
      return {
        date,
        income,
        expense,
        balance,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar fluxo de caixa:', error);
    return [];
  }
}

/**
 * Busca dados de vendas
 */
export async function getContaAzulSales(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<ContaAzulSalesData[]> {
  try {
    const transactions = await getContaAzulTransactions(accessToken, {
      startDate,
      endDate,
      type: 'income',
      status: 'paid',
    });

    // Agrupar por data
    const byDate: Record<string, number> = {};
    
    transactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = 0;
      }
      byDate[date] += t.amount;
    });

    return Object.entries(byDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
}

