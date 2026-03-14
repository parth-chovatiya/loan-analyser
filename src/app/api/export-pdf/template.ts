import { format } from 'date-fns';
import type {
  LoanInput,
  LoanSummary,
  PrePayment,
  RateChange,
  AmortizationResult,
} from '@/types/loan';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtCompact = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
};

const fmtDate = (d: string) => {
  const [y, m, day] = d.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
};

const fmtShort = (d: string) => {
  const [y, m] = d.split('-');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[parseInt(m) - 1]} ${y}`;
};

interface TemplateData {
  loan: LoanInput;
  summary: LoanSummary;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
  activeResult: AmortizationResult;
  isSimulated: boolean;
}

export const buildReportHtml = ({
  loan,
  summary,
  prePayments,
  rateChanges,
  activeResult,
  isSimulated,
}: TemplateData): string => {
  const now = format(new Date(), 'dd MMM yyyy, hh:mm a');
  const { withPrePayments: wp, withoutPrePayments: wop } = summary;

  // Metrics
  const nowDate = new Date();
  const nowKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;
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
      value: fmt(wp.totalInterest),
      sub: `Original: ${fmt(wop.totalInterest)}`,
    },
    {
      label: 'Total Amount Paid',
      value: fmt(wp.totalAmountPaid),
      sub: `Original: ${fmt(wop.totalAmountPaid)}`,
    },
    {
      label: 'Loan Closure Date',
      value: fmtShort(wp.closureDate),
      sub: `Original: ${fmtShort(wop.closureDate)}`,
    },
    {
      label: 'Interest Saved (via Pre-Payments)',
      value: fmt(summary.interestSaved),
      sub: `${((summary.interestSaved / wop.totalInterest) * 100).toFixed(1)}% reduction vs original schedule`,
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

  // Payment breakup for visual bar
  const totalPaid = wp.totalAmountPaid;
  const interestPaid = wp.totalInterest;
  const principalPaidTotal = totalPaid - interestPaid;
  const principalPct = ((principalPaidTotal / totalPaid) * 100).toFixed(1);
  const interestPct = ((interestPaid / totalPaid) * 100).toFixed(1);

  // Yearly summary
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
  const maxYearlyTotal = Math.max(...yearlyData.map((y) => y.interest + y.principal));

  // Amortization schedule
  const schedule = activeResult.schedule;
  const hasRateChanges =
    schedule.length > 1 &&
    schedule.some((row, i) => i > 0 && row.annualRate !== schedule[i - 1].annualRate);

  // Balance over time — sample every N months for the visual bar chart
  const balanceSamples: { label: string; balance: number }[] = [];
  const scheduleLen = wp.schedule.length;
  const step = Math.max(1, Math.floor(scheduleLen / 20));
  for (let i = 0; i < scheduleLen; i += step) {
    balanceSamples.push({
      label: fmtShort(wp.schedule[i].date),
      balance: wp.schedule[i].closingBalance,
    });
  }
  // Ensure last month is included
  if (scheduleLen > 0 && (scheduleLen - 1) % step !== 0) {
    balanceSamples.push({
      label: fmtShort(wp.schedule[scheduleLen - 1].date),
      balance: wp.schedule[scheduleLen - 1].closingBalance,
    });
  }
  const maxBalance = loan.principal;

  // Current rate (last rate in schedule)
  const currentRate =
    schedule.length > 0 ? schedule[schedule.length - 1].annualRate : loan.annualRate;
  const rateChanged = currentRate !== loan.annualRate;

  // Total pre-payment amount
  const totalPPAmount = prePayments.reduce((sum, pp) => sum + pp.amount, 0);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 12mm 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 11px;
    line-height: 1.5;
    color: #111827;
    background: #fff;
    width: 190mm;
    max-width: 190mm;
    overflow: hidden;
  }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
  h2 {
    font-size: 14px;
    font-weight: 700;
    margin: 24px 0 10px;
    padding-bottom: 4px;
    border-bottom: 2px solid #2563eb;
    color: #1e293b;
  }
  h3 { font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #334155; }
  .subtitle { color: #6b7280; margin-bottom: 4px; font-size: 11px; }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #e5e7eb;
  }
  .report-header .brand {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 4px;
  }
  .report-header .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 600;
  }
  .badge-active { background: #dcfce7; color: #166534; }
  .badge-sim { background: #fef3c7; color: #92400e; }

  .sim-banner {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 6px 12px;
    margin-bottom: 14px;
    font-weight: 600;
    color: #92400e;
    font-size: 11px;
  }

  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  .info-table td {
    padding: 5px 10px;
    border-bottom: 1px solid #e5e7eb;
  }
  .info-table td:first-child { font-weight: 600; width: 35%; color: #374151; }
  .info-table td:last-child { width: 65%; }

  /* Quick stats row */
  .quick-stats {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
  }
  .quick-stat {
    flex: 1;
    padding: 10px 12px;
    text-align: center;
    border-right: 1px solid #e5e7eb;
  }
  .quick-stat:last-child { border-right: none; }
  .quick-stat .qs-value { font-size: 16px; font-weight: 700; color: #1e293b; }
  .quick-stat .qs-label { font-size: 8px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }
  .quick-stat .qs-sub { font-size: 8px; color: #9ca3af; }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
    page-break-inside: avoid;
  }
  .metric-card {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 10px;
    page-break-inside: avoid;
  }
  .metric-label {
    font-size: 9px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .metric-value { font-size: 14px; font-weight: 700; margin-top: 1px; }
  .metric-sub { font-size: 9px; color: #9ca3af; margin-top: 1px; }

  .pp-table, .rc-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  .pp-table th, .rc-table th {
    padding: 4px 8px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #d1d5db;
    font-size: 10px;
  }
  .pp-table td, .rc-table td {
    padding: 4px 8px;
    border-bottom: 1px solid #e5e7eb;
  }
  .pp-table td:first-child, .rc-table td:first-child,
  .pp-table th:first-child, .rc-table th:first-child { width: 35%; }
  .pp-table td:last-child, .rc-table td:last-child,
  .pp-table th:last-child, .rc-table th:last-child { width: 65%; text-align: left; }
  .text-right { text-align: right; }

  /* Charts section */
  .chart-section { margin-bottom: 20px; page-break-inside: avoid; }

  /* Bar chart with y-axis */
  .bar-chart-wrap { display: flex; gap: 0; }
  .bar-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    width: 42px;
    padding-right: 6px;
    font-size: 7px;
    color: #6b7280;
    height: 120px;
  }
  .bar-chart-inner { flex: 1; }
  .bar-chart { display: flex; align-items: flex-end; gap: 2px; height: 120px; margin-bottom: 4px; border-left: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding-left: 2px; }
  .bar-group { flex: 1; display: flex; gap: 1px; align-items: flex-end; height: 100%; }
  .bar {
    flex: 1;
    min-width: 4px;
    border-radius: 2px 2px 0 0;
  }
  .bar-labels { display: flex; gap: 2px; font-size: 7px; color: #6b7280; margin-left: 42px; }
  .bar-labels span { flex: 1; text-align: center; overflow: hidden; white-space: nowrap; }

  /* Stacked bar */
  .stacked-chart { margin-bottom: 8px; }
  .stacked-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .stacked-label { width: 32px; font-size: 9px; font-weight: 600; color: #475569; text-align: right; flex-shrink: 0; }
  .stacked-bar-bg { flex: 1; height: 22px; background: #f1f5f9; border-radius: 3px; overflow: hidden; display: flex; position: relative; }
  .stacked-fill { height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
  .stacked-fill-text { font-size: 7px; font-weight: 600; color: #fff; white-space: nowrap; padding: 0 3px; }

  /* Payment breakup bar */
  .breakup-bar { height: 28px; border-radius: 6px; overflow: hidden; display: flex; margin: 8px 0; }
  .breakup-fill { height: 100%; }
  .breakup-legend { display: flex; gap: 16px; font-size: 10px; margin-top: 4px; }
  .legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
    vertical-align: middle;
  }

  /* Progress bar */
  .progress-track {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin: 6px 0 4px;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #4f46e5);
    border-radius: 4px;
  }

  /* Amortization table */
  .amort-table { width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed; }
  .amort-table thead tr {
    border-bottom: 2px solid #374151;
    background: #f9fafb;
  }
  .amort-table th {
    padding: 4px 3px;
    font-weight: 600;
    text-align: right;
    font-size: 9px;
  }
  .amort-table th:first-child,
  .amort-table th:nth-child(2) { text-align: left; }
  .amort-table td { padding: 3px; text-align: right; }
  .amort-table td:first-child,
  .amort-table td:nth-child(2) { text-align: left; }
  .amort-table .year-sep td {
    padding: 4px 8px;
    background: #e2e8f0;
    font-weight: 700;
    font-size: 10px;
    color: #334155;
    border-bottom: 2px solid #94a3b8;
    text-align: left;
  }
  .row-even { background: #fff; }
  .row-odd { background: #f9fafb; }
  .row-pp { background: #f0fdf4; }
  .row-rate { background: #eef2ff; }
  .text-red { color: #dc2626; }
  .text-green { color: #15803d; }
  .text-blue { color: #2563eb; }
  .text-muted { color: #d1d5db; }
  .text-indigo { color: #4338ca; }
  .fw-bold { font-weight: 700; }
  .fw-semi { font-weight: 600; }

  .footer {
    margin-top: 24px;
    padding-top: 10px;
    border-top: 1px solid #d1d5db;
    font-size: 8px;
    color: #9ca3af;
    text-align: center;
    page-break-inside: avoid;
  }

  @media print {
    .chart-section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <!-- Report Header -->
  <div class="report-header">
    <div>
      <h1>Loan Analysis Report</h1>
      <p class="subtitle">Generated on ${now}</p>
    </div>
    <div style="text-align:right">
      <span class="badge ${isSimulated ? 'badge-sim' : 'badge-active'}">${isSimulated ? 'Simulated' : 'Active Loan'}</span>
    </div>
  </div>

  ${isSimulated ? '<div class="sim-banner">Simulated Scenario — This report reflects planned pre-payments that have not yet been made.</div>' : ''}

  <!-- Quick Stats -->
  <div class="quick-stats">
    <div class="quick-stat">
      <div class="qs-value">${fmt(loan.principal)}</div>
      <div class="qs-label">Principal</div>
    </div>
    <div class="quick-stat">
      <div class="qs-value">${loan.annualRate}%${rateChanged ? ` → ${currentRate}%` : ''}</div>
      <div class="qs-label">${rateChanged ? 'Start → Current Rate' : 'Interest Rate'}</div>
    </div>
    <div class="quick-stat">
      <div class="qs-value">${fmt(loan.emi)}</div>
      <div class="qs-label">Monthly EMI</div>
    </div>
    <div class="quick-stat">
      <div class="qs-value">${fmtShort(wp.closureDate)}</div>
      <div class="qs-label">Closure Date</div>
      <div class="qs-sub">${wp.totalMonths} months</div>
    </div>
  </div>

  <!-- Loan Progress -->
  <div class="chart-section" style="margin-bottom:14px">
    <h3>Loan Progress</h3>
    <div class="progress-track">
      <div class="progress-fill" style="width:${progressPct}%"></div>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:9px; color:#64748b">
      <span>${progressPct}% repaid (${monthsCompleted} of ${wp.totalMonths} months)</span>
      <span>Outstanding: ${fmt(monthsCompleted > 0 ? (wp.schedule[monthsCompleted - 1]?.closingBalance ?? 0) : loan.principal)}</span>
    </div>
  </div>

  <!-- Loan Details -->
  <table class="info-table">
    <tbody>
      <tr><td>Principal</td><td>${fmt(loan.principal)}</td></tr>
      <tr><td>Starting Interest Rate</td><td>${loan.annualRate}%</td></tr>
      ${rateChanged ? `<tr><td>Current Interest Rate</td><td>${currentRate}%</td></tr>` : ''}
      <tr><td>EMI</td><td>${fmt(loan.emi)}</td></tr>
      <tr><td>EMI Debit Day</td><td>${loan.emiDebitDay}</td></tr>
      <tr><td>Start Date</td><td>${fmtDate(loan.startDate)}</td></tr>
      ${prePayments.length > 0 ? `<tr><td>Total Pre-Payments</td><td>${prePayments.length} pre-payments totalling ${fmt(totalPPAmount)}</td></tr>` : ''}
      ${rateChanges.length > 0 ? `<tr><td>Rate Changes</td><td>${rateChanges.length} change(s)</td></tr>` : ''}
    </tbody>
  </table>

  ${prePayments.length > 0 ? `
  <h3>Pre-Payments</h3>
  <table class="pp-table">
    <thead><tr><th>Date</th><th>Amount</th></tr></thead>
    <tbody>
      ${prePayments.map((pp) => `<tr><td>${fmtDate(pp.date)}</td><td>${fmt(pp.amount)}</td></tr>`).join('')}
    </tbody>
  </table>` : ''}

  ${rateChanges.length > 0 ? `
  <h3>Rate Changes</h3>
  <table class="rc-table">
    <thead><tr><th>Effective Date</th><th>New Rate</th></tr></thead>
    <tbody>
      ${rateChanges.map((rc) => `<tr><td>${fmtDate(rc.date)}</td><td>${rc.newRate}%</td></tr>`).join('')}
    </tbody>
  </table>` : ''}

  <!-- Summary Metrics -->
  <h2>Summary Metrics</h2>
  ${(() => {
    // Render metrics in rows of 2 so page breaks fall between rows, not through cards
    let html = '';
    for (let i = 0; i < metrics.length; i += 2) {
      html += '<div class="metrics-grid">';
      html += `<div class="metric-card"><div class="metric-label">${metrics[i].label}</div><div class="metric-value">${metrics[i].value}</div><div class="metric-sub">${metrics[i].sub}</div></div>`;
      if (metrics[i + 1]) {
        html += `<div class="metric-card"><div class="metric-label">${metrics[i + 1].label}</div><div class="metric-value">${metrics[i + 1].value}</div><div class="metric-sub">${metrics[i + 1].sub}</div></div>`;
      }
      html += '</div>';
    }
    return html;
  })()}

  <!-- Charts -->
  <h2>Visual Summary</h2>

  <!-- Balance Over Time -->
  <div class="chart-section">
    <h3>Outstanding Balance Over Time</h3>
    <div class="bar-chart-wrap">
      <div class="bar-y-axis">
        <span>${fmtCompact(maxBalance)}</span>
        <span>${fmtCompact(maxBalance * 0.75)}</span>
        <span>${fmtCompact(maxBalance * 0.5)}</span>
        <span>${fmtCompact(maxBalance * 0.25)}</span>
        <span>0</span>
      </div>
      <div class="bar-chart-inner">
        <div class="bar-chart">
          ${balanceSamples
            .map(
              (s) => `
          <div class="bar-group">
            <div class="bar" style="background:#2563eb;height:${((s.balance / maxBalance) * 100).toFixed(1)}%"></div>
          </div>`,
            )
            .join('')}
        </div>
      </div>
    </div>
    <div class="bar-labels">
      ${balanceSamples.map((s) => `<span>${s.label}</span>`).join('')}
    </div>
  </div>

  <!-- Payment Breakup -->
  <div class="chart-section">
    <h3>Payment Breakup</h3>
    <div class="breakup-bar">
      <div class="breakup-fill" style="background:#22c55e;width:${principalPct}%"></div>
      <div class="breakup-fill" style="background:#ef4444;width:${interestPct}%"></div>
    </div>
    <div class="breakup-legend">
      <span><span class="legend-dot" style="background:#22c55e"></span>Principal: ${fmt(principalPaidTotal)} (${principalPct}%)</span>
      <span><span class="legend-dot" style="background:#ef4444"></span>Interest: ${fmt(interestPaid)} (${interestPct}%)</span>
    </div>
  </div>

  <!-- Yearly Summary -->
  <div class="chart-section">
    <h3>Yearly Summary</h3>
    <div style="display:flex; gap:12px; font-size:9px; margin-bottom:6px;">
      <span><span class="legend-dot" style="background:#22c55e"></span>Principal + Prepayment</span>
      <span><span class="legend-dot" style="background:#ef4444"></span>Interest</span>
    </div>
    <div class="stacked-chart">
      ${yearlyData
        .map((y) => {
          const total = y.principal + y.interest;
          const pBarPct = ((y.principal / maxYearlyTotal) * 100).toFixed(1);
          const iBarPct = ((y.interest / maxYearlyTotal) * 100).toFixed(1);
          const pOfTotal = ((y.principal / total) * 100).toFixed(0);
          const iOfTotal = ((y.interest / total) * 100).toFixed(0);
          return `
      <div class="stacked-row">
        <span class="stacked-label">${y.year}</span>
        <div class="stacked-bar-bg">
          <div class="stacked-fill" style="background:#22c55e;width:${pBarPct}%"><span class="stacked-fill-text">${fmtCompact(y.principal)} (${pOfTotal}%)</span></div>
          <div class="stacked-fill" style="background:#ef4444;width:${iBarPct}%"><span class="stacked-fill-text">${fmtCompact(y.interest)} (${iOfTotal}%)</span></div>
        </div>
        <span style="width:80px;font-size:8px;color:#334155;text-align:right;white-space:nowrap;flex-shrink:0;font-weight:600">${fmt(total)}</span>
      </div>`;
        })
        .join('')}
    </div>
  </div>

  <!-- Amortization Schedule -->
  <div style="page-break-before: always;"></div>
  <h2 style="margin-top:0">Amortization Schedule (${schedule.length} months)</h2>
  <table class="amort-table">
    <thead>
      <tr>
        <th style="text-align:left">#</th>
        <th style="text-align:left">Date</th>
        ${hasRateChanges ? '<th>Rate</th>' : ''}
        <th>Opening</th>
        <th>Interest</th>
        <th>Principal</th>
        <th>Pre-Pay</th>
        <th>Total</th>
        <th>Closing</th>
      </tr>
    </thead>
    <tbody>
      ${schedule
        .map((row, idx) => {
          const rateChanged =
            hasRateChanges &&
            row.month > 1 &&
            row.annualRate !== schedule[row.month - 2]?.annualRate;
          const currentYear = row.date.substring(0, 4);
          const prevYear = idx > 0 ? schedule[idx - 1].date.substring(0, 4) : currentYear;
          const isYearChange = idx > 0 && currentYear !== prevYear;
          const colCount = hasRateChanges ? 9 : 8;

          let rowClass = idx % 2 === 0 ? 'row-even' : 'row-odd';
          if (row.prePayment > 0) rowClass = 'row-pp';
          else if (rateChanged) rowClass = 'row-rate';

          const yearSep = isYearChange
            ? `<tr class="year-sep"><td colspan="${colCount}">Year ${currentYear}</td></tr>`
            : '';

          return `${yearSep}<tr class="${rowClass}" style="border-bottom:1px solid #e5e7eb">
          <td>${row.month}</td>
          <td style="white-space:nowrap">${fmtShort(row.date)}</td>
          ${hasRateChanges ? `<td class="${rateChanged ? 'fw-bold text-indigo' : ''}">${row.annualRate}%</td>` : ''}
          <td>${fmt(row.openingBalance)}</td>
          <td class="text-red">${fmt(row.interestComponent)}</td>
          <td class="text-green">${fmt(row.principalComponent)}</td>
          <td class="${row.prePayment > 0 ? 'text-blue' : 'text-muted'}">${row.prePayment > 0 ? fmt(row.prePayment) : '-'}</td>
          <td>${fmt(row.totalPayment)}</td>
          <td class="fw-semi">${fmt(row.closingBalance)}</td>
        </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    Disclaimer: This report is generated for informational purposes only. All calculations are
    approximate and should not be considered as financial advice. Please consult your bank or
    financial advisor for exact figures.
  </div>
</body>
</html>`;
};
