# Design Direction: Opportunity Inbox

> Quiet productivity, local-first craftsmanship, and deliberate focus for job seekers.

---

## 1. Identity & Character

Opportunity Inbox is built for freelancers who value clarity, privacy, and speed over subscription clutter and bloated trackers. The aesthetic is **Obsidian Minimal** — a calm, dark workspace designed to reduce cognitive load during the intense pitch-and-follow-up process.

- **Tone**: Focused, competent, quiet, respectful of user attention.
- **Audience**: Freelancers, independent professionals, and modern knowledge workers managing active multi-stage opportunity pipelines.
- **Philosophy**: Local-first, zero-build, zero-tracking, instant load.

---

## 2. Palette & Contrast (WCAG AA Compliant)

The palette uses a controlled 3-layer dark foundation accented by a warm, deliberate orange highlight for interactive focus:

- **App Canvas**: `#08090C` (Deep Obsidian)
- **Sidebar & Muted Surfaces**: `#0C0D12` / `#0B0D13`
- **Card & Workspace Surface**: `#151822` (Midnight Slate)
- **Primary Accent**: `#F97316` (Warm Tangerine, contrast 6.32:1 on cards)
- **Accent Glow**: `#FB923C` (Tangerine Bright)
- **Text Tokens**:
  - `text-main`: `#F3F4F6` (contrast 16.09:1 on cards, AAA)
  - `text-muted`: `#8E96A5` (contrast 5.95:1 on cards, AA)
  - `text-light`: `#94A3B8` (contrast 6.91:1 on cards, AA)

No rainbow gradients, no colored full-page glow meshes, and no technique without a clear functional reason.

---

## 3. Typography & Spacing

- **Font Family**: Native system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
  - *Reason*: Eliminates external font file requests, prevents layout shifts (CLS), and loads instantly offline.
- **Hierarchy**:
  - Page Titles: `1.4rem`, font-weight `800`
  - Section Headers: `1.05rem - 1.15rem`, font-weight `700`
  - Body & Labels: `0.85rem - 0.94rem`, font-weight `500 - 600`, line-height `1.5 - 1.7`
- **Border Radius Hierarchy**:
  - Small elements (tags, badges, inline controls): `var(--radius-sm)` (4px)
  - Interactive cards & inputs: `var(--radius-md)` (8px)
  - Modal dialogs & primary panels: `var(--radius-lg)` (12px)
  - (No arbitrary pill-shaped 999px elements without semantic justification).

---

## 4. The Three Dials

| Dial | Level | Selection | Rationale |
|---|---|---|---|
| **ENERGY** | **1 (Calm)** | Quiet & Non-intrusive | Job hunting requires calm concentration; the interface steps back and lets data and actions take center stage. |
| **RHYTHM** | **2 (Balanced)** | Consistent with Focused Workspaces | Kanban columns and tables maintain predictable consistency, while tool views (Resume Builder, Cover Letter) expand into split-screen authoring layouts. |
| **MOTION** | **1 (Calm)** | Fast Tactile Feedback | 150ms transitions on hover and active states; zero scroll-reveal fades, floating cards, or artificial delays. |

---

## 5. Craftsmanship & Accessibility Commitments

- **Keyboard First**: Every button, input, dialog, and dropdown is reachable via Tab and activatable via Enter/Space. Visible 2px outline rings on all focused elements.
- **Mobile First**: All touch targets meet or exceed the 44px minimum hit area standard.
- **Honest Content**: Zero fictional testimonials, fake numbers, or AI buzzwords. Real pipeline data only.

