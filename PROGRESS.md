# DianeDecor — build progress

Last updated: 2026-08-25 by Claude Code (VS Code)

## Steps
- [x] 1. Inspect existing directory
- [x] 2. Scaffold Next.js (App Router, JS, src/)
- [x] 3. Tailwind + globals.css + design tokens
- [x] 4. next/font + root layout + metadata + skip link
- [x] 5. Prisma 6 + schema.prisma + generate
- [x] 6. lib/prisma.js, site-config.js, format.js, utils.js
- [x] 7. prisma/seed.js + seed content
- [x] 8. UI primitives + layout shell
- [x] 9. lib/queries.js
- [x] 10. /portofoliu + /portofoliu/[slug] + lightbox
- [x] 11. /servicii + /servicii/[slug]
- [x] 12. /despre
- [x] 13. validation + rate-limit + /api/contact + ContactForm + /contact
- [x] 14. Homepage sections
- [x] 15. auth + proxy + admin routes + dashboard
- [x] 16. sitemap/robots/JsonLd/metadata/not-found/error/loading
- [x] 17. Responsive pass
- [x] 18. Accessibility pass
- [x] 19. Performance pass + Lighthouse
- [x] 20. Final polish + README

## Decisions made

Deviations from the brief, and why:

- **Existing repo was a TypeScript `create-next-app`** (Next 16.3.2, Tailwind v4, `app/` at
  root). Converted to JavaScript + `src/`. Later, at the client's request, TypeScript
  support was re-added as configuration only (`tsconfig.json` with `allowJs: true`,
  `checkJs: false`) so a `.ts`/`.tsx` file can be dropped in later with no migration. All
  application code stays `.js`/`.jsx`.
- **Tailwind v4, not v3.** The scaffold already shipped v4, where tokens live in a `@theme`
  block in CSS rather than in `tailwind.config.js`. `src/app/globals.css` is therefore the
  design-token file the brief describes; there is no `tailwind.config.js`.
- **`proxy.js` instead of `middleware.js`.** Next.js 16 deprecated the `middleware`
  convention and renamed it to `proxy`. Same matcher, same behaviour, no deprecation warning.
- **Route group `(site)`.** The root layout holds only `<html>`/`<body>`/fonts; the public
  chrome (header, footer, skip link) lives in `src/app/(site)/layout.js`. Without this the
  admin panel would inherit the marketing header and footer. URLs are unaffected.
- **`--muted` darkened from `#8A837A` to `#767065`** (3.50:1 → 4.59:1 on `--ivory`) and
  `--sage` from `#7C8471` to `#6B7360` (3.89:1 → 4.95:1 on `--paper`). The briefed values
  failed the 4.5:1 requirement in §14. A `--danger` token was added for form errors.
- **Section entry motion is CSS-only** (`animation-timeline: view()` in `globals.css`),
  not an `IntersectionObserver` hook. Same effect, but no section has to become a client
  component, which keeps the `'use client'` list exactly as specified.
- **`ScrollState.jsx` is the header's client child.** It renders nothing and only mirrors
  `data-scrolled` / `data-route` onto `<html>`; `globals.css` styles the header and the
  active nav link from there. `Header`, its nav and `Footer` stay server components. The
  transparent-over-hero state uses `body:has(#hero)`, so it is correct in the SSR HTML with
  no hydration flash.
- **`src/lib/content.js` is a single content source** used by both `prisma/seed.js` and, via
  `src/lib/fallback-content.js`, by `src/lib/queries.js` when MongoDB is unreachable. The
  site renders fully before the Atlas connection string exists.
- **`src/lib/message-store.js`** catches contact submissions when the database write fails,
  so a lead is never lost; the admin inbox merges them in.
- **Brand icons are hand-drawn SVGs** in `src/components/brand/SocialIcons.jsx`.
  lucide-react v1 removed Instagram and Facebook marks.
- **`src/components/ui/Icon.jsx` resolves icon names**, rather than a `resolveIcon()` helper
  called in render — React 19.2's lint rules reject creating a component during render.
