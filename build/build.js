import banner from './banner.js'
import babel from '@rollup/plugin-babel'

export default {
  output: {
    name: 'Glide',
    banner
  },
  plugins: [
    babel({
      babelHelpers: 'bundled'
    })
  ]
}
