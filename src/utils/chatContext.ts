import { addMonths, format, parseISO } from 'date-fns';
import type { LoanInput, PrePayment, RateChange, AmortizationRow } from '../types/loan';
import type { ScenarioIntent } from '../types/chat';
import { calculateAmortization } from './amortization';
import { generateSummary } from './summary';

interface YearlyBreakdown {
  year: number;
  interestPaid: number;
  principalPaid: number;
  prePayments: number;
  openingBalance: number;
  closingBalance: number;
}

interface EnrichedContext {
  summary: string;
  yearlyBreakdown: string;
  prePaymentDetails: string;
  rateChangeTimeline: string;
  milestones: string;
  currentStatus: string;
}

const formatINR = (n: number): string => `₹${n.toLocaleString('en-IN')}`;

const getYearlyBreakdown = (schedule: AmortizationRow[]): YearlyBreakdown[] => {
  const byYear = new Map<number, AmortizationRow[]>();
  for (const row of schedule) {
    const year = parseISO(row.date).getFullYear();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(row);
  }

  const result: YearlyBreakdown[] = [];
  for (const [year, rows] of byYear) {
    result.push({
      year,
      interestPaid: Math.round(rows.reduce((s, r) => s + r.interestComponent, 0) * 100) / 100,
      principalPaid: Math.round(rows.reduce((s, r) => s + r.principalComponent, 0) * 100) / 100,
      prePayments: Math.round(rows.reduce((s, r) => s + r.prePayment, 0) * 100) / 100,
      openingBalance: rows[0].openingBalance,
      closingBalance: rows[rows.length - 1].closingBalance,
    });
  }
  return result;
};

const getMilestones = (schedule: AmortizationRow[], principal: number): string[] => {
  const thresholds = [0.75, 0.5, 0.25];
  const milestones: string[] = [];
  const found = new Set<number>();

  for (const row of schedule) {
    for (const t of thresholds) {
      if (!found.has(t) && row.closingBalance <= principal * t) {
        found.add(t);
        milestones.push(
          `Outstanding drops below ${(t * 100).toFixed(0)}% (${formatINR(principal * t)}) by ${row.date} (month ${row.month})`,
        );
      }
    }
  }
  return milestones;
};

const getCurrentStatus = (schedule: AmortizationRow[], today: Date): string => {
  const todayStr = format(today, 'yyyy-MM');
  let monthsElapsed = 0;
  let interestPaidSoFar = 0;
  let principalPaidSoFar = 0;
  let prePaymentsSoFar = 0;
  let currentOutstanding = schedule.length > 0 ? schedule[0].openingBalance : 0;

  for (const row of schedule) {
    const rowMonth = row.date.substring(0, 7); // yyyy-MM
    if (rowMonth > todayStr) break;
    monthsElapsed++;
    interestPaidSoFar += row.interestComponent;
    principalPaidSoFar += row.principalComponent;
    prePaymentsSoFar += row.prePayment;
    currentOutstanding = row.closingBalance;
  }

  return [
    `Months elapsed: ${monthsElapsed}`,
    `Current outstanding balance: ${formatINR(Math.round(currentOutstanding * 100) / 100)}`,
    `Interest paid so far: ${formatINR(Math.round(interestPaidSoFar * 100) / 100)}`,
    `Principal paid so far: ${formatINR(Math.round(principalPaidSoFar * 100) / 100)}`,
    `Pre-payments made so far: ${formatINR(Math.round(prePaymentsSoFar * 100) / 100)}`,
  ].join('\n');
};

