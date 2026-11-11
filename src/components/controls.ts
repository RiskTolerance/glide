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
     * Sets active class to current slide.
     */
    setActive (): void {
      for (let i = 0; i < navs.length; i++) {
        this.addClass(navs[i].children)
      }
    },

    /**
     * Removes active class to current slide.
     */
    removeActive (): void {
      for (let i = 0; i < navs.length; i++) {
        this.removeClass(navs[i].children)
      }
    },

    /**
     * Toggles active class on items inside navigation.
     */
    addClass (controls: HTMLCollection): void {
      const settings = Glide.settings
      const item = controls[Glide.index]

      if (!item) {
        return
      }

      item.classList.add(settings.classes.nav.active)
      item.setAttribute('aria-current', 'true')

      siblings(item).forEach(sibling => {
        sibling.classList.remove(settings.classes.nav.active)
        sibling.removeAttribute('aria-current')
      })
    },

    /**
     * Removes active class from active control.
     */
    removeClass (controls: HTMLCollection): void {
      const item = controls[Glide.index]

      item?.classList.remove(Glide.settings.classes.nav.active)
      item?.removeAttribute('aria-current')
    },

    /**
     * Calculates, removes or adds `Glide.settings.classes.disabledArrow` class on the control arrows
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
     * Removes `Glide.settings.classes.disabledArrow` from given NodeList elements
     */
    resetArrowState (...lists: NodeListOf<HTMLElement>[]): void {
      const settings = Glide.settings

      lists.forEach(function (list) {
        list.forEach(function (element) {
          element.classList.remove(settings.classes.arrow.disabled)
          element.removeAttribute('aria-disabled')
        })
      })
    },

    /**
     * Adds `Glide.settings.classes.disabledArrow` to given NodeList elements
     */
    disableArrow (...lists: NodeListOf<HTMLElement>[]): void {
      const settings = Glide.settings

      lists.forEach(function (list) {
        list.forEach(function (element) {
          element.classList.add(settings.classes.arrow.disabled)
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
   * Swap active class of current navigation item:
   * - after mounting to set it to initial index
   * - after each move to the new index
   */
  Events.on(['mount.after', 'move.after'], () => {
    Controls.setActive()
  })

  /**
   * Add or remove disabled class of arrow elements
   */
  Events.on(['mount.after', 'run'], () => {
    Controls.setArrowState()
  })

  /**
   * Remove bindings and HTML Classes:
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
