# DianeDecor — Security & QA Audit
Date: 2026-08-24 · Auditor: Claude Opus 5 (Claude Code, adversarial pass) · Commit/state: `master` @ `f4e9d23` + untracked `src/`, `prisma/`, `scripts/`, `proxy.js`. Audited against a production build (`next build` + `next start`), Next.js 16.3.2, `DATABASE_URL` still the `.env.example` placeholder.

## Summary
0 Critical, 0 High, 11 Medium, 19 Low. Authentication, server-side validation, ObjectId handling and `published` filtering on projects/services all held up under direct attack — the usual AI-codebase failure modes are genuinely absent here.
The single most important fix: **`proxy.js` sits at the repo root while `app/` sits in `src/`, so Next never loads it.** The admin area survives only because every page and route handler re-checks the session itself; the proxy layer the code believes it has does not exist, and the next admin route added without its own check will be public.
Second priority: `JsonLd` interpolates DB text into a `<script>` tag without escaping `</script>`.

## Findings

### [MEDIUM-01] `proxy.js` is never loaded — the admin gate is one layer thinner than the code claims
**Location:** `proxy.js:1-30` (should be `src/proxy.js`); redirect fallback at `src/app/admin/page.js:23-24`
**Category:** Auth
**Repro:**
```bash
npm run build && npx next start -p 3111
cat .next/server/middleware-manifest.json     # => {"middleware":{},"sortedMiddleware":[],...}
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3111/admin
# => 307 http://localhost:3111/admin/login   ← no ?redirect= param
```
If the proxy ran, `proxy.js:23` would append `?redirect=/admin`. It does not. The empty `middleware` map in the manifest is the direct proof.
Next.js 16 docs (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, "Convention"): *"Create a `proxy.ts` (or `.js`) file in the project root, **or inside `src` if applicable**, so that it is located at the same level as `pages` or `app`."* This project's `app` is at `src/app`, so the file must be `src/proxy.js`.
**Impact:** Three things. (1) The intended optimistic redirect layer does not run at all — 30 lines of dead code that reads as a working security control. (2) `/admin/login?redirect=…` (`src/app/admin/login/page.js:36-37`) can never be populated, so an admin sent to login always lands on `/admin` regardless of where they were headed. (3) Any admin page or API route added later that relies on the matcher instead of calling `getAdminSession()` / `isAuthenticated()` itself will be fully public. Today nothing is exposed — verified: `/admin` 307, `/admin/` 308→307, `/Admin` 404, `/admin/anything` 404, `PATCH /api/admin/messages/:id` 401, forged and `alg:none` tokens 307.
**Fix:** Move `proxy.js` to `src/proxy.js` (unchanged content). Confirm `.next/server/middleware-manifest.json` lists the matcher afterwards, and that `curl /admin` redirects to `/admin/login?redirect=%2Fadmin`.

### [MEDIUM-02] `JsonLd` writes unescaped JSON into a `<script>` tag
**Location:** `src/components/seo/JsonLd.jsx:4-11`; DB text reaches it via `breadcrumbSchema(crumbs)` in `src/app/(site)/portofoliu/[slug]/page.js:56,61` and `src/app/(site)/servicii/[slug]/page.js:62,67`
**Category:** XSS
**Repro:** `JSON.stringify` does not escape `<` or `/`:
```bash
node -e "console.log(JSON.stringify({name:'Nuntă </script><img src=x onerror=alert(1)>'}))"
# {"name":"Nuntă </script><img src=x onerror=alert(1)>"}   ← raw </script> survives
```
A `Project.title` or `Service.title` containing `</script>` closes the JSON-LD block and everything after it is parsed as HTML.
**Impact:** Stored XSS on a public page. Rated Medium rather than High because the only writer of `Project.title` / `Service.title` is whoever holds MongoDB write access — i.e. an actor who already controls the site. No untrusted input (contact messages, `searchParams`, route params) reaches a JSON-LD field today. **Raise this to High the moment any non-admin-authored text is added to a schema helper.**
**Fix:** In `JsonLd`, escape the serialised string before injecting it: `JSON.stringify(data).replace(/</g, '\\u003c')`. That is enough — `<` is valid inside a JSON string and `</script>` can no longer appear literally.

### [MEDIUM-03] Unpublishing a Category does not hide its projects
**Location:** `src/lib/queries.js:62-79` (`getProjectsByCategory`), `:81-102` (`getRelatedProjects`), `:104-119` (`getProjectBySlug`), `:121-132` (`getProjectSlugs`), `:135-148` (`getProjectNeighbours`)
**Category:** Logic / data exposure
**Repro (code path — not runtime-verified, no MongoDB available):** every project query filters `published: true` **on the project** and, where a category is involved, matches only `category: { slug: categorySlug }`. None of them require `category: { published: true }`. Meanwhile `getCategories()` (`:35-46`) *does* filter `published: true`.
Set `Category.published = false` for `nunti` and:
- `/portofoliu` (no filter) still lists all three wedding projects — `getProjectsByCategory(null)` never looks at the category
- `/portofoliu/nunta-ana-roman-chisinau` still renders, and `ProjectCard`/`Badge` still print the category name
- `/portofoliu?categorie=nunti` still returns them, even though the pill is gone from the filter
- `sitemap.xml` still lists all of them (`src/app/sitemap.js:33-38`)
- the homepage "Evenimente recente" strip still features them
The only visible change is that the filter pill disappears — which reads to an admin as "the category is hidden".
**Impact:** A `published` flag that the schema offers (`prisma/schema.prisma:24`) and the UI honours in one place silently does nothing in five others. Content the studio believes is unpublished stays indexed and linked.
**Fix:** Add `category: { is: { published: true } }` to the `where` of `getProjectsByCategory`, `getRelatedProjects`, `getProjectBySlug`, `getProjectSlugs` and `getProjectNeighbours`, and mirror the same filter in each function's `fallback` branch (the bundled content has no `published` field, so filter on the category list instead). Alternatively drop `Category.published` from the schema if it is not meant to cascade — but do not leave it half-wired.

