import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import ServiceCard from '@/components/services/ServiceCard'
import Button from '@/components/ui/Button'

export default function ServicesPreview({ services }) {
  if (services.length === 0) return null

  return (
    <Section labelledBy="services-title" className="border-t border-line" reveal>
      <SectionHeading
        id="services-title"
        eyebrow="Servicii"
        title="Ce decorăm"
        description="De la nunți întregi până la un singur setup pentru cerere în căsătorie. Fiecare serviciu are un scop clar și o listă de ce include."
      />

      <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((service) => (
          <li key={service.slug}>
            <ServiceCard service={service} />
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Button href="/servicii" variant="ghost">
          Vezi toate serviciile
        </Button>
      </div>
    </Section>
  )
}
