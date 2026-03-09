import { format, addMonths, parseISO } from 'date-fns';
import type { PrePayment } from '../../types/loan';
import type { Recommendation } from '../../types/recommendation';
import { calculateAmortization } from '../../utils/amortization';
import type { StrategyInput } from './types';
import { formatINR, assignPriority, roundTwo } from './utils';

const PERCENTAGES = [5, 10, 15, 20] as const;

export const generatePrepaymentRecommendation = ({
  loan,
  prePayments,
  rateChanges,
  baseline,
}: StrategyInput): Recommendation | null => {
  const remainingBalance = baseline.schedule[0]?.openingBalance ?? loan.principal;
  let best: Recommendation | null = null;

  for (const pct of PERCENTAGES) {
    const ppAmount = Math.round(remainingBalance * (pct / 100));
    const ppDate = format(addMonths(parseISO(loan.startDate), 12), 'yyyy-MM-dd');
    const pp: PrePayment = { id: `sim-pp-${pct}`, date: ppDate, amount: ppAmount };

    const result = calculateAmortization(loan, [...prePayments, pp], rateChanges);
    const interestSaved = roundTwo(baseline.totalInterest - result.totalInterest);
    const monthsSaved = baseline.totalMonths - result.totalMonths;

    if (interestSaved > 0 && (!best || interestSaved > best.impact.interestSaved)) {
      best = {
        id: `prepayment-${pct}`,
        type: 'prepayment',
        title: `${pct}% Lump Sum Prepayment`,
        description: `A one-time prepayment of ${formatINR(ppAmount)} (${pct}% of principal) in year 1 would save ${formatINR(interestSaved)} in interest and close the loan ${monthsSaved} months earlier.`,
        impact: { interestSaved, monthsSaved, newClosureDate: result.closureDate },
        priority: assignPriority(interestSaved),
      };
    }
  }

  return best;
};
