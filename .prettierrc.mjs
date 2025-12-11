/** @type {import("prettier").Config} */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  printWidth: 100,
  singleQuote: true,
  arrowParens: "always",
  importOrder: ["<THIRD_PARTY_MODULES>", "^~/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
