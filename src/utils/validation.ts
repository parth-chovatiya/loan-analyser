import type { LoanInput } from '../types/loan';

export const validateLoan = (loan: LoanInput): string | null => {
  if (loan.principal <= 0) return 'Principal must be positive';
  if (loan.annualRate <= 0 || loan.annualRate > 50)
    return 'Interest rate must be between 0 and 50%';
  if (loan.emi <= 0) return 'EMI must be positive';
  if (loan.emiDebitDay < 1 || loan.emiDebitDay > 28)
    return 'EMI debit day must be between 1 and 28';

  const firstMonthInterest = loan.principal * (loan.annualRate / 100 / 12);
  if (loan.emi <= firstMonthInterest) {
    return `EMI (${loan.emi}) must exceed first month's interest (${Math.round(firstMonthInterest)}) to repay the loan`;
  }

  return null;
};
