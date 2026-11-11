import { isObject } from '../../utils/unit'
import type Glide from '../../index'
import type { Components, Transformer } from '../../types'

/**
 * Updates glide movement with a `peek` settings.
 */
export default function (Glide: Glide, Components: Components): Transformer {
  return {
    /**
     * Modifies passed translate value with a `peek` setting.
     */
    modify (translate: number): number {
      if ((Glide.settings.focusAt as number) >= 0) {
        const peek = Components.Peek.value

        if (isObject(peek)) {
          return translate - peek.before
        }

        return translate - peek
      }

      return translate
    }
  }
}
