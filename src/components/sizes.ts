import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Width of the track. Reading `offsetWidth` forces the browser to
   * compute layout, so it is measured once per layout pass and reused
   * by every move until the window resizes or settings change.
   */
  let trackWidth: number | undefined

  const Sizes = {
    /**
     * Setups dimensions of slides.
     */
    setupSlides (): void {
      const width = `${this.slideWidth}px`
      const slides = Components.Html.slides

      for (let i = 0; i < slides.length; i++) {
        slides[i].style.width = width
      }
    },

    /**
     * Setups dimensions of slides wrapper.
     */
    setupWrapper (): void {
      Components.Html.wrapper.style.width = `${this.wrapperSize}px`
    },

    /**
     * Removes applied styles from HTML elements.
     */
    remove (): void {
      const slides = Components.Html.slides

      for (let i = 0; i < slides.length; i++) {
        slides[i].style.width = ''
      }

      Components.Html.wrapper.style.width = ''
    },

    /**
     * Gets count number of the slides.
     */
    get length (): number {
      return Components.Html.slides.length
    },

    /**
     * Gets width value of the slider (visible area).
     */
    get width (): number {
      if (trackWidth === undefined) {
        trackWidth = Components.Html.track.offsetWidth
      }

      return trackWidth
    },

    /**
     * Gets size of the slides wrapper.
     */
    get wrapperSize (): number {
      return Sizes.slideWidth * Sizes.length + Components.Gaps.grow + Components.Clones.grow
    },

    /**
     * Gets width value of a single slide.
     */
    get slideWidth (): number {
      return (Sizes.width / Glide.settings.perView) - Components.Peek.reductor - Components.Gaps.reductor
    }
  }

  /**
   * Measure the track again on the next read:
   * - when resizing window, as the track may have changed size
   * - on updating via API, as new options may change the layout
   */
  Events.on(['resize', 'update'], () => {
    trackWidth = undefined
  })

  /**
   * Apply calculated glide's dimensions:
   * - before building, so other dimensions (e.g. translate) will be calculated propertly.
   *   Building also runs when resizing window and on updating via API.
   */
  Events.on('build.before', () => {
    Sizes.setupSlides()
    Sizes.setupWrapper()
  })

  /**
   * Remove calculated glide's dimensions:
   * - on destoting to bring markup to its inital state
   */
  Events.on('destroy', () => {
    Sizes.remove()
  })

  return Sizes
}
