/* eslint-disable unicorn/prefer-module */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint", "import", "security", "unicorn"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:security/recommended",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  settings: {
    propWrapperFunctions: [{ property: "freeze", object: "Object" }],
    // Copied from 'eslint-import-resolver-typescript' README:
    "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
    "import/resolver": { typescript: { alwaysTryTypes: true }, node: true },
  },
  reportUnusedDisableDirectives: true,
  rules: {
    "unicorn/filename-case": "off",
  },
  overrides: [
    {
      files: ["*.config.js"],
      rules: {
        "unicorn/prefer-module": "off",
      },
    },
  ],
};
