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
import { formatCurrency, formatCurrencyShort, formatDate } from '../../utils/formatters';

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

export const PrincipalInterestChart = ({ schedule, isSimulated }: Props) => {
  const isMobile = useIsMobile();
  // For large schedules, sample every N months to keep chart readable
  const maxBars = isMobile ? 30 : 60;
  const step = schedule.length > maxBars ? Math.ceil(schedule.length / maxBars) : 1;
  const data = schedule
    .filter((_, i) => i % step === 0 || i === schedule.length - 1)
    .map((row) => ({
      month: row.month,
      date: formatDate(row.date),
      principal: row.principalComponent,
      interest: row.interestComponent,
    }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-slate-900">
        Principal vs Interest per EMI
        {isSimulated && (
          <span className="ml-2 text-sm font-normal text-amber-600">(simulated)</span>
        )}
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
        <BarChart data={data} margin={isMobile ? { left: -10, right: 5, top: 5, bottom: 5 } : undefined}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12 }} />
          <YAxis
            tickFormatter={(v) => formatCurrencyShort(v)}
            width={isMobile ? 45 : 80}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(_: unknown, payload: readonly { payload?: { date?: string } }[]) =>
              payload?.[0]?.payload?.date || ''
            }
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend
            iconSize={isMobile ? 8 : 14}
            wrapperStyle={{ fontSize: isMobile ? 10 : 12, paddingTop: 8 }}
          />
          <Bar dataKey="principal" name="Principal" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="interest" name="Interest" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
