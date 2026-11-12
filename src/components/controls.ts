import { siblings } from '../utils/dom'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

import EventsBinder from '../core/event/events-binder'

const NAV_SELECTOR = '[data-glide-el="controls[nav]"]'
const CONTROLS_SELECTOR = '[data-glide-el^="controls"]'
const PREVIOUS_CONTROLS_SELECTOR = `${CONTROLS_SELECTOR} [data-glide-dir*="<"]`
const NEXT_CONTROLS_SELECTOR = `${CONTROLS_SELECTOR} [data-glide-dir*=">"]`

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Instance of the binder for DOM Events.
   */
  const Binder = new EventsBinder()

  /**
   * Collection of navigation HTML elements.
   */
  let navs: NodeListOf<HTMLElement>

  /**
   * Collection of controls HTML elements.
   */
  let controls: NodeListOf<HTMLElement>

  /**
   * Collection of arrow control HTML elements.
   */
  let arrowControls: { previous: NodeListOf<HTMLElement>, next: NodeListOf<HTMLElement> }

  const Controls = {
    /**
     * Inits arrows. Binds events listeners
     * to the arrows HTML elements.
     */
    mount (): void {
      navs = Components.Html.root.querySelectorAll(NAV_SELECTOR)
      controls = Components.Html.root.querySelectorAll(CONTROLS_SELECTOR)
      arrowControls = {
        previous: Components.Html.root.querySelectorAll(PREVIOUS_CONTROLS_SELECTOR),
        next: Components.Html.root.querySelectorAll(NEXT_CONTROLS_SELECTOR)
      }

      this.addBindings()
    },

    /**
     * Marks the navigation items of the current slide.
     */
    setActive (): void {
      for (let i = 0; i < navs.length; i++) {
        this.setCurrent(navs[i].children)
      }
    },

    /**
     * Unmarks the navigation items of the current slide.
     */
    removeActive (): void {
      for (let i = 0; i < navs.length; i++) {
        this.clearCurrent(navs[i].children)
      }
    },

    /**
     * Marks the navigation item of the current slide with `aria-current`.
     */
    setCurrent (controls: HTMLCollection): void {
      const item = controls[Glide.index]

      if (!item) {
        return
      }

      item.setAttribute('aria-current', 'true')

      siblings(item).forEach(sibling => {
        sibling.removeAttribute('aria-current')
      })
    },

    /**
     * Removes `aria-current` from the navigation item of the current slide.
     */
    clearCurrent (controls: HTMLCollection): void {
      controls[Glide.index]?.removeAttribute('aria-current')
    },

    /**
     * Marks the arrows that cannot move further with `aria-disabled`
     */
    setArrowState (): void {
      if (Glide.settings.rewind) {
        return
      }

      const next = arrowControls.next
      const previous = arrowControls.previous

      this.resetArrowState(next, previous)

      if (Glide.index === 0) {
        this.disableArrow(previous)
      }

      if (Glide.index === Components.Run.length) {
        this.disableArrow(next)
      }
    },

    /**
     * Removes `aria-disabled` from given NodeList elements
     */
    resetArrowState (...lists: NodeListOf<HTMLElement>[]): void {
      lists.forEach(function (list) {
        list.forEach(function (element) {
          element.removeAttribute('aria-disabled')
        })
      })
    },

    /**
     * Adds `aria-disabled` to given NodeList elements
     */
    disableArrow (...lists: NodeListOf<HTMLElement>[]): void {
      lists.forEach(function (list) {
        list.forEach(function (element) {
          element.setAttribute('aria-disabled', 'true')
        })
      })
    },

    /**
     * Adds handles to the each group of controls.
     */
    addBindings (): void {
      for (let i = 0; i < controls.length; i++) {
        this.bind(controls[i].children)
      }
    },

    /**
     * Removes handles from the each group of controls.
     */
    removeBindings (): void {
      for (let i = 0; i < controls.length; i++) {
        this.unbind(controls[i].children)
      }
    },

    /**
     * Binds events to arrows HTML elements.
     */
    bind (elements: HTMLCollection): void {
      for (let i = 0; i < elements.length; i++) {
        Binder.on('click', elements[i], this.click)
      }
    },

    /**
     * Unbinds events binded to the arrows HTML elements.
     */
    unbind (elements: HTMLCollection): void {
      for (let i = 0; i < elements.length; i++) {
        Binder.off('click', elements[i])
      }
    },

    /**
     * Handles `click` event on the arrows HTML elements.
     * Moves slider in direction given via the
     * `data-glide-dir` attribute.
     */
    click (event: Event): void {
      const direction = (event.currentTarget as Element).getAttribute('data-glide-dir') as string

      Components.Run.make(Components.Direction.resolve(direction))
    },

    /**
     * Gets collection of the controls HTML elements.
     */
    get items (): NodeListOf<HTMLElement> {
      return controls
    }
  }

  /**
   * Mark the current navigation item:
   * - after mounting to set it to initial index
   * - after each move to the new index
   */
  Events.on(['mount.after', 'move.after'], () => {
    Controls.setActive()
  })

  /**
   * Mark arrows that cannot move further as disabled
   */
  Events.on(['mount.after', 'run'], () => {
    Controls.setArrowState()
  })

  /**
   * Remove bindings and attributes:
   * - on destroying, to bring markup to its initial state
   */
  Events.on('destroy', () => {
    Controls.removeBindings()
    Controls.removeActive()
    Controls.resetArrowState(arrowControls.next, arrowControls.previous)
    Binder.destroy()
  })

  return Controls
}
