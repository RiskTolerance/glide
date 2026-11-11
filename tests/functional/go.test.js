import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition } from '../fixtures/transition'

import defaults from '../../src/defaults'
import Glide from '../../entry/entry-complete'

describe('Calling `go()` method with', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('invalid direction pattern should result in `warn()` message', async () => {
    const glide = new Glide('#glide')
    const fn = vi.fn()

    global.console = { error: fn }

    glide.mount().go('??')

    await afterTransition()

    expect(fn).toHaveBeenCalled()
  })

  test('go() should wait for transition end', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0 }).mount()

    glide.go('>')
    glide.go('>')
    glide.go('>')

    await afterTransition()

    expect(slides[1].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('go() should not wait for transition when configured', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0, waitForTransition: false }).mount()

    glide.go('>')
    glide.go('>')
    glide.go('>')

    await afterTransition()

    expect(slides[3].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`>` should move one slide forward', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0 }).mount()

    glide.go('>')

    await afterTransition()

    expect(slides[1].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`<` should move one slide backward', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 1 }).mount()

    glide.go('<')

    await afterTransition()

    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`>>` should rewind to the last slide', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0 }).mount()

    glide.go('>>')

    await afterTransition()

    expect(slides[slides.length - 1].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`<<` should rewind to the first slide', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: slides.length - 1 }).mount()

    glide.go('<<')

    await afterTransition()

    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`={i}` should move to specified slide', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0 }).mount()

    glide.go('=2')

    await afterTransition()

    expect(slides[2].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|>` should go to the next viewport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0, perView: 3 }).mount()

    glide.go('|>')

    await afterTransition()

    expect(slides[3].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|>` should go to the next viewport when active slide is not first on current viewport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 1, perView: 3 }).mount()

    glide.go('|>')

    await afterTransition()

    expect(slides[3].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|<` should go to the previous viewport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 3, perView: 3 }).mount()

    glide.go('|<')

    await afterTransition()

    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|<` should go to the previous viewport when active slide is not first on current viewport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 3, perView: 3 }).mount()

    glide.go('|<')

    await afterTransition()

    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|>` should not change viewport when rewind is disabled, moving forward and we on the last viewport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', {
      startAt: slides.length - 1,
      perView: 3,
      rewind: false
    }).mount()

    glide.go('|>')

    await afterTransition()

    expect(slides[slides.length - 1].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|<` should not change viewport when rewind is disabled, moving backward and we on the first viewport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', {
      startAt: 0,
      perView: 3,
      rewind: false
    }).mount()

    glide.go('|<')

    await afterTransition()

    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|>` should change to the first viewport when moving forward and we are on the last vievport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', {
      startAt: slides.length - 1,
      perView: 3
    }).mount()

    glide.go('|>')

    await afterTransition()

    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('`|<` should change to the last viewport when moving backward and we are on the first vievport', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', {
      startAt: 0,
      perView: 3
    }).mount()

    glide.go('|<')

    await afterTransition()

    expect(slides[slides.length - 1].classList.contains(defaults.classes.slide.active)).toBe(true)
  })
})
