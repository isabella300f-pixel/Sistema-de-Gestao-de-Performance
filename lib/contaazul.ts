/**
 * Integração com a API do Conta Azul
 * Documentação: https://developers.contaazul.com/
 */

// URL da API v2 (correta conforme documentação)
const CONTA_AZUL_BASE_URL = 'https://api-v2.contaazul.com/v1';
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

export interface ContaAzulCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string;
  color?: string;
}

/**
 * Obtém token de acesso usando múltiplos métodos OAuth 2.0
 * Tenta: 1) Token manual (variável de ambiente), 2) Password grant, 3) Client credentials, 4) Authorization code
 */
export async function getContaAzulAccessToken(
  clientId: string,
  clientSecret: string,
  username?: string,
  password?: string,
  manualToken?: string
): Promise<string | null> {
  // MÉTODO 0: Usar token manual se fornecido (para testes)
  if (manualToken) {
    console.log('✅ Usando token manual fornecido');
    return manualToken;
  }
  try {
    // MÉTODO 1: Tentar password grant (username/password) - para contas de teste
    if (username && password) {
      try {
        const response = await fetch(CONTA_AZUL_AUTH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: clientId,
            client_secret: clientSecret,
            username: username,
            password: password,
            scope: 'sales financial',
          }),
        });

        if (response.ok) {
          const data: ContaAzulTokenResponse = await response.json();
          console.log('✅ Token obtido via password grant');
          return data.access_token;
        } else {
          const errorText = await response.text();
          console.warn('Password grant falhou:', response.status, errorText);
        }
      } catch (error) {
        console.warn('Erro ao tentar password grant:', error);
      }
    }

    // MÉTODO 2: Tentar client_credentials
    try {
      const response = await fetch(CONTA_AZUL_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'sales financial',
        }),
      });

      if (response.ok) {
        const data: ContaAzulTokenResponse = await response.json();
        console.log('✅ Token obtido via client_credentials');
        return data.access_token;
      } else {
        const errorText = await response.text();
        console.warn('Client credentials falhou:', response.status, errorText);
      }
    } catch (error) {
      console.warn('Erro ao tentar client_credentials:', error);
    }

    // MÉTODO 3: Tentar authorization_code (último recurso)
    try {
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

      if (response.ok) {
        const data: ContaAzulTokenResponse = await response.json();
        console.log('✅ Token obtido via authorization_code');
        return data.access_token;
      } else {
        const errorText = await response.text();
        console.warn('Authorization code falhou:', response.status, errorText);
      }
    } catch (error) {
      console.warn('Erro ao tentar authorization_code:', error);
    }

    // Se todos os métodos falharam
    console.error('❌ Todos os métodos de autenticação falharam');
    return null;
  } catch (error) {
    console.error('Erro ao obter token do Conta Azul:', error);
    return null;
  }
}

/**
 * Busca categorias financeiras (endpoint de teste recomendado)
 */
export async function getContaAzulCategories(
  accessToken: string
): Promise<ContaAzulCategory[]> {
  try {
    const response = await fetch(`${CONTA_AZUL_BASE_URL}/categorias`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao buscar categorias:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    // A API pode retornar um array direto ou um objeto com propriedade 'categories'
    if (Array.isArray(data)) {
      return data;
    }
    return data.categories || data.categorias || [];
  } catch (error) {
    console.error('Erro ao buscar categorias do Conta Azul:', error);
    return [];
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
      const errorText = await response.text();
      console.error('Erro ao buscar contas:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    // A API pode retornar um array direto ou um objeto com propriedade 'accounts'
    if (Array.isArray(data)) {
      return data;
    }
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

