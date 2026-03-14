import { useState, useCallback } from 'react';
import type { LoanInput, PrePayment, RateChange } from '../types/loan';

interface ExportPdfParams {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
  plannedPrePayments?: PrePayment[];
}

export const useExportPdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const exportPdf = useCallback(
    async (params: ExportPdfParams) => {
      if (isGenerating) return;
      setIsGenerating(true);

      try {
        const response = await fetch('/api/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('PDF export failed:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating],
  );

  return { isGenerating, exportPdf };
};
