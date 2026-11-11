import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition, sleep } from '../fixtures/transition'

import defaults from '../../src/defaults'
import Glide from '../../entry/entry-complete'

describe('Glide initialized with `autoplay`', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('as `Number` should move to the next slide after defined interval', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { autoplay: 500 }).mount()

    await sleep(500)
    await afterTransition()

    expect(glide.index).toBe(1)
    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(false)
    expect(slides[1].classList.contains(defaults.classes.slide.active)).toBe(true)
  })

  test('as `false` should not move to the next slide', async () => {
    const { slides } = query(document)

    const glide = new Glide('#glide', { autoplay: false }).mount()

    await sleep(500)
    await afterTransition()

    expect(glide.index).toBe(0)
    expect(slides[0].classList.contains(defaults.classes.slide.active)).toBe(true)
    expect(slides[1].classList.contains(defaults.classes.slide.active)).toBe(false)
  })
})