- **Prices render as `de la 15.000 MDL`.** `Intl.NumberFormat('ro-MD', {currency:'MDL'})`
  produces a bare `L`, which reads badly.
- **`/contact` renders per request**, not statically. Reading `?tip=` on the client instead
  needs a Suspense boundary whose fallback swap produced a 0.42 CLS. Server-side reading is
  simpler, matches the brief exactly, and gives CLS 0.
- **Contact details are the studio's real ones** (phone 069 216 064, the real Instagram and
  Facebook links). The email is still a placeholder — see Known issues.
- **Admin auth is an HS256 JWT** (`{ sub, email, iat, exp }`) over email + password, written
  on `node:crypto` in `src/lib/auth.js` rather than pulled from a JWT library — the token is
  issued and verified by this app alone. Both credentials are compared in constant time and
  a wrong email returns the same message as a wrong password.
- **`scripts/generate-placeholders.js`** generates the placeholder photography with `sharp`,
  which resolves through Next.js. It is a manual script; nothing at runtime imports it and
  it is not a declared dependency.

## Optimizări de viteză (rundă a doua)

Măsurat cu Lighthouse mobil pe build de producție, înainte și după:

| | înainte | după |
|---|---|---|
| Performance (mediu) | 92 | 98 |
| LCP (mediu) | 3.3 s | 2.4 s |
| Payload prima încărcare | 460 KB | 276 KB |
| Fonturi | 202 KB / 4 fișiere | 71 KB / 4 fișiere |

- **Fonturi self-hosted și subsetate** (`scripts/fetch-fonts.js`, servite prin
  `next/font/local`). Subsetul `latin-ext` de la Google acoperă toate limbile
  est-europene; site-ul are nevoie doar de ă â î ș ț. În plus, Inter 600 nu era folosit
  nicăieri — singurul `font-semibold` din proiect e pe Cormorant.
- **zod nu mai intră în bundle-ul inițial.** Schema e importată dinamic la prima
  interacțiune cu formularul; rămâne aceeași singură sursă de adevăr pentru client și
  server. `formMessages` s-a mutat în `site-config.js` ca importul static să dispară.
- **ISR coborât la 5 minute** (`revalidate = 300`) pe toate paginile publice.

## Panou de administrare pentru portofoliu

Adăugat după auditul din `FIX-PROMPT.md`. CRUD complet peste `Project`, în
`/admin/portofoliu`.

**Fișiere noi:**
- `src/lib/slug.js` — slug din titlu românesc, cu deduplicare prin sufix numeric
- `src/lib/project-schema.js` — schema zod partajată client/server
- `src/lib/project-write.js` — `revalidatePath` după scriere, mapare formular → Prisma
- `src/lib/admin-queries.js` — citiri care ignoră `published`, plus `canEditContent()`
- `src/app/api/admin/projects/route.js` — POST
- `src/app/api/admin/projects/[id]/route.js` — PATCH (formular complet sau comutare
  publicat/featured) și DELETE
- `src/app/admin/portofoliu/{page,nou/page,[id]/page}.js`
- `src/components/admin/{ProjectForm,ProjectRow,ImageListField,AdminNav,DatabaseNotice}.jsx`

**Decizii:**
- **Read-only fără bază de date.** `canEditContent()` verifică `DATABASE_URL`; ecranele
  arată catalogul împachetat, câmpurile sunt dezactivate, rutele de scriere dau `503` cu
  mesaj explicit. Se deblochează singur când se conectează Mongo.
- **Fără upload de fișiere.** Vercel are sistem de fișiere read-only, deci un upload ar fi
  cerut stocare externă. Formularul acceptă căi locale sau URL-uri de pe hosturile din
  `images.remotePatterns`, cu miniatură live pentru fiecare.
- **Fără câmp `tags`** în formular: U6 a scos afișarea lor de pe site, deci nu are rost un
  câmp pe care nimic nu-l randează. Coloana rămâne în schemă și în seed.
- **`AdminNav` și `NavLinks` sunt componente client** doar pentru că Next 16 nu expune
  pathname-ul pe server, iar `aria-current` trebuie să fie atribut real. Fiind randate și
  pe server, atributul ajunge în HTML-ul livrat — nu apare abia la hidratare.

