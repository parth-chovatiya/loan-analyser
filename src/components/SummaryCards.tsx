import type { LoanInput, LoanSummary } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  summary: LoanSummary;
  loan: LoanInput;
}

export function SummaryCards({ summary, loan }: Props) {
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  // Loan progress: how many months completed based on current date
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let monthsCompleted = 0;
  for (const row of wp.schedule) {
    if (row.date.substring(0, 7) <= nowKey) {
      monthsCompleted = row.month;
    } else {
      break;
    }
  }
  const principalRepaid =
    monthsCompleted > 0
      ? loan.principal - (wp.schedule[monthsCompleted - 1]?.closingBalance ?? 0)
      : 0;
  const progressPct = ((principalRepaid / loan.principal) * 100).toFixed(1);

  const cards = [
    {
      label: 'Total Interest',
      value: formatCurrency(wp.totalInterest),
      sub: `Original: ${formatCurrency(wop.totalInterest)}`,
      color: 'bg-red-50 border-red-200',
    },
    {
      label: 'Total Amount Paid',
      value: formatCurrency(wp.totalAmountPaid),
      sub: `Original: ${formatCurrency(wop.totalAmountPaid)}`,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Loan Closure Date',
      value: formatDate(wp.closureDate),
      sub: `Original: ${formatDate(wop.closureDate)}`,
      color: 'bg-purple-50 border-purple-200',
    },
    {
      label: 'Interest Saved',
      value: formatCurrency(summary.interestSaved),
      sub: `${((summary.interestSaved / wop.totalInterest) * 100).toFixed(1)}% reduction`,
      color: 'bg-green-50 border-green-200',
    },
    {
      label: 'Months Saved',
      value: `${summary.monthsSaved} months`,
      sub: `${wp.totalMonths} vs ${wop.totalMonths} months`,
      color: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Interest-to-Principal',
      value: `${((wp.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      sub: `Original: ${((wop.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      color: 'bg-orange-50 border-orange-200',
    },
    {
      label: 'Effective Cost',
      value: `${(wp.totalAmountPaid / loan.principal).toFixed(2)}x`,
      sub: `You pay ${(wp.totalAmountPaid / loan.principal).toFixed(2)}x the borrowed amount`,
      color: 'bg-cyan-50 border-cyan-200',
    },
    {
      label: 'Loan Progress',
      value: `${progressPct}%`,
      sub: `${monthsCompleted} months completed out of ${wp.totalMonths}`,
      color: 'bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
          <p className="mt-1 text-xs text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
