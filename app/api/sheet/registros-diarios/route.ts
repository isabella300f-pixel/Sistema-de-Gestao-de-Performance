import { NextResponse } from 'next/server';
import { SHEET_CSV_URL, parseSheetCSV, parseSheetValuesFromApi } from '@/lib/sheet';

/** Garante que a rota sempre busque dados frescos (sem cache estático do Next.js/Vercel). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const;

const FETCH_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (compatible; SheetsSync/1.0)',
} as const;

/**
 * GET /api/sheet/registros-diarios
 * Busca os dados atualizados da planilha.
 * Prioridade: 1) Google Sheets API v4 (se API_KEY + SPREADSHEET_ID configurados) 2) URL publicada
 */
export const maxDuration = 30;

async function fetchViaApi(): Promise<{ data: unknown[]; ok: boolean } | null> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.SPREADSHEET_ID;
  const range = process.env.SHEET_RANGE || 'A:Z';
  if (!apiKey || !sheetId) return null;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}?key=${encodeURIComponent(apiKey)}&valueRenderOption=FORMATTED_VALUE`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const json = await res.json();
    const values = json?.values as string[][] | undefined;
    if (!Array.isArray(values) || values.length < 2) return null;
    const data = parseSheetValuesFromApi(values);
    return { data, ok: data.length > 0 };
  } catch {
    return null;
  }
}

async function fetchViaPublishedUrl(bust: string): Promise<{ data: unknown[]; ok: boolean } | null> {
  try {
    const url = `${SHEET_CSV_URL}${SHEET_CSV_URL.includes('?') ? '&' : '?'}_=${bust}&t=${bust}`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: FETCH_HEADERS,
      next: { revalidate: 0 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const csv = await res.text();
    const data = parseSheetCSV(csv);
    return { data, ok: data.length > 0 };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bust = searchParams.get('_') || String(Date.now());

    let result = await fetchViaApi();
    if (!result) result = await fetchViaPublishedUrl(bust);

    if (result?.ok && Array.isArray(result.data) && result.data.length > 0) {
      return NextResponse.json({ data: result.data, ok: true }, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(
      { data: [], error: 'Planilha indisponível ou sem dados', ok: false },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (e) {
    console.error('Erro ao buscar planilha:', e);
    return NextResponse.json(
      { error: 'Erro ao sincronizar com a planilha', ok: false },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
