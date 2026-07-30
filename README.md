# Omni Odyssey

A community platform for collectors of omnibuses, absolute editions, deluxe hardcovers, compendiums, and manga deluxe editions. Omni Odyssey's defining feature is helping collectors navigate complicated comic-book continuity through community-created **reading orders**: ordered sequences of collected editions, issues, story arcs, and notes that map out the recommended way to read a character, creator, event, or era.

This repository currently contains the **frontend MVP**: a fully designed, fully interactive Next.js application running entirely on local mock data. There is no real backend yet — see [Planned Supabase integration](#planned-supabase-integration) below.

## Product overview

Collectors already do the work of figuring out reading orders by hand, and that knowledge is scattered across forum threads, wikis, and blog posts. Omni Odyssey gives it a permanent, structured, browsable home, built specifically around the physical/collected-edition side of comics collecting (so reviews cover binding and paper quality alongside the story, not just star ratings).

## MVP features

- **Discovery** — featured and recently updated reading orders, full-text search, publisher/category filters, and sort order, all client-side over the mock catalog.
- **Reading-order detail pages** — title, creator, description, cover art, publisher/category badges, ordered entries with notes, save count, estimated book count, last-updated timestamp, related reading orders, and a mock save button.
- **Reading-order creation** — a validated form (React Hook Form + Zod) for title, summary, publishers, categories, visibility, and an optional cover image, plus a dynamic list of entries that can be added, removed, and **reordered by drag and drop** (keyboard-accessible via dnd-kit), a live preview, and a mock submission with success feedback.
- **Collector profiles** — avatar, bio, stats, published reading orders, recent reviews, and a mock follow button.
- **Reviews** — collected-edition reviews with an overall rating plus optional binding/paper-quality/mapping/extras sub-ratings, each rendered both visually (stars) and numerically.
- **Custom not-found pages** for missing reading orders and missing collector profiles, plus a global 404.
- **Light and dark mode**, following the system preference by default.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page: hero, featured reading orders, "how it works," recent reviews, community CTA. |
| `/discover` | Browse and search public reading orders with client-side publisher/category filters and sort. |
| `/reading-orders/[slug]` | Reading-order detail: metadata, ordered entries, related orders, mock save button. Falls back to a dedicated not-found page for unknown slugs. |
| `/reading-orders/create` | The reading-order builder: validated form, drag-and-drop entries, live preview, mock submission. |
| `/users/[username]` | Collector profile: bio, stats, published reading orders, recent reviews, mock follow button. Falls back to a dedicated not-found page for unknown usernames. |
| `/reviews` | All collected-edition reviews. |
| `/about` | Product explainer and current-status notes. |

Any other path falls back to the root `not-found.tsx`.

## Technology stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript (strict mode)
- Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com) (on top of [Base UI](https://base-ui.com) primitives)
- React Hook Form + Zod (`@hookform/resolvers`)
- [dnd-kit](https://dndkit.com) for drag-and-drop entry reordering
- Lucide React for icons

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack). |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run `tsc --noEmit`. |

There is no test suite in this phase (see [Current limitations](#current-limitations)). Pure functions in `lib/utilities`, `lib/repositories`, and `features/reading-orders/utils/filter-sort.ts` were written to be trivially unit-testable once a runner is added.

## Project structure

```text
src/
  app/                       Routes (App Router)
    reading-orders/[slug]/   Reading-order detail + not-found
    reading-orders/create/   Reading-order builder
    users/[username]/        Collector profile + not-found
    discover/  reviews/  about/
  components/
    layout/                  Header, footer, page container
    navigation/               Search input, mobile nav, user menu
    reading-orders/           Cards, badges, cover art, metadata, entry list, save button
    reviews/                  Review card, rating display
    profiles/                 Creator summary, stats, follow button
    forms/                    Field error, confirmation message (built on Card)
    shared/                   Section heading, empty state, loading skeleton, avatar, metadata stat
    ui/                       shadcn/ui primitives
  features/
    reading-orders/
      schemas/                Zod schema + inferred input types for the create form
      types/                  Search/sort filter types
      utils/                  Pure filter/sort logic shared by the repository and the client
      components/             The create-form itself, the draggable entry editor, discover browser
  lib/
    constants/                Publisher/category/entry-type label maps, nav links
    mock-data/                Users, reading orders (with entries), reviews
    mock-current-user.ts      The one mock "logged in" user — explicitly not real auth
    repositories/             The only modules allowed to import mock-data / mock-current-user directly
    utilities/                slugify, date formatting, number formatting, text truncation
  types/
    domain.ts                 UserProfile, ReadingOrder, ReadingOrderEntry, CollectedEditionReview
```

See [docs/architecture.md](docs/architecture.md) for the reasoning behind this structure, especially the repository abstraction and the Server/Client Component boundaries.

## Architectural decisions

- **Repository layer, not direct mock-data imports.** Pages and components call functions like `getFeaturedReadingOrders()` or `getReadingOrderBySlug(slug)` from `lib/repositories`, never the mock arrays directly. When Supabase is introduced, only these repository functions change (most becoming `async`); call sites should not need to change.
- **Server Components by default.** Every page and most display components are Server Components. `"use client"` is used only where real interactivity is required: the create-order form and its field array, the drag-and-drop entry editor, the discover page's live filtering, the mobile nav sheet, the user menu, and the save/follow buttons.
- **Domain types are the single source of truth.** `types/domain.ts` defines `UserProfile`, `ReadingOrder`, `ReadingOrderEntry`, and `CollectedEditionReview` exactly as specified, plus string-union types for `Publisher`, `ReadingOrderCategory`, `ReadingOrderVisibility`, and `ReadingOrderEntryType`. Mock data, Zod schemas, and UI components all consume these same types.
- **Mock current user is explicitly isolated and labeled as insecure.** `lib/mock-current-user.ts` exports a single fixed `UserProfile`, accessed exclusively through `getCurrentUser()` in `lib/repositories` (never imported directly outside the repository layer) and used for every "logged in" affordance in the app. It is documented in-file as not a security boundary.
- **Editorial visual identity.** A custom warm "ink and paper" theme (Tailwind v4 CSS-variable tokens, `Fraunces` for headings, `Geist` for body/UI text) replaces the default shadcn neutral palette, with a single restrained amber accent rather than a multi-color system.
- **Two "boxed surface" conventions, deliberately.** Solid bordered surfaces (`Card`/`CardContent`) are used for the reading-order builder's entry rows and the confirmation message; a distinct dashed-border treatment (`EmptyState`) signals "nothing here yet." Other repeated markup patterns (icon + label metadata rows) are consolidated into small shared components (e.g. `MetadataStat`) rather than copy-pasted across cards.

## Responsive and accessibility expectations

- **Responsive**: layouts are checked at ~375px (mobile), 768px (tablet), 1280px, and 1440px+ (desktop). Grids collapse from 4 → 3 → 2 columns; the mobile nav uses a slide-out sheet; the discover filter row's selects shrink and wrap below the `sm` breakpoint rather than overflowing.
- **Forms**: every input has a visible `<Label>`; validation errors are wired via `aria-invalid`/`aria-describedby` to a `FormFieldError`, including on the dynamic entry fields and the publisher/category checkbox groups.
- **Icon-only controls** (menu toggle, remove-entry, drag handle, account menu) all carry `aria-label`.
- **Ratings** are never color-only: `RatingDisplay` always renders a numeric value and an `sr-only` text equivalent alongside the star graphic.
- **Drag-and-drop** entry reordering works via mouse and via keyboard (dnd-kit's `KeyboardSensor`: Space to pick up, arrow keys to move, Space to drop, Escape to cancel), and announces entry-specific position changes to screen readers via `DndContext`'s `accessibility.announcements`.
- **Not claiming full compliance.** This has been checked manually and with headless-browser scripted verification (drag-and-drop, form validation wiring, focus-visible matching, heading hierarchy, console/hydration-warning sweeps across every route) — it has not been audited with a screen reader or automated accessibility scanner. See [ISSUES.md](ISSUES.md) for a specific, currently-open finding around Button focus-ring rendering.

## Current limitations

- **No real backend.** No Supabase, no authentication provider, no database, no server actions, no API routes. All data lives in memory in `lib/mock-data`.
- **Mutations are session-local and client-scoped.** `createReadingOrderMock` and `saveReadingOrderMock` in the repository layer exist as the intended seam for a future backend call, but because there are no server actions in this phase, the create-form calls `createReadingOrderMock` directly from client code. That mutates an in-memory array that exists only in the browser's JS bundle for that page — it does **not** propagate to the server-rendered Discover page or persist across a refresh. The `SaveButton` and `FollowButton` are deliberately pure client-local UI state for the same reason.
- **No test suite.** The project was scaffolded without one; see the "Recommended next phase" below. Pure utility/repository functions (`lib/utilities`, `lib/repositories`, `features/reading-orders/utils/filter-sort.ts`) were written to be trivially unit-testable once a test runner is added.
- **Cover art is always a generated abstract placeholder.** All mock `coverImageUrl` fields are empty strings by design, to avoid depending on external image hosts or copyrighted artwork; `ReadingOrderCover` renders a deterministic gradient + title treatment instead. The component does support real image URLs (via `next/image`) whenever `coverImageUrl` is set — this path is simply unused by the current mock dataset.

See [ISSUES.md](ISSUES.md) for currently-open technical findings and [ROADMAP.md](ROADMAP.md) for what's planned beyond this phase.

## Planned Supabase integration

The anticipated next-phase backend, per the original product brief, adds Supabase for Postgres, auth, Row Level Security, and storage, with tables roughly mapping to: `profiles`, `collected_editions`, `reading_orders`, `reading_order_entries`, `saved_reading_orders`, `follows`, `reviews`, `user_collections`, and `collection_statuses`. The repository functions in `lib/repositories` are the intended integration point — see [docs/architecture.md](docs/architecture.md#future-database-integration-points) for specifics on what changes and what shouldn't.

## Recommended next development phase

1. Introduce Supabase and replace `lib/repositories` internals with real queries (start with read paths — `getFeaturedReadingOrders`, `getReadingOrderBySlug`, etc. — since call sites are already isolated from storage details).
2. Add Supabase Auth and replace `lib/mock-current-user.ts` with a real session.
3. Move `createReadingOrderMock` and `saveReadingOrderMock` behind Server Actions so mutations actually persist and propagate.
4. Add a test runner (Vitest is a natural fit given no other testing infra exists yet) and cover the pure functions already isolated for this: reading-order filtering/sorting, Zod validation, and slug/date utilities.
5. Build out the full review-creation workflow (intentionally out of scope for this MVP).