### [MEDIUM-04] Leads captured by the fallback store are lost on Vercel, silently
**Location:** `src/lib/message-store.js:37-58`, consumed by `src/app/api/contact/route.js:102-113`
**Category:** Logic / data loss
**Repro:**
```bash
DATABASE_URL="mongodb+srv://u:p@unreachable-cluster.example.mongodb.net/dianedecor" npx next start -p 3113
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"DBError Test","phone":"069216064","eventType":"Altceva","message":"Mesaj de test cu baza de date indisponibila."}' \
  http://localhost:3113/api/contact
# => 200 {"ok":true,"id":"local-5d6cb805-…"}   (verified)
```
The write lands in `.data/contact-messages.json`. On Vercel the filesystem is read-only, so `persist()` swallows an `EROFS` (`message-store.js:41-43`) and the message exists only in that instance's `globalThis` until it recycles.
**Impact:** The visitor is told "Mulțumim! Am primit cererea ta"; the enquiry is gone. Nothing in the admin inbox indicates that anything was dropped, and nothing alerts the studio that the database is down. A secondary issue: on any host where the write *does* succeed, names, phone numbers and event details sit in plaintext on disk outside the database's access controls.
**Fix:** Two parts. (a) Keep the fallback, but make the failure visible: when `saveFallbackMessage` cannot persist to disk, log at error level and surface a banner in the admin dashboard (`src/app/admin/page.js`) whenever `listFallbackMessages()` is non-empty, so the studio knows the DB path failed. (b) Send the notification email *before* deciding the request succeeded when the DB write failed, so the lead reaches a human even if neither store survives.

### [MEDIUM-05] Any database failure silently serves bundled content as if it were live
**Location:** `src/lib/queries.js:13-22` (`read()`), used by all eleven read functions
**Category:** Logic
**Repro:** with an unreachable `DATABASE_URL`, `/portofoliu` returns 200 with the full seed catalogue and the client sees nothing unusual; server log shows `[queries] getServices failed, serving bundled content:` (verified). At build time the same thing happens — the build we ran had no database at all and still prerendered 14 project pages and 7 service pages from `src/lib/fallback-content.js`.
**Impact:** (1) A project deleted or unpublished in MongoDB reappears on the live site during any outage, because `fallback.projects` has no `published` concept. (2) If a deploy runs while Atlas is unreachable, the entire site ships the seed catalogue — with `generateStaticParams` baking those slugs into static pages that then serve for 5 minutes each — and the build reports success. (3) A total DB outage is completely invisible from the front end, so nobody investigates.
**Fix:** Keep the fallback only for the "not configured yet" case (`!isDatabaseConfigured()`). When `isDatabaseConfigured()` is true and the query throws, rethrow so `error.js` renders, and fail the build rather than prerendering from the bundle. If the bundled fallback must stay as an outage cushion, at minimum log at error level and emit a `x-dd-content-source: bundled` response header so the state is detectable.

### [MEDIUM-06] `POST /api/contact` returns an unhandled 500 for a JSON `null` body
**Location:** `src/app/api/contact/route.js:14-19` and `:67` — `looksAutomated(payload)` destructures before anything checks that `payload` is an object
**Category:** Validation
**Repro:**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -d 'null' http://localhost:3111/api/contact
# => 500  (verified; empty response body)
```
Server log: `⨯ TypeError: Cannot destructure property 'website' of 'object null' as it is null.`
**Impact:** An uncaught exception in the only public write endpoint. No stack trace or internals reach the client (verified: response body empty), so this is not an information leak — but it is an unhandled crash path, and it bypasses the rate limiter entirely (the throw happens before `checkRateLimit`), so it can be fired without limit. Arrays, raw strings and malformed JSON are all handled correctly (400); only `null` slips through.
**Fix:** Guard the payload shape immediately after `request.json()`: `if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return NextResponse.json({ ok: false, message: formMessages.error }, { status: 400 })`, before `looksAutomated`.

### [MEDIUM-07] No security response headers; `X-Powered-By` is advertised
**Location:** `next.config.mjs:1-16` — no `headers()`, no `poweredByHeader: false`
**Category:** Headers
**Repro:**
```bash
curl -sI http://localhost:3111/
# Vary, x-nextjs-cache, X-Powered-By: Next.js, Cache-Control, ETag, Content-Type — and nothing else
```
Missing: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` / CSP `frame-ancestors`, `Strict-Transport-Security`.
**Impact:** The admin dashboard and login form can be framed by any origin (clickjacking on the logout button and the credential form); full referrer URLs leak to Instagram/Facebook/WhatsApp on outbound clicks; MIME sniffing is not disabled. Medium, not Critical — none of these is directly exploitable on its own.
**Fix:** Add an `async headers()` block in `next.config.mjs` applying to `/(.*)`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (or `Content-Security-Policy: frame-ancestors 'none'`), `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Set `poweredByHeader: false`.

### [MEDIUM-08] Rate limiting keys off a spoofable header, and locks out shared-NAT visitors
**Location:** `src/lib/rate-limit.js:42-47` (`getClientIp`), used at `src/app/api/contact/route.js:71-74` and `src/app/api/admin/login/route.js:14`
**Category:** Abuse
**Repro (both directions, verified):**
```bash
# limiter works
for i in 1 2 3 4 5; do curl -s -o /dev/null -w "%{http_code} " -X POST -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: 203.0.113.7' -d '{"name":"RateLimit Test","phone":"069216064","eventType":"Altceva","message":"Mesaj de test pentru limitare rata."}' \
  http://localhost:3111/api/contact; done
# => 200 200 200 429 429

