import type Core from './index'
import type EventsBus from './core/event/events-bus'
import type Anchors from './components/anchors'
import type Autoplay from './components/autoplay'
import type Breakpoints from './components/breakpoints'
import type Build from './components/build'
import type Clones from './components/clones'
import type Controls from './components/controls'
import type Direction from './components/direction'
import type Gaps from './components/gaps'
import type Html from './components/html'
import type Images from './components/images'
import type Keyboard from './components/keyboard'
import type Move from './components/move'
import type Peek from './components/peek'
import type Resize from './components/resize'
import type Run from './components/run'
import type Sizes from './components/sizes'
import type Swipe from './components/swipe'
import type Transition from './components/transition'
import type Translate from './components/translate'

/**
 * Type of the movement.
 * `slider` rewinds to the start/end when it reaches the first or last slide.
 * `carousel` changes slides without starting over.
 */
export type GlideType = 'slider' | 'carousel'

/** Moving direction mode. */
export type GlideDirection = 'ltr' | 'rtl'

/**
 * Peek distance of the next and previous viewports. A single value applies to
 * both sides; `before` and `after` set each side separately.
 */
export type GlidePeek = number | string | { before: number | string, after: number | string }

/** HTML classes Glide applies to its elements. */
export interface GlideClasses {
  swipeable: string
  dragging: string
  direction: { ltr: string, rtl: string }
  type: { slider: string, carousel: string }
  slide: { clone: string, active: string }
  arrow: { disabled: string }
  nav: { active: string }
}

/** Settings applied below a viewport width (in pixels), keyed by that width. */
export type GlideBreakpoints = Record<number, GlideOptions>

/** Fully resolved settings of a Glide instance: defaults merged with user options. */
export interface GlideSettings {
  type: GlideType
  startAt: number
  perView: number
  focusAt: number | 'center'
  gap: number
  autoplay: number | false
  hoverpause: boolean
  keyboard: boolean
  bound: boolean
  swipeThreshold: number | false
  dragThreshold: number | false
  perSwipe: '' | '|'
  touchRatio: number
  touchAngle: number
  animationDuration: number
  rewind: boolean
  rewindDuration: number
  animationTimingFunc: string
  waitForTransition: boolean
  throttle: number
  direction: GlideDirection
  peek: GlidePeek
  cloningRatio: number
  breakpoints: GlideBreakpoints
  classes: GlideClasses
}

/** Options accepted by `new Glide()` and `glide.update()`. Every setting is optional. */
export interface GlideOptions extends Partial<Omit<GlideSettings, 'classes'>> {
  classes?: {
    [K in keyof GlideClasses]?: GlideClasses[K] extends string ? string : Partial<GlideClasses[K]>
  }
}

/** A parsed movement pattern such as `>`, `<<`, `=2` or `|>`. */
export interface MoveSchema {
  direction: string
  steps: number | string
}

/** Context passed to handlers of events that carry no data. */
export type EmptyContext = Record<string, never>

/** Context passed to handlers registered with `glide.on()`, by event name. */
export interface GlideEventMap {
  'mount.before': EmptyContext
  'mount.after': EmptyContext
  /** Receives the options passed to `glide.update()`. */
  update: GlideOptions
  play: EmptyContext
  pause: EmptyContext
  destroy: EmptyContext
  /** Fires when the slider's width changes or a different breakpoint starts matching. */
  resize: EmptyContext
  'build.before': EmptyContext
  'build.after': EmptyContext
  'run.before': MoveSchema
  run: MoveSchema
  'run.start': MoveSchema
  'run.end': MoveSchema
  'run.offset': MoveSchema
  'run.after': MoveSchema
  move: { movement: number }
  'move.after': { movement: number }
  'translate.jump': EmptyContext
  'swipe.start': EmptyContext
  'swipe.move': EmptyContext
  'swipe.end': EmptyContext
  autoplay: EmptyContext
}

export type GlideEvent = keyof GlideEventMap

/** Creates a component. Receives the instance, the other components and the event bus. */
export type ComponentFactory<T = unknown> = (glide: Core, components: Components, events: EventsBus) => T

/** Component factories passed to `glide.mount()`, keyed by component name. */
export type Extensions = Record<string, ComponentFactory>

/** Mounted components of a Glide instance. */
export interface Components {
  Html: ReturnType<typeof Html>
  Translate: ReturnType<typeof Translate>
  Transition: ReturnType<typeof Transition>
  Direction: ReturnType<typeof Direction>
  Peek: ReturnType<typeof Peek>
  Sizes: ReturnType<typeof Sizes>
  Gaps: ReturnType<typeof Gaps>
  Move: ReturnType<typeof Move>
  Clones: ReturnType<typeof Clones>
  Resize: ReturnType<typeof Resize>
  Build: ReturnType<typeof Build>
  Run: ReturnType<typeof Run>
  Swipe?: ReturnType<typeof Swipe>
  Images?: ReturnType<typeof Images>
  Anchors?: ReturnType<typeof Anchors>
  Controls?: ReturnType<typeof Controls>
  Keyboard?: ReturnType<typeof Keyboard>
  Autoplay?: ReturnType<typeof Autoplay>
  Breakpoints?: ReturnType<typeof Breakpoints>
  [name: string]: unknown
}

/** Modifies the translate value of the slides wrapper. */
export interface Transformer {
  modify (translate: number): number
}

/** Creates a translate transformer. Register with `glide.mutate()`. */
export type TransformerFactory = (glide: Core, components: Components, events?: EventsBus) => Transformer
