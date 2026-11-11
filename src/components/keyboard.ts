import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

import EventsBinder from '../core/event/events-binder'

/**
 * Fields where arrow keys move the caret or change the value,
 * so they must not also move the slider.
 */
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Instance of the binder for DOM Events.
   */
  const Binder = new EventsBinder()

  const Keyboard = {
    /**
     * Binds keyboard events on component mount.
     */
    mount (): void {
      if (Glide.settings.keyboard) {
        this.bind()
      }
    },

    /**
     * Adds keyboard press events.
     */
    bind (): void {
      Binder.on('keyup', document, this.press)
    },

    /**
     * Removes keyboard press events.
     */
    unbind (): void {
      Binder.off('keyup', document)
    },

    /**
     * Handles keyboard's arrows press and moving glide foward and backward.
     */
    press (event: KeyboardEvent): void {
      if ((event.target as Element | null)?.closest?.(EDITABLE_SELECTOR)) {
        return
      }

      const { perSwipe } = Glide.settings

      const arrowSymbols: Record<string, string> = { ArrowRight: '>', ArrowLeft: '<' }
      if (['ArrowRight', 'ArrowLeft'].includes(event.code)) {
        Components.Run.make(Components.Direction.resolve(`${perSwipe}${arrowSymbols[event.code]}`))
      }
    }
  }

  /**
   * Remove bindings from keyboard:
   * - on destroying to remove added events
   * - on updating to remove events before remounting
   */
  Events.on(['destroy', 'update'], () => {
    Keyboard.unbind()
  })

  /**
   * Remount component
   * - on updating to reflect potential changes in settings
   */
  Events.on('update', () => {
    Keyboard.mount()
  })

  /**
   * Destroy binder:
   * - on destroying to remove listeners
   */
  Events.on('destroy', () => {
    Binder.destroy()
  })

  return Keyboard
}
