/** @type {import('eslint').Linter.BaseConfig} **/
module.exports = {
  root: true,

  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    ecmaFeatures: { jsx: true },
    sourceType: "module",
    warnOnUnsupportedTypeScriptVersion: true,
  },

  plugins: ["simple-import-sort", "import"],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: ["dist/", "node_modules/"],

  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "off",

    "no-console": [
      "warn",
      {
        allow: ["debug", "error"],
      },
    ],

    "sort-imports": "off",
    "import/order": "off",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    "prettier/prettier": [
      "error",
      {
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        semi: false,
        singleQuote: false,
        trailingComma: "all",
        arrowParens: "avoid",
        endOfLine: "lf",
      },
    ],
  },

  env: {
    browser: true,
    node: true,
  },
}
