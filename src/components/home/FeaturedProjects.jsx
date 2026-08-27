import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

/** Four equal square tiles, matching the cards on /portofoliu. */
export default function FeaturedProjects({ projects }) {
  if (projects.length === 0) return null

  return (
    <Section labelledBy="featured-title" className="border-t border-line" reveal>
      <SectionHeading
        id="featured-title"
        eyebrow="Portofoliu"
        title="Evenimente recente"
        description="Patru proiecte care arată cum lucrăm: o paletă clară, materiale care rezistă și decor gândit pentru sala respectivă."
      />

      <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {projects.slice(0, 4).map((project) => (
          <li key={project.slug}>
            <article className="group h-full">
              <Link href={`/portofoliu/${project.slug}`} className="flex h-full flex-col gap-4">
                <div className="relative aspect-square w-full overflow-hidden bg-line">
                  <Image
                    src={project.coverImage}
                    alt={`Decor pentru ${project.title}${project.location ? `, ${project.location}` : ''}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    quality={85}
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Badge>{project.category.name}</Badge>
                  <h3 className="text-xl">{project.title}</h3>
                  {project.location ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                      <MapPin size={14} aria-hidden="true" />
                      {project.location}
                    </span>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="mt-1 block h-px w-0 bg-accent transition-[width] duration-[400ms] ease-out group-hover:w-full"
                  />
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Button href="/portofoliu" variant="ghost">
          Vezi tot portofoliul
        </Button>
      </div>
    </Section>
  )
}
