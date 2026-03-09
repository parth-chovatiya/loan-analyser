import { format, addMonths } from 'date-fns';
import type { PrePayment } from '../../types/loan';
import type { Recommendation } from '../../types/recommendation';
import { calculateAmortization } from '../../utils/amortization';
import type { StrategyInput } from './types';
import { formatINR, assignPriority, roundTwo } from './utils';

export const generateLumpSumRecommendation = ({
  loan,
  prePayments,
  rateChanges,
  baseline,
}: StrategyInput): Recommendation | null => {
  const lumpSum = loan.emi * 2;
  const ppDate = format(addMonths(new Date(), 0), 'yyyy-MM-dd');
  const pp: PrePayment = { id: 'sim-ls-now', date: ppDate, amount: lumpSum };

  const result = calculateAmortization(loan, [...prePayments, pp], rateChanges);
  const interestSaved = roundTwo(baseline.totalInterest - result.totalInterest);
  const monthsSaved = baseline.totalMonths - result.totalMonths;

  if (interestSaved <= 0) return null;

  return {
    id: 'lump-sum-now',
    type: 'lump_sum_timing',
    title: `Pay ${formatINR(lumpSum)} now`,
    description: `A lump sum of ${formatINR(lumpSum)} (2x EMI) paid now saves ${formatINR(interestSaved)} in interest and ${monthsSaved} months off tenure. Earlier is always better!`,
    impact: { interestSaved, monthsSaved, newClosureDate: result.closureDate },
    priority: assignPriority(interestSaved),
  };
};
