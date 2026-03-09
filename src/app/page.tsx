import { ClientApp } from './client-app';

// Next.js requires a default export for page
export default function Page() {
  return (
    <>
      <ClientApp />
      {/* SEO-friendly content for search engines — visually hidden */}
      <section className="sr-only" aria-hidden="true">
        <h1>Loan Analyser - Free EMI Calculator & Pre-Payment Planner</h1>
        <p>
          Loan Analyser is a free online tool to calculate your EMI, plan pre-payments, and discover
          how much interest you can save on your home loan, personal loan, or car loan. Built for
          Indian borrowers.
        </p>
        <h2>Features</h2>
        <ul>
          <li>EMI Calculator - Enter principal, interest rate, and tenure to get monthly EMI</li>
          <li>Pre-Payment Planner - Add lump sum payments and see interest savings instantly</li>
          <li>Amortization Schedule - Month-by-month breakdown of principal and interest</li>
          <li>What-If Simulator - Plan future pre-payments and compare scenarios</li>
          <li>Rate Change Tracker - Track bank rate revisions and see updated schedules</li>
          <li>Smart Recommendations - AI-powered strategies to minimise your loan cost</li>
          <li>Visual Charts - Balance curves, payment breakup, cumulative interest graphs</li>
        </ul>
        <h2>How to use</h2>
        <p>
          Enter your loan details including principal amount, annual interest rate, monthly EMI, and
          start date. Add any pre-payments you have made or plan to make. The tool instantly
          calculates your revised amortization schedule, interest saved, months reduced, and new
          closure date.
        </p>
        <h2>Frequently Asked Questions</h2>
        <h3>How much can I save with pre-payments?</h3>
        <p>
          Even small pre-payments can save lakhs in interest over the loan tenure. Use our
          calculator to see the exact savings for your loan.
        </p>
        <h3>Does this work for home loans, car loans, and personal loans?</h3>
        <p>
          Yes. Loan Analyser works for any reducing balance EMI-based loan including home loans, car
          loans, personal loans, and education loans.
        </p>
        <h3>Is this tool free?</h3>
        <p>Yes, Loan Analyser is completely free to use with no sign-up required.</p>
      </section>
    </>
  );
}
