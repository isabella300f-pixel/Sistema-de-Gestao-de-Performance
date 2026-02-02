import type { RegistroDiario } from '@/types';

/**
 * Utilitários para sincronizar com a planilha Google Sheets publicada.
 * URL da planilha publicada (export CSV):
 * https://docs.google.com/spreadsheets/d/e/2PACX-1vSzxCdngLexHYSEYbB1nsKqdYMzRmAAj0uamu1m92Ah--O-KfG53y1fD421oxroXYWeGbOJ23zBrXtw/pub?output=csv&gid=57736896
 */

export const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSzxCdngLexHYSEYbB1nsKqdYMzRmAAj0uamu1m92Ah--O-KfG53y1fD421oxroXYWeGbOJ23zBrXtw/pub?output=csv&gid=57736896';

/** URL usada para buscar CSV quando não há API key. Prioridade: PUBLISHED_CSV_URL > SHEET_CSV_URL (env) > constante acima. */
export function getSheetCsvUrl(): string {
  if (typeof process !== 'undefined' && process.env?.PUBLISHED_CSV_URL?.trim()) return process.env.PUBLISHED_CSV_URL.trim();
  if (typeof process !== 'undefined' && process.env?.SHEET_CSV_URL?.trim()) return process.env.SHEET_CSV_URL.trim();
  return SHEET_CSV_URL;
}

export interface SheetRowRaw {
  data?: string;
  carimbo?: string;
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
  testesVocacionais?: number;
  diagnosticos?: number;
  avaliacaoPerformance?: string;
  sugestaoMelhoria?: string;
  metaProximoDia?: string;
  etapaFunilFoco?: string;
}

const HEADER_ALIASES: Record<string, keyof SheetRowRaw> = {
  data: 'data',
  'carimbo de data/hora': 'carimbo',
  'carimbo de data': 'carimbo',
  'carimbo': 'carimbo',
  'timestamp': 'carimbo',
  'dia da semana': 'diaSemana',
  'dia da semana ': 'diaSemana',
  'dia da semana:': 'diaSemana',
  'diasemana': 'diaSemana',
  'dia': 'diaSemana',
  vendedor: 'vendedor',
  'nome': 'vendedor',
  'colaborador': 'vendedor',
  ligações: 'ligacoes',
  ligacoes: 'ligacoes',
  'ligacoes total': 'ligacoes',
  'número de ligações': 'ligacoes',
  'numero de ligacoes': 'ligacoes',
  'total ligações': 'ligacoes',
  atendidas: 'atendidas',
  'número de ligações atendidas': 'atendidas',
  'numero de ligacoes atendidas': 'atendidas',
  'ligações atendidas': 'atendidas',
  'ligacoes atendidas': 'atendidas',
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
  'callsagendadas': 'callsAgendadas',
  'número de calls agendadas': 'callsAgendadas',
  'numero de calls agendadas': 'callsAgendadas',
  'calls realizadas': 'callsRealizadas',
  'callsrealizadas': 'callsRealizadas',
  'número de calls realizadas': 'callsRealizadas',
  'numero de calls realizadas': 'callsRealizadas',
  'número de testes vocacionais': 'testesVocacionais',
  'numero de testes vocacionais': 'testesVocacionais',
  'testes vocacionais': 'testesVocacionais',
  'número de diagnósticos': 'diagnosticos',
  'numero de diagnosticos': 'diagnosticos',
  'número de diagnósticos ': 'diagnosticos',
  'diagnósticos': 'diagnosticos',
  'diagnosticos': 'diagnosticos',
  'como avalia sua performance hoje?': 'avaliacaoPerformance',
  'avaliacao performance': 'avaliacaoPerformance',
  'com base na resposta anterior, qual sua sugestão de melhoria?': 'sugestaoMelhoria',
  'sugestao de melhoria': 'sugestaoMelhoria',
  'qual a sua meta para o próximo dia?': 'metaProximoDia',
  'meta próximo dia': 'metaProximoDia',
  'em qual etapa do funil, pretende direcionar seu foco?': 'etapaFunilFoco',
  'etapa funil foco': 'etapaFunilFoco',
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
  if (!Array.isArray(values) || values.length < 2) {
    console.warn('⚠️ parseSheetValuesFromApi: valores inválidos ou insuficientes');
    return [];
  }
  
  const headerRow = values[0];
  const headerLine = (headerRow ?? []).map((h: unknown) => String(h ?? '').trim().toLowerCase().replace(/\s+/g, ' ').normalize('NFD').replace(/\u0300-\u036f/g, ''));
  const keys = headerLine.map((h) => {
    const alias = HEADER_ALIASES[h] ?? HEADER_ALIASES[h.replace(/[^a-z0-9]/g, '')];
    return alias || h as keyof SheetRowRaw;
  });
  
  // Debug: mostrar cabeçalhos encontrados
  if (values.length > 1) {
    console.log('📋 Cabeçalhos encontrados:', headerLine.slice(0, 10));
    console.log('🔑 Chaves mapeadas:', keys.slice(0, 10));
  }
  
  const rows: SheetRowRaw[] = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0) continue;
    
    const obj: Record<string, string | number> = {};
    keys.forEach((key, idx) => {
      if (!key) return;
      const val = row?.[idx] ?? '';
      const s = String(val).trim().replace(/^"|"$/g, '');
      if (key === 'data') obj[key] = parseDate(s);
      else if (key === 'carimbo') obj[key] = s;
      else if (key === 'desqualificados') obj[key] = parseDesqualificados(s);
      else if (['ligacoes', 'atendidas', 'aberturas', 'formularios', 'onlines', 'callsAgendadas', 'callsRealizadas', 'testesVocacionais', 'diagnosticos'].includes(key))
        obj[key] = parseNumber(s);
      else obj[key] = s;
    });
    
    // Manter também os campos originais para fallback
    headerLine.forEach((h, idx) => {
      if (!obj[h as keyof SheetRowRaw] && row[idx]) {
        (obj as any)[h] = String(row[idx]).trim();
      }
    });
    
    rows.push(obj as SheetRowRaw);
  }
  
  console.log(`✅ parseSheetValuesFromApi: ${rows.length} linhas processadas de ${values.length - 1} linhas de dados`);
  return rows;
}

