# Opportunity Inbox

A clean, quiet productivity, local-first Progressive Web App (PWA) designed for tracking freelance pipelines, opportunities, and deal stages.

🌐 **Live Demo**: [opportunity-inbox.vercel.app](https://opportunity-inbox.vercel.app)

---

## 🎯 Core Product Intent

Finding gigs and managing opportunities often leads to fragmented spreadsheets, noisy subscription-based trackers, or forgotten pitches. 

**Opportunity Inbox** answers at a single glance:
> **"What opportunities am I pursuing, what stage is each pitch in, and am I hitting my weekly momentum?"**

Built 100% offline-ready, zero-build, and local-first with zero tracking, external databases, or subscriptions.

---

## Features

### 📋 Dual-View Pipeline Tracking
- **Interactive Board Grid**: Seven stage cards in a wrapping grid (4 across on wide screens) with native **Drag & Drop** support:
  - 💡 **Lead**: Prospects & potential clients discovered.
  - 📩 **Pitched**: Pitches & proposals sent.
  - 🗣️ **Diskusi**: Active discussions, calls & negotiations.
  - 🎉 **Deal**: Deals agreed, terms under negotiation.
  - 🛑 **Gagal**: Closed lost, no deal.
  - 👻 **Tanpa kabar**: Gone quiet, no response.
  - ⏰ **Follow Up**: Opportunities requiring an active nudge or check-in (with smart **Overdue / Due Today** badges).
- **Accordion List View**: Compact, expandable table view for quick audits and bulk review.
- **Real-time Live Search & Sorting**: Instant filtering across company names, roles, tags/locations, and notes; sort by recent updates, name (A–Z), or category.
- **🌐 Freelance Portals**: A directory of freelance gig portals (Mercor, iMerit Scholars, OneForma, Micro1, Upwork, ...) with registration status and remarks. Seeded with a researched list on first run; add, edit, or remove portals by hand.

### 📊 Habit & Analytics Dashboards
- **Home Dashboard**:
  - **Weekly Goal Progress Gauge**: Dynamic SVG circular gauge meter tracking your target pitches per week (customizable via Settings).
  - **Pipeline Breakdown**: Visual distribution bars showing current pipeline health.
- **Statistics & Conversion Funnel**:
  - Key Performance Indicators (KPIs): Total Opportunities, Added This Week (real calendar-week filter), Added This Month, and Diskusi Conversion Rate.
  - Funnel metrics: *Pitched → Diskusi*, *Diskusi → Deal*, and *Overall Win Rate*.
  - Actionable guidance when pitch momentum slows down.
- **⚙️ Dynamic User Preferences**: Customize your display name and weekly pitch target directly in local storage without any accounts.

### Freelance Tool Suite
- **📄 Resume Builder**: Create a clean, single-column resume. Features **Upload / Import** for existing CVs (.pdf, .txt, .md, .json) with intelligent local field-matching, live preview sheet, Markdown copy/export, and clean `@media print` PDF generation.
- **✉️ Proposal Drafter**: Draft short, tailored freelance proposals in 4 tones (*Problem-first, Proof-led, Question-led, Warm Outreach*). Supports auto-linking with saved opportunities, live Markdown editing, word count metrics, `.md` download, and clean print-to-PDF formatting.
- **💼 LinkedIn Optimization Suite**: Craft high-conversion recruiter outreach InMails, referral requests, keyword-rich headlines, and Unicode post styling (bold, italic, mono).
- **Quick Capture Shortcut**: Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) anywhere to open the capture dialog.
- **URL Auto-Normalization**: Automatically formats URLs (e.g. `careers.airbnb.com` → `https://careers.airbnb.com`) and opens them safely in new tabs.
- **Full Data Ownership (Backup & Restore)**:
  - **JSON Export**: Download an exact, human-readable snapshot of all records.
  - **JSON Import**: Restore or merge backup files with schema validation and automatic ID deduplication.
- **Offline-First PWA**: Service Worker with stale-while-revalidate caching and Web Manifest support for standalone installation on iOS, Android, macOS, and Windows.
- **Mobile-Optimized Experience**: Dedicated bottom navigation dock and touch-friendly drawers on smartphones.

---

## 🏗️ Architecture & Project Structure

Opportunity Inbox intentionally avoids heavy JavaScript frameworks and bundlers to ensure instant loading, zero maintenance, and lifetime durability.

```text
├── index.html            # App shell, views (Home, Board, Stats, Tools), and dialog markup
├── styles.css            # Cabinet Editorial design system (light paper + auto dark mode, self-hosted fonts), responsive styling & print sheets
├── src/
│   ├── app.js            # View routing, DOM rendering, tool logic & event delegation
│   └── storage.js        # Stores (Opportunities, Portals, Settings, Resume) & JSON backup
├── test/
│   └── smoke-test.js     # Zero-dependency native Node.js smoke test suite
├── package.json          # Project metadata and test scripts
├── manifest.webmanifest  # PWA Web App Manifest
├── sw.js                 # Service Worker (offline cache strategy)
├── icon.svg              # App icon
└── vercel.json           # Static deployment and security headers
```

### Technical Design Principles
1. **Local-First & Private**: No analytics, third-party cookies, or remote databases. All data stays strictly in your browser's `localStorage`.
2. **Decoupled Persistence**: UI code never accesses `window.localStorage` directly; all reads, writes, and migrations pass through dedicated stores in `src/storage.js`.
3. **Zero-Build Deployment**: Standard ES Modules with native browser APIs. Works straight out of any HTTP server without compilation.
4. **Lightweight Test Coverage**: Zero external test dependencies using native Node.js asserts.

---

## Quickstart & Local Development

No build step required. Simply open `index.html` in your browser or run any local HTTP server:

```bash
# Option 1: Python 3 built-in server
python3 -m http.server 8080

# Option 2: npx serve
npx serve .

# Run automated smoke tests
npm test
```

Visit `http://localhost:8080` in your browser.

---

## 📄 License

MIT License © 2026 Yudhan Sebastian
