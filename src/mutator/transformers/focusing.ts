import type Glide from '../../index'
import type { Components, Transformer } from '../../types'

/**
 * Updates glide movement with a `focusAt` settings.
 */
export default function (Glide: Glide, Components: Components): Transformer {
  return {
    /**
     * Modifies passed translate value with index in the `focusAt` setting.
     */
    modify (translate: number): number {
      const gap = Components.Gaps.value
      const width = Components.Sizes.width
      const focusAt = Glide.settings.focusAt
      const slideWidth = Components.Sizes.slideWidth

      if (focusAt === 'center') {
        return translate - (width / 2 - slideWidth / 2)
      }

      return translate - (slideWidth * focusAt) - (gap * focusAt)
    }
  }
}
