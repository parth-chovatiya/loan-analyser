import { useMemo } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { HeartPulse, Lightbulb } from 'lucide-react';
import type { LoanInput, LoanSummary } from '../types/loan';
import { computeHealthScore, type HealthGrade } from '../utils/insights';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  loan: LoanInput;
  summary: LoanSummary;
}

const GRADE_COLOR: Record<HealthGrade, string> = {
  Excellent: '#059669', // emerald-600
  Good: '#2563eb', // blue-600
  Fair: '#d97706', // amber-600
  'Needs Attention': '#dc2626', // red-600
};

export const HealthScore = ({ loan, summary }: Props) => {
  const health = useMemo(() => computeHealthScore(loan, summary), [loan, summary]);
  const color = GRADE_COLOR[health.grade];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/20">
          <HeartPulse className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="flex flex-1 items-center gap-1.5 text-base font-bold text-slate-900">
          Loan Health Score
          <InfoTooltip text="A 0–100 score based on your interest rate vs market, pre-payment activity, total cost, and tenure. Higher is better." />
        </h2>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{ color, backgroundColor: `${color}1a` }}
        >
          {health.grade}
        </span>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              data={[{ value: health.score, fill: color }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={12} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight" style={{ color }}>
              {health.score}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              out of 100
            </span>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          {health.factors.map((f) => {
            const pct = (f.score / f.max) * 100;
            return (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600" title={f.hint}>
                    {f.label}
                  </span>
                  <span className="tabular-nums text-slate-400">
                    {f.score}/{f.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {health.tips.length > 0 && (
        <div className="mt-5 space-y-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          {health.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={2} />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
