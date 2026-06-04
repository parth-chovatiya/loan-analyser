# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Next.js dev server at http://localhost:3000
npm run build          # Production build
npm start              # Serve production build
npm run lint           # ESLint (flat config, eslint.config.js)
npm run format         # Prettier write over src/**/*.{ts,tsx,css}
npm run format:check   # Prettier check (CI-safe)
```

There is no test runner configured in this repo.

## Environment

- `OPENAI_API_KEY` (in `.env.local`, gitignored) — required by `/api/chat` and `/api/recommend` is pure-compute (no key). The chat and intent-detection calls use `gpt-4o-mini`.
- App runs without secrets for everything except the AI chat feature.

## Architecture

Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS 4 + Recharts. The app is a **client-side single-page tool** with three thin API routes for tasks that can't run in the browser.

### The amortization engine is the single source of truth

`src/utils/amortization.ts` (`calculateAmortization`) is the core. Every feature — charts, summary cards, recommendations, the AI chat, and the PDF — derives its numbers from this one function. When touching loan math, change it here; do not recompute loan figures elsewhere.

Domain is **Indian reducing-balance EMI loans**: pre-payments are applied to principal *before* interest is computed for that month (see the comment at amortization.ts:83); amounts are formatted in lakhs/crores (₹). `generateSummary` (`src/utils/summary.ts`) wraps the engine to produce `withPrePayments` vs `withoutPrePayments` results plus interest/months saved.

### Rendering path

`src/app/page.tsx` (server) → `client-app.tsx` (`'use client'`) → `src/App.tsx`. `App.tsx` is the real root component holding all UI state and orchestrating hooks. Note `src/App.tsx` lives outside `src/app/` — it's the legacy component root from a pre-Next.js (Vite) structure. The `dist/` folder is a stale Vite build artifact and is not part of the Next.js build.

### State & persistence

No backend database. All loan state lives in React via `useLoanData` (`src/hooks/useLoanData.ts`) and is debounce-persisted to `localStorage` under key `loan-analyser-state` (`src/utils/storage.ts`). The "What-If Simulator" keeps a separate `plannedPPs` state in `App.tsx` that is merged with real pre-payments only for simulated views.

### Data flow layers

- `src/types/` — shared domain types (`loan.ts` is central: `LoanInput`, `PrePayment`, `RateChange`, `AmortizationRow/Result`, `LoanSummary`).
- `src/utils/` — pure functions: amortization, summary, validation, formatters, and `chatContext.ts` (builds the enriched LLM context + what-if scenario computation).
- `src/hooks/` — stateful glue (`useAmortization`, `useRecommendations`, `useExportPdf`, `useChat`, `useLoanData`).
- `src/services/recommendations/` — strategy generators (prepayment, emi-increase, lump-sum) combined and ranked by `interestSaved` in `index.ts`.
- `src/components/` — UI, with `charts/` (Recharts) and `pdf/` subfolders.

### API routes (`src/app/api/`)

- `recommend/route.ts` — validates loan, calls `getRecommendations`, returns ranked strategies. Pure compute, no external calls.
- `chat/route.ts` — OpenAI chat. Pattern: detect what-if intent (`hasWhatIfKeywords` → `detectScenarioIntent` LLM classify → `computeScenario` via the local engine), inject **pre-computed** numbers into the system prompt, then stream the response as SSE. The LLM is explicitly instructed never to do its own math — it only narrates engine output.
- `export-pdf/route.ts` — server-rendered PDF via `puppeteer-core`. Uses a locally-detected Chrome in `development` and `@sparticuz/chromium` in production (serverless). HTML comes from `export-pdf/template.ts`. `maxDuration = 30`.

## Conventions

- Path alias `@/*` → `src/*` (tsconfig). Components/hooks under `src/` often use relative imports; API routes and utils use `@/`.
- TypeScript `strict` is on. Keep loan calculations immutable and centralized in the engine.
- Security headers are set globally in `next.config.ts`.