# …and is bypassed by one header
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: 203.0.113.8' -d '{…same body…}' http://localhost:3111/api/contact
# => 200
```
Login is the same: 8 × 401 then 429 on one IP, reset by changing the header. `getClientIp` takes `x-forwarded-for.split(',')[0]` — the leftmost value, which is entirely attacker-controlled.
**Impact:** Both limits are decorative against a deliberate attacker: unbounded contact spam and unbounded password guessing against a single shared admin password. The mirror-image problem also bites real users — 3 submissions per 10 minutes per IP will lock out an entire mobile carrier behind CGNAT, and a genuine customer then sees "Ai trimis prea multe cereri" having sent nothing. Validation failures consume a slot too (`route.js:71` runs before `contactSchema.safeParse` at `:83`).
**Fix:** On Vercel, read the client IP from the platform-trusted header rather than the leftmost `x-forwarded-for`: use `request.headers.get('x-vercel-forwarded-for')` (or the **right**-most `x-forwarded-for` entry, which the platform appends) and document the deployment assumption in the file header. Independently: put the login limiter behind an account-wide counter as well as a per-IP one, and reserve rate-limit slots for requests that pass validation.

### [MEDIUM-09] A genuine submission made under 3 s after mount is silently discarded, with a success screen
**Location:** `src/app/api/contact/route.js:11,14-19,66-69`; timestamp set at `src/components/contact/ContactForm.jsx:41-45`
**Category:** Logic / data loss
**Repro (verified — the store count did not move):**
```bash
NOW=$(node -e "console.log(Date.now())")
curl -s -X POST -H 'Content-Type: application/json' -H 'x-forwarded-for: 198.51.100.2' \
  -d "{\"name\":\"FastSubmit Test\",\"phone\":\"069216064\",\"eventType\":\"Altceva\",\"message\":\"Mesaj de test submit rapid pentru audit.\",\"renderedAt\":$NOW}" \
  http://localhost:3111/api/contact
# => 200 {"ok":true}   — no id, nothing written
```
**Impact:** The honeypot half is correct (a filled `website` field also returns a bare `{"ok":true}` and stores nothing — verified — which is exactly right, a bot must learn nothing). The **timestamp** half applies the same silent drop to humans: `ContactForm` then renders the full success panel (`ContactForm.jsx:93-115`) and the lead is gone. The window is narrow — browser autofill plus a pre-selected `?tip=` still leaves an event type and a 10-character message to enter — but the failure is total and undetectable when it fires.
**Fix:** Distinguish the two signals. Keep the silent 200 for the honeypot field. For the timestamp, do not drop the message: either accept it and flag it (`status: 'NEW'` with a note), or return a 400 asking the visitor to resubmit. Silently discarding a submission while telling the sender it arrived is never the right answer for a signal this weak.

### [MEDIUM-10] The contact form can double-submit
**Location:** `src/components/contact/ContactForm.jsx:58-91` — `await validate(values)` (line 62) resolves before `setStatus('pending')` (line 68), and the button's only guard is `disabled={isPending}` (line 236)
**Category:** UI / logic
**Repro (code path — not browser-verified):** `validate()` at line 29-33 performs `await import('@/lib/validation')`. On the first submit of a session that is a network fetch for the lazily-split zod chunk, not a resolved microtask — the button stays enabled and shows no pending state for its whole duration. Two clicks inside that window both reach `fetch('/api/contact')`. `handleBlur` usually warms the import first, but not for a visitor who never blurs a filled field (browser autofill fills several fields at once without a blur per field).
**Impact:** Duplicate lead in the inbox, and two of the visitor's three rate-limit slots consumed — a third genuine attempt then returns 429.
**Fix:** Set `setStatus('pending')` as the first statement in `handleSubmit`, before the `await`, and reset it to `'idle'` on the validation-failure branch. Optionally guard with `if (status === 'pending') return`.

### [MEDIUM-11] The studio's email address is a placeholder, rendered site-wide and in structured data
**Location:** `src/lib/site-config.js:15-17` (`contact@dianedecor.md`, marked `// TODO`); rendered at `src/components/layout/Footer.jsx:98`, `src/components/contact/ContactDetails.jsx:45-47`, and published as `LocalBusiness.email` in `src/components/seo/JsonLd.jsx:24`
**Category:** Logic / content
**Repro:** every page footer offers `mailto:contact@dianedecor.md`; `curl -s http://localhost:3111/ | grep 'contact@dianedecor.md'` returns it.
**Impact:** If that mailbox does not exist, one of three advertised contact channels bounces silently, and Google is being handed the address as verified business contact data. The phone (`tel:+37369216064`) and WhatsApp (`https://wa.me/37369216064`) links are both correctly formed and use the studio's real number — this is the one channel that is not real.
**Fix:** Replace with the studio's actual inbox, or remove the email row from `ContactDetails`, the footer and `localBusinessSchema` until one exists. Do not ship a fake address in JSON-LD.

---

### [LOW-01] A `Service` with no cover image renders `<img src="">`
**Location:** `prisma/schema.prisma:64` (`coverImage String?`) vs `src/components/services/ServiceRow.jsx:16-24` and `src/app/(site)/servicii/[slug]/page.js:82-90`, both passing it straight to `next/image` with no guard
**Category:** UI
**Repro (code path):** the schema permits `null`; nothing validates it. In production `next/image` does not throw — `node_modules/next/dist/shared/lib/get-img-props.js:270-272` coerces a non-string src to `''` and sets `unoptimized`, so the output is `<img src="">` inside a `fill` container. (In development the same path only sets `unoptimized` and console-errors.)
**Impact:** A blank tile on `/servicii` and on that service's detail page; `src=""` makes some browsers re-request the current document. No crash — this is cosmetic, which is why it is Low despite the schema mismatch.
**Fix:** Either make `coverImage` non-optional in the schema for `Service`, or render the `bg-line` placeholder box without an `<Image>` when it is falsy.

