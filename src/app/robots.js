import { getSiteUrl } from '@/lib/site-config'

export default function robots() {
  const siteUrl = getSiteUrl()

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  }
}
