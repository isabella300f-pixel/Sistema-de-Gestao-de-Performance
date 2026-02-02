import { NextResponse } from 'next/server';
import { SHEET_CSV_URL, parseSheetCSV, parseSheetValuesFromApi, extractDataFromRow } from '@/lib/sheet';
import type { SheetRowRaw } from '@/lib/sheet';
import { getSupabaseServer } from '@/lib/supabase';

/** Garante que a rota sempre busque dados frescos (sem cache estático do Next.js/Vercel). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

const FETCH_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (compatible; SheetsSync/1.0)',
} as const;

/**
 * GET /api/sheet/registros-diarios
 * Busca os dados atualizados da planilha — sempre dinâmico, sem cache.
 * Retorna exatamente o que está na planilha; sem dados inventados.
 * Prioridade: 1) Google Sheets API v4 (se configurado) 2) URL publicada (CSV).
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

/** Converte uma linha da planilha (SheetRowRaw) para o formato da tabela registros_diarios no Supabase */
function sheetRowToSupabaseRow(row: SheetRowRaw): Record<string, unknown> | null {
  const rowAny = row as Record<string, unknown>;
  const nome = String(row.vendedor ?? rowAny.Vendedor ?? rowAny.vendedor ?? '').trim();
  const dataStr = extractDataFromRow(row);
  if (!dataStr) return null;
  const num = (v: unknown) => (v !== undefined && v !== null && v !== '' ? Number(String(v).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '')) : 0) || 0;
  const desq = row.desqualificados ?? rowAny.desqualificados;
  const desqBool = desq === 'sim' || desq === 's' || desq === 1 || desq === '1' || String(desq).toLowerCase() === 'true';
  return {
    carimbo_data_hora: (row.carimbo ?? rowAny.carimbo ?? null) as string | null,
    data: dataStr,
    dia_semana: (row.diaSemana ?? rowAny.dia_semana ?? '').toString().trim() || null,
    numero_ligacoes: num(row.ligacoes ?? rowAny.ligacoes),
    numero_ligacoes_atendidas: num(row.atendidas ?? rowAny.atendidas),
    numero_aberturas: num(row.aberturas ?? rowAny.aberturas),
    algum_desqualificado: desqBool,
    numero_formularios: num(row.formularios ?? rowAny.formularios),
    numero_onlines: num(row.onlines ?? rowAny.onlines),
    vendedor: nome || null,
    numero_calls_agendadas: num(row.callsAgendadas ?? rowAny.callsAgendadas),
    numero_calls_realizadas: num(row.callsRealizadas ?? rowAny.callsRealizadas),
    numero_testes_vocacionais: num(row.testesVocacionais ?? rowAny.testesVocacionais),
    numero_diagnosticos: num(row.diagnosticos ?? rowAny.diagnosticos),
    avaliacao_performance: (row.avaliacaoPerformance ?? rowAny.avaliacaoPerformance ?? '').toString().trim() || null,
    sugestao_melhoria: (row.sugestaoMelhoria ?? rowAny.sugestaoMelhoria ?? '').toString().trim() || null,
    meta_proximo_dia: (row.metaProximoDia ?? rowAny.metaProximoDia ?? '').toString().trim() || null,
    etapa_funil_foco: (row.etapaFunilFoco ?? rowAny.etapaFunilFoco ?? '').toString().trim() || null,
    colaborador_id: null,
  };
}

/** Sincroniza dados da planilha para a tabela registros_diarios no Supabase (substitui tudo) */
async function syncSheetToSupabase(rows: SheetRowRaw[]): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) {
    console.warn('Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)');
    return { ok: false, count: 0 };
  }
  const mapped = rows.map((row) => sheetRowToSupabaseRow(row)).filter((r): r is Record<string, unknown> => r != null);
  if (mapped.length === 0) return { ok: true, count: 0 };
  try {
    const { error: delError } = await supabase.from('registros_diarios').delete().not('id', 'is', null);
    if (delError) console.warn('Supabase delete (replace all):', delError.message);
    const { data: inserted, error: insertError } = await supabase.from('registros_diarios').insert(mapped).select('id');
    if (insertError) {
      console.error('Supabase insert:', insertError);
      return { ok: false, count: 0, error: insertError.message };
    }
    console.log('Supabase sync:', inserted?.length ?? 0, 'registros inseridos');
    return { ok: true, count: inserted?.length ?? mapped.length };
  } catch (e) {
    console.error('Erro ao sincronizar com Supabase:', e);
    return { ok: false, count: 0, error: String(e) };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bust = searchParams.get('_') || String(Date.now());

    let result = await fetchViaApi();
    if (!result) result = await fetchViaPublishedUrl(bust);

    if (result?.ok && Array.isArray(result.data) && result.data.length > 0) {
      const rows = result.data as SheetRowRaw[];
      const syncResult = await syncSheetToSupabase(rows);
      if (syncResult.error) console.warn('Sync Supabase:', syncResult.error);
      return NextResponse.json(
        { data: result.data, ok: true, supabaseSynced: syncResult.ok, supabaseCount: syncResult.count },
        { headers: NO_CACHE_HEADERS }
      );
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