/**
 * Parse CSV/TSV respeitando campos entre aspas (RFC 4180): newlines e delimitadores
 * dentro de "..." são tratados como parte do campo. Delimitador TAB ou vírgula.
 */
function parseCSVRows(csv: string, delimiter: '\t' | ',' = '\t'): string[][] {
  const normalized = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  while (i < normalized.length) {
    const c = normalized[i];
    if (inQuotes) {
      if (c === '"') {
        if (normalized[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      currentField += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delimiter) {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }
    if (c === '\n') {
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((cell) => cell.length > 0)) rows.push(currentRow);
      currentRow = [];
      i++;
      continue;
    }
    currentField += c;
    i++;
  }
  currentRow.push(currentField.trim());
  if (currentRow.some((cell) => cell.length > 0)) rows.push(currentRow);
  return rows;
}

/** Ordem fixa das 18 colunas da planilha (Google Form): igual ao cabeçalho real. */
const FIXED_COLUMN_ORDER_18: (keyof SheetRowRaw)[] = [
  'carimbo',
  'data',
  'diaSemana',
  'ligacoes',
  'atendidas',
  'aberturas',
  'desqualificados',
  'formularios',
  'onlines',
  'vendedor',
  'callsAgendadas',
  'callsRealizadas',
  'testesVocacionais',
  'diagnosticos',
  'avaliacaoPerformance',
  'sugestaoMelhoria',
  'metaProximoDia',
  'etapaFunilFoco',
];

function normalizeHeader(h: string): string {
  return h
    .replace(/\uFEFF/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .normalize('NFD')
    .replace(/\u0300-\u036f/g, '')
    .trim()
    .toLowerCase();
}

/** Parse CSV string: suporta cabeçalho com campos entre aspas e newlines. Retorna SheetRowRaw[]. */
export function parseSheetCSV(csv: string): SheetRowRaw[] {
  let allRows = parseCSVRows(csv, '\t');
  if (allRows.length >= 1 && allRows[0].length <= 1) allRows = parseCSVRows(csv, ',');
  if (allRows.length < 2) return [];

  const rows: SheetRowRaw[] = [];
  const numKeys = FIXED_COLUMN_ORDER_18.length;
  for (let r = 1; r < allRows.length; r++) {
    const values = allRows[r];
    const row: Record<string, string | number> = {};
    // Sempre preencher por índice fixo (ordem da planilha) para garantir ligações, atendidas, aberturas etc.
    for (let i = 0; i < numKeys; i++) {
      const key = FIXED_COLUMN_ORDER_18[i];
      const val = String(values[i] ?? '').trim();
      if (key === 'data') row[key] = parseDate(val);
      else if (key === 'carimbo') row[key] = val;
      else if (key === 'desqualificados') row[key] = parseDesqualificados(val);
      else if (
        key === 'ligacoes' ||
        key === 'atendidas' ||
        key === 'aberturas' ||
        key === 'formularios' ||
        key === 'onlines' ||
        key === 'callsAgendadas' ||
        key === 'callsRealizadas' ||
        key === 'testesVocacionais' ||
        key === 'diagnosticos'
      )
        row[key] = parseNumber(val);
      else row[key] = val;
    }
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

/** Data canônica do registro: coluna Data (atividade); se ano errado na planilha (ex.: 30/01/2025 com carimbo 30/01/2026), usa ano do carimbo para bater totais. */
export function extractDataFromRow(row: SheetRowRaw): string {
  const dataVal = row.data ? normalizeDate(String(row.data)) : '';
  const carimboVal = row.carimbo ? parseDate(String(row.carimbo)) : '';
  if (!dataVal) return carimboVal;
  if (!carimboVal) return dataVal;
  const [dataY, dataM, dataD] = dataVal.split('-').map(Number);
  const [carY, carM, carD] = carimboVal.split('-').map(Number);
  if (dataM === carM && dataD === carD && dataY !== carY) return carimboVal;
  return dataVal;
}

/** Mapeia linhas da planilha para RegistroDiario. Dados 100% da planilha; data usa coluna Data (atividade), fallback no Carimbo. */
export function mapSheetRowsToRegistros(
  rows: SheetRowRaw[],
  getColaboradorId: (nome: string) => string | null
): RegistroDiario[] {
  const registros: RegistroDiario[] = [];
  let id = 1;
  let skippedSemVendedor = 0;
  let skippedSemData = 0;
  
  // Debug: mostrar estrutura do primeiro registro
  if (rows.length > 0) {
    console.log('🔍 Estrutura do primeiro registro bruto:', Object.keys(rows[0]));
    console.log('🔍 Primeiro registro completo:', rows[0]);
  }
  
  for (const row of rows) {
    // Tentar múltiplas formas de obter o nome do vendedor (case-insensitive, com fallbacks)
    const rowAny = row as any;
    let nome = (
      row.vendedor ??
      rowAny.Vendedor ??
      rowAny.vendedor ??
      rowAny.nome ??
      rowAny.Nome ??
      rowAny.colaborador ??
      rowAny.Colaborador ??
      rowAny['vendedor'] ??
      rowAny['Vendedor'] ??
      ''
    ).toString().trim();
    // Fallback: qualquer chave do objeto que contenha "vendedor" (ex.: CSV com cabeçalho entre aspas)
    if (!nome && typeof rowAny === 'object') {
      for (const key of Object.keys(rowAny)) {
        if (key.toLowerCase().includes('vendedor')) {
          const val = rowAny[key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            nome = String(val).trim();
            break;
          }
        }
      }
    }
    
    if (!nome || nome === 'undefined' || nome === 'null' || nome === '') {
      skippedSemVendedor++;
      // Se não tem vendedor mas tem dados, usar um placeholder
      const temDados = row.ligacoes || rowAny.ligações || rowAny.ligacoes || rowAny['ligações'] || rowAny['ligacoes'];
      if (!temDados) continue;
    }
    
    // Tentar múltiplas formas de obter a data
    let dataStr = extractDataFromRow(row);
    
    // Se não encontrou, tentar campos alternativos diretamente
    if (!dataStr) {
      const altData = rowAny.Data || rowAny.data || rowAny.carimbo || rowAny.Carimbo || rowAny.timestamp || rowAny.Timestamp || rowAny['data'] || rowAny['carimbo'];
      if (altData) {
        dataStr = parseDate(String(altData));
      }
    }
    
    if (!dataStr) {
      skippedSemData++;
      continue;
    }
    
    // Usar nome ou placeholder
    const nomeFinal = nome || 'Vendedor Desconhecido';
    const colaboradorId = getColaboradorId(nomeFinal) ?? `sheet:${nomeFinal}`;
    
    // Tentar obter valores numéricos de múltiplas formas
    const getNumValue = (field: string, altFields: string[] = []): number => {
      const val = (row as any)[field] ?? rowAny[field];
      if (val !== undefined && val !== null && val !== '') return parseNumber(String(val));
      for (const alt of altFields) {
        const altVal = rowAny[alt] ?? rowAny[alt.toLowerCase()] ?? rowAny[alt.toUpperCase()];
        if (altVal !== undefined && altVal !== null && altVal !== '') return parseNumber(String(altVal));
      }
      return 0;
    };
    
    const reg: RegistroDiario = {
      id: `registro-${id++}`,
      colaboradorId,
      data: dataStr,
      diaSemana: (row.diaSemana ?? rowAny.dia ?? rowAny['dia da semana'] ?? '').toString().trim() || 'N/A',
      numeroLigacoes: getNumValue('ligacoes', ['ligações', 'Ligações', 'ligacoes total', 'número de ligações']),
      ligacoesAtendidas: getNumValue('atendidas', ['atendidas', 'Atendidas', 'número de ligações atendidas']),
      numeroAberturas: getNumValue('aberturas', ['aberturas', 'Aberturas', 'número de aberturas']),
      desqualificados: getNumValue('desqualificados', ['algum desqualificado?', 'algum desqualificado']),
      numeroFormularios: getNumValue('formularios', ['formulários', 'Formulários', 'número de formulários']),
      numeroOnlines: getNumValue('onlines', ['onlines', 'Onlines', 'número de onlines']),
      callsAgendadas: getNumValue('callsAgendadas', ['calls agendadas', 'Calls Agendadas']),
      callsRealizadas: getNumValue('callsRealizadas', ['calls realizadas', 'Calls Realizadas']),
      testesVocacionais: getNumValue('testesVocacionais', ['número de testes vocacionais']),
      diagnosticos: getNumValue('diagnosticos', ['número de diagnósticos']),
      avaliacaoPerformance: String(rowAny.avaliacaoPerformance ?? rowAny['como avalia sua performance hoje?'] ?? '').trim() || undefined,
      sugestaoMelhoria: String(rowAny.sugestaoMelhoria ?? rowAny['com base na resposta anterior, qual sua sugestão de melhoria?'] ?? '').trim() || undefined,
      metaProximoDia: String(rowAny.metaProximoDia ?? rowAny['qual a sua meta para o próximo dia?'] ?? '').trim() || undefined,
      etapaFunilFoco: String(rowAny.etapaFunilFoco ?? rowAny['em qual etapa do funil, pretende direcionar seu foco?'] ?? '').trim() || undefined,
    };
    
    if (colaboradorId.startsWith('sheet:')) reg.vendedorNome = nomeFinal;
    registros.push(reg);
  }
  
  if (skippedSemVendedor > 0 || skippedSemData > 0) {
    console.warn(`⚠️ Mapeamento: ${skippedSemVendedor} linhas sem vendedor, ${skippedSemData} linhas sem data de ${rows.length} total`);
  }
  
  console.log(`✅ mapSheetRowsToRegistros: ${registros.length} registros mapeados de ${rows.length} linhas`);
  
  return registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}
