import { NextResponse } from 'next/server';
import { SHEET_CSV_URL, parseSheetCSV } from '@/lib/sheet';

/** Garante que a rota sempre busque dados frescos (sem cache estático do Next.js/Vercel). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const;

/**
 * GET /api/sheet/registros-diarios
 * Busca os dados atualizados da planilha Google Sheets publicada.
 * Chamado ao carregar/atualizar o dashboard e a pesquisa de registros diários.
 */
export async function GET() {
  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}_=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-store' },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Falha ao buscar planilha', status: res.status },
        { status: 502, headers: NO_CACHE_HEADERS }
      );
    }
    const csv = await res.text();
    const data = parseSheetCSV(csv);
    return NextResponse.json({ data, ok: true }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error('Erro ao buscar planilha:', e);
    return NextResponse.json(
      { error: 'Erro ao sincronizar com a planilha', ok: false },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
