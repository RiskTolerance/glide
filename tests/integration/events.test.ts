import html from '../fixtures/html'
import { query } from '../fixtures/query'
import { afterTransition, afterRewindTransition, sleep } from '../fixtures/transition'

import Glide from '../../entry/entry-complete'

describe("Event's callbacks on", () => {
  beforeEach(() => {
    document.body.innerHTML = html
  })

  test('passed as array should be called only once', () => {
    const glide = new Glide('#glide')

    const callback = vi.fn()

    glide.on(['mount.before'], callback)

    glide.mount()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('`mount.*` should be called', () => {
    const glide = new Glide('#glide')

    const beforeCallback = vi.fn()
    const afterCallback = vi.fn()

    glide.on('mount.before', beforeCallback)
    glide.on('mount.after', afterCallback)

    glide.mount()

    expect(beforeCallback).toHaveBeenCalled()
    expect(afterCallback).toHaveBeenCalled()
  })

  test('`update` should be called', () => {
    const glide = new Glide('#glide')

    const updateCallback = vi.fn()

    glide.on('update', updateCallback)

    glide.mount().update()

    expect(updateCallback).toHaveBeenCalled()
  })

  test('`play` should be called', () => {
    const glide = new Glide('#glide')

    const playCallback = vi.fn()

    glide.on('play', playCallback)

    glide.mount().play()

    expect(playCallback).toHaveBeenCalled()
  })

  test('`pause` should be called', () => {
    const glide = new Glide('#glide')

    const pauseCallback = vi.fn()

    glide.on('pause', pauseCallback)

    glide.mount().pause()

    expect(pauseCallback).toHaveBeenCalled()
  })

  test('`build.*` should be called', () => {
    const glide = new Glide('#glide')

    const beforeCallback = vi.fn()
    const afterCallback = vi.fn()

    glide.on('build.before', beforeCallback)
    glide.on('build.after', afterCallback)

    glide.mount()

    expect(beforeCallback).toHaveBeenCalled()
    expect(afterCallback).toHaveBeenCalled()
  })

  test('`run` should be called with `move` parameter', () => {
    const glide = new Glide('#glide')

    const move = { direction: '=', steps: 1 }
    const runCallback = vi.fn()

    glide.on('run', runCallback)

    glide.mount().go('=1')

    expect(runCallback).toHaveBeenCalledWith(move)
  })

  test('`run.before` should be called with `move` parameter', () => {
    const glide = new Glide('#glide')

    const move = { direction: '=', steps: 1 }
    const beforeCallback = vi.fn()

    glide.on('run.before', beforeCallback)

    glide.mount().go('=1')

    expect(beforeCallback).toHaveBeenCalledWith(move)
  })

  test('`run.after` should be called with `move` parameter', async () => {
    const glide = new Glide('#glide')

    const move = { direction: '=', steps: 1 }
    const afterCallback = vi.fn()

    glide.on('run.after', afterCallback)

    glide.mount().go('=1')

    expect(afterCallback).not.toHaveBeenCalled()
    await afterTransition()

    expect(afterCallback).toHaveBeenCalledWith(move)
  })

  test('`run.offset` should be called with `move` parameter when changing slide from first to the last one', async () => {
    const glide = new Glide('#glide', { startAt: 0 })

    const move = { direction: '<', steps: 0 }
    const offsetCallback = vi.fn()

    glide.on('run.offset', offsetCallback)

    glide.mount().go('<')

    expect(offsetCallback).not.toHaveBeenCalled()
    await afterRewindTransition()

    expect(offsetCallback).toHaveBeenCalledWith(move)
  })

  test('`run.offset` should be called with `move` parameter when changing slide from last to the first one', async () => {
    const { slides } = query(document)
    const glide = new Glide('#glide', { startAt: slides.length - 1 })

    const move = { direction: '>', steps: 0 }
    const offsetCallback = vi.fn()

    glide.on('run.offset', offsetCallback)

    glide.mount().go('>')

    expect(offsetCallback).not.toHaveBeenCalled()
    await afterRewindTransition()

    expect(offsetCallback).toHaveBeenCalledWith(move)
  })

  test('`run.start` should be called with `move` parameter when changing to the first slide', async () => {
    const glide = new Glide('#glide', { startAt: 1 })

    const move = { direction: '<', steps: '<' }
    const startCallback = vi.fn()

    glide.on('run.start', startCallback)

    glide.mount().go('<<')

    expect(startCallback).not.toHaveBeenCalled()
    await afterTransition()

    expect(startCallback).toHaveBeenCalledWith(move)
  })

  test('`run.end` should be called with `move` parameter when changing to the first slide', async () => {
    const glide = new Glide('#glide', { startAt: 1 })

    const move = { direction: '>', steps: '>' }
    const endCallback = vi.fn()

    glide.on('run.end', endCallback)

    glide.mount().go('>>')

    expect(endCallback).not.toHaveBeenCalled()
    await afterTransition()

    expect(endCallback).toHaveBeenCalledWith(move)
  })

  test('`autoplay` should be called on each autoplay slide change', async () => {
    const glide = new Glide('#glide', { autoplay: 50 })

    const autoplayCallback = vi.fn()

    glide.on('autoplay', autoplayCallback)

    glide.mount()

    expect(autoplayCallback).not.toHaveBeenCalled()
    await sleep(110)

    expect(autoplayCallback).toHaveBeenCalledTimes(2)
  })

  test('`translate.jump` should be called when making a loop change', async () => {
    const glide = new Glide('#glide', { type: 'carousel' })

    const jumpCallback = vi.fn()

    glide.on('translate.jump', jumpCallback)

    glide.mount().go('<')

    expect(jumpCallback).not.toHaveBeenCalled()
    await afterTransition()

    expect(jumpCallback).toHaveBeenCalled()
  })

  test('`translate.jump` should be called when making a loop change', async () => {
    const { slides } = query(document)
    const glide = new Glide('#glide', { type: 'carousel', startAt: slides.length - 1 })

    const jumpCallback = vi.fn()

    glide.on('translate.jump', jumpCallback)

    glide.mount().go('>')

    expect(jumpCallback).not.toHaveBeenCalled()
    await afterTransition()

    expect(jumpCallback).toHaveBeenCalled()
  })
})
