import { toInt, isUndefined } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  let offsetValue = 0

  const Move = {
    /**
     * Constructs move component.
     */
    mount (): void {
      offsetValue = 0
    },

    /**
     * Calculates a movement value based on passed offset and currently active index.
     */
    make (offset: number | string = 0): void {
      this.offset = offset

      Events.emit('move', {
        movement: this.value
      })

      Components.Transition.after(() => {
        Events.emit('move.after', {
          movement: this.value
        })
      })
    },

    /**
     * Gets an offset value used to modify current translate.
     */
    get offset (): number {
      return offsetValue
    },

    /**
     * Sets an offset value used to modify current translate.
     */
    set offset (value: number | string | undefined) {
      offsetValue = !isUndefined(value) ? toInt(value) : 0
    },

    /**
     * Gets a raw movement value.
     */
    get translate (): number {
      return Components.Sizes.slideWidth * Glide.index
    },

    /**
     * Gets an actual movement value corrected by offset.
     */
    get value (): number {
      const offset = this.offset
      const translate = this.translate

      if (Components.Direction.is('rtl')) {
        return translate + offset
      }

      return translate - offset
    }
  }

  /**
   * Make movement to proper slide on:
   * - before build, so glide will start at `startAt` index
   * - on each standard run to move to newly calculated index
   */
  Events.on(['build.before', 'run'], () => {
    Move.make()
  })

  return Move
}
