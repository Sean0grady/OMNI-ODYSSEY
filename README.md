# Omni Odyssey

A community platform for collectors of omnibuses, absolute editions, deluxe hardcovers, compendiums, and manga deluxe editions. Omni Odyssey's defining feature is helping collectors navigate complicated comic-book continuity through community-created **reading orders**: ordered sequences of collected editions, issues, story arcs, and notes that map out the recommended way to read a character, creator, event, or era.

This repository now includes a **real backend**: Supabase Auth (email/password) and Postgres back accounts, public collector profiles, and reading orders end to end, with Row Level Security enforcing ownership and visibility. Saves, follows, reviews, comments, collection tracking, image uploads, and OAuth are still frontend-only or mock — see [Current limitations](#current-limitations).

## Product overview

Collectors already do the work of figuring out reading orders by hand, and that knowledge is scattered across forum threads, wikis, and blog posts. Omni Odyssey gives it a permanent, structured, browsable home, built specifically around the physical/collected-edition side of comics collecting (so reviews cover binding and paper quality alongside the story, not just star ratings).

## Features

- **Accounts** — email/password sign-up and sign-in via Supabase Auth, with a distinct onboarding step to establish a public collector profile (username, display name, bio, location, favorite publishers).
- **Reading orders, for real** — create, edit, and delete your own reading orders with ordered entries, persisted in Postgres. Public orders are discoverable by anyone; private orders are visible only to their owner, enforced by Row Level Security (not just hidden UI).
- **Discovery** — full-text-ish search, publisher/category filters, and sort order over public reading orders.
- **Reading-order detail pages** — title, creator, description, cover art, publisher/category badges, ordered entries with notes, save count, estimated book count, last-updated timestamp, related reading orders, a mock save button, and owner-only edit/delete controls.
- **Reading-order builder** — a validated form (React Hook Form + Zod, re-validated server-side) with a dynamic entry list, **drag-and-drop reordering** (keyboard-accessible via dnd-kit), a live preview, and real persistence via Server Actions.
- **Collector profiles** — avatar, bio, stats, published reading orders (including your own private ones when you're viewing your own profile), recent reviews, and a mock follow button.
- **Reviews** — still fully mock-data-backed this phase (see [Current limitations](#current-limitations)); rendered with both a visual and numeric rating.
- **Custom not-found pages** for missing reading orders and missing collector profiles, plus a global 404.
- **Light and dark mode**, following the system preference by default.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page: hero, featured reading orders, "how it works," recent reviews, community CTA. |
| `/discover` | Browse and search public reading orders with client-side publisher/category filters and sort. |
| `/reading-orders/[slug]` | Reading-order detail. Private orders 404 for everyone except their owner. Owner sees Edit/Delete. |
| `/reading-orders/create` | The reading-order builder. Requires sign-in and a completed profile. |
| `/reading-orders/[slug]/edit` | Edit an existing reading order. Owner-only; 404s for anyone else. |
| `/users/[username]` | Collector profile: bio, stats, published reading orders, recent reviews, mock follow button. |
| `/reviews` | All collected-edition reviews (mock data). |
| `/about` | Product explainer and current-status notes. |
| `/sign-up`, `/sign-in` | Auth pages. |
| `/onboarding` | One-time public-profile setup after sign-up, before you can create anything. |

Any other path falls back to the root `not-found.tsx`.

## Technology stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, `proxy.ts` — the current, non-deprecated replacement for `middleware.ts`)
- TypeScript (strict mode)
- [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security, via `@supabase/supabase-js` and `@supabase/ssr`
- Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com) (on top of [Base UI](https://base-ui.com) primitives)
- React Hook Form + Zod (`@hookform/resolvers`), validated again server-side in every Server Action
- [dnd-kit](https://dndkit.com) for drag-and-drop entry reordering
- Lucide React for icons

## Local development

### 1. Set up a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. From **Project Settings → API**, copy the **Project URL** and **publishable (anon) key**.
3. Copy `.env.example` to `.env.local` and fill in those two values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```
   Both are safe to expose to the browser by design — Row Level Security is the real authorization boundary, not secrecy of these values. The project's **secret/service-role key** is never used anywhere in this app; don't put it in any `NEXT_PUBLIC_*` variable or commit it anywhere.
4. Install the Supabase CLI (already a devDependency — `npx supabase ...`), then:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   npx supabase gen types typescript --linked > src/types/database.types.ts
   ```
5. In **Auth → Providers → Email**, decide whether to keep "Confirm email" on (default; realistic, but the default shared email sender has a low rate limit) or off (faster local iteration — recommended while developing).

### 2. Run the app

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

There is no test suite in this phase (see [Current limitations](#current-limitations)). Pure functions in `lib/utilities` and `features/reading-orders/utils/filter-sort.ts` were written to be trivially unit-testable once a runner is added.

## Project structure

```text
src/
  app/
    (auth)/sign-up/, (auth)/sign-in/   Auth pages, shared minimal layout
    onboarding/                        One-time public-profile setup
    reading-orders/[slug]/             Detail + not-found
    reading-orders/[slug]/edit/        Owner-only edit
    reading-orders/create/             Reading-order builder
    users/[username]/                  Collector profile + not-found
    discover/  reviews/  about/
  components/                          Same organization as before — cards, badges, layout, forms, ui/
  features/
    auth/               schemas, sign-up/sign-in forms, sign-out action
    profiles/            onboarding schema/form/action
    reading-orders/
      schemas/           Zod schema + inferred input types, shared by create and edit
      actions/           createReadingOrderAction, updateReadingOrderAction, deleteReadingOrderAction
      utils/             Pure filter/sort logic shared by the repository and the client
      components/        The (create/edit) form, draggable entry editor, discover browser
  lib/
    supabase/            client.ts (browser), server.ts (per-request server client factory)
    constants/            Publisher/category/entry-type label maps, nav links
    mock-data/            Users, reading orders — no longer used by the real repositories; kept as
                           reference/future seed data. Reviews still use MOCK_REVIEWS/MOCK_USERS.
    repositories/          users.ts and reading-orders.ts now query Supabase; reviews.ts stays mock
    utilities/             slugify, date formatting, number formatting, text truncation
  types/
    domain.ts              UserProfile, ReadingOrder, ReadingOrderEntry, CollectedEditionReview
    database.types.ts      Generated from the live Supabase schema (`supabase gen types typescript`)
  proxy.ts                 Session-cookie refresh + route protection (Next 16's proxy convention)

supabase/
  migrations/               SQL migrations (schema + Row Level Security), applied via the CLI
```

See [docs/architecture.md](docs/architecture.md) for the reasoning behind this structure, the RLS design, and the auth/onboarding/mutation flows in detail.

## Architectural decisions

- **Repository layer, now real.** `lib/repositories/{users,reading-orders}.ts` query Supabase directly; `reviews.ts` stays mock-backed (see below). Call sites (pages) were already isolated from storage details, so most of this migration was repository-internal — the plan this followed is fully documented in `docs/architecture.md`.
- **Server Components by default**, with a fresh request-scoped Supabase client (`lib/supabase/server.ts`) created per call — never a shared/singleton client, since that would leak one user's session into another user's request.
- **`getUser()`, not `getSession()`**, everywhere identity is checked server-side — it re-validates the JWT against Supabase Auth rather than trusting a decoded cookie.
- **Mutations are Server Actions**, each independently validating the authenticated user, re-validating input with Zod (never trusting client-side validation alone), verifying resource ownership explicitly (not solely relying on RLS), and returning a typed `{success, ...}` / `{success: false, error}` result — never a raw database error.
- **Row Level Security is the real authorization boundary.** Public/private reading-order visibility and all ownership checks are enforced in Postgres policies, not just hidden UI. See `docs/architecture.md` for the exact policies and the one genuinely tricky part (entry mutation policies must be ownership-only, never "public-or-owner").
- **Reviews stay fully mock-data-backed this phase**, deliberately decoupled from the real `profiles` table — `reviews.ts` resolves review authors from `MOCK_USERS` internally rather than through the real `getUserById`, since a real Supabase profile's UUID will never match a mock review's `authorId`.
- **Domain types are still the single source of truth.** `types/domain.ts` is unchanged; Supabase row shapes (`database.types.ts`) are mapped into these domain types inside the repository layer, so nothing above the repository boundary needs to know about the database schema.
- **Editorial visual identity, unchanged.** The warm "ink and paper" theme, `Fraunces` headings, and restrained amber accent are untouched by this phase.

## Responsive and accessibility expectations

- **Responsive**: layouts are checked at ~375px (mobile), 768px (tablet), 1280px, and 1440px+ (desktop).
- **Forms**: every input has a visible `<Label>`; validation errors are wired via `aria-invalid`/`aria-describedby`, including the auth, onboarding, and reading-order forms.
- **Icon-only controls** all carry `aria-label`.
- **Ratings** are never color-only: numeric value plus an `sr-only` text equivalent alongside the star graphic.
- **Drag-and-drop** entry reordering works via mouse and keyboard, with screen-reader announcements.
- **Not claiming full compliance.** Checked manually and with headless-browser scripted verification (full sign-up → onboarding → create → edit → delete loop, plus an explicit two-account RLS attack test); not audited with a screen reader or automated accessibility scanner. See [ISSUES.md](ISSUES.md).

## Current limitations

- **Clean cutover, no seed data.** The pre-existing mock reading orders and collector profiles were not migrated into Supabase. Discover and profile pages are empty until real accounts create real content. Mock data files remain in the repo, unused by the live repositories, as reference/future seed material.
- **Reviews, saves, and follows are still not real.** `SaveButton` and `FollowButton` remain pure client-local UI state (no repository calls, no persistence) — implementing them for real requires their own tables/policies, out of scope this phase. Reviews are still fully mock-data-backed.
- **No image uploads.** Cover image URLs are still just a pasted URL, not a Supabase Storage upload.
- **No OAuth.** Email/password only, per this phase's scope.
- **No DB-level enum for `publishers`/`categories`.** Validated by Zod on every write path; a manual database edit could bypass that. Acceptable tradeoff for this phase.
- **No test suite.** Pure functions are written to be testable once a runner is added.

See [ISSUES.md](ISSUES.md) for currently-open technical findings and [ROADMAP.md](ROADMAP.md) for what's planned beyond this phase.

## Recommended next development phase

1. Saves and follows, for real — `saved_reading_orders` and `follows` tables, Server Actions, RLS.
2. The full review-creation workflow, backed by a real `reviews` table (currently mock-only).
3. Supabase Storage for cover images and avatars, replacing the plain-URL fields.
4. A standardized `collected_editions` catalog so reading-order entries and reviews can reference real editions instead of free text.
5. A test runner (Vitest is a natural fit) covering the pure functions already isolated for this, plus the Server Actions' validation/ownership logic.
