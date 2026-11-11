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

  test('`mergeOptions` should deep merge classes options object', () => {
    const obj = merge(
      {
        classes: {
          direction: {
            ltr: 'a',
            rtl: 'a'
          },
          type: {
            slider: 'a',
            carousel: 'a'
          },
          slide: {
            clone: 'a',
            active: 'a'
          },
          arrow: {
            disabled: 'a'
          },
          nav: {
            active: 'a'
          }
        }
      },
      {
        classes: {
          type: {
            slider: 'b',
            carousel: 'b'
          },
          slide: {
            clone: 'b',
            active: 'b'
          },
          arrow: {
            disabled: 'b'
          },
          nav: {
            active: 'b'
          }
        }
      }
    )

    expect(obj).toEqual({
      classes: {
        direction: {
          ltr: 'a',
          rtl: 'a'
        },
        type: {
          slider: 'b',
          carousel: 'b'
        },
        slide: {
          clone: 'b',
          active: 'b'
        },
        arrow: {
          disabled: 'b'
        },
        nav: {
          active: 'b'
        }
      }
    })
  })
})
