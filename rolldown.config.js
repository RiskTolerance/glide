import { readFileSync } from 'node:fs'
import { defineConfig } from 'rolldown'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const banner = `/*!
 * Glide.js v${pkg.version}
 * (c) 2013-${new Date().getFullYear()} ${pkg.author}
 * Released under the MIT License.
 */`

const transform = { target: 'es2015' }

export default defineConfig([
  {
    input: 'entry/entry-complete.js',
    transform,
    output: [
      { file: 'dist/glide.esm.js', format: 'es', banner },
      { file: 'dist/glide.js', format: 'umd', name: 'Glide', banner },
      { file: 'dist/glide.min.js', format: 'umd', name: 'Glide', banner, minify: true }
    ]
  },
  {
    input: 'entry/entry-modular.js',
    transform,
    output: { file: 'dist/glide.modular.esm.js', format: 'es', banner }
  }
])
