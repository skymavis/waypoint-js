/** @type {import('eslint').Linter.BaseConfig} **/
const eslintConfigTs = require('@sky-mavis/eslint-config-ts')

module.exports = {
  ...eslintConfigTs,

  extends: [
    ...eslintConfigTs.extends,
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],

  rules: {
    ...eslintConfigTs.rules,
    "react/prop-types": "off",
    "react/require-default-props": "off",
    "react/jsx-key": "warn",
    "react/no-direct-mutation-state": "warn",
    "react/react-in-jsx-scope": "off",
  },

  settings: {
    react: {
      version: "detect",
    },
  },
}
