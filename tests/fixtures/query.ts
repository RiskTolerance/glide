const ROOT_SELECTOR = '.glide'
const CLONE_CLASS = 'glide__slide--clone'
const TRACK_SELECTOR = '[data-glide-el="track"]'
const BULLETS_SELECTOR = '[data-glide-dir*="="]'
const PREVIOUS_CONTROLS_SELECTOR = '[data-glide-dir*="<"]'
const NEXT_CONTROLS_SELECTOR = '[data-glide-dir*=">"]'

export function query (document: Document) {
  const root = document.querySelector(ROOT_SELECTOR) as HTMLElement
  const track = root.querySelector(TRACK_SELECTOR) as HTMLElement
  const wrapper = track.children[0] as HTMLElement

  const bullets = root.querySelectorAll<HTMLElement>(BULLETS_SELECTOR)
  const previousControls = root.querySelectorAll<HTMLElement>(PREVIOUS_CONTROLS_SELECTOR)
  const nextControls = root.querySelectorAll<HTMLElement>(NEXT_CONTROLS_SELECTOR)
  const slides = (Array.from(wrapper.children) as HTMLElement[]).filter((slide) => {
    return !slide.classList.contains(CLONE_CLASS)
  })
  const clones = (Array.from(wrapper.children) as HTMLElement[]).filter((slide) => {
    return slide.classList.contains(CLONE_CLASS)
  })

  return {
    root,
    track,
    wrapper,
    slides,
    clones,
    bullets,
    previousControls,
    nextControls
  }
}
