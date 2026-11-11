/**
 * Converts value entered as number
 * or string to integer value.
 */
export function toInt (value: unknown): number {
  return parseInt(value as string)
}

/**
 * Converts value entered as number
 * or string to flat value.
 */
export function toFloat (value: unknown): number {
  return parseFloat(value as string)
}

/**
 * Indicates whether the specified value is a string.
 */
export function isString (value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Indicates whether the specified value is an object.
 *
 * @see https://github.com/jashkenas/underscore
 */
export function isObject (value: unknown): value is object {
  const type = typeof value

  return type === 'function' || (type === 'object' && !!value)
}

/**
 * Indicates whether the specified value is a number.
 */
export function isNumber (value: unknown): value is number {
  return typeof value === 'number'
}

/**
 * Indicates whether the specified value is a function.
 */
export function isFunction (value: unknown): value is (...args: any[]) => unknown {
  return typeof value === 'function'
}

/**
 * Indicates whether the specified value is undefined.
 */
export function isUndefined (value: unknown): value is undefined {
  return typeof value === 'undefined'
}

/**
 * Indicates whether the specified value is an array.
 */
export function isArray (value: unknown): value is unknown[] {
  return (value as { constructor: unknown }).constructor === Array
}
