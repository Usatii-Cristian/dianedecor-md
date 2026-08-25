import Image from 'next/image'

import Section from '@/components/layout/Section'
import Button from '@/components/ui/Button'
import { studioStats } from '@/lib/site-config'

export default function IntroAbout() {
  return (
    <Section labelledBy="intro-title" reveal>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-line">
          <Image
            src="/images/despre-fondator.jpg"
            alt="Fondatoarea studioului DianeDecor, în atelier"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            quality={85}
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <p className="eyebrow">Despre studio</p>

          <h2 id="intro-title">Un studio mic, care ia puține evenimente pe weekend</h2>

          <p className="max-w-[60ch] text-ink-soft">
            DianeDecor lucrează din 2016 în Chișinău și în restul țării. Luăm un număr limitat de
            evenimente pe weekend, ca fiecare să primească aceeași atenție: vizionare a sălii,
            concept propriu și o echipă care rămâne până la demontare.
          </p>

          <p className="max-w-[60ch] text-ink-soft">
            Nu refolosim același decor la trei nunți la rând. Paleta și materialele pornesc de la
            spațiul în care ai rezervat și de la ce vă reprezintă pe voi, nu de la un catalog.
          </p>

          <dl className="mt-2 grid grid-cols-3 gap-6 border-t border-line pt-8">
            {studioStats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs tracking-[0.14em] text-muted uppercase">{stat.label}</dt>
                <dd className="font-display text-3xl text-ink md:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-2">
            <Button href="/despre" variant="secondary">
              Despre noi
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
