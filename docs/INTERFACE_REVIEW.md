# Interface review (better-interface, 2026-09-28)

## Scope and coverage

Whole prototype at its target size (1440×900) plus narrow windows: shell (sidebar open/rail,
top bar, Hop panel open/closed), Analytics (default, KPI states, day, last week, highlight mode,
selected, scanning, answered), Inventory, History (all four states, filters, expanded), the
three placeholder pages. Stack: Next.js 16, React 19, Tailwind 4 with Figma-token utilities,
Motion 13, Zustand. Project docs read: `CLAUDE.md`, `docs/HOP_BUILD_BRIEF.md`,
`docs/DESIGN_NOTES.md`. Boundary: the brief puts mobile out of scope (B12), so 320px reflow was
checked but not built for.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | axe-core 4.13 on 8 states; keyboard walk of every Tab stop; keyboard-only pick → ask flow; reduced-motion flows (every phase flow runs with `--reduced`) | 10 findings (8 fixed) |
| Layout | Renders at 1440, 1280, 1024 and 720 (200% zoom); History column widths | 1 finding (fixed) |
| Writing | All UI copy in components and `data/` | 3 findings (1 fixed) |
| Typography | Truncation at real string lengths, tabular numbers on changing values, heading sizes | Covered by the truncation finding |
| Colors | Rendered contrast pairs (axe + computed WCAG ratios) | 1 finding (not changed; design decision) |
| UI polish | Motion durations/easings in code, hit areas, hover/focus/selected states, dead zones | 3 findings (fixed) |

## Findings

| Severity | Domain | Location | Before | After | Why | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HIGH | Colors | `text/muted`, `text/tone-02` (chart day labels), `status/success-text`, avatar tones 01/02/03/15/17 | 1.96–4.4:1 for 11–13px text | #716F6B, #577764, #1C7E46, #7A5BF6, #B56025, #CE4275, #52840B, #0C875E (same hues; ≥4.5:1 on every background each sits on) | Body/label text below WCAG AA 4.5:1 | **Fixed 2026-09-29** — Figma variables updated at the user's request; axe: 0 contrast failures |
| HIGH | Accessibility | `components/select/useSelection.ts`, `HopFrame.tsx` | Picking a frame only worked with a pointer | Highlight mode puts frames in the Tab order; focus shows the highlight; Enter/Space picks and moves to the composer; Enter on a control inside a frame picks its frame; turning highlight on by keyboard jumps to the first frame | The core flow was pointer-only | Fixed |
| HIGH | Layout | `components/shell/AppShell.tsx` | Below ~1300px (and at 200% zoom) the page squashed until KPI tabs, card rows and the top bar overlapped | Page area keeps ≥720px (token `main-min`), the app scrolls sideways instead; the sidebar folds to its rail below 1336px wide | Content overlapped and was unreadable | Fixed (sideways scroll remains at ≤1167px) |
| HIGH | Typography | `components/ui/Truncate.tsx` used by cards, Urgent, Inventory, sidebar, tags, History | Ellipsised names and 2-line summaries had no way to see the full text | Full text as a tooltip whenever it's actually cut | Truncated content with no way to reach it | Fixed |
| MEDIUM | Accessibility | `components/history/BriefChain.tsx` | Day headers were `h3` straight under the page `h1` | `h2` | Heading outline skipped a level | Fixed |
| MEDIUM | Accessibility | `components/shell/AppShell.tsx` | 12 sidebar stops before the page | "Skip to page" link, first Tab stop | Keyboard users repeat the sidebar on every page | Fixed |
| MEDIUM | Accessibility | `lib/motion.ts` `timing.toast` | Toasts left after 2.4s | 5s | Below the 5s floor for timed messages | Fixed |
| MEDIUM | Accessibility | `components/analytics/KpiTabs.tsx` | In highlight mode the tab wrappers became `role=group` inside the tablist | Tab wrappers stay out of the Tab order (`viaControl`); the tab itself picks | Broke the tablist semantics (axe: critical) | Fixed |
| MEDIUM | Writing | `components/history/BriefChain.tsx` | "No briefs match these filters." | Names the search ("No briefs match “…”.") + a **Clear filters** button | Filter empty state had no way out | Fixed |
| MEDIUM | Writing | `components/hop/Composer.tsx` ("Select any frame") | The hint doesn't say picking needs the highlight button | "Click the [highlight icon] to select a frame"; "Click any frame to select it" while highlight is on | Hint can mislead now that picking is a mode | **Fixed 2026-09-30** (user's copy, feedback 4) |
| MEDIUM | Accessibility | Page changes | Focus stays on the sidebar after navigating | Page `<title>` now follows the page; focus is left on the nav | Screen-reader users aren't told the page changed | Partly fixed (title); focus move left out on purpose |
| LOW | UI | `components/shell/Sidebar.tsx`, `HopPanel.tsx`, `Composer.tsx` | 16–18px icon buttons, 12px tag × | Hit area grown to 24–26px with a pseudo-element; look unchanged | Small targets | Fixed |
| LOW | UI | `components/history/BriefChain.tsx` | Avatar/trail area of a brief row wasn't clickable | Whole row picks the brief; Expand sits above | Dead zone inside a clickable-looking row | Fixed |
| LOW | UI | `components/hop/HopAvatar.tsx`, `Composer.tsx` | Hard-coded 0.12s; tag chip's reduced-motion exit used Motion's default duration | `duration.fast`; instant exit under reduced motion | Timings must come from `lib/motion.ts`; reduced motion must be instant | Fixed |
| LOW | Writing | Top bar "Last sync: 14:00" vs "2:30 PM" everywhere else | 24-hour next to 12-hour times | Pick one format | Inconsistent time format | **Not changed** — Figma copy |
| LOW | Accessibility | Sidebar "Settings" | Looks like a nav item, does nothing | Make it inert-looking or build it | Collects dead clicks | **Not changed** — brief: not in the prototype |

Left alone as deliberate project choices: press scale 0.97 (brief B4; the skill prefers 0.96),
Figma type sizes under 12px, the 3/3 dotted trail.

## Verification

Passed:
- `npm run check` — typecheck + token check, 67 files.
- axe-core 4.13 on Analytics (idle, answered, highlight mode, selected), Inventory, History,
  History expanded, Sales with both sidebars shut: no violations except the contrast pairs above.
- `scripts/flows/phase8.mjs` (both motion modes): every Tab stop visible with a focus indicator;
  skip link first; keyboard-only pick → ask → answer; 720/1024/1280 widths keep the page ≥720px
  with no overlap.
- Every phase flow in both motion modes (`bash scripts/test-all.sh`).
- Production build: no long tasks (>50ms) when moving between pages.

Not verified: a real screen reader (VoiceOver/NVDA) pass; Windows forced-colors mode; 320px
reflow (out of scope, brief B12).

## Verdict

**Approve** (updated 2026-09-29): the last HIGH, text contrast, is fixed. The MEDIUM/LOW items
marked "Not changed" remain as work for the designer.
