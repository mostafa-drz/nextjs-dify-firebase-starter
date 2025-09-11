/** @type {import('prettier').Config} */
module.exports = {
  // Standard formatting - minimal configuration
  printWidth: 100,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',

  // Tailwind CSS plugin for class sorting
  plugins: ['prettier-plugin-tailwindcss'],
};
