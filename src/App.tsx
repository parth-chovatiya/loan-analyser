import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLoanData } from './hooks/useLoanData';
import { useAmortization } from './hooks/useAmortization';
import { useExportPdf } from './hooks/useExportPdf';
import { useRecommendations } from './hooks/useRecommendations';
import type { PrePayment, AmortizationResult } from './types/loan';
import { calculateAmortization } from './utils/amortization';
import { LoanForm } from './components/LoanForm';
import { PrePaymentList } from './components/PrePaymentList';
import { RateChangeList } from './components/RateChangeList';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationTable } from './components/AmortizationTable';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { RecommendationPanel } from './components/RecommendationPanel';
import { ChatWidget } from './components/ChatWidget';
import { BalanceChart } from './components/charts/BalanceChart';
import { PrincipalInterestChart } from './components/charts/PrincipalInterestChart';
import { ComparisonChart } from './components/charts/ComparisonChart';
import { CumulativeInterestChart } from './components/charts/CumulativeInterestChart';
import { PaymentBreakupChart } from './components/charts/PaymentBreakupChart';
import { YearlySummaryChart } from './components/charts/YearlySummaryChart';

const App = () => {
  const {
    loan,
    setLoan,
    prePayments,
    addPrePayment,
    updatePrePayment,
    removePrePayment,
    rateChanges,
    addRateChange,
    updateRateChange,
    removeRateChange,
  } = useLoanData();
  const { summary, error } = useAmortization(loan, prePayments, rateChanges);
  const { isGenerating, exportPdf } = useExportPdf();
  const {
    data: recommendations,
    loading: recLoading,
    error: recError,
    fetchRecommendations,
  } = useRecommendations(loan, prePayments, rateChanges);

  const [plannedPPs, setPlannedPPs] = useState<PrePayment[]>([]);
  const [activeTab, setActiveTab] = useState<'prepayments' | 'rates'>('prepayments');

  const simulatedResult = useMemo<AmortizationResult | null>(() => {
    if (!loan || plannedPPs.length === 0) return null;
    const allPPs = [...prePayments, ...plannedPPs];
    return calculateAmortization(loan, allPPs, rateChanges);
  }, [loan, prePayments, rateChanges, plannedPPs]);

  const activeResult = simulatedResult ?? summary?.withPrePayments ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Loan Analyser</h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Smart insights for your loan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {summary && loan && (
                <button
                  onClick={() => exportPdf({ loan, prePayments, rateChanges, plannedPrePayments: plannedPPs })}
                  disabled={isGenerating}
                  className="cursor-pointer group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 transition-transform group-hover:-translate-y-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Export PDF
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Loan Form */}
        <LoanForm loan={loan} onSubmit={setLoan} />

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg
              className="h-5 w-5 shrink-0 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Pre-Payments & Rate Changes — Tabbed */}
        {loan && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200" role="tablist" aria-label="Loan adjustments">
              <button
                role="tab"
                id="tab-prepayments"
                aria-selected={activeTab === 'prepayments'}
                aria-controls="panel-prepayments"
                onClick={() => setActiveTab('prepayments')}
                className={`cursor-pointer flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm font-medium transition-colors relative ${
                  activeTab === 'prepayments'
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pre-Payments
                {prePayments.length > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700">
                    {prePayments.length}
                  </span>
                )}
                {activeTab === 'prepayments' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                role="tab"
                id="tab-rates"
                aria-selected={activeTab === 'rates'}
                aria-controls="panel-rates"
                onClick={() => setActiveTab('rates')}
                className={`cursor-pointer flex-1 px-4 sm:px-6 py-3 sm:py-3.5 text-sm font-medium transition-colors relative ${
                  activeTab === 'rates'
                    ? 'text-indigo-600 bg-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Rate Changes
                {rateChanges.length > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-semibold text-indigo-700">
                    {rateChanges.length}
                  </span>
                )}
                {activeTab === 'rates' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            </div>
            <div
              role="tabpanel"
              id={activeTab === 'prepayments' ? 'panel-prepayments' : 'panel-rates'}
              aria-labelledby={activeTab === 'prepayments' ? 'tab-prepayments' : 'tab-rates'}
              className="p-4 sm:p-6"
            >
              {activeTab === 'prepayments' ? (
                <PrePaymentList
                  prePayments={prePayments}
                  onAdd={addPrePayment}
                  onUpdate={updatePrePayment}
                  onRemove={removePrePayment}
                />
              ) : (
                <RateChangeList
                  rateChanges={rateChanges}
                  onAdd={addRateChange}
                  onUpdate={updateRateChange}
                  onRemove={removeRateChange}
                />
              )}
            </div>
          </div>
        )}

        {summary && loan && (
          <>
            {/* Summary Cards */}
            <SummaryCards summary={summary} loan={loan} />

            {/* Recommendations */}
            <RecommendationPanel
              data={recommendations}
              loading={recLoading}
              error={recError}
              onFetch={fetchRecommendations}
            />

            {/* What-If Simulator */}
            <WhatIfSimulator
              plannedPPs={plannedPPs}
              onAdd={(pp) => setPlannedPPs((prev) => [...prev, pp])}
              onRemove={(id) => setPlannedPPs((prev) => prev.filter((p) => p.id !== id))}
              currentResult={summary.withPrePayments}
              simulatedResult={simulatedResult}
            />

            {/* Simulation Banner */}
            {simulatedResult && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 sm:px-5 py-3 text-sm">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <svg
                      className="h-4 w-4 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-amber-800">Simulation active</span>
                    <span className="text-amber-700 hidden sm:inline">
                      {' '}
                      — Charts reflect planned pre-payments
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPlannedPPs([])}
                  className="cursor-pointer shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <BalanceChart summary={summary} simulatedResult={simulatedResult} />
              <CumulativeInterestChart summary={summary} simulatedResult={simulatedResult} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <ComparisonChart summary={summary} simulatedResult={simulatedResult} />
              <PaymentBreakupChart summary={summary} />
            </div>

            <PrincipalInterestChart
              schedule={activeResult!.schedule}
              isSimulated={!!simulatedResult}
            />

            <YearlySummaryChart schedule={activeResult!.schedule} isSimulated={!!simulatedResult} />

            {/* Amortization Table */}
            <AmortizationTable
              schedule={activeResult!.schedule}
              isSimulated={!!simulatedResult}
              actualScheduleLength={summary.withPrePayments.schedule.length}
              plannedPPMonths={new Set(plannedPPs.map((pp) => pp.date.substring(0, 7)))}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="https://forms.gle/Ua5i1PJ5ZA2ovFcb7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                Suggestions
              </a>
              <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Loan Analyser — All calculations are approximate and for informational purposes only.
              Not financial advice.
            </p>
          </div>
        </div>
      </footer>

      {loan && summary && (
        <ChatWidget
          loan={loan}
          prePayments={prePayments}
          rateChanges={rateChanges}
        />
      )}

    </div>
  );
};

export default App;
