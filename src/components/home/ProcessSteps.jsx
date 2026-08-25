import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import { processSteps } from '@/lib/site-config'

export default function ProcessSteps({ headingId = 'process-title' }) {
  return (
    <Section labelledBy={headingId} className="border-t border-line" reveal>
      <SectionHeading
        id={headingId}
        eyebrow="Cum lucrăm"
        title="Patru pași, de la prima discuție până la demontare"
      />

      <ol className="mt-12 flex flex-col border-l border-line pl-6 md:mt-16 md:flex-row md:border-l-0 md:border-t md:pl-0">
        {processSteps.map((step) => (
          <li
            key={step.title}
            className="relative flex-1 pb-10 last:pb-0 md:border-l md:border-line md:px-6 md:pt-8 md:pb-0 md:first:pl-0 md:last:pr-0 md:first:border-l-0"
          >
            <h3 className="font-display text-xl text-ink md:mt-0">{step.title}</h3>
            <p className="mt-3 max-w-[38ch] text-sm leading-[1.7] text-ink-soft">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
