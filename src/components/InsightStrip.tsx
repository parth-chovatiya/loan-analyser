import { useMemo } from 'react';
import { Scale, CalendarClock, CalendarDays, PieChart } from 'lucide-react';
import type { AmortizationResult } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';
import { computeKeyInsights } from '../utils/insights';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  result: AmortizationResult;
}

export const InsightStrip = ({ result }: Props) => {
  const insights = useMemo(() => computeKeyInsights(result), [result]);

  const items = [
    {
      icon: <Scale className="h-4 w-4" strokeWidth={1.5} />,
      accent: 'border-violet-100 bg-violet-50/60',
      iconBg: 'bg-violet-100 text-violet-600',
      label: 'Break-even Month',
      value:
        insights.breakevenMonth !== null
          ? `#${insights.breakevenMonth}`
          : '—',
      sub:
        insights.breakevenDate !== null
          ? formatDate(insights.breakevenDate)
          : 'Interest stays higher',
      tooltip:
        'The first EMI where you pay more towards principal than interest — the turning point of your loan.',
    },
    {
      icon: <CalendarClock className="h-4 w-4" strokeWidth={1.5} />,
      accent: 'border-rose-100 bg-rose-50/60',
      iconBg: 'bg-rose-100 text-rose-600',
      label: 'Avg Monthly Interest',
      value: formatCurrency(insights.avgMonthlyInterest),
      sub: 'across full tenure',
      tooltip: 'Your total interest spread evenly across every month of the loan.',
    },
    {
      icon: <CalendarDays className="h-4 w-4" strokeWidth={1.5} />,
      accent: 'border-amber-100 bg-amber-50/60',
      iconBg: 'bg-amber-100 text-amber-600',
      label: 'Interest / Day',
      value: formatCurrency(insights.interestPerDay),
      sub: 'average daily cost',
      tooltip: 'On average, this is what your loan costs you in interest every single day.',
    },
    {
      icon: <PieChart className="h-4 w-4" strokeWidth={1.5} />,
      accent: 'border-cyan-100 bg-cyan-50/60',
      iconBg: 'bg-cyan-100 text-cyan-600',
      label: 'Interest Share',
      value: `${insights.interestSharePct.toFixed(1)}%`,
      sub: 'of total amount paid',
      tooltip: 'What portion of everything you pay to the bank is interest rather than principal.',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`group rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${item.accent}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              {item.label}
              <InfoTooltip text={item.tooltip} />
            </span>
            <div
              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg transition-transform group-hover:scale-110 ${item.iconBg}`}
            >
              {item.icon}
            </div>
          </div>
          <p className="text-base sm:text-xl font-bold tracking-tight text-slate-900">
            {item.value}
          </p>
          <p className="mt-0.5 truncate text-[10px] sm:text-xs text-slate-500">{item.sub}</p>
        </div>
      ))}
    </div>
  );
};
