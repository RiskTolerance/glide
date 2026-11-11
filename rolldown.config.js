import { readFileSync } from 'node:fs'
import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const banner = `/*!
 * Glide.js v${pkg.version}
 * (c) 2013-${new Date().getFullYear()} ${pkg.author}
 * Released under the MIT License.
 */`

/**
 * Baseline Widely Available, the same browser targets Vite 8 uses by default.
 * Keep in sync with `browserslist` in package.json, which Lightning CSS reads.
 */
const transform = { target: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'] }

/**
 * ES module build of one entry, with its bundled type declarations
 * emitted alongside (e.g. `glide.esm.js` + `glide.esm.d.ts`).
 */
const esm = (name, input) => ({
  input: { [name]: input },
  transform,
  plugins: [dts()],
  output: { dir: 'dist', format: 'es', entryFileNames: '[name].js', banner }
})

export default defineConfig([
  esm('glide.esm', 'entry/entry-complete.ts'),
  esm('glide.modular.esm', 'entry/entry-modular.ts'),
  {
    input: 'entry/entry-complete.ts',
    transform,
    output: [
      { file: 'dist/glide.js', format: 'umd', name: 'Glide', banner },
      { file: 'dist/glide.min.js', format: 'umd', name: 'Glide', banner, minify: true }
    ]
  }
])
