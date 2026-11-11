import { warn } from '../utils/log'
import { isFunction } from '../utils/unit'
import type Glide from '../index'
import type EventsBus from '../core/event/events-bus'
import type { Components, TransformerFactory } from '../types'

import Rtl from './transformers/rtl'
import Gap from './transformers/gap'
import Grow from './transformers/grow'
import Peeking from './transformers/peeking'
import Focusing from './transformers/focusing'

/**
 * Applies diffrent transformers on translate value.
 */
export default function (Glide: Glide, Components: Components, Events?: EventsBus): { mutate (translate: number): number } {
  /**
   * Merge instance transformers with collection of default transformers.
   * It's important that the Rtl component be last on the list,
   * so it reflects all previous transformations.
   */
  const TRANSFORMERS: TransformerFactory[] = [
    Gap,
    Grow,
    Peeking,
    Focusing
  ].concat(Glide._t, [Rtl])

  return {
    /**
     * Piplines translate value with registered transformers.
     */
    mutate (translate: number): number {
      for (let i = 0; i < TRANSFORMERS.length; i++) {
        const transformer = TRANSFORMERS[i]
        const instance = isFunction(transformer) ? transformer(Glide, Components, Events) : undefined

        if (instance && isFunction(instance.modify)) {
          translate = instance.modify(translate)
        } else {
          warn('Transformer should be a function that returns an object with `modify()` method')
        }
      }

      return translate
    }
  }
}
