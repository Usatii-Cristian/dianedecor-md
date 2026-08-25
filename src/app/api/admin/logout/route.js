import { NextResponse } from 'next/server'

import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'

/** Posted from a plain form in the dashboard, so it answers with a redirect. */
export async function POST(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 })
  return response
}
