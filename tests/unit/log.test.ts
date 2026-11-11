import { warn } from '../../src/utils/log'

describe('Warn should', () => {
  test('log an error to the console with suffix', () => {
    const fn = vi.fn()
    const msg = 'Message content'

    vi.spyOn(console, 'error').mockImplementation(fn)

    warn(msg)

    expect(fn).toHaveBeenCalledWith(`[Glide warn]: ${msg}`)
  })
})
