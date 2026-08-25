/**
 * One-off generator for the placeholder photography in `public/images`.
 *
 * Produces solid muted JPGs at the aspect ratios the layout actually uses, so
 * every page is testable before the studio delivers the real photos. Run with:
 *
 *   node scripts/generate-placeholders.js
 *
 * `sharp` is not a declared dependency of the app — it resolves through Next.js,
 * which already ships it for image optimisation. Nothing at runtime imports it.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { categories, projects, services } from '../src/lib/content.js'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

/** One muted tone per category, so the grid reads as varied but coherent. */
const categoryTones = {
  nunti: ['#cdbfae', '#b9a892', '#ded3c4'],
  cumetrii: ['#c3ccce', '#aeb9bd', '#d6dcdd'],
  'cerere-in-casatorie': ['#c2a89e', '#ad8f86', '#d6c2ba'],
  aniversari: ['#d3bfc0', '#bfa7a9', '#e0d0d1'],
  'cununie-in-aer-liber': ['#b9c0ab', '#a3ab93', '#cdd3c1'],
  'decor-de-craciun': ['#9aa799', '#849181', '#b6c0b3'],
  'evenimente-corporative': ['#b4b1ac', '#9c9893', '#cac7c2'],
}

const serviceTone = '#c8bcab'

function wordmark(width, height, tone) {
  const size = Math.round(Math.min(width, height) * 0.075)
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, serif" font-size="${size}" fill="${tone}" letter-spacing="${size * 0.06}">
        DianeDecor
      </text>
    </svg>`
  )
}

async function writeImage(path, width, height, background, textTone) {
  const buffer = await sharp({
    create: { width, height, channels: 3, background },
  })
    .composite([{ input: wordmark(width, height, textTone), top: 0, left: 0 }])
    .jpeg({ quality: 72, progressive: true })
    .toBuffer()

  await writeFile(path, buffer)
}

async function main() {
  await mkdir('public/images/portfolio', { recursive: true })
  await mkdir('public/images/services', { recursive: true })

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
  let written = 0

  for (const project of projects) {
    const tones = categoryTones[project.categorySlug] ?? categoryTones.nunti
    const textTone = 'rgba(255,255,255,0.55)'

    await writeImage(
      `public/images/portfolio/${project.slug}-cover.jpg`,
      1080,
      1080,
      tones[0],
      textTone
    )
    written += 1

    for (let index = 0; index < project.imageCount; index += 1) {
      const isLandscape = index % 3 === 1
      const [width, height] = isLandscape ? [1600, 1067] : [1200, 1500]
      await writeImage(
        `public/images/portfolio/${project.slug}-${String(index + 1).padStart(2, '0')}.jpg`,
        width,
        height,
        tones[index % tones.length],
        textTone
      )
      written += 1
    }

    if (!categoryBySlug.has(project.categorySlug)) {
      throw new Error(`Project ${project.slug} references unknown category ${project.categorySlug}`)
    }
  }

  for (const service of services) {
    await writeImage(
      `public/images/services/${service.slug}.jpg`,
      1600,
      1067,
      serviceTone,
      'rgba(255,255,255,0.55)'
    )
    written += 1
  }

  await writeImage('public/images/hero.jpg', 2400, 1600, '#b6a894', 'rgba(255,255,255,0.4)')
  await writeImage('public/images/despre-fondator.jpg', 1200, 1500, '#c6b8a6', 'rgba(255,255,255,0.5)')
  await writeImage('public/images/atelier.jpg', 1200, 1500, '#bfb2a1', 'rgba(255,255,255,0.5)')
  await writeImage('public/images/og-image.jpg', 1200, 630, '#1e1b18', 'rgba(250,247,242,0.75)')
  written += 4

  console.log(`Generated ${written} placeholder images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
