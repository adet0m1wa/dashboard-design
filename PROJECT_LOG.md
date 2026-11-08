# Hop: project log

For the portfolio. Written 8 Nov 2026 from the repo, the git history, and what I (the owner) told
Claude. Where something is not recorded it says so, and nothing here is invented. If you are the
Claude opening this folder to build my portfolio page, read "Notes for the portfolio" first.

## What it is, and who it is for

Hop is a dashboard for Instagram vendors, with an AI analyst, also called Hop, on every page. The
vendor can click any part of a page (a chart, a stock row, a customer message), ask Hop about it,
and get the answer in a side panel. It covers six pages: Analytics, Sales, Instagram, Inventory,
Customers and History. The idea is for Instagram vendors, though the same thing could work for
other kinds of seller.

It is a prototype. Every answer is scripted and all the data is made up (a fictional fashion shop
called Amara Atelier). It is not a live product.

## The problem, and what I set out to do

Hop was an idea I had on a random day. I had never designed a dashboard before, so I decided to
try one. I do not know much about Instagram vendors or about Shopify, so this is an imagined
product, not something built from vendor research. What I imagined: a super app where a vendor can
see everything going on in their business.

The person I had in mind is a busy owner of an Instagram shop, someone with a 9-to-5 or another
business who still has to know what is happening on the account. Instead of waiting for staff to
report back, they log in and ask Hop what is going on. I also imagined a future where AI is
adopted widely and is cheap, and a tool like this does well in that future. It feels a bit like
Shopify, though I do not know Shopify well.

## What I made, and the decisions behind it

- **Point at it, then ask.** Turn on highlight mode, click any part of the page, and a tag joins
  your question. Hop scans that exact thing and answers. Shift-click adds more things to the same
  question (influenced by multiselect in Figma).
- **One place for the three things a vendor juggles.** Customer DMs (with replies already drafted
  for whoever has waited longest), Instagram reels (including how many people asked the price) and
  stock, all in one app.
- **Hop drafts, people approve.** Actions such as "Send all 3" or "Draft express order" are
  suggestions the vendor confirms.
- **History keeps a snapshot.** Every question is saved with the page as it looked, so a team can
  see what a decision was based on.
- **Six pages, 3 promo videos, 6 static images**, built over 8 days of work (26 Sep to 6 Oct 2026).

How it was built: I described the ideas and Claude Code built them, in phases, then through ten
rounds of my change requests (collapsible panels, highlight mode, instant page changes, Shift
multi-select, and more). The detail is in the appendix.

## Who did what

- **Me:** the idea, the direction, and every decision in the feedback rounds.
- **Claude Code:** the execution. It built the app, the tests, the recording pipeline and the
  video edits, from my descriptions and feedback.
- I did very little of the design in Figma myself. That was on purpose: I wanted to see what came
  out when I described the idea and did little or no design work. The Figma frames I started from
  are listed in the resources table.

## Tools

Figma (the starting frames and design variables), Claude Code, Next.js 16, React 19, Tailwind 4,
Motion, Zustand, d3-shape, headless Chrome for tests, ffmpeg for screen recording, Remotion for the
video edits. No Rive files in this project.

## Research and context

I did not run user research: no interviews, surveys or usability tests, and I did not talk to
vendors. What follows is desk research done on 8 Nov 2026, after the prototype was built. It is
context that shows why the problem is worth looking at. It does not prove that Hop works.

| What was found | Source |
|---|---|
| 32% of consumers expect a reply to a direct message within one hour. Survey of nearly 1,000 US consumers, April 2025. | Emplifi, press release, 2 Apr 2025 (emplifi.io/press) |
| The same survey: 70% of consumers say they will abandon a brand after two negative experiences, and 24% after one. | Emplifi, same release |
| An older, much-quoted snapshot: retailers ignored 83% of customer questions on social channels, and the others took an average of 12 hours to reply. Dated: Sprout Social's Q4 2015 Index, so only use it as history. | Retail Dive, 19 Nov 2015 |
| 58% of US small businesses say they use generative AI in 2025, up from 40% in 2024 and 23% in 2023. Survey by the US Chamber of Commerce with Teneo Research; the page does not state the sample size. | US Chamber of Commerce, 18 Aug 2025 |
| Shopify announced Sidekick, a conversational assistant for merchants, which shows the "ask the AI about your shop" idea already exists in a big platform. Early demo: it explained a sales dip and suggested a discount. | TechCrunch, 26 Jul 2023 |

What this supports: customers expect fast replies on social media, small businesses are adopting
AI quickly, and AI assistants for merchants are an established direction.
What it does not support: that Instagram vendors want Hop, or that Hop's design works. The
consumer figures are US-wide and not specific to Instagram sellers, and the Emplifi figures come
from a software company's own press release.

