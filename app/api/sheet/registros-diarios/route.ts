import { NextResponse } from 'next/server';
import { SHEET_CSV_URL, parseSheetCSV } from '@/lib/sheet';

/**
 * GET /api/sheet/registros-diarios
 * Busca os dados atualizados da planilha Google Sheets publicada.
 * Chamado ao carregar/atualizar o dashboard e a pesquisa de registros diários.
 */
export async function GET() {
  try {
    const res = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 0 },
      headers: { 'Cache-Control': 'no-store' },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Falha ao buscar planilha', status: res.status },
        { status: 502 }
      );
    }
    const csv = await res.text();
    const data = parseSheetCSV(csv);
    return NextResponse.json({ data, ok: true });
  } catch (e) {
    console.error('Erro ao buscar planilha:', e);
    return NextResponse.json(
      { error: 'Erro ao sincronizar com a planilha', ok: false },
      { status: 500 }
    );
  }
}
