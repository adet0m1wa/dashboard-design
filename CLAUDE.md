# Hop prototype

Hop is a web dashboard for a small fashion business (Amara Atelier) with an AI analyst, also
called Hop, in a chat panel on every page. The core idea: click any part of a page to select it
(blue outline), ask Hop about it, watch a scan animation, and get an answer in the panel.
Prototype only: all answers are scripted, and there's no real data.

**Source of truth: [docs/HOP_BUILD_BRIEF.md](docs/HOP_BUILD_BRIEF.md)** (screens, behaviour, motion,
data, build order). Read it before changing anything. Values already read from Figma are in
[docs/DESIGN_NOTES.md](docs/DESIGN_NOTES.md); use them before re-scanning Figma.

## Run

```
npm install
npm run dev        # http://localhost:3000 → redirects to /analytics
npm run check      # typecheck + token check
```

## Working rules

- **Figma decides how things look; the brief decides how things behave.** Known mismatches: brief B11.
- Figma: file `10tguKfuD7CG5DsbNi2gDS`, Page 4 → section **"fresh"**. Refer to frames by name.
  There are **two** sections named "fresh" with identical frame names; use the **left** one
  (x≈2135, the one with the "dashboard variables" bound). The right one is an unbound duplicate.
- Tokens only. `design/Default.tokens.json` (never edit) + `design/extras.tokens.json` (Figma styles
  that aren't variables) → `npm run tokens` → `styles/tokens.css` (a Tailwind `@theme`). Tailwind's
  default palette, radii and type scale are cleared, so only tokens exist as utilities:
  `bg-surface-default`, `text-text-secondary`, `p-16`, `rounded-12`, `text-13`, `font-600`.
  Readable aliases for the non-semantic tones are in `styles/globals.css` (`bg-selection`, `bg-tag-bg` …).
  `npm run check:tokens` fails on raw colours, arbitrary colour/spacing values, and off-scale spacing.
- Motion timings come from `lib/motion.ts` only (brief B4). Respect reduced motion (B5).
- Numbers live in `data/*.ts`, never in components. Format with `lib/format.ts`.
- Icons are generated from the Figma SVGs: `design/icons/*.svg` → `node scripts/gen-icons.mjs`.
- Don't add features, pages or animations that aren't in the brief. If something isn't covered,
  pick the simplest option and log it under Decisions below.
- One git branch per phase (`phase-N-name`), test in the browser at 1440×900, commit, merge to main,
  update Progress.

## Architecture (short)

- Next.js 16 App Router. `app/[page]/layout.tsx` renders one persistent `AppShell` for all six
  pages; moving between pages is `history.pushState` + store state, so the sidebar and Hop panel
  never remount and page transitions are ours (brief B7.6). `/tokens` is the phase-0 token test page.
- State: one Zustand store (`lib/store.tsx`) created per shell, shaped like brief B3.

## Testing

- The in-app browser pane throttles `requestAnimationFrame` while it's hidden (1 frame per ~500ms),
  so animations crawl there. Use it for clicking and console checks only.
- Timing, layout and screenshots: `node scripts/flow.mjs scripts/flows/<flow>.mjs [--reduced]`
  drives headless Chrome (local install, puppeteer-core) and prints PASS/FAIL per check plus console
  errors. `scripts/shot.mjs` takes one screenshot; `scripts/compare.mjs figma.png app.png out.png
  [--region=x,y,w,h] [--zoom=2]` makes a Figma | app | diff strip. Figma renders live in `docs/figma/`.
- Figma text uses the font's "normal" line height; `html { line-height: normal }` in globals.css
  matches it (Tailwind's 1.5 made every row 2.5px taller).

## Progress

| Phase | Status | Notes |
|---|---|---|
| 0 Setup | done | Next 16 + Tailwind 4 (`@theme static`) + Motion 13 + Zustand; tokens, motion, data, icons, `/tokens` test page |
| 1 Shell | done | Sidebar, workspace, top bar (title crossfade), empty Hop panel, 6 routes, page transitions. `scripts/flows/phase1.mjs`: 42/42 |
| 2 Analytics (static) | – | |
| 3 Analytics (interactive) | – | |
| 4 Hop panel | – | |
| 5 Selection system | – | |
| 6 Inventory + jump chips | – | |
| 7 History | – | |
| 8 Polish + QA | – | |

**Next step:** phase 2 — Analytics static (KPI tabs, chart, 5 card variants, Urgent).

## Decisions (not in the brief)

- Stack: Next.js (the brief's default), not Vite. `agentRules: false` stops `next dev` appending to this file.
- Tokens are emitted with `@theme static`: plain `@theme` drops variables no utility uses, which broke inline `var(--…)` swatches.
- Tagging interactive elements (KPI tabs, buttons): **Alt/Option + click** (brief B6 open question).
- Workspace has no 1px border: the Figma frame has none (brief A6 says there is one).
- No sidebar search box: not in the Figma frame (brief A6 mentions one).
- Hop avatar follows the "fresh" header drawing (no antenna), so "scanning" pulses the eye glow
  instead of an antenna light.
- Monday/Tuesday breakdowns and done items are written for the prototype (`data/earlierDays.ts`);
  their KPIs come from the chart series.
- Past periods (a selected day, last week) only have a revenue breakdown, so the card beside
  Urgent shows that period's "Top revenue generators" whatever KPI is selected.
- Prompt-cue, KPI, chart and Urgent-action answers are written for the prototype from the A7
  numbers (`data/conversation.ts`); the Sand and Adire answers are from the brief.
- A tag sent with no text asks "Tell me more about this" (the frames' question).
