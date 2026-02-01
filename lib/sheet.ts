import type { RegistroDiario } from '@/types';

/**
 * Utilitários para sincronizar com a planilha Google Sheets publicada.
 * URL da planilha publicada (export CSV):
 * https://docs.google.com/spreadsheets/d/e/2PACX-1vSzxCdngLexHYSEYbB1nsKqdYMzRmAAj0uamu1m92Ah--O-KfG53y1fD421oxroXYWeGbOJ23zBrXtw/pub?output=csv&gid=57736896
 */

export const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzxCdngLexHYSEYbB1nsKqdYMzRmAAj0uamu1m92Ah--O-KfG53y1fD421oxroXYWeGbOJ23zBrXtw/pub?output=csv&gid=57736896';

export interface SheetRowRaw {
  data?: string;
  carimbo?: string; // Carimbo de data/hora (fallback para data)
  diaSemana?: string;
  vendedor?: string;
  ligacoes?: number;
  atendidas?: number;
  aberturas?: number;
  desqualificados?: number;
  formularios?: number;
  onlines?: number;
  callsAgendadas?: number;
  callsRealizadas?: number;
}

const HEADER_ALIASES: Record<string, keyof SheetRowRaw> = {
  data: 'data',
  'carimbo de data/hora': 'carimbo',
  'carimbo de data': 'carimbo',
  'dia da semana': 'diaSemana',
  'dia da semana ': 'diaSemana',
  diasemana: 'diaSemana',
  vendedor: 'vendedor',
  ligações: 'ligacoes',
  ligacoes: 'ligacoes',
  'ligacoes total': 'ligacoes',
  'número de ligações': 'ligacoes',
  'numero de ligacoes': 'ligacoes',
  atendidas: 'atendidas',
  'número de ligações atendidas': 'atendidas',
  'numero de ligacoes atendidas': 'atendidas',
  aberturas: 'aberturas',
  'número de aberturas': 'aberturas',
  'numero de aberturas': 'aberturas',
  desqualificados: 'desqualificados',
  'algum desqualificado?': 'desqualificados',
  'algum desqualificado': 'desqualificados',
  formulários: 'formularios',
  formularios: 'formularios',
  form: 'formularios',
  'número de formulários': 'formularios',
  'numero de formularios': 'formularios',
  onlines: 'onlines',
  'número de onlines': 'onlines',
  'numero de onlines': 'onlines',
  'calls agendadas': 'callsAgendadas',
  callsagendadas: 'callsAgendadas',
  'calls realizadas': 'callsRealizadas',
  callsrealizadas: 'callsRealizadas',
};

function parseNumber(val: string): number {
  if (val == null || val === '') return 0;
  const n = Number(String(val).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function parseDesqualificados(val: string): number {
  const s = String(val ?? '').trim().toLowerCase();
  if (s === 'sim' || s === 's' || s === 'yes' || s === '1' || s === 'true') return 1;
  if (s === 'não' || s === 'nao' || s === 'n' || s === 'no' || s === '0' || s === 'false') return 0;
  return parseNumber(val);
}

function parseDate(val: string): string {
  if (!val || typeof val !== 'string') return '';
  const s = val.trim();
  // DD/MM/YYYY HH:MM:SS ou DD/MM/YYYY HH:MM -> YYYY-MM-DD (Carimbo de data/hora)
  const ddmmyyyyHms = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+\d{1,2}:\d{1,2}(?::\d{1,2})?)?/);
  if (ddmmyyyyHms) {
    const [, d, m, y] = ddmmyyyyHms;
    return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
  }
  // DD/MM/YYYY -> YYYY-MM-DD
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s;
}

