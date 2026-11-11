import defaults from './defaults'
import { warn } from './utils/log'
import { mount } from './core/index'
import { mergeOptions } from './utils/object'
import { toInt, isObject, isArray } from './utils/unit'

import EventsBus from './core/event/events-bus'
import type { EventHandler } from './core/event/events-bus'
import type {
  Components,
  Extensions,
  GlideEventMap,
  GlideOptions,
  GlideSettings,
  GlideType,
  TransformerFactory
} from './types'

export default class Glide {
  /** @internal Mounted components. */
  _c: Components
  /** @internal Registered translate transformers. */
  _t: TransformerFactory[]
  /** @internal Event bus of the instance. */
  _e: EventsBus
  /** @internal */
  declare _o: GlideSettings
  /** @internal */
  declare _i: number
  /** @internal */
  declare _d: boolean

  /** Root element of the slider, or a selector for it. */
  selector: string | HTMLElement

  /**
   * Construct glide.
   */
  constructor (selector: string | HTMLElement, options: GlideOptions = {}) {
    this._c = {} as Components
    this._t = []
    this._e = new EventsBus()

    this.disabled = false
    this.selector = selector
    this.settings = mergeOptions(defaults, options)
    this.index = this.settings.startAt
  }

  /**
   * Initializes glide.
   *
   * @param extensions Collection of extensions to initialize.
   */
  mount (extensions: Extensions = {}): this {
    this._e.emit('mount.before')

    if (isObject(extensions)) {
      this._c = mount(this, extensions, this._e)
    } else {
      warn('You need to provide a object on `mount()`')
    }

    this._e.emit('mount.after')

    return this
  }

  /**
   * Collects an instance `translate` transformers.
   *
   * @param transformers Collection of transformers.
   */
  mutate (transformers: TransformerFactory[] = []): this {
    if (isArray(transformers)) {
      this._t = transformers
    } else {
      warn('You need to provide a array on `mutate()`')
    }

    return this
  }

  /**
   * Updates glide with specified settings.
   */
  update (settings: GlideOptions = {}): this {
    this.settings = mergeOptions(this.settings, settings)

    if (Object.hasOwn(settings, 'startAt')) {
      this.index = settings.startAt as number
    }

    this._e.emit('update', settings)

    return this
  }

  /**
   * Change slide with specified pattern. A pattern must be in the special format:
   * `>` - Move one forward
   * `<` - Move one backward
   * `={i}` - Go to {i} zero-based slide (eq. '=1', will go to second slide)
   * `>>` - Rewinds to end (last slide)
   * `<<` - Rewinds to start (first slide)
   * `|>` - Move one viewport forward
   * `|<` - Move one viewport backward
   */
  go (pattern: string): this {
    this._c.Run.make(pattern)

    return this
  }

  /**
   * Move track by specified distance.
   */
  move (distance: number | string): this {
    this._c.Transition.disable()
    this._c.Move.make(distance)

    return this
  }

  /**
   * Destroy instance and revert all changes done by this._c.
   */
  destroy (): this {
    this._e.emit('destroy')

    return this
  }

  /**
   * Start instance autoplaying.
   *
   * @param interval Run autoplaying with passed interval regardless of `autoplay` settings
   */
  play (interval: number | false = false): this {
    if (interval) {
      this.settings.autoplay = interval
    }

    this._e.emit('play')

    return this
  }

  /**
   * Stop instance autoplaying.
   */
  pause (): this {
    this._e.emit('pause')

    return this
  }

  /**
   * Sets glide into a idle status.
   */
  disable (): this {
    this.disabled = true

    return this
  }

  /**
   * Sets glide into a active status.
   */
  enable (): this {
    this.disabled = false

    return this
  }

  /**
   * Adds cuutom event listener with handler.
   */
  on<K extends keyof GlideEventMap> (event: K | K[], handler: EventHandler<GlideEventMap[K]>): this
  on (event: string | string[], handler: EventHandler): this
  on (event: string | string[], handler: EventHandler): this {
    this._e.on(event, handler)

    return this
  }

  /**
   * Checks if glide is a precised type.
   */
  isType (name: GlideType): boolean {
    return this.settings.type === name
  }

  /**
   * Gets value of the core options.
   */
  get settings (): GlideSettings {
    return this._o
  }

  /**
   * Sets value of the core options.
   */
  set settings (o: GlideSettings) {
    if (isObject(o)) {
      this._o = o
    } else {
      warn('Options must be an `object` instance.')
    }
  }

  /**
   * Gets current index of the slider.
   */
  get index (): number {
    return this._i
  }

  /**
   * Sets current index a slider.
   */
  set index (i: number | string) {
    this._i = toInt(i)
  }

  /**
   * Gets type name of the slider.
   */
  get type (): GlideType {
    return this.settings.type
  }

  /**
   * Gets value of the idle status.
   */
  get disabled (): boolean {
    return this._d
  }

  /**
   * Sets value of the idle status.
   */
  set disabled (status: boolean) {
    this._d = !!status
  }
}
