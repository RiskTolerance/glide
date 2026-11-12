import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { resizeElement } from '../fixtures/resize-observer'
import { afterTransition } from '../fixtures/transition'

import Glide from '../../entry/entry-complete'

describe('Glide initialized as `carousel`', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('should have a correct type', () => {
    const glide = new Glide('#glide', { type: 'carousel' }).mount()

    expect(glide.isType('carousel')).toBe(true)
  })

  test('should go to the last slide when we are on the first slide and moving backward', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', {
      type: 'carousel',
      startAt: 0
    }).mount()

    glide.go('<')

    await afterTransition()

    expect(slides[0].hasAttribute('data-active')).toBe(false)
    expect(slides[slides.length - 1].hasAttribute('data-active')).toBe(true)
  })

  test('should go to the first slide when we are on the last slide and moving forward', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', {
      type: 'carousel',
      startAt: slides.length - 1
    }).mount()

    glide.go('>')

    await afterTransition()

    expect(slides[slides.length - 1].hasAttribute('data-active')).toBe(false)
    expect(slides[0].hasAttribute('data-active')).toBe(true)
  })

  test('with odd number of `perView` slides should create sufficient cloning buffer', async () => {
    const glide = new Glide('#glide', {
      type: 'carousel',
      perView: 3
    })

    const built = new Promise((resolve) => glide.on('build.after', resolve))

    glide.mount()
    await built

    const { clones } = query(document)

    expect(clones.length).toBe(10)
  })

  test('with even number of `perView` slides should create sufficient cloning buffer', async () => {
    const glide = new Glide('#glide', {
      type: 'carousel',
      perView: 2
    })

    const built = new Promise((resolve) => glide.on('build.after', resolve))

    glide.mount()
    await built

    const { clones } = query(document)

    expect(clones.length).toBe(6)
  })

  test('with even number of `perView` slides should create cloning buffer advanced by `cloningRatio`', async () => {
    const glide = new Glide('#glide', {
      type: 'carousel',
      perView: 2,
      cloningRatio: 2
    })

    const built = new Promise((resolve) => glide.on('build.after', resolve))

    glide.mount()
    await built

    const { clones } = query(document)

    expect(clones.length).toBe(12)
  })

  test('a width change should keep the same clones', () => {
    const glide = new Glide('#glide', { type: 'carousel', perView: 3 }).mount()
    const { track, clones } = query(document)

    resizeElement(track, 900)

    expect(query(document).clones).toEqual(clones)
    query(document).clones.forEach((clone, i) => {
      expect(clone).toBe(clones[i])
    })

    glide.destroy()
  })
})
