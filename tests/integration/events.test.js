import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition, afterRewindTransition } from '../fixtures/transition'

import Glide from '../../entry/entry-complete'

describe("Event's callbacks on", () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('passed as array should be called only once', () => {
    const glide = new Glide('#glide')

    const callback = jest.fn()

    glide.on(['mount.before'], callback)

    glide.mount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('`mount.*` should be called', () => {
    const glide = new Glide('#glide')

    const beforeCallback = jest.fn()
    const afterCallback = jest.fn()

    glide.on('mount.before', beforeCallback)
    glide.on('mount.after', afterCallback)

    glide.mount()

    expect(beforeCallback).toHaveBeenCalled()
    expect(afterCallback).toHaveBeenCalled()
  })

  test('`update` should be called', () => {
    const glide = new Glide('#glide')

    const updateCallback = jest.fn()

    glide.on('update', updateCallback)

    glide.mount().update()

    expect(updateCallback).toHaveBeenCalled()
  })

  test('`play` should be called', () => {
    const glide = new Glide('#glide')

    const playCallback = jest.fn()

    glide.on('play', playCallback)

    glide.mount().play()

    expect(playCallback).toHaveBeenCalled()
  })

  test('`pause` should be called', () => {
    const glide = new Glide('#glide')

    const pauseCallback = jest.fn()

    glide.on('pause', pauseCallback)

    glide.mount().pause()

    expect(pauseCallback).toHaveBeenCalled()
  })

  test('`build.*` should be called', () => {
    const glide = new Glide('#glide')

    const beforeCallback = jest.fn()
    const afterCallback = jest.fn()

    glide.on('build.before', beforeCallback)
    glide.on('build.after', afterCallback)

    glide.mount()

    expect(beforeCallback).toHaveBeenCalled()
    expect(afterCallback).toHaveBeenCalled()
  })

  test('`run` should be called with `move` parameter', () => {
    const glide = new Glide('#glide')

    const move = { direction: '=', steps: 1 }
    const runCallback = jest.fn()

    glide.on('run', runCallback)

    glide.mount().go('=1')

    expect(runCallback).toHaveBeenCalledWith(move)
  })

  test('`run.before` should be called with `move` parameter', () => {
    const glide = new Glide('#glide')

    const move = { direction: '=', steps: 1 }
    const beforeCallback = jest.fn()

    glide.on('run.before', beforeCallback)

    glide.mount().go('=1')

    expect(beforeCallback).toHaveBeenCalledWith(move)
  })

  test('`run.after` should be called with `move` parameter', (done) => {
    const glide = new Glide('#glide')

    const move = { direction: '=', steps: 1 }
    const afterCallback = jest.fn()

    glide.on('run.after', afterCallback)

    glide.mount().go('=1')

    expect(afterCallback).not.toHaveBeenCalled()
    afterTransition(() => {
      expect(afterCallback).toHaveBeenCalledWith(move)

      done()
    })
  })

  test('`run.offset` should be called with `move` parameter when changing slide from first to the last one', (done) => {
    const glide = new Glide('#glide', { startAt: 0 })

    const move = { direction: '<', steps: 0 }
    const offsetCallback = jest.fn()

    glide.on('run.offset', offsetCallback)

    glide.mount().go('<')

    expect(offsetCallback).not.toHaveBeenCalled()
    afterRewindTransition(() => {
      expect(offsetCallback).toHaveBeenCalledWith(move)

      done()
    })
  })

  test('`run.offset` should be called with `move` parameter when changing slide from last to the first one', (done) => {
    const { slides } = query(document)
    const glide = new Glide('#glide', { startAt: slides.length - 1 })

    const move = { direction: '>', steps: 0 }
    const offsetCallback = jest.fn()

    glide.on('run.offset', offsetCallback)

    glide.mount().go('>')

    expect(offsetCallback).not.toHaveBeenCalled()
    afterRewindTransition(() => {
      expect(offsetCallback).toHaveBeenCalledWith(move)

      done()
    })
  })

  test('`run.start` should be called with `move` parameter when changing to the first slide', (done) => {
    const glide = new Glide('#glide', { startAt: 1 })

    const move = { direction: '<', steps: '<' }
    const startCallback = jest.fn()

    glide.on('run.start', startCallback)

    glide.mount().go('<<')

    expect(startCallback).not.toHaveBeenCalled()
    afterTransition(() => {
      expect(startCallback).toHaveBeenCalledWith(move)

      done()
    })
  })

  test('`run.end` should be called with `move` parameter when changing to the first slide', (done) => {
    const glide = new Glide('#glide', { startAt: 1 })

    const move = { direction: '>', steps: '>' }
    const endCallback = jest.fn()

    glide.on('run.end', endCallback)

    glide.mount().go('>>')

    expect(endCallback).not.toHaveBeenCalled()
    afterTransition(() => {
      expect(endCallback).toHaveBeenCalledWith(move)

      done()
    })
  })

  test('`autoplay` should be called on each autoplay slide change', (done) => {
    const glide = new Glide('#glide', { autoplay: 50 })

    const autoplayCallback = jest.fn()

    glide.on('autoplay', autoplayCallback)

    glide.mount()

    expect(autoplayCallback).not.toHaveBeenCalled()
    setTimeout(() => {
      expect(autoplayCallback).toHaveBeenCalledTimes(2)

      done()
    }, 110)
  })

  test('`translate.jump` should be called when making a loop change', (done) => {
    const glide = new Glide('#glide', { type: 'carousel' })

    const jumpCallback = jest.fn()

    glide.on('translate.jump', jumpCallback)

    glide.mount().go('<')

    expect(jumpCallback).not.toHaveBeenCalled()
    afterTransition(() => {
      expect(jumpCallback).toHaveBeenCalled()

      done()
    })
  })

  test('`translate.jump` should be called when making a loop change', (done) => {
    const { slides } = query(document)
    const glide = new Glide('#glide', { type: 'carousel', startAt: slides.length - 1 })

    const jumpCallback = jest.fn()

    glide.on('translate.jump', jumpCallback)

    glide.mount().go('>')

    expect(jumpCallback).not.toHaveBeenCalled()
    afterTransition(() => {
      expect(jumpCallback).toHaveBeenCalled()

      done()
    })
  })
})
