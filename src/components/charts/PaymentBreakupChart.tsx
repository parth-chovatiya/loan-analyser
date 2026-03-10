import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { LoanSummary } from '../../types/loan';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
}

const COLORS = ['#22c55e', '#ef4444'];

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

export const PaymentBreakupChart = ({ summary }: Props) => {
  const isMobile = useIsMobile();
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
        fontSize={isMobile ? 12 : 14}
      >
        {pct}%
      </text>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-slate-900">Payment Breakup</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 85 : 130}
            innerRadius={isMobile ? 30 : 45}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
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
};
