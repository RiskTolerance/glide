import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition, sleep } from '../fixtures/transition'

import Glide from '../../entry/entry-complete'

describe('After destroying an instance', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('the root element should not keep its state attributes', () => {
    const { root } = query(document)

    new Glide('#glide', { type: 'carousel', direction: 'rtl' }).mount().destroy()

    for (const name of ['data-type', 'data-direction', 'data-swipeable', 'data-dragging']) {
      expect(root.hasAttribute(name)).toBe(false)
    }
  })

  test('no slide element should stay marked `data-active`', () => {
    const { slides } = query(document)

    new Glide('#glide').mount().destroy()

    for (let i = 0; i < slides.length; i++) {
      expect(slides[i].hasAttribute('data-active')).toBe(false)
    }
  })

  test('should remove the gap from the slides wrapper', async () => {
    const { wrapper } = query(document)
    const glide = new Glide('#glide').mount()

    glide.update({ gap: 20 })
    glide.destroy()

    expect(wrapper.style.gap).toBe('')

    await sleep(60)

    expect(wrapper.style.gap).toBe('')
  })

  test('an in-flight move should not mark a slide active after destroying', async () => {
    const { slides } = query(document)
    const glide = new Glide('#glide').mount()

    glide.go('>')
    glide.destroy()

    await afterTransition()

    for (let i = 0; i < slides.length; i++) {
      expect(slides[i].hasAttribute('data-active')).toBe(false)
    }

    expect(glide.disabled).toBe(false)
  })
})
