# DianeDecor — required fixes

You built this project. An independent audit found the issues below.
Fix them in the order listed. Do not skip any. Do not fix them in a different order.

Context you need, since your memory of this project is gone: Next.js 16.3.2 App Router,
JavaScript (no TypeScript application code), Tailwind v4 with tokens in
`src/app/globals.css`, Prisma 6 against MongoDB, `src/` directory layout with the public
site in the route group `src/app/(site)` and the admin area in `src/app/admin`. The
database is not wired up yet — `DATABASE_URL` in `.env.local` is still the `.env.example`
placeholder, so `src/lib/queries.js` serves bundled content from
`src/lib/fallback-content.js`. Several fixes below cannot be runtime-verified until a real
`DATABASE_URL` exists; where that is the case the entry says so and gives you a code-level
"done when" instead.

## Rules
- Change the minimum necessary to fix each issue. Do not refactor unrelated code,
  do not restyle anything, do not "improve" architecture while you're in there.
- Do not fix an issue by deleting the feature.
- Do not silence a warning by disabling a lint rule or adding an eslint-disable comment.
- After each fix, re-run the listed repro and confirm it now fails to reproduce.
- After each severity block, run `npm run build` and confirm it still passes.
- Work through the list top to bottom. Report back after each severity block, not at the very end.

Start the server for the repro commands with `npm run build && npx next start -p 3111`.
The audit found no Critical and no High findings, so this work order starts at MEDIUM.

## MEDIUM

### M1 — `proxy.js` is in the wrong directory and never loads
**File(s):** `proxy.js` (move to `src/proxy.js`; contents unchanged)
**What's wrong:** Next.js loads `proxy.js` from the project root **or** from `src/` — whichever is at the same level as `app/`. This project's app is at `src/app`, so the file must be `src/proxy.js`. At the repo root it is dead code: the admin area is protected only by the checks inside `src/app/admin/page.js` and `src/app/api/admin/messages/[id]/route.js`.
**How to reproduce:**
```bash
npm run build
cat .next/server/middleware-manifest.json
# currently: {"version":3,"middleware":{},"sortedMiddleware":[],"functions":{}}
npx next start -p 3111
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3111/admin
# currently: 307 http://localhost:3111/admin/login   ← no ?redirect= parameter
```
**Why it matters:** Nothing is exposed today, because every admin page and route handler re-checks the session itself. But the layer the code documents as existing does not run, so the next admin page or API route added without its own `getAdminSession()` / `isAuthenticated()` call will be completely public. It also means `/admin/login?redirect=…`, read at `src/app/admin/login/page.js:36-37`, can never be populated.
**Required fix:** Move the file to `src/proxy.js`. Do not change its contents, its matcher, or its exports. Do **not** remove the duplicate session checks in the page and the route handler — they are correct and are the reason this is not a Critical finding.
**Done when:** `.next/server/middleware-manifest.json` after a fresh build lists a non-empty `middleware` entry with the `/admin` matcher, and `curl -s -o /dev/null -w "%{redirect_url}\n" http://localhost:3111/admin` prints `http://localhost:3111/admin/login?redirect=%2Fadmin`. `PATCH /api/admin/messages/deadbeefdeadbeefdeadbeef` with no cookie must still return **401**, not a redirect.

### M2 — `JsonLd` injects unescaped JSON into a `<script>` tag
**File(s):** `src/components/seo/JsonLd.jsx` (line 8)
**What's wrong:** `JSON.stringify(data)` does not escape `<`. A `Project.title` or `Service.title` containing `</script>` closes the JSON-LD block and everything after it is parsed as HTML.
**How to reproduce:**
```bash
node -e "console.log(JSON.stringify({name:'Nuntă </script><img src=x onerror=alert(1)>'}))"
# {"name":"Nuntă </script><img src=x onerror=alert(1)>"}   ← raw </script> survives
```
That value reaches the page through `breadcrumbSchema(crumbs)` in `src/app/(site)/portofoliu/[slug]/page.js` (lines 56 and 61) and `src/app/(site)/servicii/[slug]/page.js` (lines 62 and 67), both of which put a DB-sourced title into `item.label`.
**Why it matters:** Stored XSS on public pages. Exploitable only by whoever can write to MongoDB today, but it is one line to close and the exposure grows the moment any non-admin text reaches a schema helper.
**Required fix:** In `JsonLd`, escape the serialised string before injecting it:
`dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}`.
`<` is a valid JSON escape for `<`, so consumers still parse the block correctly. Do not switch to `<script>{JSON.stringify(...)}</script>` — React escapes that differently and breaks the JSON-LD.
**Done when:** the rendered `<script type="application/ld+json">` on a project page contains `<` in place of every `<`, and `curl -s http://localhost:3111/portofoliu/nunta-ana-roman-chisinau | grep -o '</script><img'` returns nothing even after a title containing `</script><img src=x>` is introduced.

