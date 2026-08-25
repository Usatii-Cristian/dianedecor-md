import { NextResponse } from 'next/server'

import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

/**
 * Gates the admin area. Next.js 16 renamed the `middleware` convention to
 * `proxy`; it runs on the Node.js runtime, so the JWT check below works here.
 *
 * Every admin page and route handler re-verifies the session as well — this is
 * a redirect for humans, not the only line of defence.
 */
export function proxy(request) {
  let claims = null

  try {
    claims = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  } catch (error) {
    console.error('[proxy] session check failed:', error.message)
  }

  if (claims) return NextResponse.next()

  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin', '/admin/((?!login).*)'],
}
