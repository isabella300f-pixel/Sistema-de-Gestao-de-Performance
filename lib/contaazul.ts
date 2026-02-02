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
 * Gera Authorization Basic header (base64 de client_id:client_secret)
 */
function getBasicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Obtém token de acesso usando múltiplos métodos OAuth 2.0
 * Tenta: 1) Token manual, 2) Refresh token, 3) Authorization Basic + refresh_token, 4) Password grant, 5) Client credentials
 */
export async function getContaAzulAccessToken(
  clientId: string,
  clientSecret: string,
  username?: string,
  password?: string,
  manualToken?: string,
  refreshToken?: string,
  basicAuth?: string
): Promise<string | null> {
  // MÉTODO 0: Usar token manual se fornecido (para testes)
  if (manualToken) {
    console.log('✅ Usando token manual fornecido');
    return manualToken;
  }

  try {
    // MÉTODO 1: Tentar refresh_token com Authorization Basic (método recomendado para apps de desenvolvimento)
    if (refreshToken) {
      try {
        const authHeader = basicAuth || getBasicAuthHeader(clientId, clientSecret);
        const response = await fetch(CONTA_AZUL_AUTH_URL, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });

        if (response.ok) {
          const data: ContaAzulTokenResponse = await response.json();
          console.log('✅ Token obtido via refresh_token');
          // Armazenar novo refresh_token se fornecido
          if (data.refresh_token) {
            // Em produção, salvar no banco de dados ou cache
            console.log('💾 Novo refresh_token recebido (salve para próximas requisições)');
          }
          return data.access_token;
        } else {
          const errorText = await response.text();
          console.warn('Refresh token falhou:', response.status, errorText);
        }
      } catch (error) {
        console.warn('Erro ao tentar refresh_token:', error);
      }
    }

    // MÉTODO 2: Tentar password grant (username/password)
    // Algumas APIs aceitam Basic + body; outras exigem client_id/client_secret no body também.
    if (username && password && clientId && clientSecret) {
      for (const useBodyCredentials of [false, true]) {
        try {
          console.log('🔄 Tentando password grant (OAuth)...', useBodyCredentials ? '(client_id/secret no body)' : '(só Basic)');
          const authHeader = getBasicAuthHeader(clientId, clientSecret);
          const bodyParams: Record<string, string> = {
            grant_type: 'password',
            username,
            password,
            scope: 'sales financial',
          };
          if (useBodyCredentials) {
            bodyParams.client_id = clientId;
            bodyParams.client_secret = clientSecret;
          }
          const response = await fetch(CONTA_AZUL_AUTH_URL, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body: new URLSearchParams(bodyParams),
          });

          if (response.ok) {
            const data: ContaAzulTokenResponse = await response.json();
            console.log('✅ Token obtido via password grant');
            if (data.refresh_token) {
              console.log('💾 Refresh token recebido. Dica: configure CONTA_AZUL_REFRESH_TOKEN no Vercel.');
            }
            return data.access_token;
          }
          const errorText = await response.text();
          console.warn('❌ Password grant falhou:', response.status, errorText);
          try {
            const errJson = JSON.parse(errorText);
            if (errJson.error === 'invalid_grant' || errJson.error_description?.includes('grant')) {
              console.warn('   → App pode não permitir password grant. Use CONTA_AZUL_REFRESH_TOKEN (veja VARIAVEIS_CONTA_AZUL.md).');
            }
            if (errJson.error === 'invalid_client') {
              console.warn('   → Verifique CONTA_AZUL_CLIENT_SECRET (letra "l" em lefq, ldup, bal4 — não o número 1).');
            }
          } catch (_) {}
          if (useBodyCredentials) break;
        } catch (error) {
          console.warn('❌ Erro password grant:', error);
          if (useBodyCredentials) break;
        }
      }
    }

    // MÉTODO 3: Tentar client_credentials (fallback se password grant falhar)
    if (clientId && clientSecret) {
      try {
        console.log('🔄 Tentando autenticação via client_credentials...');
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
          console.warn('❌ Client credentials falhou:', response.status);
          console.warn('   Resposta:', errorText);
        }
      } catch (error) {
        console.warn('❌ Erro ao tentar client_credentials:', error);
      }
    }

    // Se todos os métodos falharam
    console.error('❌ Todos os métodos de autenticação falharam');
    console.error('💡 Dicas:');
    console.error('   1. Configure CONTA_AZUL_ACCESS_TOKEN (token manual)');
    console.error('   2. Configure CONTA_AZUL_REFRESH_TOKEN (para renovação)');
    console.error('   3. Configure CONTA_AZUL_BASIC_AUTH (Authorization Basic header)');
    console.error('   4. Verifique se as credenciais estão corretas');
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

