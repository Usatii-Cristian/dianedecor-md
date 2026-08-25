import {
  categories as rawCategories,
  projects as rawProjects,
  projectCoverPath,
  projectImagePaths,
  services as rawServices,
  serviceCoverPath,
  testimonials as rawTestimonials,
} from '@/lib/content'

/**
 * `src/lib/content.js` shaped exactly like the records Prisma returns, so
 * components cannot tell whether a page was rendered from MongoDB or from the
 * bundled content. Built once at module load.
 */

const seededAt = new Date('2026-01-01T00:00:00.000Z')

const categoryByslug = new Map(rawCategories.map((category) => [category.slug, category]))

export const categories = rawCategories.map((category) => ({
  name: category.name,
  slug: category.slug,
  description: category.description,
  published: true,
}))

export const projects = rawProjects.map((project) => {
  const category = categoryByslug.get(project.categorySlug)

  return {
    slug: project.slug,
    title: project.title,
    clientNames: project.clientNames,
    location: project.location,
    eventDate: project.eventDate ? new Date(project.eventDate) : null,
    coverImage: projectCoverPath(project.slug),
    shortDescription: project.shortDescription,
    description: project.description,
    images: projectImagePaths(project.slug, project.imageCount),
    tags: project.tags,
    category: { name: category.name, slug: category.slug },
    updatedAt: seededAt,
  }
})

export const featuredProjects = projects.filter((project) => {
  const source = rawProjects.find((raw) => raw.slug === project.slug)
  return source.featured
})

export const services = rawServices.map((service) => ({
  slug: service.slug,
  title: service.title,
  shortDescription: service.shortDescription,
  description: service.description,
  icon: service.icon,
  features: service.features,
  coverImage: serviceCoverPath(service.slug),
  priceFrom: service.priceFrom,
  updatedAt: seededAt,
}))

export const testimonials = rawTestimonials.map((testimonial, index) => ({
  id: `fallback-testimonial-${index + 1}`,
  authorName: testimonial.authorName,
  eventType: testimonial.eventType,
  content: testimonial.content,
  rating: testimonial.rating,
}))