### [LOW-02] Admin inbox timestamps will hydrate-mismatch whenever server TZ ≠ browser TZ
**Location:** `src/lib/format.js:7-13,25-28` used inside the client component `src/components/admin/MessageRow.jsx:109` (and `:72`)
**Category:** UI
**Repro:**
```bash
node -e "const d=new Date('2026-08-24T22:30:00.000Z');for(const tz of ['UTC','Europe/Chisinau'])console.log(tz, new Intl.DateTimeFormat('ro-MD',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:tz}).format(d))"
# UTC              24.08.2026, 22:30
# Europe/Chisinau  25.08.2026, 01:30
```
`/admin` is `force-dynamic`, so `MessageRow` is server-rendered in the host TZ (UTC on Vercel) and hydrated in the admin's TZ (UTC+3 in Chișinău) — different text nodes, every row.
**Impact:** React hydration errors in the admin console and a client re-render of the list. Admin-only, no data loss. The same TZ dependency shifts `eventDate` by a day on any host west of UTC (`formatEventDate` on a midnight-UTC date), which Vercel's UTC default currently avoids.
**Fix:** Pass `timeZone: 'Europe/Chisinau'` to both formatters in `format.js`. That is the studio's timezone, it is correct for every reader, and it makes the output deterministic across server and client.

### [LOW-03] The desktop navigation does not expose the current page to assistive tech
**Location:** `src/components/layout/Header.jsx:25-35` (no `aria-current`), styled from `src/app/globals.css:191-197` via `html[data-route]`, which is written only in an effect at `src/components/layout/ScrollState.jsx:17-19`
**Category:** Accessibility
**Repro:** `curl -s http://localhost:3111/servicii | grep 'aria-current'` returns nothing for the header nav (the mobile nav at `MobileNav.jsx:118` does set it correctly).
**Impact:** Screen-reader users get no "current page" announcement on desktop, and the visual cue is colour-only (`color: var(--color-accent-deep)`), which also fails as a sole differentiator. Because `data-route` is set post-hydration, the active link is unstyled in the server HTML and with JS disabled.
**Fix:** Give the header nav the same treatment as `MobileNav` — compute the active item server-side (the route is known at render) and set `aria-current="page"` plus a non-colour cue (underline).

### [LOW-04] Form field borders and footer icon borders fall below the 3:1 non-text contrast minimum
**Location:** `src/components/ui/Input.jsx:3-4` (`border-line` on `bg-ivory`); `src/components/layout/Footer.jsx:32,41` (`border-ivory/25` on `bg-ink`)
**Category:** Accessibility
**Repro:** `--line #E4DDD2` on `--ivory #FAF7F2` = **1.26:1**; `ivory` at 25% over `--ink #1E1B18` = **2.21:1**. WCAG 2.2 SC 1.4.11 requires 3:1 for the boundary of a user-interface component.
**Impact:** The contact form's fields are bottom-border-only, so in low light or on a poor screen the input boundaries are effectively invisible until focus. Note that every **text** pair passes comfortably — `--muted` on `--ivory` = 4.60:1, `--accent` = 4.58:1, `ink-soft` = 7.46:1, `sage` on paper = 4.95:1, `ivory/60` on ink = 6.50:1 — so the darkening decisions recorded in `PROGRESS.md` did their job. This is the non-text case they missed.
**Fix:** Darken the field's resting border to at least 3:1 against `--ivory` (roughly `#B4A996`) without touching `--line` itself, which is used for decorative dividers where 1.26:1 is fine. Raise the footer icon borders to `border-ivory/40` (3.63:1).

### [LOW-05] 12px body copy outside the specified micro-labels
**Location:** `src/components/contact/ContactForm.jsx:249` (consent paragraph, `text-xs`); `src/components/layout/Footer.jsx:114` (copyright bar, `text-xs`)
**Category:** Accessibility
**Repro:** `text-xs` = 0.75rem = 12px. The `.eyebrow` micro-label (`globals.css:93-99`) is intentionally 12px; these two are ordinary sentences.
**Fix:** Move both to `text-sm` (14px).

### [LOW-06] Tap targets under 44 × 44 px
**Location:** `src/components/ui/Button.jsx:13-15` — the `ghost` variant sets `h-auto rounded-none px-0`, overriding the base `h-12`. Used for "Vezi detalii" (`ServiceRow.jsx:45`), "Vezi tot portofoliul" (`FeaturedProjects.jsx:80`), "Vezi toate serviciile" (`ServicesPreview.jsx:31`), "Despre noi" (`IntroAbout.jsx:57`). Also `src/components/layout/Breadcrumbs.jsx:19-27` and the footer link columns (`Footer.jsx:50-77`).
**Category:** Accessibility
**Repro:** a `text-sm` inline element at `line-height: 1.65` is ≈ 23 px tall with no vertical padding.
**Fix:** Give the `ghost` variant `min-h-11 py-2` (it can keep `px-0` — the underline animation is unaffected), and add `py-1` to the footer and breadcrumb link rows.

### [LOW-07] `portofoliu/error.js` can never render
**Location:** `src/app/(site)/portofoliu/error.js:1-15`, made unreachable by `src/lib/queries.js:16-21`
**Category:** Dead code
**Repro:** with an unreachable database, `/portofoliu` returns **200** with bundled content (verified). `read()` catches every error, so nothing ever propagates to the boundary.
**Impact:** A specified error state that cannot be reached; anyone testing it will conclude it works. This is the direct consequence of MEDIUM-05 and should be re-tested after that fix.
**Fix:** Follow MEDIUM-05. Once genuine DB failures propagate, verify this boundary renders.

### [LOW-08] Error pages lose the site chrome
**Location:** `src/app/error.js:1-9` sits above the `(site)` route group, so it replaces `src/app/(site)/layout.js` — header, footer and skip link included
**Category:** UI
**Repro:** any error thrown below the root layout renders `ErrorState` alone in a bare `Container`.
**Impact:** A user who hits an error has no navigation other than the two buttons in `ErrorState`, and the page loses the brand entirely.
**Fix:** Add `src/app/(site)/error.js` (the same two-line component) so public-page errors render inside the site chrome; keep `src/app/error.js` as the last-resort boundary.

