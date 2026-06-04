import {
  Landmark,
  ShieldCheck,
  CalendarDays,
  Clock,
  BarChart3,
  Layers,
  Percent,
  TrendingUp,
} from 'lucide-react';
import type { LoanInput, LoanSummary } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';
import { computeProgress } from '../utils/insights';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  summary: LoanSummary;
  loan: LoanInput;
}

export const SummaryCards = ({ summary, loan }: Props) => {
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  const { monthsCompleted, progressPct: progressPctNum } = computeProgress(wp, loan);
  const progressPct = progressPctNum.toFixed(1);

  const cards = [
    {
      label: 'Total Interest',
      value: formatCurrency(wp.totalInterest),
      sub: `was ${formatCurrency(wop.totalInterest)}`,
      tooltip:
        'The total interest you will pay over the entire loan tenure after all pre-payments.',
      icon: <Landmark className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-rose-600 bg-rose-50 border-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    {
      label: 'Interest Saved',
      value: formatCurrency(summary.interestSaved),
      sub: `${((summary.interestSaved / wop.totalInterest) * 100).toFixed(1)}% reduction vs original schedule`,
      tooltip:
        'How much interest you are saving compared to the original schedule, thanks to your pre-payments.',
      icon: <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Closure Date',
      value: formatDate(wp.closureDate),
      sub: `was ${formatDate(wop.closureDate)}`,
      tooltip:
        'The estimated date when your loan will be fully paid off with current pre-payments.',
      icon: <CalendarDays className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-violet-600 bg-violet-50 border-violet-100',
      iconBg: 'bg-violet-100 text-violet-600',
    },
    {
      label: 'Months Saved',
      value: `${summary.monthsSaved}`,
      sub: `${wp.totalMonths} vs ${wop.totalMonths} months`,
      tooltip:
        'The number of EMI months you have cut from your loan tenure by making pre-payments.',
      icon: <Clock className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(wp.totalAmountPaid),
      sub: `was ${formatCurrency(wop.totalAmountPaid)}`,
      tooltip:
        'The total amount you will pay to the bank including principal, interest, and all pre-payments.',
      icon: <BarChart3 className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-blue-600 bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Effective Cost',
      value: `${(wp.totalAmountPaid / loan.principal).toFixed(2)}x`,
      sub: `of borrowed amount`,
      tooltip:
        'How many times the borrowed amount you end up paying. For example, 1.50x means you pay 50% extra as interest.',
      icon: <Layers className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      iconBg: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Interest Ratio',
      value: `${((wp.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      sub: `was ${((wop.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      tooltip:
        'Interest as a percentage of your borrowed amount. Lower is better — it shows how efficiently you are repaying.',
      icon: <Percent className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-orange-600 bg-orange-50 border-orange-100',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Progress',
      value: `${progressPct}%`,
      sub: `${monthsCompleted} of ${wp.totalMonths} months`,
      tooltip: 'How much of your loan principal you have repaid so far based on the current date.',
      icon: <TrendingUp className="h-5 w-5" strokeWidth={1.5} />,
      accent: 'text-teal-600 bg-teal-50 border-teal-100',
      iconBg: 'bg-teal-100 text-teal-600',
      progress: Number(progressPct),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`group rounded-xl sm:rounded-2xl border p-3 sm:p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${card.accent}`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-70">
              {card.label}
              <InfoTooltip text={card.tooltip} />
            </span>
            <div
              className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg ${card.iconBg} transition-transform group-hover:scale-110 [&_svg]:h-3.5 [&_svg]:w-3.5 sm:[&_svg]:h-5 sm:[&_svg]:w-5`}
            >
              {card.icon}
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-bold tracking-tight">{card.value}</p>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs opacity-60 truncate">{card.sub}</p>
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
