import { NextResponse } from 'next/server'

import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyCredentials,
} from '@/lib/auth'
import { checkRateLimit, getClientIp, recordRateLimitHit } from '@/lib/rate-limit'

const RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 }

export async function POST(request) {
  const rateLimitKey = `admin-login:${getClientIp(request)}`
  const { allowed } = checkRateLimit(rateLimitKey, RATE_LIMIT)

  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: 'Prea multe încercări. Încearcă din nou peste câteva minute.' },
      { status: 429 }
    )
  }

  recordRateLimitHit(rateLimitKey)

  let email
  let password

  try {
    ;({ email, password } = await request.json())
  } catch {
    return NextResponse.json({ ok: false, message: 'Cerere invalidă.' }, { status: 400 })
  }

  try {
    if (!verifyCredentials(email, password)) {
      // One message for both cases, so it cannot be used to discover valid emails.
      return NextResponse.json(
        { ok: false, message: 'Email sau parolă incorectă.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, createSessionToken(email.trim()), sessionCookieOptions())
    return response
  } catch (error) {
    console.error('[api/admin/login]', error.message)
    return NextResponse.json(
      { ok: false, message: 'Autentificarea nu este configurată.' },
      { status: 500 }
    )
  }
}
