import type { LoanSummary } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  summary: LoanSummary;
}

export function SummaryCards({ summary }: Props) {
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  const cards = [
    {
      label: 'Total Interest',
      value: formatCurrency(wp.totalInterest),
      sub: `Without pre-payments: ${formatCurrency(wop.totalInterest)}`,
      color: 'bg-red-50 border-red-200',
    },
    {
      label: 'Total Amount Paid',
      value: formatCurrency(wp.totalAmountPaid),
      sub: `Without pre-payments: ${formatCurrency(wop.totalAmountPaid)}`,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Loan Closure Date',
      value: formatDate(wp.closureDate),
      sub: `Without pre-payments: ${formatDate(wop.closureDate)}`,
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
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 ${card.color}`}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {card.label}
          </p>
          <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
          <p className="mt-1 text-xs text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
