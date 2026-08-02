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
Full metadata display, ordered entries with notes, related reading orders, a mock save button, and owner-only edit/delete controls.

### Profiles
Collector bio, stats, published reading orders (including your own private ones on your own profile), recent reviews (still mock), and a mock follow button.

### Authentication
Supabase Auth (email/password) via `@supabase/ssr`, with `proxy.ts` (Next.js 16's current session-refresh convention) and `getUser()`-based identity verification everywhere it matters. Sign-up, sign-in, sign-out, and protected-route redirects all working and verified end to end.

### Profile onboarding
A distinct post-signup step (`/onboarding`) that establishes a public `profiles` row — separate from authentication itself, matching the product requirement that these are two different capabilities.

### Supabase integration — reading orders
`reading_orders` and `reading_order_entries` tables with Row Level Security enforcing public/private visibility and strict ownership on every mutation. Full create/read/update/delete implemented via Server Actions, each independently validating the user, the input, and resource ownership. Verified with a live two-account attack test (see `docs/architecture.md`).

## Planned

Listed roughly in dependency order — most of these build on the repository seam already established, per `docs/architecture.md`.

### Save and follow functionality
Move the `SaveButton`/`FollowButton` local-only toggles behind Server Actions backed by `saved_reading_orders` and `follows` tables, so these actions persist and propagate across pages instead of being client-local UI state.

### Reviews
A real `reviews` table + RLS, and a full review-creation workflow (rating a collected edition, writing a review, sub-ratings) — currently mock-data-backed display only, deliberately decoupled from the real `profiles` table (see `docs/architecture.md`).

### Cover image and avatar uploads
Supabase Storage-backed uploads, replacing the current plain pasted-URL fields.

### Reading-order detail improvements
Server-persisted view counts (currently static at creation time), and richer "last updated" surfacing tied to actual edits (the `updated_at` trigger already exists — this is a display/UX layer on top of data that's already correct).

### Discover improvements
Server-side search once the catalog is too large for client-side filtering to stay fast; pagination; URL-synced filter state (explicitly deferred per the original brief, "do not build complex URL-state synchronization unless it can be implemented cleanly").

### Profile improvements
Editable profile fields (currently set once at onboarding), real follower/following counts and lists once follows exist, and a per-user "saved reading orders" library view once saves exist.

### Collection tracking
Owned / wanted / previously-read status per collected edition, per user — depends on the standardized collected-edition database below.

### Standardized collected-edition database
A real `collected_editions` catalog (rather than free-text entry titles) that reading-order entries and reviews can reference by ID, enabling cross-referencing, deduplication, and eventually structured search/filter by edition attributes (binding, publisher imprint, page count, etc.).

### Test suite
A test runner (Vitest is a natural fit) covering the pure functions already isolated for this (`lib/utilities`, `features/reading-orders/utils/filter-sort.ts`) plus the Server Actions' validation/ownership logic.
