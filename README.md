# Opportunity Inbox v0.1

A clean, quiet productivity, local-first Progressive Web App (PWA) designed for capturing opportunity platforms and tracking your interaction status with each one.

## Core Product Intent

Help you answer at a glance:
> **"What platforms have I found, and what stage am I at with each one?"**

---

## Features (v0.1 Scope)

- ⚡ **Quick Capture Form**: Easily capture new platforms with platform name, category, URL, and notes. Supports `⌘K` / `Ctrl+K` keyboard shortcut.
- 📋 **Platform List & Filtering**: Filter platforms by interaction stage (`Captured`, `Visited`, `Registered`, `Profile Ready`, `Applied`, `Closed`).
- 🏷️ **Interaction Stages**: Track platforms through 6 explicit status stages:
  - **Captured**: Initial discovery.
  - **Visited**: Checked out the platform.
  - **Registered**: Created an account.
  - **Profile Ready**: Completed user profile/portfolio.
  - **Applied**: Submitted applications or pitch.
  - **Closed**: Completed or archived.
- 📱 **Mobile-First Responsive UI**: Dual-panel side-by-side layout on desktop views ($\ge 820\text{px}$) and smooth single-panel navigation with a `← Back to platforms` button on mobile viewports ($< 820\text{px}$).
- 🔗 **URL Normalization & External Access**: Automatically normalizes URLs (e.g. `contra.com` $\rightarrow$ `https://contra.com`) and opens them safely in new browser tabs.
- 💾 **Persistent Local Storage**: Storage logic is completely isolated inside a `LocalStorageAdapter` (`src/storage.js`), keeping UI code fully decoupled from browser storage APIs.
- 📲 **PWA & Offline Capability**: Service Worker (`sw.js`) and Web Manifest (`manifest.webmanifest`) for standalone app installation and offline usage.

---

## Local Development & Preview

Because Opportunity Inbox v0.1 is built using standard HTML5, CSS3, and ES Modules without heavy build tools, you can serve it locally using any static web server:

```bash
# Option 1: Python 3 built-in server
python3 -m http.server 8080

# Option 2: npx serve / live-server
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## Architecture & Project Structure

```text
├── index.html            # Main app shell and markup
├── styles.css            # Responsive CSS design system
├── src/
│   ├── app.js            # UI logic, event handlers & DOM rendering
│   └── storage.js        # Storage abstraction layer & LocalStorageAdapter
├── manifest.webmanifest  # PWA Web App Manifest
├── sw.js                 # Service Worker (stale-while-revalidate strategy)
└── icon.svg              # SVG app icon
```

---

## Technical Constraints & Design Principles

- **Local-First**: Zero external backend APIs, cloud databases, or authentication required.
- **Quiet Productivity**: Minimalist, fast, and practical interface.
- **Clean Abstraction**: UI components never invoke `window.localStorage` directly; all reads/writes route through the store interface in `src/storage.js`.

---

## License

MIT License
