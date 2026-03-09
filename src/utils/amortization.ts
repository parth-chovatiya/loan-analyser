import { addMonths, format, parseISO, lastDayOfMonth } from 'date-fns';
import type {
  LoanInput,
  PrePayment,
  RateChange,
  AmortizationRow,
  AmortizationResult,
  LoanSummary,
} from '../types/loan';

function getEmiDate(year: number, month: number, emiDay: number): Date {
  const date = new Date(year, month, 1);
  const lastDay = lastDayOfMonth(date).getDate();
  const day = Math.min(emiDay, lastDay);
  return new Date(year, month, day);
}

function groupPrePaymentsByMonth(
  prePayments: PrePayment[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const pp of prePayments) {
    const key = format(parseISO(pp.date), 'yyyy-MM');
    map.set(key, (map.get(key) || 0) + pp.amount);
  }
  return map;
}

function buildRateByMonth(
  rateChanges: RateChange[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const rc of rateChanges) {
    const key = format(parseISO(rc.date), 'yyyy-MM');
    map.set(key, rc.newRate); // last one wins if multiple in same month
  }
  return map;
}

export function calculateAmortization(
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[] = []
): AmortizationResult {
  let currentAnnualRate = loan.annualRate;
  let monthlyRate = currentAnnualRate / 100 / 12;
  const ppByMonth = groupPrePaymentsByMonth(prePayments);
  // Sort rate changes by date and build lookup
  const sortedRateChanges = [...rateChanges].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const rateByMonth = buildRateByMonth(sortedRateChanges);

  const startDate = parseISO(loan.startDate);
  let outstanding = loan.principal;
  const schedule: AmortizationRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let monthNum = 0;
  let currentDate = getEmiDate(
    startDate.getFullYear(),
    startDate.getMonth(),
    loan.emiDebitDay
  );

  // If start date is after the emi day in that month, move to next month
  if (currentDate < startDate) {
    currentDate = addMonths(currentDate, 1);
    currentDate = getEmiDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      loan.emiDebitDay
    );
  }

  const MAX_MONTHS = 600;

  while (outstanding > 0.01 && monthNum < MAX_MONTHS) {
    monthNum++;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const monthKey = format(currentDate, 'yyyy-MM');
    const openingBalance = outstanding;

    // Check for rate change this month
    const newRate = rateByMonth.get(monthKey);
    if (newRate !== undefined) {
      currentAnnualRate = newRate;
      monthlyRate = currentAnnualRate / 100 / 12;
    }

    // Apply pre-payment BEFORE interest calculation
    // In Indian home loans, pre-payment reduces the principal immediately,
    // so interest from that point is calculated on the reduced balance.
    let ppAmount = 0;
    const scheduledPP = ppByMonth.get(monthKey) || 0;
    if (scheduledPP > 0 && outstanding > 0.01) {
      ppAmount = Math.min(scheduledPP, outstanding);
      outstanding -= ppAmount;
      totalPaid += ppAmount;
    }

    const interest = outstanding * monthlyRate;
    let principalPortion: number;
    let emiPaid: number;

    if (outstanding <= 0.01) {
      // Pre-payment already cleared the loan
      emiPaid = 0;
      principalPortion = 0;
    } else if (outstanding + interest <= loan.emi) {
      // Final partial EMI
      emiPaid = outstanding + interest;
      principalPortion = outstanding;
    } else {
      emiPaid = loan.emi;
      principalPortion = loan.emi - interest;
    }

    outstanding -= principalPortion;
    totalInterest += interest;
    totalPaid += emiPaid;

    // Round near-zero to zero
    if (outstanding < 0.01) outstanding = 0;

    schedule.push({
      month: monthNum,
      date: dateStr,
      openingBalance: Math.round(openingBalance * 100) / 100,
      interestComponent: Math.round(interest * 100) / 100,
      principalComponent: Math.round(principalPortion * 100) / 100,
      prePayment: Math.round(ppAmount * 100) / 100,
      totalPayment: Math.round((emiPaid + ppAmount) * 100) / 100,
      closingBalance: Math.round(outstanding * 100) / 100,
      annualRate: currentAnnualRate,
    });

    if (outstanding <= 0) break;

    // Advance to next month
    currentDate = addMonths(currentDate, 1);
    currentDate = getEmiDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      loan.emiDebitDay
    );
  }

  const lastRow = schedule[schedule.length - 1];
  return {
    schedule,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalAmountPaid: Math.round(totalPaid * 100) / 100,
    closureDate: lastRow?.date || loan.startDate,
    totalMonths: schedule.length,
  };
}

export function generateSummary(
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[] = []
): LoanSummary {
  const withPrePayments = calculateAmortization(loan, prePayments, rateChanges);
  const withoutPrePayments = calculateAmortization(loan, [], rateChanges);

  return {
    withPrePayments,
    withoutPrePayments,
    interestSaved:
      Math.round(
        (withoutPrePayments.totalInterest - withPrePayments.totalInterest) * 100
      ) / 100,
    monthsSaved: withoutPrePayments.totalMonths - withPrePayments.totalMonths,
  };
}

export function validateLoan(loan: LoanInput): string | null {
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
}
