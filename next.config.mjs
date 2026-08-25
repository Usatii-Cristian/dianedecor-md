/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    // quality={85} is used across the site; Next 16 only serves qualities listed here.
    qualities: [75, 85],
    // AVIF first: roughly 20-30% smaller than WebP for these photographs, with
    // WebP as the fallback for browsers that do not take it.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/portofoliu',
        has: [{ type: 'query', key: 'categorie', value: '(?<categorySlug>.*)' }],
        destination: '/portofoliu/categorie/:categorySlug',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

export default nextConfig
