import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['scripts/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['scripts/**/*.ts'],
      exclude: ['scripts/**/*.test.ts', 'scripts/_meta/**', 'dist/**']
    }
  }
});
