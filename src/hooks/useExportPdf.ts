import { useRef, useState, useCallback, useEffect } from 'react';

export function useExportPdf() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const filenameRef = useRef<string | null>(null);

  // When isGenerating becomes true and PdfReport mounts, wait for
  // Recharts to paint, then capture to PDF.
  useEffect(() => {
    if (!isGenerating) return;

    let cancelled = false;

    (async () => {
      // Give Recharts time to mount & paint SVGs (needs ≥1 frame + layout)
      await new Promise((r) => setTimeout(r, 1000));
      const el = reportRef.current;
      if (cancelled || !el) {
        setIsGenerating(false);
        return;
      }

      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const date = new Date().toISOString().split('T')[0];
        const name = filenameRef.current ?? `loan-report-${date}.pdf`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (html2pdf() as any)
          .set({
            margin: 10,
            filename: name,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
          })
          .from(el)
          .save();
      } finally {
        filenameRef.current = null;
        if (!cancelled) setIsGenerating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isGenerating]);

  const exportPdf = useCallback(
    (filename?: string) => {
      if (isGenerating) return;
      filenameRef.current = filename ?? null;
      setIsGenerating(true);
    },
    [isGenerating],
  );

  return { reportRef, isGenerating, exportPdf };
}
