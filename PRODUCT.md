# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the overwhelmed newcomer.** Someone who has decided they want to read a
character, creator, event, or era — "Jonathan Hickman's Marvel run," "Absolute
Batman" — and has no idea which books to buy or in what order. They arrive
knowing the destination and nothing about the route. Their first need is a
confident, trustworthy entry point, not a complete catalog.

**Secondary: the deep collector.** The supply side. They already worked the
continuity out by hand and want a permanent, structured home for that knowledge
instead of a forum post that scrolls away. They author the reading orders the
newcomer consumes, and they review editions at a level of physical detail no
general book site captures.

The two audiences are asymmetric on purpose: the front door is built for the
newcomer, and the authoring tools serve the collector.

## Product Purpose

Omni Odyssey helps readers navigate complicated comic-book continuity through
community-created **reading orders**: ordered sequences of collected editions,
issues, story arcs, and notes that map the recommended way to read a character,
creator, event, or era.

It is built specifically around the *collected-edition* side of comics —
omnibuses, absolute editions, deluxe hardcovers, compendiums, and manga deluxe
volumes — rather than single issues.

Success is a newcomer landing on the site, finding a reading order for the thing
they care about, and knowing what to buy first with confidence.

## Positioning

The mechanism a neighboring product could not truthfully copy without rebuilding
around it: **the physical edition is the unit of everything.**

Reading orders sequence *books you can buy and shelve*, not issue numbers.
Reviews rate binding, paper stock, gutter loss / mapping, and extras alongside
the story — because a reader deciding on a $100 omnibus needs to know whether the
object is worth owning, not only whether the story is good. General book sites
and issue-level comic databases rate the story; neither rates the object.

## Operating Context

- This knowledge already exists, but it is scattered across forum threads, wikis,
  subreddits, and blog posts, and it decays. Collectors redo the same research
  repeatedly.
- Purchases are high-consideration: collected editions are expensive and often
  go out of print, so buying the wrong edition or reading in the wrong order is a
  costly, hard-to-reverse mistake.
- Evaluation is physical. Collectors compare printings, discuss gutter loss, and
  care about paper stock and binding in ways general readers do not.
- Usage is browse-and-decide, on desktop and phone, often mid-research with other
  tabs open.

## Capabilities and Constraints

**Working today** (real Supabase/Postgres backend, Row Level Security as the
authorization boundary):

- Email/password auth, with a distinct onboarding step establishing a public
  collector profile.
- Reading orders: full create / read / update / delete, ordered entries with
  notes, drag-and-drop reordering, public/private visibility.
- Discovery: search, publisher and category filters, sort.
- Saves and follows, persisted, with real counts. Saved orders are listed back
  to the owner on their own profile only.
- Reviews: overall rating plus optional binding, paper-quality, mapping, and
  extras sub-ratings.
- Image uploads to Supabase Storage for covers and avatars.

**Not built:** OAuth, comments, collection tracking (owned/wanted/read), a
standardized `collected_editions` catalog, profile editing, follower/following
list views, review edit/delete UI, server-persisted view counts.

**Technical constraints the redesign must respect:** Next.js 16 App Router with
Server Components by default, TypeScript strict, Tailwind v4 (CSS-first theme,
no `tailwind.config`), shadcn/ui over Base UI primitives, React Hook Form + Zod,
dnd-kit. Auth-dependent pages are implicitly dynamic and must not be cached.

**Terminology:** *reading order* (the sequence), *entry* (one item in it),
*collected edition*, *publisher*, *category*, *collector* (the user).

**Undecided:** whether and when this launches publicly.

## Brand Commitments

- **Name: "Omni Odyssey."** Binding. The wordmark concept stays.
- **The physical-edition angle is binding.** Binding, paper stock, gutter loss,
  and extras stay first-class; this is the product's sharpest differentiator and
  must survive any visual change.
- **Light and dark mode parity is binding.** Both themes stay first-class, which
  rules out any direction that only works in one of them.
- **Visual direction: superhero / comic-book.** Pinned by the user this session,
  in explicit replacement of the incumbent "ink and paper" editorial palette
  (whose theme file names "superhero primary colors" as the thing it avoided).
  The specific rendition is resolved in new-work, not here.

## Evidence on Hand

- A real, working application with a real backend — the product does what it
  claims. This is the strongest asset.
- **The live catalog is effectively empty**: one real reading order, no reviews,
  and no meaningful public content. Empty states are currently the *default*
  experience, not an edge case.
- Unused mock data at `src/lib/mock-data/{users,reading-orders,reviews}.ts`,
  retained deliberately as reference and future seed material.
- Screenshot at `screenshots/`.
- **No** real testimonials, customers, usage numbers, press, pricing, or
  partnerships exist. None may be fabricated. Demonstration reading orders and
  covers may be authored at full fidelity but must be labeled synthetic.

## Product Principles

1. **Orientation beats completeness.** A newcomer's first need is a confident
   place to start, not every option. A thin catalog presented with conviction
   serves them better than an exhaustive one presented flatly.
2. **The physical edition is the unit.** Every recommendation, rating, and
   comparison is ultimately about an object that goes on a shelf.
3. **Structure what the forums lose.** The value is turning scattered, decaying
   community knowledge into something permanent and browsable.
4. **Earn the purchase.** These are expensive, often out-of-print books. The site
   helps someone decide whether an edition is worth owning, and says so honestly.
5. **Design for empty.** The catalog is thin and will stay thin early. Anything
   that only looks good full is a design that does not work yet.

## Accessibility & Inclusion

Existing commitments to preserve:

- Every input has a visible `<Label>`; validation errors wired via
  `aria-invalid` / `aria-describedby`.
- Icon-only controls carry `aria-label`.
- Ratings are never color-only: numeric value plus an `sr-only` text equivalent
  accompanies the star graphic.
- Drag-and-drop entry reordering works by mouse and keyboard, with screen-reader
  announcements.
- Light and dark themes both first-class.

Not audited with a screen reader or an automated scanner; no formal standard has
been committed to.
