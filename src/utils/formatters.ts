import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatCurrencyShort = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 1_00_00_000) return `${(amount / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `${(amount / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return formatCurrency(amount);
};

export const formatDate = (dateStr: string): string => format(parseISO(dateStr), 'MMM yyyy');

export const formatDateFull = (dateStr: string): string => format(parseISO(dateStr), 'dd MMM yyyy');
