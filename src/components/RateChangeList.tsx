import { useState } from 'react';
import type { RateChange } from '../types/loan';
import { formatDateFull } from '../utils/formatters';

interface Props {
  rateChanges: RateChange[];
  onAdd: (rc: RateChange) => void;
  onUpdate: (rc: RateChange) => void;
  onRemove: (id: string) => void;
}

export const RateChangeList = ({ rateChanges, onAdd, onUpdate, onRemove }: Props) => {
  const [date, setDate] = useState('');
  const [rate, setRate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editRate, setEditRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !rate) return;
    onAdd({ id: crypto.randomUUID(), date, newRate: Number(rate) });
    setDate('');
    setRate('');
  };

  const sorted = [...rateChanges].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const startEdit = (rc: RateChange) => {
    setEditingId(rc.id);
    setEditDate(rc.date);
    setEditRate(String(rc.newRate));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditRate('');
  };

  const saveEdit = (id: string) => {
    if (!editDate || !editRate) return;
    onUpdate({ id, date: editDate, newRate: Number(editRate) });
    cancelEdit();
  };

  const inputClass =
    'rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  const editInputClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">
        Add rate changes when your bank revises interest rate. The new rate applies from the
        specified month onward.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Effective Date
          </label>
          <input
            type="date"
            className={`${inputClass} w-full`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            New Rate
          </label>
          <div className="relative">
            <input
              type="number"
              className={`${inputClass} pr-8 w-full`}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="8.25"
              required
              min="0.1"
              max="50"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              %
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
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
          Add
        </button>
      </form>
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((rc) => (
            <div
              key={rc.id}
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50"
            >
              {editingId === rc.id ? (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <input
                    type="date"
                    className={editInputClass}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <input
                      type="number"
                      className={`${editInputClass} pr-7 w-28`}
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      required
                      min="0.1"
                      max="50"
                      step="0.01"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      %
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => saveEdit(rc.id)}
                      className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:scale-[0.97]"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100 active:scale-[0.97]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
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
                          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rc.newRate}% p.a.</p>
                      <p className="text-xs text-slate-500">from {formatDateFull(rc.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 transition-all sm:group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(rc)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-500"
                      title="Edit"
                    >
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemove(rc.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {sorted.length === 0 && (
        <p className="text-sm text-slate-400 italic">No rate changes added yet</p>
      )}
    </div>
  );
};
