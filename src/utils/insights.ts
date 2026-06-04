import { differenceInMonths, parseISO } from 'date-fns';
import type {
  LoanInput,
  PrePayment,
  RateChange,
  AmortizationResult,
  LoanSummary,
} from '../types/loan';
import { calculateAmortization } from './amortization';

// Indicative India home-loan benchmark used only to score "rate vs market".
// Not live market data — a static reference so users can gauge their rate.
const MARKET_RATE = 8.5;

const DAYS_PER_MONTH = 30.44;

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

const roundTwo = (n: number): number => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Progress (shared by SummaryCards and PayoffCountdown)
// ---------------------------------------------------------------------------

export interface ProgressInfo {
  monthsCompleted: number;
  totalMonths: number;
  principalRepaid: number;
  progressPct: number; // 0–100
}

export const computeProgress = (result: AmortizationResult, loan: LoanInput): ProgressInfo => {
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let monthsCompleted = 0;
  for (const row of result.schedule) {
    if (row.date.substring(0, 7) <= nowKey) {
      monthsCompleted = row.month;
    } else {
      break;
    }
  }

  const principalRepaid =
    monthsCompleted > 0
      ? loan.principal - (result.schedule[monthsCompleted - 1]?.closingBalance ?? 0)
      : 0;

  const progressPct = loan.principal > 0 ? (principalRepaid / loan.principal) * 100 : 0;

  return {
    monthsCompleted,
    totalMonths: result.totalMonths,
    principalRepaid,
    progressPct: clamp(progressPct, 0, 100),
  };
};

// ---------------------------------------------------------------------------
// Payoff countdown
// ---------------------------------------------------------------------------

export interface CountdownInfo {
  closureDate: string;
  monthsRemaining: number;
  years: number;
  months: number;
  isPaidOff: boolean;
}

export const computeCountdown = (result: AmortizationResult): CountdownInfo => {
  const now = new Date();
  const closure = parseISO(result.closureDate);
  const monthsRemaining = Math.max(0, differenceInMonths(closure, now));

  return {
    closureDate: result.closureDate,
    monthsRemaining,
    years: Math.floor(monthsRemaining / 12),
    months: monthsRemaining % 12,
    isPaidOff: monthsRemaining <= 0,
  };
};

// ---------------------------------------------------------------------------
// Key insights
// ---------------------------------------------------------------------------

export interface KeyInsights {
  breakevenMonth: number | null;
  breakevenDate: string | null;
  avgMonthlyInterest: number;
  interestPerDay: number;
  interestSharePct: number;
}

export const computeKeyInsights = (result: AmortizationResult): KeyInsights => {
  const crossover = result.schedule.find((row) => row.principalComponent > row.interestComponent);

  const totalMonths = result.totalMonths || 1;
  const avgMonthlyInterest = result.totalInterest / totalMonths;
  const interestPerDay = result.totalInterest / (totalMonths * DAYS_PER_MONTH);
  const interestSharePct =
    result.totalAmountPaid > 0 ? (result.totalInterest / result.totalAmountPaid) * 100 : 0;

  return {
    breakevenMonth: crossover?.month ?? null,
    breakevenDate: crossover?.date ?? null,
    avgMonthlyInterest: roundTwo(avgMonthlyInterest),
    interestPerDay: roundTwo(interestPerDay),
    interestSharePct: roundTwo(interestSharePct),
  };
};

// ---------------------------------------------------------------------------
// Rate sensitivity ("what if rates were higher")
// ---------------------------------------------------------------------------

const RATE_DELTAS = [0.5, 1.0];

export interface RateSensitivityRow {
  delta: number;
  newRate: number;
  extraInterest: number;
  extraMonths: number;
}

export const computeRateSensitivity = (
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
  baseline: AmortizationResult,
): RateSensitivityRow[] =>
  RATE_DELTAS.map((delta) => {
    const bumpedLoan = { ...loan, annualRate: loan.annualRate + delta };
    const bumpedRateChanges = rateChanges.map((rc) => ({ ...rc, newRate: rc.newRate + delta }));
    const result = calculateAmortization(bumpedLoan, prePayments, bumpedRateChanges);
    return {
      delta,
      newRate: roundTwo(loan.annualRate + delta),
      extraInterest: roundTwo(result.totalInterest - baseline.totalInterest),
      extraMonths: result.totalMonths - baseline.totalMonths,
    };
  });

