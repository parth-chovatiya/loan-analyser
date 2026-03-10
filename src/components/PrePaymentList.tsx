import { useState } from 'react';
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
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
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
                  <div className="flex items-center gap-1 sm:opacity-0 transition-all sm:group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(pp)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-500"
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
                      onClick={() => onRemove(pp.id)}
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
        <p className="text-sm text-slate-400 italic">No pre-payments added yet</p>
      )}
    </div>
  );
};
