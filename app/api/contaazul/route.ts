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

    // Verificar se há token manual (para testes) - PRIORIDADE 1
    const manualToken = process.env.CONTA_AZUL_ACCESS_TOKEN;
    
    // Verificar refresh token - PRIORIDADE 2
    const refreshToken = process.env.CONTA_AZUL_REFRESH_TOKEN;
    
    // Verificar Authorization Basic header - PRIORIDADE 3
    const basicAuth = process.env.CONTA_AZUL_BASIC_AUTH;
    
    // Obter credenciais OAuth do ambiente (prioridade para variáveis configuradas no Vercel)
    const clientId = process.env.CONTA_AZUL_CLIENT_ID;
    const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET;
    const username = process.env.CONTA_AZUL_USERNAME;
    const password = process.env.CONTA_AZUL_PASSWORD;

    // Verificar se OAuth está configurado
    const oauthConfigured = clientId && clientSecret && username && password;

    // Log das configurações encontradas
    console.log('🔐 Verificando autenticação Conta Azul:');
    console.log('  - Token manual:', manualToken ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - Refresh token:', refreshToken ? '✅ Configurado' : '❌ Não configurado');
    console.log('  - OAuth completo:', oauthConfigured ? '✅ Configurado' : '❌ Não configurado');
    if (oauthConfigured) {
      console.log('  - Client ID:', clientId.substring(0, 10) + '...');
      console.log('  - Username:', username);
    }

    // Se não houver nenhum método de autenticação configurado
    if (!manualToken && !refreshToken && !oauthConfigured) {
      return NextResponse.json(
        { 
          error: 'Credenciais do Conta Azul não configuradas', 
          ok: false,
          details: 'Configure uma das opções no Vercel: 1) CONTA_AZUL_ACCESS_TOKEN (token manual), 2) CONTA_AZUL_REFRESH_TOKEN + CONTA_AZUL_BASIC_AUTH, 3) CONTA_AZUL_CLIENT_ID + CONTA_AZUL_CLIENT_SECRET + CONTA_AZUL_USERNAME + CONTA_AZUL_PASSWORD (OAuth completo)'
        },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // Obter token de acesso - priorizar token manual, depois refresh_token, depois OAuth
    // Se OAuth está configurado, passa as credenciais (mesmo que undefined, a função vai tentar)
    const accessToken = await getContaAzulAccessToken(
      clientId || '', 
      clientSecret || '', 
      username || undefined, 
      password || undefined,
      manualToken || undefined,
      refreshToken || undefined,
      basicAuth || undefined
    );
    
    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Erro ao obter token de acesso do Conta Azul. Verifique as credenciais e a configuração da aplicação no portal do Conta Azul.', 
          ok: false,
          details: 'A autenticação pode falhar se: 1) As credenciais estão incorretas, 2) A aplicação não está configurada corretamente no portal, 3) O tipo de autenticação não é suportado. Para testes, você pode usar CONTA_AZUL_ACCESS_TOKEN com um token manual gerado no painel.'
        },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

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

