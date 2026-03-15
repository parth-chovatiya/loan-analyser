import { useMemo, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

const buildCumulativeData = (summary: LoanSummary, simulatedResult?: AmortizationResult | null) => {
  const { withPrePayments } = summary;

  const maxLen = Math.max(
    withPrePayments.schedule.length,
    simulatedResult?.schedule.length ?? 0,
  );

  let cumActual = 0;
  let cumSimulated = 0;

  return Array.from({ length: maxLen }, (_, i) => {
    const dateStr =
      withPrePayments.schedule[i]?.date ??
      simulatedResult?.schedule[i]?.date ??
      '';

    cumActual += withPrePayments.schedule[i]?.interestComponent ?? 0;
    if (simulatedResult) {
      cumSimulated += simulatedResult.schedule[i]?.interestComponent ?? 0;
    }

    const entry: Record<string, number | string> = {
      month: i + 1,
      label: dateStr ? formatDate(dateStr) : '',
      actual: Math.round(cumActual),
    };
    if (simulatedResult) {
      entry.simulated = Math.round(cumSimulated);
    }
    return entry;
  });
};

export const CumulativeInterestChart = ({ summary, simulatedResult }: Props) => {
  const isMobile = useIsMobile();
  const data = useMemo(
    () => buildCumulativeData(summary, simulatedResult),
    [summary, simulatedResult],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-slate-900">Cumulative Interest</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
        <AreaChart data={data} margin={isMobile ? { left: -10, right: 5, top: 5, bottom: 5 } : undefined}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSimulated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="actual"
            name="Cumulative Interest"
            stroke="#ef4444"
            fill="url(#gradActual)"
            strokeWidth={2}
          />
          {simulatedResult && (
            <Area
              type="monotone"
              dataKey="simulated"
              name="Simulated"
              stroke="#f59e0b"
              fill="url(#gradSimulated)"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
