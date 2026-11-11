import defaults from '../../src/defaults'

export function sleep (ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function afterTransition (): Promise<void> {
  return sleep(defaults.animationDuration + 10)
}

export function afterRewindTransition (): Promise<void> {
  return sleep(defaults.rewindDuration + 10)
}

export function nextFrame (): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}
