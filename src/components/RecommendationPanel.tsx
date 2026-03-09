import { useState } from 'react';
import type { RecommendResponse, Recommendation } from '../types/recommendation';
import { formatCurrency } from '../utils/formatters';

interface Props {
  data: RecommendResponse | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
}

const typeConfig: Record<Recommendation['type'], { label: string; icon: string; bg: string }> = {
  prepayment: {
    label: 'Prepayment',
    icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-emerald-500',
  },
  emi_increase: {
    label: 'EMI Increase',
    icon: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
    bg: 'bg-blue-500',
  },
  lump_sum_timing: {
    label: 'Lump Sum',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    bg: 'bg-violet-500',
  },
};

const priorityConfig: Record<Recommendation['priority'], { label: string; class: string }> = {
  high: {
    label: 'High Impact',
    class: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/10',
  },
  medium: { label: 'Medium', class: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/10' },
  low: { label: 'Low', class: 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10' },
};

export const RecommendationPanel = ({ data, loading, error, onFetch }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Smart Recommendations</h2>
            <p className="text-xs text-slate-500">Personalised strategies to save on your loan</p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-6 py-5 space-y-5">
          {!data && !loading && !error && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <svg
                  className="h-7 w-7 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Get personalised strategies based on your loan data
              </p>
              <button
                onClick={onFetch}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
              >
                Get Recommendations
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-10">
              <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
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
              <span className="text-sm text-slate-500">Analysing strategies...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <svg
                className="h-4 w-4 shrink-0"
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

          {data && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  {data.recommendations.length} strategies found
                </p>
                <button
                  onClick={onFetch}
                  disabled={loading}
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                    />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {data.recommendations.map((rec) => {
                  const config = typeConfig[rec.type];
                  const priority = priorityConfig[rec.priority];
                  return (
                    <div
                      key={rec.id}
                      className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} shadow-sm`}
                        >
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {config.label}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${priority.class}`}
                            >
                              {priority.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                            {rec.description}
                          </p>
                          <div className="mt-3 flex gap-5">
                            <div>
                              <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(rec.impact.interestSaved)}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                saved
                              </p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-blue-600">
                                {rec.impact.monthsSaved} mo
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                shorter
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
