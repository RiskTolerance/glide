import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

import EventsBinder from '../core/event/events-binder'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Instance of the binder for DOM Events.
   */
  const Binder = new EventsBinder()

  /**
   * Holds detaching status of anchors.
   * Prevents detaching of already detached anchors.
   */
  let detached = false

  /**
   * Holds preventing status of anchors.
   * If `true` redirection after click will be disabled.
   */
  let prevented = false

  /**
   * Holds collection of anchors elements.
   */
  let anchors: NodeListOf<HTMLAnchorElement>

  const Anchors = {
    /**
     * Setups a initial state of anchors component.
     */
    mount (): void {
      anchors = Components.Html.wrapper.querySelectorAll('a')

      this.bind()
    },

    /**
     * Binds events to anchors inside a track.
     */
    bind (): void {
      Binder.on('click', Components.Html.wrapper, this.click)
    },

    /**
     * Unbinds events attached to anchors inside a track.
     */
    unbind (): void {
      Binder.off('click', Components.Html.wrapper)
    },

    /**
     * Handler for click event. Prevents clicks when glide is in `prevent` status.
     */
    click (event: Event): void {
      if (prevented) {
        event.stopPropagation()
        event.preventDefault()
      }
    },

    /**
     * Detaches anchors click event inside glide.
     */
    detach () {
      prevented = true

      if (!detached) {
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].draggable = false
        }

        detached = true
      }

      return this
    },

    /**
     * Attaches anchors click events inside glide.
     */
    attach () {
      prevented = false

      if (detached) {
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].draggable = true
        }

        detached = false
      }

      return this
    },

    /**
     * Gets collection of the arrows HTML elements.
     */
    get items (): NodeListOf<HTMLAnchorElement> {
      return anchors
    }
  }

  /**
   * Detach anchors inside slides:
   * - on swiping, so they won't redirect to its `href` attributes
   */
  Events.on('swipe.move', () => {
    Anchors.detach()
  })

  /**
   * Attach anchors inside slides:
   * - after swiping and transitions ends, so they can redirect after click again
   */
  Events.on('swipe.end', () => {
    Components.Transition.after(() => {
      Anchors.attach()
    })
  })

  /**
   * Unbind anchors inside slides:
   * - on destroying, to bring anchors to its initial state
   */
  Events.on('destroy', () => {
    Anchors.attach()
    Anchors.unbind()
    Binder.destroy()
  })

  return Anchors
}
