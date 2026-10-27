# Hop: project log for the portfolio

Everything accomplished on Hop, from the first commit (26 Sep 2026) to the promo videos and
captions (6 Oct 2026). Written from the git history and the project notes (`CLAUDE.md`,
`docs/`). Where a figure comes from a past test run, it says so; nothing here was re-run on the
day of writing unless stated.

## In one paragraph

Hop is a dashboard for a small fashion business (the fictional Amara Atelier) with an AI analyst,
also called Hop, on every page. The core idea: click any part of the page to select it (a blue
outline), ask Hop about it, watch it scan, and get the answer in the panel. It is built for
Instagram vendors: their DMs, reels, orders and stock in one place, with an AI that can be pointed
at the exact thing you mean. It is a prototype: every answer is scripted and there is no real data.
It was designed in Figma, built as a working web app, tested against the Figma frames, then turned
into six static posts and three short screen-recorded videos with captions.

## At a glance

| | |
|---|---|
| Time span | 26 Sep to 6 Oct 2026: 69 commits across 8 days of work |
| Product | 6 pages (Analytics, History, Sales, Instagram, Inventory, Customers), one persistent shell, the Hop panel on every page |
| Code | about 9,500 lines of TypeScript / React: 50 components, 20 data files, 12 library files |
| Stack | Next.js 16 (App Router), React 19, Tailwind 4, Motion 13, Zustand, d3-shape |
| Design source | Figma file, section "fresh": 19 frames, 37 icons exported to code |
| Fidelity | All 19 frames rebuilt and compared pixel by pixel: 2.0 to 7.4% difference each (final test, 28 Sep) |
| Tests | 19 scripted browser flows, each run in normal and reduced-motion mode: 38 runs, all green on the production build as of 5 Oct |
| Selection frames | 164 selectable frames, each checked at two window widths so outlines are never cut off |
| Data | 1,098 seeded orders from store opening (3 Aug), pinned so every page agrees with every other |
| Feedback | 10 rounds of change requests, each built, tested and merged |
| Promo | 6 static images (2880 x 1800), 3 videos (12.5s, 8.8s, 13.4s at 1080p, 60fps), captions for the 2 image posts and the 3 videos |

## Timeline

| Date | What happened |
|---|---|
| 26 Sep | Build brief and Figma variable export. Phases 0 to 6: setup, shell, Analytics (static, then interactive), the Hop panel, the selection system, Inventory with jump chips |
| 28 Sep | Feedback 1 (collapsible sidebars, highlight mode). Phase 7 History. Phase 8 polish and an accessibility and interface review. Final test: the brief's 10 flows as one journey |
| 29 Sep | Feedback 2 (resizable side panel with History inside, custom "All pages" menu) and 3 (instant page changes, auto-hiding scrollbars) |
| 30 Sep | Feedback 4: a steady bottom card, cards named for each KPI, selectable Urgent |
| 1 Oct | Feedback 5 (one card rhythm, a full motion pass, product photos), 6 (Sales, Instagram and Customers pages built) and 7 (Sales periods, Customers layout, Instagram calendar) |
| 2 Oct | Customers list height, Sales day picking, Feedback 8 (outlines never cut off, Analytics full screen) |
| 5 Oct | Feedback 9 and 10 (smooth full-screen exit, Shift multi-select, week views). Then the promo work: static posts, captions, the video pipeline, three clips |
| 6 Oct | Captions rewritten from an Instagram vendor's point of view |

## What was built

**The Hop idea, as interaction**
- Highlight mode: turn it on, hover and every part of the page shows an outline; click to pick it.
  The outline snaps to existing strokes (a card's border, a table's dividers) instead of floating.
- Ask about what you picked: a tag chip joins the question, Hop scans the frame, the answer
  streams in word by word with blocks (sizes, lists, action buttons).
- Multi-select: Shift-click adds more frames to the pick (influenced by multiselect in Figma) and Hop
  answers for each in one reply.
- Jump chips: an answer can send you to the right page ("Go to Inventory") and back.
- Re-highlight from history: click a tag in the chat and the page returns to the view it was asked
  in, scrolls to it and outlines it again.

**The six pages**
- Analytics: KPI tabs that morph, a chart that tweens day by day, five card variants, an Urgent
  card with actions, this week and last week, a full-screen Hop panel, a first-load entrance.
- Sales: a chart you can click by day (tiles count to that day, orders narrow to it), weekly,
  monthly and all-time periods, a virtualised order list of 1,098 orders.
- Instagram: posts and reels with stats written to fit one line, a comments list, a calendar of
  earlier posts.
- Inventory: stock table with bars that reveal on first visit, attention pill, jump chips.
- Customers: a conversation inbox, a chat with a drafted reply ready to send, a customer's full
  order history, draggable panes.
