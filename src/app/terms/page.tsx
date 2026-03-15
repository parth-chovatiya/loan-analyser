import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for Loan Analyser. Understand the terms and conditions for using our free loan analysis tool.',
  alternates: {
    canonical: 'https://loananalyzer.parthchovatiya.tech/terms',
  },
};

const TermsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-3 text-slate-900 hover:text-blue-600 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              <span className="text-sm font-medium">Back to Loan Analyser</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <article className="prose prose-slate max-w-none">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Terms of Service</h1>
          <p className="text-sm text-slate-500 mt-1">Last updated: 15 March 2026</p>

          <section className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing and using Loan Analyser (&quot;the tool&quot;), you agree to be bound
                by these Terms of Service. If you do not agree, please do not use the tool.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. Nature of the Service</h2>
              <p className="mt-2">
                Loan Analyser is a free, online calculator that provides estimated loan
                amortization schedules, EMI breakdowns, pre-payment impact analysis, and AI-powered
                recommendations. The tool is provided &quot;as is&quot; for informational and
                educational purposes only.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">3. Not Financial Advice</h2>
              <p className="mt-2">
                <strong>
                  The information provided by Loan Analyser does not constitute financial, legal, or
                  tax advice.
                </strong>{' '}
                All calculations are approximate and based on standard reducing-balance EMI formulas.
                Actual loan terms, interest calculations, and charges may vary based on your lender,
                loan agreement, and applicable regulations.
              </p>
              <p className="mt-2">
                Always consult your bank or a qualified financial advisor before making financial
                decisions based on the tool&apos;s output.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">4. Accuracy of Calculations</h2>
              <p className="mt-2">While we strive for accuracy, we do not guarantee that:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  Calculations will exactly match your lender&apos;s computations (differences may
                  arise due to rounding, day-count conventions, or processing dates).
                </li>
                <li>
                  AI-generated recommendations or chat responses are accurate, complete, or suitable
                  for your specific situation.
                </li>
                <li>The tool will be available without interruption or error.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">5. AI Features</h2>
              <p className="mt-2">
                The AI Chat Assistant and Smart Recommendations features use a third-party AI
                service. These features:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>May produce inaccurate or incomplete responses.</li>
                <li>Should not be relied upon as the sole basis for financial decisions.</li>
                <li>
                  Process your loan data as described in our{' '}
                  <Link href="/privacy" className="text-blue-600 underline hover:text-blue-700">
                    Privacy Policy
                  </Link>
                  .
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">6. User Responsibilities</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>You are responsible for the accuracy of the data you enter into the tool.</li>
                <li>
                  You should independently verify all calculations before acting on them.
                </li>
                <li>
                  You agree not to use the tool for any unlawful purpose or to misrepresent its
                  outputs.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                7. Limitation of Liability
              </h2>
              <p className="mt-2">
                To the maximum extent permitted by applicable law, Loan Analyser and its creators
                shall not be liable for any direct, indirect, incidental, consequential, or punitive
                damages arising from your use of or inability to use the tool, including but not
                limited to financial losses based on the tool&apos;s calculations or AI
                recommendations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">8. Intellectual Property</h2>
              <p className="mt-2">
                The tool&apos;s design, code, and content are the intellectual property of their
                respective owners. You may use the tool for personal, non-commercial purposes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">9. Modifications</h2>
              <p className="mt-2">
                We reserve the right to modify, suspend, or discontinue the tool at any time without
                notice. We may also update these terms, with changes effective upon posting.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">10. Governing Law</h2>
              <p className="mt-2">
                These terms are governed by and construed in accordance with the laws of India. Any
                disputes shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </div>
          </section>
        </article>
      </main>
    </div>
);

export default TermsPage;
