import { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCw,
  PiggyBank,
  TrendingUp,
  Coins,
  type LucideIcon,
} from 'lucide-react';
import type { RecommendResponse, Recommendation } from '../types/recommendation';
import { formatCurrency } from '../utils/formatters';

interface Props {
  data: RecommendResponse | null;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
}

const typeConfig: Record<Recommendation['type'], { label: string; icon: LucideIcon; bg: string }> = {
  prepayment: {
    label: 'Prepayment',
    icon: PiggyBank,
    bg: 'bg-emerald-500',
  },
  emi_increase: {
    label: 'EMI Increase',
    icon: TrendingUp,
    bg: 'bg-blue-500',
  },
  lump_sum_timing: {
    label: 'Lump Sum',
    icon: Coins,
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
        className="cursor-pointer flex w-full items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left transition-colors hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Smart Recommendations</h2>
            <p className="text-xs text-slate-500">Personalised strategies to save on your loan</p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          {!data && !loading && !error && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Zap className="h-7 w-7 text-indigo-500" strokeWidth={1.5} />
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
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" strokeWidth={2} />
              <span className="text-sm text-slate-500">Analysing strategies...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
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
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {data.recommendations.map((rec) => {
                  const config = typeConfig[rec.type];
                  const priority = priorityConfig[rec.priority];
                  const Icon = config.icon;
                  return (
                    <div
                      key={rec.id}
                      className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} shadow-sm`}
                        >
                          <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
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
                          <div className="mt-3 flex gap-4 sm:gap-5">
                            <div>
                              <p className="text-base sm:text-lg font-bold text-emerald-600">
                                {formatCurrency(rec.impact.interestSaved)}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                saved
                              </p>
                            </div>
                            <div>
                              <p className="text-base sm:text-lg font-bold text-blue-600">
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
