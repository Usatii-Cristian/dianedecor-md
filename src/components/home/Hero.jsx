import Image from 'next/image'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative -mt-20 bg-ivory pt-20">
      <div className="relative overflow-hidden">
        {/* PNG-ul original, servit neatins: `unoptimized` oprește reencodarea
            făcută altfel de next/image. */}
        <Image
          src="/hero-nou.png"
          alt=""
          width={1774}
          height={768}
          sizes="100vw"
          priority
          unoptimized
          className="h-auto w-full"
        />

        {/* Doar cât să se citească textul peste sala plină de flori — restul
            fotografiei rămâne la culoarea lui. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-[radial-gradient(ellipse_44%_60%_at_50%_46%,rgba(250,247,242,0.78)_0%,rgba(250,247,242,0.38)_58%,transparent_78%)] lg:block"
        />

        <Image
          src="/images/crenguta.webp"
          alt=""
          width={900}
          height={600}
          aria-hidden="true"
          className="pointer-events-none absolute top-4 -left-16 hidden w-[22vw] max-w-xs opacity-60 lg:block"
        />
        <Image
          src="/images/crenguta.webp"
          alt=""
          width={900}
          height={600}
          aria-hidden="true"
          className="pointer-events-none absolute top-4 -right-16 hidden w-[22vw] max-w-xs -scale-x-100 opacity-60 lg:block"
        />

        {/* De la lg în sus textul stă peste fotografie; sub lg banda e prea
            scundă la proporțiile ei, așa că textul trece dedesubt, pe ivoriu. */}
        <Container className="lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 pt-10 pb-6 text-center lg:py-0">
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