## The UX thinking behind the design

This is reasoning I can show from the build, not research findings.
- **Point at what you mean.** Asking about a thing you can see is easier than describing it, so any
  part of any page can be picked and asked about.
- **Fewer pages to check.** One question can cover two things (Shift-pick) and jump chips take you
  to the right page, so a vendor is not hunting through screens.
- **People stay in control.** Hop drafts and the vendor approves, so nothing is sent without a
  human looking at it.
- **A record of decisions.** History keeps what the page looked like, so a team can see why
  something was done.
- **Accessibility worked in.** Eight colour variables were darkened to reach 4.5:1 contrast,
  everything picked by mouse can also be picked by keyboard, motion respects reduced-motion
  settings, and there is a skip link (review in `docs/INTERFACE_REVIEW.md`).

## Outcomes

None recorded. No user testing and no feedback from vendors. I posted on X in early October 2026 and the
posts did not get meaningful engagement; I have no numbers.
Some results from the build itself are in the appendix (frames compared with Figma, test runs).

## Where things live

Paths are relative to this folder. Videos and recordings are on this Mac only (they are too large
for GitHub and are git-ignored).

| What | Where |
|---|---|
| Video 1: point at two things, ask once, jump (12.5s, 1080p, 60fps) | `video/out/proof.mp4` |
| Video 2: Sales, click a day and the page follows (8.8s) | `video/out/sales.mp4` |
| Video 3: History, snapshots of past questions (13.4s) | `video/out/history.mp4` |
| 6 static images, 2880 x 1800 | `posts/static/1-analytics.png`, `2-sales.png`, `3-instagram.png`, `4-inventory.png`, `5-customers.png`, `6-history.png` |
| Captions for the images (two posts of three) | `posts/static/CAPTIONS.md` |
| Captions for the videos (long form, Instagram vendor point of view) | `posts/video/CAPTIONS.md` (on the `video-pipeline` branch) |
| Figma file ("workshop", Page 4, section "fresh") | https://www.figma.com/design/10tguKfuD7CG5DsbNi2gDS/workshop?node-id=1775-2502 |
| Figma frames rendered as images | `docs/figma/` |
| Screenshots from the test runs | `docs/screenshots/` |
| Product and post photos | `public/products/` (full-size originals in `images/`, not on GitHub) |
| Build brief, design notes, interface review | `docs/HOP_BUILD_BRIEF.md`, `docs/DESIGN_NOTES.md`, `docs/INTERFACE_REVIEW.md` |
| Video project (Remotion), recorder and clip scripts | `video/`, `scripts/record.mjs`, `scripts/clips/` (on the `video-pipeline` branch) |
| Live link | None, on purpose: a live link would be too open for people to interact with, so the videos stand in for it |

Do not use: `video/out/check.mp4` (a test file) and `video/public/*.mov` (raw recordings that
contain private chat notifications).

## Notes for the portfolio

- Use the three videos, in the order above, plus the six images. That is every interaction worth
  showing. A fourth video is allowed but not made.
- Say plainly that it is a prototype with scripted answers and made-up data, and that the idea is
  mine and Claude Code built it. Do not describe the research table as user research, and do not
  invent outcomes, user quotes or numbers.
- Use the Instagram-vendor framing. The posts' wording and the long captions already follow it.
- Not for public copy unless I say so: that the posts got little engagement.

## Unfinished, or to remember

- Only `main` is on GitHub. The video project and video captions are on the local branch
  `video-pipeline`; the videos themselves are only on this Mac.
- No usability testing yet. The honest next step is to show the prototype to 5 real Instagram
  vendors and record what confuses them.
- The case study write-up (Contra style) is not done.
- A possible fourth video is not made. The Customers inbox (a drafted reply ready to send) would
  be the candidate.

---

# Appendix: build details

Taken from the git history and the project notes (`CLAUDE.md`, `docs/`). Figures that come from an
earlier test run were read from the notes, not re-run.

### At a glance

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

### Timeline

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

### What was built

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

### Craft and quality

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

### How the work ran

The design came from Figma and was built in code with Claude Code, in phases, each on its own
branch and merged to main. After the first build, ten feedback rounds drove most decisions, and
feedback overrode the original brief where they disagreed. Examples:
- Highlight mode replaced Alt-click tagging.
- Page changes, sidebar collapse and panel resizing became instant ("like the Claude app").
- Scrollbars appear only while scrolling.
- A card row fixed at one height so the Urgent card never moves.
- Shift multi-select and the full-screen panel.

### Promo content

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

### Problems solved (good stories for a write-up)

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
