import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['**/*.d.ts', '**/node_modules/**', 'src/db/schema.ts', '**/test/**'],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
    },
    isolate: true,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@repo/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
