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
npm run preview    # production build + server: animations at real speed (dev mode drops frames)
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
  that aren't variables, plus `override`: Figma variables changed since the last export) →
  `npm run tokens` → `styles/tokens.css` (a Tailwind `@theme`). When the JSON is re-exported from
  Figma, delete the matching `override` entries. Tailwind's
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
- `bash scripts/test-all.sh [out-dir]` runs every flow in `scripts/flows/` in both motion modes
  (dev server must be up; `HOP_URL=http://localhost:3001` points the flows at another server).
- Dev CSS can go stale: Turbopack's on-disk cache (`.next/dev`) once kept serving an old
  Tailwind build (new classes missing) across restarts while JS hot-reloaded. If a new class has
  no effect in dev, check the served CSS; stop dev, delete `.next/dev`, restart.
- Dev mode is slow: navigating to History costs 100–250ms long tasks there, enough for Motion to
  skip a slide (phase1's "pill slides" check can fail under dev + load). The production build has
  no long tasks; judge motion on `npm run preview`.
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
| 8 Polish + QA | done | better-interface review (docs/INTERFACE_REVIEW.md): keyboard picking in highlight mode, skip link, min page width + sideways scroll + sidebar auto-rail, truncation tooltips, History h2 + Clear filters, 5s toasts, 24px hit areas, page titles, reduced-motion fixes. Contrast of two Figma text tokens reported, not changed. `phase8.mjs` 10/10 both modes |
| Final test | done | `scripts/flows/final.mjs` — the brief's 10 flows as one journey + feedback features: 38/38 in both motion modes on the production build, no console errors; screenshots in `docs/screenshots/`. `frames.mjs` recreates all 19 Figma frames: 2.0–7.4% pixel difference each (`docs/screenshots/compare/`). Full suite (`HOP_URL=http://localhost:3001 bash scripts/test-all.sh`): 22/22 runs green |
| Feedback 2 | done | Highlight-off clears the pick, scroll-driven chat fade, wipe page transition (distance-timed), custom "All pages" menu, resizable side panel (History lives in it), expand icon, 2× Instagram image, thin scrollbars, Instagram glyph, cues only on an empty chat, 8 colour variables fixed for AA (Figma updated). `feedback2.mjs` 28/28, reduced 25/25; every flow green on the production build |
| Feedback 3 | done | Instant: page changes, sidebar collapse + nav pill, Hop panel open/close and resizing, person pills, bottom card title; Urgent never animates; standard 48px chat fade; scrollbars only while scrolling; no icon beside "Analytics" in its top bar. `feedback3.mjs` 10/10 both modes; all 26 runs green on the production build |
| Feedback 4 | done | Emil Kowalski skills installed (`npx skills add emilkowalski/skills`); History snapshots no longer share the KPI pill / week thumb with the live page; bottom card follows the KPI in every period (new past-period cards), titled with the KPI's name, fixed 246 row so Urgent never moves; Urgent card selectable; hint "Click the ⌗ to select a frame"; "All pages" 105; brief rows follow a panel resize at once; tags restore their view; exits ease out, nothing grows from scale 0. `feedback4.mjs` 16/16 both modes |

| Feedback 5 | done | Every bottom card has the Revenue card's rhythm (posts 29×36, follower rows 18 apart); Emil Kowalski pass over all motion (curves, <300ms, keyboard changes instant, transform strings, no scale(0), clip-path stock bars, toast recipe, reduced motion for cues/chips); photos for all 19 products/posts. `feedback4.mjs` 18/18; all 28 runs green on the production build |

**Status (2026-10-01):** all phases, feedback rounds 1–5 and the final test are done. Product and
post photos are in (`public/products`, mapped in `data/photos.ts`).

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
- ~~Past periods only have a revenue breakdown~~ → every period has all five cards (feedback 4):
  the Orders/Likes/Followers/DMs cards for Mon–Wed and last week are written for the prototype
  (`data/earlierDays.ts`, `wednesday.ts`, `lastWeek.ts`); past orders are Shipped/Delivered and past
  DMs "Replied in …" (success tone).
- The card's title is the selected KPI's name ("Revenue", "Orders", "Instagram likes", "New
  followers", "Unanswered DMs"), never a period (feedback 4; Figma: "Top revenue generators" etc.).
  Its link never shrinks.
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
- ~~Equal-height cards via Motion `layout`~~ → one fixed row, token `cards-row` 246 (Figma), no
  layout animation (feedback 4: switching to Likes grew both cards 6px and scale-distorted Urgent).
  Row gaps per variant so each fills it: 12, posts 9 (38px thumbnails), follower bars 20.
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
- Keyboard picking (phase 8 review): in highlight mode frames join the Tab order as labelled groups
  ("frame"); focus shows the blue highlight instead of a ring; Enter/Space picks and moves focus to
  the composer; Enter on a control inside a frame picks the frame; switching highlight on by
  keyboard focuses the first frame. KPI-tab frames are reached through their tab (`viaControl`).
- Narrow windows: the page area never goes below 720px (token `main-min`, not in Figma); the app
  scrolls sideways instead. Below 1336px wide the sidebar starts as the rail and folds/unfolds
  as the window crosses that width.
- "Skip to page" link (first Tab stop); the page `<title>` follows the page.
- Text cut off with an ellipsis shows its full value as a tooltip (only when actually cut).
- Toasts stay 5s (was 2.4s; the accessibility floor for timed messages).
- History filter empty state names the search and offers "Clear filters"; day headers are `h2`.
- Small icon buttons get 24–26px hit areas via `::after`, look unchanged.
- Contrast: `text/muted` #9C9A94 (2.5–2.8:1) and `status/success-text` #1F8A4C (4.0–4.4:1) fail
  WCAG AA for their text sizes. Left as designed (Figma variables); proposed #706F6B and #1D8047
  in docs/INTERFACE_REVIEW.md.
- ~~Contrast left as designed~~ → fixed (feedback 2): 8 colour variables darkened, same hues, to the
  smallest values that reach 4.5:1 on every background they sit on: text/muted, text/tone-02,
  status/success-text and the avatar tones 01, 02, 03, 15, 17. Updated in Figma (use_figma, on the
  user's request) and applied here through `extras.override` (Default.tokens.json stays untouched).
- Highlight switched off (button, closing the panel) also drops a frame it picked, unless Hop is
  reading it.
- ~~Chat fade by scroll position (feedback 2)~~ → the standard fade (feedback 3): a fixed 48px
  (the brief's size) whenever there's more below, none once the last message is in view; the
  same above the cues, jump chips or composer.
- Prompt cues only on an empty chat on Analytics (feedback 2; brief B6 had them return after answers).
- ~~Wipe page transitions (feedback 2)~~ → instant page changes (feedback 3): page, top bar, side
  panel content and the sidebar pill all switch at once; no slide, fade or wipe (also replaces
  the brief's B7.6 slide and the pill's layoutSpring).
- Sidebar collapse/expand and the Hop panel's open/close are instant (feedback 3, "like the Claude
  app"); resizing the panel follows the pointer (and keys) with no easing.
- "All pages" is 105 wide (feedback 4; Figma 97); the search beside it takes the rest (8px gap).
- "All pages" menu (feedback 2, Figma "All pages"/"transition"): chevron travels to the pick, then
  the list rolls up into the closed box; each move takes 0.16s + 0.04s per extra row. It's a
  listbox (↑/↓, Home/End, Enter, Esc). The option reads "Chats" (Figma) while brief pills say "Chat".
- Side panel: one width for every page, 300–368px (368 default), dragged by its left edge or with
  ←/→ (Shift = 32px), Home/End on the focused edge; it animates for keys, follows the pointer
  when dragged; kept when the panel is closed and reopened. On History it can't be closed.
- History moved into the side panel (feedback 2): header = mascot + "Hop" (or "‹ Back" in the
  chat); the brief row is one button — it picks the brief, and on the picked one opens the chat;
  an 18px expand icon beside the page pill does the same. The big Expand pill is gone.
- The Instagram screenshot is now Figma's 2× export (download_assets, scale 2), cropped to the card.
- Scrollbars: 6px, thumb `surface/border-tint` (hover tone-27), no track — and only while
  scrolling (feedback 3): the thumb is see-through until the scrolled element is marked
  [data-scrolling], which comes off 0.8s after the last scroll (`ScrollbarsWhileScrolling`).
- No Hop-head icon beside "Analytics" in its top bar (feedback 3); other pages keep their icon.
  (Read "the hop header logo in analytics" as that icon, not the side panel's mascot, which is
  the panel's open/close button.)
- History's person pills switch look instantly (feedback 3).
- Bottom card (beside Urgent): title, link and footer change instantly with the data (feedback 3);
  only its rows still swap with motion. Urgent never animates: no entrance, no row swap, no resize.
- History's Analytics snapshots each get their own `LayoutGroup` (feedback 4): sharing the
  layoutIds `kpi-pill`/`week-thumb` with the live page made them fly across on every page change.
- Brief list layout animations only re-measure when the filters or the pick change
  (`layoutDependency`), and the list is a `layoutScroll` container: resizing the panel or
  scrolling a brief into view no longer slides rows or the selected background (feedback 4).
- The whole Urgent card is a frame (feedback 4), one id per period (`analytics.urgent`,
  `analytics.urgent-lastWeek` …) with its own scripted answer. Clicking a tag in the chat brings
  back the Analytics view it was asked in, so card rows and a period's Urgent card can re-highlight.
- Composer hint (feedback 4): "Click the [highlight icon] to select a frame"; with highlight on,
  "Click any frame to select it" (so it never says to click the button that would turn it off).
- Motion follows Emil Kowalski's standards where they're rules, not taste (feedback 4): exits ease
  out (`easeExit` = `easeOut`, was ease-in per brief B4) and nothing grows from scale 0 (handles
  and first-load chart dots start at 0.9 + transparent).
- Feedback 5 — Emil Kowalski's standards across the app ("follow all of Emil skill"): curves
  ease-out [0.23, 1, 0.32, 1] / in-out [0.77, 0, 0.175, 1] / CSS `ease` for colour; durations
  under 300ms (slow 0.25, data 0.28); sliding indicators = 250ms strong in-out (no spring);
  anything a key changed lands at once (`lib/input.ts` `viaKeyboard()`: KPI/week/day, numbers,
  chart, menu, brief pick, History chat, frame pick, tag chip); KPI card rows and the chart title
  change at once; History snapshot swap is a quick fade and its tag outline doesn't pop; HTML
  motion uses transform strings (SVG keeps Motion's scale props — strings break there); stock
  bars reveal by clip-path; toasts rise their own height (400ms ease) and replace in place;
  exits faster than enters; staggers ≥ 30ms. Kept by design: the "All pages" two-step menu
  (user's design), now ≤ 250ms per step.
- Bottom card rows all match the Revenue card: post thumbnails 29×36 (Figma 30×38, same 4:5), 12
  apart; follower rows label·8·bar, 18 apart — every variant's rows total 132px.
- Photos: `images/` holds the user's 2048² originals (git-ignored); `public/products/*.webp` are
  256² q80 copies. `Thumb` shows the photo over the gradient swatch (fallback + loading backdrop).
