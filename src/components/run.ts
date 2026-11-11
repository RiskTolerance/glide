import { warn } from '../utils/log'
import { toInt } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components, MoveSchema } from '../types'

export default function (Glide: Glide, Components: Components, Events: EventsBus) {
  /**
   * Holds the offsetting flag of the current run.
   */
  let offset = false

  /**
   * Holds the parsed movement pattern of the current run.
   */
  let moveSchema: MoveSchema

  /**
   * Number of runs whose transition has not finished yet.
   */
  let pendingRuns = 0

  const Run = {
    /**
     * Initializes autorunning of the glide.
     */
    mount (): void {
      offset = false
    },

    /**
     * Makes glides running based on the passed moving schema.
     */
    make (move: string): void {
      if (!Glide.disabled) {
        !Glide.settings.waitForTransition || Glide.disable()

        this.move = move

        Events.emit('run.before', this.move)

        this.calculate()

        Events.emit('run', this.move)

        pendingRuns++

        Components.Transition.after(() => {
          pendingRuns--

          if (this.isStart()) {
            Events.emit('run.start', this.move)
          }

          if (this.isEnd()) {
            Events.emit('run.end', this.move)
          }

          if (this.isOffset()) {
            offset = false

            Events.emit('run.offset', this.move)
          }

          Events.emit('run.after', this.move)

          Glide.enable()
        })
      }
    },

    /**
     * Calculates current index based on defined move.
     */
    calculate (): void {
      const { move, length } = this
      const { steps, direction } = move

      // By default assume that size of view is equal to one slide
      let viewSize = 1

      // While direction is `=` we want jump to
      // a specified index described in steps.
      if (direction === '=') {
        // Check if bound is true,
        // as we want to avoid whitespaces.
        if (Glide.settings.bound && toInt(steps) > length) {
          Glide.index = length
          return
        }

        Glide.index = steps

        return
      }

      // When pattern is equal to `>>` we want
      // fast forward to the last slide.
      if (direction === '>' && steps === '>') {
        Glide.index = length

        return
      }

      // When pattern is equal to `<<` we want
      // fast forward to the first slide.
      if (direction === '<' && steps === '<') {
        Glide.index = 0

        return
      }

      // pagination movement
      if (direction === '|') {
        viewSize = Glide.settings.perView || 1
      }

      // we are moving forward
      if (direction === '>' || (direction === '|' && steps === '>')) {
        const index = calculateForwardIndex(viewSize)

        if (index > length) {
          offset = true
        }

        Glide.index = normalizeForwardIndex(index, viewSize)

        return
      }

      // we are moving backward
      if (direction === '<' || (direction === '|' && steps === '<')) {
        const index = calculateBackwardIndex(viewSize)

        if (index < 0) {
          offset = true
        }

        Glide.index = normalizeBackwardIndex(index, viewSize)

        return
      }

      warn(`Invalid direction pattern [${direction}${steps}] has been used`)
    },

    /**
     * Checks if we are on the first slide.
     */
    isStart (): boolean {
      return Glide.index <= 0
    },

    /**
     * Checks if we are on the last slide.
     */
    isEnd (): boolean {
      return Glide.index >= this.length
    },

    /**
     * Checks if we are making a offset run.
     */
    isOffset (direction?: string): boolean {
      if (!direction) {
        return offset
      }

      if (!offset) {
        return false
      }

      // did we view to the right?
      if (direction === '|>') {
        return this.move.direction === '|' && this.move.steps === '>'
      }

      // did we view to the left?
      if (direction === '|<') {
        return this.move.direction === '|' && this.move.steps === '<'
      }

      return this.move.direction === direction
    },

    /**
     * Checks if bound mode is active
     */
    isBound (): boolean {
      return Glide.isType('slider') && Glide.settings.focusAt !== 'center' && Glide.settings.bound
    },

    /**
     * Gets value of the move schema.
     */
    get move (): MoveSchema {
      return moveSchema
    },

    /**
     * Sets value of the move schema.
     */
    set move (value: string) {
      const step = value.slice(1)

      moveSchema = {
        direction: value.slice(0, 1),
        steps: step ? (toInt(step) ? toInt(step) : step) : 0
      }
    },

    /**
     * Gets value of the running distance based
     * on zero-indexing number of slides.
     */
    get length (): number {
      const { settings } = Glide
      const { length } = Components.Html.slides

      // If the `bound` option is active, a maximum running distance should be
      // reduced by `perView` and `focusAt` settings. Running distance
      // should end before creating an empty space after instance.
      if (this.isBound()) {
        return (length - 1) - (toInt(settings.perView) - 1) + toInt(settings.focusAt)
      }

      return length - 1
    },

    /**
     * Gets status of the offsetting flag.
     */
    get offset (): boolean {
      return offset
    }
  }

  /**
   * Returns index value to move forward/to the right
   */
  function calculateForwardIndex (viewSize: number): number {
    const { index } = Glide

    if (Glide.isType('carousel')) {
      return index + viewSize
    }

    return index + (viewSize - (index % viewSize))
  }

  /**
   * Normalizes the given forward index based on glide settings, preventing it to exceed certain boundaries
   */
  function normalizeForwardIndex (index: number, viewSize: number): number {
    const { length } = Run

    if (index <= length) {
      return index
    }

    if (Glide.isType('carousel')) {
      return index - (length + 1)
    }

    if (Glide.settings.rewind) {
      // bound does funny things with the length, therefor we have to be certain
      // that we are on the last possible index value given by bound
      if (Run.isBound() && !Run.isEnd()) {
        return length
      }

      return 0
    }

    if (Run.isBound()) {
      return length
    }

    return Math.floor(length / viewSize) * viewSize
  }

  /**
   * Calculates index value to move backward/to the left
   */
  function calculateBackwardIndex (viewSize: number): number {
    const { index } = Glide

    if (Glide.isType('carousel')) {
      return index - viewSize
    }

    // ensure our back navigation results in the same index as a forward navigation
    // to experience a homogeneous paging
    const view = Math.ceil(index / viewSize)

    return (view - 1) * viewSize
  }

  /**
   * Normalizes the given backward index based on glide settings, preventing it to exceed certain boundaries
   */
  function normalizeBackwardIndex (index: number, viewSize: number): number {
    const { length } = Run

    if (index >= 0) {
      return index
    }

    if (Glide.isType('carousel')) {
      return index + (length + 1)
    }

    if (Glide.settings.rewind) {
      // bound does funny things with the length, therefor we have to be certain
      // that we are on first possible index value before we to rewind to the length given by bound
      if (Run.isBound() && Run.isStart()) {
        return length
      }

      return Math.floor(length / viewSize) * viewSize
    }

    return 0
  }

  /**
   * Re-enable the instance when destroyed mid-run:
   * - the transition callback that would have enabled it is dropped on destroy
   */
  Events.on('destroy', () => {
    if (pendingRuns > 0) {
      pendingRuns = 0

      Glide.enable()
    }
  })

  return Run
}
