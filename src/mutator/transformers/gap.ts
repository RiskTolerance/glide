import type Glide from '../../index'
import type { Components, Transformer } from '../../types'

/**
 * Updates glide movement with a `gap` settings.
 */
export default function (Glide: Glide, Components: Components): Transformer {
  return {
    /**
     * Modifies passed translate value with number in the `gap` settings.
     */
    modify (translate: number): number {
      const multiplier = Math.floor(translate / Components.Sizes.slideWidth)
      return translate + (Components.Gaps.value * multiplier)
    }
  }
}
