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
import type { AmortizationRow } from '../../types/loan';
import { formatCurrency, formatCurrencyShort } from '../../utils/formatters';

interface Props {
  schedule: AmortizationRow[];
  isSimulated?: boolean;
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

export const YearlySummaryChart = ({ schedule, isSimulated }: Props) => {
  const isMobile = useIsMobile();
  const yearMap = new Map<string, { interest: number; principal: number }>();

  for (const row of schedule) {
    const year = row.date.substring(0, 4);
    const existing = yearMap.get(year) || { interest: 0, principal: 0 };
    existing.interest += row.interestComponent;
    existing.principal += row.principalComponent + row.prePayment;
    yearMap.set(year, existing);
  }

  const data = Array.from(yearMap.entries()).map(([year, vals]) => ({
    year: isMobile ? `'${year.slice(2)}` : year,
    interest: Math.round(vals.interest),
    principal: Math.round(vals.principal),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-slate-900">
        Yearly Summary
        {isSimulated && (
          <span className="ml-2 text-sm font-normal text-amber-600">(simulated)</span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
        <BarChart data={data} margin={isMobile ? { left: -10, right: 5, top: 5, bottom: 5 } : undefined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile && data.length > 10 ? 1 : 0}
          />
          <YAxis
            tickFormatter={(v) => formatCurrencyShort(v)}
            width={isMobile ? 45 : 80}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend
            iconSize={isMobile ? 8 : 14}
            wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: 8 }}
          />
          <Bar dataKey="principal" name="Principal + Prepay" fill="#22c55e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="interest" name="Interest" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
