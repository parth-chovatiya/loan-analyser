import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { LoanSummary } from '../../types/loan';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
}

const COLORS = ['#22c55e', '#ef4444'];

export function PaymentBreakupChart({ summary }: Props) {
  const { withPrePayments: wp } = summary;
  const principalPaid = wp.totalAmountPaid - wp.totalInterest;

  const data = [
    { name: 'Principal', value: Math.round(principalPaid) },
    { name: 'Interest', value: Math.round(wp.totalInterest) },
  ];

  const total = data[0].value + data[1].value;

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    index?: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 0.5;
    const x = (cx ?? 0) + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = (cy ?? 0) + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
    const pct = ((data[index ?? 0].value / total) * 100).toFixed(1);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight="bold"
        fontSize={14}
      >
        {pct}%
      </text>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-900">Payment Breakup</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={130}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-6 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
          Principal: {formatCurrency(principalPaid)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
          Interest: {formatCurrency(wp.totalInterest)}
        </span>
      </div>
    </div>
  );
}
