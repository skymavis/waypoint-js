import { babel } from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import fsExtra from "fs-extra"
import path, { dirname } from "path"
import { defineConfig } from "rollup"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import typescript from "rollup-plugin-typescript2"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function fixPackageJson() {
  return {
    name: "fix-package-json",
    async closeBundle() {
      try {
        fsExtra.outputJsonSync(path.join(__dirname, "dist/mjs", "package.json"), {
          type: "module",
          sideEffects: ["*.css"],
        })
        fsExtra.outputJsonSync(path.join(__dirname, "dist/cjs", "package.json"), {
          type: "commonjs",
          sideEffects: ["*.css"],
        })
      } catch (error) {
        console.error("[fixPackageJson]", error)
      }
    },
  }
}

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

    fixPackageJson(),
  ],
})

export default mainConfig
