import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['.'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Remove experimental turbo config as it's deprecated
};

export default withNextIntl(nextConfig);