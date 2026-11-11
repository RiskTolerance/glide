import { isArray } from '../../utils/unit'
import type { GlideEventMap } from '../../types'

export type EventHandler<C = any> = (context: C) => void

export interface EventHandle {
  remove (): void
}

export default class EventsBus {
  events: Record<string, EventHandler[]>
  hop: (v: PropertyKey) => boolean

  /**
   * Construct a EventBus instance.
   */
  constructor (events: Record<string, EventHandler[]> = {}) {
    this.events = events
    this.hop = events.hasOwnProperty
  }

  /**
   * Adds listener to the specifed event.
   */
  on<K extends keyof GlideEventMap> (event: K | K[], handler: EventHandler<GlideEventMap[K]>): EventHandle | undefined
  on (event: string | string[], handler: EventHandler): EventHandle | undefined
  on (event: string | string[], handler: EventHandler): EventHandle | undefined {
    if (isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        this.on(event[i], handler)
      }

      return
    }

    // Create the event's object if not yet created
    if (!this.hop.call(this.events, event)) {
      this.events[event] = []
    }

    // Add the handler to queue
    const index = this.events[event].push(handler) - 1
    const events = this.events

    // Provide handle back for removal of event
    return {
      remove () {
        delete events[event][index]
      }
    }
  }

  /**
   * Runs registered handlers for specified event.
   */
  emit<K extends keyof GlideEventMap> (event: K | K[], context?: GlideEventMap[K]): void
  emit (event: string | string[], context?: object): void
  emit (event: string | string[], context?: object): void {
    if (isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        this.emit(event[i], context)
      }

      return
    }

    // If the event doesn't exist, or there's no handlers in queue, just leave
    if (!this.hop.call(this.events, event)) {
      return
    }

    // Cycle through events queue, fire!
    this.events[event].forEach((item) => {
      item(context || {})
    })
  }
}
