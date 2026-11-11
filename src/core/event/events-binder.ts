import { isString } from '../../utils/unit'

export default class EventsBinder {
  listeners?: Record<string, EventListener>

  /**
   * Construct a EventsBinder instance.
   */
  constructor (listeners: Record<string, EventListener> = {}) {
    this.listeners = listeners
  }

  /**
   * Adds events listeners to arrows HTML elements.
   */
  on<E extends Event = Event> (
    events: string | string[],
    el: EventTarget,
    closure: (event: E) => void,
    capture: boolean | AddEventListenerOptions = false
  ): void {
    if (isString(events)) {
      events = [events]
    }

    const listeners = this.listeners as Record<string, EventListener>

    for (let i = 0; i < events.length; i++) {
      listeners[events[i]] = closure as EventListener

      el.addEventListener(events[i], listeners[events[i]], capture)
    }
  }

  /**
   * Removes event listeners from arrows HTML elements.
   */
  off (events: string | string[], el: EventTarget, capture: boolean | AddEventListenerOptions = false): void {
    if (isString(events)) {
      events = [events]
    }

    const listeners = this.listeners as Record<string, EventListener>

    for (let i = 0; i < events.length; i++) {
      el.removeEventListener(events[i], listeners[events[i]], capture)
    }
  }

  /**
   * Destroy collected listeners.
   */
  destroy (): void {
    delete this.listeners
  }
}
