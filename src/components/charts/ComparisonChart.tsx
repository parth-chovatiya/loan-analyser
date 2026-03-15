import { useState, useEffect, useMemo } from 'react';
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
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';
import type { LoanSummary, AmortizationResult } from '../../types/loan';
import { formatCurrency, formatCurrencyShort } from '../../utils/formatters';

interface Props {
  summary: LoanSummary;
  simulatedResult?: AmortizationResult | null;
}

const getInitialMobile = () => (typeof window !== 'undefined' ? window.innerWidth < 640 : false);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(getInitialMobile);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMobile(window.innerWidth < 640), 150);
    };
    window.addEventListener('resize', check);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', check);
    };
  }, []);
  return isMobile;
};

const BAR_COLORS = {
  Actual: { fill: '#2563eb', label: 'Actual' },
  Simulated: { fill: '#d97706', label: 'Simulated' },
} as const;

const ChartPatterns = () => (
  <defs>
    <pattern id="pattern-actual" patternUnits="userSpaceOnUse" width="6" height="6">
      <rect width="6" height="6" fill="#2563eb" />
      <line x1="0" y1="0" x2="6" y2="6" stroke="#1d4ed8" strokeWidth="1.5" />
    </pattern>
    <pattern id="pattern-simulated" patternUnits="userSpaceOnUse" width="6" height="6">
      <rect width="6" height="6" fill="#d97706" />
      <circle cx="3" cy="3" r="1" fill="#b45309" />
    </pattern>
  </defs>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      role="tooltip"
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg"
    >
      <p className="mb-1.5 font-semibold text-slate-700">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-medium text-slate-900">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const renderLegend = (props: { payload?: readonly LegendPayload[] }) => {
  const { payload } = props;
  if (!payload) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm">
      {payload.map((entry) => (
        <div key={String(entry.value)} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3"
            style={{ backgroundColor: entry.color ?? '#94a3b8' }}
          />
          <span className="text-slate-600">{String(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const ComparisonChart = ({ summary, simulatedResult }: Props) => {
  const isMobile = useIsMobile();
  const { withPrePayments: wp } = summary;
  const hasSimulated = !!simulatedResult;

  const data = useMemo(
    () => [
      {
        name: 'Total Interest',
        Actual: wp.totalInterest,
        ...(simulatedResult ? { Simulated: simulatedResult.totalInterest } : {}),
      },
      {
        name: 'Total Paid',
        Actual: wp.totalAmountPaid,
        ...(simulatedResult ? { Simulated: simulatedResult.totalAmountPaid } : {}),
      },
    ],
    [wp, simulatedResult],
  );

  const title = hasSimulated ? 'Actual vs Simulated' : 'Loan Summary';

  const ariaLabel = useMemo(() => {
    const parts = [
      `Loan summary chart.`,
      `Total Interest: ${formatCurrency(wp.totalInterest)}${hasSimulated ? `, Simulated ${formatCurrency(simulatedResult!.totalInterest)}` : ''}.`,
      `Total Paid: ${formatCurrency(wp.totalAmountPaid)}${hasSimulated ? `, Simulated ${formatCurrency(simulatedResult!.totalAmountPaid)}` : ''}.`,
    ];
    return parts.join(' ');
  }, [wp, simulatedResult, hasSimulated]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:mb-5">
        <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
      </div>

      {/* Accessible data table (visually hidden) */}
      <table className="sr-only" role="table" aria-label="Loan summary data">
        <caption>Loan payment summary</caption>
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Actual</th>
            {hasSimulated && <th scope="col">Simulated</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{formatCurrency(row.Actual)}</td>
              {hasSimulated && <td>{formatCurrency(row.Simulated!)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <div role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
          <BarChart
            data={data}
            barCategoryGap="25%"
            margin={
              isMobile
                ? { left: -10, right: 5, top: 5, bottom: 5 }
                : { left: 0, right: 10, top: 5, bottom: 5 }
            }
          >
            <ChartPatterns />
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#475569' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrencyShort(v)}
              width={isMobile ? 55 : 80}
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.1)', radius: 4 }}
            />
            <Legend content={renderLegend} />
            <Bar dataKey="Actual" fill={BAR_COLORS.Actual.fill} radius={[6, 6, 0, 0]} />
            {hasSimulated && (
              <Bar dataKey="Simulated" fill={BAR_COLORS.Simulated.fill} radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
