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
 * Ids are removed so they stay unique in the document, and a clone of the
 * active slide does not keep its active state.
 */
function hide (clone: HTMLElement): void {
  clone.setAttribute('data-clone', '')
  clone.setAttribute('aria-hidden', 'true')
  clone.removeAttribute('data-active')
  clone.removeAttribute('id')

  const identified = clone.querySelectorAll('[id]')

  for (let i = 0; i < identified.length; i++) {
    identified[i].removeAttribute('id')
  }

  if (clone.matches(FOCUSABLE_SELECTOR)) {
    clone.setAttribute('tabindex', '-1')
  }

  const focusables = clone.querySelectorAll(FOCUSABLE_SELECTOR)

  for (let i = 0; i < focusables.length; i++) {
    focusables[i].setAttribute('tabindex', '-1')
  }
}

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Settings that decide which clones are needed, as of the last mount.
   */
  let pattern: string

  /**
   * Describes the settings that decide the number of clones.
   */
  function describePattern (): string {
    const { type, perView, peek, cloningRatio } = Glide.settings

    return [type, perView, !!peek, cloningRatio, Components.Html.slides.length].join('|')
  }

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
      pattern = describePattern()

      if (Glide.isType('carousel')) {
        this.items = this.collect()
      }
    },

    /**
     * Collect clones with pattern.
     */
    collect (items: HTMLElement[] = []): HTMLElement[] {
      const { slides } = Components.Html
      const { perView, cloningRatio } = Glide.settings

      if (slides.length > 0) {
        const peekIncrementer = +!!Glide.settings.peek
        const cloneCount = perView + peekIncrementer + Math.round(perView / 2)
        const append = slides.slice(0, cloneCount).reverse()
        const prepend = slides.slice(cloneCount * -1)

        for (let r = 0; r < Math.max(cloningRatio, Math.floor(perView / slides.length)); r++) {
          for (let i = 0; i < append.length; i++) {
            const clone = append[i].cloneNode(true) as HTMLElement

            hide(clone)

            items.push(clone)
          }

          for (let i = 0; i < prepend.length; i++) {
            const clone = prepend[i].cloneNode(true) as HTMLElement

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
   * Recreate slide's clones:
   * - on updating via API, as slides or options may have changed
   */
  Events.on('update', () => {
    Clones.remove()
    Clones.mount()
    Clones.append()
  })

  /**
   * Recreate slide's clones only when a different number is needed:
   * - on resizing, when a breakpoint changed `type`, `perView`, `peek` or `cloningRatio`.
   *   A change in width alone keeps the existing clones.
   */
  Events.on('resize', () => {
    if (describePattern() !== pattern) {
      Clones.remove()
      Clones.mount()
      Clones.append()
    }
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
