/**
 * Seeds MongoDB from `src/lib/content.js`.
 *
 *   npm run seed
 *
 * Idempotent: categories, projects and services are upserted by slug, and
 * testimonials (which have no natural key) are cleared and recreated. Running it
 * twice leaves the database in the same state as running it once, and it never
 * touches contact messages.
 */

import './load-env.js'

import { PrismaClient } from '@prisma/client'
import {
  categories,
  projectCoverPath,
  projectImagePaths,
  projects,
  serviceCoverPath,
  services,
  testimonials,
} from '../src/lib/content.js'

const prisma = new PrismaClient()

async function seedCategories() {
  const idBySlug = new Map()

  for (const category of categories) {
    const data = {
      name: category.name,
      description: category.description,
      coverImage: projectCoverPath(category.coverProjectSlug),
      order: category.order,
      published: true,
    }

    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: data,
      create: { ...data, slug: category.slug },
      select: { id: true },
    })

    idBySlug.set(category.slug, record.id)
  }

  console.log(`Categories upserted: ${idBySlug.size}`)
  return idBySlug
}

async function seedProjects(categoryIdBySlug) {
  for (const project of projects) {
    const categoryId = categoryIdBySlug.get(project.categorySlug)
    if (!categoryId) {
      throw new Error(`Project "${project.slug}" references unknown category "${project.categorySlug}"`)
    }

    const data = {
      title: project.title,
      clientNames: project.clientNames,
      categoryId,
      eventDate: project.eventDate ? new Date(project.eventDate) : null,
      location: project.location,
      shortDescription: project.shortDescription,
      description: project.description,
      coverImage: projectCoverPath(project.slug),
      images: projectImagePaths(project.slug, project.imageCount),
      tags: project.tags,
      featured: project.featured,
      published: true,
      order: project.order,
    }

    await prisma.project.upsert({
      where: { slug: project.slug },
      update: data,
      create: { ...data, slug: project.slug },
      select: { id: true },
    })
  }

  console.log(`Projects upserted: ${projects.length}`)
}

async function seedServices() {
  for (const service of services) {
    const data = {
      title: service.title,
      shortDescription: service.shortDescription,
      description: service.description,
      icon: service.icon,
      features: service.features,
      coverImage: serviceCoverPath(service.slug),
      priceFrom: service.priceFrom,
      order: service.order,
      published: true,
    }

    await prisma.service.upsert({
      where: { slug: service.slug },
      update: data,
      create: { ...data, slug: service.slug },
      select: { id: true },
    })
  }

  console.log(`Services upserted: ${services.length}`)
}

async function seedTestimonials() {
  await prisma.testimonial.deleteMany({})
  await prisma.testimonial.createMany({
    data: testimonials.map((testimonial) => ({
      authorName: testimonial.authorName,
      eventType: testimonial.eventType,
      content: testimonial.content,
      rating: testimonial.rating,
      featured: testimonial.featured,
      published: true,
      order: testimonial.order,
    })),
  })

  console.log(`Testimonials recreated: ${testimonials.length}`)
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url || url.includes('user:password@cluster.mongodb.net')) {
    throw new Error(
      'DATABASE_URL is missing or still the placeholder. Put the real MongoDB Atlas connection string in .env.local first.'
    )
  }

  const categoryIdBySlug = await seedCategories()
  await seedProjects(categoryIdBySlug)
  await seedServices()
  await seedTestimonials()

  const counts = {
    categories: await prisma.category.count(),
    projects: await prisma.project.count(),
    services: await prisma.service.count(),
    testimonials: await prisma.testimonial.count(),
  }

  console.log('Seed complete:', counts)
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
