import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/__tests__/**',
      ],
    },
    includeSource: ['src/**/*.{js,ts}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@terrashaper/db': path.resolve(__dirname, '../../packages/db'),
      '@terrashaper/shared': path.resolve(__dirname, '../../packages/shared'),
      '@terrashaper/queue': path.resolve(__dirname, '../../packages/queue'),
      '@terrashaper/stripe': path.resolve(__dirname, '../../packages/stripe'),
      '@terrashaper/storage': path.resolve(__dirname, '../../packages/storage'),
      '@terrashaper/services': path.resolve(__dirname, '../../packages/services'),
    },
  },
});