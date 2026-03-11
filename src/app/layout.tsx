import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const siteUrl = 'https://loananalyzer.parthchovatiya.tech';
const title = 'Loan Analyser - Free EMI Calculator & Pre-Payment Planner';
const description =
  'Free online loan analysis tool for India. Calculate EMI breakdowns, plan pre-payments to save lakhs in interest, simulate what-if scenarios, track rate changes, and get smart repayment strategies. Works for home loans, personal loans, and car loans.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Loan Analyser',
  },
  description,
  keywords: [
    'loan analyser',
    'EMI calculator',
    'pre-payment calculator',
    'home loan calculator India',
    'loan prepayment savings',
    'amortization schedule',
    'interest saved calculator',
    'what-if loan simulator',
    'loan rate change impact',
    'personal loan calculator',
    'car loan EMI calculator',
    'loan closure date calculator',
    'reduce home loan tenure',
    'loan comparison tool',
    'free EMI calculator online',
  ],
  authors: [{ name: 'Loan Analyser' }],
  creator: 'Loan Analyser',
  publisher: 'Loan Analyser',
  applicationName: 'Loan Analyser',
  category: 'Finance',
  classification: 'Finance Tool',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Loan Analyser',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Loan Analyser',
  url: siteUrl,
  description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  featureList: [
    'EMI Calculation',
    'Pre-Payment Planning',
    'Amortization Schedule',
    'What-If Simulation',
    'Rate Change Tracking',
    'Interest Savings Calculator',
    'Smart Repayment Strategies',
    'Visual Charts and Graphs',
  ],
};

// Next.js requires a default export for layout — must not be a named arrow export
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
