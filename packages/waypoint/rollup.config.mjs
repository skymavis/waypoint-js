import { babel } from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import { defineConfig } from "rollup"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import nodePolyfills from "rollup-plugin-polyfill-node"
import typescript from "rollup-plugin-typescript2"

const mainConfig = defineConfig({
  input: ["src/index.ts"],
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      dir: "dist/mjs",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
    },
  ],
  plugins: [
    // JS build
    peerDepsExternal(),
    nodeResolve({
      preferBuiltins: true,
    }),
    nodePolyfills(),
    commonjs(),
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
  ],
})

export default mainConfig
