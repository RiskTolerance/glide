import { throttle } from '../utils/wait'
import type { Throttled } from '../utils/wait'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Watches the track, so the slider lays out again whenever its width
   * changes: window resizes, container changes, or a hidden slider being shown.
   */
  let observer: ResizeObserver | undefined

  /**
   * Last known width of the track, rounded like `offsetWidth`.
   */
  let width: number | undefined

  /**
   * Throttled emitter of the `resize` event.
   */
  let onResize: Throttled<() => void> | undefined

  const Resize = {
    /**
     * Initializes track observing.
     */
    mount (): void {
      this.bind()
    },

    /**
     * Observes the track's width. Layout is costly, so `resize`
     * is emitted at most once per `throttle` milliseconds.
     */
    bind (): void {
      width = Components.Sizes.width

      onResize = throttle(() => {
        Events.emit('resize')
      }, Glide.settings.throttle)

      observer = new ResizeObserver((entries) => {
        const size = Math.round(entries[entries.length - 1].borderBoxSize[0].inlineSize)

        if (size !== width) {
          width = size
          onResize?.()
        }
      })

      observer.observe(Components.Html.track, { box: 'border-box' })
    },

    /**
     * Stops observing the track.
     */
    unbind (): void {
      onResize?.cancel()
      observer?.disconnect()
      observer = undefined
    }
  }

  /**
   * Stop observing:
   * - on destroying, to release the observer
   */
  Events.on('destroy', () => {
    Resize.unbind()
  })

  return Resize
}
