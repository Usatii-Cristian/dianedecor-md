'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Pencil, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { formatEventDate } from '@/lib/format'
import { projectMessages } from '@/lib/project-schema'
import { cn } from '@/lib/utils'

/** One project in the admin list, with its publish, feature and delete actions. */
export default function ProjectRow({ project, readOnly }) {
  const router = useRouter()
  const [published, setPublished] = useState(project.published)
  const [featured, setFeatured] = useState(project.featured)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const patch = async (body, apply, revert) => {
    apply()
    setError(null)

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      revert()
      setError(projectMessages.error)
    }
  }

  const togglePublished = () =>
    patch(
      { published: !published },
      () => setPublished(!published),
      () => setPublished(published)
    )

  const toggleFeatured = () =>
    patch(
      { featured: !featured },
      () => setFeatured(!featured),
      () => setFeatured(featured)
    )

  const remove = async () => {
    if (!window.confirm(`Ștergi definitiv „${project.title}”? Acțiunea nu poate fi anulată.`)) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      setError(projectMessages.error)
      setIsDeleting(false)
    }
  }

  const actionClasses =
    'inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-line text-muted transition-colors duration-200 ease-out hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <li className="border-b border-line last:border-b-0">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[3px] bg-line">
          <Image
            src={project.coverImage}
            alt=""
            fill
            sizes="64px"
            className={cn('object-cover', !published && 'opacity-40')}
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl text-ink">{project.title}</span>
            {published ? null : <span className="eyebrow text-muted">ciornă</span>}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span>{project.category?.name}</span>
            {project.location ? <span>{project.location}</span> : null}
            {project.eventDate ? <span>{formatEventDate(project.eventDate)}</span> : null}
            <span className="font-mono text-xs">/{project.slug}</span>
          </p>
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleFeatured}
            disabled={readOnly || isDeleting}
            aria-pressed={featured}
            aria-label={featured ? 'Scoate de pe pagina principală' : 'Afișează pe pagina principală'}
            className={cn(actionClasses, featured && 'border-accent text-accent')}
          >
            <Star size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={togglePublished}
            disabled={readOnly || isDeleting}
            aria-pressed={published}
            aria-label={published ? 'Retrage de pe site' : 'Publică pe site'}
            className={actionClasses}
          >
            {published ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
          </button>

          <Link
            href={`/admin/portofoliu/${project.id}`}
            aria-label={`Editează ${project.title}`}
            className={actionClasses}
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={remove}
            disabled={readOnly || isDeleting}
            aria-label={`Șterge ${project.title}`}
            className={cn(actionClasses, 'hover:border-danger hover:text-danger')}
          >
            {isDeleting ? (
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </li>
  )
}
