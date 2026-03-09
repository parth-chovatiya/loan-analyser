import { addMonths, format, parseISO, lastDayOfMonth } from 'date-fns';
import type {
  LoanInput,
  PrePayment,
  RateChange,
  AmortizationRow,
  AmortizationResult,
} from '../types/loan';

// Re-export for backward compatibility — consumers can import from here or directly
export { validateLoan } from './validation';
export { generateSummary } from './summary';

const getEmiDate = (year: number, month: number, emiDay: number): Date => {
  const lastDay = lastDayOfMonth(new Date(year, month, 1)).getDate();
  return new Date(year, month, Math.min(emiDay, lastDay));
};

const groupPrePaymentsByMonth = (prePayments: PrePayment[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const pp of prePayments) {
    const key = format(parseISO(pp.date), 'yyyy-MM');
    map.set(key, (map.get(key) || 0) + pp.amount);
  }
  return map;
};

const buildRateByMonth = (rateChanges: RateChange[]): Map<string, number> => {
  const sorted = [...rateChanges].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const map = new Map<string, number>();
  for (const rc of sorted) {
    const key = format(parseISO(rc.date), 'yyyy-MM');
    map.set(key, rc.newRate);
  }
  return map;
};

const roundTwo = (n: number): number => Math.round(n * 100) / 100;

const MAX_MONTHS = 600;

export const calculateAmortization = (
  loan: LoanInput,
  prePayments: PrePayment[],
  rateChanges: RateChange[] = [],
): AmortizationResult => {
  let currentAnnualRate = loan.annualRate;
  let monthlyRate = currentAnnualRate / 100 / 12;

  const ppByMonth = groupPrePaymentsByMonth(prePayments);
  const rateByMonth = buildRateByMonth(rateChanges);

  const startDate = parseISO(loan.startDate);
  let outstanding = loan.principal;
  const schedule: AmortizationRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let monthNum = 0;

  let currentDate = getEmiDate(startDate.getFullYear(), startDate.getMonth(), loan.emiDebitDay);

  // If start date is after the EMI day in that month, move to next month
  if (currentDate < startDate) {
    currentDate = addMonths(currentDate, 1);
    currentDate = getEmiDate(currentDate.getFullYear(), currentDate.getMonth(), loan.emiDebitDay);
  }

  while (outstanding > 0.01 && monthNum < MAX_MONTHS) {
    monthNum++;
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const monthKey = format(currentDate, 'yyyy-MM');
    const openingBalance = outstanding;

    // Apply rate change if scheduled this month
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
      emiPaid = 0;
      principalPortion = 0;
    } else if (outstanding + interest <= loan.emi) {
      emiPaid = outstanding + interest;
      principalPortion = outstanding;
    } else {
      emiPaid = loan.emi;
      principalPortion = loan.emi - interest;
    }

    outstanding -= principalPortion;
    totalInterest += interest;
    totalPaid += emiPaid;

    if (outstanding < 0.01) outstanding = 0;

    schedule.push({
      month: monthNum,
      date: dateStr,
      openingBalance: roundTwo(openingBalance),
      interestComponent: roundTwo(interest),
      principalComponent: roundTwo(principalPortion),
      prePayment: roundTwo(ppAmount),
      totalPayment: roundTwo(emiPaid + ppAmount),
      closingBalance: roundTwo(outstanding),
      annualRate: currentAnnualRate,
    });

    if (outstanding <= 0) break;

    currentDate = addMonths(currentDate, 1);
    currentDate = getEmiDate(currentDate.getFullYear(), currentDate.getMonth(), loan.emiDebitDay);
  }

  const lastRow = schedule[schedule.length - 1];
  return {
    schedule,
    totalInterest: roundTwo(totalInterest),
    totalAmountPaid: roundTwo(totalPaid),
    closureDate: lastRow?.date || loan.startDate,
    totalMonths: schedule.length,
  };
};