### [LOW-09] The mobile menu stays open across browser back/forward navigation
**Location:** `src/components/layout/MobileNav.jsx:21-60` — the effect keys on `[isOpen]` only; `pathname` is read at line 17 but never used to close the panel
**Category:** UI
**Repro (code path):** each `<Link>` closes the panel via its own `onClick` (`:119`), so in-app taps are fine. A browser back/forward gesture, or any navigation not originating from those links, changes `pathname` while `isOpen` stays `true` — the panel and its `body { overflow: hidden }` lock persist over the new page.
**Impact:** Page appears stuck behind an overlay with scrolling disabled until the user finds the close button. Note the scroll-lock cleanup itself is correct in both components — Lightbox restores `body.style.overflow` on Escape, backdrop click and unmount (`Lightbox.jsx:76-79`), and so does `MobileNav` (`:57-59`); the bug is that `isOpen` never flips.
**Fix:** Add `useEffect(() => setIsOpen(false), [pathname])`.

### [LOW-10] CR/LF survives validation on `name` and reaches the notification email subject
**Location:** `src/lib/validation.js:28-32` (no newline restriction), `src/lib/utils.js:9-14` (`sanitizeText` trims and slices only), consumed at `src/app/api/contact/route.js:47`
**Category:** Injection
**Repro:**
```bash
node -e "const {z}=require('zod');console.log(z.string().trim().min(2).max(80).safeParse('Ion\nBcc: victim@example.com').success)"  # true
```
That value becomes `subject: \`Cerere nouă — ${message.eventType} — ${message.name}\``.
**Impact:** Resend is a JSON API and almost certainly encodes the header, so this is very unlikely to be exploitable as classic SMTP header injection — but the guard is missing, and a multi-line subject renders badly either way. `eventType` is enum-constrained so it cannot contribute. Not currently reachable at all: `RESEND_API_KEY` and `CONTACT_NOTIFY_EMAIL` are both empty, so `notifyByEmail` returns at line 24.
**Fix:** Strip control characters in `sanitizeText`: `.replace(/[\r\n\t\f\v]+/g, ' ')` before the slice.

### [LOW-11] Paragraph React keys collide on repeated text
**Location:** `src/app/(site)/portofoliu/[slug]/page.js:120` and `src/app/(site)/servicii/[slug]/page.js:98` — `key={paragraph.slice(0, 40)}`
**Category:** UI
**Repro (code path):** two paragraphs in one `description` sharing their first 40 characters produce duplicate keys and a React warning.
**Fix:** Key on the index — the list is static within a render and never reorders.

### [LOW-12] `eventDate` has no upper bound
**Location:** `src/lib/validation.js:43-48` — refines "not in the past" but nothing else
**Category:** Validation
**Repro:** `{"eventDate":"3000-01-01"}` is accepted and stored (verified, HTTP 200).
**Fix:** Add a second refine capping the date at ~3 years out.

### [LOW-13] `robots.txt` emits a full URL in the `Host` directive
**Location:** `src/app/robots.js:9` — `host: siteUrl`
**Category:** SEO
**Repro:** `curl -s http://localhost:3111/robots.txt` → `Host: http://localhost:3000`. `Host` takes a bare hostname; the scheme makes it invalid. (The `Disallow: /admin` and `Disallow: /api/` rules are correct, `/admin` and `/admin/login` both carry `<meta name="robots" content="noindex, nofollow">`, and the sitemap contains 26 public URLs and zero admin paths — all verified.)
**Fix:** `host: new URL(siteUrl).host`, or drop the field — it is a Yandex-only directive.

### [LOW-14] Generated assets and selected fields that nothing renders
**Location:** `public/images/atelier.jpg` (produced by `scripts/generate-placeholders.js:107`, documented in `public/images/README.md` as "secțiunea de valori din /despre"); `Category.coverImage` selected at `src/lib/queries.js:42` and mapped at `src/lib/fallback-content.js:25`
**Category:** Dead code
**Repro:** `grep -rn "atelier.jpg" src/` → no matches. `grep -rn "coverImage" src/components/portfolio/CategoryFilter.jsx` → no matches; nothing consumes a category cover.
**Impact:** The `/despre` values section is documented as having an image it does not have — whoever supplies the real photography will replace a file nothing displays.
**Fix:** Either render them or remove both the asset, its generator line, its README row, and the unused `select` field.

### [LOW-15] Submitting the contact form before hydration does a native GET and loses the input
**Location:** `src/components/contact/ContactForm.jsx:131` — `<form onSubmit={handleSubmit} noValidate>` with no `action` and no `method`
**Category:** UI
**Repro (code path):** before hydration there is no React handler; a submit performs the browser default — a GET to the current URL with the fields as query parameters. The visitor lands on `/contact?name=…&phone=…&message=…` with an empty form and their data in the address bar (and in server access logs).
**Impact:** Rare, but it puts a phone number into a URL. Standard for client-rendered forms, worth closing anyway.
**Fix:** Add `action="/contact"` and `method="post"` to the form element so the pre-hydration default is at least not a GET, or disable the submit button until the mount effect at line 43 has run.

### [LOW-16] A leaked session cookie cannot be revoked
**Location:** `src/lib/auth.js:14,64-78` — a 7-day HS256 token with no `jti`, no version claim and no server-side state
**Category:** Auth
**Repro (code path):** `POST /api/admin/logout` only clears the cookie on that browser; a copy of the token stays valid until `exp`.
**Impact:** With one shared admin account and a 7-day lifetime, a token captured once grants a week of inbox access. Everything else about the session is sound — the cookie is `HttpOnly; Secure; SameSite=lax; Max-Age=604800`, the HMAC covers header **and** payload, comparison is constant-time, and `alg:none` and payload-tampering forgeries were both rejected (verified).
**Fix:** Add a `v` claim read from `ADMIN_SESSION_SECRET` (rotating the secret then invalidates every token), or shorten `SESSION_MAX_AGE_SECONDS` to 24 hours.

