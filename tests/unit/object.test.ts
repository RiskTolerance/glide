import { mergeOptions } from '../../src/utils/object'

// These tests merge arbitrary objects, not full Glide settings
const merge = mergeOptions as unknown as (defaults: object, settings: object) => object

describe('Function', () => {
  test('`mergeOptions` should merge defaults and options object', () => {
    const obj = merge(
      {
        a: 1,
        b: 2
      },
      {
        a: 5
      }
    )

    expect(obj).toEqual({
      a: 5,
      b: 2
    })
  })

  test('`mergeOptions` should merge breakpoints with the default ones', () => {
    const obj = merge(
      {
        gap: 10,
        breakpoints: {
          600: { perView: 1 },
          1024: { perView: 2 }
        }
      },
      {
        breakpoints: {
          1024: { perView: 3 }
        }
      }
    )

    expect(obj).toEqual({
      gap: 10,
      breakpoints: {
        600: { perView: 1 },
        1024: { perView: 3 }
      }
    })
  })
})
