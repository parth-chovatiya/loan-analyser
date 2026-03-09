import type { LoanInput, PrePayment, RateChange, LoanSummary } from '../types/loan';
import { calculateAmortization } from './amortization';

export const generateSummary = (
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[] = [],
): LoanSummary => {
  const withPrePayments = calculateAmortization(loan, prePayments, rateChanges);
  const withoutPrePayments = calculateAmortization(loan, [], rateChanges);

  return {
    withPrePayments,
    withoutPrePayments,
    interestSaved:
      Math.round((withoutPrePayments.totalInterest - withPrePayments.totalInterest) * 100) / 100,
    monthsSaved: withoutPrePayments.totalMonths - withPrePayments.totalMonths,
  };
};
