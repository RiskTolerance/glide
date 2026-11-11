/**
 * Minimal `ResizeObserver` for jsdom, which has none.
 *
 * It only reports sizes a test sets with `resizeElement()`. Browsers also
 * report the initial size right after `observe()`; Glide compares every
 * report against its own measurement, so that one is not needed here.
 */
export class ResizeObserverStub implements ResizeObserver {
  static observers = new Set<ResizeObserverStub>()

  readonly targets = new Set<Element>()

  constructor (private readonly callback: ResizeObserverCallback) {
    ResizeObserverStub.observers.add(this)
  }

  observe (target: Element): void {
    this.targets.add(target)
  }

  unobserve (target: Element): void {
    this.targets.delete(target)
  }

  disconnect (): void {
    this.targets.clear()
    ResizeObserverStub.observers.delete(this)
  }

  notify (target: Element, inlineSize: number): void {
    const size = [{ inlineSize, blockSize: 0 }]
    const entry = {
      target,
      borderBoxSize: size,
      contentBoxSize: size,
      devicePixelContentBoxSize: size,
      contentRect: { width: inlineSize, height: 0 }
    } as unknown as ResizeObserverEntry

    this.callback([entry], this)
  }
}

/**
 * Reports a new border-box width for an element to every observer watching it.
 */
export function resizeElement (target: Element, inlineSize: number): void {
  ResizeObserverStub.observers.forEach((observer) => {
    if (observer.targets.has(target)) {
      observer.notify(target, inlineSize)
    }
  })
}
