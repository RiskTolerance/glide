import { warn } from '../utils/log'
import { throttle } from '../utils/wait'
import { isObject } from '../utils/unit'
import { mergeOptions } from '../utils/object'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components, GlideOptions, GlideSettings } from '../types'

import EventsBinder from '../core/event/events-binder'

type Points = Record<string, GlideOptions>

/**
 * Checks the breakpoints option. Its keys are widths such as `800`, and
 * integer keys are always enumerated in ascending order, so the smallest
 * matching breakpoint is found first without sorting.
 */
function validBreakpoints (points: Points): Points {
  if (isObject(points)) {
    return points
  }

  warn('Breakpoints option must be an object')

  return {}
}

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Instance of the binder for DOM Events.
   */
  const Binder = new EventsBinder()

  /**
   * Settings without any breakpoint applied: defaults merged with the
   * constructor options and with every `update()` since.
   */
  let base: GlideSettings = Object.assign({}, Glide.settings)

  /**
   * Holds reference to breakpoints object in settings.
   */
  let points = validBreakpoints(base.breakpoints as Points)

  /**
   * Breakpoint currently applied, if any.
   */
  let current: string | undefined

  /**
   * Set when breakpoints change via `update()`, so the next resize
   * applies them even if the matching width did not change.
   */
  let stale = false

  /**
   * Finds the smallest breakpoint matching the current viewport width.
   */
  function matchPoint (points: Points): string | undefined {
    if (typeof window.matchMedia !== 'undefined') {
      for (const point in points) {
        if (Object.hasOwn(points, point)) {
          if (window.matchMedia(`(max-width: ${point}px)`).matches) {
            return point
          }
        }
      }
    }

    return undefined
  }

  /**
   * Applies the matching breakpoint on top of the base settings.
   */
  function apply (point: string | undefined): void {
    current = point
    Glide.settings = mergeOptions(base, point === undefined ? {} : points[point])
  }

  const Breakpoints = {
    /**
     * Matches settings for currectly matching media breakpoint.
     */
    match (points: Points): GlideOptions {
      const point = matchPoint(points)

      return point === undefined ? base : points[point]
    }
  }

  /**
   * Overwrite instance settings with currently matching breakpoint settings.
   * This happens right after component initialization.
   */
  const initial = matchPoint(points)

  if (initial !== undefined) {
    apply(initial)
  }

  /**
   * Update glide with settings of matched brekpoint and lay it out again:
   * - window resize, when a different breakpoint starts matching
   */
  const onResize = throttle(() => {
    const point = matchPoint(points)

    if (stale || point !== current) {
      stale = false
      apply(point)

      Events.emit('resize')
    }
  }, Glide.settings.throttle)

  Binder.on('resize', window, onResize)

  /**
   * Keep base settings and breakpoints in sync with the API:
   * - on updating via API, so later breakpoint changes keep the new options
   */
  Events.on('update', (options) => {
    base = mergeOptions(base, options)
    points = validBreakpoints(base.breakpoints as Points)

    if (Object.hasOwn(options, 'breakpoints')) {
      stale = true
    }
  })

  /**
   * Unbind resize listener:
   * - on destroying, to bring markup to its initial state
   */
  Events.on('destroy', () => {
    onResize.cancel()
    Binder.off('resize', window)
  })

  return Breakpoints
}
