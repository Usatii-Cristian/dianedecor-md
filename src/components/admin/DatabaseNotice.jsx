import { TriangleAlert } from 'lucide-react'

/**
 * Shown wherever the admin can look at portfolio content but not change it,
 * because `DATABASE_URL` still points at the placeholder and the screens are
 * reading the catalogue bundled in the code.
 */
export default function DatabaseNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <p className="leading-[1.7]">
        Baza de date nu este conectată, deci vezi conținutul împachetat în cod și nu poți salva
        modificări. Adaugă <code className="admin-code">DATABASE_URL</code> în{' '}
        <code className="admin-code">.env.local</code>, rulează{' '}
        <code className="admin-code">npm run db:push</code> și{' '}
        <code className="admin-code">npm run seed</code>, apoi reîncarcă pagina.
      </p>
    </div>
  )
}