export const buildEnrichedContext = (
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
): EnrichedContext => {
  const loanSummary = generateSummary(loan, prePayments, rateChanges);
  const wp = loanSummary.withPrePayments;
  const wop = loanSummary.withoutPrePayments;

  const summaryText = [
    `Principal: ${formatINR(loan.principal)}`,
    `Annual Interest Rate: ${loan.annualRate}%`,
    `Monthly EMI: ${formatINR(loan.emi)}`,
    `Loan Start Date: ${loan.startDate}`,
    `EMI Debit Day: ${loan.emiDebitDay}`,
    ``,
    `--- With Pre-Payments ---`,
    `Total Interest: ${formatINR(wp.totalInterest)}`,
    `Total Amount Paid: ${formatINR(wp.totalAmountPaid)}`,
    `Closure Date: ${wp.closureDate}`,
    `Tenure: ${wp.totalMonths} months`,
    ``,
    `--- Without Pre-Payments ---`,
    `Total Interest: ${formatINR(wop.totalInterest)}`,
    `Total Amount Paid: ${formatINR(wop.totalAmountPaid)}`,
    `Closure Date: ${wop.closureDate}`,
    `Tenure: ${wop.totalMonths} months`,
    ``,
    `--- Savings from Pre-Payments ---`,
    `Interest Saved: ${formatINR(loanSummary.interestSaved)}`,
    `Months Saved: ${loanSummary.monthsSaved}`,
  ].join('\n');

  const yearly = getYearlyBreakdown(wp.schedule);
  const yearlyText = yearly
    .map(
      (y) =>
        `Year ${y.year}: Interest=${formatINR(y.interestPaid)}, Principal=${formatINR(y.principalPaid)}, PrePayments=${formatINR(y.prePayments)}, Opening=${formatINR(y.openingBalance)}, Closing=${formatINR(y.closingBalance)}`,
    )
    .join('\n');

  const ppText =
    prePayments.length > 0
      ? prePayments
          .map((pp) => {
            const row = wp.schedule.find((r) => r.date.startsWith(pp.date.substring(0, 7)));
            const balanceAfter = row ? row.closingBalance : 'N/A';
            return `${pp.date}: ${formatINR(pp.amount)} → Balance after: ${typeof balanceAfter === 'number' ? formatINR(balanceAfter) : balanceAfter}`;
          })
          .join('\n')
      : 'No pre-payments configured.';

  const rcText =
    rateChanges.length > 0
      ? rateChanges.map((rc) => `${rc.date}: Rate changed to ${rc.newRate}%`).join('\n')
      : 'No rate changes configured.';

  const milestonesList = getMilestones(wp.schedule, loan.principal);
  const milestonesText =
    milestonesList.length > 0 ? milestonesList.join('\n') : 'No milestones reached yet.';

  const currentStatusText = getCurrentStatus(wp.schedule, new Date());

  return {
    summary: summaryText,
    yearlyBreakdown: yearlyText,
    prePaymentDetails: ppText,
    rateChangeTimeline: rcText,
    milestones: milestonesText,
    currentStatus: currentStatusText,
  };
};

const WHATIF_KEYWORDS = [
  'what if',
  'what-if',
  'whatif',
  'prepay',
  'pre-pay',
  'lump sum',
  'lumpsum',
  'extra payment',
  'hypothetical',
  'scenario',
  'suppose',
  'if i pay',
  'if i make',
  'rate change',
  'rate goes',
  'rate becomes',
  'rate drops',
  'rate increases',
  'rate reduce',
  'close in',
  'complete in',
  'finish in',
  'pay off in',
  'close within',
  'complete within',
  'finish within',
  'pay off within',
  'foreclose',
  'early closure',
  'next 5 year',
  'next 3 year',
  'next 2 year',
  'how to close',
  'how to complete',
  'how to finish',
  'how to pay off',
  'want to close',
  'want to complete',
  'want to finish',
];

export const hasWhatIfKeywords = (message: string): boolean => {
  const lower = message.toLowerCase();
  return WHATIF_KEYWORDS.some((kw) => lower.includes(kw));
};

