import { z } from 'zod'

import { eventTypeOptions } from '@/lib/site-config'

/**
 * One schema, imported by both `ContactForm` and `POST /api/contact`. The client
 * uses it for inline feedback; the server re-runs it and never trusts the client.
 */

// Moldovan mobile and landline numbers, with or without +373, spaces or dashes.
const PHONE_PATTERN = /^(\+?373|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{3}$/

/** Treats an untouched input ('' or null) as "not provided". */
function optional(schema) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    schema.optional()
  )
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const contactSchema = z
  .object({
    name: z
      .string({ error: 'Scrie numele tău.' })
      .trim()
      .min(2, 'Numele trebuie să aibă cel puțin 2 caractere.')
      .max(80, 'Numele poate avea maximum 80 de caractere.'),

    phone: z
      .string({ error: 'Scrie un număr de telefon.' })
      .trim()
      .regex(PHONE_PATTERN, 'Introdu un număr valid, de exemplu 069 216 064 sau +373 69 216 064.'),

    email: optional(z.string().trim().pipe(z.email('Introdu o adresă de email validă.'))),

    eventType: z.enum(eventTypeOptions, { error: 'Alege tipul evenimentului.' }),

    eventTypeOther: optional(
      z.string().trim().max(60, 'Descrierea poate avea maximum 60 de caractere.')
    ),

    eventDate: optional(
      z
        .string()
        .refine((value) => !Number.isNaN(Date.parse(value)), 'Introdu o dată validă.')
        .refine((value) => new Date(value) >= startOfToday(), 'Data nu poate fi în trecut.')
        .refine(
          (value) => {
            const max = new Date()
            max.setFullYear(max.getFullYear() + 3)
            return new Date(value) <= max
          },
          'Data nu poate fi mai departe de 3 ani.'
        )
    ),

    location: optional(
      z.string().trim().max(120, 'Locația poate avea maximum 120 de caractere.')
    ),

    guestCount: optional(
      z.coerce
        .number({ error: 'Introdu un număr.' })
        .int('Introdu un număr întreg.')
        .min(1, 'Numărul de invitați trebuie să fie cel puțin 1.')
        .max(2000, 'Numărul de invitați poate fi cel mult 2000.')
    ),

    message: z
      .string({ error: 'Scrie câteva detalii despre eveniment.' })
      .trim()
      .min(10, 'Mesajul trebuie să aibă cel puțin 10 caractere.')
      .max(1000, 'Mesajul poate avea maximum 1000 de caractere.'),
  })
  .superRefine((data, ctx) => {
    if (data.eventType === 'Altceva' && !data.eventTypeOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventTypeOther'],
        message: 'Descrie ce eveniment vrei să decorezi.',
      })
    }
  })

/** Turns a ZodError into `{ fieldName: 'mesaj' }`, keeping the first issue per field. */
export function toFieldErrors(error) {
  const fieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}
