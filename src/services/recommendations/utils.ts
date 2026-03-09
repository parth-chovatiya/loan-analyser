import type { Recommendation } from '../../types/recommendation';
import { formatCurrency } from '../../utils/formatters';

export const formatINR = formatCurrency;

export const assignPriority = (interestSaved: number): Recommendation['priority'] => {
  if (interestSaved >= 200_000) return 'high';
  if (interestSaved >= 50_000) return 'medium';
  return 'low';
};

export const roundTwo = (n: number): number => Math.round(n * 100) / 100;
