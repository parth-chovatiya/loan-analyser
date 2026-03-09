import { useState } from 'react';
import type { RecommendResponse, Recommendation } from '../types/recommendation';

interface Props {
  data: RecommendResponse | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
}

const typeLabels: Record<Recommendation['type'], string> = {
  prepayment: 'Prepayment',
  refinance: 'Refinancing',
  emi_increase: 'EMI Increase',
  lump_sum_timing: 'Lump Sum Timing',
};

const priorityStyles: Record<Recommendation['priority'], string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-700',
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RecommendationPanel({ data, loading, error, onFetch }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-indigo-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Best Strategy Recommendations</h2>
            <p className="text-sm text-gray-500">AI-powered strategies to save on your loan</p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-indigo-100 px-5 py-4 space-y-4">
          {!data && !loading && !error && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Analyse your loan to get personalised repayment strategies
              </p>
              <button
                onClick={onFetch}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Smart Recommendations
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-gray-600">Analysing strategies...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {data && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {data.recommendations.length} strategies found
                </p>
                <button
                  onClick={onFetch}
                  disabled={loading}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {data.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                          {typeLabels[rec.type]}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{rec.title}</h3>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[rec.priority]}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                    <div className="flex gap-4 pt-1">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-green-700">{formatINR(rec.impact.interestSaved)}</span> saved
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-blue-700">{rec.impact.monthsSaved}</span> months shorter
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
