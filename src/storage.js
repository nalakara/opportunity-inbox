const STORAGE_KEY = "opportunity-inbox.platforms.v1";

export const STATUS_ENUM = {
  WISHLIST: "WISHLIST",
  APPLIED: "APPLIED",
  INTERVIEWING: "INTERVIEWING",
  OFFER: "OFFER",
  REJECTED: "REJECTED",
  GHOSTED: "GHOSTED",
  FOLLOW_UP: "FOLLOW_UP",
};

// Freelance-facing stage names (conditioned 2026-11-10).
// Enum keys stay stable so stored localStorage data survives renames.
export const STATUS_LABELS = {
  [STATUS_ENUM.WISHLIST]: "Lead",
  [STATUS_ENUM.APPLIED]: "Pitched",
  [STATUS_ENUM.INTERVIEWING]: "Diskusi",
  [STATUS_ENUM.OFFER]: "Deal",
  [STATUS_ENUM.REJECTED]: "Gagal",
  [STATUS_ENUM.GHOSTED]: "Tanpa kabar",
  [STATUS_ENUM.FOLLOW_UP]: "Follow Up",
};

const LEGACY_STATUS_MAP = {
  CAPTURED: STATUS_ENUM.WISHLIST,
  VISITED: STATUS_ENUM.WISHLIST,
  REGISTERED: STATUS_ENUM.WISHLIST,
  PROFILE_READY: STATUS_ENUM.WISHLIST,
  APPLIED: STATUS_ENUM.APPLIED,
  CLOSED: STATUS_ENUM.REJECTED,
};

export function normalizeStatus(status) {
  if (STATUS_ENUM[status]) {
    return status;
  }
  if (LEGACY_STATUS_MAP[status]) {
    return LEGACY_STATUS_MAP[status];
  }
  return STATUS_ENUM.WISHLIST;
}

/**
 * Status history records every stage an opportunity has sat in, so the
 * funnel measures real movement instead of inferring it from the current
 * stage. Entries are { status, at }. Items stored before history existed
 * backfill a single entry from their current stage.
 */
export function normalizeStatusHistory(item) {
  const fallback = [
    { status: normalizeStatus(item.status), at: item.createdAt || item.updatedAt || "" },
  ];
  if (!Array.isArray(item.statusHistory) || item.statusHistory.length === 0) {
    return fallback;
  }
  const cleaned = item.statusHistory
    .filter((entry) => entry && typeof entry === "object" && STATUS_ENUM[entry.status])
    .map((entry) => ({ status: entry.status, at: entry.at || item.createdAt || "" }));
  return cleaned.length > 0 ? cleaned : fallback;
}

/**
 * LocalStorageAdapter encapsulates raw localStorage operations,
 * ensuring UI and app code remain decoupled from window.localStorage.
 */
class LocalStorageAdapter {
  constructor(key) {
    this.key = key;
  }

  get() {
    try {
      const raw = window.localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to read from localStorage:", err);
      return [];
    }
  }

  set(data) {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error("Failed to write to localStorage:", err);
      return false;
    }
  }
}

const adapter = new LocalStorageAdapter(STORAGE_KEY);

