/**
 * Babel configuration
 *
 * @see https://babeljs.io/docs/en/options
 * @copyright 2020-present YarnPlugins.com
 *
 * @type {import("@babel/core").TransformOptions}
 */

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
      },
    ],
    "@babel/preset-typescript",
  ],

  plugins: [
    ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
  ],
};
