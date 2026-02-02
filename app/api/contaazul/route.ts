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

    // Verificar se há token manual (para testes)
    const manualToken = process.env.CONTA_AZUL_ACCESS_TOKEN;
    
    // Obter credenciais do ambiente
    const clientId = process.env.CONTA_AZUL_CLIENT_ID || '13i92mrduirpqcdctqp9q1vr9c';
    const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET || '3cufa5ee3ltuo8mtkiotn82r32k38atb21mhud1orfphtvh2mep';
    // Credenciais de teste do ERP (username/password)
    const username = process.env.CONTA_AZUL_USERNAME || 'a948e6e2-47da-410e-9646-0019c66f1503@devportal.com';
    const password = process.env.CONTA_AZUL_PASSWORD || 'a948e6e2-47da-410e-9646-0019c66f1503';

    // Se não houver token manual, precisa das credenciais
    if (!manualToken && (!clientId || !clientSecret)) {
      return NextResponse.json(
        { error: 'Credenciais do Conta Azul não configuradas. Configure CONTA_AZUL_ACCESS_TOKEN (token manual) ou CONTA_AZUL_CLIENT_ID e CONTA_AZUL_CLIENT_SECRET', ok: false },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // Obter token de acesso - priorizar token manual, depois tentar OAuth
    const accessToken = await getContaAzulAccessToken(
      clientId, 
      clientSecret, 
      username, 
      password,
      manualToken || undefined
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

