import { useState, useMemo } from 'react';
import { useLoanData } from './hooks/useLoanData';
import { useAmortization } from './hooks/useAmortization';
import { useExportPdf } from './hooks/useExportPdf';
import type { PrePayment, AmortizationResult } from './types/loan';
import { calculateAmortization } from './utils/amortization';
import { LoanForm } from './components/LoanForm';
import { PrePaymentList } from './components/PrePaymentList';
import { RateChangeList } from './components/RateChangeList';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationTable } from './components/AmortizationTable';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { PdfReport } from './components/pdf/PdfReport';
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
  const { reportRef, isGenerating, exportPdf } = useExportPdf();

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
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Analyser</h1>
            <p className="text-sm text-gray-500">
              Visualise your loan, add pre-payments, and see how much you save
            </p>
          </div>
          {summary && loan && (
            <button
              onClick={() => exportPdf()}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          )}
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

      {isGenerating && summary && loan && activeResult && (
        <PdfReport
          ref={reportRef}
          loan={loan}
          summary={summary}
          prePayments={prePayments}
          rateChanges={rateChanges}
          activeResult={activeResult}
          isSimulated={!!simulatedResult}
        />
      )}
    </div>
  );
}

export default App;
