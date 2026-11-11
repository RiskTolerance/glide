import { now } from './time'

export interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

export type Throttled<F extends (...args: any[]) => any> =
  ((...args: Parameters<F>) => ReturnType<F> | undefined) & { cancel: () => void }

/**
 * Returns a function, that, when invoked, will only be triggered
 * at most once during a given window of time.
 *
 * @see https://github.com/jashkenas/underscore
 */
export function throttle<F extends (...args: any[]) => any> (func: F, wait: number, options: ThrottleOptions = {}): Throttled<F> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let context: unknown
  let args: Parameters<F> | null
  let result: ReturnType<F> | undefined
  let previous = 0

  const later = function (): void {
    previous = options.leading === false ? 0 : now()
    timeout = undefined
    result = func.apply(context, args as Parameters<F>)
    if (!timeout) context = args = null
  }

  const throttled = function (this: unknown, ...rest: Parameters<F>): ReturnType<F> | undefined {
    const at = now()
    if (!previous && options.leading === false) previous = at
    const remaining = wait - (at - previous)
    context = this
    args = rest
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
      previous = at
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function (): void {
    clearTimeout(timeout)
    previous = 0
    timeout = undefined
    context = args = null
  }

  return throttled
}
