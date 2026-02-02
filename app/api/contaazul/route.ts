import { NextResponse } from 'next/server';
import {
  getContaAzulAccessToken,
  getContaAzulAccounts,
  getContaAzulCategories,
  getContaAzulFinancialSummary,
  getContaAzulCashFlow,
  getContaAzulSales,
} from '@/lib/contaazul';
import {
  syncContaAzulCategories,
  syncContaAzulAccounts,
  syncContaAzulSummary,
  syncContaAzulCashflow,
  syncContaAzulSales,
  getContaAzulCategoriesFromSupabase,
  getContaAzulAccountsFromSupabase,
  getContaAzulSummaryFromSupabase,
  getContaAzulCashflowFromSupabase,
  getContaAzulSalesFromSupabase,
} from '@/lib/contaazul-supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export const maxDuration = 30;

/**
 * GET /api/contaazul
 * Busca dados do Conta Azul (API ou cache Supabase)
 * Query params:
 * - type: 'categories' | 'accounts' | 'summary' | 'cashflow' | 'sales'
 * - startDate: YYYY-MM-DD (para cashflow e sales)
 * - endDate: YYYY-MM-DD (para cashflow e sales)
 * - source: 'api' (padrão) | 'cache' (lê apenas do Supabase)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'categories';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const source = searchParams.get('source') || 'api';

    // Leitura apenas do cache Supabase (sem precisar de credenciais Conta Azul)
    if (source === 'cache') {
      let cacheData: unknown = null;
      if (type === 'categories') cacheData = await getContaAzulCategoriesFromSupabase();
      else if (type === 'accounts') cacheData = await getContaAzulAccountsFromSupabase();
      else if (type === 'summary') cacheData = await getContaAzulSummaryFromSupabase();
      else if (type === 'cashflow' && startDate && endDate) cacheData = await getContaAzulCashflowFromSupabase(startDate, endDate);
      else if (type === 'sales' && startDate && endDate) cacheData = await getContaAzulSalesFromSupabase(startDate, endDate);
      // Sempre 200: dados vazios quando não há cache (evita 404 e dashboard trata como "sem dados")
      const data = cacheData ?? (type === 'summary' ? null : []);
      return NextResponse.json({ data, ok: true, fromCache: true, empty: cacheData == null }, { headers: NO_CACHE_HEADERS });
    }

    // Credenciais OAuth: client_id + client_secret são obrigatórios
    const clientId = process.env.CONTA_AZUL_CLIENT_ID;
    const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET;
    const username = process.env.CONTA_AZUL_USERNAME;
    const password = process.env.CONTA_AZUL_PASSWORD;
    // Refresh Token (recomendado para app de desenvolvimento Conta Azul)
    const refreshToken = process.env.CONTA_AZUL_REFRESH_TOKEN;
    const basicAuth = process.env.CONTA_AZUL_BASIC_AUTH;
    // Token manual (opcional, para testes)
    const manualToken = process.env.CONTA_AZUL_ACCESS_TOKEN;

    const hasRefresh = !!(clientId && clientSecret && refreshToken);
    const hasPassword = !!(clientId && clientSecret && username && password);
    const hasManual = !!manualToken;

    console.log('🔐 Verificando autenticação Conta Azul:');
    console.log('  - CONTA_AZUL_CLIENT_ID:', clientId ? '✅' : '❌');
    console.log('  - CONTA_AZUL_CLIENT_SECRET:', clientSecret ? '✅' : '❌');
    console.log('  - CONTA_AZUL_REFRESH_TOKEN:', refreshToken ? '✅' : '❌');
    console.log('  - CONTA_AZUL_USERNAME:', username ? '✅' : '❌');
    console.log('  - CONTA_AZUL_PASSWORD:', password ? '✅' : '❌');
    console.log('  - CONTA_AZUL_ACCESS_TOKEN (manual):', manualToken ? '✅' : '❌');

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: 'Credenciais Conta Azul incompletas',
          ok: false,
          details: 'Configure no Vercel: CONTA_AZUL_CLIENT_ID e CONTA_AZUL_CLIENT_SECRET. Para obter dados, use CONTA_AZUL_REFRESH_TOKEN (recomendado) ou CONTA_AZUL_USERNAME + CONTA_AZUL_PASSWORD. Veja VARIAVEIS_CONTA_AZUL.md.'
        },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    if (!hasManual && !hasRefresh && !hasPassword) {
      return NextResponse.json(
        {
          error: 'Nenhum método de autenticação configurado',
          ok: false,
          details: 'Configure CONTA_AZUL_REFRESH_TOKEN (recomendado para app de desenvolvimento) OU CONTA_AZUL_USERNAME + CONTA_AZUL_PASSWORD. Veja VARIAVEIS_CONTA_AZUL.md.'
        },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // Ordem: 1) token manual, 2) refresh_token (recomendado Conta Azul), 3) password grant
    console.log('🔄 Obtendo token de acesso...');
    const accessToken = await getContaAzulAccessToken(
      clientId,
      clientSecret,
      username || undefined,
      password || undefined,
      manualToken || undefined,
      refreshToken || undefined,
      basicAuth || undefined
    );

    if (!accessToken) {
      console.error('❌ Falha na autenticação');
      return NextResponse.json(
        {
          error: 'Erro ao obter token de acesso.',
          ok: false,
          details: 'Se usar REFRESH_TOKEN: gere um refresh_token pelo fluxo OAuth (autorize no navegador e troque o code por tokens). Se usar USERNAME/PASSWORD: confira se a aplicação permite password grant. Veja VARIAVEIS_CONTA_AZUL.md.'
        },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }
    
    console.log('✅ Token OAuth obtido com sucesso!');

    let data: unknown;
    let syncedToSupabase = false;

    switch (type) {
      case 'categories': {
        const categories = await getContaAzulCategories(accessToken);
        data = categories;
        const sync = await syncContaAzulCategories(categories);
        if (sync.ok) syncedToSupabase = true; else console.warn('Sync categories:', sync.error);
        break;
      }

      case 'accounts': {
        const accounts = await getContaAzulAccounts(accessToken);
        data = accounts;
        const sync = await syncContaAzulAccounts(accounts);
        if (sync.ok) syncedToSupabase = true; else console.warn('Sync accounts:', sync.error);
        break;
      }

      case 'summary': {
        const summary = await getContaAzulFinancialSummary(accessToken);
        data = summary;
        if (summary) {
          const sync = await syncContaAzulSummary(summary);
          if (sync.ok) syncedToSupabase = true; else console.warn('Sync summary:', sync.error);
        }
        break;
      }

      case 'cashflow':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate e endDate são obrigatórios para cashflow', ok: false },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        {
          const cashflow = await getContaAzulCashFlow(accessToken, startDate, endDate);
          data = cashflow;
          const sync = await syncContaAzulCashflow(cashflow, startDate, endDate);
          if (sync.ok) syncedToSupabase = true; else console.warn('Sync cashflow:', sync.error);
        }
        break;

      case 'sales':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate e endDate são obrigatórios para sales', ok: false },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        {
          const sales = await getContaAzulSales(accessToken, startDate, endDate);
          data = sales;
          const sync = await syncContaAzulSales(sales, startDate, endDate);
          if (sync.ok) syncedToSupabase = true; else console.warn('Sync sales:', sync.error);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: categories, accounts, summary, cashflow ou sales', ok: false },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
    }

    return NextResponse.json({ data, ok: true, syncedToSupabase }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erro ao buscar dados do Conta Azul:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do Conta Azul', ok: false },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