### M3 — Unpublishing a Category does not hide its projects
**File(s):** `src/lib/queries.js` — `getProjectsByCategory` (lines 62-79), `getRelatedProjects` (81-102), `getProjectBySlug` (104-119), `getProjectSlugs` (121-132), `getProjectNeighbours` (135-148)
**What's wrong:** every one of those queries filters `published: true` on the **project** but never on its **category**. `getCategories` (lines 35-46) *does* filter `published: true`, so setting `Category.published = false` removes the filter pill and nothing else.
**How to reproduce:** requires a real database — read the `where` clauses to confirm. With `Category.published = false` for `nunti`: `/portofoliu` still lists all three wedding projects, `/portofoliu?categorie=nunti` still returns them, `/portofoliu/nunta-ana-roman-chisinau` still renders with its category badge, the homepage featured strip still shows them, and `sitemap.xml` still lists them.
**Why it matters:** A `published` flag that the schema offers and one query honours does nothing in five others. Content the studio believes it has unpublished stays live, linked and indexed.
**Required fix:** Add the category filter to the Prisma `where` of all five functions — `category: { is: { published: true } }` — and mirror the same restriction in each function's `fallback` branch. The bundled content in `src/lib/fallback-content.js` has no `published` field, so in the fallback branches filter against the published category slugs derived from `fallback.categories` rather than inventing a field. Do not change `getCategories`; it is already correct.
**Done when:** all five functions contain the category-published constraint in both their Prisma branch and their fallback branch, `npm run build` still passes, and `/portofoliu`, `/portofoliu?categorie=nunti` and `/sitemap.xml` all still return their current results with every category published (26 sitemap URLs, 14 projects, 3 in `nunti`).

### M4 — Leads captured by the fallback store are lost silently on Vercel
**File(s):** `src/lib/message-store.js` (lines 37-58), `src/app/api/contact/route.js` (lines 100-122), `src/app/admin/page.js`
**What's wrong:** when the Prisma write fails, the message goes to `.data/contact-messages.json`. On Vercel the filesystem is read-only, `persist()` swallows the `EROFS` at `message-store.js:41-43`, and the message lives only in that instance's memory until it recycles. The visitor is told the enquiry arrived.
**How to reproduce:**
```bash
DATABASE_URL="mongodb+srv://u:p@unreachable-cluster.example.mongodb.net/dianedecor" npx next start -p 3113
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"DBError Test","phone":"069216064","eventType":"Altceva","message":"Mesaj de test cu baza de date indisponibila."}' \
  http://localhost:3113/api/contact
# => 200 {"ok":true,"id":"local-…"}  with no durable storage on a read-only host
```
**Why it matters:** A silently lost lead is the worst possible failure for this site, and nothing tells the studio it happened.
**Required fix:** Two changes, both small.
(a) In `saveFallbackMessage`, return a flag indicating whether `persist()` actually wrote to disk, and have `src/app/api/contact/route.js` log at error level when it did not.
(b) In `src/app/admin/page.js`, render a warning banner above the message list whenever `listFallbackMessages()` returns a non-empty array, stating that these entries came from the fail-safe store and are not in the database. Use the existing `border-danger/40 bg-danger/5` treatment already used for form errors.
Do not remove the fallback store — it is the right design; it just needs to be visible.
**Done when:** a submission made against an unreachable `DATABASE_URL` produces a server-log error line naming the persistence failure, and `/admin` (logged in) shows the warning banner while any `local-` prefixed message exists.

### M5 — Any database failure silently substitutes bundled content
**File(s):** `src/lib/queries.js` — the `read()` helper (lines 13-22)
**What's wrong:** `read()` catches every error from every query and returns the bundled seed content instead. That is correct when the database is not configured yet; it is wrong when the database is configured and failing, because the site then serves stale content with no signal — including at build time, where `generateStaticParams` will happily prerender the whole seed catalogue.
**How to reproduce:**
```bash
DATABASE_URL="mongodb+srv://u:p@unreachable-cluster.example.mongodb.net/dianedecor" npx next start -p 3113
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3113/portofoliu
# => 200, full seed catalogue, no indication anything is wrong
```
**Why it matters:** A project unpublished or deleted in MongoDB reappears during any outage. A deploy that runs while Atlas is unreachable ships the seed catalogue and reports success. A total outage is invisible from the front end.
**Required fix:** In `read()`, keep the fallback **only** for `!isDatabaseConfigured()`. When `isDatabaseConfigured()` is true and the query throws, log the error and rethrow so the error boundary renders and the build fails rather than prerendering from the bundle. Keep the existing `console.error` line.
**Conflict note:** this fix makes `src/app/(site)/portofoliu/error.js` reachable for the first time. Apply M5 **before** L1, which verifies that boundary.
**Done when:** with an unreachable `DATABASE_URL`, `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3113/portofoliu` returns **500**, not 200; and with `DATABASE_URL` left at the `.env.example` placeholder the site still renders the full bundled catalogue exactly as it does today (`/portofoliu` → 200 with 14 projects).