function now() {
  return new Date().toISOString();
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `platform-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const platformStore = {
  list() {
    const rawPlatforms = adapter.get();
    const platforms = rawPlatforms.map((p) => ({
      ...p,
      status: normalizeStatus(p.status),
      statusHistory: normalizeStatusHistory(p),
    }));
    return platforms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  get(id) {
    const platforms = this.list();
    return platforms.find((platform) => platform.id === id) ?? null;
  },

  create(input) {
    const timestamp = now();
    const status = normalizeStatus(input.status);
    const platform = {
      id: createId(),
      name: (input.name || "").trim(),
      category: (input.category || "").trim(),
      url: (input.url || "").trim(),
      status,
      statusHistory: [{ status, at: timestamp }],
      followUpDate: (input.followUpDate || "").trim(),
      note: (input.note || "").trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const platforms = [platform, ...adapter.get()];
    adapter.set(platforms);
    return platform;
  },

  update(id, patch) {
    const timestamp = now();
    let updatedItem = null;
    const rawPlatforms = adapter.get();
    const platforms = rawPlatforms.map((platform) => {
      if (platform.id !== id) {
        return platform;
      }

      const targetStatus = patch.status !== undefined ? normalizeStatus(patch.status) : normalizeStatus(platform.status);
      const history = normalizeStatusHistory(platform);
      const nextHistory =
        targetStatus !== normalizeStatus(platform.status)
          ? [...history, { status: targetStatus, at: timestamp }]
          : history;

      updatedItem = {
        ...platform,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : platform.name,
        category: patch.category !== undefined ? patch.category.trim() : platform.category,
        url: patch.url !== undefined ? patch.url.trim() : platform.url,
        followUpDate: patch.followUpDate !== undefined ? patch.followUpDate.trim() : (platform.followUpDate || ""),
        note: patch.note !== undefined ? patch.note.trim() : platform.note,
        status: targetStatus,
        statusHistory: nextHistory,
        updatedAt: timestamp,
      };
      return updatedItem;
    });

    adapter.set(platforms);
    return updatedItem;
  },

  remove(id) {
    const remaining = adapter.get().filter((platform) => platform.id !== id);
    adapter.set(remaining);
  },

  // Demo data: 13 fictional records with complete histories. Loading
  // replaces the current opportunities; portals, settings, and CVs are
  // untouched. Fixed ids make loading idempotent.
  loadDemoData() {
    const demo = buildDemoOpportunities();
    adapter.set(demo);
    return demo;
  },

  clearDemoData() {
    const current = adapter.get();
    const remaining = current.filter((p) => p.demo !== true);
    adapter.set(remaining);
    return current.length - remaining.length;
  },

  hasDemoData() {
    return adapter.get().some((p) => p.demo === true);
  },

  exportJson() {
    const payload = {
      version: 2,
      exportedAt: now(),
      platforms: adapter.get(),
      portals: portalsAdapter.get(),
      settings: settingsStore.get(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importJson(jsonString, mode = "merge") {
    try {
      const parsed = JSON.parse(jsonString);
      let platformArray = [];
      let portalArray = [];
      let incomingSettings = null;

      if (Array.isArray(parsed)) {
        platformArray = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.platforms)) platformArray = parsed.platforms;
        if (Array.isArray(parsed.portals)) portalArray = parsed.portals;
        if (parsed.settings) incomingSettings = parsed.settings;
      } else {
        throw new Error("Invalid backup file format.");
      }

      const validated = platformArray.map((item) => ({
        id: item.id || createId(),
        name: (item.name || "Untitled").trim(),
        category: (item.category || "").trim(),
        url: (item.url || "").trim(),
        status: normalizeStatus(item.status),
        statusHistory: normalizeStatusHistory(item),
        followUpDate: (item.followUpDate || "").trim(),
        note: (item.note || "").trim(),
        ...(item.demo === true ? { demo: true } : {}),
        createdAt: item.createdAt || now(),
        updatedAt: item.updatedAt || now(),
      }));

      if (mode === "replace") {
        adapter.set(validated);
      } else {
        // Merge mode: retain existing items, add new items if ID doesn't exist
        const existing = adapter.get();
        const existingIds = new Set(existing.map((p) => p.id));
        const merged = [...existing];

        validated.forEach((item) => {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        });
        adapter.set(merged);
      }

      // Process portals if present
      if (portalArray.length > 0) {
        const validatedPortals = portalArray.map((p) => ({
          id: p.id || createId(),
          name: (p.name || "Untitled Portal").trim(),
          url: (p.url || "").trim(),
          category: normalizePortalCategory(p.category),
          status: normalizePortalStatus(p.status),
          remarks: (p.remarks || "").trim(),
          createdAt: p.createdAt || now(),
          updatedAt: p.updatedAt || now(),
        }));

        if (mode === "replace") {
          portalsAdapter.set(validatedPortals);
        } else {
          const existingPortals = portalsAdapter.get();
          const existingPortalIds = new Set(existingPortals.map((p) => p.id));
          const mergedPortals = [...existingPortals];
          validatedPortals.forEach((p) => {
            if (!existingPortalIds.has(p.id)) mergedPortals.push(p);
          });
          portalsAdapter.set(mergedPortals);
        }
      }

      // Update settings if present
      if (incomingSettings) {
        settingsStore.update(incomingSettings);
      }

      return { success: true, count: validated.length, portalsCount: portalArray.length };
    } catch (err) {
      console.error("Failed to import JSON data:", err);
      return { success: false, error: err.message };
    }
  },
};

/* ------------------------------------------------------------------ */
/* Demo data: one fictional dummy user with an optimal scenario.      */
/* 13 opportunities across all 7 stages, each with a complete         */
/* statusHistory, so the pipeline, gauge, and funnel can be evaluated  */
/* with realistic, well-formed data. Timestamps are relative to load   */
/* time (days ago), so the target metrics hold whenever the demo is    */
/* loaded: gauge 7 of 10, funnel 45% / 60%, win rate 27%. No personal */
/* identifiers anywhere: every name is fictional.                     */
/* ------------------------------------------------------------------ */

function demoAt(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function demoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// [id, stage, portal, title, url, [[stage, daysAgo] ...], followUpInDays|null, note]
// followUpInDays: 0 = today, 1 = tomorrow, 2 = in two days.
const DEMO_DEFS = [
  ["demo-01", "WISHLIST", "Contra", "Banyan Coffee Co. - Packaging Labels", "https://contra.com", [["WISHLIST", 20]], null, "Saw the brief, researching the brand before pitching."],
  ["demo-02", "WISHLIST", "Upwork", "Northwind Outdoors - Brand Refresh", "https://upwork.com", [["WISHLIST", 12]], null, "Shortlisted from a job post, not pitched yet."],
  ["demo-03", "APPLIED", "Upwork", "Seaside Resort Bali - Menu Design", "https://upwork.com", [["WISHLIST", 8], ["APPLIED", 1]], 1, "Proposal sent, waiting for reply."],
  ["demo-04", "APPLIED", "OneForma", "Image Labelling - Street Scenes", "https://www.oneforma.com", [["WISHLIST", 6], ["APPLIED", 0]], null, "Assessment submitted, awaiting review."],
  ["demo-05", "INTERVIEWING", "Upwork", "Harbor & Pine Hotel - Logo Refresh", "https://upwork.com", [["WISHLIST", 14], ["APPLIED", 8], ["INTERVIEWING", 1]], 0, "Client asked for a second concept."],
  ["demo-06", "INTERVIEWING", "Mercor", "Video Conversation Review", "https://mercor.com", [["WISHLIST", 13], ["APPLIED", 7], ["INTERVIEWING", 0]], null, "Screening call done, waiting on task details."],
  ["demo-07", "INTERVIEWING", "Micro1", "Prompt Evaluation - Travel Guides", "https://micro1.ai", [["WISHLIST", 9], ["APPLIED", 5], ["INTERVIEWING", 1]], 2, "Shortlisted, rate discussion next."],
  ["demo-08", "OFFER", "Contra", "Coffee Roastery - Brand & Packaging", "https://contra.com", [["WISHLIST", 19], ["APPLIED", 12], ["INTERVIEWING", 6], ["OFFER", 0]], null, "Won. Kickoff call this week."],
  ["demo-09", "OFFER", "iMerit Scholars", "Video Annotation - Training Clips", "https://imerit.net", [["WISHLIST", 18], ["APPLIED", 10], ["INTERVIEWING", 7], ["OFFER", 5]], null, "First batch in progress."],
  ["demo-10", "OFFER", "Upwork", "Restaurant Group - Menu & Signage", "https://upwork.com", [["WISHLIST", 10], ["APPLIED", 6], ["OFFER", 4]], null, "Direct hire, no interview round."],
  ["demo-11", "REJECTED", "Workbolt", "Product Photos - Retouching Batch", "https://workbolt.com", [["WISHLIST", 13], ["APPLIED", 9], ["REJECTED", 5]], null, "Client chose another designer."],
  ["demo-12", "GHOSTED", "CrowdGen", "Survey Response Review", "https://www.crowdgen.com", [["WISHLIST", 12], ["APPLIED", 8], ["GHOSTED", 4]], null, "No reply after two follow-ups."],
  ["demo-13", "FOLLOW_UP", "Turing", "Code Review - React Components", "https://turing.com", [["WISHLIST", 7], ["APPLIED", 3], ["FOLLOW_UP", 0]], 1, "Nudge sent, waiting for reply."],
];

export function buildDemoOpportunities() {
  return DEMO_DEFS.map(([id, status, category, name, url, history, followUpInDays, note]) => {
    const statusHistory = history.map(([stage, daysAgo]) => ({ status: stage, at: demoAt(daysAgo) }));
    return {
      id,
      demo: true,
      name,
      category,
      url,
      status,
      statusHistory,
      followUpDate: followUpInDays === null ? "" : demoDate(-followUpInDays),
      note,
      createdAt: statusHistory[0].at,
      updatedAt: statusHistory[statusHistory.length - 1].at,
    };
  });
}

const SETTINGS_KEY = "opportunity-inbox.settings.v1";
const PORTALS_KEY = "opportunity-inbox.portals.v1";

const settingsAdapter = new LocalStorageAdapter(SETTINGS_KEY);
const portalsAdapter = new LocalStorageAdapter(PORTALS_KEY);

const DEFAULT_SETTINGS = {
  userName: "Yudhan",
  weeklyGoal: 10,
};

export const settingsStore = {
  get() {
    const data = settingsAdapter.get();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ...DEFAULT_SETTINGS };
    }
    const cleaned = {
      userName: (data.userName || DEFAULT_SETTINGS.userName).trim(),
      weeklyGoal: Math.max(1, parseInt(data.weeklyGoal, 10) || DEFAULT_SETTINGS.weeklyGoal),
    };
    // One-time migration (v2.9.0): the Gemini API key setting had no
    // consumer after the Resume Builder was removed, so any stored key is
    // deleted from storage the first time settings load.
    if (data.geminiApiKey !== undefined) {
      settingsAdapter.set(cleaned);
    }
    return cleaned;
  },
  update(patch) {
    const current = this.get();
    const updated = {
      ...current,
      userName: patch.userName !== undefined ? patch.userName.trim() : current.userName,
      weeklyGoal: patch.weeklyGoal !== undefined ? Math.max(1, parseInt(patch.weeklyGoal, 10) || 10) : current.weeklyGoal,
    };
    settingsAdapter.set(updated);
    return updated;
  },
};


export const PORTAL_CATEGORIES = ["AI Training", "Marketplace", "Microtask", "Other"];

export const PORTAL_STATUS = {
  REGISTERED: "registered",
  NOT_REGISTERED: "not_registered",
};

export const PORTAL_STATUS_LABELS = {
  [PORTAL_STATUS.REGISTERED]: "Registered",
  [PORTAL_STATUS.NOT_REGISTERED]: "Not registered",
};

export function normalizePortalStatus(status) {
  return status === PORTAL_STATUS.REGISTERED ? PORTAL_STATUS.REGISTERED : PORTAL_STATUS.NOT_REGISTERED;
}

export function normalizePortalCategory(category) {
  const value = (category || "").trim();
  return PORTAL_CATEGORIES.includes(value) ? value : "Other";
}

/**
 * Curated starter list of freelance gig portals, researched 2026-11-10.
 * The app is local-first with no AI backend, so there is no live web
 * search inside the app: this seed is the "automatic" list, and the user
 * adds or edits portals by hand. Registration status reflects Yudhan's
 * own accounts where known; uncertain entries say so in their remarks.
 */
const PORTAL_SEED = [
  { id: "portal-mercor", name: "Mercor", url: "https://mercor.com", category: "AI Training", status: "registered", remarks: "Offer diterima 5 Nov 2026 sebagai Odin writer; detail tugas belum jelas (dokumen offer belum dibagikan)." },
  { id: "portal-imerit", name: "iMerit Scholars", url: "https://imerit.net", category: "AI Training", status: "registered", remarks: "Kontrak 12499 (Video Fraud Detection Analyst) ditandatangani 1 Nov 2026, dihentikan 7 Nov 2026 tanpa alasan; tiket 350856347375 masih dalam peninjauan awal." },
  { id: "portal-oneforma", name: "OneForma", url: "https://www.oneforma.com", category: "AI Training", status: "registered", remarks: "Verifikasi identitas selesai 5 Nov 2026; akun dibuat." },
  { id: "portal-crowdgen", name: "CrowdGen", url: "https://www.crowdgen.com", category: "AI Training", status: "not_registered", remarks: "Email verifikasi diterima 5 Nov 2026 pukul 06:18; penyelesaian pendaftaran belum dikonfirmasi." },
  { id: "portal-workbolt", name: "Workbolt", url: "https://workbolt.com", category: "AI Training", status: "registered", remarks: "Kode verifikasi diminta 5 Nov 2026 dari Legian (miliknya)." },
  { id: "portal-turing", name: "Turing", url: "https://www.turing.com", category: "AI Training", status: "registered", remarks: "Akun sejak Jun 2026; penawaran Personal Account Raters ditutup 8 Nov 2026 (overlap 01:00-05:00 WITA tidak cocok)." },
  { id: "portal-micro1", name: "Micro1", url: "https://micro1.ai", category: "AI Training", status: "not_registered", remarks: "" },
  { id: "portal-upwork", name: "Upwork", url: "https://www.upwork.com", category: "Marketplace", status: "not_registered", remarks: "" },
  { id: "portal-contra", name: "Contra", url: "https://contra.com", category: "Marketplace", status: "not_registered", remarks: "" },
];

/**
 * Seeds the curated portal list on first run only. Returns how many
 * portals were seeded (0 when the store already has entries).
 */
export function seedPortalsIfEmpty() {
  if (portalsAdapter.get().length > 0) return 0;
  const timestamp = now();
  const seeded = PORTAL_SEED.map((p) => ({ ...p, createdAt: timestamp, updatedAt: timestamp }));
  portalsAdapter.set(seeded);
  return seeded.length;
}

export const portalStore = {
  list() {
    const raw = portalsAdapter.get();
    const list = Array.isArray(raw) ? raw : [];
    return list
      .map((p) => ({
        ...p,
        category: normalizePortalCategory(p.category),
        status: normalizePortalStatus(p.status),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  get(id) {
    return this.list().find((p) => p.id === id) ?? null;
  },
  create(input) {
    const timestamp = now();
    const portal = {
      id: createId(),
      name: (input.name || "").trim(),
      url: (input.url || "").trim(),
      category: normalizePortalCategory(input.category),
      status: normalizePortalStatus(input.status),
      remarks: (input.remarks || "").trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const portals = [portal, ...portalsAdapter.get()];
    portalsAdapter.set(portals);
    return portal;
  },
  update(id, patch) {
    const timestamp = now();
    let updatedItem = null;
    const portals = portalsAdapter.get().map((p) => {
      if (p.id !== id) return p;
      updatedItem = {
        ...p,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : p.name,
        url: patch.url !== undefined ? patch.url.trim() : p.url,
        category: patch.category !== undefined ? normalizePortalCategory(patch.category) : p.category,
        status: patch.status !== undefined ? normalizePortalStatus(patch.status) : p.status,
        remarks: patch.remarks !== undefined ? patch.remarks.trim() : p.remarks,
        updatedAt: timestamp,
      };
      return updatedItem;
    });
    portalsAdapter.set(portals);
    return updatedItem;
  },
  remove(id) {
    const remaining = portalsAdapter.get().filter((p) => p.id !== id);
    portalsAdapter.set(remaining);
  },
};

/* ------------------------------------------------------------------ */
/* CV Vault: finished CV files, stored in IndexedDB (not localStorage: */
/* PDFs are too big for the ~5 MB localStorage budget). Files are NOT  */
/* included in the JSON backup/export; they live in this browser only  */
/* until a backend exists. In environments without IndexedDB (the Node */
/* smoke test), an in-memory map backs the same async interface.       */
/* ------------------------------------------------------------------ */

const CV_VAULT_DB_NAME = "opportunity-inbox-cv-vault";
const CV_VAULT_STORE_NAME = "cvs";
const CV_VAULT_DB_VERSION = 1;

export const CV_VAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateCVFile(file) {
  if (!file) return { ok: false, error: "No file selected." };
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  if (!isPdf) return { ok: false, error: "CV Vault stores PDF files only." };
  if (file.size > CV_VAULT_MAX_FILE_SIZE) {
    return { ok: false, error: "File is larger than 10 MB." };
  }
  return { ok: true, error: "" };
}

export function createCVRecord({ file, label, note }) {
  const baseName = (file.name || "cv.pdf").replace(/\.pdf$/i, "");
  const timestamp = now();
  return {
    id: createId(),
    label: (label || "").trim() || baseName,
    fileName: file.name || "cv.pdf",
    fileSize: file.size || 0,
    fileType: file.type || "application/pdf",
    note: (note || "").trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const cvVaultMemory = new Map();

function cvVaultIdbAvailable() {
  return typeof indexedDB !== "undefined";
}

function openCvVaultDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CV_VAULT_DB_NAME, CV_VAULT_DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(CV_VAULT_STORE_NAME)) {
        req.result.createObjectStore(CV_VAULT_STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function cvVaultStoreHandle(db, mode) {
  return db.transaction(CV_VAULT_STORE_NAME, mode).objectStore(CV_VAULT_STORE_NAME);
}

function cvVaultRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function stripCvBlob(row) {
  const { blob, ...meta } = row;
  return meta;
}

export const cvVaultStore = {
  async list() {
    if (!cvVaultIdbAvailable()) {
      return [...cvVaultMemory.values()].map(stripCvBlob).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const db = await openCvVaultDb();
    try {
      const rows = await cvVaultRequest(cvVaultStoreHandle(db, "readonly").getAll());
      return rows.map(stripCvBlob).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } finally {
      db.close();
    }
  },

  async add(record, blob) {
    const row = { ...record, blob };
    if (!cvVaultIdbAvailable()) {
      cvVaultMemory.set(record.id, row);
      return { ...record };
    }
    const db = await openCvVaultDb();
    try {
      await cvVaultRequest(cvVaultStoreHandle(db, "readwrite").put(row));
      return { ...record };
    } finally {
      db.close();
    }
  },

  async update(id, patch) {
    if (!cvVaultIdbAvailable()) {
      const row = cvVaultMemory.get(id);
      if (!row) return null;
      const updated = { ...row, ...patch, updatedAt: now() };
      cvVaultMemory.set(id, updated);
      return stripCvBlob(updated);
    }
    const db = await openCvVaultDb();
    try {
      const store = cvVaultStoreHandle(db, "readwrite");
      const row = await cvVaultRequest(store.get(id));
      if (!row) return null;
      const updated = { ...row, ...patch, updatedAt: now() };
      await cvVaultRequest(store.put(updated));
      return stripCvBlob(updated);
    } finally {
      db.close();
    }
  },

  async remove(id) {
    if (!cvVaultIdbAvailable()) {
      cvVaultMemory.delete(id);
      return;
    }
    const db = await openCvVaultDb();
    try {
      await cvVaultRequest(cvVaultStoreHandle(db, "readwrite").delete(id));
    } finally {
      db.close();
    }
  },

  async getBlob(id) {
    if (!cvVaultIdbAvailable()) {
      return cvVaultMemory.get(id)?.blob || null;
    }
    const db = await openCvVaultDb();
    try {
      const row = await cvVaultRequest(cvVaultStoreHandle(db, "readonly").get(id));
      return row?.blob || null;
    } finally {
      db.close();
    }
  },
};
