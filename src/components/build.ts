import { siblings } from '../utils/dom'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  const Build = {
    /**
     * Init glide building. Marks elements, sets
     * dimensions and setups initial state.
     */
    mount (): void {
      Events.emit('build.before')

      this.markType()
      this.markActive()

      Events.emit('build.after')
    },

    /**
     * Marks the root element with the slider type (`data-type`).
     */
    markType (): void {
      Components.Html.root.setAttribute('data-type', Glide.settings.type)
    },

    /**
     * Marks the current slide as active (`data-active`).
     */
    markActive (): void {
      const slide = Components.Html.slides[Glide.index]

      if (slide) {
        slide.setAttribute('data-active', '')

        siblings(slide).forEach((sibling) => {
          sibling.removeAttribute('data-active')
        })
      }
    },

    /**
     * Removes the attributes applied at building.
     */
    unmark (): void {
      Components.Html.root.removeAttribute('data-type')

      Components.Html.slides.forEach((slide) => {
        slide.removeAttribute('data-active')
      })
    }
  }

  /**
   * Clear building attributes:
   * - on destroying to bring HTML to its initial state
   * - on updating to remove them before remounting component
   */
  Events.on(['destroy', 'update'], () => {
    Build.unmark()
  })

  /**
   * Remount component:
   * - on resizing of the window to calculate new dimensions
   * - on updating settings via API
   */
  Events.on(['resize', 'update'], () => {
    Build.mount()
  })

  /**
   * Mark the new active slide:
   * - after each move to the new index
   */
  Events.on('move.after', () => {
    Build.markActive()
  })

  return Build
}
