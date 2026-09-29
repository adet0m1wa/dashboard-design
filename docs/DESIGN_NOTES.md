# Design notes — values read from Figma

Read once from the Figma file (workshop → Page 4 → section **"fresh"**) and recorded here so
the build doesn't re-scan. **There are two sections named "fresh" on Page 4 with identical
frame names.** The left one (x≈2135) has the "dashboard variables" bound; the right one
(x≈13503) has no variables bound and is treated as a stale duplicate. Everything below comes
from the **left** one.

Token names are the generated CSS names (`--color-surface-default` = Figma `color/surface/default`).

## Shell (frame "Analytics")

- App: bg `background-app`, padding 8, gap 8. Sidebar 224 (px 4, py 6, gap 2). Workspace fills the rest, radius 12, overflow clip, **no border in Figma** (brief says 1px border — Figma wins on looks).
- Main (page area): white. Top bar h56, px 20, bottom border 1px `surface-faint`.
  - Title: 16px icon + 13/600 primary, gap 8.
  - Right (Analytics): "Thursday, 24 Sep - 2:30 PM" 12.5/500 `text-strong-secondary` (three texts gap 4) · gap 16 · dark button: bg `action-primary`, radius 8, px 10 py 6, gap 6, ArrowsClockwise 12px white + "Last sync: 14:00" 12.5/500 white.
- Content: px 28, py 24, gap 24.
  - Greeting: "Good afternoon, Amara" 26/600 tracking -0.52 · gap 4 · "Below is your analytics. Hop last checked everything at 2:00 PM." 14/400 lh20 secondary.
- Hop panel: 368 wide, white, left border 1px `surface-divider-tint`.
  - Header h56, px 16, bottom border `surface-faint`: avatar (30px) + "Hop" 14/600, gap 10 · New chat icon 20px (filled speech-bubble-plus, black).
  - Conversation: px 16, py 14, gap 16. Empty state = spacer + prompt cues at bottom.
  - Prompt cues: wrap, gap 6. Cue: border 1px `surface-border-tint`, radius 999, px 11 py 6, 12.5/400 `text-strong-secondary`.
  - Composer: px 12, pt 4, pb 12. Input box: white, border 1px `palette-tone-14`, radius 14, shadow composer, pl 14 pr 12 pt 12 pb 10, gap 14.
    - Row 1: "Select any frame" hint: bg `surface-subtle`, radius 6, px 8 py 4, 11.5/500 secondary.
    - Row 2: placeholder "Ask Hop about sales, posts, stock or customers…" 13/400 muted · send button 28px circle (radius 14) `action-primary` with 14px up-arrow white.

## Sidebar

- Store switcher: px 8 py 6, space-between. Logo 22px `action-primary` radius 6 "AA" 9/700 white · "Amara Atelier" 13/600 · chevron 14px muted. Right: panel icon 16px muted.
- Nav stack: pt 16, gap 2. Item: px 10, py 7, gap 10, radius 8, icon 16. Active: white bg, 0.5px border `surface-border-tint`, shadow nav-active, text 13/600 primary, icon primary. Inactive: 13/500 secondary, icon secondary.
- Badges: px 7 py 1 radius 10, 11/600. Inventory "4" warning-soft/warning-text. Customers "3" danger-soft/danger-text.
- "Recent with Hop": pt 16, gap 2. Header px 10 pb 6: "Recent with Hop" 11.5/500 muted + history icon 13px muted. Items px 10 py 6 gap 8 radius 6: avatar 16px radius 8 (initial 8.5/600 white) + text 12.5/400 `text-tone-01`, ellipsis.
  Items: A "How are we doing today?", I "Restock plan for linen sets", D "Reply drafts for late DMs", Z "Weekend content ideas".
- Spacer, then Settings (sliders icon, 13/500 `text-strong-secondary`, px 10 py 7), then user: px 10 py 8 gap 10, avatar 28 radius 14 "A" 12/600 · "Amara Obi" 13/500 primary / "Owner" 11.5/400 muted (gap 1).
- **No search box in Figma** (brief A6 mentions one) — Figma wins.

## Analytics body

