import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true, // This is needed by @testing-library to be cleaned up after each test
    include: [
      'src/**/*.test.{js,jsx,ts,tsx}',
      'apps/**/*.test.{js,jsx,ts,tsx}',
      'packages/**/*.test.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      '**/*.e2e.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*'],
      exclude: [
        'src/**/*.stories.{js,jsx,ts,tsx}',
        '**/*.d.ts',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/index.{js,jsx,ts,tsx}',
        'src/**/*.config.{js,jsx,ts,tsx}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['src/hooks/**/*.test.ts', 'jsdom'],
      ['src/components/**/*.test.{ts,tsx}', 'jsdom'],
      ['apps/web/**/*.test.{ts,tsx}', 'jsdom'],
      ['apps/api-gateway/**/*.test.ts', 'node'],
      ['packages/**/*.test.ts', 'node']
    ],
    setupFiles: ['./vitest-setup.ts'],
    env: loadEnv('', process.cwd(), ''),
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    silent: false,
    reporters: process.env.CI ? ['verbose', 'github-actions'] : ['verbose']
  },
});
