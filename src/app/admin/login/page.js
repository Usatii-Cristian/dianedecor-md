'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Suspense, useState } from 'react'

import Container from '@/components/layout/Container'
import Input, { FieldLabel } from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const update = (field) => (event) => {
    setCredentials((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const body = await response.json()

      if (response.ok && body.ok) {
        const redirect = searchParams.get('redirect')
        router.replace(redirect?.startsWith('/admin') ? redirect : '/admin')
        router.refresh()
        return
      }

      setError(body.message ?? 'Autentificarea a eșuat.')
    } catch {
      setError('Autentificarea a eșuat. Verifică conexiunea și încearcă din nou.')
    } finally {
      setIsPending(false)
    }
  }

  const canSubmit = credentials.email.length > 0 && credentials.password.length > 0

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-3xl">Autentificare</h1>
        <p className="mt-2 text-sm text-muted">
          Introdu emailul și parola pentru a accesa mesajele primite.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={credentials.email}
          onChange={update('email')}
          disabled={isPending}
          required
          className="mt-2"
        />
      </div>

      <div>
        <FieldLabel htmlFor="password">Parolă</FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={update('password')}
          disabled={isPending}
          required
          className="mt-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !canSubmit}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] bg-ink px-7 text-sm font-medium tracking-[0.02em] text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            Se trimite...
          </>
        ) : (
          'Intră în cont'
        )}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-20">
      <Suspense fallback={<p className="text-sm text-muted">Se încarcă...</p>}>
        <LoginForm />
      </Suspense>
    </Container>
  )
}