- Quick stats box: border 1px `surface-border-tint`, radius 12, p 6, gap 4.
  - KPI tabs row gap 4, each flex-1, px 12 py 10, gap 4, radius 8; selected = bg `surface-subtle`.
    Label 12/400 secondary · value row gap 6 baseline: value 20/600 tracking -0.2 · change 12/500 success-text (DMs today: "3 over 2h" danger-text; past: "all answered" success-text).
  - Chart section: w 752 (fills), pl 14 pr 18 pt 14 pb 10, gap 12.
    - Title 13/500 primary. Toggle: bg `surface-subtle` radius 9 p 6 gap 6; options p 8 gap 6, 8px legend dot + 12px secondary text (active 500, inactive 400). Thumb = white, radius 6 (last-week frame adds shadow 0 1 2 rgba(0,0,0,.08)).
      Legend dots: this week active → green `status-success`, last week `palette-tone-04`; swapped when last week is on.
    - Chart box 720×150 (see Chart geometry).
    - X axis 11.5: past/future labels `text-tone-02` 400; the "current" label `status-success-text` 500 (Today; or the selected day; Sun in last week).
- Cards row: gap 12, two equal cards (flex-1), fixed h 246 in Figma. Card: white, border 1px border-tint, radius 12, p 16, gap 12. Spacer pushes footer down. Footer: top border 1px `surface-faint`, pt 10, 12px, left 400 secondary / right 500 primary.
  - Header: title 13/600 · link "Open X" 12/500 secondary + arrow 12px, gap 4.
  - Product row (gap 10): image 36px radius 6 gradient swatch · name 13.5/500 (ellipsis) / sub 12/400 secondary (gap 2) · optional tag · amount 13.5/600.
  - Order row: avatar 32 radius 16 initials 11/600 white · name 13.5/500 / "item × n · time" 12 secondary · tag "To pack" (warning-soft/warning-text) · amount 13.5/600.
    Avatars: TB `palette-tone-01`, AW `palette-tone-15`, GM `palette-tone-02`, CE `palette-tone-17`.
  - Post row: thumbnail 30×38 radius 5 gradient · title 13.5/500 / meta 12 · right column (end-aligned): likes 13.5/600 + "likes" 11/400 muted.
  - Source row: col gap 6 — label row space-between (13.5/500 primary · "132 · 62%" 12.5/400 secondary) + bar h6 radius 3 bg `palette-tone-16`, fill `status-success` width = share %.
  - DM row: avatar 32 · name 13.5/500 / quote 12 · tag waiting time (danger-soft/danger-text).
  - Tags: px 8 py 2 radius 10, 11/600.
- Urgent card ("Card/Needs you"): title "Urgent" 13/600. Rows gap 10: icon tile 30px radius 8 (msg → danger-soft + danger icon; box → warning-soft + warning icon; users → `palette-tone-09` + `palette-tone-10` icon), 15px icon · title 13/500 / sub 12 (gap 2) · button px 10 py 6 radius 8 12/500: primary = `action-primary` bg white text; secondary = white, 1px border-tint, primary text. Done state = the secondary style with "Resolved/Completed/Attended".

## Chart geometry (720×150 box)

- Day x = 12 + 116·i (Mon 12 … Sun 708). Value → y = 140 − v/max·118 (zero at y 140, max at y 22).
- Baseline y 146, 1px `surface-border-tint`: solid to x 360, dashed 3/4 to 720 (this week); solid 0→708 (last week).
- Area: line → down to y 146, fill `palette-tone-05`. Line 2px `status-success`. Comparison (last week) 1.5px `palette-tone-06`, full 7 days.
- Dots: normal r4 white fill, 1.5 green stroke. Active (today / selected day / Sun in last week) r5 green fill, 2px white stroke.
- Selected day guide: from dot y+8 down to 146, 1px green, dash 2/3.
- Figma's curve is hand-drawn; brief says d3 `curveMonotoneX` (very close).

## Card content per state

