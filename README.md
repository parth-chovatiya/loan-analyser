## Loan Analyzer

Interactive loan comparison tool built with Next.js, React, TypeScript, Tailwind CSS, and Recharts.

It lets you compare multiple loans side‑by‑side, visualize amortization, and export/share the results.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS 4
- Recharts

## Getting started

```bash
# install deps
npm install

# run dev server
npm run dev

# build for production
npm run build

# run production build
npm start
```

Then open `http://localhost:3000` in your browser.

## Environment & deployment

This app is designed to work without any secrets committed to the repo.

If you add environment variables (e.g. analytics keys, third‑party APIs), put them in a `.env.local` file that is **not** committed to git. The `.gitignore` is already configured to ignore common `.env*` files.

The production instance currently lives at `https://loananalyzer.parthchovatiya.tech`.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
