import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Loan Analyser',
  description: 'Visualise your loan, add pre-payments, and see how much you save',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
