import data from '../package.json' with { type: 'json' }

export default `/*!
 * Glide.js v${data.version}
 * (c) 2013-${new Date().getFullYear()} ${data.author}
 * Released under the MIT License.
 */
`
