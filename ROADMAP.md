# Roadmap

This tracks Omni Odyssey's progress at a feature/phase level. For specific known bugs and technical findings, see [ISSUES.md](ISSUES.md). For architectural reasoning, see [docs/architecture.md](docs/architecture.md).

## Completed

### Frontend foundation
Next.js 16 App Router project, TypeScript strict mode, Tailwind v4 with a custom editorial theme, shadcn/ui component primitives, domain types, and a repository abstraction layer. All required routes implemented with custom not-found handling. Verified with a foundation audit and stabilization pass (see [ISSUES.md](ISSUES.md) for what that pass found).

### Reading-order builder
Zod-validated form (React Hook Form, re-validated server-side) with dynamic entries, drag-and-drop reordering (dnd-kit, mouse and keyboard, with screen-reader announcements), a live preview, and now-real persistence — shared by both the create and edit flows via one component.

### Discover
Client-side search, publisher/category filtering, and sort order over the real public reading-order catalog, with a shared filter/sort utility reused by the repository layer.

### Reading-order detail
Full metadata display, ordered entries with notes, related reading orders, a working save button, and owner-only edit/delete controls.

### Profiles
Collector bio, real stats (reading orders, reviews, followers, following), published reading orders (including your own private ones on your own profile), recent reviews, and a working follow button — hidden when viewing your own profile.

