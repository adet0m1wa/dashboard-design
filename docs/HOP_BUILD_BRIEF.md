# Hop — Build Brief for Claude Code

**Figma file:** workshop → Page 4 → section **"fresh"**
https://www.figma.com/design/10tguKfuD7CG5DsbNi2gDS/workshop?node-id=1775-2502

**Design variables:** already in this repo (exported from the Figma collection **"dashboard variables"**).

---

## How to use this brief

- Put this file in the repo (e.g. `docs/HOP_BUILD_BRIEF.md`) and point to it from `CLAUDE.md`.
- **Figma decides how things look. This brief decides how things behave.** If they disagree on visuals, follow Figma. If they disagree on behaviour, follow this brief. Known mismatches are listed in section B11.
- Build **one phase per session** (section B10), each on its own Git branch. Screenshot and compare against the Figma frame before committing.
- Always refer to Figma frames and layers **by name**. The exact frame names are listed in A5.

---

# PART A — What we've built so far

## A1. The product

**Hop** is a web dashboard for a small online fashion business, with an AI agent (also called Hop) built into every page.

Hop is an analyst. It watches sales, Instagram, stock and customer messages, keeps a day-by-day log, and answers questions from anyone on the team. Answers are short and come with the numbers, images and actions that matter.

The core idea of this version is **selecting a frame and asking about it**, like Figma's agent:
- Click any part of the page (a product row, a card, a table row) and it gets a blue selection outline.
- Its name appears as a tag in Hop's chat box.
- Ask about it ("Tell me more about this", "What am I seeing?").
- Hop scans that frame (a scanning animation), then answers in the chat on the right. You stay on the same page.

Every question is saved to **History** as a chain, so the team can revisit what was asked, what Hop saw, and what it said.

## A2. Who it's for

**Amara Obi** runs **Amara Atelier**, a fashion brand that markets on Instagram and sells only through its own website. There are about 150 products and 20–60 orders a day.

She has a team of 4:

| Person | Role | Avatar colour (token) |
|---|---|---|
| Amara | Owner, makes the decisions | `color/text/primary` #1A1A18 |
| Ife | Assistant, restocks and packing | `color/palette/tone-01` #7C5CFA |
| Dayo | Customer service, DMs | `color/palette/tone-02` #E0772E |
| Zee | Content creator, reels and posts | `color/palette/tone-03` #D6457A |

She also juggles family and another business, so she's often away and needs to catch up fast. She has two modes:
- **Check-in:** calm, 10–15 minutes.
- **Firefighting:** she wants the answer now.

**Motion must never slow her down.** Everything is short, responsive and skippable.

All names (Amara, Amara Atelier, the team, customers and Hop) are placeholders.

## A3. How Hop behaves (product rules)

1. Answers come first. Animation only explains what's happening; it never delays the answer.
2. Hop never moves or changes things while the user is typing, scrolling or clicking.
3. **Hop drafts, people approve.** Every action is a button a person presses.
4. Every message shows **who asked and when** ("Amara · 2:31 PM"). This is how team handoffs work.
5. Answer size follows the question: small questions get small answers.
6. Hop's face lives in the chat panel header. It is a placeholder for a Rive character (added later).

## A4. How the design got here (short history)

1. We picked a small-business store dashboard (over fintech) and defined the persona and team.
2. We explored "Live vs Normal" modes, where the agent moved across the page. **This is not in the current version.** It was replaced by the frame-selection model and a scan animation.
3. The frog mascot was dropped for an original bot-style character.
4. The chat panel is always on the **right**, separated from the page by a divider. There is no blur.
5. "Home" became **Analytics**, a summary page where any KPI or card can be selected and asked about.
6. "Hop briefs" became **History**: a chain of every question, each showing what the page looked like when it was asked.
7. The current, approved designs are in the **"fresh"** section.

## A5. Screen inventory (frames in "fresh")

