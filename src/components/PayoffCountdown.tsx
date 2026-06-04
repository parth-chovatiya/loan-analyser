import { useMemo } from 'react';
import { Flag, CalendarCheck } from 'lucide-react';
import type { LoanInput, AmortizationResult } from '../types/loan';
import { formatDateFull } from '../utils/formatters';
import { computeCountdown, computeProgress } from '../utils/insights';

interface Props {
  result: AmortizationResult;
  loan: LoanInput;
  isSimulated?: boolean;
}

export const PayoffCountdown = ({ result, loan, isSimulated }: Props) => {
  const countdown = useMemo(() => computeCountdown(result), [result]);
  const progress = useMemo(() => computeProgress(result, loan), [result, loan]);

  const remainingLabel = countdown.isPaidOff
    ? 'Loan fully paid'
    : [
        countdown.years > 0 ? `${countdown.years} yr${countdown.years > 1 ? 's' : ''}` : null,
        `${countdown.months} mo${countdown.months !== 1 ? 's' : ''}`,
      ]
        .filter(Boolean)
        .join(' ');

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-600 p-5 sm:p-6 text-white shadow-md shadow-blue-600/20 transition-shadow hover:shadow-lg hover:shadow-blue-600/25">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur transition-transform group-hover:scale-105">
            <Flag className="h-6 w-6" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-100">
              Loan-Free Date
              {isSimulated && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] normal-case tracking-normal">
                  simulated
                </span>
              )}
            </p>
            <p className="mt-1 flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight">
              <CalendarCheck className="h-6 w-6 text-blue-200" />
              {formatDateFull(countdown.closureDate)}
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-2.5 text-left ring-1 ring-white/15 backdrop-blur sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-100">Time Remaining</p>
          <p className="mt-0.5 text-xl sm:text-2xl font-bold">{remainingLabel}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-blue-100">
          <span>
            {progress.monthsCompleted} of {progress.totalMonths} months paid
          </span>
          <span className="font-semibold text-white">{progress.progressPct.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${progress.progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
