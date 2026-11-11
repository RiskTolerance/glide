import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

import EventsBinder from '../core/event/events-binder'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Instance of the binder for DOM Events.
   */
  const Binder = new EventsBinder()

  const Images = {
    /**
     * Binds listener to glide wrapper.
     */
    mount (): void {
      this.bind()
    },

    /**
     * Binds `dragstart` event on wrapper to prevent dragging images.
     */
    bind (): void {
      Binder.on('dragstart', Components.Html.wrapper, this.dragstart)
    },

    /**
     * Unbinds `dragstart` event on wrapper.
     */
    unbind (): void {
      Binder.off('dragstart', Components.Html.wrapper)
    },

    /**
     * Event handler. Prevents dragging.
     */
    dragstart (event: Event): void {
      event.preventDefault()
    }
  }

  /**
   * Remove bindings from images:
   * - on destroying, to remove added EventListeners
   */
  Events.on('destroy', () => {
    Images.unbind()
    Binder.destroy()
  })

  return Images
}
