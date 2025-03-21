import path from "node:path"
import { fileURLToPath } from "node:url"

import { babel } from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import { globSync } from "glob"
import { defineConfig } from "rollup"
import generatePackageJson from "rollup-plugin-generate-package-json"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import nodePolyfills from "rollup-plugin-polyfill-node"
import typescript from "rollup-plugin-typescript2"

// This configuration the same as preserveModules but without node_modules folder
// To solve module conflict on Nextjs/Remix
// Ref: https://rollupjs.org/configuration-options/#input
const input = Object.fromEntries(
  globSync("**/*.ts", {
    ignore: ["**/__tests__/**", "**/*.test.ts", "vitest.config.ts", "**/global.d.ts"],
  }).map(file => [
    path.relative("", file.slice(0, file.length - path.extname(file).length)),
    fileURLToPath(new URL(file, import.meta.url)),
  ]),
)
const commonjsOutDir = "dist/commonjs"
const moduleOutDir = "dist/module"

const mainConfig = defineConfig({
  input,
  output: [
    {
      dir: commonjsOutDir,
      format: "commonjs",
    },
    {
      dir: moduleOutDir,
      format: "module",
    },
  ],
  external: ["viem"],
  plugins: [
    peerDepsExternal(),
    nodeResolve({
      preferBuiltins: true,
      browser: true,
    }),
    commonjs(),
    nodePolyfills(),
    typescript({
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
    babel({
      extensions: [".js", ".jsx", ".es6", ".es", ".mjs", "ts", "tsx"],
      exclude: "node_modules/**",
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            loose: true,
            targets: "last 3 versions, IE 11, not dead",
          },
        ],
      ],
      babelHelpers: "bundled",
    }),
    generatePackageJson({
      outputFolder: commonjsOutDir,
      baseContents: () => ({
        type: "commonjs",
        sideEffects: false,
      }),
    }),
    generatePackageJson({
      outputFolder: moduleOutDir,
      baseContents: () => ({
        type: "module",
        sideEffects: false,
      }),
    }),
  ],
})

export default mainConfig
