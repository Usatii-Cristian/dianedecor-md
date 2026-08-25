import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Admin authentication: one shared account, no registration.
 *
 * The session is a signed HS256 JWT stored in an httpOnly cookie. It is written
 * by hand on top of `node:crypto` rather than pulled from a library — the token
 * is issued and verified by this app alone, so a full JOSE implementation would
 * be weight without a purpose.
 */

export const SESSION_COOKIE = 'dd_admin_session'
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET is missing or too short (need at least 16 characters).')
  }
  return secret
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function sign(data) {
  return createHmac('sha256', getSecret()).update(data).digest('base64url')
}

/** Constant-time comparison that does not leak the expected length. */
function safeEqual(a, b) {
  const bufferA = Buffer.from(String(a))
  const bufferB = Buffer.from(String(b))

  if (bufferA.length !== bufferB.length) {
    // Still burn a comparison so timing does not depend on the length.
    timingSafeEqual(bufferA, bufferA)
    return false
  }

  return timingSafeEqual(bufferA, bufferB)
}

/** Checks the submitted credentials against the configured admin account. */
export function verifyCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedEmail || !expectedPassword) {
    throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD is not configured.')
  }

  if (typeof email !== 'string' || typeof password !== 'string') return false

  // Both comparisons always run, so a wrong email is not faster than a wrong password.
  const emailMatches = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())
  const passwordMatches = safeEqual(password, expectedPassword)

  return emailMatches && passwordMatches
}

export function createSessionToken(email) {
  const issuedAt = Math.floor(Date.now() / 1000)

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'admin',
      email,
      iat: issuedAt,
      exp: issuedAt + SESSION_MAX_AGE_SECONDS,
    })
  )

  return `${header}.${payload}.${sign(`${header}.${payload}`)}`
}

/** Returns the token's claims, or null if it is malformed, forged or expired. */
export function verifySessionToken(token) {
  if (typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  if (!safeEqual(signature, sign(`${header}.${payload}`))) return null

  let claims
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (typeof claims.exp !== 'number' || claims.exp <= now) return null

  return claims
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

/** Server-side auth check for admin pages and admin route handlers. */
export async function getAdminSession() {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function isAuthenticated() {
  return (await getAdminSession()) !== null
}
