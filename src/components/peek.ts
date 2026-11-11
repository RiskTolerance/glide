import { toInt, isObject } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components, GlidePeek } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  let value: number | { before: number, after: number }

  const Peek = {
    /**
     * Setups how much to peek based on settings.
     */
    mount (): void {
      this.value = Glide.settings.peek
    },

    /**
     * Gets value of the peek.
     */
    get value (): number | { before: number, after: number } {
      return value
    },

    /**
     * Sets value of the peek.
     */
    set value (v: GlidePeek) {
      if (isObject(v)) {
        v.before = toInt(v.before)
        v.after = toInt(v.after)

        value = v as { before: number, after: number }
      } else {
        value = toInt(v)
      }
    },

    /**
     * Gets reduction value caused by peek.
     */
    get reductor (): number {
      const value = Peek.value
      const perView = Glide.settings.perView

      if (isObject(value)) {
        return (value.before / perView) + (value.after / perView)
      }

      return value * 2 / perView
    }
  }

  /**
   * Recalculate peeking sizes on:
   * - when resizing window to update to proper percents
   */
  Events.on(['resize', 'update'], () => {
    Peek.mount()
  })

  return Peek
}
