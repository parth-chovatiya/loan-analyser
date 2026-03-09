export interface LoanInput {
  id: string;
  principal: number;
  annualRate: number;
  emi: number;
  emiDebitDay: number; // 1-28
  startDate: string; // ISO date string (YYYY-MM-DD)
}

export interface PrePayment {
  id: string;
  date: string; // ISO date string
  amount: number;
}

export interface RateChange {
  id: string;
  date: string; // ISO date string - effective from this month
  newRate: number; // new annual rate %
}

export interface AmortizationRow {
  month: number;
  date: string;
  openingBalance: number;
  interestComponent: number;
  principalComponent: number;
  prePayment: number;
  totalPayment: number;
  closingBalance: number;
  annualRate: number; // effective rate for this month
}

export interface AmortizationResult {
  schedule: AmortizationRow[];
  totalInterest: number;
  totalAmountPaid: number;
  closureDate: string;
  totalMonths: number;
}

export interface LoanSummary {
  withPrePayments: AmortizationResult;
  withoutPrePayments: AmortizationResult;
  interestSaved: number;
  monthsSaved: number;
}
