import html from '../fixtures/html'
import { sleep } from '../fixtures/transition'

import Glide from '../../entry/entry-complete'

// jsdom has no `matchMedia`, so emulate `(max-width: Npx)` queries
// against a viewport width the tests control.
let viewport = 1024

function resizeTo (width: number): void {
  viewport = width
  window.dispatchEvent(new Event('resize'))
}

describe('Breakpoints', () => {
  beforeEach(() => {
    document.body.innerHTML = html
    viewport = 1024

    window.matchMedia = ((query: string) => {
      const max = /max-width:\s*(\d+)px/.exec(query)

      return { matches: max ? viewport <= Number(max[1]) : false }
    }) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    // @ts-expect-error restore jsdom, which has no `matchMedia`
    delete window.matchMedia
  })

  test('should apply the matching breakpoint at mount', () => {
    viewport = 600

    const glide = new Glide('#glide', { perView: 3, breakpoints: { 800: { perView: 1 } } }).mount()

    expect(glide.settings.perView).toBe(1)

    glide.destroy()
  })

  test('should restore the options when leaving a breakpoint', async () => {
    viewport = 600

    const glide = new Glide('#glide', { perView: 3, breakpoints: { 800: { perView: 1 } } }).mount()

    await sleep(20)
    resizeTo(1024)

    expect(glide.settings.perView).toBe(3)

    glide.destroy()
  })

  test('`update()` options should survive a window resize', async () => {
    const glide = new Glide('#glide', { perView: 3 }).mount()

    glide.update({ perView: 2 })

    await sleep(20)
    resizeTo(1000)

    expect(glide.settings.perView).toBe(2)

    glide.destroy()
  })

  test('`update()` options should survive crossing breakpoints', async () => {
    const glide = new Glide('#glide', { perView: 3, breakpoints: { 800: { perView: 1 } } }).mount()

    glide.update({ gap: 20 })

    await sleep(20)
    resizeTo(600)

    expect(glide.settings.perView).toBe(1)
    expect(glide.settings.gap).toBe(20)

    await sleep(20)
    resizeTo(1024)

    expect(glide.settings.perView).toBe(3)
    expect(glide.settings.gap).toBe(20)

    glide.destroy()
  })

  test('breakpoints passed to `update()` should apply from the next resize', async () => {
    viewport = 600

    const glide = new Glide('#glide', { perView: 3 }).mount()

    glide.update({ breakpoints: { 800: { perView: 2 } } })

    await sleep(20)
    resizeTo(600)

    expect(glide.settings.perView).toBe(2)

    glide.destroy()
  })

  test('crossing a breakpoint should lay the slider out again', async () => {
    const glide = new Glide('#glide', { perView: 3, breakpoints: { 800: { perView: 1 } } }).mount()
    const onResize = vi.fn()

    glide.on('resize', onResize)

    await sleep(20)
    resizeTo(1000)

    expect(onResize).not.toHaveBeenCalled()

    await sleep(20)
    resizeTo(600)

    expect(onResize).toHaveBeenCalledTimes(1)

    glide.destroy()
  })
})
