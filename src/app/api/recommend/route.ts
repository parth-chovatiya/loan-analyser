import { NextResponse } from 'next/server';
import { calculateAmortization, generateSummary, validateLoan } from '@/utils/amortization';
import type { LoanInput, PrePayment, RateChange } from '@/types/loan';
import type { Recommendation } from '@/types/recommendation';
import { format, addMonths, parseISO } from 'date-fns';

interface RequestBody {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
}

function assignPriority(interestSaved: number): 'high' | 'medium' | 'low' {
  if (interestSaved >= 200000) return 'high';
  if (interestSaved >= 50000) return 'medium';
  return 'low';
}

function generatePrepaymentRecommendations(
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
  baseline: ReturnType<typeof calculateAmortization>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const percentages = [5, 10, 15, 20];
  const yearsAhead = [1, 2, 3, 5];

  // Find remaining balance (use first row's opening balance as approximation for current balance)
  const remainingBalance = baseline.schedule[0]?.openingBalance ?? loan.principal;

  for (const pct of percentages) {
    const ppAmount = Math.round(remainingBalance * (pct / 100));
    // Pick the best year for this percentage (year 1 gives most savings)
    const year = yearsAhead[0];
    const ppDate = format(addMonths(parseISO(loan.startDate), year * 12), 'yyyy-MM-dd');
    const pp: PrePayment = { id: `sim-pp-${pct}`, date: ppDate, amount: ppAmount };
    const result = calculateAmortization(loan, [...prePayments, pp], rateChanges);
    const interestSaved = Math.round((baseline.totalInterest - result.totalInterest) * 100) / 100;
    const monthsSaved = baseline.totalMonths - result.totalMonths;

    if (interestSaved > 0) {
      recommendations.push({
        id: `prepayment-${pct}`,
        type: 'prepayment',
        title: `${pct}% Lump Sum Prepayment`,
        description: `A one-time prepayment of ${formatINR(ppAmount)} (${pct}% of principal) in year ${year} would save ${formatINR(interestSaved)} in interest and close the loan ${monthsSaved} months earlier.`,
        impact: {
          interestSaved,
          monthsSaved,
          newClosureDate: result.closureDate,
        },
        priority: assignPriority(interestSaved),
      });
    }
  }

  return recommendations;
}

function generateRefinancingRecommendations(
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
  baseline: ReturnType<typeof calculateAmortization>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const reductions = [0.25, 0.5, 1.0, 1.5];
  const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM-dd');

  for (const reduction of reductions) {
    const newRate = loan.annualRate - reduction;
    if (newRate <= 0) continue;

    const rc: RateChange = { id: `sim-rc-${reduction}`, date: nextMonth, newRate };
    const result = calculateAmortization(loan, prePayments, [...rateChanges, rc]);
    const interestSaved = Math.round((baseline.totalInterest - result.totalInterest) * 100) / 100;
    const monthsSaved = baseline.totalMonths - result.totalMonths;

    if (interestSaved >= 50000) {
      recommendations.push({
        id: `refinance-${reduction}`,
        type: 'refinance',
        title: `Refinance at ${newRate.toFixed(2)}% (-${reduction}%)`,
        description: `Switching to a ${newRate.toFixed(2)}% rate (${reduction}% lower) would save ${formatINR(interestSaved)} in total interest and reduce tenure by ${monthsSaved} months.`,
        impact: {
          interestSaved,
          monthsSaved,
          newClosureDate: result.closureDate,
        },
        priority: assignPriority(interestSaved),
      });
    }
  }

  return recommendations;
}

function generateEmiIncreaseRecommendations(
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
  baseline: ReturnType<typeof calculateAmortization>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const increases = [5, 10, 15, 20];

  for (const pct of increases) {
    const newEmi = Math.round(loan.emi * (1 + pct / 100));
    const modifiedLoan = { ...loan, emi: newEmi };
    const validationError = validateLoan(modifiedLoan);
    if (validationError) continue;

    const result = calculateAmortization(modifiedLoan, prePayments, rateChanges);
    const interestSaved = Math.round((baseline.totalInterest - result.totalInterest) * 100) / 100;
    const monthsSaved = baseline.totalMonths - result.totalMonths;

    if (interestSaved > 0) {
      recommendations.push({
        id: `emi-increase-${pct}`,
        type: 'emi_increase',
        title: `Increase EMI by ${pct}%`,
        description: `Raising your EMI from ${formatINR(loan.emi)} to ${formatINR(newEmi)} (+${pct}%) would save ${formatINR(interestSaved)} in interest and finish ${monthsSaved} months sooner.`,
        impact: {
          interestSaved,
          monthsSaved,
          newClosureDate: result.closureDate,
        },
        priority: assignPriority(interestSaved),
      });
    }
  }

  return recommendations;
}

function generateLumpSumTimingRecommendations(
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
  baseline: ReturnType<typeof calculateAmortization>
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const lumpSum = loan.emi * 2;
  const timings = [
    { label: 'now', months: 0 },
    { label: 'in 6 months', months: 6 },
    { label: 'in 1 year', months: 12 },
  ];

  for (const timing of timings) {
    const ppDate = format(addMonths(new Date(), timing.months), 'yyyy-MM-dd');
    const pp: PrePayment = { id: `sim-ls-${timing.months}`, date: ppDate, amount: lumpSum };
    const result = calculateAmortization(loan, [...prePayments, pp], rateChanges);
    const interestSaved = Math.round((baseline.totalInterest - result.totalInterest) * 100) / 100;
    const monthsSaved = baseline.totalMonths - result.totalMonths;

    if (interestSaved > 0) {
      recommendations.push({
        id: `lump-sum-${timing.months}`,
        type: 'lump_sum_timing',
        title: `Pay ${formatINR(lumpSum)} ${timing.label}`,
        description: `A lump sum of ${formatINR(lumpSum)} (2x EMI) paid ${timing.label} saves ${formatINR(interestSaved)} in interest and ${monthsSaved} months off tenure.${timing.months === 0 ? ' Earlier is always better!' : ''}`,
        impact: {
          interestSaved,
          monthsSaved,
          newClosureDate: result.closureDate,
        },
        priority: assignPriority(interestSaved),
      });
    }
  }

  return recommendations;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { loan, prePayments = [], rateChanges = [] } = body;

    if (!loan) {
      return NextResponse.json({ error: 'Loan data is required' }, { status: 400 });
    }

    const validationError = validateLoan(loan);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const summary = generateSummary(loan, prePayments, rateChanges);
    const baseline = summary.withPrePayments;

    const recommendations: Recommendation[] = [
      ...generatePrepaymentRecommendations(loan, prePayments, rateChanges, baseline),
      ...generateRefinancingRecommendations(loan, prePayments, rateChanges, baseline),
      ...generateEmiIncreaseRecommendations(loan, prePayments, rateChanges, baseline),
      ...generateLumpSumTimingRecommendations(loan, prePayments, rateChanges, baseline),
    ];

    // Sort by interest saved (highest first)
    recommendations.sort((a, b) => b.impact.interestSaved - a.impact.interestSaved);

    return NextResponse.json({
      recommendations,
      currentSummary: {
        totalInterest: baseline.totalInterest,
        totalMonths: baseline.totalMonths,
        closureDate: baseline.closureDate,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
