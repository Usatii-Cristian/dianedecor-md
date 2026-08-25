/** Romanian diacritics, including the legacy cedilla forms Windows still emits. */
const DIACRITICS = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  ş: 's',
  ț: 't',
  ţ: 't',
}

/**
 * Turns a Romanian title into a URL slug: "Nuntă Ana & Roman, Chișinău"
 * becomes "nunta-ana-roman-chisinau".
 */
export function slugify(value) {
  if (typeof value !== 'string') return ''

  return value
    .toLowerCase()
    .replace(/[ăâîșşțţ]/g, (character) => DIACRITICS[character] ?? character)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Appends -2, -3 … until the slug is not in `taken`, so renaming a project
 * never silently overwrites another one.
 */
export function uniqueSlug(value, taken) {
  const base = slugify(value)
  if (!base) return ''
  if (!taken.includes(base)) return base

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${base}-${suffix}`
    if (!taken.includes(candidate)) return candidate
  }

  return `${base}-${Date.now()}`
}
