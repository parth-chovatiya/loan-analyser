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
import { formatCurrency } from '../../utils/formatters';

interface Props {
  schedule: AmortizationRow[];
  isSimulated?: boolean;
}

export function YearlySummaryChart({ schedule, isSimulated }: Props) {
  const yearMap = new Map<string, { interest: number; principal: number }>();

  for (const row of schedule) {
    const year = row.date.substring(0, 4);
    const existing = yearMap.get(year) || { interest: 0, principal: 0 };
    existing.interest += row.interestComponent;
    existing.principal += row.principalComponent + row.prePayment;
    yearMap.set(year, existing);
  }

  const data = Array.from(yearMap.entries()).map(([year, vals]) => ({
    year,
    interest: Math.round(vals.interest),
    principal: Math.round(vals.principal),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Yearly Summary
        {isSimulated && (
          <span className="ml-2 text-sm font-normal text-amber-600">(simulated)</span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Legend />
          <Bar dataKey="principal" name="Principal + Prepayment" fill="#22c55e" />
          <Bar dataKey="interest" name="Interest" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
