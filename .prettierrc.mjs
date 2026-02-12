/** @type {import("prettier").Config} */
const config = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  printWidth: 100,
  singleQuote: true,
  arrowParens: 'always',
  importOrder: ['<THIRD_PARTY_MODULES>', '<TS_TYPES>^~/(.*)$', '^~/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
