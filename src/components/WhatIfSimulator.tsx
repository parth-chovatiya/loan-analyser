import { useState } from 'react';
import type { PrePayment, AmortizationResult } from '../types/loan';
import { formatCurrency, formatDate, formatDateFull } from '../utils/formatters';
import { InfoTooltip } from './InfoTooltip';

interface Props {
  plannedPPs: PrePayment[];
  onAdd: (pp: PrePayment) => void;
  onRemove: (id: string) => void;
  currentResult: AmortizationResult;
  simulatedResult: AmortizationResult | null;
}

export const WhatIfSimulator = ({
  plannedPPs,
  onAdd,
  onRemove,
  currentResult,
  simulatedResult,
}: Props) => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;
    onAdd({ id: crypto.randomUUID(), date, amount: Number(amount) });
    setDate('');
    setAmount('');
    if (!isOpen) setIsOpen(true);
  };

  const sortedPlanned = [...plannedPPs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const defaultMinDate = new Date().toISOString().split('T')[0];

  const impact = simulatedResult
    ? {
        interestSaved: currentResult.totalInterest - simulatedResult.totalInterest,
        monthsSaved: currentResult.totalMonths - simulatedResult.totalMonths,
        newClosureDate: simulatedResult.closureDate,
        totalPlanned: plannedPPs.reduce((s, p) => s + p.amount, 0),
      }
    : null;

  const inputClass =
    'rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/20">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">What-If Simulator</h2>
            <p className="text-xs text-slate-500">Plan future pre-payments and see the impact</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {plannedPPs.length > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-700">
              {plannedPPs.length}
            </span>
          )}
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-6 py-5 space-y-5">
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Planned Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={defaultMinDate}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  &#8377;
                </span>
                <input
                  type="number"
                  className={`${inputClass} pl-8`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5,00,000"
                  required
                  min="1"
                />
              </div>
            </div>
            <button
              type="submit"
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Simulate
            </button>
          </form>

          {sortedPlanned.length > 0 && (
            <div className="space-y-2">
              {sortedPlanned.map((pp) => (
                <div
                  key={pp.id}
                  className="group flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(pp.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateFull(pp.date)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(pp.id)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {impact && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Interest Saved',
                  value: formatCurrency(impact.interestSaved),
                  sub: `investing ${formatCurrency(impact.totalPlanned)}`,
                  color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                  tooltip: 'The interest you would save if you make these planned pre-payments.',
                },
                {
                  label: 'Months Reduced',
                  value: `${impact.monthsSaved} months`,
                  sub: `${currentResult.totalMonths} to ${simulatedResult!.totalMonths}`,
                  color: 'text-blue-600 bg-blue-50 border-blue-100',
                  tooltip:
                    'How many fewer months of EMI you would need to pay with these pre-payments.',
                },
                {
                  label: 'New Closure',
                  value: formatDate(impact.newClosureDate),
                  sub: `was ${formatDate(currentResult.closureDate)}`,
                  color: 'text-violet-600 bg-violet-50 border-violet-100',
                  tooltip:
                    'Your estimated new loan end date if you go ahead with these pre-payments.',
                },
                {
                  label: 'ROI',
                  value: `${((impact.interestSaved / impact.totalPlanned) * 100).toFixed(1)}%`,
                  sub: 'per rupee invested',
                  color: 'text-amber-600 bg-amber-50 border-amber-100',
                  tooltip:
                    'Return on investment — how much interest you save for every rupee you pre-pay. Higher is better.',
                },
              ].map((card) => (
                <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {card.label}
                    <InfoTooltip text={card.tooltip} />
                  </p>
                  <p className="mt-1 text-xl font-bold">{card.value}</p>
                  <p className="mt-0.5 text-xs opacity-60">{card.sub}</p>
                </div>
              ))}
            </div>
          )}

          {plannedPPs.length === 0 && (
            <p className="text-sm text-slate-400 italic text-center py-4">
              Add a planned pre-payment to see the projected impact
            </p>
          )}
        </div>
      )}
    </div>
  );
};
