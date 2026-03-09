import type { LoanInput, PrePayment, RateChange } from '../types/loan';

const STORAGE_KEY = 'loan-analyser-state';

export interface StoredState {
  loan: LoanInput | null;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
}

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { loan: null, prePayments: [], rateChanges: [] };
    const parsed = JSON.parse(raw);
    return { loan: null, prePayments: [], rateChanges: [], ...parsed } as StoredState;
  } catch {
    return { loan: null, prePayments: [], rateChanges: [] };
  }
}

export function saveState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