- History: a chain of every question the team asked, each with a snapshot of the page as it was,
  person, page and search filters, expand into the full conversation and back.

Sales, Instagram and Customers were not in the original Figma frames. They were designed directly
in code from the feedback rounds, in the same system.

## Craft and quality

- **Design tokens only.** Figma variables export to JSON, a script turns them into a Tailwind
  theme, and a check fails the build on any raw colour, arbitrary value or off-scale spacing.
- **Figma is the visual source of truth.** 19 frames rebuilt and diffed against the app.
- **Motion with rules.** All timings come from one file. A full pass applied Emil Kowalski's
  standards: ease-out curves, under 300 ms, nothing grows from scale 0, keyboard changes land
  instantly, exits faster than enters. Reduced motion is respected everywhere.
- **Accessibility.** Eight colour variables darkened (same hues) to reach 4.5:1 contrast and
  updated back in Figma; keyboard picking in highlight mode; a skip link; 24px hit areas; truncated
  text shows its full value; toasts stay 5 seconds. A written review is in `docs/INTERFACE_REVIEW.md`.
- **Testing.** Scripted headless-Chrome flows check behaviour, timing and layout, and a
  production build is used to judge motion because dev mode drops frames.
- **Data that agrees with itself.** One seeded order book feeds Analytics, Sales, Customers and
  Hop's answers, so the numbers match wherever you look.

## How the work ran

The design came from Figma and was built in code with Claude Code, in phases, each on its own
branch and merged to main. After the first build, ten feedback rounds drove most decisions, and
feedback overrode the original brief where they disagreed. Examples:
- Highlight mode replaced Alt-click tagging.
- Page changes, sidebar collapse and panel resizing became instant ("like the Claude app").
- Scrollbars appear only while scrolling.
- A card row fixed at one height so the Urgent card never moves.
- Shift multi-select and the full-screen panel.

## Promo content

**Static posts (5 Oct).** Six page images at 2880 x 1800, each in a state that shows what was
designed there, retaken by one script. Two X posts of three images, with captions that open on the
owner's point of view, then one line per screen.

**Three videos.**
1. Highlight, Shift-pick two frames, ask once, jump to Inventory (12.5s).
2. Sales: click a day and the whole page follows; click it again and it counts back (8.8s).
3. History: step through briefs and their page snapshots, open one, go back (13.4s).

How they were made:
- A script drives a real full-screen Chrome over the production build with a smooth curved pointer,
  logging every move, press and key.
- ffmpeg records the screen live at 60fps. Frame-perfect capture was not possible on this Mac.
- Remotion edits the take: a rounded window over a faded photo grid (30px between tiles), a
  spring camera that zooms to each action, and the pointer redrawn from the log with a press ring.
- Stills were pulled and checked before anything was shared.

**Captions.** Long-form posts from an Instagram vendor's point of view: a brief issue, the
solution the clip shows, then a use case. Every number is from the app's own data.

## Problems solved (good stories for a write-up)

- **Two clocks.** Node's timer and ffmpeg's frame stamps differed by hundreds of thousands of
  seconds on macOS. A magenta square flashed in the corner ties the click log to the video frame.
- **The cursor and the recording dot.** ffmpeg cannot hide the real pointer on macOS 26, so the page
  hides it with CSS and the edit repaints the margin where macOS draws its recording dot.
- **Notification banners.** Private chat banners slid into the recording even with Do Not Disturb
  on. The static corner is covered in the edit with a clean cut from later in the same take.
- **Tooltips in the footage.** Native hover tooltips were captured, so the recorder strips `title`
  attributes as the app adds them.
- **Failed renders on a full disk.** Remotion's frame proxy failed on a nearly full disk; switching
  to the in-browser video component fixed it.
- **Outlines at the edge of cards.** Selection handles that crossed a scroll area made the page
  scroll sideways; a fitting step moves them in just far enough.
- **Smooth full screen both ways.** Both sides keep their full-screen layout while the panel eases
  back, so nothing reflows mid-animation.

## Honest notes

- It is a prototype: scripted answers, seeded data, no real users or store. Use cases in the
  captions are plausible scenarios, not customer stories.
- The videos are recordings of the real running prototype, not mock-ups.
- Where a result is quoted from an earlier test run (38 of 38, the 2.0 to 7.4% frame match), it
  was read from the project notes, not re-run when this log was written.
- Videos and raw recordings are kept off GitHub (too large); the captions, scripts and the Remotion
  project are in the repo on the `video-pipeline` branch.

## Short blurb (for a portfolio card)

> Hop: a dashboard for Instagram vendors with an AI analyst you can point at anything on the page.
> Designed in Figma, built as a tested Next.js prototype across ten feedback rounds, then turned
> into posts and three screen-recorded videos. 6 pages, 164 selectable frames, 1,098 seeded orders,
> pixel-checked against 19 Figma frames.
