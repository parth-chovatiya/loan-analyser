import { useState, useEffect } from 'react';
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
import { formatCurrency, formatCurrencyShort } from '../../utils/formatters';

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

export const ComparisonChart = ({ summary, simulatedResult }: Props) => {
  const isMobile = useIsMobile();
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  const data = [
    {
      name: 'Total Interest',
      Original: wop.totalInterest,
      Actual: wp.totalInterest,
      ...(simulatedResult ? { Simulated: simulatedResult.totalInterest } : {}),
    },
    {
      name: 'Total Paid',
      Original: wop.totalAmountPaid,
      Actual: wp.totalAmountPaid,
      ...(simulatedResult ? { Simulated: simulatedResult.totalAmountPaid } : {}),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-slate-900">Original vs Actual</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
        <BarChart data={data} barCategoryGap="30%" margin={isMobile ? { left: -10, right: 5, top: 5, bottom: 5 } : undefined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis
            tickFormatter={(v) => formatCurrencyShort(v)}
            width={isMobile ? 55 : 80}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend
            iconSize={isMobile ? 8 : 14}
            wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: 8 }}
          />
          <Bar dataKey="Original" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Actual" fill="#2563eb" radius={[4, 4, 0, 0]} />
          {simulatedResult && <Bar dataKey="Simulated" fill="#f59e0b" radius={[4, 4, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
