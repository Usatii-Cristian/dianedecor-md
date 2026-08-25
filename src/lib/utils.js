import clsx from 'clsx'

/** Conditional class names. Thin alias so components import one helper. */
export function cn(...inputs) {
  return clsx(inputs)
}

/** Trims a string and caps its length before it reaches the database. */
export function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().replace(/[\r\n\t\f\v]+/g, ' ')
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

/** Truncates on a word boundary, for meta descriptions and message previews. */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`
}

/** MongoDB ObjectId shape check, used before hitting the database with an id. */
export function isValidObjectId(value) {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)
}