- Today cards: see brief A7. Figma adds: posts meta "Post · Mon · by Zee" (brief omits "by Zee").
- Wednesday: title "Wednesday, 23 Sep". KPI label stays "Revenue today" in Figma (brief B7.1 says drop "today" → we drop it). Card "Top revenue generators · Wed", subs "10 sold · 29% of the day". Swatches reuse sand / emerald / indigo in row order. Urgent done: msg "2 delivery addresses incomplete / Both updated by 10:30 AM → Resolved", box "Emerald dress size 12 low / Restocked before noon → Completed", users "4 priority DMs / Dayo replied by 1:15 PM → Attended".
- Last week: labels drop "today" ("Revenue"). Title "Last week · 14-20 Sep" (brief writes 14–20). Card "Top revenue generators · last week", subs "31 sold · 18% of the week"; swatches sand / terracotta (#E0772E→#B45309) / indigo. Footer $8,800 in Figma → $9,200 per B11. Urgent done: msg "Weekend return requests / All 7 requests closed → Resolved", box "Mocha robe stock check / Supplier confirmed 60 units → Completed", users "Post-sale customer follow-up / 18 customers contacted → Attended".
- Followers: Figma/brief show 981 for last week; the series sums to 881. Displayed 981 as designed; flagged.

## Hop panel — conversation (frame "Inventory — nothing selected, jump chips stay" > Hop — Agent panel)

- Header avatar here is the **Agent character** ("Hop · character (Rive slot)", 30px = the 40px
  component scaled): antenna `palette-tone-25`, antenna light `status-live`, head gradient hop-head,
  screen `palette-tone-11` + 1px `palette-tone-12`, eyes `palette-tone-13` with a green glow (blur 4,
  #2BB35A 70%). The "Analytics" frame draws a simplified head without the antenna; we use the component.
- This frame's header says "Hop · Synced 2:00 PM" with no New chat button → B11 #3: use the Analytics header.
- Conversation: px 16, py 14, gap 16. Messages column gap 16.
- User message: column, items-end, gap 6.
  - Meta row gap 6: "Amara · 2:31 PM" 11/500 muted + 16px avatar.
  - Tag chip ("Selected frame chip"): bg `palette-tone-20`, 1px `palette-tone-21`, radius 6, px 8 py 3, gap 6:
    frame icon 12px (`status-info` strokes) + name 11.5/500 `text-tone-04`.
  - Bubble: bg `background-app`, px 14 py 10, radius 12 12 4 12 (bottom-right 4), 13/400 lh 19 primary.
- Hop message: column, gap 8, full width.
  - Meta: "Hop · 2:31 PM · read Inventory, Sales" 11/500 muted.
  - Paragraphs 13/400 lh 19 primary.
  - Sizes left: 1px border-tint, radius 10, p 12, gap 8. Title "Sizes left" 11.5/500 secondary.
    Row gap 6, five equal cells, py 6, radius 8, gap 1, centred: "Size 8" 10.5/400 + count 15/600.
    Normal cell `surface-subtle` (secondary / primary text); zero cell `status-danger-soft`, both texts `status-danger-text`.
  - Action buttons row gap 8: px 11, py 6, radius 8, 12/500. Primary dark / secondary white + 1px border-tint.
- Marker: row gap 8: 1px `surface-divider-tint` line · "Moved to Inventory · 2:32 PM" 11/500 muted · line.
- Fade mask over the bottom of the messages (Figma: transparent → white from 78% of the box); brief: CSS mask-image, bottom 48px.
- Jump chips ("Page cues"): column gap 8. Label "Jump to" 11/500 muted. Chips row gap 6: px 12, py 7,
  radius 999, 12.5/500. Inactive: bg `palette-tone-19`, text `text-tone-03`. Active: bg `action-primary`,
  text on-dark + 12px arrow-right (white).

## Selection (frames "Analytics — frame selected, before asking" / "tag clicked, highlight back on")

- Selection outline: 1.5px `status-info`, radius 8, drawn 2px outside the frame left/right and 4px
  above/below (product row 36px tall → outline 44px).
- Handles: 7×7, white, 1.2px `status-info` border, centred on each outline corner (offset −5px).
- Composer when something is selected: the tag chip replaces "Select any frame" — same chip as in
  messages plus an 11px × (icon/x). Placeholder "Ask about this frame…" (one line → composer 105px tall).
- Active tag ("Selected frame chip — active"): bg + border `status-info`, text/icon on-dark,
  shadow 0 0 0 3px blue at 25%.
- Jump chips: "Jump to" + [Go to Inventory →] active first, then [Go to Analytics] inactive
  (this older frame still says "Go to Chat" — brief says Analytics).

## History (frames "History — …"; read 2026-09-26)

- Layout: NO Hop panel on History. Top bar spans the whole workspace (1192). Below it: left
  "Content" 832 + right "Brief chain" 360 (border-l divider-tint). "Chat expanded" swaps the chain
  for that brief's chat with "← Back". Plan: one right column that crossfades Hop panel ↔ chain;
  keep HopPanel mounted but hidden on History so streaming/typing survive.
- Chain: person filter row pt14 pb10 px16 wrap gap6 — "Everyone" active: bg action-primary px11 py4
  radius 999 12/500 on-dark; person chips: 1px border-tint, pl4 pr10 py3, radius 999, gap 6, avatar 18
  (radius 9, initial 9/600) + name 12/500 strong-secondary. Figma shows Everyone/Amara/Ife/Dayo; brief
  adds Zee (row wraps). Search row px16 pb12 gap8 border-b divider-tint: search box flex-1 white,
  1px border-tint, radius 8, px10 py7, gap8, search icon 13 + "Search briefs" 12.5 muted; "All pages"
  button same box, 12.5/500 strong-secondary + Chev13.
- Day header: pt14 pb4 px16, "Today"/"Yesterday" 11/500 muted.
- Brief item: px16 gap12. Trail column w18 self-stretch: above segment h14, avatar 18, below segment
  flex-1; segments = 1.5px dashed left border `palette-tone-27`; hide above on a day's first item,
  below on its last. Content col flex-1 gap5 py14: meta row gap8 ("Amara · 2:40 PM" 11.5/500 muted
  flex-1 + page pill bg surface-subtle px7 py1 radius 6 11/500 secondary); question 13.5/600 primary
  truncate; tag chip bg tone-20 1px tone-21 px7 py2 radius 6 gap5 (FrameIcon 11 + 11/500 tone-04);
  summary 12.5/400 lh18 secondary, 2-line clamp. Selected: row bg `palette-tone-28` (no dark bar in
  Figma) + "Expand" pill bg action-primary px10 py4 radius 999 gap5 (Expand icon 11 + 11.5/500 on-dark).
  Hop's own brief uses the Agent character at 18px.
- Page pill labels: Customers, Inventory, Chat (Analytics briefs), Instagram.
- Summaries (copy exactly): 2:40 "Chioma is waiting on order #1042. It shipped this morning, and Hop
  drafted an apology with the tracking number." · 2:33 "The Adire shirt dress sold out on Monday and
  isn’t on the restock order. 14 people have asked about it." · 2:14 "$2,480 so far, 12% ahead of last
  Thursday. 3 late replies, and the Sand set is running low." · Zee 1:40 "3.1× usual reach: a strong
  opening, the 7:30 PM slot and 62 price questions in the comments." · Ife 8:40 "42 pieces for $1,470.
  Amara changed the Sand set to 25 at 2:20 PM." · Hop 8:00 "Yesterday closed at $3,120, your best
  Wednesday this month. 3 things need attention today." · Yesterday Dayo 5:10 "4 drafts written. Dayo
  sent 3 and edited 1."
- Left side: px28, note bar at y24 (776×32): bg surface-subtle, px12 py8, radius 8, gap 8, icon 14
  (TimeIcon for Analytics, ScreenshotIcon otherwise) + 12.5/500 strong-secondary text:
  "Analytics as it was at 2:14 PM, Thu 24 Sep — when Amara asked" /
  "Screenshot of Instagram — taken at 1:40 PM, Thu 24 Sep, when Zee asked" /
  "Screenshot of Inventory — taken at 2:33 PM when Amara tagged “Adire shirt dress”".
  Analytics kind: the Analytics page itself below the note (read-only). Screenshot kind: card at y70,
  776×732, white, radius 12, overflow clip, shadow token `screenshot-card`; page drawn at 0.83 scale
  (top bar 46 = 56×0.83). Tagged kind: same card + selection outline around the Adire row.
  Instagram card image: public/history/instagram-1-40pm.png — 2× (1530×1464), from `download_assets` on node 1839:3721 at scale 2, cropped to the card (the export adds the shadow margin: 40px left/right, 28 top, 52 bottom at 2×).
- Chat expanded (frame 1869:68830, read 2026-09-28): Split under the top bar = Content 824 + a
  Hop-panel-style column 368 (border-l `surface/divider-tint`). Header h56, px16, border-b
  `surface/faint`: `CaretLeft` 16 + "Back" 14/600 `text/black`, gap 4, items-end. Conversation
  px16 py14 gap16, the normal message styles; no composer. The snapshot card keeps the page at
  0.83 scale, so it narrows to 682 in the 824 content (no stretch).

## Collapsed sidebars + new highlight (frames "example 1" 1909:462, "example 2" 1913:334, "example 3" 1917:786; read 2026-09-28)

The "fresh" section is now a single section (id 1816:4657, x 1694); the old duplicate is gone.

- **Sidebar, collapsed** ("example 1" > Sidebar, 56 wide): px 4, py 6, gap 2, items centred.
  - Store switcher → only `icon/panel` 16, px 8 py 6 (the expand toggle). No store logo/name.
  - Nav stack pt 16 gap 2; each item icon-only, px 10 py 7, radius 8. Active item = the same pill
    (white, 0.5px `surface/border-tint`, `shadow-nav-active`). Inventory/Customers stack the badge
    under the icon (flex-col, gap 2 / 4), badge px 7 py 1 radius 10, 11/600 (warning / danger soft).
  - Recent with Hop: pt 16 gap 2; header = `icon/history` 13px only (px 10 pb 6); items px 10 py 6,
    radius 6, 16px avatar only.
  - Spacer; Settings icon only (py 7); Current user px 10 py 8, 28px avatar only.
  - Workspace then starts at x 72 (8 + 56 + 8) and is 1360 wide.
- **Sidebar, expanded** ("example 3" > Store switcher): unchanged, `icon/panel` on the right is the
  collapse toggle.
- **Hop header** ("example 1" > Agent header): px 16, border-b `surface/faint`; right side is two
  18px icons, gap 14: `ChatCentered` (new chat) then `BoundingBox` (highlight mode). Icons
  `design/icons/chat-centered.svg`, `bounding-box.svg`. Highlight-on state isn't drawn.
- **Hop panel, collapsed** ("example 2" > Hop - Agent panel): 63 wide (62 + 1px left border
  `surface/divider-tint`), header 56 with border-b `surface/faint`, only the 30px mascot at px 16.
  Nothing else visible. Main grows to fill (1297 in the frame).
- **Highlight** ("example 3" > Selection outline 1917:1023): 1.5px `status/info`, **square corners**.
  On a card row it spans the card's full width — its left/right edges sit exactly on the card's own
  1px border (card x 28…406 = outline x 28…406) — and 4px above/below the row (row 36 tall → 44).
  Handles: 7×7 white, 1.2px `status/info`, at −4.5px on each corner.
- Chart in "example 2" stretches with the wider page: same 150 height, days spread evenly across
  the full width (x axis labels justify-between).

## Feedback round 2 (read 2026-09-29)

- **"All pages" menu** (frames "All pages" 1934:1925, "transition" 1935:1993): box 97 wide, 1px
  `surface/border-tint`, radius 8, px 10 py 7, white. Rows 12.5/500 `text/strong-secondary`, 16 tall,
  gap 6 (pitch 22): All pages, Chats, Sales, Instagram, Inventory, Customers. Closed = 32 tall
  showing the chosen row; open = 142. `icon/chev` 13px beside the chosen row, rotated 180° (⌃)
  while open; the content row is 75 wide, label and chevron justify-between. The "transition"
  frame: mid-close the box is 90 tall with "All pages" pushed to −5 and "Chats" (with chevron) at
  17; closed, "Chats" sits at 7 and "All pages" at −15 (clipped). I.e. the list rolls up inside the
  box while it shrinks.
- **Icons not from Figma** (hand-made to match the set): `design/icons/instagram.svg` — the
  Instagram glyph at 16px, 1.333 stroke like `icon/camera`; `design/icons/arrows-out.svg` — the
  Phosphor "ArrowsOutSimple" (regular) at 18px, filled, like BoundingBox/ChatCentered.
- **Side panel width**: max = default = `layout/panel` 368; min `layout/panel-min` 300 (ours).
- **History** now keeps the side panel (Hop header with the mascot; chain or chat below), so its
  top bar spans only the page area like every other page — the History frames' full-width top bar
  and 360 chain column are superseded.
- **Colour variables changed in Figma** for WCAG AA (see CLAUDE.md > Decisions): text/muted
  #716F6B, text/tone-02 #577764, status/success-text #1C7E46, palette/tone-01 #7A5BF6, tone-02
  #B56025, tone-03 #CE4275, tone-15 #52840B, tone-17 #0C875E.
- Round 3 (2026-09-29): motion pared back — see CLAUDE.md > Decisions (instant pages/sidebars,
  standard 48px chat fade, auto-hiding scrollbars, no Analytics title icon, static Urgent).
