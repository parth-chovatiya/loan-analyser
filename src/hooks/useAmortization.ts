import { useMemo } from 'react';
import type { LoanInput, PrePayment, RateChange, LoanSummary } from '../types/loan';
import { generateSummary, validateLoan } from '../utils/amortization';

export function useAmortization(
  loan: LoanInput | null,
  prePayments: PrePayment[],
  rateChanges: RateChange[] = []
): { summary: LoanSummary | null; error: string | null } {
  return useMemo(() => {
    if (!loan) return { summary: null, error: null };
    const validationError = validateLoan(loan);
    if (validationError) return { summary: null, error: validationError };
    try {
      const summary = generateSummary(loan, prePayments, rateChanges);
      return { summary, error: null };
    } catch (e) {
      return { summary: null, error: (e as Error).message };
    }
  }, [loan, prePayments, rateChanges]);
}
