import { useState } from 'react';
import type { PrePayment, AmortizationResult } from '../types/loan';
import { formatCurrency, formatDate, formatDateFull } from '../utils/formatters';

interface Props {
  plannedPPs: PrePayment[];
  onAdd: (pp: PrePayment) => void;
  onRemove: (id: string) => void;
  currentResult: AmortizationResult;
  simulatedResult: AmortizationResult | null;
}

export function WhatIfSimulator({
  plannedPPs,
  onAdd,
  onRemove,
  currentResult,
  simulatedResult,
}: Props) {
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
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
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

  return (
    <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">
            What-If Simulator
          </h2>
          <p className="text-sm text-gray-500">
            Plan future pre-payments and see how they impact your loan, charts &amp; table
          </p>
        </div>
        <div className="flex items-center gap-3">
          {plannedPPs.length > 0 && (
            <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {plannedPPs.length} planned
            </span>
          )}
          <span className="text-2xl text-amber-600">
            {isOpen ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-5 space-y-5">
          {/* Add planned pre-payment form */}
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planned Date
              </label>
              <input
                type="date"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={defaultMinDate}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                required
                min="1"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Add to Simulation
            </button>
          </form>

          {/* Planned pre-payments list */}
          {sortedPlanned.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-gray-600">
                    <th className="pb-2 pr-4 font-medium">Planned Date</th>
                    <th className="pb-2 pr-4 font-medium">Amount</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlanned.map((pp) => (
                    <tr
                      key={pp.id}
                      className="border-b border-amber-100 last:border-0"
                    >
                      <td className="py-2 pr-4">{formatDateFull(pp.date)}</td>
                      <td className="py-2 pr-4 font-medium">{formatCurrency(pp.amount)}</td>
                      <td className="py-2">
                        <button
                          onClick={() => onRemove(pp.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Impact results */}
          {impact && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Projected Impact
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Additional Interest Saved
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    {formatCurrency(impact.interestSaved)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    by investing {formatCurrency(impact.totalPlanned)}
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Months Reduced
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    {impact.monthsSaved} months
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    from {currentResult.totalMonths} to {simulatedResult!.totalMonths} months
                  </p>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    New Closure Date
                  </p>
                  <p className="mt-1 text-xl font-bold text-purple-700">
                    {formatDate(impact.newClosureDate)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    currently {formatDate(currentResult.closureDate)}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Return on Pre-Payment
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {((impact.interestSaved / impact.totalPlanned) * 100).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    interest saved per rupee invested
                  </p>
                </div>
              </div>
            </div>
          )}

          {plannedPPs.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              Add a planned pre-payment above to see projected impact on your loan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
