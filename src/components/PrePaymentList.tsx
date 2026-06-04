import { useState } from 'react';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import type { PrePayment } from '../types/loan';
import { formatCurrency, formatDateFull } from '../utils/formatters';
import { PrePaymentForm } from './PrePaymentForm';

interface Props {
  prePayments: PrePayment[];
  onAdd: (pp: PrePayment) => void;
  onUpdate: (pp: PrePayment) => void;
  onRemove: (id: string) => void;
}

export const PrePaymentList = ({ prePayments, onAdd, onUpdate, onRemove }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const sorted = [...prePayments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const startEdit = (pp: PrePayment) => {
    setEditingId(pp.id);
    setEditDate(pp.date);
    setEditAmount(String(pp.amount));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate('');
    setEditAmount('');
  };

  const saveEdit = (id: string) => {
    if (!editDate || !editAmount) return;
    onUpdate({ id, date: editDate, amount: Number(editAmount) });
    cancelEdit();
  };

  const inputClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="space-y-5">
      <PrePaymentForm onAdd={onAdd} />
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((pp) => (
            <div
              key={pp.id}
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50"
            >
              {editingId === pp.id ? (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <input
                    type="date"
                    className={inputClass}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      &#8377;
                    </span>
                    <input
                      type="number"
                      className={`${inputClass} pl-7 w-36`}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      required
                      min="1"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => saveEdit(pp.id)}
                      className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.97]"
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
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <CalendarDays className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(pp.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateFull(pp.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:opacity-0 transition-all sm:group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(pp)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-500"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => onRemove(pp.id)}
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
        <p className="text-sm text-slate-400 italic">No pre-payments added yet</p>
      )}
    </div>
  );
};
