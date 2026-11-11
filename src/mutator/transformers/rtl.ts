import type Glide from '../../index'
import type { Components, Transformer } from '../../types'

/**
 * Reflects value of glide movement.
 */
export default function (Glide: Glide, Components: Components): Transformer {
  return {
    /**
     * Negates the passed translate if glide is in RTL option.
     */
    modify (translate: number): number {
      if (Components.Direction.is('rtl')) {
        return -translate
      }

      return translate
    }
  }
}
