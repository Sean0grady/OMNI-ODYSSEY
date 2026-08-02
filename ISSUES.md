# Known Issues

Real, verified findings only — no filler. Dated to the foundation audit and stabilization pass that discovered them.

## Open

### 1. `Button` component's focus-visible ring does not render (needs real-browser confirmation)

**Severity:** Potentially high — if confirmed in a real browser, this affects the visible keyboard-focus indicator on every `Button`-based control in the app (all CTAs, the "Add another entry" / "Remove entry" buttons, the drag handle, form submit buttons, etc.).

**What was found:** Using headless Chromium (via a temporary Playwright verification script, since removed), I confirmed via `getComputedStyle` that:
- `:focus-visible` correctly matches on `Button`-rendered elements after real keyboard `Tab` navigation (`el.matches(':focus-visible')` returns `true`).
- The `--ring` CSS custom property resolves to a valid, non-transparent color at the point of query.
- Despite both of the above, the computed `box-shadow` for the `focus-visible:ring-3 focus-visible:ring-ring/50` utility classes evaluates to fully transparent (`rgba(0, 0, 0, 0)` / `oklab(0 0 0 / 0)` for every layer), and a screenshot of a keyboard-focused `Button` (both a native `<button>` instance and a `render={<Link .../>}` instance) shows no visible ring.
- By contrast, `Input`'s focus ring — built from the identical `focus-visible:ring-3 focus-visible:ring-ring/50` pattern — renders correctly (confirmed both via computed style and visually), as does at least one `SelectTrigger` instance.

**What this rules out:**
- Not caused by this stabilization pass — reproduces identically on the desktop header's "Create Reading Order" button (`site-header.tsx`, unmodified in this pass) and on the "Add another entry" button (`reading-order-entry-field-array.tsx`, a plain native `<button>` Button instance, unmodified in this pass).
- Not a `render`/`nativeButton` composition issue specifically — reproduces on both native-`<button>` and `render={<Link/>}` instances equally.
- Not a missing/invalid CSS custom property — `--ring` resolves correctly when queried directly.
- Not a browser `color-mix()` support gap — the headless Chromium build used (151.x) reports full support.

**What's still unknown:** Whether this is a genuine bug in the compiled Tailwind/Base UI CSS, or an artifact specific to headless/automated rendering that doesn't reproduce for a real user in a real browser window. Root cause was not identified within the scope of this pass — it needs manual confirmation in an actual browser (not headless automation) before deciding whether `src/components/ui/button.tsx` or the Tailwind theme needs a fix.

**Where:** `src/components/ui/button.tsx` (all variants), observed via `src/components/layout/site-header.tsx` and `src/features/reading-orders/components/reading-order-entry-field-array.tsx`.

### 2. `Encountered a script tag while rendering React component` console warning on not-found routes (dev mode only)

**Severity:** Low. Only observed in `next dev`; does not reproduce in `npm run build` output, and no `<script>` tag exists anywhere in `src/` (verified by search). Most likely a Next.js/Turbopack dev-mode internal behavior on the not-found route boundary, not an app bug. Worth a quick re-check after any Next.js version upgrade, but not blocking. Still present as of the Supabase backend phase — reconfirmed, not reinvestigated.

## Operational notes (not code bugs)

- **Supabase's default shared email sender has a very low rate limit.** During verification, sign-up confirmation emails hit "email rate limit exceeded" after only 2–3 attempts. Fine for this phase (email confirmation is off for local development per the current `.env.local`/dashboard setup), but before any real deployment, configure custom SMTP in the Supabase dashboard (Auth → Settings) — the default sender is not meant for production volume.
- Supabase's email validator rejects `@example.com`-style addresses as invalid (used for a real, non-deliverable-domain-name check) — not an app-level restriction, just worth knowing when picking test email addresses.

## Resolved — Supabase backend phase

- **`UserMenu`'s dropdown crashed on open** with `Base UI: MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>.` `DropdownMenuLabel` (wrapping Base UI's `Menu.GroupLabel`) requires a `Menu.Group` ancestor; the account-menu label wasn't wrapped in one. This is a pre-existing bug from the original frontend build, not introduced by the Supabase work — it was simply never exercised by earlier automated verification, which checked the menu's closed state but never actually opened it. Found via a live sign-out test in this phase; fixed by wrapping the label in `DropdownMenuGroup` in `src/components/navigation/user-menu.tsx`. This blocked the entire sign-out flow (the menu couldn't open at all) until fixed.

## Resolved — foundation audit and stabilization pass

For context — these were found and fixed during an earlier pass, not left open:

- `user-menu.tsx` importing mock data directly, bypassing the repository boundary (`docs/architecture.md`).
- Missing `aria-invalid`/`aria-describedby` wiring on the entry editor's `issueRange` and `notes` fields, and on the publisher/category `<fieldset>` groups.
- No `<h1>` on the three not-found pages.
- Mobile-nav "Create Reading Order" link duplicating button styling instead of the shared `Button` component (was missing hover/focus states entirely).
- Four inconsistent "boxed surface" conventions across `Card`, `EmptyState`, `ConfirmationMessage`, and the entry-editor row.
- Duplicated "icon + stat" markup across 5 call sites with inconsistent spacing.
- `shadcn` CLI listed in `dependencies` instead of `devDependencies`; no `typecheck` script.
