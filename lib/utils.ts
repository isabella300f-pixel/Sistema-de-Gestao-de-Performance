import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata data sem mudar dia por timezone: YYYY-MM-DD é tratado como data local. */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    const [y, m, d] = date.trim().split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(y, m - 1, d));
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getDaysSince(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calculateScore(avaliacao: {
  leadsTrabalhados: string;
  qualidadeCRM: string;
  conversaoFunil: string;
}): number {
  const scores = {
    leadsTrabalhados: {
      excelente: 95,
      bom: 82,
      regular: 62,
      ruim: 25,
    },
    qualidadeCRM: {
      excelente: 100,
      boa: 75,
      regular: 50,
      ruim: 25,
    },
    conversaoFunil: {
      acima_media: 100,
      dentro_media: 75,
      abaixo_media: 50,
      muito_abaixo_media: 25,
    },
  };

  const leadScore = scores.leadsTrabalhados[avaliacao.leadsTrabalhados as keyof typeof scores.leadsTrabalhados] || 0;
  const crmScore = scores.qualidadeCRM[avaliacao.qualidadeCRM as keyof typeof scores.qualidadeCRM] || 0;
  const funilScore = scores.conversaoFunil[avaliacao.conversaoFunil as keyof typeof scores.conversaoFunil] || 0;

  return Math.round((leadScore + crmScore + funilScore) / 3);
}


