import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition, sleep } from '../fixtures/transition'

import defaults from '../../src/defaults'
import Glide from '../../entry/entry-complete'

describe('Accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  describe('clones', () => {
    test('should be hidden from assistive technology', () => {
      const glide = new Glide('#glide', { type: 'carousel' }).mount()
      const { clones } = query(document)

      expect(clones.length).toBeGreaterThan(0)

      clones.forEach((clone) => {
        expect(clone.getAttribute('aria-hidden')).toBe('true')
      })

      glide.destroy()
    })

    test('should keep their focusable content out of the tab order', () => {
      const { slides } = query(document)

      slides.forEach((slide) => {
        slide.innerHTML = '<a href="#">link</a><button>button</button>'
      })

      const glide = new Glide('#glide', { type: 'carousel' }).mount()
      const { clones } = query(document)

      clones.forEach((clone) => {
        clone.querySelectorAll('a, button').forEach((element) => {
          expect(element.getAttribute('tabindex')).toBe('-1')
        })
      })

      slides.forEach((slide) => {
        slide.querySelectorAll('a, button').forEach((element) => {
          expect(element.hasAttribute('tabindex')).toBe(false)
        })
      })

      glide.destroy()
    })
  })

  describe('arrows', () => {
    test('disabled arrows should be marked `aria-disabled`', () => {
      const { previousControls, nextControls } = query(document)
      const glide = new Glide('#glide', { rewind: false }).mount()

      previousControls.forEach((control) => {
        expect(control.getAttribute('aria-disabled')).toBe('true')
      })
      nextControls.forEach((control) => {
        expect(control.hasAttribute('aria-disabled')).toBe(false)
      })

      glide.go('>')

      previousControls.forEach((control) => {
        expect(control.hasAttribute('aria-disabled')).toBe(false)
      })

      glide.destroy()
    })

    test('should not stay disabled after destroying', () => {
      const { previousControls } = query(document)

      new Glide('#glide', { rewind: false }).mount().destroy()

      previousControls.forEach((control) => {
        expect(control.hasAttribute('aria-disabled')).toBe(false)
        expect(control.classList.contains(defaults.classes.arrow.disabled)).toBe(false)
      })
    })
  })

  describe('bullets', () => {
    test('the active bullet should be marked `aria-current`', async () => {
      const { bullets, root } = query(document)

      root.querySelector('.glide__bullets')?.setAttribute('data-glide-el', 'controls[nav]')

      const glide = new Glide('#glide').mount()

      expect(bullets[0].getAttribute('aria-current')).toBe('true')

      glide.go('=2')

      await afterTransition()

      expect(bullets[0].hasAttribute('aria-current')).toBe(false)
      expect(bullets[2].getAttribute('aria-current')).toBe('true')

      glide.destroy()

      bullets.forEach((bullet) => {
        expect(bullet.hasAttribute('aria-current')).toBe(false)
      })
    })
  })

  describe('with reduced motion preferred', () => {
    beforeEach(() => {
      window.matchMedia = ((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce')
      })) as unknown as typeof window.matchMedia
    })

    afterEach(() => {
      // @ts-expect-error restore jsdom, which has no `matchMedia`
      delete window.matchMedia
    })

    test('slides should change without animating', async () => {
      const { slides, wrapper } = query(document)
      const glide = new Glide('#glide').mount()

      glide.go('>')

      expect(wrapper.style.transition).toMatch(/^transform 0ms /)

      await sleep(10)

      expect(slides[1].classList.contains(defaults.classes.slide.active)).toBe(true)

      glide.destroy()
    })
  })

  describe('autoplay', () => {
    test('should pause while focus is inside the slider', async () => {
      const outside = document.body.appendChild(document.createElement('button'))
      const glide = new Glide('#glide', { autoplay: 60, animationDuration: 10 }).mount()

      ;(document.querySelector('[data-glide-dir=">"]') as HTMLElement).focus()

      await sleep(200)

      expect(glide.index).toBe(0)

      outside.focus()

      await sleep(200)

      expect(glide.index).toBeGreaterThan(0)

      glide.destroy()
    })

    test('should stay paused after a slide change while focus is inside', async () => {
      const glide = new Glide('#glide', { autoplay: 60, animationDuration: 10 }).mount()
      const next = document.querySelector('[data-glide-dir=">"]') as HTMLElement

      next.focus()
      next.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      await sleep(200)

      expect(glide.index).toBe(1)

      glide.destroy()
    })
  })
})
