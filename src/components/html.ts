import { warn } from '../utils/log'
import { isString } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

const TRACK_SELECTOR = '[data-glide-el="track"]'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  let root: HTMLElement
  let track: HTMLElement

  const Html = {
    /**
     * Slides of the glide, without clones.
     */
    slides: [] as HTMLElement[],

    /**
     * Setup slider HTML nodes.
     */
    mount (): void {
      this.root = Glide.selector
      this.track = this.root.querySelector<HTMLElement>(TRACK_SELECTOR)
      this.collectSlides()
    },

    /**
     * Collect slides
     */
    collectSlides (): void {
      this.slides = Array.from(this.wrapper.children as HTMLCollectionOf<HTMLElement>).filter((slide) => {
        return !slide.classList.contains(Glide.settings.classes.slide.clone)
      })
    },

    /**
     * Gets node of the glide main element.
     */
    get root (): HTMLElement {
      return root
    },

    /**
     * Sets node of the glide main element.
     */
    set root (r: string | HTMLElement | null) {
      if (isString(r)) {
        r = document.querySelector<HTMLElement>(r)
      }

      if (r !== null) {
        root = r
      } else {
        warn('Root element must be a existing Html node')
      }
    },

    /**
     * Gets node of the glide track with slides.
     */
    get track (): HTMLElement {
      return track
    },

    /**
     * Sets node of the glide track with slides.
     */
    set track (t: HTMLElement | null) {
      track = t as HTMLElement
    },

    /**
     * Gets node of the slides wrapper.
     */
    get wrapper (): HTMLElement {
      return Html.track.children[0] as HTMLElement
    }
  }

  /**
   * Add/remove/reorder dynamic slides
   */
  Events.on('update', () => {
    Html.collectSlides()
  })

  return Html
}
