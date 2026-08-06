# Omni Odyssey

A community platform for collectors of omnibuses, absolute editions, deluxe hardcovers, compendiums, and manga deluxe editions. Omni Odyssey's defining feature is helping collectors navigate complicated comic-book continuity through community-created **reading orders**: ordered sequences of collected editions, issues, story arcs, and notes that map out the recommended way to read a character, creator, event, or era.

This repository includes a **real backend**: Supabase Auth (email/password) and Postgres back accounts, public collector profiles, reading orders, saves, follows, reviews, and image uploads end to end, with Row Level Security enforcing ownership and visibility throughout. Comments, collection tracking, and OAuth are not implemented — see [Current limitations](#current-limitations).

<img src="screenshots\Screenshot 2026-08-02 111625.png">

## Product overview

Collectors already do the work of figuring out reading orders by hand, and that knowledge is scattered across forum threads, wikis, and blog posts. Omni Odyssey gives it a permanent, structured, browsable home, built specifically around the physical/collected-edition side of comics collecting (so reviews cover binding and paper quality alongside the story, not just star ratings).

## Features

- **Accounts** — email/password sign-up and sign-in via Supabase Auth, with a distinct onboarding step to establish a public collector profile (username, display name, bio, location, favorite publishers).
- **Reading orders, for real** — create, edit, and delete your own reading orders with ordered entries, persisted in Postgres. Public orders are discoverable by anyone; private orders are visible only to their owner, enforced by Row Level Security (not just hidden UI).
- **Discovery** — full-text-ish search, publisher/category filters, and sort order over public reading orders.
- **Reading-order detail pages** — title, creator, description, cover art, publisher/category badges, ordered entries with notes, save count, estimated book count, last-updated timestamp, related reading orders, a working save button, and owner-only edit/delete controls.
- **Reading-order builder** — a validated form (React Hook Form + Zod, re-validated server-side) with a dynamic entry list, **drag-and-drop reordering** (keyboard-accessible via dnd-kit), a live preview, and real persistence via Server Actions.
- **Saves and follows** — persisted in Postgres via Server Actions. Saving a reading order updates its stored save count through a database trigger; follower/following counts on profiles are real queries. Your saved reading orders are listed back to you on your own profile.
- **Collector profiles** — avatar, bio, real stats (reading orders, reviews, followers, following), published reading orders (including your own private ones when you're viewing your own profile), a private "Saved reading orders" section visible only to you, recent reviews, and a working follow button (hidden on your own profile).
- **Reviews** — write and browse collected-edition reviews with an overall rating plus optional binding, paper-quality, mapping, and extras sub-ratings; rendered with both a visual and numeric rating.
- **Image uploads** — cover art and avatars upload to Supabase Storage, scoped per user by folder-prefix RLS.
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
| `/users/[username]` | Collector profile: bio, stats, published reading orders, recent reviews, follow button. |
| `/reviews` | All collected-edition reviews. |
| `/reviews/create` | Write a review. Requires sign-in. |
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
| `npm run test` | Run the Vitest test suite. |

[Vitest](https://vitest.dev) covers the pure functions in `lib/utilities` and `features/reading-orders/utils/filter-sort.ts`, plus the validation/ownership logic of the reading-order and profile Server Actions (mocking the Supabase client via `src/test/fake-supabase.ts`). Not yet covered: the save/follow, review-creation, and upload Server Actions — `src/test/fake-supabase.ts` is designed to be reused for those — and there are no component/UI-level tests.

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
    reviews/  reviews/create/          Review list + creation form
    discover/  about/
  components/                          Cards, badges, layout, forms, ui/
    shared/image-upload-field.tsx      Supabase Storage upload, reused by covers and avatars
    reviews/rating-input.tsx           Interactive 1–5 star control (keyboard-accessible)
  features/
    auth/               schemas, sign-up/sign-in forms, sign-out action
    profiles/            onboarding schema/form/action, follow/unfollow actions
    reading-orders/
      schemas/           Zod schema + inferred input types, shared by create and edit
      actions/           create/update/delete, plus save/unsave
      utils/             Pure filter/sort logic shared by the repository and the client
      components/        The (create/edit) form, draggable entry editor, discover browser
    reviews/             schema, create-review action, review form
  lib/
    supabase/            client.ts (browser), server.ts (per-request server client factory)
    constants/            Publisher/category/entry-type label maps, nav links
    mock-data/            Users, reading orders, reviews — no longer used by any repository;
                           kept as reference/future seed data.
    repositories/          users, reading-orders, reviews, saves, follows — all query Supabase
    utilities/             slugify, date formatting, number formatting, text truncation
  types/
    domain.ts              UserProfile, ReadingOrder, ReadingOrderEntry, CollectedEditionReview
    database.types.ts      Generated from the live Supabase schema (`supabase gen types typescript`)
  test/fake-supabase.ts    Chainable Supabase client fake used by the Server Action tests
  proxy.ts                 Session-cookie refresh + route protection (Next 16's proxy convention)

supabase/
  migrations/               SQL migrations (schema + Row Level Security), applied via the CLI
```

See [docs/architecture.md](docs/architecture.md) for the reasoning behind this structure, the RLS design, and the auth/onboarding/mutation flows in detail.

## Architectural decisions

- **Repository layer, fully real.** Every module in `lib/repositories/` (`users`, `reading-orders`, `reviews`, `saves`, `follows`) queries Supabase directly. Call sites (pages) were already isolated from storage details, so most of this migration was repository-internal — the plan this followed is fully documented in `docs/architecture.md`.
- **Server Components by default**, with a fresh request-scoped Supabase client (`lib/supabase/server.ts`) created per call — never a shared/singleton client, since that would leak one user's session into another user's request.
- **`getUser()`, not `getSession()`**, everywhere identity is checked server-side — it re-validates the JWT against Supabase Auth rather than trusting a decoded cookie.
- **Mutations are Server Actions**, each independently validating the authenticated user, re-validating input with Zod (never trusting client-side validation alone), verifying resource ownership explicitly (not solely relying on RLS), and returning a typed `{success, ...}` / `{success: false, error}` result — never a raw database error.
- **Row Level Security is the real authorization boundary.** Public/private reading-order visibility and all ownership checks are enforced in Postgres policies, not just hidden UI. See `docs/architecture.md` for the exact policies and the one genuinely tricky part (entry mutation policies must be ownership-only, never "public-or-owner").
- **`save_count` is kept in sync by a `security definer` trigger.** A user saving someone else's reading order has no `UPDATE` grant on that row (the policy is creator-only), so incrementing the stored counter from application code would be blocked by RLS. The trigger exists to perform exactly that one increment/decrement — nothing else in the schema bypasses RLS.
- **Storage access is folder-scoped, not bucket-scoped.** Uploads land at `{auth.uid()}/{uuid}.{ext}` in a single public `images` bucket, and the `storage.objects` policies check `(storage.foldername(name))[1] = auth.uid()::text`. Public read, owner-only write — verified against the live project, including that writing into another user's folder is rejected.
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

- **Clean cutover, no seed data.** The pre-existing mock reading orders, collector profiles, and reviews were not migrated into Supabase. Discover, reviews, and profile pages are empty until real accounts create real content. Mock data files remain in the repo, unused by the live repositories, as reference/future seed material.
- **Reviews can be written but not edited or deleted from the UI.** The RLS policies allow owner-only update and delete; there's just no UI for either yet.
- **No profile editing.** Avatar and profile fields are set once at onboarding — there's no edit-profile flow, so an avatar can't be changed after the fact from the UI.
- **No follower/following list views.** Follows persist and drive the counts on profiles, but there's no page listing who follows whom.
- **No comments or collection tracking.** Owned/wanted/read status per edition is not implemented.
- **No OAuth.** Email/password only.
- **No DB-level enum for `publishers`/`categories`.** Validated by Zod on every write path; a manual database edit could bypass that. Acceptable tradeoff for now.
- **Test suite is partial.** Vitest covers pure functions and the reading-order/profile Server Actions; the save/follow, review-creation, and upload actions aren't covered yet, and there are no component/UI tests.

See [ISSUES.md](ISSUES.md) for currently-open technical findings and [ROADMAP.md](ROADMAP.md) for what's planned next.

## Recommended next development phase

1. A standardized `collected_editions` catalog so reading-order entries and reviews can reference real editions instead of free text.
2. Profile editing (including changing your avatar) and a saved-reading-orders library view.
3. Follower/following list views, and review edit/delete UI on top of the policies that already allow them.
4. Extending the Vitest suite to the save/follow, review, and upload Server Actions — `src/test/fake-supabase.ts` is built to be reused for exactly this.
5. Collection tracking (owned / wanted / previously read), which depends on the collected-edition catalog above.
