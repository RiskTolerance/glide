import html from '../fixtures/html'

import Glide from '../../entry/entry-complete'

function control (direction: string): HTMLElement {
  return document.querySelector(`[data-glide-dir="${direction}"]`) as HTMLElement
}

function click (direction: string): void {
  control(direction).dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('Controls', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('a tap (`touchstart` followed by `click`) should move one slide', () => {
    const glide = new Glide('#glide', { waitForTransition: false }).mount()

    control('>').dispatchEvent(new Event('touchstart', { bubbles: true }))
    control('>').dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(glide.index).toBe(1)

    glide.destroy()
  })

  describe('in `rtl` mode', () => {
    test('`>` should move one slide backward', () => {
      const glide = new Glide('#glide', { direction: 'rtl', startAt: 1 }).mount()

      click('>')

      expect(glide.index).toBe(0)

      glide.destroy()
    })

    test('`|<` should move one viewport forward', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const glide = new Glide('#glide', { direction: 'rtl', perView: 3 }).mount()

      click('|<')

      expect(glide.index).toBe(3)
      expect(error).not.toHaveBeenCalled()

      error.mockRestore()
      glide.destroy()
    })

    test('`|>` should move one viewport backward', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const glide = new Glide('#glide', { direction: 'rtl', perView: 3, startAt: 3 }).mount()

      click('|>')

      expect(glide.index).toBe(0)
      expect(error).not.toHaveBeenCalled()

      error.mockRestore()
      glide.destroy()
    })
  })
})
