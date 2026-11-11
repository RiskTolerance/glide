/**
 * Finds siblings nodes of the passed node.
 */
export function siblings (node: Element | null | undefined): Element[] {
  if (node && node.parentNode) {
    let n = node.parentNode.firstChild
    const matched: Element[] = []

    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== node) {
        matched.push(n as Element)
      }
    }

    return matched
  }

  return []
}
