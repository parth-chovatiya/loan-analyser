import puppeteer from 'puppeteer';
import type { LoanInput, PrePayment, RateChange } from '@/types/loan';
import { generateSummary } from '@/utils/summary';
import { calculateAmortization } from '@/utils/amortization';
import { buildReportHtml } from './template';

interface RequestBody {
  loan: LoanInput;
  prePayments: PrePayment[];
  rateChanges: RateChange[];
  plannedPrePayments?: PrePayment[];
}

export const POST = async (request: Request) => {
  let browser;
  try {
    const body: RequestBody = await request.json();
    const { loan, prePayments = [], rateChanges = [], plannedPrePayments = [] } = body;

    if (!loan) {
      return new Response(JSON.stringify({ error: 'Loan data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const summary = generateSummary(loan, prePayments, rateChanges);
    const isSimulated = plannedPrePayments.length > 0;
    const activeResult = isSimulated
      ? calculateAmortization(loan, [...prePayments, ...plannedPrePayments], rateChanges)
      : summary.withPrePayments;

    const html = buildReportHtml({
      loan,
      summary,
      prePayments,
      rateChanges,
      activeResult,
      isSimulated,
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    // A4 = 210mm wide, minus 10mm left + 10mm right = 190mm printable ≈ 718px at 96dpi
    await page.setViewport({ width: 718, height: 1024 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    });

    await browser.close();
    browser = undefined;

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="loan-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (err) {
    if (browser) await browser.close();
    console.error('PDF generation failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
