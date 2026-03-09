import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Loan Analyser - EMI Calculator & Pre-Payment Planner',
  short_name: 'Loan Analyser',
  description:
    'Free online loan analysis tool. Calculate EMI, plan pre-payments, simulate what-if scenarios, and get smart strategies to save on interest.',
  start_url: '/',
  display: 'standalone',
  background_color: '#f8fafc',
  theme_color: '#2563eb',
  icons: [
    {
      src: '/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
    },
  ],
});

export default manifest;
