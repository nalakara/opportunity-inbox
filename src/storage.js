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

export const STATUS_LABELS = {
  [STATUS_ENUM.WISHLIST]: "Wishlist",
  [STATUS_ENUM.APPLIED]: "Applied",
  [STATUS_ENUM.INTERVIEWING]: "Interviewing",
  [STATUS_ENUM.OFFER]: "Offer",
  [STATUS_ENUM.REJECTED]: "Rejected",
  [STATUS_ENUM.GHOSTED]: "Ghosted",
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
    }));
    return platforms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  get(id) {
    const platforms = this.list();
    return platforms.find((platform) => platform.id === id) ?? null;
  },

  create(input) {
    const timestamp = now();
    const platform = {
      id: createId(),
      name: (input.name || "").trim(),
      category: (input.category || "").trim(),
      url: (input.url || "").trim(),
      status: normalizeStatus(input.status),
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

      updatedItem = {
        ...platform,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : platform.name,
        category: patch.category !== undefined ? patch.category.trim() : platform.category,
        url: patch.url !== undefined ? patch.url.trim() : platform.url,
        note: patch.note !== undefined ? patch.note.trim() : platform.note,
        status: targetStatus,
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

  exportJson() {
    const data = adapter.get();
    return JSON.stringify(data, null, 2);
  },

  importJson(jsonString, mode = "merge") {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid backup file format. Expected an array of records.");
      }

      const validated = parsed.map((item) => ({
        id: item.id || createId(),
        name: (item.name || "Untitled").trim(),
        category: (item.category || "").trim(),
        url: (item.url || "").trim(),
        status: normalizeStatus(item.status),
        note: (item.note || "").trim(),
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
      return { success: true, count: validated.length };
    } catch (err) {
      console.error("Failed to import JSON data:", err);
      return { success: false, error: err.message };
    }
  },
};
