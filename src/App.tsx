import { useLoanData } from './hooks/useLoanData';
import { useAmortization } from './hooks/useAmortization';
import { LoanForm } from './components/LoanForm';
import { PrePaymentList } from './components/PrePaymentList';
import { RateChangeList } from './components/RateChangeList';
import { SummaryCards } from './components/SummaryCards';
import { AmortizationTable } from './components/AmortizationTable';
import { BalanceChart } from './components/charts/BalanceChart';
import { PrincipalInterestChart } from './components/charts/PrincipalInterestChart';
import { ComparisonChart } from './components/charts/ComparisonChart';

function App() {
  const {
    loan, setLoan,
    prePayments, addPrePayment, removePrePayment,
    rateChanges, addRateChange, removeRateChange,
  } = useLoanData();
  const { summary, error } = useAmortization(loan, prePayments, rateChanges);

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

        {summary && (
          <>
            <SummaryCards summary={summary} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BalanceChart summary={summary} />
              <ComparisonChart summary={summary} />
            </div>

            <PrincipalInterestChart
              schedule={summary.withPrePayments.schedule}
            />

            <AmortizationTable
              schedule={summary.withPrePayments.schedule}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
