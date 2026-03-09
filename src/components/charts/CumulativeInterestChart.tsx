import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LoanSummary, AmortizationResult } from "../../types/loan";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface Props {
  summary: LoanSummary;
  simulatedResult?: AmortizationResult | null;
}

function buildCumulativeData(
  summary: LoanSummary,
  simulatedResult?: AmortizationResult | null,
) {
  const { withPrePayments, withoutPrePayments } = summary;

  const maxLen = Math.max(
    withPrePayments.schedule.length,
    withoutPrePayments.schedule.length,
    simulatedResult?.schedule.length ?? 0,
  );

  let cumOriginal = 0;
  let cumActual = 0;
  let cumSimulated = 0;

  return Array.from({ length: maxLen }, (_, i) => {
    const dateStr =
      withoutPrePayments.schedule[i]?.date ??
      withPrePayments.schedule[i]?.date ??
      simulatedResult?.schedule[i]?.date ??
      "";

    cumOriginal += withoutPrePayments.schedule[i]?.interestComponent ?? 0;
    cumActual += withPrePayments.schedule[i]?.interestComponent ?? 0;
    if (simulatedResult) {
      cumSimulated += simulatedResult.schedule[i]?.interestComponent ?? 0;
    }

    const entry: Record<string, number | string> = {
      month: i + 1,
      label: dateStr ? formatDate(dateStr) : "",
      original: Math.round(cumOriginal),
      actual: Math.round(cumActual),
    };
    if (simulatedResult) {
      entry.simulated = Math.round(cumSimulated);
    }
    return entry;
  });
}

export function CumulativeInterestChart({ summary, simulatedResult }: Props) {
  const data = useMemo(
    () => buildCumulativeData(summary, simulatedResult),
    [summary, simulatedResult],
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Cumulative Interest Paid
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradOriginal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSimulated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: "Month", position: "insideBottom", offset: -5 }}
          />
          <YAxis tickFormatter={(v) => formatCurrency(v)} width={100} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(
              _: unknown,
              payload: readonly { payload?: { label?: string } }[],
            ) => payload?.[0]?.payload?.label || ""}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="original"
            name="Original Schedule"
            stroke="#94a3b8"
            fill="url(#gradOriginal)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual (with adjustments)"
            stroke="#ef4444"
            fill="url(#gradActual)"
            strokeWidth={2}
          />
          {simulatedResult && (
            <Area
              type="monotone"
              dataKey="simulated"
              name="Simulated (what-if)"
              stroke="#f59e0b"
              fill="url(#gradSimulated)"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
