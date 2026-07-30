# Roadmap

This tracks Omni Odyssey's progress at a feature/phase level. For specific known bugs and technical findings, see [ISSUES.md](ISSUES.md). For architectural reasoning, see [docs/architecture.md](docs/architecture.md).

## Completed

### Frontend foundation
Next.js 16 App Router project, TypeScript strict mode, Tailwind v4 with a custom editorial theme, shadcn/ui component primitives, domain types, mock data, and a repository abstraction layer. All 7 required routes implemented with custom not-found handling. Verified with a foundation audit and stabilization pass (see [ISSUES.md](ISSUES.md) for what that pass found).

### Reading-order builder
Zod-validated creation form (React Hook Form) with dynamic entries, drag-and-drop reordering (dnd-kit, mouse and keyboard, with screen-reader announcements), a live preview, and mock submission with success feedback.

### Discover
Client-side search, publisher/category filtering, and sort order over the mock catalog, with a shared filter/sort utility reused by the repository layer.

### Reading-order detail
Full metadata display, ordered entries with notes, related reading orders, and a mock save button.

### Profiles
Collector bio, stats, published reading orders, recent reviews, and a mock follow button.

## Planned

Listed roughly in dependency order — most of these build on the repository seam already established, per `docs/architecture.md`.

### Supabase integration
Introduce Postgres via Supabase; replace `lib/repositories` internals with real queries starting with read paths (`getFeaturedReadingOrders`, `getReadingOrderBySlug`, `searchReadingOrders`, etc.), since call sites are already storage-agnostic.

### Authentication
Add Supabase Auth; replace `lib/mock-current-user.ts` and `getCurrentUser()` with a real session lookup. Establishes the account boundary that save/follow/create currently only simulate.

### Save and follow functionality
Move `saveReadingOrderMock`/the follow interaction behind Server Actions backed by `saved_reading_orders` and `follows` tables, so these actions persist and propagate across pages instead of being client-local UI state.

### Reading-order detail improvements
Server-persisted view/save counts, real "last updated" tracking tied to actual edits, and (once accounts exist) edit/unpublish controls for the order's own creator.

### Discover improvements
Server-side search once the catalog is too large for client-side filtering to stay fast; pagination; URL-synced filter state (explicitly deferred in the MVP per the original brief, "do not build complex URL-state synchronization unless it can be implemented cleanly").

### Profile improvements
Editable profile fields, real follower/following counts and lists, and a per-user "saved reading orders" library view.

### Reviews
Full review-creation workflow (rating a collected edition, writing a review, sub-ratings) — the MVP only ships review *display*, by design.

### Collection tracking
Owned / wanted / previously-read status per collected edition, per user — depends on the standardized collected-edition database below.

### Standardized collected-edition database
A real `collected_editions` catalog (rather than free-text entry titles) that reading-order entries and reviews can reference by ID, enabling cross-referencing, deduplication, and eventually structured search/filter by edition attributes (binding, publisher imprint, page count, etc.).
