import { useState, useEffect } from 'react';
import type { LoanInput } from '../types/loan';

interface Props {
  loan: LoanInput | null;
  onSubmit: (loan: LoanInput) => void;
}

export const LoanForm = ({ loan, onSubmit }: Props) => {
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
    'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Loan Details</h2>
          <p className="text-xs text-slate-500">Enter your loan information to get started</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass}>Principal Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              &#8377;
            </span>
            <input
              type="number"
              className={`${inputClass} pl-8`}
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="10,00,000"
              required
              min="1"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Annual Interest Rate</label>
          <div className="relative">
            <input
              type="number"
              className={`${inputClass} pr-8`}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="8.5"
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
        <div>
          <label className={labelClass}>Monthly EMI</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              &#8377;
            </span>
            <input
              type="number"
              className={`${inputClass} pl-8`}
              value={emi}
              onChange={(e) => setEmi(e.target.value)}
              placeholder="8,678"
              required
              min="1"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>EMI Debit Day</label>
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
            className="cursor-pointer w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:shadow-blue-600/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            {loan ? 'Update Analysis' : 'Analyse Loan'}
          </button>
        </div>
      </div>
    </form>
  );
};