| Frame name in Figma | What it shows |
|---|---|
| **Analytics** | Default Analytics (Revenue selected, today). The base screen. |
| **Analytics — Revenue selected** | Revenue KPI selected. Card: **Top revenue generators** + "Open Sales". |
| **Analytics — Orders selected** | Orders KPI. Card: **Orders placed today** + "Open Sales". |
| **Analytics — Instagram likes selected** | Likes KPI. Card: **Most liked posts today** + "Open Instagram". |
| **Analytics — New followers selected** | Followers KPI. Card: **Where new followers came from** (bars) + "Open Instagram". |
| **Analytics — Unanswered DMs selected** | DMs KPI; chart turns red. Card: **Waiting for a reply** + "Open Customers". |
| **Analytics — Wednesday selected** | A past day selected on the chart. Title "Wednesday, 23 Sep", that day's KPIs and products, Urgent items shown as done (Resolved / Completed / Attended). |
| **Analytics - Last week selected** | Last week toggle. All 7 days visible, title "Last week · 14–20 Sep", week totals, no comparison line, Urgent items done. |
| **Analytics — frame selected, before asking** | A product row selected (blue outline + corner handles). Tag in the composer, jump chips showing. |
| **Analytics — answered, highlight off** | Hop has answered, so the highlight is gone, there are no jump chips, and the composer is back to "Select any frame". |
| **Analytics — tag clicked, highlight back on** | The user clicked the tag in their earlier message. The tag turns solid blue, the highlight returns, and the jump chips return. |
| **Inventory — nothing selected, jump chips stay** | Arrived from Analytics through the jump chip. The conversation continues, a "Moved to Inventory" marker is shown, the jump chips stay (Go to Analytics active), and a fade mask sits above the chips. Rows have Edit buttons. |
| **History — asked on Analytics (shows that day's analytics)** | A brief asked on Analytics is selected. The left side shows the Analytics page as it was then, with a note bar. |
| **History — asked on another page (screenshot)** | A brief asked on Instagram. The left side is a screenshot of that page, with a note bar. |
| **History — tagged frame on a page (screenshot with tag)** | A brief where a frame was tagged. A screenshot with the tag outline visible. |
| **History — chat expanded** | After pressing Expand: the brief list on the right is replaced by the chat for that brief, with "← Back". The left side keeps the screenshot. |

**Pages without designs in "fresh": Sales, Instagram, Customers.** Build them as simple placeholders (see B7.7). Older reference frames exist elsewhere on Page 4 ("05 · Instagram…", "07 · Sales…", "04 · Customers…"), but they use the old styling. Don't build from them unless asked.

## A6. Layout reference (1440 × 900)

| Part | Spec |
|---|---|
| App background | `color/background/app` #F3F3F3, 8px padding around everything |
| Sidebar | 224px wide, far left, on the app background (no card) |
| Workspace | One white surface (`color/surface/default`), 12px radius, 1px border `color/surface/border-tint` |
| Page area | Fills the workspace left of the chat panel |
| Chat panel | 368px, right side of the workspace, 1px divider on its left |
| Top bars | 56px tall, bottom divider. The page top bar and the panel header line up. |
| Font | Geist everywhere (`typography/font-family/geist`) |

**Sidebar**, top to bottom:
- Store switcher ("AA" logo, Amara Atelier).
- Search (with a "/" hint).
- Nav: Analytics (custom Hop-head icon), History, Sales, Instagram, Inventory (badge 4), Customers (badge 3).
- "Recent with Hop" list with a history icon.
- Settings.
- User (Amara Obi, Owner).

**Analytics top bar:** page title on the left; "Thursday, 24 Sep - 2:30 PM" and a dark **Last sync: 14:00** button on the right.

**Chat panel header:** the Hop avatar + "Hop" on the left; the **New chat button** (chat-plus icon) on the right.

## A7. The data story (keep every number consistent)

"Now" is **Thursday 24 September, 2:30 PM**. The week runs Mon–Sun; Fri, Sat and Sun haven't happened yet.

**KPIs (today):**
- Revenue today $2,480 (+12%)
- Orders 34 (+6%)
- Instagram likes 18.2k (+31%)
- New followers 214 (+9%)
- Unanswered DMs 9, "3 over 2h" in red

**Chart series (this week Mon→Thu / last week Mon→Sun):**

| KPI | This week | Last week | Chart max | Colour |
|---|---|---|---|---|
| Revenue | 1920, 2380, 3120, 2480 | 2050, 2100, 2400, 2210, 2300, 2600, 2150 | 3500 | green `color/status/success` |
| Orders | 26, 30, 41, 34 | 27, 26, 31, 32, 30, 35, 28 | 50 | green |
| Instagram likes (k) | 9.8, 11.4, 21.6, 18.2 | 10.1, 9.5, 12.0, 13.9, 11.2, 12.6, 10.4 | 25 | green |
| New followers | 96, 120, 310, 214 | 88, 92, 110, 196, 140, 150, 105 | 350 | green |
| Unanswered DMs | 4, 6, 5, 9 | 3, 5, 4, 8, 6, 7, 5 | 12 | red `color/status/danger-text` |

**Card beside Urgent, per KPI (today):**

| KPI | Card title | Rows | Footer | Link |
|---|---|---|---|---|
| Revenue | Top revenue generators | Linen two-piece (Sand): 9 sold · 33% of today · $810 · "4 left"<br>Satin slip dress (Emerald): 6 sold · 22% · $540<br>Wrap kimono (Indigo): 4 sold · 15% · $360 | Everything else $770 | Open Sales |
| Orders | Orders placed today | Tolu Bakare: Satin slip dress × 1 · 2:02 PM · $90 · To pack<br>Ada Williams: Wrap kimono × 1 · 1:30 PM · $90 · To pack<br>Grace Mensah: Linen two-piece (Sand) × 2 · 12:48 PM · $180 · To pack | 34 orders today / 6 to pack | Open Sales |
| Instagram likes | Most liked posts today | Styling the Sand set 3 ways (Reel · Tue · by Zee): 9.4k<br>New in: the Emerald slip dress (Post · Mon): 4.1k<br>Fit check: Tolu in Sand (Reel · Fri): 2.7k | Across 5 posts today / 18.2k likes | Open Instagram |
| New followers | Where new followers came from | The Sand reel: 132 · 62%<br>Profile visits: 48 · 22%<br>Shares and tags: 34 · 16% (each with a bar) | 214 new followers today / +9% | Open Instagram |
| Unanswered DMs | Waiting for a reply | Chioma Eze: "Any update on my delivery?" · 8h<br>Tolu Bakare: "Slip dress in a size 12?" · 3h 34m<br>Grace Mensah: "Can I change my delivery address?" · 2h 19m | 6 more waiting / under 2 hours | Open Customers |

**Urgent (today):**
- 3 customers waiting 2h+ (Oldest: Chioma, 6:12 AM) → **Draft replies**
- Sand linen set (Sells out by Saturday) → **Reorder**
- 6 orders to pack (Ife is on packing today) → **Remind Ife**

**Wednesday, 23 Sep (selected day):**
- KPIs: Revenue $3,120 (+30%) · Orders 41 (+32%) · Likes 21.6k (+80%) · Followers 310 (+182%) · Unanswered DMs 0 "all answered".
- Card "Top revenue generators · Wed": Pleated midi skirt (Navy) 10 sold · 29% · $920; Cotton poplin shirt (White) 7 sold · 21% · $665; Beaded clutch (Gold) 5 sold · 15% · $575; Everything else $960.
- Urgent, done: 2 delivery addresses incomplete (Both updated by 10:30 AM) → **Resolved**; Emerald dress size 12 low (Restocked before noon) → **Completed**; 4 priority DMs (Dayo replied by 1:15 PM) → **Attended**.

**Last week, 14–20 Sep:**
- KPIs: Revenue $15,810 (+7%) · Orders 209 (+5%) · Likes 79.7k (+12%) · Followers 981 (+14%) · Unanswered DMs 0 "all answered".
- Card: Cotton robe (Mocha) 31 sold · 18% · $2,860; Silk scarf (Terracotta) 24 sold · 14% · $2,040; Canvas tote (Natural) 19 sold · 11% · $1,710; Everything else $8,800 (see B11).
- Urgent, done: Weekend return requests (All 7 requests closed) → **Resolved**; Mocha robe stock check (Supplier confirmed 60 units) → **Completed**; Post-sale customer follow-up (18 customers contacted) → **Attended**.

**Conversation used in the selection frames:**
- **Amara · 2:31 PM**, tag [Linen two-piece (Sand)]: "Tell me more about this"
- **Hop · 2:31 PM · read Inventory, Sales**: "The Sand two-piece is your best seller this week: 31 sold in 7 days, about 4 a day. Only 4 are left, so it sells out by Saturday." + a **Sizes left** block (8: 0, 10: 1, 12: 2, 14: 1, 16: 0; the zeros in red) + "25 more are on the restock order you approved at 2:20 PM, arriving next Wednesday."
- Marker: **Moved to Inventory · 2:32 PM**
- **Amara · 2:33 PM**, tag [Adire shirt dress]: "What am I seeing?"
- **Hop · 2:33 PM · read Inventory, Customers**: "This is the Adire shirt dress in Blue. It sold out on Monday after 9 sales in 7 days, and it isn't on the restock order you approved." + "14 people have asked about it in DMs since it sold out." + buttons **Add to restock** / **Notify me when back**

**Prompt cues (Analytics only):** How are we doing today? · Any flags? · What's trending on Instagram? · Who's still waiting on a reply? · What's running low?

**History chain (latest first, per day):**

| Day | Who · time | Page | Question | Tag |
|---|---|---|---|---|
| Today | Amara · 2:40 PM | Customers | What's going on here? | Chat thread · Chioma Eze |
| Today | Amara · 2:33 PM | Inventory | What am I seeing? | Adire shirt dress |
| Today | Amara · 2:14 PM | Chat / Analytics | How are we doing today? | — |
| Today | Zee · 1:40 PM | Instagram | Why is the Sand reel doing so well? | — |
| Today | Ife · 8:40 AM | Inventory | Draft a restock plan for the linen sets | — |
| Today | Hop · 8:00 AM | Chat / Analytics | Morning brief | — |
| Yesterday | Dayo · 5:10 PM | Customers | Reply drafts for late DMs | — |

Summaries are in the Figma frames. Copy them exactly.

## A8. Design tokens

The variables are in the repo. The key semantic ones:

| Use | Token | Value |
|---|---|---|
| App background | `color/background/app` | #F3F3F3 |
| Surface | `color/surface/default` | #FFFFFF |
| Soft fill (selected KPI, chips) | `color/surface/subtle` | #F5F4F1 |
| Canvas (history left side) | `color/surface/canvas` | #FAFAF8 |
| Border / divider | `color/surface/border-tint` / `color/surface/divider-tint` | #E8E6E1 / #EAE8E3 |
| Text | `color/text/primary` / `secondary` / `muted` | #1A1A18 / #6B6A66 / #9C9A94 |
| Primary button | `color/action/primary` | #1A1A18 |
| Positive | `color/status/success` / `success-soft` | #1F8A4C / #E7F5EC |
| Warning | `color/status/warning-text` / `warning-soft` | #B45309 / #FEF3C7 |
| Danger | `color/status/danger-text` / `danger-soft` | #C2410C / #FDECE4 |
| **Selection blue** | `color/status/info` | #2563EB |
| Tag chip bg / border / text | `color/palette/tone-20` / `tone-21` / `color/text/tone-04` | #EEF3FE / #C7D7FB / #1D4ED8 |
| Chart area fill | `color/palette/tone-05` | #EFF7F2 |
| Chart comparison line | `color/palette/tone-06` | #CFCFCF |
| Chart past/future day labels | `color/text/tone-02` | #8FC5A5 |
| History trail (dots) | `color/palette/tone-27` | #C9C6BF |
| Hop "live" dot | `color/status/live` | #2BB35A |

**Notes on the variables:**
- Many `color/palette/tone-XX` names aren't semantic. Keep the originals in `tokens.css`, but add readable aliases in code (e.g. `--selection: var(--color-status-info)`).
- Fractional values like `spacing/16-6`, `radius/8-3` and `typography/font-size/14-11` come from the scaled-down screenshots in History. **Don't use them for real components.** Round to the base scale (2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28; radii 6, 8, 10, 12, 14, 999).

---

# PART B — Build instructions

## B1. Stack

- **Next.js (App Router) + TypeScript**, deployed on Vercel. Vite + React is fine if you want it lighter; ask before choosing.
- **Tailwind CSS**, with the theme wired to the CSS variables generated from the variables file.
- **Motion** (`motion/react`, formerly Framer Motion) for all animation.
- **Zustand** (or a small React context) for app state.
- Charts: **custom SVG** + `d3-shape` (`curveMonotoneX`). Don't use a chart library; we need full control of the animation.
- Icons: match the Figma icons (Phosphor-style where the user added custom ones, e.g. ArrowsClockwise, ClockCounterClockwise). Export the custom Analytics (Hop head) icon as an SVG from Figma.
- Hop avatar: build a `<HopAvatar state="idle | thinking | scanning | done">` component using the Figma "Agent character" drawing. It will be swapped for a Rive file later (web runtime: `@rive-app/react-canvas`), so keep the state names.

Use the Figma MCP to read frames by name from the **"fresh"** section when you need exact spacing, text or colours.

## B2. Suggested structure

```
app/            (analytics, history, inventory, sales, instagram, customers routes)
components/
  shell/        Sidebar, Workspace, TopBar
  hop/          HopPanel, Message, TagChip, Composer, PromptCues, JumpChips, HopAvatar, TypingDots
  select/       HopFrame (selection wrapper), SelectionOutline, ScanOverlay
  analytics/    KpiTabs, TrendChart, KpiCard (5 variants), UrgentCard, WeekToggle
  inventory/    StockSummary, StockTable
  history/      BriefChain, BriefItem, Trail, SnapshotView, NoteBar, ExpandedChat
data/           today.ts, wednesday.ts, lastWeek.ts, conversation.ts, history.ts
lib/            motion.ts (motion tokens), format.ts
styles/         tokens.css (from the variables), globals.css
```

## B3. App state

```ts
type Page = 'analytics' | 'history' | 'sales' | 'instagram' | 'inventory' | 'customers';
type Kpi = 'revenue' | 'orders' | 'likes' | 'followers' | 'dms';

interface HopFrameRef { id: string; label: string; page: Page; jumpTarget?: Page }

interface AppState {
  page: Page;
  analytics: { kpi: Kpi; range: 'thisWeek' | 'lastWeek'; day: number | null }; // null = today
  selection: HopFrameRef | null;        // what the composer is tagging
  scanning: boolean;                    // scan animation running on the selection
  jumpOrigin: Page | null;              // set when the user navigates with a jump chip
  messages: Message[];                  // author, time, text, tag?, blocks[], marker?
  hopStatus: 'idle' | 'thinking' | 'streaming';
  history: { selectedId: string; expanded: boolean; person: string | 'all'; pageFilter: Page | 'all'; query: string };
}
```

Rules:
- `selection` and the visible highlight are the same thing. If something is selected, it is highlighted.
- `jumpOrigin` is set only when the user clicks a jump chip. It is cleared when they click **Go to Analytics**, or navigate using the sidebar.
- Jump chips show when `(page === 'analytics' && selection?.jumpTarget)` **or** `jumpOrigin !== null`.

## B4. Motion tokens (`lib/motion.ts`)

Keep all UI motion fast and calm, with no bouncy springs on UI chrome.

| Token | Value | Use |
|---|---|---|
| `fast` | 120ms | Hover, press, small fades |
| `base` | 200ms | Most enters/exits, chip swaps |
| `slow` | 320ms | Page transitions, panel swaps |
| `data` | 450ms | Chart and number changes |
| `easeOut` | `cubic-bezier(0.22, 1, 0.36, 1)` | Everything that enters |
| `easeIn` | `cubic-bezier(0.4, 0, 1, 1)` | Everything that leaves |
| `layoutSpring` | `{ type: 'spring', stiffness: 500, damping: 40 }` | Sliding pills and indicators (layoutId) |
| `press` | scale 0.97 over 100ms | Buttons and chips |

Rule of thumb: **exits are shorter than enters** (roughly 60–70% of the enter time).

## B5. Reduced motion and accessibility (required)

- Respect `prefers-reduced-motion`. When on:
  - No number count-ups or line drawing.
  - Data swaps instantly.
  - The scan sweep becomes a static outline plus the text "Hop is reading…".
  - Page slides become 100ms fades.
- KPI tabs use `role="tablist"`; the left/right arrow keys move between them.
- Chart days are focusable buttons; left/right arrows move between them and Enter selects.
- **Esc** clears the selection, closes the tooltip, and exits expanded History.
- Hop answers are announced through an `aria-live="polite"` region.
- Inactive jump chips use `aria-disabled` and aren't focusable.
- Visible focus rings everywhere (2px, `color/status/info`, 2px offset).
- All numbers use `font-variant-numeric: tabular-nums` so count-ups don't wobble.

## B6. The selection system (Figma-agent style) — the heart of the prototype

Wrap every selectable part of a page in `<HopFrame id label page jumpTarget>`.

**What's selectable:**
- Each KPI tab.
- The chart card.
- The card beside Urgent, and each of its rows.
- Each Urgent row.
- Inventory summary tiles and each stock table row.

**Jump targets:**

| Selected thing | Jump chip label |
|---|---|
| Product rows | Go to Inventory |
| Revenue / Orders KPIs | Go to Sales |
| Likes / Followers KPIs, post rows | Go to Instagram |
| DMs KPI, customer rows, "3 customers waiting" | Go to Customers |
| Chart card | Go to Sales |

**Click rules:**
- A plain click on a non-interactive surface selects the **deepest** selectable under the cursor.
- Buttons, links and tabs keep their normal action.
- To tag an interactive element (e.g. a KPI tab), use **Alt/Option + click**. This is a proposal; confirm with the user.

**Hover (nothing selected):** a 1px outline in selection blue at 35% opacity, with a 2px radius offset. It fades in over `fast`. The cursor stays default. There's no label on the canvas; the name shows only in the composer.

**Select:**
1. The outline goes to 1.5px, full `color/status/info`, and grows from 98% to 100% scale while fading in (`base`, easeOut).
2. The 4 corner handles (7×7 white squares with a blue border) scale from 0 to 1, staggered 20ms (`fast`).
3. The tag chip pops into the composer: scale 0.92→1 + fade (`base`). It shows the frame icon, the name and an ×.
4. The composer placeholder crossfades to "Ask about this frame…".
5. On Analytics, the prompt cues swap to the jump chips: the cues fade out and move up 4px (`fast`, easeIn), then the chips fade in and move up from 6px below (`base`, easeOut).
   - Active chip: dark fill + arrow.
   - Inactive chip: `color/palette/tone-19` fill, `color/text/tone-03` text.

**Deselect** (click empty space, the × on the tag, or Esc): run the same steps in reverse, using exit timings. On Analytics the prompt cues come back. On a page reached through a jump chip, the jump chips **stay** (see the Inventory frame).

**Send a tagged message → scan:**
1. The user's message bubble slides up from the composer (y 8→0, fade, `base`). The tag chip sits above the bubble text, as in the frames.
2. The composer's tag chip leaves (scale 0.92, fade, `fast`).
3. A **scan** starts on the selected frame:
   - A soft band (a transparent → blue at 12% → transparent gradient, about 40% of the frame's width) sweeps left to right across the frame, clipped to its radius. Each sweep takes 1100ms ease-in-out, and it loops.
   - The outline pulses a glow (a 3px blue ring at 18% opacity, 1.2s loop).
   - The Hop avatar goes to `scanning` (the antenna light pulses).
4. The scan runs for **at least 900ms**, even if the answer is ready sooner, so the moment reads.
5. When the answer arrives:
   - The scan band fades (`fast`).
   - The outline and handles fade out, with the handles shrinking to 60% (`base`).
   - `selection` clears.
   - On Analytics the jump chips leave and the prompt cues return.

**Re-highlight from a past message:** tags in earlier messages are buttons. Clicking one:
- The tag goes solid blue with white text and a 3px blue glow ring (`fast`). This is the "active" style from the "tag clicked" frame.
- If the tagged frame is on another page, navigate there first (B8 page transition), then highlight it.
- Scroll the frame into view smoothly, then replay the **Select** animation.
- The composer tag and the jump chips come back.
- Clicking the frame itself on the page also re-selects it.

## B7. Screen-by-screen behaviour

### B7.1 Analytics

**First load only** — one orchestrated entrance, nothing else plays on its own:
1. The greeting fades in.
2. The KPI numbers count up from 0 (`data`).
3. The chart line draws in (pathLength 0→1, 600ms, easeOut).
4. The dots pop in one by one (60ms stagger).
5. The cards fade up 6px (`base`, 40ms stagger).

**Selecting a KPI tab:**
- The soft selected pill **slides** to the new tab (shared `layoutId`, `layoutSpring`).
- Chart title crossfades to "[KPI] over the last 7 days" (fade + 4px rise, `base`).
- Chart line and area **morph**:
  - Animate the array of y-values *and* the y-max together (`data`, easeOut), then rebuild the path every frame.
  - This is smoother than morphing path strings, because every KPI has the same number of points.
  - The dots follow the line.
  - For DMs, the line, dots and area tint tween from green to red (`base`).
- The card beside Urgent swaps content:
  - The title and link text crossfade.
  - Old rows exit (fade + y −4, `fast`, 20ms stagger).
  - New rows enter (fade + y 6→0, `base`, 40ms stagger).
- **Equal heights:** put both cards in a CSS grid with `align-items: stretch`. The grid row gets Motion `layout`, so when either card grows (e.g. Urgent gets 5 items) both heights animate together (`base`).
- Footers stay pinned to the bottom of their card.

**Chart hover:**
- The cursor snaps to the nearest past day or today.
- A thin vertical guide fades in (`fast`).
- The dot grows from r4 to r5.5.
- A dark tooltip follows (value + change vs the same day last week), updating over 80ms.
- Future days (Fri, Sat, Sun) aren't hoverable and stay in `color/text/tone-02`.

**Selecting a day** (click a dot or an axis label):
- The dot fills solid.
- A dashed guide draws down from the dot (scaleY 0→1 from the top, 160ms).
- The chosen day label turns dark green.
- The title crossfades to "Wednesday, 23 Sep".
- The KPI values count to that day's numbers (`data`), and the labels drop the word "today".
- The card swaps to that day's products.
- **Urgent** swaps to that day's items. Their buttons become quiet status pills (Resolved / Completed / Attended), crossfading from the buttons.
- Click **Today** or press Esc to go back.

**This week / Last week toggle:**
- The white thumb slides (`layoutId`, `layoutSpring`), and the legend dots swap colour.
- The partial line fades out (`fast`), and the full-week line draws in (pathLength, 450ms).
- The grey comparison line fades out; the last-week design has none.
- The Fri, Sat and Sun labels go from muted to normal.
- The title becomes "Last week · 14–20 Sep".
- The KPIs count to the week totals, and the card and Urgent swap to the last-week content.
- Toggling back reverses all of this.

**Urgent actions** (not designed in detail; keep them simple):
- Press feedback on the buttons.
- "Draft replies" and "Reorder" send a Hop message, *tagged with that Urgent row* ("Draft replies for the 3 customers" / "Reorder the Sand linen set"), which runs the normal scan → answer flow.
- "Remind Ife" shows a small toast: "Reminder sent to Ife".

**Last sync button:**
- On click, the icon spins 360° (700ms, ease-in-out).
- The label shows "Syncing…", then "Last sync: 14:30".
- The "Hop last checked everything at…" line updates with a crossfade.

**Card links** ("Open Sales" and so on): navigate to that page (B8), without jump chips.

### B7.2 Hop panel (on every page)

**Prompt cues** (Analytics only, when nothing is selected):
- Hover: slight fill.
- Click sends the cue as a message; the cues fade out while the answer comes in.

**Sending and answering:**
1. The user's bubble enters (B6).
2. The Hop label appears with typing dots (three dots, 1.2s staggered opacity loop), and the avatar goes to `thinking`.
3. The answer **streams** word by word, fast (about 20ms per word). It's a prototype, so the answers are scripted from `data/conversation.ts`.
4. Rich blocks (like **Sizes left**) fade up after the text finishes (`base`).
5. Action buttons come last (40ms stagger).

**Page markers:** when the user changes page with a message thread open, insert a centred marker ("Moved to Inventory · 2:32 PM") with a fade (`base`).

**Fade mask:** the conversation fades out above the jump chips or cues, using a CSS `mask-image` linear gradient over the bottom 48px. This is from the Inventory frame.

**New chat button:**
- Messages lift and fade out (y −8, 20ms stagger, `fast`).
- The panel empties, and the prompt cues fade in (on Analytics).
- The finished conversation is saved to History as a new brief at the top of "Today".

**Composer:**
- Grows with the text, up to 4 lines.
- **Enter** sends; **Shift+Enter** adds a new line.
- The send button is active when there's text or a tag.
- The idle chip reads "Select any frame". It's a hint, not a button.

**Panel header:** use the Analytics version everywhere (Hop avatar + "Hop" + New chat button). See B11.

### B7.3 Jump chips and moving between pages

- On Analytics with something selected, the chips are **[Go to Inventory →] active** and **[Go to Analytics] inactive** (label per the jump target, B6).
- **Clicking the active chip:**
  1. The page transition runs (B8).
  2. `jumpOrigin = 'analytics'`.
  3. The conversation continues, and a "Moved to …" marker is added.
  4. The chips **flip**: the fills crossfade over `base`, so the destination becomes inactive and **Go to Analytics** becomes active.
- **On the destination page**, the chips stay even when nothing is selected. That's the point: they get her back to where she started.
- **Clicking Go to Analytics** returns her, clears `jumpOrigin`, and hides the chips (unless something is selected on Analytics).
- **Sidebar navigation** clears `jumpOrigin`, so there are no chips.

### B7.4 Inventory

- **Summary tiles:** Products 146 / Low stock 3 / Sold out 1 / Stock value $38.2k, plus a "3 need attention" pill.
- **Stock table:** Product (image, name, variant), In stock (number + bar), Sold (7 days), Status pill, **Edit** button.
- **Stock bars:** animate their width from 0 on first page load only (`data`, 30ms stagger).
- **Rows** are selectable (B6). Hovering a row gives a faint fill plus the hover outline.
- **Edit** isn't designed yet. Stub it with a toast ("Product page coming soon") or an empty product page with a Back link.
- **"Add product"** and **"All products"**: stubs.

### B7.5 History

**Layout:** the brief chain is on the right (about 360px). The left side shows what the selected brief looked like.

**The chain:**
- Newest first, grouped by day ("Today", "Yesterday").
- Each item shows: the avatar (the Hop face for Hop's own briefs), "Name · time", a page pill, the question in bold, a blue tag chip if a frame was tagged, and a summary clamped to 2 lines.
- **The dotted trail must stay.** It's a vertical dashed line (1.5px, dash 3/3, `color/palette/tone-27`) running from avatar to avatar within each day.
- Build it from two segments per item (above and below the avatar). Hide the top segment on the first item of a day and the bottom segment on the last, so the chain stays continuous after filtering.

**Selecting a brief:**
- The soft background and the dark left bar **slide** to it (`layoutId`, `layoutSpring`).
- The **Expand** pill pops in (scale 0.9→1 + fade, `base`).
- The left side swaps (fade + y 6→0, `slow`), depending on what kind of brief it is:

| Brief type | Left side | Note bar |
|---|---|---|
| Asked on Analytics | The Analytics view as it was then, read-only, using that moment's data | Clock icon + "Analytics as it was at 2:14 PM, Thu 24 Sep — when Amara asked" |
| Asked on another page | A **screenshot** of that page in a card (12px radius, soft shadow). It enters with scale 0.98→1 + fade. | Camera icon + "Screenshot of Instagram — taken at 1:40 PM, Thu 24 Sep, when Zee asked" |
| Tagged frame on a page | The screenshot **with the tag outline** visible | "Screenshot of Inventory — taken at 2:33 PM when Amara tagged "Adire shirt dress"" |

**How to make the screenshots:**
- Where the page exists in code (Inventory), render the real page component read-only: wrap it in `inert` and use a CSS `transform: scale()` to fit. It stays crisp and needs no images.
- Where the page doesn't exist yet (Instagram), export the screenshot card from the Figma frame as a 2× PNG.

**Filters:**
- The person chips (Everyone / Amara / Ife / Dayo / Zee), the "All pages" menu and the search box filter the list.
- Removed items collapse their height (`base`); the rest move up (`layout`). The trail stays continuous.

**Expand** (see "History — chat expanded"):
- The chain slides out to the right (x 0→16 + fade, `fast`), and the chat for that brief slides in (x 16→0, `slow`).
- The header shows **← Back**.
- Load the **whole thread**, scroll to the expanded message, and flash its tag once in the active blue (400ms).
- The left side keeps the snapshot.
- **Back** (or Esc) reverses this, and the same brief stays selected.

**Recent with Hop** (sidebar): clicking an item opens History with that brief selected.

### B7.6 Page transitions

- Only the **page area** changes. The sidebar and the Hop panel stay put.
- The outgoing page fades and moves x 0→−8 (`fast`, easeIn); the incoming page fades and moves x 8→0 (`base`, easeOut). Use `AnimatePresence mode="wait"`.
- The top bar title crossfades.
- The sidebar's active pill **slides** to the new item (`layoutId`, `layoutSpring`), and the nav icon colour tweens.
- Badges (4, 3) do a small scale pulse (1→1.15→1, 240ms) if their count changes.

### B7.7 Sales, Instagram, Customers (not designed yet)

Build each as a placeholder with a real top bar (icon + title), an empty state reading "This page is being designed", and the Hop panel. Navigation, jump chips and History links to these pages must still work.

## B8. Micro-animation checklist (quick reference)

| Trigger | What happens | Timing |
|---|---|---|
| Hover a button or chip | Background darkens slightly | fast |
| Press a button or chip | Scale 0.97 | 100ms |
| Hover a selectable | Faint blue outline | fast |
| Select a frame | Outline + handles in; tag chip pops into composer; cues → jump chips | base |
| Send a tagged message | Bubble rises; tag leaves composer; scan sweep + glow; avatar scanning | base; 1100ms loop, min 900ms |
| Answer arrives | Scan stops; typing dots → streamed text → blocks → buttons | ~20ms/word; base |
| Answer done | Highlight + handles fade; chips → cues (Analytics) | base |
| Click a tag in an old message | Tag active blue; (navigate); scroll; re-select | fast + base |
| Change KPI | Pill slides; title crossfade; line morph; numbers count; card rows swap; heights animate | layoutSpring; data; base |
| Hover the chart | Snap guide; dot grows; tooltip | fast |
| Select a day | Dot fills; dashed guide draws; title, KPIs, cards and Urgent swap | 160ms; data |
| Switch week | Thumb slides; line redraws; future labels unmute; comparison line fades | layoutSpring; data |
| Jump chip | Page transition; marker in chat; chips flip | slow; base |
| Sidebar nav | Page transition; active pill slides | slow; layoutSpring |
| New chat | Messages lift out; cues return; brief added to History | fast; base |
| Last sync | Icon spins; label updates | 700ms |
| History select | Background + bar slide; Expand pops; left side swaps | layoutSpring; slow |
| History expand / back | List ↔ chat slide; scroll to message; tag flash | slow; 400ms |
| Filter history | Items collapse/expand; trail stays continuous | base |

**Don't add:** looping idle animations on the page, fade-up on every section when scrolling, hover lifts on every card, or bouncy springs on buttons. Animation should only answer something the user did, plus the single first-load moment on Analytics.

## B9. Data files

Put every number from A7 into `data/*.ts` as typed objects. **Don't hard-code numbers in components.** Format with `Intl.NumberFormat` ($2,480; 18.2k). Scripted Hop answers live in `data/conversation.ts`, keyed by the tagged frame's id or the prompt cue text. Unknown questions get a polite fallback ("I can answer that once this page is connected.").

## B10. Build phases (one per session, one branch each)

| # | Phase | Done when |
|---|---|---|
| 0 | Setup: project, Tailwind wired to the variables, Motion, `lib/motion.ts`, data files, CLAUDE.md | Tokens render correctly on a test page |
| 1 | Shell: sidebar, workspace, top bar, empty Hop panel, routing for all 6 pages | Matches the **Analytics** frame's shell at 1440×900 |
| 2 | Analytics (static): KPI tabs, chart, all 5 card variants, Urgent | Each KPI state matches its frame |
| 3 | Analytics (interactive): KPI switching, chart morph and hover, day select, week toggle, equal-height cards, first-load entrance, Last sync | Matches **Wednesday selected** and **Last week selected**; reduced motion works |
| 4 | Hop panel: cues, send, typing, streaming answers, blocks, New chat, fade mask | Scripted conversation plays like the frames |
| 5 | Selection system: HopFrame, hover, select, tag chip, scan, clear on answer, re-highlight from tags | Matches the three "Analytics — frame selected / answered / tag clicked" frames |
| 6 | Inventory + jump chips + page transitions + markers | Matches **Inventory — nothing selected, jump chips stay**; sidebar navigation clears the chips |
| 7 | History: chain + trail, selection, three left-side types, filters, Expand/Back | Matches the four **History** frames |
| 8 | Polish + QA: keyboard, focus, reduced motion, placeholders, compare every frame | Side-by-side screenshots match; no raw hex values outside `tokens.css` |

Later (not now): replace `HopAvatar` with the Rive character, the mobile chat-only view, designed Sales/Instagram/Customers pages, and a Framer export if needed.

## B11. Known design mismatches (resolve in code, as noted)

| # | Where | Issue | Do this |
|---|---|---|---|
| 1 | Last week card | "Everything else $8,800" doesn't add up ($15,810 − $6,610 = $9,200) | Use **$9,200** unless told otherwise |
| 2 | The three "frame selected / answered / tag clicked" frames | Their Analytics content is older (chart title "Analytics over the last 7 days"; product rows show price in the subtitle, with no share % or right-aligned amounts) | Use the **Analytics — Revenue selected** content; the selection frames only define selection behaviour |
| 3 | Inventory frame, panel header | Shows "Hop · Synced 2:00 PM" and no New chat button | Use the Analytics panel header on every page |
| 4 | History — chat expanded | The chat shows the 2:31 Sand exchange, but the screenshot is the 2:33 Adire moment | Load the full thread, scroll to the 2:33 message, and flash its tag |
| 5 | Analytics layer name "KPI/Instagram reach" | The label says "Instagram likes" | Call it **likes** everywhere in code |
| 6 | "Select any frame" chip | Looks like a button | Treat it as a hint only |

## B12. Out of scope for this build

The old Live/Normal mode toggle and the agent moving across the page, mobile, real data or APIs, real AI responses (all answers are scripted), and product editing.
