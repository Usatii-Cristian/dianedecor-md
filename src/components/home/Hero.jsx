import Image from 'next/image'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="relative -mt-20 bg-ivory pt-20">
      {/*
        Fotografia rămâne așa cum e — fără văl peste ea. Marginile rupte de sus
        și de jos sunt transparente, iar laturile se sting în ivoriu printr-o
        mască, ca imaginea să se lege de fundalul paginii în loc să pară lipită.
      */}
      <Image
        src="/images/hero.webp"
        alt=""
        width={2000}
        height={866}
        sizes="100vw"
        quality={82}
        priority
        className="h-auto w-full [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      />

      <Container className="relative overflow-hidden">
        <Image
          src="/images/crenguta.webp"
          alt=""
          width={900}
          height={600}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 -left-24 hidden w-[24vw] max-w-xs opacity-70 lg:block"
        />
        <Image
          src="/images/crenguta.webp"
          alt=""
          width={900}
          height={600}
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 hidden w-[24vw] max-w-xs -scale-x-100 opacity-70 lg:block"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 pt-10 pb-6 text-center md:pt-14 md:pb-10">
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
    </section>
  )
}
