import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition } from '../fixtures/transition'

import Glide from '../../entry/entry-complete'

describe('State attributes', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('`data-type` on the root element should be `slider` by default', () => {
    const { root } = query(document)

    new Glide('#glide').mount()

    expect(root.getAttribute('data-type')).toBe('slider')
  })

  test('`data-type` on the root element should follow the `type` option', () => {
    const { root } = query(document)

    new Glide('#glide', { type: 'carousel' }).mount()

    expect(root.getAttribute('data-type')).toBe('carousel')
  })

  test('`data-type` should change after updating the `type` option', () => {
    const { root } = query(document)

    const glide = new Glide('#glide').mount()

    glide.update({ type: 'carousel' })

    expect(root.getAttribute('data-type')).toBe('carousel')
  })

  test('`data-direction` on the root element should be `ltr` by default', () => {
    const { root } = query(document)

    new Glide('#glide').mount()

    expect(root.getAttribute('data-direction')).toBe('ltr')
  })

  test('`data-direction` on the root element should follow the `direction` option', () => {
    const { root } = query(document)

    new Glide('#glide', { direction: 'rtl' }).mount()

    expect(root.getAttribute('data-direction')).toBe('rtl')
  })

  test('`data-swipeable` should be set on the root element', () => {
    const { root } = query(document)

    new Glide('#glide').mount()

    expect(root.hasAttribute('data-swipeable')).toBe(true)
  })

  test('`data-active` should be set on the 0 indexed slide element by default', () => {
    const { slides } = query(document)

    new Glide('#glide').mount()

    expect(slides[0].hasAttribute('data-active')).toBe(true)
    expect(slides.filter((slide) => slide.hasAttribute('data-active'))).toHaveLength(1)
  })

  test('`data-active` should be set on the `startAt` indexed slide element', () => {
    const { slides } = query(document)

    new Glide('#glide', { startAt: 2 }).mount()

    expect(slides[2].hasAttribute('data-active')).toBe(true)
  })

  test('`data-active` should move to the new slide element after moving', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { startAt: 0 }).mount()

    glide.go('>')

    await afterTransition()

    expect(slides[0].hasAttribute('data-active')).toBe(false)
    expect(slides[1].hasAttribute('data-active')).toBe(true)
  })

  test('clones should be marked `data-clone` and never `data-active`', () => {
    new Glide('#glide', { type: 'carousel' }).mount()

    const { clones } = query(document)

    expect(clones.length).toBeGreaterThan(0)
    clones.forEach((clone) => {
      expect(clone.hasAttribute('data-active')).toBe(false)
    })
  })

  test('previous arrows should be `aria-disabled` at the start', () => {
    const { previousControls } = query(document)

    new Glide('#glide', { rewind: false }).mount()

    previousControls.forEach((control) => {
      expect(control.getAttribute('aria-disabled')).toBe('true')
    })
  })

  test('previous arrows should be enabled after moving away from the start', () => {
    const { previousControls } = query(document)

    const glide = new Glide('#glide', { rewind: false }).mount()

    glide.go('>')

    previousControls.forEach((control) => {
      expect(control.hasAttribute('aria-disabled')).toBe(false)
    })
  })

  test('previous arrows should be `aria-disabled` after navigating to the start', () => {
    const { previousControls } = query(document)

    const glide = new Glide('#glide', { rewind: false, startAt: 1 }).mount()

    glide.go('<')

    previousControls.forEach((control) => {
      expect(control.getAttribute('aria-disabled')).toBe('true')
    })
  })

  test('next arrows should be `aria-disabled` at the end', () => {
    const { nextControls, slides } = query(document)
    const length = slides.length - 1

    new Glide('#glide', { rewind: false, startAt: length }).mount()

    nextControls.forEach((control) => {
      expect(control.getAttribute('aria-disabled')).toBe('true')
    })
  })

  test('next arrows should be enabled after moving away from the end', () => {
    const { nextControls, slides } = query(document)
    const length = slides.length - 1

    const glide = new Glide('#glide', { rewind: false, startAt: length }).mount()

    glide.go('<')

    nextControls.forEach((control) => {
      expect(control.hasAttribute('aria-disabled')).toBe(false)
    })
  })

  test('next arrows should be `aria-disabled` after navigating to the end', () => {
    const { nextControls, slides } = query(document)
    const length = slides.length - 1

    const glide = new Glide('#glide', { rewind: false, startAt: length - 1 }).mount()

    glide.go('>')

    nextControls.forEach((control) => {
      expect(control.getAttribute('aria-disabled')).toBe('true')
    })
  })
})
