import type { Recommendation } from '../../types/recommendation';
import { calculateAmortization } from '../../utils/amortization';
import { validateLoan } from '../../utils/validation';
import type { StrategyInput } from './types';
import { formatINR, assignPriority, roundTwo } from './utils';

const INCREASE_PERCENTAGES = [5, 10, 15, 20] as const;

export const generateEmiIncreaseRecommendation = ({
  loan,
  prePayments,
  rateChanges,
  baseline,
}: StrategyInput): Recommendation | null => {
  let best: Recommendation | null = null;

  for (const pct of INCREASE_PERCENTAGES) {
    const newEmi = Math.round(loan.emi * (1 + pct / 100));
    const modifiedLoan = { ...loan, emi: newEmi };

    if (validateLoan(modifiedLoan)) continue;

    const result = calculateAmortization(modifiedLoan, prePayments, rateChanges);
    const interestSaved = roundTwo(baseline.totalInterest - result.totalInterest);
    const monthsSaved = baseline.totalMonths - result.totalMonths;

    if (interestSaved > 0 && (!best || interestSaved > best.impact.interestSaved)) {
      best = {
        id: `emi-increase-${pct}`,
        type: 'emi_increase',
        title: `Increase EMI by ${pct}%`,
        description: `Raising your EMI from ${formatINR(loan.emi)} to ${formatINR(newEmi)} (+${pct}%) would save ${formatINR(interestSaved)} in interest and finish ${monthsSaved} months sooner.`,
        impact: { interestSaved, monthsSaved, newClosureDate: result.closureDate },
        priority: assignPriority(interestSaved),
      };
    }
  }

  return best;
};
