import { getCategories, getProjectSlugs, getServiceSlugs } from '@/lib/queries'
import { getSiteUrl } from '@/lib/site-config'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

const STATIC_ROUTES = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/servicii', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/portofoliu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/despre', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
]

export default async function sitemap() {
  const siteUrl = getSiteUrl()
  const [projects, services, categories] = await Promise.all([
    getProjectSlugs(),
    getServiceSlugs(),
    getCategories(),
  ])
  const now = new Date()

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/portofoliu/categorie/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: `${siteUrl}/servicii/${service.slug}`,
      lastModified: service.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/portofoliu/${project.slug}`,
      lastModified: project.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ]
}
