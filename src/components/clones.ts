import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

/**
 * Elements that can receive keyboard focus.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])'
].join(', ')

/**
 * Hides a clone from assistive technology and takes its focusable content
 * out of the tab order, so its content is not announced or reached twice.
 * Clones stay clickable, as they can be visible at the edges of the track.
 */
function hide (clone: HTMLElement): void {
  clone.setAttribute('aria-hidden', 'true')

  if (clone.matches(FOCUSABLE_SELECTOR)) {
    clone.setAttribute('tabindex', '-1')
  }

  const focusables = clone.querySelectorAll(FOCUSABLE_SELECTOR)

  for (let i = 0; i < focusables.length; i++) {
    focusables[i].setAttribute('tabindex', '-1')
  }
}

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  const Clones = {
    /**
     * Cloned slides, prepended and appended around the originals.
     */
    items: [] as HTMLElement[],

    /**
     * Create pattern map and collect slides to be cloned.
     */
    mount (): void {
      this.items = []

      if (Glide.isType('carousel')) {
        this.items = this.collect()
      }
    },

    /**
     * Collect clones with pattern.
     */
    collect (items: HTMLElement[] = []): HTMLElement[] {
      const { slides } = Components.Html
      const { perView, classes, cloningRatio } = Glide.settings

      if (slides.length > 0) {
        const peekIncrementer = +!!Glide.settings.peek
        const cloneCount = perView + peekIncrementer + Math.round(perView / 2)
        const append = slides.slice(0, cloneCount).reverse()
        const prepend = slides.slice(cloneCount * -1)

        for (let r = 0; r < Math.max(cloningRatio, Math.floor(perView / slides.length)); r++) {
          for (let i = 0; i < append.length; i++) {
            const clone = append[i].cloneNode(true) as HTMLElement

            clone.classList.add(classes.slide.clone)
            hide(clone)

            items.push(clone)
          }

          for (let i = 0; i < prepend.length; i++) {
            const clone = prepend[i].cloneNode(true) as HTMLElement

            clone.classList.add(classes.slide.clone)
            hide(clone)

            items.unshift(clone)
          }
        }
      }

      return items
    },

    /**
     * Append cloned slides with generated pattern.
     */
    append (): void {
      const { items } = this
      const { wrapper, slides } = Components.Html

      const half = Math.floor(items.length / 2)
      const prepend = items.slice(0, half).reverse()
      const append = items.slice(half * -1).reverse()
      const width = `${Components.Sizes.slideWidth}px`

      for (let i = 0; i < append.length; i++) {
        wrapper.appendChild(append[i])
      }

      for (let i = 0; i < prepend.length; i++) {
        wrapper.insertBefore(prepend[i], slides[0])
      }

      for (let i = 0; i < items.length; i++) {
        items[i].style.width = width
      }
    },

    /**
     * Remove all cloned slides.
     */
    remove (): void {
      const { items } = this

      for (let i = 0; i < items.length; i++) {
        Components.Html.wrapper.removeChild(items[i])
      }
    },

    /**
     * Gets additional dimensions value caused by clones.
     */
    get grow (): number {
      return (Components.Sizes.slideWidth + Components.Gaps.value) * Clones.items.length
    }
  }

  /**
   * Append additional slide's clones:
   * - while glide's type is `carousel`
   */
  Events.on('update', () => {
    Clones.remove()
    Clones.mount()
    Clones.append()
  })

  /**
   * Append additional slide's clones:
   * - while glide's type is `carousel`
   */
  Events.on('build.before', () => {
    if (Glide.isType('carousel')) {
      Clones.append()
    }
  })

  /**
   * Remove clones HTMLElements:
   * - on destroying, to bring HTML to its initial state
   */
  Events.on('destroy', () => {
    Clones.remove()
  })

  return Clones
}
