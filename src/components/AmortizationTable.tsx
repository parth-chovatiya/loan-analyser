import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Table2 } from 'lucide-react';
import type { AmortizationRow } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  schedule: AmortizationRow[];
  isSimulated?: boolean;
  actualScheduleLength?: number;
  plannedPPMonths?: Set<string>;
}

const getCurrentMonthKey = (): string => {
  return format(new Date(), 'yyyy-MM');
};

export const AmortizationTable = ({
  schedule,
  isSimulated,
  actualScheduleLength,
  plannedPPMonths,
}: Props) => {
  const currentMonthKey = getCurrentMonthKey();
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [schedule]);

  const hasRateChanges =
    schedule.length > 1 &&
    schedule.some((row, i) => i > 0 && row.annualRate !== schedule[i - 1].annualRate);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Table2 className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Amortization Schedule
              {isSimulated && (
                <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  (simulated)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              {schedule.length} months
              {isSimulated && actualScheduleLength && actualScheduleLength !== schedule.length && (
                <span className="text-amber-600"> (was {actualScheduleLength})</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-2 sm:px-4">#</th>
              <th className="py-3 px-2 sm:px-3">Date</th>
              {hasRateChanges && (
                <th className="hidden md:table-cell py-3 px-3 text-right">Rate</th>
              )}
              <th className="hidden md:table-cell py-3 px-3 text-right">Opening</th>
              <th className="py-3 px-2 sm:px-3 text-right">Interest</th>
              <th className="py-3 px-2 sm:px-3 text-right">Principal</th>
              <th className="py-3 px-2 sm:px-3 text-right">Pre-Pay</th>
              <th className="hidden lg:table-cell py-3 px-3 text-right">Total</th>
              <th className="hidden lg:table-cell py-3 px-3 text-right">Cum. Interest</th>
              <th className="hidden lg:table-cell py-3 px-3 text-right">Cum. Principal</th>
              <th className="py-3 px-2 sm:px-3 text-right">Closing</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cumulativeInterest = 0;
              let cumulativePrincipal = 0;
              return schedule.map((row) => {
                cumulativeInterest += row.interestComponent;
                cumulativePrincipal += row.principalComponent + row.prePayment;
                const rowMonthKey = row.date.substring(0, 7);
                const isCurrentMonth = rowMonthKey === currentMonthKey;
                const rateChanged =
                  hasRateChanges &&
                  row.month > 1 &&
                  row.annualRate !== schedule[row.month - 2]?.annualRate;
                const isPlannedPP = plannedPPMonths?.has(rowMonthKey) && row.prePayment > 0;

                let rowClass = 'border-b border-slate-50 transition-colors hover:bg-slate-50/80';
                if (isCurrentMonth) {
                  rowClass = 'bg-blue-50 border-b border-blue-100 ring-1 ring-inset ring-blue-200';
                } else if (isPlannedPP) {
                  rowClass =
                    'bg-amber-50/60 border-b border-amber-100 border-l-2 border-l-amber-400';
                } else if (row.prePayment > 0) {
                  rowClass = 'bg-emerald-50/40 border-b border-emerald-50';
                } else if (rateChanged) {
                  rowClass = 'bg-indigo-50/40 border-b border-indigo-50';
                }

                return (
                  <tr
                    key={row.month}
                    ref={isCurrentMonth ? currentRowRef : undefined}
                    className={rowClass}
                  >
                    <td className="py-2.5 px-2 sm:px-4 text-slate-400 text-xs">
                      {isCurrentMonth ? (
                        <span className="inline-flex items-center gap-1.5">
                          {row.month}
                          <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                            NOW
                          </span>
                        </span>
                      ) : isPlannedPP ? (
                        <span className="inline-flex items-center gap-1.5">
                          {row.month}
                          <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                            PLAN
                          </span>
                        </span>
                      ) : (
                        row.month
                      )}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 whitespace-nowrap text-xs">
                      {formatDate(row.date)}
                    </td>
                    {hasRateChanges && (
                      <td
                        className={`hidden md:table-cell py-2.5 px-3 text-right tabular-nums text-xs ${rateChanged ? 'font-bold text-indigo-600' : 'text-slate-400'}`}
                      >
                        {row.annualRate}%
                      </td>
                    )}
                    <td className="hidden md:table-cell py-2.5 px-3 text-right tabular-nums text-xs">
                      {formatCurrency(row.openingBalance)}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-right tabular-nums text-xs text-rose-600">
                      {formatCurrency(row.interestComponent)}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-right tabular-nums text-xs text-emerald-600">
                      {formatCurrency(row.principalComponent)}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-right tabular-nums text-xs">
                      {row.prePayment > 0 ? (
                        <span
                          className={`font-semibold ${isPlannedPP ? 'text-amber-600' : 'text-blue-600'}`}
                        >
                          {formatCurrency(row.prePayment)}
                        </span>
                      ) : (
                        <span className="text-slate-200">-</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell py-2.5 px-3 text-right tabular-nums text-xs font-medium">
                      {formatCurrency(row.totalPayment)}
                    </td>
                    <td className="hidden lg:table-cell py-2.5 px-3 text-right tabular-nums text-xs text-rose-500">
                      {formatCurrency(cumulativeInterest)}
                    </td>
                    <td className="hidden lg:table-cell py-2.5 px-3 text-right tabular-nums text-xs text-emerald-600">
                      {formatCurrency(cumulativePrincipal)}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 text-right tabular-nums text-xs font-bold text-slate-700">
                      {formatCurrency(row.closingBalance)}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};
