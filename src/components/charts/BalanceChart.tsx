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
import type { LoanSummary } from '../../types/loan';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
}

export function BalanceChart({ summary }: Props) {
  const { withPrePayments, withoutPrePayments } = summary;

  const currentMonthKey = format(new Date(), 'yyyy-MM');

  const maxLen = Math.max(
    withPrePayments.schedule.length,
    withoutPrePayments.schedule.length
  );

  let currentMonthIndex: number | null = null;

  const data = Array.from({ length: maxLen }, (_, i) => {
    const dateStr =
      withoutPrePayments.schedule[i]?.date ??
      withPrePayments.schedule[i]?.date ??
      '';
    const monthKey = dateStr.substring(0, 7);
    if (monthKey === currentMonthKey) {
      currentMonthIndex = i + 1;
    }
    return {
      month: i + 1,
      label: dateStr ? formatDate(dateStr) : '',
      withoutPP: withoutPrePayments.schedule[i]?.closingBalance ?? 0,
      withPP: withPrePayments.schedule[i]?.closingBalance ?? 0,
    };
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
            labelFormatter={(label) => `Month ${label}`}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
