/**
 * Sincronização Conta Azul → Supabase
 * Grava dados da API nas tabelas conta_azul_* para cache e fallback.
 */

import { getSupabaseServer } from '@/lib/supabase';
import type {
  ContaAzulCategory,
  ContaAzulAccount,
  ContaAzulFinancialSummary,
  ContaAzulCashFlow,
  ContaAzulSalesData,
} from '@/lib/contaazul';

export async function syncContaAzulCategories(
  categories: ContaAzulCategory[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { ok: false, count: 0, error: 'Supabase não configurado' };
  try {
    const rows = categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parent_id: c.parent_id ?? null,
      color: c.color ?? null,
    }));
    const { error } = await supabase.from('conta_azul_categories').upsert(rows, { onConflict: 'id' });
    if (error) return { ok: false, count: 0, error: error.message };
    return { ok: true, count: rows.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, count: 0, error: msg };
  }
}

export async function syncContaAzulAccounts(
  accounts: ContaAzulAccount[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { ok: false, count: 0, error: 'Supabase não configurado' };
  try {
    const rows = accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: a.balance,
      currency: a.currency ?? 'BRL',
    }));
    const { error } = await supabase.from('conta_azul_accounts').upsert(rows, { onConflict: 'id' });
    if (error) return { ok: false, count: 0, error: error.message };
    return { ok: true, count: rows.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, count: 0, error: msg };
  }
}

export async function syncContaAzulSummary(
  summary: ContaAzulFinancialSummary
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { ok: false, error: 'Supabase não configurado' };
  try {
    const { error } = await supabase
      .from('conta_azul_summary')
      .upsert({ id: 1, payload: summary }, { onConflict: 'id' });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function syncContaAzulCashflow(
  items: ContaAzulCashFlow[],
  periodStart: string,
  periodEnd: string
): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { ok: false, count: 0, error: 'Supabase não configurado' };
  try {
    const { error: delError } = await supabase
      .from('conta_azul_cashflow')
      .delete()
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd);
    if (delError) console.warn('conta_azul_cashflow delete:', delError.message);
    const rows = items.map((item) => ({
      data: item.date,
      income: item.income,
      expense: item.expense,
      balance: item.balance,
      period_start: periodStart,
      period_end: periodEnd,
    }));
    if (rows.length === 0) return { ok: true, count: 0 };
    const { error } = await supabase.from('conta_azul_cashflow').insert(rows);
    if (error) return { ok: false, count: 0, error: error.message };
    return { ok: true, count: rows.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, count: 0, error: msg };
  }
}

export async function syncContaAzulSales(
  items: ContaAzulSalesData[],
  periodStart: string,
  periodEnd: string
): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { ok: false, count: 0, error: 'Supabase não configurado' };
  try {
    const { error: delError } = await supabase
      .from('conta_azul_sales')
      .delete()
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd);
    if (delError) console.warn('conta_azul_sales delete:', delError.message);
    const rows = items.map((item) => ({
      data: item.date,
      amount: item.amount,
      quantity: item.quantity ?? null,
      period_start: periodStart,
      period_end: periodEnd,
    }));
    if (rows.length === 0) return { ok: true, count: 0 };
    const { error } = await supabase.from('conta_azul_sales').insert(rows);
    if (error) return { ok: false, count: 0, error: error.message };
    return { ok: true, count: rows.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, count: 0, error: msg };
  }
}

// ---- Leitura do cache (fallback quando API falha) ----

export async function getContaAzulCategoriesFromSupabase(): Promise<ContaAzulCategory[] | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.from('conta_azul_categories').select('id,name,type,parent_id,color').order('name');
  if (error || !data) return null;
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as 'income' | 'expense',
    parent_id: r.parent_id ?? undefined,
    color: r.color ?? undefined,
  }));
}

export async function getContaAzulAccountsFromSupabase(): Promise<ContaAzulAccount[] | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.from('conta_azul_accounts').select('id,name,type,balance,currency').order('name');
  if (error || !data) return null;
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    balance: Number(r.balance),
    currency: r.currency ?? 'BRL',
  }));
}

export async function getContaAzulSummaryFromSupabase(): Promise<ContaAzulFinancialSummary | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.from('conta_azul_summary').select('payload').eq('id', 1).single();
  if (error || !data?.payload) return null;
  return data.payload as ContaAzulFinancialSummary;
}

export async function getContaAzulCashflowFromSupabase(
  startDate: string,
  endDate: string
): Promise<ContaAzulCashFlow[] | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('conta_azul_cashflow')
    .select('data,income,expense,balance')
    .eq('period_start', startDate)
    .eq('period_end', endDate)
    .order('data');
  if (error || !data) return null;
  return data.map((r) => ({
    date: r.data,
    income: Number(r.income),
    expense: Number(r.expense),
    balance: Number(r.balance),
  }));
}

export async function getContaAzulSalesFromSupabase(
  startDate: string,
  endDate: string
): Promise<ContaAzulSalesData[] | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('conta_azul_sales')
    .select('data,amount,quantity')
    .eq('period_start', startDate)
    .eq('period_end', endDate)
    .order('data');
  if (error || !data) return null;
  return data.map((r) => ({
    date: r.data,
    amount: Number(r.amount),
    quantity: r.quantity ?? undefined,
  }));
}
