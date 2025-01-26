/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{js,cjs,mjs,jsx,ts,tsx,vue}": ["eslint --fix"],
  "*.{html,json,md,css,scss}": ["prettier --ignore-unknown --write"],
};
