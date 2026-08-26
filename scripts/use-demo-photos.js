/**
 * Swaps the image paths in `src/lib/content.js` for Unsplash photographs, so the
 * site can be reviewed with real pictures before the studio delivers its own.
 *
 *   node scripts/use-demo-photos.js          # pune fotografiile Unsplash
 *   node scripts/use-demo-photos.js --revert # revine la placeholder-ele locale
 *
 * These are stand-ins under the Unsplash licence, not DianeDecor's work. They
 * must be replaced before launch: run `--revert`, then drop the studio's files
 * into `public/images/` following `public/images/README.md`.
 *
 * The swap happens in the three path helpers at the bottom of `content.js`, so
 * nothing else in the codebase knows the difference.
 */

import { readFile, writeFile } from 'node:fs/promises'

const CONTENT = 'src/lib/content.js'
const MARKER = '/* demo-photos */'

/** Verified Unsplash photo ids, grouped by the category they suit. */
const PHOTOS = `const DEMO_PHOTOS = {
  nunti: [
    '1519741497674-611481863552',
    '1478146896981-b80fe463b330',
    '1532712938310-34cb3982ef74',
    '1465495976277-4387d4b0b4c6',
    '1511285560929-80b456fea0bc',
  ],
  cumetrii: ['1530103862676-de8c9debad1d', '1513151233558-d860c5398176', '1481487196290-c152efe083f5'],
  'cerere-in-casatorie': ['1465495976277-4387d4b0b4c6', '1519671482749-fd09be7ccebf', '1543589077-47d81606c1bf'],
  aniversari: ['1530103862676-de8c9debad1d', '1533174072545-7a4b6ad7a6c3', '1481487196290-c152efe083f5'],
  'cununie-in-aer-liber': ['1522673607200-164d1b6ce486', '1478146896981-b80fe463b330', '1449824913935-59a10b8d2000'],
  'decor-de-craciun': ['1512389142860-9c449e58a543', '1482517967863-00e15c9b44be', '1607344645866-009c320b63e0'],
  'evenimente-corporative': ['1464366400600-7168b8af9bc3', '1511285560929-80b456fea0bc', '1543589077-47d81606c1bf'],
}

const DEMO_SERVICE_PHOTOS = {
  'decor-nunta': '1519741497674-611481863552',
  'decor-cumetrie': '1513151233558-d860c5398176',
  'cerere-in-casatorie': '1519671482749-fd09be7ccebf',
  'decor-aniversare': '1530103862676-de8c9debad1d',
  'cununie-in-aer-liber': '1522673607200-164d1b6ce486',
  'baloane-cu-heliu': '1533174072545-7a4b6ad7a6c3',
  'chirie-decor': '1464366400600-7168b8af9bc3',
}

const categoryForSlug = (slug) => projects.find((p) => p.slug === slug)?.categorySlug ?? 'nunti'

function demoUrl(id, width, height) {
  return \`https://images.unsplash.com/photo-\${id}?w=\${width}&h=\${height}&fit=crop&q=80\`
}

/** Gallery image paths for a project, derived from its slug and image count. */
export function projectImagePaths(slug, imageCount) {
  const pool = DEMO_PHOTOS[categoryForSlug(slug)]
  return Array.from({ length: imageCount }, (_, index) =>
    demoUrl(pool[index % pool.length], 1200, index % 3 === 1 ? 800 : 1500)
  )
}

/** Cover image path for a project. */
export function projectCoverPath(slug) {
  const pool = DEMO_PHOTOS[categoryForSlug(slug)]
  const offset = slug.length % pool.length
  return demoUrl(pool[offset], 1080, 1080)
}

/** Cover image path for a service. */
export function serviceCoverPath(slug) {
  return demoUrl(DEMO_SERVICE_PHOTOS[slug] ?? DEMO_SERVICE_PHOTOS['decor-nunta'], 1400, 933)
}
`

const LOCAL = `/** Gallery image paths for a project, derived from its slug and image count. */
export function projectImagePaths(slug, imageCount) {
  return Array.from(
    { length: imageCount },
    (_, index) => \`/images/portfolio/\${slug}-\${String(index + 1).padStart(2, '0')}.jpg\`
  )
}

/** Cover image path for a project. */
export function projectCoverPath(slug) {
  return \`/images/portfolio/\${slug}-cover.jpg\`
}

/** Cover image path for a service. */
export function serviceCoverPath(slug) {
  return \`/images/services/\${slug}.jpg\`
}
`

async function main() {
  const revert = process.argv.includes('--revert')
  const source = await readFile(CONTENT, 'utf8')

  const start = source.indexOf('/** Gallery image paths for a project')
  const markerStart = source.indexOf(MARKER)
  const cutFrom = markerStart === -1 ? start : markerStart

  if (cutFrom === -1) throw new Error('nu am găsit blocul de helper-e de imagini în content.js')

  const head = source.slice(0, cutFrom)
  const body = revert ? LOCAL : `${MARKER}\n${PHOTOS}`

  await writeFile(CONTENT, `${head}${body}`)
  console.log(revert ? '  Revenit la placeholder-ele locale.' : '  Fotografii Unsplash active.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
