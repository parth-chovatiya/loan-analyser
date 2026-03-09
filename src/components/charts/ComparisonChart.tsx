import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { LoanSummary } from '../../types/loan';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
}

export function ComparisonChart({ summary }: Props) {
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  const data = [
    {
      name: 'Total Interest',
      'Original Schedule': wop.totalInterest,
      'Actual (with adjustments)': wp.totalInterest,
    },
    {
      name: 'Total Paid',
      'Original Schedule': wop.totalAmountPaid,
      'Actual (with adjustments)': wp.totalAmountPaid,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Original vs Actual Comparison
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="Original Schedule" fill="#94a3b8" />
          <Bar dataKey="Actual (with adjustments)" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