// ---------------------------------------------------------------------------
// Loan health score
// ---------------------------------------------------------------------------

export type HealthGrade = 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';

export interface HealthFactor {
  label: string;
  score: number;
  max: number;
  hint: string;
}

export interface HealthScore {
  score: number; // 0–100
  grade: HealthGrade;
  factors: HealthFactor[];
  tips: string[];
}

// Factor weights (sum to 100).
const W_RATE = 35;
const W_PREPAY = 30;
const W_COST = 20;
const W_TENURE = 15;

const gradeFor = (score: number): HealthGrade => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
};

export const computeHealthScore = (loan: LoanInput, summary: LoanSummary): HealthScore => {
  const wp = summary.withPrePayments;
  const wop = summary.withoutPrePayments;

  // Rate vs market: full marks at/below benchmark; lose ~10 pts per 1% above.
  const rateOver = Math.max(0, loan.annualRate - MARKET_RATE);
  const rateScore = clamp(W_RATE - rateOver * 10, 0, W_RATE);

  // Prepayment activity: 30% interest reduction earns full marks.
  const savingRatio = wop.totalInterest > 0 ? summary.interestSaved / wop.totalInterest : 0;
  const prepayScore = clamp((savingRatio / 0.3) * W_PREPAY, 0, W_PREPAY);

  // Effective cost: 1.3x earns full marks, 2.5x earns none.
  const costMultiple = loan.principal > 0 ? wp.totalAmountPaid / loan.principal : 0;
  const costScore = clamp((W_COST * (2.5 - costMultiple)) / (2.5 - 1.3), 0, W_COST);

  // Tenure: 120 months earns full marks, 360 earns none.
  const tenureScore = clamp((W_TENURE * (360 - wp.totalMonths)) / (360 - 120), 0, W_TENURE);

  const factors: HealthFactor[] = [
    {
      label: 'Interest Rate',
      score: Math.round(rateScore),
      max: W_RATE,
      hint:
        rateOver > 0
          ? `Your ${loan.annualRate}% is above the ~${MARKET_RATE}% benchmark`
          : `Your ${loan.annualRate}% is at or below the ~${MARKET_RATE}% benchmark`,
    },
    {
      label: 'Pre-Payments',
      score: Math.round(prepayScore),
      max: W_PREPAY,
      hint:
        savingRatio > 0
          ? `Cutting ${(savingRatio * 100).toFixed(0)}% of original interest`
          : 'No pre-payments made yet',
    },
    {
      label: 'Effective Cost',
      score: Math.round(costScore),
      max: W_COST,
      hint: `You repay ${costMultiple.toFixed(2)}x the borrowed amount`,
    },
    {
      label: 'Tenure',
      score: Math.round(tenureScore),
      max: W_TENURE,
      hint: `${wp.totalMonths} months (${(wp.totalMonths / 12).toFixed(1)} years) to close`,
    },
  ];

  const score = clamp(Math.round(rateScore + prepayScore + costScore + tenureScore), 0, 100);

  const tips: string[] = [];
  if (rateOver > 0.25) {
    tips.push(
      `Your rate is above the ~${MARKET_RATE}% benchmark — explore refinancing or a balance transfer.`,
    );
  }
  if (savingRatio < 0.1) {
    tips.push('Even small, regular pre-payments early on can save a large chunk of interest.');
  }
  if (costMultiple > 1.8) {
    tips.push(
      `You repay ${costMultiple.toFixed(2)}x what you borrowed — prepaying or raising your EMI lowers this.`,
    );
  }
  if (wp.totalMonths > 240 && tips.length < 3) {
    tips.push('A long tenure means more interest — shortening it even slightly helps.');
  }
  if (tips.length === 0) {
    tips.push('Your loan is in great shape. Keep up the pre-payments to stay ahead.');
  }

  return { score, grade: gradeFor(score), factors, tips: tips.slice(0, 3) };
};
