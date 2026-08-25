/**
 * In-memory sliding-window rate limiter.
 *
 * Counters live in the process, so they reset on every redeploy and are not
 * shared between serverless instances. That is enough for the contact form at
 * the studio's current traffic; if submissions grow, move this to a shared store
 * (Redis or similar) so the limit holds across instances.
 *
 * SECURITY NOTE: This implementation assumes deployment behind Vercel's proxy.
 * x-vercel-forwarded-for is set by the platform and cannot be spoofed by clients.
 */

const globalForRateLimit = globalThis
globalForRateLimit.rateLimitBuckets ??= new Map()

const buckets = globalForRateLimit.rateLimitBuckets

/** Drops expired keys so the map cannot grow without bound. */
function prune(now) {
  for (const [key, timestamps] of buckets) {
    if (timestamps.length === 0 || timestamps.at(-1) < now - 60 * 60 * 1000) {
      buckets.delete(key)
    }
  }
}

export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now()
  const windowStart = now - windowMs

  if (buckets.size > 500) prune(now)

  const timestamps = (buckets.get(key) ?? []).filter((time) => time > windowStart)
  buckets.set(key, timestamps)

  if (timestamps.length >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((timestamps[0] + windowMs - now) / 1000) }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

/** Records a rate-limit hit for the given key. Call after validation passes. */
export function recordRateLimitHit(key) {
  const timestamps = buckets.get(key) ?? []
  timestamps.push(Date.now())
  buckets.set(key, timestamps)
}

/** Best-effort client IP behind Vercel's proxy. Falls back to a shared bucket when no header is present. */
export function getClientIp(request) {
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) return vercelForwarded.trim()

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',').at(-1).trim()

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}
