import { useState } from 'react';
import type { PrePayment } from '../types/loan';

interface Props {
  onAdd: (pp: PrePayment) => void;
}

export function PrePaymentForm({ onAdd }: Props) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;
    onAdd({
      id: crypto.randomUUID(),
      date,
      amount: Number(amount),
    });
    setDate('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
        <input
          type="number"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 100000"
          required
          min="1"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Add Pre-Payment
      </button>
    </form>
  );
}
