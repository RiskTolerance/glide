import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { resizeElement } from '../fixtures/resize-observer'

import Glide from '../../entry/entry-complete'

// Reading `offsetWidth` forces the browser to compute layout synchronously,
// so Glide should measure the track once per layout pass, not on every move.
describe('Track measurements', () => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth') as PropertyDescriptor
  let reads = 0
  let width = 1000

  beforeEach(() => {
    document.body.innerHTML = html
    reads = 0
    width = 1000

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get () {
        reads++

        return width
      }
    })
  })

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', descriptor)
  })

  test('mounting should measure the track once', () => {
    const glide = new Glide('#glide', { type: 'carousel', perView: 3, focusAt: 'center' }).mount()

    expect(reads).toBe(1)

    glide.destroy()
  })

  test('moving should not measure the track', () => {
    const glide = new Glide('#glide', { type: 'carousel', perView: 3, focusAt: 'center' }).mount()

    reads = 0
    glide.go('>')
    glide.move(-40)

    expect(reads).toBe(0)

    glide.destroy()
  })

  test('a change in the track width should measure the track once', () => {
    const { track } = query(document)
    const glide = new Glide('#glide', { type: 'carousel', perView: 3 }).mount()

    reads = 0
    width = 900
    resizeElement(track, 900)

    expect(reads).toBe(1)

    glide.destroy()
  })

  test('a window resize that leaves the track width unchanged should not lay out again', () => {
    const { track } = query(document)
    const glide = new Glide('#glide', { type: 'carousel', perView: 3 }).mount()
    const onResize = vi.fn()

    glide.on('resize', onResize)

    reads = 0
    window.dispatchEvent(new Event('resize'))
    resizeElement(track, 1000)

    expect(reads).toBe(0)
    expect(onResize).not.toHaveBeenCalled()

    glide.destroy()
  })

  test('a slider mounted while hidden should lay out once it is shown', () => {
    const { track, slides } = query(document)

    width = 0

    const glide = new Glide('#glide').mount()

    width = 1000
    resizeElement(track, 1000)

    // One slide per view, minus nothing: no peek and a single slide has no gaps
    expect(slides[0].style.width).toBe('1000px')

    glide.destroy()
  })

  test('updating should measure the track once', () => {
    const glide = new Glide('#glide', { type: 'carousel', perView: 3 }).mount()

    reads = 0
    glide.update({ gap: 12 })

    expect(reads).toBe(1)

    glide.destroy()
  })
})
