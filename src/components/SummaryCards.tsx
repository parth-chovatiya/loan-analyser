import type { LoanInput, LoanSummary } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  summary: LoanSummary;
  loan: LoanInput;
}

export const SummaryCards = ({ summary, loan }: Props) => {
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

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
      sub: `was ${formatCurrency(wop.totalInterest)}`,
      tooltip:
        'The total interest you will pay over the entire loan tenure after all pre-payments.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      ),
      accent: 'text-rose-600 bg-rose-50 border-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    {
      label: 'Interest Saved',
      value: formatCurrency(summary.interestSaved),
      sub: `${((summary.interestSaved / wop.totalInterest) * 100).toFixed(1)}% reduction`,
      tooltip:
        'How much interest you are saving compared to the original schedule, thanks to your pre-payments.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      ),
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Closure Date',
      value: formatDate(wp.closureDate),
      sub: `was ${formatDate(wop.closureDate)}`,
      tooltip:
        'The estimated date when your loan will be fully paid off with current pre-payments.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
      accent: 'text-violet-600 bg-violet-50 border-violet-100',
      iconBg: 'bg-violet-100 text-violet-600',
    },
    {
      label: 'Months Saved',
      value: `${summary.monthsSaved}`,
      sub: `${wp.totalMonths} vs ${wop.totalMonths} months`,
      tooltip:
        'The number of EMI months you have cut from your loan tenure by making pre-payments.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(wp.totalAmountPaid),
      sub: `was ${formatCurrency(wop.totalAmountPaid)}`,
      tooltip:
        'The total amount you will pay to the bank including principal, interest, and all pre-payments.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      ),
      accent: 'text-blue-600 bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Effective Cost',
      value: `${(wp.totalAmountPaid / loan.principal).toFixed(2)}x`,
      sub: `of borrowed amount`,
      tooltip:
        'How many times the borrowed amount you end up paying. For example, 1.50x means you pay 50% extra as interest.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
          />
        </svg>
      ),
      accent: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      iconBg: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Interest Ratio',
      value: `${((wp.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      sub: `was ${((wop.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      tooltip:
        'Interest as a percentage of your borrowed amount. Lower is better — it shows how efficiently you are repaying.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
          />
        </svg>
      ),
      accent: 'text-orange-600 bg-orange-50 border-orange-100',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Progress',
      value: `${progressPct}%`,
      sub: `${monthsCompleted} of ${wp.totalMonths} months`,
      tooltip: 'How much of your loan principal you have repaid so far based on the current date.',
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
      ),
      accent: 'text-teal-600 bg-teal-50 border-teal-100',
      iconBg: 'bg-teal-100 text-teal-600',
      progress: Number(progressPct),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${card.accent}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-70">
              {card.label}
              <InfoTooltip text={card.tooltip} />
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg} transition-transform group-hover:scale-110`}
            >
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-1 text-xs opacity-60">{card.sub}</p>
          {'progress' in card && (
            <div className="mt-3 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-current transition-all duration-700"
                style={{ width: `${Math.min(card.progress ?? 0, 100)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
