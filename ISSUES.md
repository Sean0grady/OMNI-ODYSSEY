# Known Issues

Real, verified findings only — no filler. Dated to the foundation audit and stabilization pass that discovered them.

## Open

### 1. `Encountered a script tag while rendering React component` console warning on not-found routes (dev mode only)

**Severity:** Low. Only observed in `next dev`; does not reproduce in `npm run build` output, and no `<script>` tag exists anywhere in `src/` (verified by search). Most likely a Next.js/Turbopack dev-mode internal behavior on the not-found route boundary, not an app bug. Worth a quick re-check after any Next.js version upgrade, but not blocking. Still present as of the Supabase backend phase — reconfirmed, not reinvestigated.

## Operational notes (not code bugs)

- **Supabase's default shared email sender has a very low rate limit.** During verification, sign-up confirmation emails hit "email rate limit exceeded" after only 2–3 attempts. Fine for this phase (email confirmation is off for local development per the current `.env.local`/dashboard setup), but before any real deployment, configure custom SMTP in the Supabase dashboard (Auth → Settings) — the default sender is not meant for production volume.
- Supabase's email validator rejects `@example.com`-style addresses as invalid (used for a real, non-deliverable-domain-name check) — not an app-level restriction, just worth knowing when picking test email addresses.

## Resolved — post-Supabase-core backlog

- **`Button` component's focus-visible ring — confirmed a headless-rendering artifact, not a real bug.** The prior entry (headless Chromium via a temporary Playwright script) found the computed `box-shadow` for `focus-visible:ring-3 focus-visible:ring-ring/50` evaluating to fully transparent on `Button` instances, despite `:focus-visible` correctly matching and `--ring` resolving to a valid color. Re-tested in an actual Chrome browser window (via the Chrome DevTools/extension automation, not headless) by tabbing keyboard focus onto three separate `Button` instances — two `render={<Link/>}` instances ("Explore reading orders", "Create a reading order" on the landing page) and one native `<button>` instance (the mobile nav's "Open menu" trigger). All three show a real, non-transparent computed `box-shadow` (a 3px oklab ring layer at 50% opacity) and a visibly rendered amber focus ring in a screenshot. No code change made — `src/components/ui/button.tsx` was already correct; the earlier finding was specific to headless Chromium's rendering pipeline.

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
