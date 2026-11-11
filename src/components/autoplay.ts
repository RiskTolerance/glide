import { toInt, isUndefined } from '../utils/unit'
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
   * Holds enabled status of autoplaying.
   */
  let enabled = false

  /**
   * Holds the id of the running autoplay interval.
   */
  let interval: ReturnType<typeof setInterval> | undefined

  /**
   * Whether the pointer is over the slider and whether focus is inside it.
   * With `hoverpause`, autoplay stays paused while either is true.
   */
  let hovered = false
  let focused = false

  const Autoplay = {
    /**
     * Initializes autoplaying and events.
     */
    mount (): void {
      this.enable()
      this.start()

      if (Glide.settings.hoverpause) {
        this.bind()
      }
    },

    /**
     * Enables autoplaying
     */
    enable (): void {
      enabled = true
    },

    /**
     * Disables autoplaying.
     */
    disable (): void {
      enabled = false
    },

    /**
     * Starts autoplaying in configured interval.
     */
    start (): void {
      if (!enabled) {
        return
      }

      this.enable()

      if (Glide.settings.autoplay) {
        if (isUndefined(interval)) {
          interval = setInterval(() => {
            this.stop()

            Components.Run.make('>')

            this.start()

            Events.emit('autoplay')
          }, this.time)
        }
      }
    },

    /**
     * Stops autorunning of the glide.
     */
    stop (): void {
      clearInterval(interval)
      interval = undefined
    },

    /**
     * Restarts autoplaying, unless the pointer is over the slider
     * or focus is inside it.
     */
    resume (): void {
      if (!hovered && !focused) {
        this.start()
      }
    },

    /**
     * Stops autoplaying while mouse is over glide's area
     * or focus is inside it.
     */
    bind (): void {
      const root = Components.Html.root

      Binder.on('mouseover', root, () => {
        hovered = true

        if (enabled) {
          this.stop()
        }
      })

      Binder.on('mouseout', root, () => {
        hovered = false

        if (enabled) {
          this.resume()
        }
      })

      Binder.on('focusin', root, () => {
        focused = true

        if (enabled) {
          this.stop()
        }
      })

      Binder.on<FocusEvent>('focusout', root, (event) => {
        // Focus moving between elements inside the slider
        if (root.contains(event.relatedTarget as Node | null)) {
          return
        }

        focused = false

        if (enabled) {
          this.resume()
        }
      })
    },

    /**
     * Unbind mouseover and focus events.
     */
    unbind (): void {
      Binder.off(['mouseover', 'mouseout', 'focusin', 'focusout'], Components.Html.root)

      hovered = false
      focused = false
    },

    /**
     * Gets time period value for the autoplay interval. Prioritizes
     * times in `data-glide-autoplay` attrubutes over options.
     */
    get time (): number {
      const autoplay = Components.Html.slides[Glide.index].getAttribute('data-glide-autoplay')

      if (autoplay) {
        return toInt(autoplay)
      }

      return toInt(Glide.settings.autoplay)
    }
  }

  /**
   * Stop autoplaying and unbind events:
   * - on destroying, to clear defined interval
   * - on updating via API to reset interval that may changed
   */
  Events.on(['destroy', 'update'], () => {
    Autoplay.unbind()
  })

  /**
   * Stop autoplaying:
   * - before each run, to restart autoplaying
   * - on pausing via API
   * - on destroying, to clear defined interval
   * - while starting a swipe
   * - on updating via API to reset interval that may changed
   */
  Events.on(['run.before', 'swipe.start', 'update'], () => {
    Autoplay.stop()
  })

  Events.on(['pause', 'destroy'], () => {
    Autoplay.disable()
    Autoplay.stop()
  })

  /**
   * Resume autoplaying, unless the pointer or focus is on the slider:
   * - after each run, to restart autoplaying
   * - while ending a swipe
   */
  Events.on(['run.after', 'swipe.end'], () => {
    Autoplay.resume()
  })

  /**
   * Start autoplaying:
   * - after each run, to restart autoplaying
   * - on playing via API
   * - while ending a swipe
   */
  Events.on(['play'], () => {
    Autoplay.enable()
    Autoplay.start()
  })

  /**
   * Remount autoplaying:
   * - on updating via API to reset interval that may changed
   */
  Events.on('update', () => {
    Autoplay.mount()
  })

  /**
   * Destroy a binder:
   * - on destroying glide instance to clearup listeners
   */
  Events.on('destroy', () => {
    Binder.destroy()
  })

  return Autoplay
}
