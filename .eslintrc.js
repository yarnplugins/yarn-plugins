/**
 * ESLint configuration
 *
 * @see https://eslint.org/docs/user-guide/configuring
 * @copyright 2020-present YarnPlugins.com
 *
 * @type {import("eslint").Linter.Config}
 */

module.exports = {
  root: true,

  env: {
    es6: true,
    node: true,
  },

  parserOptions: {
    ecmaVersion: 2020,
  },

  extends: ["eslint:recommended", "prettier"],

  overrides: [
    {
      files: "*.ts",

      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        warnOnUnsupportedTypeScriptVersion: true,
      },

      extends: [
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
      ],

      plugins: ["@typescript-eslint"],
    },

    {
      files: "*.test.ts",

      env: {
        jest: true,
      },
    },
  ],

  ignorePatterns: [
    "/.git",
    "/**/__snapshots__",
    "/*/bundles",
    "/*/node_modules",
    "/coverage",
  ],
};
