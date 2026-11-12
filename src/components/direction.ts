import { warn } from '../utils/log'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components, GlideDirection } from '../types'

const VALID_DIRECTIONS = ['ltr', 'rtl']
const FLIPPED_ARROWS: Record<string, string> = {
  '>': '<',
  '<': '>'
}

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  let value: GlideDirection

  const Direction = {
    /**
     * Setups gap value based on settings.
     */
    mount (): void {
      this.value = Glide.settings.direction
    },

    /**
     * Resolves pattern based on direction value
     */
    resolve (pattern: string): string {
      if (this.is('rtl')) {
        return pattern.replace(/[<>]/g, (arrow) => FLIPPED_ARROWS[arrow])
      }

      return pattern
    },

    /**
     * Checks value of direction mode.
     */
    is (direction: GlideDirection): boolean {
      return this.value === direction
    },

    /**
     * Marks the root element with the direction (`data-direction`).
     */
    mark (): void {
      Components.Html.root.setAttribute('data-direction', this.value)
    },

    /**
     * Removes the direction from the root element.
     */
    unmark (): void {
      Components.Html.root.removeAttribute('data-direction')
    },

    /**
     * Gets value of the direction.
     */
    get value (): GlideDirection {
      return value
    },

    /**
     * Sets value of the direction.
     */
    set value (v: string) {
      if (VALID_DIRECTIONS.indexOf(v) > -1) {
        value = v as GlideDirection
      } else {
        warn('Direction value must be `ltr` or `rtl`')
      }
    }
  }

  /**
   * Clear direction attribute:
   * - on destroy to bring HTML to its initial state
   * - on update to remove it before reappling bellow
   */
  Events.on(['destroy', 'update'], () => {
    Direction.unmark()
  })

  /**
   * Remount component:
   * - on update to reflect changes in direction value
   */
  Events.on('update', () => {
    Direction.mount()
  })

  /**
   * Apply direction attribute:
   * - before building to apply it for the first time
   * - on updating to reapply a direction that may have changed
   */
  Events.on(['build.before', 'update'], () => {
    Direction.mark()
  })

  return Direction
}
