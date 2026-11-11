import { toInt, toFloat } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

import EventsBinder from '../core/event/events-binder'

const START_EVENT = 'pointerdown'
const MOVE_EVENT = 'pointermove'
const END_EVENTS = ['pointerup', 'pointercancel', 'pointerleave']

/**
 * The start and move listeners only observe the gesture,
 * so they never block the browser from scrolling.
 */
const capture = { passive: true }

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Instance of the binder for DOM Events.
   */
  const Binder = new EventsBinder()

  let swipeSin = 0
  let swipeStartX = 0
  let swipeStartY = 0
  let disabled = false

  /**
   * Pointer (mouse, finger or pen) that started the current swipe.
   * Other pointers are ignored until it ends.
   */
  let pointerId: number | undefined

  /**
   * Whether Glide set `touch-action` on the wrapper itself.
   */
  let touchActionSet = false

  /**
   * Animation frame that will apply the latest drag offset.
   */
  let frame: number | undefined
  let dragOffset = 0

  const Swipe = {
    /**
     * Initializes swipe bindings.
     */
    mount (): void {
      this.bindSwipeStart()
    },

    /**
     * Handler for `pointerdown` event. Calculates entry points of the user's tap.
     */
    start (event: PointerEvent): void {
      // Swiping or dragging is turned off for this kind of pointer,
      // or this is a second finger on the screen.
      if (!this.threshold(event) || !event.isPrimary) {
        return
      }

      if (!disabled && !Glide.disabled) {
        this.disable()

        pointerId = event.pointerId
        swipeSin = 0
        swipeStartX = toInt(event.pageX)
        swipeStartY = toInt(event.pageY)

        this.bindSwipeMove()
        this.bindSwipeEnd()

        Events.emit('swipe.start')
      }
    },

    /**
     * Handler for `pointermove` event. Calculates user's tap angle and distance.
     */
    move (event: PointerEvent): false | undefined {
      if (event.pointerId !== pointerId) {
        return
      }

      if (!Glide.disabled) {
        const { touchAngle, touchRatio } = Glide.settings

        const subExSx = toInt(event.pageX) - swipeStartX
        const subEySy = toInt(event.pageY) - swipeStartY
        const powEX = subExSx * subExSx
        const powEY = subEySy * subEySy
        const swipeHypotenuse = Math.sqrt(powEX + powEY)
        const swipeCathetus = Math.sqrt(powEY)

        swipeSin = Math.asin(swipeCathetus / swipeHypotenuse)

        if (swipeSin * 180 / Math.PI < touchAngle) {
          event.stopPropagation()

          this.drag(subExSx * toFloat(touchRatio))
        } else {
          return false
        }
      }
    },

    /**
     * Moves the track by the latest drag offset on the next animation frame,
     * so several move events within one frame cause a single update.
     */
    drag (offset: number): void {
      dragOffset = offset

      if (frame !== undefined) {
        return
      }

      frame = requestAnimationFrame(() => {
        frame = undefined

        if (Glide.disabled) {
          return
        }

        Components.Move.make(dragOffset)

        Components.Html.root.classList.add(Glide.settings.classes.dragging)

        Events.emit('swipe.move')
      })
    },

    /**
     * Handler for `pointerup`, `pointercancel` and `pointerleave` events.
     * Finitializes user's tap and decides about glide move.
     */
    end (event: PointerEvent): void {
      if (event.pointerId !== pointerId) {
        return
      }

      if (!Glide.disabled) {
        const { perSwipe, touchAngle, classes } = Glide.settings

        const threshold = Number(this.threshold(event))

        const swipeDistance = event.pageX - swipeStartX
        const swipeDeg = swipeSin * 180 / Math.PI

        pointerId = undefined

        this.enable()

        if (swipeDistance > threshold && swipeDeg < touchAngle) {
          Components.Run.make(Components.Direction.resolve(`${perSwipe}<`))
        } else if (swipeDistance < -threshold && swipeDeg < touchAngle) {
          Components.Run.make(Components.Direction.resolve(`${perSwipe}>`))
        } else {
          // While swipe don't reach distance apply previous transform.
          Components.Move.make()
        }

        Components.Html.root.classList.remove(classes.dragging)

        this.unbindSwipeMove()
        this.unbindSwipeEnd()

        Events.emit('swipe.end')
      }
    },

    /**
     * Binds swipe's starting event.
     */
    bindSwipeStart (): void {
      const { swipeThreshold, dragThreshold } = Glide.settings
      const wrapper = Components.Html.wrapper

      if (!swipeThreshold && !dragThreshold) {
        return
      }

      // Browsers only send pointer events for touch gestures they are not
      // handling themselves. glide.core.css leaves vertical scrolling to the
      // browser and horizontal swipes to Glide; do the same without it.
      const touchAction = getComputedStyle(wrapper).touchAction

      if (!touchAction || touchAction === 'auto') {
        wrapper.style.touchAction = 'pan-y'
        touchActionSet = true
      }

      Binder.on<PointerEvent>(START_EVENT, wrapper, (event) => {
        this.start(event)
      }, capture)
    },

    /**
     * Unbinds swipe's starting event.
     */
    unbindSwipeStart (): void {
      Binder.off(START_EVENT, Components.Html.wrapper, capture)

      if (touchActionSet) {
        Components.Html.wrapper.style.touchAction = ''
        touchActionSet = false
      }
    },

    /**
     * Binds swipe's moving event.
     */
    bindSwipeMove (): void {
      Binder.on<PointerEvent>(MOVE_EVENT, Components.Html.wrapper, (event) => {
        this.move(event)
      }, capture)
    },

    /**
     * Unbinds swipe's moving event.
     */
    unbindSwipeMove (): void {
      if (frame !== undefined) {
        cancelAnimationFrame(frame)
        frame = undefined
      }

      Binder.off(MOVE_EVENT, Components.Html.wrapper, capture)
    },

    /**
     * Binds swipe's ending event.
     */
    bindSwipeEnd (): void {
      Binder.on<PointerEvent>(END_EVENTS, Components.Html.wrapper, (event) => {
        this.end(event)
      })
    },

    /**
     * Unbinds swipe's ending event.
     */
    unbindSwipeEnd (): void {
      Binder.off(END_EVENTS, Components.Html.wrapper)
    },

    /**
     * Gets value of minimum swipe distance settings based on pointer type:
     * `dragThreshold` for a mouse, `swipeThreshold` for touch and pens.
     */
    threshold (event: PointerEvent): number | false {
      const settings = Glide.settings

      if (event.pointerType === 'mouse') {
        return settings.dragThreshold
      }

      return settings.swipeThreshold
    },

    /**
     * Enables swipe event.
     */
    enable () {
      disabled = false

      Components.Transition.enable()

      return this
    },

    /**
     * Disables swipe event.
     */
    disable () {
      disabled = true

      Components.Transition.disable()

      return this
    }
  }

  /**
   * Add component class:
   * - after initial building
   */
  Events.on('build.after', () => {
    Components.Html.root.classList.add(Glide.settings.classes.swipeable)
  })

  /**
   * Remove swiping bindings:
   * - on destroying, to remove added EventListeners
   */
  Events.on('destroy', () => {
    Swipe.unbindSwipeStart()
    Swipe.unbindSwipeMove()
    Swipe.unbindSwipeEnd()
    Binder.destroy()
  })

  return Swipe
}
