import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { nextFrame } from '../fixtures/transition'

import defaults from '../../src/defaults'
import Glide from '../../entry/entry-complete'

interface PointerInit {
  x: number
  y: number
  pointerType?: string
  pointerId?: number
  isPrimary?: boolean
}

function pointer (target: HTMLElement, type: string, { x, y, pointerType = 'mouse', pointerId = 1, isPrimary = true }: PointerInit): void {
  target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerType, pointerId, isPrimary, bubbles: true }))
}

describe('Swipe', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('a drag shallower than `touchAngle` should move the track', async () => {
    const { root, wrapper } = query(document)
    const glide = new Glide('#glide', { touchAngle: 30 }).mount()

    // 100px right and 40px down is ~21.8deg from horizontal
    pointer(wrapper, 'pointerdown', { x: 0, y: 0 })
    pointer(wrapper, 'pointermove', { x: 100, y: 40 })

    await nextFrame()

    expect(root.classList.contains(defaults.classes.dragging)).toBe(true)

    pointer(wrapper, 'pointerup', { x: 100, y: 40 })
    glide.destroy()
  })

  test('a drag steeper than `touchAngle` should not move the track', async () => {
    const { root, wrapper } = query(document)
    const glide = new Glide('#glide', { touchAngle: 30 }).mount()

    // 40px right and 100px down is ~68.2deg from horizontal
    pointer(wrapper, 'pointerdown', { x: 0, y: 0 })
    pointer(wrapper, 'pointermove', { x: 40, y: 100 })

    await nextFrame()

    expect(root.classList.contains(defaults.classes.dragging)).toBe(false)

    pointer(wrapper, 'pointerup', { x: 40, y: 100 })
    glide.destroy()
  })

  test('several moves within one frame should move the track once, to the latest position', async () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide').mount()
    const onMove = vi.fn()

    glide.on('swipe.move', onMove)

    pointer(wrapper, 'pointerdown', { x: 0, y: 0 })
    pointer(wrapper, 'pointermove', { x: 100, y: 10 })
    pointer(wrapper, 'pointermove', { x: 120, y: 10 })
    pointer(wrapper, 'pointermove', { x: 140, y: 10 })

    await nextFrame()

    expect(onMove).toHaveBeenCalledTimes(1)
    // `touchRatio` defaults to 0.5
    expect(glide._c.Move.offset).toBe(70)

    pointer(wrapper, 'pointerup', { x: 140, y: 10 })
    glide.destroy()
  })

  test('horizontal drag moves should not bubble past the track', () => {
    const { root, wrapper } = query(document)
    const glide = new Glide('#glide').mount()
    const onRootMove = vi.fn()

    root.addEventListener('pointermove', onRootMove)

    pointer(wrapper, 'pointerdown', { x: 0, y: 0 })
    pointer(wrapper, 'pointermove', { x: 100, y: 10 })
    pointer(wrapper, 'pointermove', { x: 120, y: 10 })

    expect(onRootMove).not.toHaveBeenCalled()

    pointer(wrapper, 'pointerup', { x: 120, y: 10 })
    glide.destroy()
  })

  test('a touch swipe past `swipeThreshold` should change the slide', () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide', { swipeThreshold: 50, dragThreshold: 500 }).mount()
    const touch = { pointerType: 'touch', pointerId: 7 }

    pointer(wrapper, 'pointerdown', { x: 200, y: 0, ...touch })
    pointer(wrapper, 'pointermove', { x: 120, y: 0, ...touch })
    pointer(wrapper, 'pointerup', { x: 120, y: 0, ...touch })

    expect(glide.index).toBe(1)

    glide.destroy()
  })

  test('a mouse drag shorter than `dragThreshold` should not change the slide', () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide', { swipeThreshold: 50, dragThreshold: 500 }).mount()

    pointer(wrapper, 'pointerdown', { x: 200, y: 0 })
    pointer(wrapper, 'pointermove', { x: 120, y: 0 })
    pointer(wrapper, 'pointerup', { x: 120, y: 0 })

    expect(glide.index).toBe(0)

    glide.destroy()
  })

  test('`dragThreshold: false` should disable mouse dragging but keep touch swiping', () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide', { dragThreshold: false }).mount()
    const onStart = vi.fn()

    glide.on('swipe.start', onStart)

    pointer(wrapper, 'pointerdown', { x: 0, y: 0 })
    pointer(wrapper, 'pointerup', { x: 0, y: 0 })

    expect(onStart).not.toHaveBeenCalled()

    pointer(wrapper, 'pointerdown', { x: 0, y: 0, pointerType: 'touch' })
    pointer(wrapper, 'pointerup', { x: 0, y: 0, pointerType: 'touch' })

    expect(onStart).toHaveBeenCalledTimes(1)

    glide.destroy()
  })

  test('a second finger should not affect the swipe', () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide', { swipeThreshold: 50 }).mount()
    const first = { pointerType: 'touch', pointerId: 1 }
    const second = { pointerType: 'touch', pointerId: 2, isPrimary: false }

    pointer(wrapper, 'pointerdown', { x: 200, y: 0, ...first })
    pointer(wrapper, 'pointerdown', { x: 300, y: 0, ...second })
    pointer(wrapper, 'pointerup', { x: 300, y: 0, ...second })

    expect(glide.index).toBe(0)

    pointer(wrapper, 'pointermove', { x: 120, y: 0, ...first })
    pointer(wrapper, 'pointerup', { x: 120, y: 0, ...first })

    expect(glide.index).toBe(1)

    glide.destroy()
  })

  test('should let the browser scroll vertically when no stylesheet sets `touch-action`', () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide').mount()

    expect(wrapper.style.touchAction).toBe('pan-y')

    glide.destroy()

    expect(wrapper.style.touchAction).toBe('')
  })
})
