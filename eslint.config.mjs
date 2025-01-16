// @ts-check

import gitignore from "eslint-config-flat-gitignore";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  ignores: [
    // Generated Slice Machine files
    "app/components/slices/*.ts",
  ],
  plugins: {
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "vue/html-self-closing": "off",
    curly: ["error", "all"],
  },
}).prepend([
  gitignore({
    files: [".gitignore"],
  }),
  eslintPluginPrettierRecommended,
]);
