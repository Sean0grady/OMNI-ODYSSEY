# Architecture

This document explains the structural decisions behind the Omni Odyssey frontend MVP: where domain boundaries sit, how the mock repository abstraction works, why specific components are Server vs. Client, how the reading-order form manages state, and exactly what changes when a real backend is introduced.

## Domain boundaries

All domain modeling lives in one place: `src/types/domain.ts`. It defines the four core entities from the product brief —

- `UserProfile`
- `ReadingOrder`
- `ReadingOrderEntry`
- `CollectedEditionReview`

— plus the string-union types they depend on: `Publisher`, `ReadingOrderCategory`, `ReadingOrderVisibility`, `ReadingOrderEntryType`. These are plain string unions rather than TypeScript `enum`s, deliberately: they serialize cleanly (important once real API responses exist), work directly with `z.enum(...)` in the Zod schemas without a separate mapping layer, and avoid `enum`'s occasional bundling/erasure quirks.

Human-readable labels for these unions (e.g. `"dark-horse"` → `"Dark Horse"`) live in `src/lib/constants/catalog.ts` as `Record<Union, string>` maps, kept separate from the domain types themselves so the domain layer stays free of presentation concerns.

Every other layer of the app — mock data, Zod schemas, repository functions, and UI components — imports these same types rather than redeclaring shapes. In particular, the reading-order creation form does **not** reuse `ReadingOrder`/`ReadingOrderEntry` directly (they carry server-assigned fields like `id`, `saveCount`, `createdAt` that don't exist yet at submit time). Instead, `src/features/reading-orders/schemas/reading-order-schema.ts` defines a Zod schema and derives `CreateReadingOrderInput`/`ReadingOrderEntryInput` from it via `z.infer`, so the validation rules and the TypeScript types can never drift apart.

## The repository abstraction

Nothing outside `src/lib/repositories/` and `src/lib/mock-data/` is allowed to import the mock arrays directly. Every page and component goes through repository functions:

```ts
getFeaturedReadingOrders();
getRecentReadingOrders();
getReadingOrderBySlug(slug);
getReadingOrdersByUserId(userId);
getRelatedReadingOrders(readingOrder);
searchReadingOrders(filters);
getUserByUsername(username);
getUserById(userId);
getCurrentUser();
getReviewsByUserId(userId);
getRecentReviews();
saveReadingOrderMock(readingOrderId);
createReadingOrderMock(input);
```

These are synchronous today because the "database" is an in-memory array. They are written as plain functions with clean, narrow signatures specifically so that swapping the body for a Supabase query later — and marking the function `async` — does not require touching any call site beyond adding an `await`. The mock arrays in `lib/mock-data` are the only thing that gets deleted when Supabase lands; the repository *function signatures* are the durable contract.

`searchReadingOrders` and the client-side Discover page share one more layer of indirection worth calling out: the actual filter/sort predicate logic lives in `src/features/reading-orders/utils/filter-sort.ts` as framework- and storage-agnostic pure functions (`matchesReadingOrderFilters`, `sortReadingOrders`, `filterAndSortReadingOrders`). The repository calls these against the full mock dataset on the server; the Discover page's client component calls the *same* functions against a small, already-fetched array passed down as props. This is what keeps the full mock dataset out of the client bundle for that page (see below) while still sharing one implementation of "what does a search match / how does a sort order work" — useful both for future testability and for the future Supabase full-text-search implementation to be validated against the same expectations.

## Server vs. Client Component decisions

The default is a Server Component. `"use client"` appears only where a component genuinely owns interactive state or browser-only behavior:

| Client component | Why |
| --- | --- |
| `DiscoverBrowser` | Owns live search/filter/sort state; needs to re-render instantly without a round trip. |
| `MobileNav`, `UserMenu` | Open/close and menu state (Sheet / DropdownMenu). |
| `SaveButton`, `FollowButton` | Local optimistic toggle state (see [Reading-order form state](#reading-order-form-state--client-side-mutation-boundary) for why these can't do more than that yet). |
| `ReadingOrderForm` and everything under it (`ReadingOrderMetadataFields`, `ReadingOrderEntryFieldArray`, `ReadingOrderEntryEditor`, `ReadingOrderPreview`) | React Hook Form state, Zod validation, and the dnd-kit drag context are all inherently client-side. |
| `ThemeProvider`, `Toaster` (sonner) | Wrap browser-only theming/toast infrastructure. |

Everything else — the landing page, `/discover`'s outer page component (data fetching only; the interactive part is the `DiscoverBrowser` island it renders), the reading-order detail page, the profile page, the reviews page, the about page, and every presentational component (`ReadingOrderCard`, `ReviewCard`, `ReadingOrderMetadata`, `ReadingOrderEntryList`, badges, avatars, etc.) — is a Server Component. This keeps the vast majority of the mock dataset resolution happening on the server, sent to the client only as rendered HTML.

## Reading-order form state & the client-side mutation boundary

The product brief explicitly excludes server actions and API routes from this phase, which has a real consequence worth documenting rather than glossing over: **any mutation has to happen entirely in client-side JavaScript, because there is no network call available to reach the "server's" in-memory data.**

Concretely: `createReadingOrderMock` (and `saveReadingOrderMock`) are called directly from client components. Because `ReadingOrderForm` is a Client Component, importing the repository pulls the repository module — and therefore the mock-data module it closes over — into that page's client JS bundle. This is an intentional, documented exception to "keep mock data out of client bundles," scoped to exactly one route (`/reading-orders/create`) where a client bundle is unavoidable anyway.

The more important consequence: when `createReadingOrderMock` pushes a new `ReadingOrder` onto its in-memory array, it is mutating a copy of that array *running inside the browser's JS heap*, not the Node.js server process's memory. The newly created reading order is therefore only ever visible within that same client component tree (used to render the success/preview state) — it will not appear on a subsequently server-rendered `/discover` page, even without a refresh, and it never persists across a reload. This is why the success screen explicitly does not link to the new reading order's detail page (`/reading-orders/[slug]` would 404, since the server-side array never received it) and instead says so plainly in the confirmation copy. `SaveButton` and `FollowButton` follow the same reasoning and don't even attempt to call a repository function — they're pure local UI state, because a fully client-local call to a "mutating" repository function would accomplish nothing a `useState` toggle doesn't already do more cheaply.

This limitation disappears entirely once Server Actions or API routes exist: `createReadingOrderMock`'s logic (id/slug generation, `ReadingOrderEntry[]` construction) is already isolated in `lib/repositories/reading-orders.ts` and can be lifted into a `"use server"` action with minimal changes, at which point the mutation will run in the actual server process and the success screen can safely link to the new order.

## Future database integration points

Mapping the current mock layer onto the anticipated Supabase schema:

| Current (mock) | Future (Supabase) |
| --- | --- |
| `lib/mock-data/users.ts` | `profiles` table |
| `lib/mock-data/reading-orders.ts` (top-level fields) | `reading_orders` table |
| `lib/mock-data/reading-orders.ts` (`entries` arrays) | `reading_order_entries` table, foreign-keyed to `reading_orders` |
| `lib/mock-data/reviews.ts` | `reviews` table |
| `lib/mock-current-user.ts` | Supabase Auth session / `profiles` row for the authenticated user |
| `SaveButton` local state | `saved_reading_orders` table + a Server Action |
| `FollowButton` local state | `follows` table + a Server Action |
| — (not modeled yet) | `collected_editions`, `user_collections`, `collection_statuses` — needed once "track owned/wanted/read" ships |

The repository functions in `lib/repositories/` are the seam: their signatures should not need to change (aside from adding `async`/`await` and real error handling) when their bodies start querying Supabase instead of filtering an array. Components and pages, which only ever call these functions, should require no changes at all beyond whatever `await`s ripple up through the pages that call them from Server Components (which already support `async` page components today).
