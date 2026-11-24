// @ts-check
// Harness ESLint config for Angular (flat config, angular-eslint + typescript-eslint + prettier).
// Merge into an existing config rather than replacing it; keep project rules that do not contradict AGENTS.md.
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslint from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';

// The framework-free folder (same as conventions.pureDirs in .harness.json): plain TypeScript, no Angular.
const PURE_GLOBS = ['src/app/core/**/*.ts'];

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.angular/**',
      // where CI checks the harness template out
      '.harness/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...angularEslint.configs.tsRecommended,
  {
    files: ['**/*.ts'],
    rules: {
      // OnPush and standalone are the defaults in Angular v22: do not require them explicitly (AGENTS.md).
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  ...(PURE_GLOBS.length
    ? [
        {
          // The framework-free layer stays plain TypeScript, so it is testable without Angular.
          files: PURE_GLOBS,
          rules: {
            'no-restricted-imports': [
              'error',
              {
                patterns: [
                  { group: ['@angular/*'], message: 'This layer must stay framework-free.' },
                ],
              },
            ],
          },
        },
      ]
    : []),
  {
    files: ['**/*.html'],
    extends: [
      ...angularEslint.configs.templateRecommended,
      ...angularEslint.configs.templateAccessibility,
    ],
    rules: {},
  },
  prettierConfig,
);
