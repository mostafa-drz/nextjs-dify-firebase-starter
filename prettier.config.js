/** @type {import('prettier').Config} */
module.exports = {
  // Core formatting rules
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  printWidth: 100,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,

  // Plugin configurations
  plugins: ['prettier-plugin-tailwindcss'],

  // File-specific overrides
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 80,
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
      },
    },
  ],
};
