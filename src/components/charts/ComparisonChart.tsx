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
import type { LoanSummary, AmortizationResult } from '../../types/loan';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
  simulatedResult?: AmortizationResult | null;
}

export function ComparisonChart({ summary, simulatedResult }: Props) {
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  const data = [
    {
      name: 'Total Interest',
      'Original Schedule': wop.totalInterest,
      'Actual (with adjustments)': wp.totalInterest,
      ...(simulatedResult ? { 'Simulated (what-if)': simulatedResult.totalInterest } : {}),
    },
    {
      name: 'Total Paid',
      'Original Schedule': wop.totalAmountPaid,
      'Actual (with adjustments)': wp.totalAmountPaid,
      ...(simulatedResult ? { 'Simulated (what-if)': simulatedResult.totalAmountPaid } : {}),
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Original vs Actual Comparison</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Bar dataKey="Original Schedule" fill="#94a3b8" />
          <Bar dataKey="Actual (with adjustments)" fill="#2563eb" />
          {simulatedResult && <Bar dataKey="Simulated (what-if)" fill="#f59e0b" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
