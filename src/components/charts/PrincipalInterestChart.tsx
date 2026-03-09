import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AmortizationRow } from '../../types/loan';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Props {
  schedule: AmortizationRow[];
  isSimulated?: boolean;
}

export function PrincipalInterestChart({ schedule, isSimulated }: Props) {
  // For large schedules, sample every N months to keep chart readable
  const step = schedule.length > 60 ? Math.ceil(schedule.length / 60) : 1;
  const data = schedule
    .filter((_, i) => i % step === 0 || i === schedule.length - 1)
    .map((row) => ({
      month: row.month,
      date: formatDate(row.date),
      principal: row.principalComponent,
      interest: row.interestComponent,
    }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Principal vs Interest per EMI
        {isSimulated && (
          <span className="ml-2 text-sm font-normal text-amber-600">(simulated)</span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(_: unknown, payload: readonly { payload?: { date?: string } }[]) => payload?.[0]?.payload?.date || ''}
          />
          <Legend />
          <Bar
            dataKey="principal"
            name="Principal"
            stackId="a"
            fill="#22c55e"
          />
          <Bar
            dataKey="interest"
            name="Interest"
            stackId="a"
            fill="#ef4444"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
