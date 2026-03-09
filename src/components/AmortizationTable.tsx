import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import type { AmortizationRow } from '../types/loan';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  schedule: AmortizationRow[];
  isSimulated?: boolean;
  actualScheduleLength?: number;
  plannedPPMonths?: Set<string>;
}

function getCurrentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

export function AmortizationTable({
  schedule,
  isSimulated,
  actualScheduleLength,
  plannedPPMonths,
}: Props) {
  const currentMonthKey = getCurrentMonthKey();
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [schedule]);

  // Detect if rates change across the schedule
  const hasRateChanges = schedule.length > 1 &&
    schedule.some((row, i) => i > 0 && row.annualRate !== schedule[i - 1].annualRate);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6 pb-0">
        <h2 className="text-lg font-semibold text-gray-900">
          Amortization Schedule
          {isSimulated && (
            <span className="ml-2 text-sm font-normal text-amber-600">(simulated)</span>
          )}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {schedule.length} months
          {isSimulated && actualScheduleLength && actualScheduleLength !== schedule.length && (
            <span className="text-amber-600">
              {' '}(was {actualScheduleLength} months)
            </span>
          )}
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="pb-2 pr-3 font-medium">#</th>
              <th className="pb-2 pr-3 font-medium">Date</th>
              {hasRateChanges && (
                <th className="pb-2 pr-3 font-medium text-right">Rate</th>
              )}
              <th className="pb-2 pr-3 font-medium text-right">Opening Bal.</th>
              <th className="pb-2 pr-3 font-medium text-right">Interest</th>
              <th className="pb-2 pr-3 font-medium text-right">Principal</th>
              <th className="pb-2 pr-3 font-medium text-right">Pre-Payment</th>
              <th className="pb-2 pr-3 font-medium text-right">Total Paid</th>
              <th className="pb-2 pr-3 font-medium text-right">Total Interest Paid</th>
              <th className="pb-2 pr-3 font-medium text-right">Total Principal Paid</th>
              <th className="pb-2 font-medium text-right">Closing Bal.</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cumulativeInterest = 0;
              let cumulativePrincipal = 0;
              return schedule.map((row) => {
                cumulativeInterest += row.interestComponent;
                cumulativePrincipal += row.principalComponent + row.prePayment;
                const rowMonthKey = row.date.substring(0, 7); // yyyy-MM
                const isCurrentMonth = rowMonthKey === currentMonthKey;
                const rateChanged =
                  hasRateChanges &&
                  row.month > 1 &&
                  row.annualRate !== schedule[row.month - 2]?.annualRate;
                const isPlannedPP = plannedPPMonths?.has(rowMonthKey) && row.prePayment > 0;

                let rowClass = 'border-b border-gray-100 last:border-0';
                if (isCurrentMonth) {
                  rowClass += ' bg-blue-100 ring-2 ring-blue-400 ring-inset';
                } else if (isPlannedPP) {
                  rowClass += ' bg-amber-50 border-l-4 border-l-amber-400';
                } else if (row.prePayment > 0) {
                  rowClass += ' bg-green-50';
                } else if (rateChanged) {
                  rowClass += ' bg-indigo-50';
                }

                return (
                  <tr
                    key={row.month}
                    ref={isCurrentMonth ? currentRowRef : undefined}
                    className={rowClass}
                  >
                    <td className="py-2 pr-3 text-gray-500">
                      {isCurrentMonth ? (
                        <span className="inline-flex items-center gap-1">
                          {row.month}
                          <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                            NOW
                          </span>
                        </span>
                      ) : isPlannedPP ? (
                        <span className="inline-flex items-center gap-1">
                          {row.month}
                          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                            PLAN
                          </span>
                        </span>
                      ) : (
                        row.month
                      )}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>
                    {hasRateChanges && (
                      <td className={`py-2 pr-3 text-right tabular-nums ${rateChanged ? 'font-semibold text-indigo-700' : 'text-gray-500'}`}>
                        {row.annualRate}%
                      </td>
                    )}
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatCurrency(row.openingBalance)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-red-600">
                      {formatCurrency(row.interestComponent)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-green-700">
                      {formatCurrency(row.principalComponent)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {row.prePayment > 0 ? (
                        <span className={`font-medium ${isPlannedPP ? 'text-amber-600' : 'text-blue-600'}`}>
                          {formatCurrency(row.prePayment)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatCurrency(row.totalPayment)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-red-600">
                      {formatCurrency(cumulativeInterest)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-green-700">
                      {formatCurrency(cumulativePrincipal)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
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
}
