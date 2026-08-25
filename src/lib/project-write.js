import { revalidatePath } from 'next/cache'

/** Public surfaces that show portfolio content and must refresh after a write. */
export function revalidatePortfolio(slug) {
  revalidatePath('/')
  revalidatePath('/portofoliu')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/portofoliu/${slug}`)
}

/** Maps validated form input onto the Prisma columns. */
export function toProjectData(input, categoryId, slug) {
  return {
    title: input.title,
    slug,
    categoryId,
    clientNames: input.clientNames ?? null,
    location: input.location ?? null,
    eventDate: input.eventDate ? new Date(input.eventDate) : null,
    shortDescription: input.shortDescription,
    description: input.description,
    coverImage: input.coverImage,
    images: input.images,
    featured: input.featured,
    published: input.published,
    order: input.order,
  }
}
