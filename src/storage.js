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

      updatedItem = {
        ...platform,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : platform.name,
        category: patch.category !== undefined ? patch.category.trim() : platform.category,
        url: patch.url !== undefined ? patch.url.trim() : platform.url,
        followUpDate: patch.followUpDate !== undefined ? patch.followUpDate.trim() : (platform.followUpDate || ""),
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
    const payload = {
      version: 2,
      exportedAt: now(),
      platforms: adapter.get(),
      contacts: contactsAdapter.get(),
      settings: settingsStore.get(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importJson(jsonString, mode = "merge") {
    try {
      const parsed = JSON.parse(jsonString);
      let platformArray = [];
      let contactArray = [];
      let incomingSettings = null;

      if (Array.isArray(parsed)) {
        platformArray = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.platforms)) platformArray = parsed.platforms;
        if (Array.isArray(parsed.contacts)) contactArray = parsed.contacts;
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
        followUpDate: (item.followUpDate || "").trim(),
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

      // Process contacts if present
      if (contactArray.length > 0) {
        const validatedContacts = contactArray.map((c) => ({
          id: c.id || createId(),
          name: (c.name || "Untitled Contact").trim(),
          company: (c.company || "").trim(),
          role: (c.role || "").trim(),
          email: (c.email || "").trim(),
          linkedin: (c.linkedin || "").trim(),
          note: (c.note || "").trim(),
          createdAt: c.createdAt || now(),
          updatedAt: c.updatedAt || now(),
        }));

        if (mode === "replace") {
          contactsAdapter.set(validatedContacts);
        } else {
          const existingContacts = contactsAdapter.get();
          const existingContactIds = new Set(existingContacts.map((c) => c.id));
          const mergedContacts = [...existingContacts];
          validatedContacts.forEach((c) => {
            if (!existingContactIds.has(c.id)) mergedContacts.push(c);
          });
          contactsAdapter.set(mergedContacts);
        }
      }

      // Update settings if present
      if (incomingSettings) {
        settingsStore.update(incomingSettings);
      }

      return { success: true, count: validated.length, contactsCount: contactArray.length };
    } catch (err) {
      console.error("Failed to import JSON data:", err);
      return { success: false, error: err.message };
    }
  },
};

const SETTINGS_KEY = "opportunity-inbox.settings.v1";
const CONTACTS_KEY = "opportunity-inbox.contacts.v1";

const settingsAdapter = new LocalStorageAdapter(SETTINGS_KEY);
const contactsAdapter = new LocalStorageAdapter(CONTACTS_KEY);

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
    return {
      userName: (data.userName || DEFAULT_SETTINGS.userName).trim(),
      weeklyGoal: Math.max(1, parseInt(data.weeklyGoal, 10) || DEFAULT_SETTINGS.weeklyGoal),
    };
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

export const contactStore = {
  list() {
    const raw = contactsAdapter.get();
    const list = Array.isArray(raw) ? raw : [];
    return list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  },
  get(id) {
    return this.list().find((c) => c.id === id) ?? null;
  },
  create(input) {
    const timestamp = now();
    const contact = {
      id: createId(),
      name: (input.name || "").trim(),
      company: (input.company || "").trim(),
      role: (input.role || "").trim(),
      email: (input.email || "").trim(),
      linkedin: (input.linkedin || "").trim(),
      note: (input.note || "").trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const contacts = [contact, ...this.list()];
    contactsAdapter.set(contacts);
    return contact;
  },
  update(id, patch) {
    const timestamp = now();
    let updatedItem = null;
    const contacts = this.list().map((c) => {
      if (c.id !== id) return c;
      updatedItem = {
        ...c,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() : c.name,
        company: patch.company !== undefined ? patch.company.trim() : c.company,
        role: patch.role !== undefined ? patch.role.trim() : c.role,
        email: patch.email !== undefined ? patch.email.trim() : c.email,
        linkedin: patch.linkedin !== undefined ? patch.linkedin.trim() : c.linkedin,
        note: patch.note !== undefined ? patch.note.trim() : c.note,
        updatedAt: timestamp,
      };
      return updatedItem;
    });
    contactsAdapter.set(contacts);
    return updatedItem;
  },
  remove(id) {
    const remaining = this.list().filter((c) => c.id !== id);
    contactsAdapter.set(remaining);
  },
};
