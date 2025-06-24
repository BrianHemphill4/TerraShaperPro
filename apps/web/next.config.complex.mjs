import { fileURLToPath } from 'node:url';

import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from 'jiti';
import withNextIntl from 'next-intl/plugin';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti('./src/libs/Env');

const withNextIntlConfig = withNextIntl('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
export default withSentryConfig(
  bundleAnalyzer(
    withNextIntlConfig({
      eslint: {
        dirs: ['.'],
      },
      poweredByHeader: false,
      reactStrictMode: true,
      experimental: {
        serverComponentsExternalPackages: ['@electric-sql/pglite'],
        optimizePackageImports: [
          '@radix-ui/react-icons',
          'lucide-react',
          '@tanstack/react-query',
          'date-fns',
        ],
        turbo: {
          rules: {
            '*.svg': {
              loaders: ['@svgr/webpack'],
              as: '*.js',
            },
          },
        },
      },
      compress: true,
      images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        domains: ['storage.googleapis.com', 'lh3.googleusercontent.com', 'images.unsplash.com'],
      },
      async headers() {
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
              {
                key: 'X-Frame-Options',
                value: 'DENY',
              },
              {
                key: 'X-XSS-Protection',
                value: '1; mode=block',
              },
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin',
              },
            ],
          },
          {
            source: '/api/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
              },
            ],
          },
          {
            source: '/_next/static/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
          {
            source: '/images/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
        ];
      },
      webpack: (config, { dev, isServer: _isServer }) => {
        if (!dev) {
          config.resolve.alias = {
            ...config.resolve.alias,
            'date-fns': 'date-fns/esm',
          };

          config.optimization.splitChunks = {
            ...config.optimization.splitChunks,
            chunks: 'all',
            cacheGroups: {
              ...config.optimization.splitChunks.cacheGroups,
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                enforce: true,
              },
              fabric: {
                test: /[\\/]node_modules[\\/]fabric[\\/]/,
                name: 'fabric',
                chunks: 'all',
                enforce: true,
              },
              ui: {
                test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                name: 'ui',
                chunks: 'all',
                enforce: true,
              },
              icons: {
                test: /[\\/]node_modules[\\/](lucide-react|@radix-ui\/react-icons)[\\/]/,
                name: 'icons',
                chunks: 'all',
                enforce: true,
              },
            },
          };

          config.optimization.usedExports = true;
          config.optimization.sideEffects = false;
        }

        config.module.rules.push({
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgo: true,
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        });

        return config;
      },
      output: 'standalone',
      compiler: {
        removeConsole:
          process.env.NODE_ENV === 'production'
            ? {
                exclude: ['error', 'warn'],
              }
            : false,
      },
      swcMinify: true,
      modularizeImports: {
        'lucide-react': {
          transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
          skipDefaultConversion: true,
        },
        '@radix-ui/react-icons': {
          transform: '@radix-ui/react-icons/dist/{{member}}.js',
          skipDefaultConversion: true,
        },
        'date-fns': {
          transform: 'date-fns/{{member}}',
          skipDefaultConversion: true,
        },
      },
    })
  ),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options
    org: process.env.SENTRY_ORG || 'terrashaperpro',
    project: process.env.SENTRY_PROJECT || 'terrashaperpro',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Disable Sentry telemetry
    telemetry: false,
  }
);