export const computeScenario = (
  intent: ScenarioIntent,
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[],
): string | null => {
  if (intent.type === 'none') return null;

  const currentResult = calculateAmortization(loan, prePayments, rateChanges);

  if (intent.type === 'prepayment_whatif' && intent.prepaymentAmount) {
    const hypotheticalPP: PrePayment = {
      id: 'hypothetical',
      date: intent.prepaymentDate || format(new Date(), 'yyyy-MM-dd'),
      amount: intent.prepaymentAmount,
    };
    const newPrePayments = [...prePayments, hypotheticalPP];
    const newResult = calculateAmortization(loan, newPrePayments, rateChanges);

    const interestSaved =
      Math.round((currentResult.totalInterest - newResult.totalInterest) * 100) / 100;
    const monthsSaved = currentResult.totalMonths - newResult.totalMonths;

    return [
      `=== What-If Scenario: Pre-payment of ${formatINR(intent.prepaymentAmount)} on ${hypotheticalPP.date} ===`,
      `Current total interest: ${formatINR(currentResult.totalInterest)}`,
      `New total interest: ${formatINR(newResult.totalInterest)}`,
      `Interest saved by this pre-payment: ${formatINR(interestSaved)}`,
      `Current closure date: ${currentResult.closureDate}`,
      `New closure date: ${newResult.closureDate}`,
      `Months saved: ${monthsSaved}`,
      `New total tenure: ${newResult.totalMonths} months`,
    ].join('\n');
  }

  if (intent.type === 'target_closure' && intent.targetYears) {
    const targetMonths = intent.targetYears * 12;
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM');

    // Find current outstanding balance
    let currentOutstanding = loan.principal;
    for (const row of currentResult.schedule) {
      if (row.date.substring(0, 7) > todayStr) break;
      currentOutstanding = row.closingBalance;
    }

    // Find remaining months in current plan from today
    const remainingMonths = currentResult.schedule.filter(
      (r) => r.date.substring(0, 7) > todayStr,
    ).length;

    if (targetMonths >= remainingMonths) {
      return [
        `=== Target Closure: ${intent.targetYears} years ===`,
        `Your loan already closes in ${remainingMonths} months (~${Math.ceil(remainingMonths / 12)} years) from now.`,
        `Current outstanding: ${formatINR(Math.round(currentOutstanding * 100) / 100)}`,
        `Current closure date: ${currentResult.closureDate}`,
        `No additional pre-payments needed — your loan will close before the target.`,
      ].join('\n');
    }

    // Binary search for the monthly prepayment amount needed
    const targetDate = addMonths(today, targetMonths);
    const targetDateStr = format(targetDate, 'yyyy-MM');
    let low = 0;
    let high = currentOutstanding;

    const testAmount = (amount: number): boolean => {
      const testPPs: PrePayment[] = [...prePayments];
      for (let m = 1; m <= targetMonths; m++) {
        const ppDate = addMonths(today, m);
        testPPs.push({
          id: `target-${m}`,
          date: format(ppDate, 'yyyy-MM-dd'),
          amount,
        });
      }
      const result = calculateAmortization(loan, testPPs, rateChanges);
      return result.closureDate.substring(0, 7) <= targetDateStr;
    };

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      if (testAmount(mid)) {
        high = mid;
      } else {
        low = mid;
      }
    }

    const requiredMonthlyPP = Math.ceil(high / 100) * 100; // Round up to nearest 100

    // Compute exact result with this prepayment
    const finalPPs: PrePayment[] = [...prePayments];
    for (let m = 1; m <= targetMonths; m++) {
      const ppDate = addMonths(today, m);
      finalPPs.push({
        id: `target-${m}`,
        date: format(ppDate, 'yyyy-MM-dd'),
        amount: requiredMonthlyPP,
      });
    }
    const finalResult = calculateAmortization(loan, finalPPs, rateChanges);
    const interestSaved =
      Math.round((currentResult.totalInterest - finalResult.totalInterest) * 100) / 100;
    const totalExtraPaid = requiredMonthlyPP * targetMonths;

    return [
      `=== Target Closure: Complete loan in ${intent.targetYears} years ===`,
      `Current outstanding: ${formatINR(Math.round(currentOutstanding * 100) / 100)}`,
      `Current closure date: ${currentResult.closureDate} (${remainingMonths} months from now)`,
      ``,
      `To close in ${intent.targetYears} years (${targetMonths} months):`,
      `Required monthly pre-payment (in addition to EMI): ~${formatINR(requiredMonthlyPP)}`,
      `Total extra amount to pay: ~${formatINR(totalExtraPaid)}`,
      `Your monthly outgo would be: EMI ${formatINR(loan.emi)} + Pre-payment ${formatINR(requiredMonthlyPP)} = ${formatINR(loan.emi + requiredMonthlyPP)}`,
      ``,
      `New closure date: ${finalResult.closureDate}`,
      `New total interest: ${formatINR(finalResult.totalInterest)}`,
      `Interest saved vs current plan: ${formatINR(interestSaved)}`,
    ].join('\n');
  }

  if (intent.type === 'rate_change_whatif' && intent.newRate) {
    const hypotheticalRC: RateChange = {
      id: 'hypothetical',
      date: intent.rateChangeDate || format(new Date(), 'yyyy-MM-dd'),
      newRate: intent.newRate,
    };
    const newRateChanges = [...rateChanges, hypotheticalRC];
    const newResult = calculateAmortization(loan, prePayments, newRateChanges);

    const interestDiff =
      Math.round((newResult.totalInterest - currentResult.totalInterest) * 100) / 100;
    const monthsDiff = newResult.totalMonths - currentResult.totalMonths;

    return [
      `=== What-If Scenario: Rate change to ${intent.newRate}% from ${hypotheticalRC.date} ===`,
      `Current total interest: ${formatINR(currentResult.totalInterest)}`,
      `New total interest: ${formatINR(newResult.totalInterest)}`,
      `Interest difference: ${interestDiff > 0 ? '+' : ''}${formatINR(interestDiff)} ${interestDiff > 0 ? '(more)' : '(saved)'}`,
      `Current closure date: ${currentResult.closureDate}`,
      `New closure date: ${newResult.closureDate}`,
      `Tenure difference: ${monthsDiff > 0 ? '+' : ''}${monthsDiff} months`,
    ].join('\n');
  }

  return null;
};
