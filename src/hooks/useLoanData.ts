import { useState, useEffect, useRef, useCallback } from 'react';
import type { LoanInput, PrePayment, RateChange } from '../types/loan';
import { loadState, saveState } from '../utils/storage';

export const useLoanData = () => {
  const [loan, setLoan] = useState<LoanInput | null>(null);
  const [prePayments, setPrePayments] = useState<PrePayment[]>([]);
  const [rateChanges, setRateChanges] = useState<RateChange[]>([]);
  const initialized = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved.loan) setLoan(saved.loan);
    if (saved.prePayments.length) setPrePayments(saved.prePayments);
    if (saved.rateChanges.length) setRateChanges(saved.rateChanges);
    initialized.current = true;
  }, []);

  // Save to localStorage (debounced)
  useEffect(() => {
    if (!initialized.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveState({ loan, prePayments, rateChanges });
    }, 300);
    return () => clearTimeout(saveTimer.current);
  }, [loan, prePayments, rateChanges]);

  const addPrePayment = useCallback(
    (pp: PrePayment) => setPrePayments((prev) => [...prev, pp]),
    [],
  );

  const removePrePayment = useCallback(
    (id: string) => setPrePayments((prev) => prev.filter((pp) => pp.id !== id)),
    [],
  );

  const addRateChange = useCallback(
    (rc: RateChange) => setRateChanges((prev) => [...prev, rc]),
    [],
  );

  const removeRateChange = useCallback(
    (id: string) => setRateChanges((prev) => prev.filter((rc) => rc.id !== id)),
    [],
  );

  return {
    loan,
    setLoan,
    prePayments,
    addPrePayment,
    removePrePayment,
    rateChanges,
    addRateChange,
    removeRateChange,
  };
};