### M6 — `POST /api/contact` returns an unhandled 500 for a JSON `null` body
**File(s):** `src/app/api/contact/route.js` (lines 57-69; the crash is `looksAutomated` at line 14 destructuring `null`)
**What's wrong:** `request.json()` returns `null` for a body of literal `null`, and `looksAutomated(payload)` destructures it before anything checks the shape.
**How to reproduce:**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -d 'null' http://localhost:3111/api/contact
# => 500   (server log: TypeError: Cannot destructure property 'website' of 'object null')
```
**Why it matters:** An uncaught exception in the only public write endpoint, reachable before the rate limiter runs, so it can be fired without limit. No stack trace reaches the client, so this is a crash path rather than an information leak.
**Required fix:** Immediately after `payload = await request.json()`, and **before** `looksAutomated(payload)`, reject non-object bodies:
`if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return NextResponse.json({ ok: false, message: formMessages.error }, { status: 400 })`.
Arrays, raw strings and malformed JSON already behave correctly — do not change those paths.
**Done when:** the repro returns **400** with `{"ok":false,"message":"Ceva nu a mers bine. …"}`, and array (`[1,2,3]`), string (`"hello"`), malformed (`{bad`) and empty bodies all still return 400.

### M7 — No security response headers
**File(s):** `next.config.mjs`
**What's wrong:** the app sends no `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/CSP `frame-ancestors` or `Strict-Transport-Security`, and does send `X-Powered-By: Next.js`.
**How to reproduce:** `curl -sI http://localhost:3111/`
**Why it matters:** the admin login form and dashboard can be framed by any origin; full referrer URLs leak to Instagram, Facebook and WhatsApp on outbound clicks; MIME sniffing is not disabled.
**Required fix:** Add an `async headers()` block to `nextConfig` returning one entry with `source: '/(.*)'` and these headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Also set `poweredByHeader: false`. Do not add a full `Content-Security-Policy` — the inline JSON-LD and Next's inline bootstrap scripts would need a nonce, which is out of scope here.
**Done when:** `curl -sI http://localhost:3111/` shows all four headers and no `X-Powered-By`, and every page still renders (check `/`, `/portofoliu`, `/contact`, `/admin/login`).

### M8 — Rate limiting keys off a spoofable header
**File(s):** `src/lib/rate-limit.js` — `getClientIp` (lines 42-47)
**What's wrong:** it takes the **leftmost** value of `x-forwarded-for`, which the client fully controls.
**How to reproduce:**
```bash
for i in 1 2 3 4 5; do curl -s -o /dev/null -w "%{http_code} " -X POST -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: 203.0.113.7' \
  -d '{"name":"RateLimit Test","phone":"069216064","eventType":"Altceva","message":"Mesaj de test pentru limitare rata."}' \
  http://localhost:3111/api/contact; done
# => 200 200 200 429 429   (the limiter itself works)
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: 203.0.113.8' -d '{…same body…}' http://localhost:3111/api/contact
# => 200   ← one header changes and the limit is gone
```
Same bypass on `POST /api/admin/login` (8 attempts then 429, reset by changing the header).
**Why it matters:** unlimited contact spam and unlimited password guessing against a single shared admin password.
**Required fix:** In `getClientIp`, prefer `request.headers.get('x-vercel-forwarded-for')`, which the platform sets and a client cannot forge. Fall back to the **rightmost** entry of `x-forwarded-for` (`split(',').at(-1).trim()`), then `x-real-ip`, then `'unknown'`. Update the comment block at the top of `rate-limit.js` to state the deployment assumption explicitly: these values are only trustworthy behind Vercel's proxy.
**Done when:** the spoof repro above no longer resets the limit when both requests carry the same `x-vercel-forwarded-for`, and the ordinary 3-then-429 behaviour still holds for a single client.

### M9 — A genuine submission under 3 s after mount is discarded, and the visitor is shown success
**File(s):** `src/app/api/contact/route.js` (lines 11, 14-19, 66-69)
**What's wrong:** `looksAutomated` conflates two very different signals. A filled honeypot field is near-certain evidence of a bot and silently returning `{"ok":true}` is correct. A submission arriving within `MIN_FILL_TIME_MS` is weak evidence at best, and it gets the same silent drop — while `ContactForm` renders the full success panel.
**How to reproduce:**
```bash
NOW=$(node -e "console.log(Date.now())")
curl -s -X POST -H 'Content-Type: application/json' -H 'x-forwarded-for: 198.51.100.2' \
  -d "{\"name\":\"FastSubmit Test\",\"phone\":\"069216064\",\"eventType\":\"Altceva\",\"message\":\"Mesaj de test submit rapid pentru audit.\",\"renderedAt\":$NOW}" \
  http://localhost:3111/api/contact
# => 200 {"ok":true}  — no id returned, nothing stored
```
**Why it matters:** a real customer enquiry is destroyed while the customer is told it arrived.
**Required fix:** Split the two checks. Keep the honeypot (`website` non-empty) returning a bare `{"ok":true}` with no storage — that behaviour is correct and must not change. For the timestamp check, **store the message** and mark it, rather than dropping it: let it through the normal path and prefix the stored `message` field with a short marker (e.g. `[verificare: trimis rapid] `) so the studio can judge it. Keep `MIN_FILL_TIME_MS` where it is.
**Done when:** the repro above returns `{"ok":true,"id":"…"}` with an id, the message appears in the admin inbox carrying the marker, and a submission with `"website":"spam"` still returns a bare `{"ok":true}` and stores nothing.

### M10 — The contact form can double-submit
**File(s):** `src/components/contact/ContactForm.jsx` (lines 58-91)
**What's wrong:** `await validate(values)` on line 62 resolves **before** `setStatus('pending')` on line 68. `validate()` performs `await import('@/lib/validation')`, which on the first submit of a session is a real network fetch for the lazily-split zod chunk. Throughout that window the submit button is still enabled and shows no pending state.
**How to reproduce:** open `/contact` in a browser with the network throttled, fill the form without blurring any field (browser autofill does exactly this), and double-click "Trimite cererea". Two `POST /api/contact` requests are sent.
**Why it matters:** duplicate lead in the inbox, and two of the visitor's three rate-limit slots consumed — their next genuine attempt returns 429.
**Required fix:** Move `setStatus('pending')` to be the first statement of `handleSubmit`, before the `await`. On the validation-failure branch (line 63-66), reset it to `'idle'` before returning. Add `if (status === 'pending') return` as a guard at the top.
**Done when:** the double-click repro produces exactly one `POST /api/contact`, the spinner appears on the first click, and a validation failure still returns the form to an editable state with field errors shown.

### M11 — The email address is a placeholder, published site-wide and in structured data
**File(s):** `src/lib/site-config.js` (lines 15-17), rendered by `src/components/layout/Footer.jsx` (line 98), `src/components/contact/ContactDetails.jsx` (lines 44-48), and published as `LocalBusiness.email` by `src/components/seo/JsonLd.jsx` (line 24)
**What's wrong:** `contact@dianedecor.md` is marked `// TODO: replace with the studio's real inbox once confirmed` and is shipping as if it were real.
**How to reproduce:** `curl -s http://localhost:3111/ | grep -o 'contact@dianedecor.md'`
**Why it matters:** one of three advertised contact channels bounces silently, and the address is being handed to Google as verified business contact data.
**Required fix:** Ask for the studio's real inbox and set `email` / `emailHref` to it. If it is not available, remove the email row from `ContactDetails`, the email link from the footer, and the `email` key from `localBusinessSchema` — a missing field is valid in `LocalBusiness`. Do not ship a fake address in JSON-LD. The phone (`tel:+37369216064`) and WhatsApp (`https://wa.me/37369216064`) values are correct — do not touch them.
**Done when:** either the real address is in `site-config.js`, or `grep -rn "contact@dianedecor.md" src/` returns nothing and `/`, `/contact` and the JSON-LD block all render without an email.

## LOW

### L1 — `portofoliu/error.js` is unreachable
**File(s):** `src/app/(site)/portofoliu/error.js` — no change needed here; this is a verification step for M5
**What's wrong:** because `read()` swallows every error, this boundary can never render.
**How to reproduce:** with an unreachable `DATABASE_URL`, `/portofoliu` returns 200, not an error page.
**Why it matters:** a specified error state that nobody can reach, and that anyone testing will wrongly conclude works.
**Required fix:** none of its own — apply M5 first, then verify.
**Done when:** with a configured-but-unreachable `DATABASE_URL`, `/portofoliu` renders "Nu am putut încărca portofoliul" with a working "Încearcă din nou" button.

### L2 — Error pages lose the header and footer
**File(s):** create `src/app/(site)/error.js`
**What's wrong:** `src/app/error.js` sits above the `(site)` route group, so it replaces `src/app/(site)/layout.js` — header, footer and skip link included.
**Why it matters:** a user who hits an error has no navigation beyond the two buttons in `ErrorState`, and the page loses the brand entirely.
**Required fix:** Add `src/app/(site)/error.js` as a `'use client'` component rendering `<ErrorState onRetry={reset} />`, mirroring `src/app/(site)/portofoliu/error.js`. Leave `src/app/error.js` in place as the last-resort boundary.
**Done when:** an error thrown from a public page renders `ErrorState` with the site header and footer around it.

### L3 — Admin inbox timestamps hydrate-mismatch across timezones
**File(s):** `src/lib/format.js` (lines 1-13)
**What's wrong:** both `Intl.DateTimeFormat` instances use the ambient timezone. `MessageRow` is a client component on a `force-dynamic` page, so it is server-rendered in the host's timezone (UTC on Vercel) and hydrated in the admin's (UTC+3 in Chișinău) — different text, every row.
**How to reproduce:**
```bash
node -e "const d=new Date('2026-08-24T22:30:00.000Z');for(const tz of ['UTC','Europe/Chisinau'])console.log(tz, new Intl.DateTimeFormat('ro-MD',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:tz}).format(d))"
# UTC              24.08.2026, 22:30
# Europe/Chisinau  25.08.2026, 01:30
```
**Why it matters:** React hydration errors in the admin console and a client re-render of the list. The same dependency shifts `eventDate` by a day on any host west of UTC.
**Required fix:** Add `timeZone: 'Europe/Chisinau'` to both `dateFormatter` and `dateTimeFormatter` in `format.js`. That is the studio's timezone and makes the output identical on server and client.
**Done when:** both formatter options objects carry `timeZone: 'Europe/Chisinau'`, and `/admin` renders with no hydration warning in the browser console.

### L4 — The desktop navigation does not expose the current page
**File(s):** `src/components/layout/Header.jsx` (lines 25-35)
**What's wrong:** the desktop nav links have no `aria-current`, and the active state is colour-only, applied from `globals.css` via `html[data-route]` which `ScrollState` only sets after hydration.
**How to reproduce:** `curl -s http://localhost:3111/servicii | grep aria-current` — nothing for the header nav. `src/components/layout/MobileNav.jsx:118` does it correctly.
**Why it matters:** screen-reader users get no current-page announcement on desktop, colour alone is not a sufficient differentiator, and the state is absent from the server HTML.
**Required fix:** `Header` is a server component and knows the route — read it and set `aria-current="page"` on the matching link (match `/` exactly, others by prefix, same rule as `MobileNav`). Add a non-colour cue via `aria-current:underline aria-current:underline-offset-4` or an equivalent attribute selector in `globals.css`. Keep the existing `html[data-route]` rules; do not turn `Header` into a client component.
**Done when:** `curl -s http://localhost:3111/servicii | grep -o 'aria-current="page"'` matches exactly once inside the header nav, and the active link is visually distinguished without relying on colour.

### L5 — Form field borders and footer icon borders fall below 3:1
**File(s):** `src/components/ui/Input.jsx` (line 3-4, `fieldClasses`); `src/components/layout/Footer.jsx` (lines 32 and 41)
**What's wrong:** `--line #E4DDD2` on `--ivory #FAF7F2` is **1.26:1**; `border-ivory/25` on `--ink` is **2.21:1**. WCAG 2.2 SC 1.4.11 requires 3:1 for a UI component boundary.
**Why it matters:** the contact form's fields are bottom-border-only, so their boundaries are effectively invisible until focus.
**Required fix:** In `fieldClasses`, replace `border-line` with a border colour reaching at least 3:1 on `--ivory` — add a `--color-field-line: #B4A996` token to the `@theme` block in `src/app/globals.css` and use `border-field-line`. Do **not** change `--line` itself; it is used for decorative dividers where 1.26:1 is correct. In `Footer.jsx`, change both `border-ivory/25` to `border-ivory/40` (3.63:1).
**Done when:** the two field/border colours compute to ≥3:1 against their backgrounds, and no decorative divider elsewhere on the site has changed appearance.

### L6 — 12px body copy outside the micro-labels
**File(s):** `src/components/contact/ContactForm.jsx` (line 249); `src/components/layout/Footer.jsx` (line 114)
**What's wrong:** both are ordinary sentences at `text-xs` (12px). The 12px `.eyebrow` micro-label is intentional; these are not.
**Required fix:** change `text-xs` to `text-sm` on both. Do not touch `.eyebrow` in `globals.css` or any `Badge`/breadcrumb label.
**Done when:** the consent paragraph under the contact form and the footer copyright line both render at 14px.

### L7 — Tap targets under 44 × 44 px
**File(s):** `src/components/ui/Button.jsx` (the `ghost` variant, lines 13-15); `src/components/layout/Breadcrumbs.jsx` (lines 19-27); `src/components/layout/Footer.jsx` (the two link columns, lines 50-77)
**What's wrong:** the `ghost` variant sets `h-auto … px-0`, overriding the base `h-12`, so "Vezi detalii", "Vezi tot portofoliul", "Vezi toate serviciile" and "Despre noi" are ≈23px tall. Footer and breadcrumb links have no vertical padding.
**Required fix:** add `min-h-11 py-2` to the `ghost` variant string (keep `px-0` — the underline animation depends on it), and `py-1` to the footer link and breadcrumb link classes.
**Done when:** every one of those links measures at least 44px tall, and the ghost buttons' hover underline still animates from 0 to full width.

### L8 — The mobile menu stays open across browser back/forward
**File(s):** `src/components/layout/MobileNav.jsx` (lines 17, 21-60)
**What's wrong:** `pathname` is read but never used to close the panel. In-app taps close it via each link's own `onClick`; a browser back/forward gesture does not.
**Why it matters:** the panel and its `body { overflow: hidden }` lock persist over the new page, which looks like a frozen site.
**Required fix:** add `useEffect(() => { setIsOpen(false) }, [pathname])`. Do not remove the per-link `onClick` handlers and do not change the existing scroll-lock cleanup — both are correct.
**Done when:** opening the menu, tapping a link, then pressing the browser back button leaves no overlay and no scroll lock.

### L9 — CR/LF survives validation and reaches the email subject
**File(s):** `src/lib/utils.js` — `sanitizeText` (lines 9-14)
**What's wrong:** `sanitizeText` trims and slices but does not strip control characters, so a `name` containing `\n` reaches `subject: \`Cerere nouă — … — ${message.name}\`` in `src/app/api/contact/route.js:47`.
**How to reproduce:**
```bash
node -e "const {z}=require('zod');console.log(z.string().trim().min(2).max(80).safeParse('Ion\nBcc: victim@example.com').success)"  # true
```
**Why it matters:** Resend is a JSON API and very likely encodes the header, so classic SMTP header injection is unlikely — but the guard is missing and a multi-line subject renders badly regardless. Currently unreachable: `RESEND_API_KEY` and `CONTACT_NOTIFY_EMAIL` are both empty.
**Required fix:** in `sanitizeText`, collapse control whitespace before slicing: `.replace(/[\r\n\t\f\v]+/g, ' ')`. Apply it to the trimmed value, before the length cap.
**Done when:** a submission with `"name": "Ion\nBcc: x@y.com"` is stored as `Ion Bcc: x@y.com` on one line.

### L10 — Small correctness cleanups
Group these; they share no single fix but each is one line.
- **`src/app/(site)/portofoliu/[slug]/page.js` line 120** and **`src/app/(site)/servicii/[slug]/page.js` line 98**: `key={paragraph.slice(0, 40)}` collides when two paragraphs share their first 40 characters. Key on the index — the list is static within a render and never reorders.
- **`src/lib/validation.js` lines 43-48**: `eventDate` has no upper bound; `{"eventDate":"3000-01-01"}` is accepted and stored (verify with a `curl` POST). Add a second `.refine` capping it at roughly three years out, with a Romanian message matching the file's existing tone.
- **`src/app/robots.js` line 9**: `host: siteUrl` emits `Host: http://localhost:3000`. The directive takes a bare hostname — use `new URL(siteUrl).host`, or drop the field entirely.
- **`src/app/admin/page.js` line 29**: `getMessageCounts()` internally calls `getMessages()`, so the dashboard runs the query twice. Fetch all messages once and derive both the filtered list and the counts from that array.
- **`src/components/portfolio/Lightbox.jsx` lines 19-24**: `close()` calls `triggersRef.current[index]?.focus()` inside the `setOpenIndex` updater. State updaters must be pure. Capture the index in a ref and focus from an effect keyed on `isOpen`, or from the click handler before `setOpenIndex(null)`. Focus restoration must keep working.
- **`src/app/api/contact/route.js` lines 71-81**: the rate limiter records an attempt before validation runs, so three server-side validation failures lock a visitor out for 10 minutes. Keep the *check* where it is; move the *recording* to after `contactSchema.safeParse` succeeds.
**Done when:** no duplicate-key warning is possible from those two lists; a year-3000 `eventDate` returns 400; `robots.txt` shows a bare hostname; `/admin` issues one message query per load; the lightbox still returns focus to the thumbnail on close; and three consecutive 400s from `/api/contact` do not produce a 429 on the fourth valid request.

### L11 — Dead assets and unused fields
**File(s):** `public/images/atelier.jpg`, `scripts/generate-placeholders.js` (line 107), `public/images/README.md` (the `atelier.jpg` row), `src/lib/queries.js` (line 42), `src/lib/fallback-content.js` (line 25)
**What's wrong:** `atelier.jpg` is generated and documented as appearing in "secțiunea de valori din /despre", but `grep -rn "atelier.jpg" src/` returns nothing. `Category.coverImage` is selected and mapped but nothing renders it.
**Why it matters:** whoever supplies the real photography will spend effort replacing a file the site never displays.
**Required fix:** decide one way per item. Either render `atelier.jpg` in the values section of `src/app/(site)/despre/page.js`, or delete the file, its generator line and its README row. Either use `Category.coverImage` or drop it from the `select` and from the fallback mapping. Do not leave either half-wired.
**Done when:** every asset in `public/images/` is referenced by rendering code, and every field in a Prisma `select` is consumed by a component.

### L12 — Pre-hydration form submit does a native GET
**File(s):** `src/components/contact/ContactForm.jsx` (line 131)
**What's wrong:** `<form onSubmit={handleSubmit} noValidate>` has no `action` and no `method`. Before hydration, a submit performs the browser default — a GET to the current URL — landing the visitor on `/contact?name=…&phone=…&message=…` with an empty form and their phone number in the address bar and the server access log.
**Required fix:** add `method="post"` and `action="/contact"` to the form element so the pre-hydration default is not a GET with data in the query string. Do not add a server action; `handleSubmit` still calls `preventDefault()` and owns the real path.
**Done when:** the form element carries both attributes and the normal JavaScript submit flow is unchanged (success panel, field errors, rate-limit banner all still work).

### L13 — A leaked session cookie cannot be revoked
**File(s):** `src/lib/auth.js` (line 14, and `createSessionToken` / `verifySessionToken` at lines 64-101)
**What's wrong:** the token has no `jti` and no version claim, and there is no server-side session state, so `POST /api/admin/logout` only clears the cookie on that one browser. A copied token stays valid for the full 7 days.
**Why it matters:** with one shared admin account, a token captured once grants a week of access to every contact message.
**Required fix:** the lightest sufficient change — reduce `SESSION_MAX_AGE_SECONDS` from `7 * 24 * 60 * 60` to `24 * 60 * 60`. If you want revocation as well, add a `v` claim derived from the first 8 characters of a SHA-256 of `ADMIN_SESSION_SECRET` and reject tokens whose `v` does not match, so rotating the secret invalidates every outstanding token. Do not add a database-backed session table.
**Done when:** a freshly issued cookie carries `Max-Age=86400`, and logging in and out still works end to end.

## Do NOT change
The audit verified these as correct. Leave them alone even though you will be working next to them.
- **The duplicate auth checks.** `src/app/admin/page.js:23-24` and `src/app/api/admin/messages/[id]/route.js:11-14` both re-verify the session independently of the proxy. That is why M1 is not a Critical finding. Do not remove either one after moving `proxy.js`.
- **`safeEqual` in `src/lib/auth.js:33-44`.** It correctly avoids calling `timingSafeEqual` on unequal-length buffers, and both credential comparisons always run. Do not "simplify" it to a `===`, and do not add an early return on length before the burn comparison.
- **The identical error message for a wrong email and a wrong password** (`src/app/api/admin/login/route.js:35-38`). It is deliberate.
- **The fail-closed behaviour when `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` are missing.** `getSecret()` and `verifyCredentials` throw, and login returns 500. Do not add a default value or a development bypass.
- **The honeypot's silent `{"ok":true}`** for a filled `website` field. Returning an error there would tell a bot it was detected. M9 changes only the timestamp branch.
- **`isValidObjectId` and its use** at `src/app/api/admin/messages/[id]/route.js:39-41`, and the `VALID_STATUSES` allowlist at line 26. Both work; malformed ids return 400, not a Prisma 500.
- **`CategoryFilter` as plain `<Link>`s.** The filter lives in the URL, is shareable, survives a hard refresh and works without JavaScript. Do not convert it to client state.
- **`images.remotePatterns` in `next.config.mjs`.** Scoped to two specific hosts. Do not add a wildcard.
- **The Lightbox and MobileNav scroll-lock cleanups.** Both restore `body.style.overflow` on every exit path. L8 fixes only *when* `isOpen` flips, not the lock itself.
- **`toParagraphs` in `src/lib/format.js`.** It splits on `/\n{2,}/` and renders text nodes. Do not convert it to `dangerouslySetInnerHTML`.
- **The phone and WhatsApp values** in `src/lib/site-config.js` (`tel:+37369216064`, `https://wa.me/37369216064`). Both correctly formed and real.
- **`--muted`, `--sage` and `--danger`** in `src/app/globals.css`. Every text pair already clears 4.5:1. L5 adds a new token; it does not modify these.
- **`tsconfig.json`.** The JS-with-TS-config setup is deliberate and the build's TypeScript pass succeeds.

## Final verification
Run all of this and confirm each line before reporting done.

```bash
# 1. Build and lint clean
npm run build          # zero errors AND zero warnings
npm run lint           # no output

# 2. Proxy actually loads
cat .next/server/middleware-manifest.json          # middleware map is non-empty
npx next start -p 3111
curl -s -o /dev/null -w "%{redirect_url}\n" http://localhost:3111/admin
#   => http://localhost:3111/admin/login?redirect=%2Fadmin

# 3. Admin still sealed
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH -H 'Content-Type: application/json' \
  -d '{"status":"READ"}' http://localhost:3111/api/admin/messages/deadbeefdeadbeefdeadbeef   # 401
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3111/Admin                          # 404
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH -H 'Content-Type: application/json' \
  -d '{"status":"READ"}' http://localhost:3111/api/admin/messages/not-an-id                   # 401

# 4. Contact API hardened
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -d 'null' http://localhost:3111/api/contact                                                  # 400, not 500
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -d '[1,2,3]' http://localhost:3111/api/contact                                               # 400
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H 'Content-Type: application/json' \
  -d '{bad' http://localhost:3111/api/contact                                                  # 400

# 5. Honeypot vs timestamp now differ
curl -s -X POST -H 'Content-Type: application/json' -H 'x-forwarded-for: 198.51.100.1' \
  -d '{"name":"HP","phone":"069216064","eventType":"Altceva","message":"Mesaj de test suficient de lung.","website":"spam"}' \
  http://localhost:3111/api/contact          # {"ok":true}   with NO id, nothing stored
NOW=$(node -e "console.log(Date.now())")
curl -s -X POST -H 'Content-Type: application/json' -H 'x-forwarded-for: 198.51.100.2' \
  -d "{\"name\":\"Fast\",\"phone\":\"069216064\",\"eventType\":\"Altceva\",\"message\":\"Mesaj de test suficient de lung.\",\"renderedAt\":$NOW}" \
  http://localhost:3111/api/contact          # {"ok":true,"id":"…"}  stored, marked

# 6. Security headers present
curl -sI http://localhost:3111/ | grep -iE 'x-content-type-options|referrer-policy|x-frame-options|strict-transport|x-powered-by'
#   first four present, x-powered-by absent

# 7. JSON-LD escaped
curl -s http://localhost:3111/portofoliu/nunta-ana-roman-chisinau | grep -o 'application/ld+json'
#   then confirm the block's payload contains < and no literal '<'

# 8. Nothing regressed on the public site
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3111/               # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3111/portofoliu     # 200
curl -s "http://localhost:3111/portofoliu?categorie=nunti" | grep -c 'aria-current="true"'    # 1
curl -s "http://localhost:3111/portofoliu?categorie=nonexistent" | grep -c 'Momentan nu avem' # 1
curl -s "http://localhost:3111/contact?tip=decor-nunta" | grep -o 'value="Decor nuntă" selected'  # matches
curl -s http://localhost:3111/sitemap.xml | grep -c '<loc>'                   # 26
curl -s http://localhost:3111/robots.txt                                      # Host: is a bare hostname

# 9. Fallback path still intact with the placeholder DATABASE_URL
#    /portofoliu renders 14 projects; /servicii renders 7 services

# 10. Error boundary now reachable
DATABASE_URL="mongodb+srv://u:p@unreachable-cluster.example.mongodb.net/dianedecor" npx next start -p 3113
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3113/portofoliu      # 500, not 200
```

Delete any contact messages your testing creates: they land in `.data/contact-messages.json` while `DATABASE_URL` is the placeholder.
