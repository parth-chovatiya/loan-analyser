import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1_00_00_000) return `${(amount / 1_00_00_000).toFixed(2)} Cr`;
  if (amount >= 1_00_000) return `${(amount / 1_00_000).toFixed(2)} L`;
  return formatCurrency(amount);
};

export const formatDate = (dateStr: string): string =>
  format(parseISO(dateStr), 'MMM yyyy');

export const formatDateFull = (dateStr: string): string =>
  format(parseISO(dateStr), 'dd MMM yyyy');
