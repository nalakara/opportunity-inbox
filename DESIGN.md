# DESIGN.md — Opportunity Inbox

Design direction for this app. Read this before changing any visual.

## Identity

- **Name:** Opportunity Inbox
- **Visual direction:** Cabinet Editorial (light warm paper). Introduced in **v2.4.0**, superseding the earlier "Obsidian Dark" direction. The reference is The Cabinet: an editorial index, not a dashboard toy.
- **Audience:** one working freelancer tracking gigs and pitches — Yudhan. Everything must be legible at a glance on a laptop and on his phone.

## Purpose (unchanged by the reskin)

A quiet pipeline board for freelance opportunities: Lead / Pitched / Diskusi / Deal / Gagal / Tanpa kabar / Follow Up, plus a directory of freelance portals. No noise, no gamification, no AI-looking gloss.

## Visual Direction

- **Warm paper, not dark.** Background is warm paper `#fcfcfa`; cards are white `#ffffff`. The app must never look like a dark-mode demo again.
- **Sharp corners.** Radius is 2px for small elements (chips, badges, inputs) and 4px for cards, dialogs, and columns. No pill buttons (999px), no large rounded cards. The only circles are small functional ones (avatar, gauge ring, 28px icon buttons).
- **Hairlines, not shadows.** 1px borders in `#e3ded2` do the separation. Shadows are flat and barely-there (`0 1px 2px rgba(22, 19, 14, 0.06)`). No glow, no lift on hover, no gradient anywhere.
- **One accent.** A single red `#c8341f` for the active state, primary buttons, kickers, and the Deal stage. Nothing else competes with it.
- **Muted board colours.** Stage colours are desaturated and confined to small coding marks: an 8px dot next to the stage name, the 3px top bar of a KPI card, a 4px left border on an insight card. Never a full-colour column header, never a saturated card fill.
- **Editorial header.** Every page opens with a mono uppercase kicker ("OPPORTUNITY INBOX", red) above a large extrabold title, with a 2px ink rule under the topbar.

## Typography

- **Archivo** (500 / 700 / 800) for headings and UI. Self-hosted woff2 in `assets/fonts/`, loaded via `@font-face` in `styles.css`. No Google Fonts link anywhere — the app is offline-first and must render the same offline.
- **IBM Plex Mono** (400 / 500 / 600) for labels: kickers, section titles, stage names, KPI labels, table headers, badges, pills, counts. Uppercase with wide letter-spacing.
- Body text is Archivo. The resume sheet preview keeps its own document typography (system sans, paper-white) — it is a document, not app chrome.

## Color Palette

| Token | Value | Use |
|---|---|---|
| `--bg-app` | `#fcfcfa` | Warm paper background |
| `--surface` / `--surface-card` | `#ffffff` | Cards, panels, headers |
| `--surface-muted` / `--surface-hover` | `#f3efe6` | Input backgrounds, muted panels, hover |
| `--text-main` | `#16130e` | Ink. 18.0:1 on paper |
| `--text-muted` | `#57534a` | Secondary text. 7.5:1 on paper |
| `--text-light` | `#6f6a5e` | Smallest meta text. 5.2:1 on paper |
| `--border` | `#e3ded2` | 1px hairlines |
| `--border-strong` | `#b8b0a0` | Hover border |
| `--accent` | `#c8341f` | The one red. 5.2:1 on paper, 5.3:1 white-on-red |
| `--accent-dark` | `#a92c1a` | Primary-button hover |
| `--accent-soft` | `rgba(200, 52, 31, 0.08)` | Active nav tint, drag-over wash |

Stage colours (coding only — dots, bars, borders; never text):

| Stage | Value |
|---|---|
| Lead | `#5f7a8c` (muted slate blue) |
| Pitched | `#7a6b9e` (dusty violet) |
| Diskusi | `#5e7f6a` (sage green) |
| Deal | `#c8341f` (the accent red — the win) |
| Gagal | `#8c7b70` (warm taupe) |
| Tanpa kabar | `#8a8f98` (cool grey) |
| Follow Up | `#a67c2e` (muted ochre) |

Semantic colours for badges and scanner feedback (text-safe on paper): ok `#1e7a55`, warn `#8a5e00`, bad `#a83a32`, info `#2f5da8`.

## Dark mode (v2.5.0)

- **Automatic, per system.** A `@media (prefers-color-scheme: dark)` block at the end of `styles.css` re-aims the same tokens; there is no toggle and no JavaScript involved. Light stays the default.
- **Tokens are The Cabinet's dark ones:** background `#14120e`, surfaces `#1e1b16`, accent `#e0583f`. Text is warm paper `#f3efe6` (15.0:1), muted `#b0a894` (7.3:1), light `#8f887a` (4.9:1) — all AA on the dark surface.
- **One trap, handled:** white text on the bright dark accent `#e0583f` is only 3.73:1, so the primary button and the avatar use dark ink `#14120e` on it instead (5.02:1). The accent as *text* on dark passes (4.61:1).
- **Stage colours get lighter muted variants** in dark mode (e.g. Lead `#7ba3b8`, Diskusi `#7ba889`, Follow Up `#c9a24e`) so the dots still read on dark; Deal takes the dark accent.
- **Semantic colours switch to their light variants** in dark mode: ok `#34d399`, warn `#fbbf24`, bad `#f87171`, info `#60a5fa`.
- **Hardcoded exceptions** live inside the dark block (dialog shadow/backdrop, sidebar backdrop, mobile nav background, dragging shadow). The resume sheet stays a white document in both modes — it is a document, not app chrome.
- **Theme-color follows too:** `index.html` carries a light and a dark `theme-color` meta tag with matching `media` attributes.

## Layout

- Left sidebar (260px) with the red brand mark, numbered-style nav, and the user chip at the bottom. On mobile it becomes a fixed drawer plus a bottom nav.
- Content area: kicker + title + toolbar, then the board or the page content. Stage cards sit in a wrapping grid (auto-fill, min 320px — 4 across / 2 rows on a wide screen, 1 column on a phone), each with a paper header (stage dot + name + count chip); the list view uses the same header as an accordion bar.
- The board is the one place colour is allowed to show up at all, and only as dots.

## Accessibility

- R-25 WCAG AA: every text colour is verified at 4.5:1 or better on its background (see the table above). The accent `#c8341f` passes as text (5.2:1); the brighter red `#e0583f` does **not** (3.6:1) and must never be used for text.
- R-32 visible focus: interactive elements keep a visible focus ring (red outline on the cover-letter textarea, red border on the search input).
- R-03 44px touch targets on small screens (unchanged).
- R-02 no em dashes anywhere in the UI copy (unchanged).
- R-04 no decorative AI emojis (unchanged).

## Dials

- **ENERGY 1** — Calm. The app should feel like a paper index, not a slot machine.
- **RHYTHM 2** — Balanced. A steady grid of cards, no oversized hero, no dense spreadsheet.
- **MOTION 1** — Calm. Transitions are short fades and border changes only. No bounce, no lift, no glow.

## What NOT to change

- The seven stage names and their meanings, the funnel definition, the weekly pitch target, and the Portals directory — the reskin is visual only.
- The tool suite (resume builder, proposal drafter, LinkedIn suite) keeps its own document styling where it renders documents (resume sheet, print sheets).
- Do not reintroduce gradients, glows, pill radii, or an external font dependency. Do not copy The Cabinet's 390px title-clipping flaw: the page title must fit at 390px.
