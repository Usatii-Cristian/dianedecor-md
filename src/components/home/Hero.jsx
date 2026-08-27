import Image from 'next/image'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative -mt-20 bg-ivory pt-20">
      {/*
        Fotografia se afișează întreagă, la proporțiile ei. Marginile rupte de sus
        și de jos sunt transparente și fac trecerea spre ivoriul paginii —
        `object-cover` le-ar fi tăiat exact pe ele.
      */}
      <div className="relative overflow-hidden">
        <Image
          src="/images/hero.webp"
          alt=""
          width={2000}
          height={875}
          sizes="100vw"
          quality={82}
          priority
          className="h-auto w-full"
        />

        {/* Aură centrată: limpezește fundalul exact sub text și lasă restul
            fotografiei la culoarea lui. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-[radial-gradient(ellipse_58%_60%_at_50%_50%,rgba(250,247,242,0.9)_0%,rgba(250,247,242,0.5)_55%,transparent_80%)] lg:block"
        />

        <Image
          src="/images/crenguta.webp"
          alt=""
          width={900}
          height={600}
          aria-hidden="true"
          className="pointer-events-none absolute top-8 -left-20 hidden w-[28vw] max-w-xs opacity-80 lg:block"
        />
        <Image
          src="/images/crenguta.webp"
          alt=""
          width={900}
          height={600}
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-8 hidden w-[28vw] max-w-xs -scale-x-100 opacity-80 lg:block"
        />

        {/* De la md în sus textul stă peste fotografie. Sub md fotografia e prea
            scundă la proporțiile ei ca textul să încapă peste, deci trece dedesubt. */}
        <Container className="lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 pt-10 pb-4 text-center lg:py-0">
            <h1 id="hero-title">
              <span className="font-script block text-[clamp(2.75rem,9vw,6rem)] leading-[1.05] text-ink">
                Decorăm povești
              </span>
              <span className="font-display mt-1 block text-[clamp(1.125rem,3vw,2rem)] leading-tight font-normal text-ink-soft">
                transformăm momente în amintiri
              </span>
            </h1>

            <Image
              src="/images/ornament.webp"
              alt=""
              width={600}
              height={200}
              aria-hidden="true"
              className="w-36 md:w-52"
            />

            <p className="max-w-[54ch] text-ink-soft">
              Nunți, cumetrii, cereri în căsătorie și ceremonii în aer liber. Concept, montaj și
              demontare, în Chișinău și în toată țara.
            </p>

            <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button href="/contact" variant="rose">
                Cere o ofertă
              </Button>
              <Button href="/portofoliu" variant="secondary">
                Vezi portofoliul
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
