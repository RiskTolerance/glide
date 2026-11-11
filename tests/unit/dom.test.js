import { toArray, siblings } from '../../src/utils/dom'

describe('Function', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="parent">
        <div class="child"></div>
        <div class="child"></div>
        <div class="child"></div>
      </div>
    `
  })

  test('`siblings` should return siblings of the passed HTMLElements', () => {
    const children = document.querySelectorAll('.child')

    expect(siblings(children[1])).toHaveLength(2)
  })

  test('`toArray` should return an array with the same elements when passed a NodeList', () => {
    const children = document.querySelectorAll('.child')

    expect(children).toBeInstanceOf(NodeList)
    expect(Array.isArray(toArray(children))).toBe(true)
    toArray(children).forEach((child, i) => {
      expect(child).toEqual(children[i])
    })
  })
})
