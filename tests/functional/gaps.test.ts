import html from '../fixtures/html'
import { query } from '../fixtures/query'

import Glide from '../../entry/entry-complete'

describe('Gaps', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('should be set once on the slides wrapper, not on every slide', () => {
    const { wrapper, slides } = query(document)
    const glide = new Glide('#glide', { gap: 16 }).mount()

    expect(wrapper.style.gap).toBe('16px')

    slides.forEach((slide) => {
      expect(slide.style.marginLeft).toBe('')
      expect(slide.style.marginRight).toBe('')
    })

    glide.destroy()
  })

  test('should follow `update()`', () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide', { gap: 16 }).mount()

    glide.update({ gap: 24 })

    expect(wrapper.style.gap).toBe('24px')

    glide.destroy()
  })
})
