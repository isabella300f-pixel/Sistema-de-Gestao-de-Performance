import { NextResponse } from 'next/server';
import {
  getContaAzulAccessToken,
  getContaAzulAccounts,
  getContaAzulCategories,
  getContaAzulFinancialSummary,
  getContaAzulCashFlow,
  getContaAzulSales,
} from '@/lib/contaazul';

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
 * Busca dados do Conta Azul
 * Query params:
 * - type: 'categories' | 'accounts' | 'summary' | 'cashflow' | 'sales'
 * - startDate: YYYY-MM-DD (para cashflow e sales)
 * - endDate: YYYY-MM-DD (para cashflow e sales)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'categories';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Obter credenciais OAuth do ambiente (as 4 variáveis que você configurou no Vercel)
    const clientId = process.env.CONTA_AZUL_CLIENT_ID;
    const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET;
    const username = process.env.CONTA_AZUL_USERNAME;
    const password = process.env.CONTA_AZUL_PASSWORD;

    // Verificar se todas as 4 variáveis OAuth estão configuradas
    const oauthConfigured = clientId && clientSecret && username && password;

    // Log das configurações encontradas
    console.log('🔐 Verificando autenticação Conta Azul (OAuth):');
    console.log('  - CONTA_AZUL_CLIENT_ID:', clientId ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - CONTA_AZUL_CLIENT_SECRET:', clientSecret ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - CONTA_AZUL_USERNAME:', username ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - CONTA_AZUL_PASSWORD:', password ? '✅ Configurado' : '❌ Não configurado');
    
    if (oauthConfigured) {
      console.log('  - Client ID:', clientId.substring(0, 15) + '...');
      console.log('  - Username:', username);
    }

    // Se OAuth não estiver completamente configurado
    if (!oauthConfigured) {
      const missing = [];
      if (!clientId) missing.push('CONTA_AZUL_CLIENT_ID');
      if (!clientSecret) missing.push('CONTA_AZUL_CLIENT_SECRET');
      if (!username) missing.push('CONTA_AZUL_USERNAME');
      if (!password) missing.push('CONTA_AZUL_PASSWORD');
      
      return NextResponse.json(
        { 
          error: 'Credenciais OAuth do Conta Azul não configuradas completamente', 
          ok: false,
          details: `Configure as 4 variáveis no Vercel: CONTA_AZUL_CLIENT_ID, CONTA_AZUL_CLIENT_SECRET, CONTA_AZUL_USERNAME, CONTA_AZUL_PASSWORD. Variáveis faltando: ${missing.join(', ')}`
        },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // Obter token de acesso usando OAuth (password grant)
    console.log('🔄 Iniciando autenticação OAuth...');
    const accessToken = await getContaAzulAccessToken(
      clientId, 
      clientSecret, 
      username, 
      password,
      undefined, // não usar token manual
      undefined, // não usar refresh token
      undefined  // não usar basic auth
    );
    
    if (!accessToken) {
      console.error('❌ Falha na autenticação OAuth');
      return NextResponse.json(
        { 
          error: 'Erro ao obter token de acesso via OAuth. Verifique se as credenciais estão corretas no Vercel.', 
          ok: false,
          details: 'Verifique: 1) Se as 4 variáveis estão configuradas corretamente no Vercel, 2) Se os valores estão corretos (sem espaços extras), 3) Se a aplicação está configurada no portal do Conta Azul. Veja os logs do servidor para mais detalhes.'
        },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }
    
    console.log('✅ Token OAuth obtido com sucesso!');

    let data: unknown;

    switch (type) {
      case 'categories':
        data = await getContaAzulCategories(accessToken);
        break;

      case 'accounts':
        data = await getContaAzulAccounts(accessToken);
        break;

      case 'summary':
        data = await getContaAzulFinancialSummary(accessToken);
        break;

      case 'cashflow':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate e endDate são obrigatórios para cashflow', ok: false },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        data = await getContaAzulCashFlow(accessToken, startDate, endDate);
        break;

      case 'sales':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate e endDate são obrigatórios para sales', ok: false },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        data = await getContaAzulSales(accessToken, startDate, endDate);
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: categories, accounts, summary, cashflow ou sales', ok: false },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
    }

    return NextResponse.json({ data, ok: true }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erro ao buscar dados do Conta Azul:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do Conta Azul', ok: false },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

