import { useState } from 'react';
import { Plus, TrendingUp, Pencil, Trash2 } from 'lucide-react';
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
          <Plus className="h-4 w-4" strokeWidth={2} />
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
                      <TrendingUp className="h-4 w-4" strokeWidth={2} />
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
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => onRemove(rc.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
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
