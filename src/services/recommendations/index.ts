import type { LoanInput, PrePayment, RateChange } from '../../types/loan';
import type { Recommendation, RecommendResponse } from '../../types/recommendation';
import { generateSummary } from '../../utils/summary';
import { generatePrepaymentRecommendation } from './prepayment';
import { generateEmiIncreaseRecommendation } from './emi-increase';
import { generateLumpSumRecommendation } from './lump-sum';
import type { StrategyInput } from './types';

export const getRecommendations = (
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
): RecommendResponse => {
  const summary = generateSummary(loan, prePayments, rateChanges);
  const baseline = summary.withPrePayments;

  const input: StrategyInput = { loan, prePayments, rateChanges, baseline };

  const recommendations: Recommendation[] = [
    generatePrepaymentRecommendation(input),
    generateEmiIncreaseRecommendation(input),
    generateLumpSumRecommendation(input),
  ]
    .filter((r): r is Recommendation => r !== null)
    .sort((a, b) => b.impact.interestSaved - a.impact.interestSaved);

  return {
    recommendations,
    currentSummary: {
      totalInterest: baseline.totalInterest,
      totalMonths: baseline.totalMonths,
      closureDate: baseline.closureDate,
    },
  };
};
