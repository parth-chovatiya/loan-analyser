import { forwardRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import type {
  LoanInput,
  LoanSummary,
  PrePayment,
  RateChange,
  AmortizationResult,
} from '../../types/loan';
import {
  formatCurrency,
  formatCurrencyShort,
  formatDate,
  formatDateFull,
} from '../../utils/formatters';

interface Props {
  loan: LoanInput;
  summary: LoanSummary;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
  activeResult: AmortizationResult;
  isSimulated: boolean;
}

const CHART_W = 760;
const CHART_H = 280;

export const PdfReport = forwardRef<HTMLDivElement, Props>(function PdfReport(
  { loan, summary, prePayments, rateChanges, activeResult, isSimulated },
  ref,
) {
  const now = new Date();
  const generatedDate = format(now, 'dd MMM yyyy, hh:mm a');
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  // --- Balance chart data ---
  const maxLen = Math.max(wp.schedule.length, wop.schedule.length);
  const balanceData = Array.from({ length: maxLen }, (_, i) => ({
    month: i + 1,
    label: formatDate(wop.schedule[i]?.date ?? wp.schedule[i]?.date ?? ''),
    withoutPP: wop.schedule[i]?.closingBalance ?? 0,
    withPP: wp.schedule[i]?.closingBalance ?? 0,
  }));

  // --- Pie chart data ---
  const principalPaid = wp.totalAmountPaid - wp.totalInterest;
  const pieData = [
    { name: 'Principal', value: Math.round(principalPaid) },
    { name: 'Interest', value: Math.round(wp.totalInterest) },
  ];
  const pieTotal = pieData[0].value + pieData[1].value;
  const PIE_COLORS = ['#22c55e', '#ef4444'];

  // --- Yearly summary data ---
  const yearMap = new Map<string, { interest: number; principal: number }>();
  for (const row of activeResult.schedule) {
    const year = row.date.substring(0, 4);
    const existing = yearMap.get(year) || { interest: 0, principal: 0 };
    existing.interest += row.interestComponent;
    existing.principal += row.principalComponent + row.prePayment;
    yearMap.set(year, existing);
  }
  const yearlyData = Array.from(yearMap.entries()).map(([year, vals]) => ({
    year,
    interest: Math.round(vals.interest),
    principal: Math.round(vals.principal),
  }));

  // --- Metrics cards data (same as SummaryCards) ---
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let monthsCompleted = 0;
  for (const row of wp.schedule) {
    if (row.date.substring(0, 7) <= nowKey) monthsCompleted = row.month;
    else break;
  }
  const principalRepaid =
    monthsCompleted > 0
      ? loan.principal - (wp.schedule[monthsCompleted - 1]?.closingBalance ?? 0)
      : 0;
  const progressPct = ((principalRepaid / loan.principal) * 100).toFixed(1);

  const metrics = [
    {
      label: 'Total Interest',
      value: formatCurrency(wp.totalInterest),
      sub: `Original: ${formatCurrency(wop.totalInterest)}`,
    },
    {
      label: 'Total Amount Paid',
      value: formatCurrency(wp.totalAmountPaid),
      sub: `Original: ${formatCurrency(wop.totalAmountPaid)}`,
    },
    {
      label: 'Loan Closure Date',
      value: formatDate(wp.closureDate),
      sub: `Original: ${formatDate(wop.closureDate)}`,
    },
    {
      label: 'Interest Saved',
      value: formatCurrency(summary.interestSaved),
      sub: `${((summary.interestSaved / wop.totalInterest) * 100).toFixed(1)}% reduction`,
    },
    {
      label: 'Months Saved',
      value: `${summary.monthsSaved} months`,
      sub: `${wp.totalMonths} vs ${wop.totalMonths} months`,
    },
    {
      label: 'Interest-to-Principal',
      value: `${((wp.totalInterest / loan.principal) * 100).toFixed(1)}%`,
      sub: `Original: ${((wop.totalInterest / loan.principal) * 100).toFixed(1)}%`,
    },
    {
      label: 'Effective Cost',
      value: `${(wp.totalAmountPaid / loan.principal).toFixed(2)}x`,
      sub: `You pay ${(wp.totalAmountPaid / loan.principal).toFixed(2)}x the borrowed amount`,
    },
    {
      label: 'Loan Progress',
      value: `${progressPct}%`,
      sub: `${monthsCompleted} of ${wp.totalMonths} months completed`,
    },
  ];

  // --- Amortization table: detect rate changes ---
  const schedule = activeResult.schedule;
  const hasRateChanges =
    schedule.length > 1 &&
    schedule.some((row, i) => i > 0 && row.annualRate !== schedule[i - 1].annualRate);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '800px',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#fff',
        color: '#111',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        lineHeight: 1.5,
        padding: '24px',
      }}
    >
      {/* === SECTION 1: Header === */}
      {isSimulated && (
        <div
          style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 16,
            fontWeight: 600,
            color: '#92400e',
          }}
        >
          Simulated Scenario — This report reflects planned pre-payments that have not yet been
          made.
        </div>
      )}

      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Loan Analysis Report</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px' }}>Generated on {generatedDate}</p>

      {/* Loan details table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <tbody>
          {(
            [
              ['Principal', formatCurrency(loan.principal)],
              ['Annual Interest Rate', `${loan.annualRate}%`],
              ['EMI', formatCurrency(loan.emi)],
              ['EMI Debit Day', `${loan.emiDebitDay}`],
              ['Start Date', formatDateFull(loan.startDate)],
            ] as const
          ).map(([label, value]) => (
            <tr key={label}>
              <td
                style={{
                  padding: '4px 8px',
                  fontWeight: 600,
                  width: '40%',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                {label}
              </td>
              <td style={{ padding: '4px 8px', borderBottom: '1px solid #e5e7eb' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pre-payments table */}
      {prePayments.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '12px 0 6px' }}>Pre-Payments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {prePayments.map((pp) => (
                <tr key={pp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '4px 8px' }}>{formatDateFull(pp.date)}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                    {formatCurrency(pp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Rate changes table */}
      {rateChanges.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '12px 0 6px' }}>Rate Changes</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600 }}>
                  Effective Date
                </th>
                <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>
                  New Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {rateChanges.map((rc) => (
                <tr key={rc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '4px 8px' }}>{formatDateFull(rc.date)}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right' }}>{rc.newRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* === SECTION 2: Summary Metrics === */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          margin: '20px 0 10px',
          borderBottom: '2px solid #2563eb',
          paddingBottom: 4,
        }}
      >
        Summary Metrics
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px' }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* === SECTION 3: Charts === */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          margin: '20px 0 10px',
          borderBottom: '2px solid #2563eb',
          paddingBottom: 4,
        }}
      >
        Charts
      </h2>

      {/* Balance Over Time */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Outstanding Balance Over Time
        </h3>
        <LineChart width={CHART_W} height={CHART_H} data={balanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis tickFormatter={(v) => formatCurrencyShort(v)} width={80} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="withoutPP"
            name="Original Schedule"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="withPP"
            name="With Adjustments"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </div>

      {/* Payment Breakup */}
      <div style={{ marginBottom: 20 }} data-html2pdf-page-break="before">
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Payment Breakup</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <PieChart width={300} height={CHART_H}>
            <Pie
              data={pieData}
              cx={150}
              cy={130}
              outerRadius={110}
              dataKey="value"
              label={({
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
                return (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontWeight="bold"
                    fontSize={13}
                  >
                    {((pieData[index ?? 0].value / pieTotal) * 100).toFixed(1)}%
                  </text>
                );
              }}
              labelLine={false}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
          <div>
            <div style={{ marginBottom: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#22c55e',
                  marginRight: 6,
                  verticalAlign: 'middle',
                }}
              />
              Principal: {formatCurrency(principalPaid)}
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#ef4444',
                  marginRight: 6,
                  verticalAlign: 'middle',
                }}
              />
              Interest: {formatCurrency(wp.totalInterest)}
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Summary */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Yearly Summary</h3>
        <BarChart width={CHART_W} height={CHART_H} data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={(v) => formatCurrencyShort(v)} width={80} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(l) => `Year ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="principal" name="Principal + Prepayment" fill="#22c55e" />
          <Bar dataKey="interest" name="Interest" fill="#ef4444" />
        </BarChart>
      </div>

      {/* === SECTION 4: Amortization Schedule === */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          margin: '20px 0 10px',
          borderBottom: '2px solid #2563eb',
          paddingBottom: 4,
        }}
      >
        Amortization Schedule ({schedule.length} months)
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #374151', background: '#f9fafb' }}>
            <th style={{ padding: '4px 3px', textAlign: 'left', fontWeight: 600 }}>#</th>
            <th style={{ padding: '4px 3px', textAlign: 'left', fontWeight: 600 }}>Date</th>
            {hasRateChanges && (
              <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Rate</th>
            )}
            <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Opening</th>
            <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Interest</th>
            <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Principal</th>
            <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Pre-Pay</th>
            <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Total</th>
            <th style={{ padding: '4px 3px', textAlign: 'right', fontWeight: 600 }}>Closing</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => {
            const rateChanged =
              hasRateChanges &&
              row.month > 1 &&
              row.annualRate !== schedule[row.month - 2]?.annualRate;
            let bg = '#fff';
            if (row.prePayment > 0)
              bg = '#f0fdf4'; // green-50
            else if (rateChanged) bg = '#eef2ff'; // indigo-50

            return (
              <tr key={row.month} style={{ borderBottom: '1px solid #e5e7eb', background: bg }}>
                <td style={{ padding: '3px' }}>{row.month}</td>
                <td style={{ padding: '3px', whiteSpace: 'nowrap' }}>{formatDate(row.date)}</td>
                {hasRateChanges && (
                  <td
                    style={{
                      padding: '3px',
                      textAlign: 'right',
                      fontWeight: rateChanged ? 700 : 400,
                      color: rateChanged ? '#4338ca' : undefined,
                    }}
                  >
                    {row.annualRate}%
                  </td>
                )}
                <td style={{ padding: '3px', textAlign: 'right' }}>
                  {formatCurrency(row.openingBalance)}
                </td>
                <td style={{ padding: '3px', textAlign: 'right', color: '#dc2626' }}>
                  {formatCurrency(row.interestComponent)}
                </td>
                <td style={{ padding: '3px', textAlign: 'right', color: '#15803d' }}>
                  {formatCurrency(row.principalComponent)}
                </td>
                <td
                  style={{
                    padding: '3px',
                    textAlign: 'right',
                    color: row.prePayment > 0 ? '#2563eb' : '#d1d5db',
                  }}
                >
                  {row.prePayment > 0 ? formatCurrency(row.prePayment) : '-'}
                </td>
                <td style={{ padding: '3px', textAlign: 'right' }}>
                  {formatCurrency(row.totalPayment)}
                </td>
                <td style={{ padding: '3px', textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(row.closingBalance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
