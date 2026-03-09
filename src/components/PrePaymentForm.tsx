import { useState } from 'react';
import type { PrePayment } from '../types/loan';

interface Props {
  onAdd: (pp: PrePayment) => void;
}

export const PrePaymentForm = ({ onAdd }: Props) => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;
    onAdd({ id: crypto.randomUUID(), date, amount: Number(amount) });
    setDate('');
    setAmount('');
  };

  const inputClass =
    'rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Date
        </label>
        <input
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
            placeholder="1,00,000"
            required
            min="1"
          />
        </div>
      </div>
      <button
        type="submit"
        className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
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
  );
};
