const STORAGE_KEY = "opportunity-inbox.platforms.v1";

export const STATUS_ENUM = {
  CAPTURED: "CAPTURED",
  VISITED: "VISITED",
  REGISTERED: "REGISTERED",
  PROFILE_READY: "PROFILE_READY",
  APPLIED: "APPLIED",
  CLOSED: "CLOSED",
};

export const STATUS_LABELS = {
  [STATUS_ENUM.CAPTURED]: "Captured",
  [STATUS_ENUM.VISITED]: "Visited",
  [STATUS_ENUM.REGISTERED]: "Registered",
  [STATUS_ENUM.PROFILE_READY]: "Profile Ready",
  [STATUS_ENUM.APPLIED]: "Applied",
  [STATUS_ENUM.CLOSED]: "Closed",
};

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
    const platforms = adapter.get();
    return platforms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  get(id) {
    const platforms = adapter.get();
    return platforms.find((platform) => platform.id === id) ?? null;
  },

  create(input) {
    const timestamp = now();
    const platform = {
      id: createId(),
      name: (input.name || "").trim(),
      category: (input.category || "").trim(),
      url: (input.url || "").trim(),
      status: input.status && STATUS_LABELS[input.status] ? input.status : STATUS_ENUM.CAPTURED,
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
    const platforms = adapter.get().map((platform) => {
      if (platform.id !== id) {
        return platform;
      }

      updatedItem = {
        ...platform,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : platform.name,
        category: patch.category !== undefined ? patch.category.trim() : platform.category,
        url: patch.url !== undefined ? patch.url.trim() : platform.url,
        note: patch.note !== undefined ? patch.note.trim() : platform.note,
        status: patch.status && STATUS_LABELS[patch.status] ? patch.status : platform.status,
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
};
