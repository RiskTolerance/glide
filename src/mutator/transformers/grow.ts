import type Glide from '../../index'
import type { Components, Transformer } from '../../types'

/**
 * Updates glide movement with width of additional clones width.
 */
export default function (Glide: Glide, Components: Components): Transformer {
  return {
    /**
     * Adds to the passed translate width of the half of clones.
     */
    modify (translate: number): number {
      return translate + (Components.Clones.grow / 2)
    }
  }
}
