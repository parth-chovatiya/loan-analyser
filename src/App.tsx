import { useState, useMemo } from 'react';
import { useLoanData } from './hooks/useLoanData';
import { useAmortization } from './hooks/useAmortization';
import type { PrePayment, AmortizationResult } from './types/loan';
import { calculateAmortization } from './utils/amortization';
import { LoanForm } from './components/LoanForm';
import { PrePaymentList } from './components/PrePaymentList';
import { RateChangeList } from './components/RateChangeList';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationTable } from './components/AmortizationTable';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { BalanceChart } from './components/charts/BalanceChart';
import { PrincipalInterestChart } from './components/charts/PrincipalInterestChart';
import { ComparisonChart } from './components/charts/ComparisonChart';
import { CumulativeInterestChart } from './components/charts/CumulativeInterestChart';
import { PaymentBreakupChart } from './components/charts/PaymentBreakupChart';
import { YearlySummaryChart } from './components/charts/YearlySummaryChart';

function App() {
  const {
    loan, setLoan,
    prePayments, addPrePayment, removePrePayment,
    rateChanges, addRateChange, removeRateChange,
  } = useLoanData();
  const { summary, error } = useAmortization(loan, prePayments, rateChanges);

  // Simulator state (not persisted)
  const [plannedPPs, setPlannedPPs] = useState<PrePayment[]>([]);

  const simulatedResult = useMemo<AmortizationResult | null>(() => {
    if (!loan || plannedPPs.length === 0) return null;
    const allPPs = [...prePayments, ...plannedPPs];
    return calculateAmortization(loan, allPPs, rateChanges);
  }, [loan, prePayments, rateChanges, plannedPPs]);

  // Use simulated schedule for charts/table when active
  const activeResult = simulatedResult ?? summary?.withPrePayments ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Loan Analyser</h1>
          <p className="text-sm text-gray-500">
            Visualise your loan, add pre-payments, and see how much you save
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <LoanForm loan={loan} onSubmit={setLoan} />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loan && (
          <>
            <PrePaymentList
              prePayments={prePayments}
              onAdd={addPrePayment}
              onRemove={removePrePayment}
            />
            <RateChangeList
              rateChanges={rateChanges}
              onAdd={addRateChange}
              onRemove={removeRateChange}
            />
          </>
        )}

        {summary && loan && (
          <>
            <WhatIfSimulator
              plannedPPs={plannedPPs}
              onAdd={(pp) => setPlannedPPs((prev) => [...prev, pp])}
              onRemove={(id) => setPlannedPPs((prev) => prev.filter((p) => p.id !== id))}
              currentResult={summary.withPrePayments}
              simulatedResult={simulatedResult}
            />

            <SummaryCards summary={summary} loan={loan} />

            {simulatedResult && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 flex items-center gap-2">
                <span className="font-semibold">Simulation active</span>
                &mdash; Charts and table below reflect your planned pre-payments.
                <button
                  onClick={() => setPlannedPPs([])}
                  className="ml-auto text-amber-600 hover:text-amber-800 font-medium underline"
                >
                  Clear simulation
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BalanceChart
                summary={summary}
                simulatedResult={simulatedResult}
              />
              <CumulativeInterestChart
                summary={summary}
                simulatedResult={simulatedResult}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ComparisonChart
                summary={summary}
                simulatedResult={simulatedResult}
              />
              <PaymentBreakupChart summary={summary} />
            </div>

            <PrincipalInterestChart
              schedule={activeResult!.schedule}
              isSimulated={!!simulatedResult}
            />

            <YearlySummaryChart
              schedule={activeResult!.schedule}
              isSimulated={!!simulatedResult}
            />

            <AmortizationTable
              schedule={activeResult!.schedule}
              isSimulated={!!simulatedResult}
              actualScheduleLength={summary.withPrePayments.schedule.length}
              plannedPPMonths={new Set(
                plannedPPs.map((pp) => pp.date.substring(0, 7))
              )}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
