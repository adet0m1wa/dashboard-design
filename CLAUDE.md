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
- Figma: file `10tguKfuD7CG5DsbNi2gDS`, Page 4 (canvas `1775:2502`) → section **"fresh"**
  (`1816:4657`). Refer to frames by name; DESIGN_NOTES also records node IDs. Since 2026-09-28
  there is only one "fresh" section (the unbound duplicate is gone). `get_metadata` without a node
  only lists the page that's open in Figma, so ask for `1775:2502` directly.
- User feedback overrides the brief where they disagree (feedback round 1, 2026-09-28: collapsible
  sidebars, highlight mode, markers only on tagged questions, composer focus border, chart).
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
| 7 History | done | Chain + dotted trail (per-brief segments, continuous under filters), sliding selection + Expand pop, three left sides (Analytics redrawn from its own store; Inventory/Customers drawn at 0.83 in a card; Instagram PNG), tag outline in snapshots, person/page/search filters with collapse, Expand/Back (slide, scroll to message, tag flash, focus), Recent with Hop, New-chat threads as briefs, Hop panel slides away on History. `phase7.mjs` 32/32, reduced 29/29; four History frames within 5–7% (the extra Zee chip row) |
| Feedback 1 | done | Collapsible sidebar + Hop panel, highlight mode + stroke-snapping outline, markers only on tagged questions, composer focus border, chart height tween + responsive width. `feedback1.mjs` 14/14 both modes |
| 8 Polish + QA | – | |

**Next step:** phase 8 (polish + QA) including the `better-interface` review (skills in `.claude/skills`), then the brief's final 10-flow test with screenshots in docs/screenshots/, then the final report ("Report"). `bash scripts/test-all.sh` runs every flow (both motion modes).

## Decisions (not in the brief)

- Stack: Next.js (the brief's default), not Vite. `agentRules: false` stops `next dev` appending to this file.
- Tokens are emitted with `@theme static`: plain `@theme` drops variables no utility uses, which broke inline `var(--…)` swatches.
- ~~Tagging interactive elements: Alt/Option + click~~ — replaced by **highlight mode** (feedback 1):
  frames can only be hovered/picked while the BoundingBox button in Hop's header is on, and then a
  click on any frame (buttons and tabs too) picks it instead of running its action.
- Highlight mode ends when a tagged question is sent, when Hop's panel is closed, or on Esc with
  nothing selected (the first Esc drops the selection). Its "on" look isn't in Figma: blue icon on
  the tag background.
- Highlight geometry (`lib/outline.ts`): the outline sits on existing strokes — a card's own border;
  for a row across a bordered box, the box's side strokes and the nearest divider/edge above and
  below (else 4px out, as in "example 3"); otherwise the frame's own edges. Hover = 1px blue, no
  handles; selected = 1.5px + handles popping in.
- Outside highlight mode a click on plain page space still puts away a highlight that's up
  (from a tag in the chat or an Urgent action).
- Picking a frame, or an Urgent action, opens a closed Hop panel (the tag and answer land there).
- "Moved to …" markers go in only right before a tagged question asked on a page other than the
  thread's page (its last marker, else its first question); none on navigation. The marker takes a
  clock minute, so the brief's 2:31 / 2:32 / 2:33 PM sequence still holds.
- Sidebar and panel collapse: CSS width transition (slow, ease-out) using the layout tokens
  (`sidebar-rail` 56, `panel-rail` 63); the sidebar's two layouts crossfade, the panel's contents
  fade and become `inert`. Keyboard toggling keeps focus on the toggle. Rail badges use gap 2 under
  both icons (Figma: 2 under Inventory, 4 under Customers).
- Chart: tweens each day's height (value ÷ chart max) instead of the brief's "values and max
  together" — tweening raw values and max made the line sit still and snap at the end when scales
  differ (revenue → orders). The plot fills its box (720 at the default layout, as Figma) and
  re-lays itself out while the sidebars slide; the hover guide glides with the tooltip.
- Composer focus: its own border turns blue (no outer ring).
- "example 1" shows last week's "Everything else" as $8,800; the app keeps $9,200 (= $15,810 − the
  three rows, and what the "Last week selected" frame shows).
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
- History has no Hop panel (Figma): the panel slides shut (width, slow) on the way in and back on
  the way out, still mounted so a streaming answer carries on.
- A saved thread becomes one brief named after its **last** question (as the 2:33 brief opens the
  whole 2:31 → 2:33 thread); its summary is the first text of Hop's answer to it.
- Briefs with no scripted conversation expand to a two-message thread: the question and the
  summary as Hop's reply, in Hop's voice and without later events (Amara's 2:20 PM change, Dayo
  sending the drafts). The morning brief is Hop's message alone.
- Snapshots: the morning brief shows Analytics with Wednesday selected ("when Hop wrote the morning
  brief"); Customers briefs show the Customers placeholder (not designed), so the Chioma tag has no
  frame to outline; Ife's 8:40 AM Inventory uses today's stock numbers (there's one dataset).
- Snapshot cards fill the content width (776; 768 while expanded — Figma's expanded card is 682).
  The tag outline in a snapshot follows the new highlight rule (table side strokes), not the older
  narrower outline in the History frame.
- "Weekend content ideas" isn't in the chain: it opens History filtered to Zee's briefs.
- Person chips include Zee (brief) and wrap to a second row (Figma shows four). An active person
  chip takes the dark "Everyone" look; clicking it again goes back to Everyone.
- "All pages" is a native select dressed as the Figma button ("Chat" = Analytics). Search matches
  question, summary, tag, name and page. No matches: "No briefs match these filters." Its border
  turns blue on focus, like the composer.
- No dark left bar on the selected brief (brief B7.5 mentions one; Figma has only the background).
- Default selected brief: 2:33 Adire. Expanded column is 368 (Figma), the chain 360; the width slides.
- A brief's text is its select button; Expand is its own button. Expand focuses Back; Back/Esc
  returns focus to Expand. The tag flash starts once the chat has slid in.
- The Instagram screenshot is Figma's 1× export (the export tool wouldn't produce 2×).
