import defaults from '../../src/defaults'

export function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function afterTransition () {
  return sleep(defaults.animationDuration + 10)
}

export function afterRewindTransition () {
  return sleep(defaults.rewindDuration + 10)
}
