import { useState } from 'react';
import type { RateChange } from '../types/loan';
import { formatDateFull } from '../utils/formatters';

interface Props {
  rateChanges: RateChange[];
  onAdd: (rc: RateChange) => void;
  onRemove: (id: string) => void;
}

export function RateChangeList({ rateChanges, onAdd, onRemove }: Props) {
  const [date, setDate] = useState('');
  const [rate, setRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !rate) return;
    onAdd({
      id: crypto.randomUUID(),
      date,
      newRate: Number(rate),
    });
    setDate('');
    setRate('');
  };

  const sorted = [...rateChanges].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Interest Rate Changes
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        Add rate changes when the bank revises interest rate (e.g., due to repo rate changes). The new rate applies from the specified month onward.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effective Date
          </label>
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Annual Rate (%)
          </label>
          <input
            type="number"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 8.25"
            required
            min="0.1"
            max="50"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add Rate Change
        </button>
      </form>
      {sorted.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="pb-2 pr-4 font-medium">Effective Date</th>
                <th className="pb-2 pr-4 font-medium">New Rate</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rc) => (
                <tr
                  key={rc.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 pr-4">{formatDateFull(rc.date)}</td>
                  <td className="py-2 pr-4">{rc.newRate}%</td>
                  <td className="py-2">
                    <button
                      onClick={() => onRemove(rc.id)}
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
    </div>
  );
}
