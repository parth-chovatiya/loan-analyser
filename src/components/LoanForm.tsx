import { useState, useEffect } from 'react';
import type { LoanInput } from '../types/loan';

interface Props {
  loan: LoanInput | null;
  onSubmit: (loan: LoanInput) => void;
}

export function LoanForm({ loan, onSubmit }: Props) {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [emi, setEmi] = useState('');
  const [emiDay, setEmiDay] = useState('5');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (loan) {
      setPrincipal(String(loan.principal));
      setRate(String(loan.annualRate));
      setEmi(String(loan.emi));
      setEmiDay(String(loan.emiDebitDay));
      setStartDate(loan.startDate);
    }
  }, [loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: loan?.id || crypto.randomUUID(),
      principal: Number(principal),
      annualRate: Number(rate),
      emi: Number(emi),
      emiDebitDay: Number(emiDay),
      startDate,
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Loan Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass}>Principal Amount (₹)</label>
          <input
            type="number"
            className={inputClass}
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 1000000"
            required
            min="1"
          />
        </div>
        <div>
          <label className={labelClass}>Annual Interest Rate (%)</label>
          <input
            type="number"
            className={inputClass}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 8.5"
            required
            min="0.1"
            max="50"
            step="0.01"
          />
        </div>
        <div>
          <label className={labelClass}>EMI Amount (₹)</label>
          <input
            type="number"
            className={inputClass}
            value={emi}
            onChange={(e) => setEmi(e.target.value)}
            placeholder="e.g. 8678"
            required
            min="1"
          />
        </div>
        <div>
          <label className={labelClass}>EMI Debit Day (1-28)</label>
          <input
            type="number"
            className={inputClass}
            value={emiDay}
            onChange={(e) => setEmiDay(e.target.value)}
            required
            min="1"
            max="28"
          />
        </div>
        <div>
          <label className={labelClass}>Loan Start Date</label>
          <input
            type="date"
            className={inputClass}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loan ? 'Update Loan' : 'Analyse Loan'}
          </button>
        </div>
      </div>
    </form>
  );
}
