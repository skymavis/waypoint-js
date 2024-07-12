module.exports = {
  root: true,
  extends: ["@sky-mavis/next", "plugin:@next/next/recommended"],
  rules: {
    "@next/next/no-img-element": "off",
    "no-console": "off",
    "prettier/prettier": 1,
  },
  ignorePatterns: [".swc", ".next", "out", "node_modules", "contracts"],
}
