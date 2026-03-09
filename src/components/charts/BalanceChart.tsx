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
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
  simulatedResult?: AmortizationResult | null;
}

export function BalanceChart({ summary, simulatedResult }: Props) {
  const { withPrePayments, withoutPrePayments } = summary;

  const currentMonthKey = format(new Date(), 'yyyy-MM');

  const maxLen = Math.max(
    withPrePayments.schedule.length,
    withoutPrePayments.schedule.length,
    simulatedResult?.schedule.length ?? 0
  );

  let currentMonthIndex: number | null = null;

  const data = Array.from({ length: maxLen }, (_, i) => {
    const dateStr =
      withoutPrePayments.schedule[i]?.date ??
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
      withoutPP: withoutPrePayments.schedule[i]?.closingBalance ?? 0,
      withPP: withPrePayments.schedule[i]?.closingBalance ?? 0,
    };
    if (simulatedResult) {
      entry.simulated = simulatedResult.schedule[i]?.closingBalance ?? 0;
    }
    return entry;
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Outstanding Balance Over Time
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            width={100}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(_: string, payload: Array<{ payload?: { label?: string } }>) => payload?.[0]?.payload?.label || ''}
          />
          <Legend />
          {currentMonthIndex !== null && (
            <ReferenceLine
              x={currentMonthIndex}
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ value: 'Now', position: 'top', fill: '#2563eb', fontWeight: 'bold' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="withoutPP"
            name="Original Schedule"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="withPP"
            name="Actual (with adjustments)"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          {simulatedResult && (
            <Line
              type="monotone"
              dataKey="simulated"
              name="Simulated (what-if)"
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
}
