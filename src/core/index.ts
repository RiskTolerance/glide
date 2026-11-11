import { warn } from '../utils/log'
import { isFunction } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from './event/events-bus'
import type { Components, Extensions } from '../types'

/**
 * Creates and initializes specified collection of extensions.
 * Each extension receives access to instance of glide and rest of components.
 */
export function mount (glide: Glide, extensions: Extensions, events: EventsBus): Components {
  const components = {} as Components

  for (const name in extensions) {
    if (isFunction(extensions[name])) {
      components[name] = extensions[name](glide, components, events)
    } else {
      warn('Extension must be a function')
    }
  }

  for (const name in components) {
    const component = components[name] as { mount?: unknown }

    if (isFunction(component.mount)) {
      component.mount()
    }
  }

  return components
}