### [LOW-17] The admin dashboard runs its message query twice
**Location:** `src/app/admin/page.js:29` — `Promise.all([getMessages(activeStatus), getMessageCounts()])`, and `getMessageCounts()` (`src/lib/queries.js:249-259`) itself calls `getMessages()`
**Category:** Efficiency
**Impact:** Two full `contactMessage.findMany` round trips plus two full reads of the fallback JSON file on every dashboard load.
**Fix:** Fetch all messages once and derive both the filtered list and the counts from that array.

### [LOW-18] `Lightbox.close()` performs a focus side effect inside a state updater
**Location:** `src/components/portfolio/Lightbox.jsx:19-24` — `triggersRef.current[index]?.focus()` runs inside the `setOpenIndex` callback
**Category:** UI
**Repro (code path):** state updaters must be pure; React may invoke them more than once (Strict Mode) or discard the result. Focus restoration happening to work today is incidental.
**Impact:** Focus return is the correct behaviour and does work in production. The mechanism is fragile.
**Fix:** Store the index being closed in a ref and call `.focus()` from an effect keyed on `isOpen`, or from the click handler before `setOpenIndex(null)`.

### [LOW-19] Contact rate-limit slots are consumed by failed validation
**Location:** `src/app/api/contact/route.js:71-81` runs before `contactSchema.safeParse` at `:83`
**Category:** Abuse / UI
**Impact:** Three server-side validation failures lock a visitor out for 10 minutes. Client-side validation makes this uncommon, but it compounds MEDIUM-10 (a double-submit burns two slots) and MEDIUM-08 (shared NAT).
**Fix:** Move the limiter's *recording* after successful validation, keeping the *check* where it is.

## Checked — no issue found

**Phase 2.1 — Authentication**
- Path-bypass attempts on the admin area: `/admin` → 307, `/admin/` → 308 → 307, `/Admin` → 404, `/admin/anything` → 404, `/admin?status=NEW` → 307. No variant reaches the dashboard.
- `PATCH /api/admin/messages/[id]` re-checks the session **inside the handler** (`route.js:11-14`) and returns 401 with no cookie — verified. Middleware is not the only guard anywhere (which is why MEDIUM-01 is not Critical).
- `/admin` page re-checks with `getAdminSession()` before any query (`page.js:23-24`) — verified.
- `safeEqual` (`auth.js:33-44`) never calls `timingSafeEqual` on unequal-length buffers — it returns early after burning a same-length comparison, so the throw the audit brief asks about cannot happen. Wrong-length and wrong-value passwords both return the same 401 body; wrong email and wrong password are indistinguishable (`{"ok":false,"message":"Email sau parolă incorectă."}`) — verified for both.
- Non-string credentials (`{"password":{"$ne":null}}`) → 401 via the `typeof` guard at `auth.js:55` — verified.
- Session cookie: `HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=604800; Expires=…` — verified from the `Set-Cookie` header. `secure` is correctly tied to `NODE_ENV === 'production'`.
- Signature verification is real, not decorative: `alg:none` forgery → 307, tampered payload with the original signature → 307, empty token → 307 — all verified. The HMAC covers `header.payload`, and the signature comparison itself is constant-time (`auth.js:88`).
- Undefined/empty `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`: the app **fails closed** — login returns 500 `"Autentificarea nu este configurată."` and never authenticates; `/admin` still redirects. Verified by restarting with both set to `""`. No default fallback exists.
- Login rate limiting exists: 8 attempts then 429 — verified (bypass covered in MEDIUM-08).
- `/admin` and `/admin/login` both emit `<meta name="robots" content="noindex, nofollow">`; `robots.txt` disallows `/admin` and `/api/`; `sitemap.xml` contains 26 URLs and no admin path — all verified.
- Unsupported methods on admin routes return 405, not 500 (`GET/POST/DELETE/PUT` on `/api/admin/messages/:id`) — verified.

**Phase 2.2 — Input validation**
- The zod schema **is** invoked server-side, and it is the same module the form imports (`validation.js`, imported by `route.js:8` and `ContactForm.jsx:30`). No drift — there is one file.
- Direct `curl` against the API, bypassing React entirely: missing fields → per-field 400; `name`/`message` at 100 000 chars → 400 with the max-length messages; `guestCount` as `"abc"` / `-5` / `999999999999` / `1.5` → 400 with the correct message each time; `eventDate` in the past → 400; `"not-a-date"` → 400; `eventType` not in the enum → 400; `email` as `"a@"` and `"<script>@x.com"` → 400. All verified.
- Body as an array → 400, as a raw string → 400, as malformed JSON → 400. (`null` is the one exception — MEDIUM-06.)
- Extra unexpected fields (`status`, `id`, `createdAt`, `isAdmin`) are **not** written: the handler builds `data` field by field at `route.js:89-98` and zod strips unknown keys. Verified — a submission carrying `"status":"ARCHIVED"` was stored as `NEW`.
- Nested objects where strings are expected are rejected by type, not coerced: `{"name":{"$ne":null}}` → `"Scrie numele tău."`, `{"eventType":{"$ne":null}}` → 400. No object reaches Prisma.
- Validation failures return `{ok:false, errors:{field:message}}` with no schema internals, no stack trace, no Prisma text.

**Phase 2.3 — Injection & exposure**
- No user input reaches a Prisma `where`, `orderBy` or raw query as anything but a coerced primitive. Route params are strings by construction; the admin status filter is checked against a literal allowlist (`admin/page.js:27`); message status is checked against `VALID_STATUSES` (`messages/[id]/route.js:26-28`) — `{"status":"DROP TABLE"}` → 400, verified.
- `params.id` is format-checked before Prisma with `/^[0-9a-fA-F]{24}$/` (`utils.js:25-27`); `not-an-id` → 400 `"Identificator invalid."`, verified. No malformed ObjectId can reach the driver.
- `published: false` is filtered on **projects, services and testimonials** in every query path — `generateStaticParams`, detail pages, sitemap, category filter, featured strips, related strips and prev/next all carry it. (The gap is on *categories* — MEDIUM-03.)
- No secret is reachable from the client. Grepped `.next/static` for the literal `ADMIN_PASSWORD` value, the literal `ADMIN_SESSION_SECRET` value, `mongodb` and `cluster.mongodb.net` — zero hits. No server-only value is read inside a `'use client'` file.
- Forced DB errors leak nothing: with an unreachable cluster, `/portofoliu` and `/contact` return 200 and the response bodies contain no occurrence of `mongodb`, `prisma`, the username or the password. Prisma's DNS-resolution error appears only in the server log.
- Contact messages are unreachable unauthenticated. `getMessages` is called from exactly two places, both behind a session check. `.data/contact-messages.json` is outside `public/` — `GET /.data/contact-messages.json` → 404, verified.

