import type { LoanInput, PrePayment, RateChange } from '../types/loan';

const STORAGE_KEY = 'loan-analyser-state';

export interface StoredState {
  loan: LoanInput | null;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
}

const DEFAULT_STATE: StoredState = {
  loan: null,
  prePayments: [],
  rateChanges: [],
};

export const loadState = (): StoredState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed } as StoredState;
  } catch {
    return DEFAULT_STATE;
  }
};

export const saveState = (state: StoredState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
