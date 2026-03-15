import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Loan Analyser. Learn how we handle your data, what information is processed, and your rights.',
  alternates: {
    canonical: 'https://loananalyzer.parthchovatiya.tech/privacy',
  },
};

const PrivacyPage = () => (
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mt-1">Last updated: 15 March 2026</p>

          <section className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">1. Overview</h2>
              <p className="mt-2">
                Loan Analyser (&quot;we&quot;, &quot;us&quot;, &quot;the tool&quot;) is a free,
                client-side loan analysis tool. We are committed to protecting your privacy. This
                policy explains what data is processed and how.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. Data We Do NOT Collect</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>We do not require user registration or login.</li>
                <li>We do not store your loan details, pre-payments, or rate changes on our servers.</li>
                <li>We do not use cookies for tracking or advertising.</li>
                <li>We do not sell, share, or trade any user data with third parties.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">3. Client-Side Processing</h2>
              <p className="mt-2">
                All loan calculations (EMI, amortization schedules, interest savings, what-if
                simulations) are performed entirely in your browser. Your loan data never leaves your
                device for these calculations.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                4. AI Chat Assistant &amp; Recommendations
              </h2>
              <p className="mt-2">
                When you use the AI Chat Assistant or request AI-powered recommendations, your loan
                details (principal, interest rate, EMI, pre-payments, and rate changes) are sent to a
                third-party AI service to generate responses. This data is:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Sent securely over HTTPS.</li>
                <li>Used solely to generate your response and not stored by us.</li>
                <li>Not used for AI model training.</li>
              </ul>
              <p className="mt-2">
                <strong>You can use the tool without the AI features.</strong> The chat and
                recommendations are entirely optional.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">5. Analytics</h2>
              <p className="mt-2">
                We collect anonymous, aggregated usage data such as page views and performance
                metrics to improve the tool. This does not include any personal information or your
                loan details, and no cookies are used for analytics.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">6. PDF Export</h2>
              <p className="mt-2">
                When you export a PDF report, your loan data is sent to our server to generate the
                PDF document. This data is processed in memory and is not stored or logged. The
                generated PDF is returned directly to your browser.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">7. Local Storage</h2>
              <p className="mt-2">
                Your loan details may be saved in your browser&apos;s local storage for convenience
                so that your data persists between sessions. This data remains on your device and is
                not transmitted to any server. You can clear it at any time through your browser
                settings.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">8. Your Rights</h2>
              <p className="mt-2">
                Since we do not collect or store personal data, there is no personal data to access,
                modify, or delete. You can clear your browser&apos;s local storage at any time to
                remove any locally saved loan details.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">9. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this privacy policy from time to time. Changes will be reflected on
                this page with an updated date.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">10. Contact</h2>
              <p className="mt-2">
                If you have questions about this privacy policy, please reach out via the feedback
                form linked in the application footer.
              </p>
            </div>
          </section>
        </article>
      </main>
    </div>
);

export default PrivacyPage;
