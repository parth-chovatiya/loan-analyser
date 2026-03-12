# Loan Analyser

> **A free, privacy-first EMI calculator and loan management tool — no sign-up, no data sent to any server.**

🌐 **Live Demo:** [loananalyzer.parthchovatiya.tech](https://loananalyzer.parthchovatiya.tech)

---

## About the Project

Loan Analyser is a full-featured, client-side web application that helps borrowers take control of their loans. Whether you have a home loan, car loan, personal loan, or education loan, this tool gives you a complete picture of your repayment journey — from your first EMI to the final closure date.

The idea was born from a real need: most loan calculators online only tell you your monthly EMI. They don't help you understand *how much interest you're actually paying*, *what happens if you make a lump-sum prepayment*, or *how a bank rate revision changes your schedule*. Loan Analyser answers all of those questions in real time, with interactive charts and a month-by-month amortization breakdown.

Everything runs entirely in the browser. No account creation, no data uploaded to any server — your financial details stay on your device.

---

## Key Features

| Feature | Description |
|---|---|
| **EMI Calculator** | Enter principal, interest rate, and tenure to compute your monthly EMI instantly |
| **Prepayment Planner** | Add one-time or recurring lump-sum payments and see the exact interest saved and months reduced |
| **Amortization Schedule** | Full month-by-month table of principal, interest, and outstanding balance |
| **What-If Simulator** | Model future prepayment scenarios and compare outcomes side by side |
| **Rate Change Tracker** | Log bank rate revisions and automatically recalculate the remaining schedule |
| **Smart Recommendations** | Rule-based engine that suggests the most cost-effective prepayment strategy for your loan |
| **Visual Charts** | Balance curve, payment breakdown (principal vs. interest), and cumulative interest graphs built with Recharts |
| **PDF Export** | Download a complete amortization report as a PDF with one click |
| **Local Persistence** | Loan data is saved to `localStorage` so your inputs survive page refreshes |

---

## Portfolio Highlights

- **End-to-end ownership** — designed, architected, built, and deployed solo
- **Zero backend dependencies** — all financial calculations happen client-side with pure TypeScript
- **Complex domain logic** — custom amortization engine that correctly handles mid-tenure prepayments and floating interest rates
- **Performance-conscious** — lazy-loaded PDF library, memoised chart data, and no unnecessary re-renders
- **Deployed to a custom domain** on Vercel with Vercel Analytics integrated for usage insights

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| PDF Export | [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) |
| Date Utilities | [date-fns](https://date-fns.org/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Linting / Formatting | ESLint + Prettier |

---

## Getting Started

```bash
# install dependencies
npm install

# start the development server
npm run dev

# build for production
npm run build

# run the production build
npm start
```

Then open `http://localhost:3000` in your browser.

---

## Environment & Deployment

This app is designed to work without any secrets committed to the repository.

If you add environment variables (e.g. analytics keys, third-party APIs), put them in a `.env.local` file that is **not** committed to git. The `.gitignore` is already configured to ignore common `.env*` files.

The production instance lives at **[https://loananalyzer.parthchovatiya.tech](https://loananalyzer.parthchovatiya.tech)**.

---

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for details.
