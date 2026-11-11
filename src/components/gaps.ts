import { toInt } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  const Gaps = {
    /**
     * Applies the gap between slides, including clones. The slides wrapper is
     * a flex container (see glide.core.css), so one CSS `gap` spaces them all
     * and leaves no space before the first slide or after the last one.
     */
    apply (): void {
      Components.Html.wrapper.style.gap = `${this.value}px`
    },

    /**
     * Removes the gap from the slides wrapper.
     */
    remove (): void {
      Components.Html.wrapper.style.gap = ''
    },

    /**
     * Gets value of the gap.
     */
    get value (): number {
      return toInt(Glide.settings.gap)
    },

    /**
     * Gets additional dimensions value caused by gaps.
     * Used to increase width of the slides wrapper.
     */
    get grow (): number {
      return Gaps.value * (Components.Sizes.length)
    },

    /**
     * Gets reduction value caused by gaps.
     * Used to subtract width of the slides.
     */
    get reductor (): number {
      const perView = Glide.settings.perView

      return (Gaps.value * (perView - 1)) / perView
    }
  }

  /**
   * Apply the gap:
   * - after building, so the slides wrapper is laid out with it
   * - on updating via API, to follow a changed `gap` option
   */
  Events.on(['build.after', 'update'], () => {
    Gaps.apply()
  })

  /**
   * Remove the gap:
   * - on destroying to bring markup to its inital state
   */
  Events.on('destroy', () => {
    Gaps.remove()
  })

  return Gaps
}
