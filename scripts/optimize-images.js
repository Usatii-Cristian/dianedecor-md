/**
 * Re-encodes everything in `public/images` to the smallest JPG that still looks
 * right at the sizes the layout actually renders.
 *
 *   node scripts/optimize-images.js
 *
 * Run it after replacing the photography — including the studio's own files,
 * which usually come straight out of a camera at 8–15 MB each. It is idempotent:
 * a file already at or below the target is left alone.
 *
 * `next/image` re-encodes to WebP/AVIF on delivery anyway, so this is about the
 * repository and the cost of that first optimisation pass, not page weight.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const QUALITY = 72

/** Largest size each kind of image is ever displayed at, times two for retina. */
const MAX_DIMENSIONS = [
  { match: /^hero\.jpg$/, width: 2000, height: 1333 },
  { match: /^og-image\.jpg$/, width: 1200, height: 630 },
  { match: /\/services\//, width: 1400, height: 933 },
  { match: /-cover\.jpg$/, width: 1000, height: 1250 },
  { match: /.*/, width: 1400, height: 1400 },
]

function limitsFor(file) {
  return MAX_DIMENSIONS.find((entry) => entry.match.test(file))
}

async function listImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const full = path.posix.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listImages(full)))
    else if (/\.(jpe?g|png)$/i.test(entry.name)) files.push(full)
  }

  return files
}

async function main() {
  const files = await listImages('public/images')

  let before = 0
  let after = 0
  let touched = 0

  for (const file of files) {
    // Read into a buffer first: sharp holds the file open, and on Windows that
    // blocks writing the result back to the same path.
    const original = await readFile(file)
    const originalSize = original.byteLength
    before += originalSize

    const limits = limitsFor(file)

    const output = await sharp(original)
      .resize(limits.width, limits.height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true, chromaSubsampling: '4:2:0' })
      .toBuffer()

    // Keep whichever is smaller, so re-running never degrades a file for nothing.
    if (output.byteLength < originalSize) {
      await writeFile(file, output)
      after += output.byteLength
      touched += 1
    } else {
      after += originalSize
    }
  }

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)
  const saved = Math.round((1 - after / before) * 100)

  console.log(`  ${files.length} imagini, ${touched} re-encodate`)
  console.log(`  ${mb(before)} MB -> ${mb(after)} MB  (-${saved}%)`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
