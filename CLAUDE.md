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
- `bash scripts/test-all.sh [out-dir]` runs every phase flow in both motion modes (dev server must be up).
- Timing, layout and screenshots: `node scripts/flow.mjs scripts/flows/<flow>.mjs [--reduced]`
  drives headless Chrome (local install, puppeteer-core) and prints PASS/FAIL per check plus console
  errors. `scripts/shot.mjs` takes one screenshot; `scripts/compare.mjs figma.png app.png out.png
  [--region=x,y,w,h] [--zoom=2]` makes a Figma | app | diff strip. Figma renders live in `docs/figma/`.
- Never put `initial={false}` on an AnimatePresence that wraps a whole page: it switches off every
  nested initial animation too (it silently killed the first-load entrance once). Skip the
  wrapper's own first animation instead (see PageArea).
- Figma text uses the font's "normal" line height; `html { line-height: normal }` in globals.css
  matches it (Tailwind's 1.5 made every row 2.5px taller).

## Progress

| Phase | Status | Notes |
|---|---|---|
| 0 Setup | done | Next 16 + Tailwind 4 (`@theme static`) + Motion 13 + Zustand; tokens, motion, data, icons, `/tokens` test page |
| 1 Shell | done | Sidebar, workspace, top bar (title crossfade), empty Hop panel, 6 routes, page transitions. `scripts/flows/phase1.mjs`: 42/42 |
| 2 Analytics (static) | done | KPI tabs (tablist, arrows), chart (d3 curveMonotoneX), 5 card variants, Urgent, Wed + last week states. `phase2.mjs` 21/21; each state within ~2.7% pixel diff of its frame (text anti-aliasing + curve shape) |
| 3 Analytics (interactive) | done | KPI morph (values + max tween), DMs tint, card/Urgent swaps, hover + tooltip, day select + Esc, week redraw, equal heights, first-load entrance, Last sync, Remind Ife toast. `phase3.mjs` 32/32, `--reduced` 30/30 |
| 4 Hop panel | done | Cues, send (Enter / Shift+Enter), typing dots, word streaming, blocks, markers, New chat (saves thread), fade mask, aria-live. `phase4.mjs` 20/20 both modes (Sizes block + answer buttons verified in phase 5 — they only come with tagged answers) |
| 5 Selection system | done | HopFrame hover/select/scan overlay, page-level click + Alt+click + Esc, composer tag chip + placeholder crossfade, jump chips, clear on answer, re-highlight from tags (navigates + scrolls), Urgent Draft replies / Reorder → tagged scan. `phase5.mjs` 31/31, reduced 30/30. Panel matches the three selection frames (≤4% diff, 1px offset) |
| 6 Inventory + jump chips | done | Tiles, attention pill, stock table (hover fill, bars grow on first visit, Edit/Add/All stubs), jump → marker → chips flip → chips stay → Go to Analytics, sidebar/link clear the chips. `phase6.mjs` 19/19, reduced 18/18; matches the Inventory frame |
| 7 History | **in progress** | Branch `phase-7-history`. Done: History spec recorded (DESIGN_NOTES > History), icons (Search, Expand, Frame11, Time, Screenshot), card shadow token, Instagram screenshot image, Figma renders in docs/figma/history-*.png. Not started: data (summaries into data/history.ts), right-column swap in AppShell, BriefChain + trail, left snapshots, filters, Expand/Back, Recent-with-Hop links, New-chat threads as briefs, phase7 flow |
| 8 Polish + QA | – | |

**Next step (stopped here, usage limit):** continue phase 7 on branch `phase-7-history` from DESIGN_NOTES > History — no more Figma reads needed except, optionally, the expanded-chat frame's header. Then phase 8 (polish + QA), then the brief's final 10-flow test with screenshots in docs/screenshots/, then the final report. Run `bash scripts/test-all.sh` first to confirm phases 1–6 are still green.

## Decisions (not in the brief)

- Stack: Next.js (the brief's default), not Vite. `agentRules: false` stops `next dev` appending to this file.
- Tokens are emitted with `@theme static`: plain `@theme` drops variables no utility uses, which broke inline `var(--…)` swatches.
- Tagging interactive elements (KPI tabs, buttons): **Alt/Option + click** (brief B6 open question).
- Workspace has no 1px border: the Figma frame has none (brief A6 says there is one).
- No sidebar search box: not in the Figma frame (brief A6 mentions one).
- Hop avatar = the Figma component "Agent character" (antenna + green light), as used in the
  Inventory frame's panel ("Hop · character (Rive slot)"). The Analytics frames draw a simpler head
  without the antenna; the component is what the brief names, and "scanning" pulses its antenna light.
- Monday/Tuesday breakdowns and done items are written for the prototype (`data/earlierDays.ts`);
  their KPIs come from the chart series.
- Past periods (a selected day, last week) only have a revenue breakdown, so the card beside
  Urgent shows that period's "Top revenue generators" whatever KPI is selected.
- Prompt-cue, KPI, chart and Urgent-action answers are written for the prototype from the A7
  numbers (`data/conversation.ts`); the Sand and Adire answers are from the brief.
- A tag sent with no text asks "Tell me more about this" (the frames' question).
- DMs chart is red (brief A5/A7/B7.1); the Figma DMs frame still draws it green. Area uses
  `status/danger-soft`; the active axis label and toggle legend dot follow the chart colour.
- Axis labels are centred under their dots (they're buttons); Figma spaces them justify-between (≤3px off).
- The week-toggle thumb always has the 0 1 2 rgba(0,0,0,.08) shadow (Figma only shows it in the last-week frame).
- Past-day KPI labels drop "today" per the brief (the Wednesday frame still says "Revenue today").
- "Last week · 14–20 Sep" uses an en dash as in the brief (Figma types a hyphen).
- Last week followers show 981 as designed, though the daily series adds up to 881.
- The app renders client-only (`ClientShell`, `ssr: false`): the server can't know reduced-motion
  or whether the entrance should play, and server-rendering caused hydration mismatches.
- Chart tooltip (not designed): dark pill, value + "+30% vs last Wed"; in last week "Last week · Wed".
  Keyboard focus on a day shows it too; a mouse click on a day doesn't leave it up.
- Equal-height cards: the grid row and cards have Motion `layout` (base); with today's data no
  state changes their height, so it never visibly runs.
- The first-load entrance plays the first time Analytics shows in a session (not on later visits).
- Settings and the store switcher / panel icon are shown as designed but aren't interactive.
- Prompt cues come back after an answer and on deselect (brief B6); the "answered, highlight off"
  frame shows no cues.
- Before an untagged answer streams, typing dots show for 0.5s (`timing.think`); tagged ones scan ≥ 900ms.
- The send button keeps Figma's dark look even when empty; it's aria-disabled and does nothing then.
- Hop's answer text still streams with reduced motion on (it's pacing, not movement); blocks and
  buttons appear without fading.
- Clock: 2:30 PM, and each question / page marker moves it on a minute (reproduces 2:31, 2:32, 2:33).
- Answer action buttons (Add to restock, Send all 3 …) show a toast; Hop drafts, people approve.
- Hover outline only shows where a click would select: not over a button/tab/link unless Alt is held.
- Changing page clears the selection (the frame belongs to the page she left); the jump chips stay.
- While a frame is scanning, clicks can't change the selection (it clears when the answer lands).
- Outline radius: rows 8 (Figma), KPI tabs and chart 10, whole cards 14 (= element radius + 2).
- Jump chips always read "Go to <page>" + "Go to Analytics"; the older selection frames say "Go to Chat".
- In reduced motion, the scan shows a small blue "Hop is reading…" label on the outline's top edge.
- Inventory rows not in the conversation get tag labels in the same style ("Linen two-piece (Olive)").
- The stock table isn't overflow-clipped (its corners are rounded per row instead) so a selected
  row's outline isn't cut off at the table edge.
- Inventory stubs: Edit → "Product page coming soon"; All products / Add product → "… coming soon" toasts.
- The conversation stays scrolled to the newest message; the Inventory frame shows it from the top.
- The attention pill says "3 need attention" (brief + Figma text; the layer is named "4 need attention").
