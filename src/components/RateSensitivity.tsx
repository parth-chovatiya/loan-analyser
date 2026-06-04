import { useMemo } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import type { LoanInput, PrePayment, RateChange, AmortizationResult } from '../types/loan';
import { formatCurrency } from '../utils/formatters';
import { computeRateSensitivity } from '../utils/insights';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
  baseline: AmortizationResult;
}

export const RateSensitivity = ({ loan, prePayments, rateChanges, baseline }: Props) => {
  const rows = useMemo(
    () => computeRateSensitivity(loan, prePayments, rateChanges, baseline),
    [loan, prePayments, rateChanges, baseline],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/20">
          <TrendingUp className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
          Rate Sensitivity
          <InfoTooltip text="How much more you would pay in interest and how many extra months it would add if your interest rate rose across the board." />
        </h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        If your rate rose from <span className="font-semibold text-slate-700">{loan.annualRate}%</span>, here&apos;s the extra cost.
      </p>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.delta}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-colors hover:border-orange-100 hover:bg-orange-50/40"
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />+{row.delta}%
              </span>
              <span className="text-xs text-slate-500">→ {row.newRate}%</span>
            </div>
            <div className="flex items-center gap-4 text-right sm:gap-6">
              <div>
                <p className="text-sm font-bold tabular-nums text-rose-600">
                  +{formatCurrency(row.extraInterest)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">interest</p>
              </div>
              <div>
                <p className="text-sm font-bold tabular-nums text-slate-700">+{row.extraMonths}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">months</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
