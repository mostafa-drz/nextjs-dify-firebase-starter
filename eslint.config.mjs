import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.config({
    extends: ['prettier'],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'warn',
    },
  }),
  {
    rules: {
      // Minimal React/Next.js adjustments
      'react/no-unescaped-entities': 'off',

      // Basic TypeScript rules - only the essentials
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',

      // Simple console rules
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