/** Converte array de valores da API v4 (values) para SheetRowRaw[]. Primeira linha = cabeçalho. */
export function parseSheetValuesFromApi(values: string[][]): SheetRowRaw[] {
  if (!Array.isArray(values) || values.length < 2) return [];
  const headerRow = values[0];
  const headerLine = (headerRow ?? []).map((h: unknown) => String(h ?? '').trim().toLowerCase().replace(/\s+/g, ' ').normalize('NFD').replace(/\u0300-\u036f/g, ''));
  const keys = headerLine.map((h) => HEADER_ALIASES[h] ?? HEADER_ALIASES[h.replace(/[^a-z0-9]/g, '')] ?? (h as keyof SheetRowRaw));
  const rows: SheetRowRaw[] = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj: Record<string, string | number> = {};
    keys.forEach((key, idx) => {
      if (!key) return;
      const val = row?.[idx] ?? '';
      const s = String(val).trim().replace(/^"|"$/g, '');
      if (key === 'data') obj[key] = parseDate(s);
      else if (key === 'carimbo') obj[key] = s;
      else if (key === 'desqualificados') obj[key] = parseDesqualificados(s);
      else if (['ligacoes', 'atendidas', 'aberturas', 'formularios', 'onlines', 'callsAgendadas', 'callsRealizadas'].includes(key))
        obj[key] = parseNumber(s);
      else obj[key] = s;
    });
    rows.push(obj as SheetRowRaw);
  }
  return rows;
}

/** Parse CSV string (primeira linha = cabeçalho) e retorna array de objetos com chaves normalizadas. */
export function parseSheetCSV(csv: string): SheetRowRaw[] {
  const lines = csv
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^\uFEFF/, '')
    .trim()
    .split('\n');
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const sep = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(sep).map((h) => h.trim().toLowerCase().replace(/\s+/g, ' ').normalize('NFD').replace(/\u0300-\u036f/g, ''));
  const keys = headers.map((h) => HEADER_ALIASES[h] ?? HEADER_ALIASES[h.replace(/[^a-z0-9]/g, '')] ?? (h as keyof SheetRowRaw));

  const rows: SheetRowRaw[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string | number> = {};
    keys.forEach((key, idx) => {
      if (!key) return;
      const val = values[idx];
      if (key === 'data') row[key] = parseDate(val ?? '');
      else if (key === 'carimbo') row[key] = (val ?? '').trim();
      else if (key === 'desqualificados') row[key] = parseDesqualificados(val ?? '');
      else if (
        key === 'ligacoes' ||
        key === 'atendidas' ||
        key === 'aberturas' ||
        key === 'formularios' ||
        key === 'onlines' ||
        key === 'callsAgendadas' ||
        key === 'callsRealizadas'
      )
        row[key] = parseNumber(val ?? '');
      else row[key] = (val ?? '').trim();
    });
    rows.push(row as SheetRowRaw);
  }
  return rows;
}

function normalizeDate(val: string): string {
  if (!val || typeof val !== 'string') return '';
  const s = val.trim();
  // DD/MM/YYYY HH:MM:SS
  const ddmmyyyyHms = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+\d{1,2}:\d{1,2}(?::\d{1,2})?)?/);
  if (ddmmyyyyHms) {
    const [, d, m, y] = ddmmyyyyHms;
    return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
  }
  const ddmmyyyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m!.padStart(2, '0')}-${d!.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s;
}

function extractDataFromRow(row: SheetRowRaw): string {
  const dataVal = row.data ? normalizeDate(String(row.data)) : '';
  if (dataVal) return dataVal;
  const carimboVal = row.carimbo ? parseDate(String(row.carimbo)) : '';
  return carimboVal;
}

/** Mapeia linhas da planilha para RegistroDiario (só inclui linhas com vendedor mapeado). */
export function mapSheetRowsToRegistros(
  rows: SheetRowRaw[],
  getColaboradorId: (nome: string) => string | null
): RegistroDiario[] {
  const registros: RegistroDiario[] = [];
  let id = 1;
  for (const row of rows) {
    const nome = (row.vendedor ?? '').trim();
    if (!nome) continue;
    const colaboradorId = getColaboradorId(nome);
    if (!colaboradorId) continue;
    const dataStr = extractDataFromRow(row);
    if (!dataStr) continue;
    registros.push({
      id: `registro-${id++}`,
      colaboradorId,
      data: dataStr,
      diaSemana: (row.diaSemana ?? '').trim() || 'N/A',
      numeroLigacoes: Number(row.ligacoes) || 0,
      ligacoesAtendidas: Number(row.atendidas) || 0,
      numeroAberturas: Number(row.aberturas) || 0,
      desqualificados: Boolean(Number(row.desqualificados)),
      numeroFormularios: Number(row.formularios) || 0,
      numeroOnlines: Number(row.onlines) || 0,
      callsAgendadas: Number(row.callsAgendadas) || 0,
      callsRealizadas: Number(row.callsRealizadas) || 0,
      testesVocacionais: 0,
      diagnosticos: 0,
    } as RegistroDiario);
  }
  return registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}
