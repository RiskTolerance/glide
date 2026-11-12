import type { GlideOptions, GlideSettings } from '../types'

/**
 * Merges passed settings object with default options.
 * `breakpoints` is the only nested object, so it is merged one level deep.
 */
export function mergeOptions (defaults: GlideSettings, settings: GlideOptions): GlideSettings {
  const options: GlideSettings = Object.assign({}, defaults, settings)

  if (Object.hasOwn(settings, 'breakpoints')) {
    options.breakpoints = Object.assign({}, defaults.breakpoints, settings.breakpoints)
  }

  return options
}
