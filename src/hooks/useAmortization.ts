import { useMemo } from 'react';
import type { LoanInput, PrePayment, RateChange, LoanSummary } from '../types/loan';
import { generateSummary } from '../utils/summary';
import { validateLoan } from '../utils/validation';

export const useAmortization = (
  loan: LoanInput | null,
  prePayments: PrePayment[],
  rateChanges: RateChange[] = [],
): { summary: LoanSummary | null; error: string | null } =>
  useMemo(() => {
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
