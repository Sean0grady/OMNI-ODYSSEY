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

## Planned

Listed roughly in dependency order — most of these build on the repository seam already established, per `docs/architecture.md`.

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
