import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: '/api/',
  },
  sitemap: 'https://loananalyzer.parthchovatiya.tech/sitemap.xml',
});

export default robots;