**Phase 2.4 / 2.5 — Abuse, CSRF, XSS**
- The honeypot is correct in both halves that matter: a filled `website` field returns `200 {"ok":true}` and stores nothing, giving a bot no signal (verified — store count unchanged).
- CSRF on state-changing routes is adequately covered by `SameSite=lax`: `PATCH /api/admin/messages/:id` is fetch-only (Lax never attaches the cookie to cross-site fetch/XHR) and `POST /api/admin/logout`, although a form post, is also blocked (Lax permits only top-level **GET**). The residual gap is Chrome's 2-minute "Lax+POST" grace window immediately after the cookie is set, which here could only reach the logout endpoint — no state worth forging. An `Origin` check would close it entirely.
- `dangerouslySetInnerHTML` appears exactly once, in `JsonLd` (MEDIUM-02). DB `description` fields are split on `/\n{2,}/` by `toParagraphs` (`format.js:43-49`) and rendered as React text nodes — correctly escaped.
- `images.remotePatterns` is scoped to `res.cloudinary.com` and `images.unsplash.com` (`next.config.mjs:9-12`). No wildcard, so the optimiser is not an open proxy.
- Every `target="_blank"` carries `rel="noreferrer"` (8 occurrences). Per the HTML spec `noreferrer` implies `noopener`, so this is safe as written.

**Phase 3 — Functional & UI**
- Every interactive element has a real handler or a real destination. Full inventory — Header (logo → `/`, 5 nav links, `tel:`, CTA → `/contact`, menu trigger `onClick`); MobileNav (close ×2, backdrop, 5 links, CTA, `tel:`, 2 socials); Hero (2 CTAs); IntroAbout, ServicesPreview, FeaturedProjects (ghost CTAs + card links); TestimonialsSlider (prev/next `onClick`); CtaBand (CTA + `tel:`); CategoryFilter (8 links); ProjectCard/ProjectGrid; Lightbox (thumbnails, close, backdrop, prev, next); project prev/next; ServiceRow/ServiceCard; contact page (submit, "Trimite altă cerere", `tel:`, WhatsApp, 5 FAQ toggles, 5 detail links); admin (logout form, 5 filter links, per-row expand, status `<select>`, `tel:`, `mailto:`); `not-found` (2 buttons); `ErrorState` (retry + home); login (submit). **No `href="#"`, no `href=""`, no `javascript:`, no decorative button anywhere** — verified by grep and by reading every component.
- `tel:+37369216064` and `https://wa.me/37369216064` are both correctly formed for Moldova.
- The `?tip=` pre-selection works: `/contact?tip=decor-nunta` renders `<option value="Decor nuntă" selected="">` — verified. An invalid slug falls through to the empty "Alege..." option rather than erroring (`contact/page.js:30-32`). All 7 service titles match `eventTypeOptions` exactly, so every service page's CTA pre-selects correctly.
- The category filter changes results, updates the URL, survives a hard refresh and marks the active pill with `aria-current="true"` — verified: `nunti` → 3 projects and `<h1>Nunți`, `cumetrii` → 2, `aniversari` → 2, `nonexistent` → 0 projects plus the correct empty state ("Momentan nu avem proiecte publicate în această categorie") with a "Vezi toate proiectele" escape hatch. It is built from plain `<Link>`s, so it works with JS disabled.
- Empty states render for real, not just as files: portfolio (verified above), services (`servicii/page.js:46-54`), admin inbox (`admin/page.js:93-99`).
- Loading skeletons match the real layouts' dimensions (`ProjectCardSkeleton` mirrors `ProjectCard`'s `aspect-4/5` + `p-5`; `ServiceRowSkeleton` mirrors `ServiceRow`'s `aspect-3/2` two-column grid), and are deliberately unanimated.
- Lightbox: `Escape` closes, `ArrowLeft`/`ArrowRight` step with wraparound (`(index + delta + length) % length`, correct at both ends and with a single image), focus is trapped to the overlay's buttons, focus returns to the triggering thumbnail, and `body.style.overflow` is restored on **every** exit path — Escape, backdrop click and unmount all run the same cleanup (`Lightbox.jsx:76-79`). No stuck scroll lock.
- Mobile menu: closes on `Escape` with focus returned to the trigger, traps Tab, locks and correctly restores body scroll. It cannot collide with the Lightbox lock — the Lightbox overlay is `z-[80]` and covers the `z-50` header, so the menu trigger is unreachable while it is open.
- Testimonials slider: wraps modulo the array length, and `Math.min(VISIBLE_ON_DESKTOP, testimonials.length)` prevents both an off-by-one and duplicate React keys when there are fewer items than the 3-up layout. Returns `null` at zero items, and the homepage section is omitted entirely in that case (`page.js:37`).
- Header scroll listener is registered `{ passive: true }` and removed in the effect's cleanup (`ScrollState.jsx:29-30`) — no leak. On non-homepage routes the header is solid from the server HTML via `body:has(#hero)`, so there is no flash and no dependence on the listener.
- Data edge cases: `eventDate`, `location`, `clientNames` are all null-guarded at every render site (`ProjectCard.jsx:34-43`, `[slug]/page.js:70-99`, `MessageRow.jsx:69-86`), and `formatEventDate` returns `null` for falsy input rather than constructing an `Intl` call — no `null` is ever printed and no formatter crash is reachable. `images: []` renders an empty grid without crashing (the lightbox cannot be opened, so the modulo-by-zero in `step()` is unreachable). A single-image gallery works: prev/next both wrap to itself, counter reads `1 / 1`.
- Prev/next project navigation is correct at the boundaries — verified: first project in `nunti` shows only "Proiectul următor", last shows only "Proiectul anterior", and a single-project category hides the whole nav.
- Diacritics and special characters render correctly in the page body, in `<title>` and in metadata — verified in the served HTML (`Nunți`, `Decor nuntă`, `Cerere în căsătorie`, `Mesaje primite`).
- Heading hierarchy: exactly one `<h1>` per page and no skipped levels — `/` (1×h1, 9×h2, 14×h3), `/despre` (1/7/7), `/contact` (1/6/5), a project page (1×h1, 5×h2). Verified across four pages.
- All 9 `next/image` usages have a meaningful `alt` and, being `fill`, all carry `sizes`. The one empty `alt=""` is the hero background, which is correctly decorative — the `<h1>` carries the meaning.
- All 86 referenced image files exist on disk (14 project covers + 72 gallery images), plus all 7 service covers, `hero.jpg`, `despre-fondator.jpg`, `og-image.jpg` and `logo.svg`. Zero missing.
- **Text** contrast passes everywhere: `--muted` 4.60:1, `--accent` 4.58:1, `--accent-deep` 6.68:1, `ink-soft` 7.46:1, `sage` on paper 4.95:1, `ivory/60` on ink 6.50:1, `ivory/70` 8.39:1. (Non-text is LOW-04.)
- `npm run build`: **zero errors and zero warnings**, TypeScript check included. `npm run lint`: clean, no output. No `console.log` in any application file — the five occurrences are in `scripts/`, which nothing at runtime imports.
- `package.json` has no unused dependency; `sharp` is used only by two manual scripts and resolves through Next's own optional dependency (present in `node_modules`), exactly as the file header documents.
- `tsconfig.json` is deliberate (`allowJs: true`, `checkJs: false`, recorded in `PROGRESS.md`); the build's TypeScript pass succeeds and there is no stray `.ts`/`.tsx` application file.
- Contact form success state genuinely replaces the form (`ContactForm.jsx:93-115`), and "Trimite altă cerere" resets values, errors and status while preserving the `?tip=` pre-selection.

