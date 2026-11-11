import type { GlideClasses, GlideOptions, GlideSettings } from '../types'

/**
 * Sorts aphabetically object keys.
 */
export function sortKeys<T extends object> (obj: T): T {
  return Object.keys(obj).sort().reduce<Record<string, unknown>>((r, k) => {
    r[k] = (obj as Record<string, unknown>)[k]

    return r
  }, {}) as T
}

/**
 * Merges passed settings object with default options.
 */
export function mergeOptions (defaults: GlideSettings, settings: GlideOptions): GlideSettings {
  const options: GlideSettings = Object.assign({}, defaults, settings) as GlideSettings

  // `Object.assign` do not deeply merge objects, so we
  // have to do it manually for every nested object
  // in options. Although it does not look smart,
  // it's smaller and faster than some fancy
  // merging deep-merge algorithm script.
  if (Object.hasOwn(settings, 'classes')) {
    const classes = settings.classes as NonNullable<GlideOptions['classes']>

    options.classes = Object.assign({}, defaults.classes, classes) as GlideClasses

    const properties = ['direction', 'type', 'slide', 'arrow', 'nav'] as const
    properties.forEach(property => {
      if (Object.hasOwn(classes, property)) {
        (options.classes as unknown as Record<string, object>)[property] = { ...defaults.classes[property], ...classes[property] }
      }
    })
  }

  if (Object.hasOwn(settings, 'breakpoints')) {
    options.breakpoints = Object.assign({}, defaults.breakpoints, settings.breakpoints)
  }

  return options
}
