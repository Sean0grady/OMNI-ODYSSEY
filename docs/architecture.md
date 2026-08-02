# Architecture

This document explains the structural decisions behind Omni Odyssey: where domain boundaries sit, how the Supabase-backed repository layer works, why specific components are Server vs. Client, how authentication and session refresh work, the Row Level Security design, and the reading-order mutation flow.

## Domain boundaries

All domain modeling lives in one place: `src/types/domain.ts`. It defines the four core entities from the product brief —

- `UserProfile`
- `ReadingOrder`
- `ReadingOrderEntry`
- `CollectedEditionReview`

— plus the string-union types they depend on: `Publisher`, `ReadingOrderCategory`, `ReadingOrderVisibility`, `ReadingOrderEntryType`. These are plain string unions rather than TypeScript `enum`s: they serialize cleanly, work directly with `z.enum(...)` in the Zod schemas, and map straightforwardly onto Postgres `text`/`text[]` columns without a separate DB enum type (see [Row Level Security and schema design](#row-level-security-and-schema-design)).

Human-readable labels for these unions live in `src/lib/constants/catalog.ts` as `Record<Union, string>` maps, kept separate from the domain types so the domain layer stays free of presentation concerns.

Everything above the repository layer — Zod schemas, Server Actions, and UI components — imports these same domain types. Supabase's generated row shapes (`src/types/database.types.ts`, produced by `supabase gen types typescript`) are a separate, lower-level type that only the repository layer and Server Actions ever see directly; they get mapped into `UserProfile`/`ReadingOrder`/`ReadingOrderEntry` before crossing that boundary. Nothing above the repository layer needs to know a column is `snake_case` or that `favorite_publishers` is a Postgres `text[]`.

The reading-order creation/edit form does **not** reuse `ReadingOrder`/`ReadingOrderEntry` directly — they carry server-assigned fields (`id`, `saveCount`, `createdAt`, …) that don't exist yet at submit time. `src/features/reading-orders/schemas/reading-order-schema.ts` defines a Zod schema and derives `CreateReadingOrderInput`/`ReadingOrderEntryInput` from it via `z.infer`, so validation rules and TypeScript types can never drift apart — and the same schema is re-validated server-side inside every mutating Server Action, never trusted from the client alone.

## The repository abstraction

`src/lib/repositories/{users,reading-orders}.ts` are the only modules that query Supabase directly. Every page and Server Action goes through their exported functions — `getFeaturedReadingOrders()`, `getReadingOrderBySlug(slug)`, `getReadingOrdersByUserId(userId)`, `getRelatedReadingOrders(order)`, `searchReadingOrders(filters)`, `getUserByUsername(username)`, `getUserById(userId)`, `getCurrentUser()` — never a raw Supabase client or table name from outside `lib/repositories`.

**`src/lib/repositories/reviews.ts` is the one exception, deliberately**: reviews are still fully mock-data-backed this phase (out of scope for the Supabase migration). Its `getRecentReviews()`/`getReviewsByUserId(userId)` resolve authors internally from `MOCK_USERS` and return pre-joined `{ review, author }` pairs, rather than going through the real `getUserById`. This isn't a shortcut — it's necessary: real Supabase profile ids are auth UUIDs, and a mock review's `authorId` (e.g. `"user-marcus"`) will never match one. Routing review-author lookups through the real `users.ts` would silently break every review's author display the moment reviews encountered a real user id. `lib/mock-data/{users,reading-orders}.ts` still exist for this reason (and as future seed material) but are otherwise unused by the live repositories.

Each Supabase-backed repository function creates its own fresh, request-scoped client via `lib/supabase/server.ts` — see [Authentication and session handling](#authentication-and-session-handling) for why this matters. Listing functions (`getFeaturedReadingOrders`, `getRecentReadingOrders`, `searchReadingOrders`) fetch creator and entries in one round trip using PostgREST's foreign-key embedding (`select("*, creator:profiles(*), entries:reading_order_entries(*)")`), instead of the N+1 pattern a naive per-item lookup would produce. Single-item lookups (`getReadingOrderBySlug`) embed entries but not creator, since a detail page's separate `getUserById` call is a fixed 1+1 cost either way, not something that scales with a list.

`getReadingOrdersByUserId` is worth calling out specifically: it applies **no visibility filter**. Row Level Security already does the right thing — querying `reading_orders where creator_id = X` through the request-scoped, cookie-bound client returns private rows only when the viewer *is* `X`, and public rows to everyone else, with zero application-level branching. Adding `.eq('visibility', 'public')` here (the way `searchReadingOrders` deliberately does, since Discover is "public browsing only" even for your own account) would break "view your own private orders on your own profile." This is intentional and commented in the code — don't "fix" it into a bug.

`searchReadingOrders` and the client-side Discover page share `src/features/reading-orders/utils/filter-sort.ts` — framework- and storage-agnostic pure functions (`matchesReadingOrderFilters`, `sortReadingOrders`, `filterAndSortReadingOrders`) that both the repository (server-side, over the full public catalog) and `DiscoverBrowser` (client-side, over the already-fetched result) call identically. Filtering/sorting happens in JS rather than as Postgres query params — deliberately, since it needs to match across multiple joined fields (title, summary, creator username *and* display name, publishers, categories) and the app's current scale doesn't need database-level full-text search yet. This is flagged in the README as the natural next optimization if the catalog grows.

## Server vs. Client Component decisions

The default is a Server Component. `"use client"` appears only where a component genuinely owns interactive state, browser-only behavior, or talks to Supabase from the browser (auth forms):

| Client component | Why |
| --- | --- |
| `DiscoverBrowser` | Owns live search/filter/sort state. |
| `MobileNav`, `UserMenu` | Open/close and menu state (Sheet / DropdownMenu); render different content based on the `currentUser` prop passed down from the Server Component `SiteHeader`. |
| `SaveButton`, `FollowButton` | Local optimistic toggle state only — saves and follows aren't implemented against Supabase this phase, so these intentionally don't call any repository function; a client-local call would persist nothing a `useState` toggle doesn't already do more cheaply. |
| `SignUpForm`, `SignInForm` | Call `supabase.auth.signUp`/`signInWithPassword` directly via the browser client (`lib/supabase/client.ts`) — the standard, secure `@supabase/ssr` pattern. The publishable key is safe in the browser by design; RLS is the real boundary. |
| `OnboardingForm`, `ReadingOrderForm` and its children (`ReadingOrderMetadataFields`, `ReadingOrderEntryFieldArray`, `ReadingOrderEntryEditor`, `ReadingOrderPreview`) | React Hook Form state, Zod validation, dnd-kit's drag context; submit by calling a Server Action. |
| `DeleteReadingOrderButton` | Confirm-dialog open state; calls a Server Action on confirm. |
| `ThemeProvider`, `Toaster` (sonner) | Browser-only theming/toast infrastructure. |

Everything else is a Server Component, including `SiteHeader` (now `async`, calling `getCurrentUser()` to decide what to pass into `UserMenu`/`MobileNav`) and every page. Pages that read the current user or a reading order's ownership (`reading-orders/[slug]`, `reading-orders/[slug]/edit`, `reading-orders/create`) are Server Components performing that check server-side — the "Edit"/"Delete" buttons only render into the HTML at all when the request's own verified session is the resource's owner; a non-owner never receives that markup, on top of RLS independently blocking the underlying mutation.

## Authentication and session handling

Three Supabase client factories, each with a specific, non-interchangeable purpose:

- **`src/lib/supabase/client.ts`** — `createBrowserClient`, used only inside `"use client"` auth forms (`signUp`, `signInWithPassword`, and `UserMenu`'s `onAuthStateChange` listener for reactive UI updates without a full navigation).
- **`src/lib/supabase/server.ts`** — an `async` factory (not a singleton) that creates a fresh `createServerClient` on every call, wired to `next/headers`' `cookies()`. **Never cache or share the return value across requests** — Server Components are per-request, and a shared client would leak one user's session into another user's request. Every Server Component and Server Action that needs Supabase calls this fresh each time. Its `setAll` cookie handler is wrapped in a `try/catch` because Server Components (unlike Server Actions and `proxy.ts`) can't write response cookies — that's a no-op there, not a bug, because `proxy.ts` is what actually refreshes the session cookie on every request.
- **`src/proxy.ts`** — Next.js 16's current, non-deprecated replacement for `middleware.ts` (renamed in v16; `middleware.ts` still works but is deprecated and Edge-only, while `proxy.ts` is Node.js-runtime-locked, which is what makes `@supabase/ssr` integration friction-free here). Refreshes the auth cookie via a `createServerClient` bound to `request.cookies.getAll()`/`setAll()`, reconstructing `NextResponse.next({ request })` inside `setAll` so refreshed cookies propagate to both the current request and the browser. **No logic runs between `createServerClient(...)` and `await supabase.auth.getUser()`** — this is a hard constraint from Supabase's own guidance; interleaving code there can silently break session refresh in ways that are hard to debug later. Route-protection redirects happen strictly *after* that call. `proxy.ts` protects `/reading-orders/create`, `/onboarding`, and `/reading-orders/*/edit` by redirecting signed-out visitors to `/sign-in?redirect=<path>`.

Everywhere identity is checked server-side (Server Components, Server Actions), the code calls **`supabase.auth.getUser()`**, never `getSession()`. `getSession()` reads the JWT out of cookies without re-validating it against the Supabase Auth server, so its embedded `user` is not something the app can trust for authorization decisions; `getUser()` makes that round trip and returns an authentic result. This is the mechanism behind "the authenticated user ID must come from the verified Supabase authentication context, not the client-submitted form" — every Server Action derives `creator_id`/`id` from `user.id` returned by `getUser()`, never from a field in the submitted form data (and the Zod schemas don't even have a `creatorId`/`id` field, so there's nothing to accidentally trust).

**A caching gotcha worth stating explicitly**: none of these Supabase queries are ever wrapped in `unstable_cache()` or given `next: { revalidate }`. Doing so would move results into Next.js's cross-request Data Cache, which is *not* request-scoped — for an auth-dependent query, that could leak one user's private reading orders into a different user's (or an anonymous visitor's) response. These pages are already implicitly dynamic (they read `cookies()`), which is what keeps every result correctly scoped to the requesting user by default; don't override that for a caching win.

Onboarding (establishing a public `profiles` row) is a distinct step from sign-up, not automatic — `proxy.ts` doesn't force this globally (that would add a database round trip to every single request); instead, individual protected pages (`/reading-orders/create`) call `getCurrentUser()` and redirect to `/onboarding` if it returns `null` (meaning: signed in, but no `profiles` row yet).

## Row Level Security and schema design

Three tables (`supabase/migrations/0001_init.sql`): `profiles` (1:1 with `auth.users`), `reading_orders`, and `reading_order_entries` (owned via the parent order's `creator_id` — entries have no owner column of their own). All three have RLS enabled; there is no code path in this app that disables RLS or uses a service-role/elevated client to bypass it.

The policy shape:

- **`profiles`**: publicly readable (`using (true)`); insert/update restricted to `auth.uid() = id`. No delete policy — default-deny, account deletion is out of scope this phase.
- **`reading_orders`**: select `using (visibility = 'public' or creator_id = auth.uid())`; insert/update/delete all `creator_id = auth.uid()`.
- **`reading_order_entries`**: select mirrors the parent's public-or-owner visibility via an `exists (select 1 from reading_orders ro where ro.id = ... and (ro.visibility = 'public' or ro.creator_id = auth.uid()))` check. **Insert/update/delete are ownership-only** (`ro.creator_id = auth.uid()`, no `visibility = 'public'` clause) — this is the single highest-risk line in the schema. Reusing the select expression for mutations would let any authenticated user edit or delete entries on someone else's *public* reading order. This was caught during design review specifically because it's an easy copy-paste mistake, and was verified with a live two-account attack test (below) before being considered done.

Every mutating Server Action independently re-verifies ownership on top of RLS (e.g. `updateReadingOrderAction` does its own `select ... where id = X and creator_id = Y` check before writing) rather than relying solely on RLS silently returning zero affected rows — a 0-row update from an RLS denial looks identical to "row doesn't exist" otherwise, and the app wants an explicit, honest "you don't have permission" error instead of an ambiguous silent no-op.

Two deliberate simplifications versus a "complete" schema: `estimated_book_count` isn't a stored column (computed at read time as `entries.length`, avoiding a sync-on-every-entry-change trigger for a derived value); and `publishers`/`categories`/`entry_type` aren't Postgres enum types (validated by Zod on every write path instead) — consistent with using TypeScript string unions instead of `enum` throughout the domain layer.

**Verified live**, not just reasoned about: a two-account Playwright script created a public and a private reading order as User A, then confirmed as User B that (1) User A's private order 404s and leaks no data, (2) navigating to User A's public order's `/edit` route 404s rather than showing the form, and (3) as User A, the full create → edit → delete loop works and a deleted order 404s afterward.

## Reading-order mutation flow

Create, edit, and delete are all Server Actions (`src/features/reading-orders/actions/{create,update,delete}-reading-order.ts`), each following the same shape: fresh server client → `getUser()` (typed error if none) → `createReadingOrderSchema.safeParse(input)` (typed error if invalid, re-validated server-side regardless of what the client already validated) → for update/delete, an explicit ownership check independent of RLS → the actual mutation → on any Postgres error, a generic typed message (never the raw error, which can leak schema details) → `revalidatePath` for the affected routes → a typed `{ success: true, ... } | { success: false, error }` result, never a thrown error the UI has to guess about.

`ReadingOrderForm` takes a `mode: "create" | "edit"` prop so the same component (metadata fields, entry field array with drag-and-drop, live preview) serves both flows — only `onSubmit`'s target action and the post-submit UI differ. On create, a successful submission shows a confirmation with a real, working link to the new reading order's detail page (this used to be impossible in the mock-only phase, where the "created" order only ever existed in the browser's own JS heap — see the git history of this file for that era's explanation, since it's no longer applicable). On edit, success redirects straight to the updated detail page.

Entries are fully replaced on every edit (delete-then-reinsert), matching how the entry field array already treats the whole entry list as one unit on submit — this avoids needing per-entry diffing or a deferred uniqueness constraint on `position` to support reordering.

## What's still not backed by Supabase

| Feature | Current state | What it needs |
| --- | --- | --- |
| Reviews | Fully mock-data-backed (`lib/mock-data/reviews.ts`) | A `reviews` table, RLS, and a real creation form (currently display-only even in mock form) |
| Saves | `SaveButton` is local-only `useState` | `saved_reading_orders` table + Server Action |
| Follows | `FollowButton` is local-only `useState` | `follows` table + Server Action |
| Cover images / avatars | Plain pasted URL fields | Supabase Storage + upload UI |
| Collected-edition catalog | Entries/reviews use free-text titles, no referential integrity between them | A `collected_editions` table both could reference by id |

See `README.md`'s "Recommended next development phase" and `ROADMAP.md` for sequencing.