## Not verified

- **Everything requiring a live MongoDB.** `DATABASE_URL` in `.env.local` is still the `.env.example` placeholder, so `isDatabaseConfigured()` returns `false` and every read went through `src/lib/fallback-content.js`. I could not insert the awkward records the brief asks for (200-character title, `images: []`, null `eventDate`/`location`/`clientNames`, `features: []`, a service with a null `coverImage`, a category with zero projects, an unpublished category). Those cases were assessed by reading the render path and are reported as code-path findings — MEDIUM-03 and LOW-01 in particular are **not** runtime-verified. I did exercise the Prisma error path end to end by pointing `DATABASE_URL` at an unreachable cluster, which is how MEDIUM-04, MEDIUM-05 and LOW-07 were confirmed.
- **Anything needing a browser.** No headless browser was available, so: horizontal scroll at 360/390/414/768/1024/1440 was **not** measured; tab order and focus visibility were not walked; hydration warnings were not observed in a console; the loading skeletons were not seen under network throttling; the double-submit race (MEDIUM-10), the mobile-menu-on-back bug (LOW-09) and the pre-hydration form submit (LOW-15) are reasoned from the code, not reproduced. My static read found no obvious overflow source — the one negative-offset element (`ContactForm.jsx:220`, `-left-[9999px]`) is leftward and inside `overflow-hidden`, and the horizontally scrolling filter strip is properly contained by `-mx-5 … px-5` — but a real device pass is still owed.
- **Whether `contact@dianedecor.md` exists.** I did not send mail. MEDIUM-11 rests on the `// TODO` comment in `site-config.js:15` and the corresponding note in `PROGRESS.md`.
- **The Resend notification path.** `RESEND_API_KEY` and `CONTACT_NOTIFY_EMAIL` are both empty, so `notifyByEmail` returns at line 24 and never executed during this audit. LOW-10 is a code-path finding; how Resend actually handles a newline in `subject` was not tested.
- **Whether the Instagram and Facebook URLs resolve.** No outbound requests were made. Both are well-formed; the Facebook one is a `/share/…` redirect link, which is more fragile than a canonical page URL.
- **Lighthouse.** The performance figures in `PROGRESS.md` were not re-measured.

## Test data

Nine `ContactMessage` records were created during testing (`Audit Tester` ×3, `RateLimit Test` ×5, `DBError Test` ×1). All landed in the fallback store at `.data/contact-messages.json` because no database is configured. **The file has been deleted and `.data/` is empty again**, matching its state before the audit. No source file was modified; no database was touched.

## Honest assessment of coverage

Where this audit is strong: the authentication surface, the contact API's validation boundary, injection paths into Prisma, secret exposure in the client bundle, the build, and the click-target inventory. Those were tested against a running production server with real requests, and the conclusions are backed by output I can point at.

Where it is thin, and where I would look first if you want a second pass:
1. **Responsive and keyboard behaviour** — assessed by reading CSS, not by measuring. If a page scrolls sideways at 360 px, I did not catch it.
2. **The DB-backed data edge cases** — the whole of §3.4 is inference. MEDIUM-03 (unpublished category) is the one I most want confirmed against a real Atlas instance; it is the finding most likely to be either worse than I state or subtly different.
3. **Hydration** — LOW-02 is derived from `Intl` behaviour, not from a console. There may be other mismatches I did not find.
4. **The seed script** — `prisma/seed.js` was read but never run. Its idempotency claim is untested.

The absence of Critical and High findings is a real result, not a shallow one — I went back and specifically re-checked the four places the brief names (admin **API** auth, `published` leakage, direct API validation, dead buttons), and three of the four are genuinely clean. The fourth produced MEDIUM-03.
