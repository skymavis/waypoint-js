import { babel } from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import { defineConfig } from "rollup"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import nodePolyfills from "rollup-plugin-polyfill-node"

const mainConfig = defineConfig({
  input: ["src/index.ts"],
  output: [
    {
      dir: "dist",
      format: "esm",
    },
  ],
  plugins: [
    peerDepsExternal(),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    nodePolyfills(),
    typescript({
      declaration: true,
      declarationDir: "./dist/types",
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
  ],
})

export default mainConfig
