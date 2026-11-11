import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Holds inactivity status of transition.
   * When true transition is not applied.
   */
  let disabled = false

  /**
   * Timers of callbacks waiting for the current animation to end.
   */
  const pending = new Set<ReturnType<typeof setTimeout>>()

  /**
   * Whether the user asked the system to minimize motion. Read live,
   * as the preference can change while the page is open.
   */
  const reducedMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : undefined

  const Transition = {
    /**
     * Composes string of the CSS transition.
     */
    compose (property: string): string {
      const settings = Glide.settings

      if (disabled) {
        return `${property} 0ms ${settings.animationTimingFunc}`
      }

      return `${property} ${this.duration}ms ${settings.animationTimingFunc}`
    },

    /**
     * Sets value of transition on HTML element.
     */
    set (property: string = 'transform'): void {
      Components.Html.wrapper.style.transition = this.compose(property)
    },

    /**
     * Removes value of transition from HTML element.
     */
    remove (): void {
      Components.Html.wrapper.style.transition = ''
    },

    /**
     * Runs callback after animation.
     */
    after (callback: () => void): void {
      const timer = setTimeout(() => {
        pending.delete(timer)
        callback()
      }, this.duration)

      pending.add(timer)
    },

    /**
     * Enable transition.
     */
    enable (): void {
      disabled = false

      this.set()
    },

    /**
     * Disable transition.
     */
    disable (): void {
      disabled = true

      this.set()
    },

    /**
     * Gets duration of the transition based
     * on currently running animation type.
     * Slides change instantly when reduced motion is preferred.
     */
    get duration (): number {
      const settings = Glide.settings

      if (reducedMotion?.matches) {
        return 0
      }

      if (Glide.isType('slider') && Components.Run.offset) {
        return settings.rewindDuration
      }

      return settings.animationDuration
    }
  }

  /**
   * Set transition `style` value:
   * - on each moving, because it may be cleared by offset move
   */
  Events.on('move', () => {
    Transition.set()
  })

  /**
   * Disable transition:
   * - before initial build to avoid transitioning from `0` to `startAt` index
   * - while resizing window and recalculating dimensions
   * - on jumping from offset transition at start and end edges in `carousel` type
   */
  Events.on(['build.before', 'resize', 'translate.jump'], () => {
    Transition.disable()
  })

  /**
   * Enable transition:
   * - on each running, because it may be disabled by offset move
   */
  Events.on('run', () => {
    Transition.enable()
  })

  /**
   * Remove transition and drop callbacks waiting for it:
   * - on destroying to bring markup to its inital state
   */
  Events.on('destroy', () => {
    pending.forEach((timer) => clearTimeout(timer))
    pending.clear()

    Transition.remove()
  })

  return Transition
}
