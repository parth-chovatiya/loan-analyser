import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import type { LoanSummary, AmortizationResult } from '../../types/loan';
import { formatCurrency, formatCurrencyShort, formatDate } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
  simulatedResult?: AmortizationResult | null;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

export const BalanceChart = ({ summary, simulatedResult }: Props) => {
  const { withPrePayments } = summary;
  const isMobile = useIsMobile();

  const currentMonthKey = format(new Date(), 'yyyy-MM');

  const maxLen = Math.max(
    withPrePayments.schedule.length,
    simulatedResult?.schedule.length ?? 0,
  );

  let currentMonthIndex: number | null = null;

  const data = Array.from({ length: maxLen }, (_, i) => {
    const dateStr =
      withPrePayments.schedule[i]?.date ??
      simulatedResult?.schedule[i]?.date ??
      '';
    const monthKey = dateStr.substring(0, 7);
    if (monthKey === currentMonthKey) {
      currentMonthIndex = i + 1;
    }
    const entry: Record<string, number | string> = {
      month: i + 1,
      label: dateStr ? formatDate(dateStr) : '',
      withPP: withPrePayments.schedule[i]?.closingBalance ?? 0,
    };
    if (simulatedResult) {
      entry.simulated = simulatedResult.schedule[i]?.closingBalance ?? 0;
    }
    return entry;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-slate-900">Outstanding Balance</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
        <LineChart data={data} margin={isMobile ? { left: -10, right: 5, top: 5, bottom: 5 } : undefined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            label={isMobile ? undefined : { value: 'Month', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyShort(v)}
            width={isMobile ? 55 : 80}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(_: unknown, payload: readonly { payload?: { label?: string } }[]) =>
              payload?.[0]?.payload?.label || ''
            }
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend
            iconSize={isMobile ? 8 : 14}
            wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: 8 }}
          />
          {currentMonthIndex !== null && (
            <ReferenceLine
              x={currentMonthIndex}
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={isMobile ? undefined : { value: 'Now', position: 'top', fill: '#2563eb', fontWeight: 'bold' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="withPP"
            name="Balance"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          {simulatedResult && (
            <Line
              type="monotone"
              dataKey="simulated"
              name="Simulated"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
