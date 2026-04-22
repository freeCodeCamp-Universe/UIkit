import eslintPluginAstro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: ['**/*.astro'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' }
      ]
    }
  },
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/dist-cdn',
      '**/.astro',
      '**/.next',
      '**/.turbo',
      '**/__coverage__',
      '**/pnpm-*.yaml',
      '**/pre-commit',
      '**/.prettierignore',
      '**/.wrangler/',
      '.scratchpad/',
      '.claude/'
    ]
  }
]);
