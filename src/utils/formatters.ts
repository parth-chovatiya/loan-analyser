import { format, parseISO } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_00_00_000) {
    return `${(amount / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (amount >= 1_00_000) {
    return `${(amount / 1_00_000).toFixed(2)} L`;
  }
  return formatCurrency(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM yyyy');
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}
