import { useState, useCallback } from 'react';
import type { LoanInput, PrePayment, RateChange } from '../types/loan';
import type { RecommendResponse } from '../types/recommendation';

export function useRecommendations(
  loan: LoanInput | null,
  prePayments: PrePayment[],
  rateChanges: RateChange[]
) {
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!loan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan, prePayments, rateChanges }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch recommendations');
      }
      const json: RecommendResponse = await res.json();
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loan, prePayments, rateChanges]);

  return { data, loading, error, fetchRecommendations };
}