**Netestat:** operațiile de scriere nu au fost rulate pe o bază de date reală — nu există
încă `DATABASE_URL`. Guard-urile (401 fără sesiune, 503 fără DB, 400 la payload invalid)
sunt verificate; calea de succes nu.

## Optimizări de viteză (rundă a treia)

Măsurat pe build de producție, nu estimat.

**Problema:** `/portofoliu` și `/contact` erau singurele pagini publice cu
`Cache-Control: no-store`, pentru că amândouă citeau `searchParams` pe server. Local
diferența de TTFB părea 3 ms; în producție înseamnă drumul complet până la funcția de
origine, în loc de nodul CDN cel mai apropiat de vizitator.

**Rezolvat pentru `/portofoliu`:** filtrul a devenit rute prerandate,
`/portofoliu/categorie/[slug]`, câte una per categorie. Linkurile vechi cu `?categorie=`
sunt redirecționate 308 dintr-o regulă în `next.config.mjs`, deci pagina rămâne statică.

| | înainte | după |
|---|---|---|
| Cache-Control | no-store | s-maxage=300, stale-while-revalidate |
| Lighthouse Performance | 94 | 98 |
| bf-cache | blocat | eligibil |
| Intrări în sitemap | 26 | 33 |

**Lăsat neschimbat, deliberat:** `/contact` rămâne dinamic. Preselectarea tipului de
eveniment din `?tip=` citită pe client cere fie o graniță Suspense al cărei fallback a
produs 0.42 CLS, fie `setState` într-un efect, pe care regulile de lint React 19.2 îl
resping. E o singură pagină, ajunsă prin click din site, nu din căutare.

**Și:** `ProjectGrid` preîncarcă acum o singură copertă în loc de trei. Grila e pe o
coloană pe telefon, deci celelalte două concurau pentru lățime de bandă cu imaginea LCP —
irelevant cu placeholder-e de 2 KB, dar costisitor cu fotografii reale.

## Known issues / TODO

- **Database not connected yet.** `.env.local` still holds the placeholder `DATABASE_URL`,
  so `npx prisma db push` and `npm run seed` have **not** been run against a real cluster.
  The seed refuses to run against the placeholder and says so. Everything the site displays
  currently comes from the bundled fallback in `src/lib/content.js`.
- **Logo not delivered.** `src/components/brand/Logo.jsx` renders a typographic wordmark and
  `public/logo.svg` is the vector equivalent. One file to change.
- **All photography is placeholder.** 97 generated JPGs in `public/images/`. Replace 1:1,
  keeping the filenames — see `public/images/README.md`.
- **Email address is a placeholder** (`contact@dianedecor.md`), marked with a TODO in
  `src/lib/site-config.js`. Everything else there is real.
- **`notFound()` on `/servicii/[slug]` and `/portofoliu/[slug]` returns HTTP 200**, not 404,
  for unknown slugs. This is documented Next.js 16 behaviour for streamed responses; the
  correct 404 page renders and Next injects `<meta name="robots" content="noindex">`, so the
  pages are not indexed. Unmatched URLs (e.g. `/pagina-inexistenta`) do return a real 404.
- **The rate limiter is in-memory** (`src/lib/rate-limit.js`): counters reset on redeploy
  and are not shared across serverless instances. Move to a shared store if traffic grows.
- **Email notifications are untested end to end** — `RESEND_API_KEY` and
  `CONTACT_NOTIFY_EMAIL` are empty, so the call is skipped. The skip path is tested; the
  send path is not.
- **No automated test suite.** Verification was done with scripted browser (CDP) and HTTP
  checks during the build, not with committed tests.

## How to resume

Vezi secțiunea „LUCRU ÎN CURS" de mai sus — aceea e prioritatea. Separat, când clientul
dă connection string-ul MongoDB Atlas:
put it in `.env.local`, then run `npm run db:push && npm run seed` and confirm `/portofoliu`
still lists 14 projects (it will then be reading from Mongo, not from the fallback).
