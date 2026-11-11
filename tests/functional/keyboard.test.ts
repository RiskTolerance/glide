import html from '../fixtures/html'

import Glide from '../../entry/entry-complete'

function press (target: EventTarget, code: string): void {
  target.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }))
}

describe('Keyboard', () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('arrow keys should move the slider', () => {
    const glide = new Glide('#glide').mount()

    press(document.body, 'ArrowRight')

    expect(glide.index).toBe(1)

    glide.destroy()
  })

  test.each(['input', 'textarea', 'select'])('arrow keys typed into a `<%s>` should be ignored', (tag) => {
    const glide = new Glide('#glide').mount()
    const field = document.body.appendChild(document.createElement(tag))

    press(field, 'ArrowRight')

    expect(glide.index).toBe(0)

    glide.destroy()
  })

  test('arrow keys typed into a contenteditable element should be ignored', () => {
    const glide = new Glide('#glide').mount()
    const editor = document.body.appendChild(document.createElement('div'))
    const paragraph = editor.appendChild(document.createElement('p'))

    editor.setAttribute('contenteditable', 'true')

    press(paragraph, 'ArrowRight')

    expect(glide.index).toBe(0)

    glide.destroy()
  })
})