### Authentication
Supabase Auth (email/password) via `@supabase/ssr`, with `proxy.ts` (Next.js 16's current session-refresh convention) and `getUser()`-based identity verification everywhere it matters. Sign-up, sign-in, sign-out, and protected-route redirects all working and verified end to end.

### Profile onboarding
A distinct post-signup step (`/onboarding`) that establishes a public `profiles` row — separate from authentication itself, matching the product requirement that these are two different capabilities.

### Supabase integration — reading orders
`reading_orders` and `reading_order_entries` tables with Row Level Security enforcing public/private visibility and strict ownership on every mutation. Full create/read/update/delete implemented via Server Actions, each independently validating the user, the input, and resource ownership. Verified with a live two-account attack test (see `docs/architecture.md`).

### Saves and follows
`saved_reading_orders` and `follows` tables with RLS, behind Server Actions — replacing the previous client-local `useState` toggles. `reading_orders.save_count` stays in sync via a `security definer` trigger (a saving user has no `UPDATE` grant on someone else's row, so this is the one narrowly-scoped exception), and follower/following counts on profiles are real queries. Verified end to end with two live accounts.

### Saved reading orders on your profile
A "Saved reading orders" section on the profile page, rendered only when you're viewing your own profile — the underlying rows are world-readable, so this is a deliberate product choice rather than something RLS enforces. Orders the viewer may no longer see (someone else's, since made private) are dropped rather than rendered as blanks.

### Reviews
A real `reviews` table with RLS (public read, owner-only mutate) and a full creation workflow at `/reviews/create`: overall rating plus optional binding, paper-quality, mapping, and extras sub-ratings, via a keyboard-accessible star input. `reviews.ts` now queries Supabase with an embedded author join instead of resolving authors from mock data.

### Cover image and avatar uploads
Supabase Storage-backed uploads via a shared `ImageUploadField`, replacing the plain pasted-URL fields. A single public `images` bucket, namespaced per user by folder path, with `storage.objects` policies enforcing public read and owner-only writes. Verified against the live project, including that writing into another user's folder is rejected.

### Test suite
Vitest covering the pure functions in `lib/utilities` and `features/reading-orders/utils/filter-sort.ts`, plus the validation/ownership logic of the reading-order and profile Server Actions, using a shared chainable Supabase fake (`src/test/fake-supabase.ts`).

### Visual redesign — The Slab (foundation only)
Replaced the incumbent "ink and paper" editorial world, whose own theme
comment named "superhero primary colors" as the thing it avoided. Direction
chosen from seven grounded candidates by `concept-seed` (index 3, seed
`615da846`): **The Slab** — CGC encapsulation and the Overstreet price guide,
where a reading order is a graded, certified artifact rather than a card in a
grid. The direction contract is recorded as an HTML comment in the root layout
and verified present in the built output.

Landed: `PRODUCT.md`; the certification-band token layer (light default from
the use scene, dark as deep ink navy); Archivo + Zilla Slab replacing Fraunces;
the `components/slab` encapsulation system; authored four-colour offset cover
art replacing the gradient placeholder; `SectionHeading` rebuilt with the
banned eyebrow prop removed from all call sites; and the landing page as the
thesis surface. **Foundation only — see "Finish the redesign" below.**

## Planned

Listed roughly in dependency order — most of these build on the repository seam already established, per `docs/architecture.md`.

### Finish the redesign (in flight — highest priority)
The token layer already propagates site-wide, so every route reads in the new
palette and type, but only the landing page has been recomposed into the slab
vocabulary. Remaining, on branch `redesign/the-slab`:

- **App surfaces still in their old composition:** `/discover` (intended as the
  census/price-guide listing), reading-order detail (the opened slab with the
  entries as a numbered run), profile (the Registry Set), `/reviews` and
  `/reviews/create`, the reading-order create/edit forms, the auth and
  onboarding pages, and the not-found pages.
- **Site chrome untouched:** `SiteHeader` and `SiteFooter` are still the
  incumbent design, including the search field and the account menu.
- **Empty states** need rebuilding in-world ("not yet submitted" rather than a
  blank), which matters disproportionately because the catalogue is thin —
  see the "Design for empty" product principle.
- **Seed demo content:** real collected editions, authored at full fidelity and
  labeled synthetic. Only the single hero sample record exists so far.
- **Responsive:** mobile has not been checked at all yet. Committed directions
  usually break there first.
- **Hero slab height** pushes the fold on a short viewport; needs a cap or a
  recomposed hero.
- **Exit condition not yet discharged:** the run's own contract ends with the
  finish review (`impeccable-finish-reviewer`), its verdict, and `DESIGN.md`
  written from the built world by `impeccable-documenter`. Until those run,
  the redesign is unfinished by its own terms.

### Image optimization for uploaded covers
`next.config.ts` carries no `images.remotePatterns`, so cover art and avatars
now served from Supabase Storage bypass Next's image optimizer entirely. The
external-cover component sets `unoptimized` deliberately (arbitrary
user-pasted URLs would turn the server into an open image proxy), but
Storage-hosted images are a known host and should be allowlisted and optimized.

### Standardized collected-edition database
A real `collected_editions` catalog (rather than free-text entry titles) that reading-order entries and reviews can reference by ID, enabling cross-referencing, deduplication, and eventually structured search/filter by edition attributes (binding, publisher imprint, page count, etc.). Several items below depend on this.

### Profile improvements
Editable profile fields, including changing your avatar after onboarding (uploads work, but there's no edit-profile flow yet), plus follower/following list views on top of the counts that are already real.

### Review management
Edit/delete UI for your own reviews — the RLS policies already permit both; only the UI is missing.

### Extend the test suite
Cover the save/follow, review-creation, and upload Server Actions, reusing `src/test/fake-supabase.ts`. Component/UI-level tests are also still absent.

### Reading-order detail improvements
Server-persisted view counts (currently static at creation time), and richer "last updated" surfacing tied to actual edits (the `updated_at` trigger already exists — this is a display/UX layer on top of data that's already correct).

### Discover improvements
Server-side search once the catalog is too large for client-side filtering to stay fast; pagination; URL-synced filter state (explicitly deferred per the original brief, "do not build complex URL-state synchronization unless it can be implemented cleanly").

### Collection tracking
Owned / wanted / previously-read status per collected edition, per user — depends on the standardized collected-edition database above.

### Comments
Threaded discussion on reading orders and reviews. Not started.

### OAuth
Third-party sign-in alongside the existing email/password flow.
