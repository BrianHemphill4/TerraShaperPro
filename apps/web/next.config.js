const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@terrashaper/db', '@terrashaper/queue', '@terrashaper/ai-service'],
  
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  },
  
  images: {
    domains: [
      'localhost',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/trpc/:path*`
          : 'http://localhost:3001/trpc/:path*',
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Suppresses source map uploading logs during build
  silent: true,
  
  // Upload source maps in production
  hideSourceMaps: true,
  
  // Tree shake Sentry code in production
  disableLogger: true,
  
  // Automatically release
  automaticVercelMonitors: true,
};

// Export config with Sentry
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);