import type { LoanInput, PrePayment, RateChange, AmortizationResult } from '../../types/loan';

export interface StrategyInput {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
  baseline: AmortizationResult;
}
