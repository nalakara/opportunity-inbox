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

  exportJson() {
    const payload = {
      version: 2,
      exportedAt: now(),
      platforms: adapter.get(),
      contacts: contactsAdapter.get(),
      settings: settingsStore.get(),
      resume: resumeStore.get(),
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
        if (parsed.resume) resumeStore.save(parsed.resume);
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
const RESUME_KEY = "opportunity-inbox.resume.v1";

const settingsAdapter = new LocalStorageAdapter(SETTINGS_KEY);
const contactsAdapter = new LocalStorageAdapter(CONTACTS_KEY);
const resumeAdapter = new LocalStorageAdapter(RESUME_KEY);

const DEFAULT_SETTINGS = {
  userName: "Yudhan",
  weeklyGoal: 10,
  geminiApiKey: "",
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
      geminiApiKey: (data.geminiApiKey || "").trim(),
    };
  },
  update(patch) {
    const current = this.get();
    const updated = {
      ...current,
      userName: patch.userName !== undefined ? patch.userName.trim() : current.userName,
      weeklyGoal: patch.weeklyGoal !== undefined ? Math.max(1, parseInt(patch.weeklyGoal, 10) || 10) : current.weeklyGoal,
      geminiApiKey: patch.geminiApiKey !== undefined ? patch.geminiApiKey.trim() : current.geminiApiKey,
    };
    settingsAdapter.set(updated);
    return updated;
  },
};

export const DEFAULT_RESUME = {
  fullName: "Yudhan Sebastian",
  title: "Frontend & Full Stack Software Engineer",
  email: "yudhan@example.com",
  phone: "+62 812 3456 7890",
  location: "Jakarta, Indonesia (Remote)",
  website: "https://github.com/nalakara",
  summary: "Results-driven Software Engineer with 5+ years of experience engineering high-performance web applications, resilient client-side systems, and intuitive design systems. Passionate about zero-dependency architecture, accessibility, and high developer velocity.",
  skills: "JavaScript (ES6+), TypeScript, React, HTML5, CSS3, Node.js, WebSockets, Service Workers, Git, REST APIs, Performance Optimization",
  experience: `Senior Frontend Engineer | Tech Platform Inc. (2023 - Present)
• Architected high-performance web applications serving 100k+ active users with sub-second page loads.
• Spearheaded local-first offline caching strategies using Service Workers, reducing network overhead by 45%.
• Mentored 5 junior engineers and established automated linting, testing, and accessibility guidelines.

Web Application Developer | Creative Studio (2021 - 2023)
• Engineered responsive customer-facing web dashboards with modular component architectures.
• Collaborated closely with cross-functional product and design teams to iterate rapidly from wireframes to production.
• Optimized Core Web Vitals (LCP, CLS, INP) achieving consistent 95+ Lighthouse scores.`,
  education: `B.S. in Computer Science | State University (2017 - 2021)
• Graduated with Honors. Focus on Distributed Systems & Software Engineering.`,
  projects: `Opportunity Inbox (github.com/nalakara/opportunity-inbox)
• Local-first job search pipeline and CRM with zero cloud dependencies and offline-ready storage.
• Built with pure vanilla JavaScript, CSS3 design system, and Service Worker caching.`
};

export const resumeStore = {
  get() {
    const raw = resumeAdapter.get();
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || !raw.fullName) {
      return { ...DEFAULT_RESUME };
    }
    return raw;
  },
  save(data) {
    resumeAdapter.set(data);
    return data;
  },
  reset() {
    resumeAdapter.set(DEFAULT_RESUME);
    return { ...DEFAULT_RESUME };
  }
};

export function parseRawResumeText(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
      skills: "",
      experience: "",
      education: "",
      projects: "",
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const result = {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
    skills: "",
    experience: "",
    education: "",
    projects: "",
  };

  if (lines.length === 0) return result;

  // 1. Email extraction
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0].trim();
  }

  // 2. Phone extraction (avoid matching years like 2011 - 2013)
  const phoneMatches = rawText.matchAll(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/g);
  for (const match of phoneMatches) {
    const candidate = match[0].trim();
    if (candidate.length >= 8 && !/20\d\d/.test(candidate)) {
      result.phone = candidate;
      break;
    }
  }

  // 3. Website / Portfolio / GitHub / LinkedIn
  const urlMatches = rawText.matchAll(/(?:https?:\/\/)?(?:www\.)?(github\.com\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+|[a-zA-Z0-9-]+\.(?:com|org|dev|io|me|net|app|id)(?:\/[^\s·|,]*)?)/gi);
  for (const match of urlMatches) {
    const candidate = match[0].trim();
    if (result.email && result.email.toLowerCase().includes(candidate.toLowerCase())) {
      continue;
    }
    result.website = candidate.startsWith("http") ? candidate : `https://${candidate}`;
    break;
  }

  // 4. Section detection keywords
  const SECTION_PATTERNS = {
    skills: /^(EXPERTISE|CORE COMPETENCIES|SKILLS|TECHNICAL SKILLS|TOOLS|AREAS OF EXPERTISE|COMPETENCIES)$/i,
    experience: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|WORK HISTORY|INDEPENDENT PRACTICE|EARLY CAREER)$/i,
    education: /^(EDUCATION|ACADEMIC BACKGROUND|EDUCATION & CREDENTIALS|DEGREES)$/i,
    projects: /^(PROJECTS|SELECTED PROJECTS|KEY PROJECTS|PORTFOLIO|SELECTED PUBLIC GITHUB PROJECTS)$/i,
    summary: /^(SUMMARY|PROFESSIONAL SUMMARY|ABOUT ME|PROFILE|EXECUTIVE SUMMARY)$/i,
    credentials: /^(CREDENTIALS|CERTIFICATIONS|CERTIFICATES|AWARDS|LANGUAGES)$/i,
  };

  let currentSection = "header";
  const sections = {
    header: [],
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    credentials: [],
  };

  for (const line of lines) {
    let matchedKey = null;
    for (const [key, regex] of Object.entries(SECTION_PATTERNS)) {
      if (regex.test(line)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else {
      sections[currentSection].push(line);
    }
  }

  // 5. Process Header Lines
  const headerLines = sections.header;
  if (headerLines.length > 0) {
    result.fullName = headerLines[0];
  }
  if (headerLines.length > 1) {
    result.title = headerLines[1];
  }

  // Location from contact line (usually line 2 or 3)
  for (let i = 2; i < Math.min(5, headerLines.length); i++) {
    const line = headerLines[i];
    const tokens = line.split(/[·|•]/).map((t) => t.trim());
    for (const t of tokens) {
      if (
        t &&
        !t.includes("@") &&
        !t.includes("http") &&
        !t.includes(".com") &&
        !t.includes("github") &&
        !t.includes("linkedin")
      ) {
        if (/^[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?$/.test(t) && t.length > 2 && t.length < 50) {
          result.location = t;
          break;
        }
      }
    }
    if (result.location) break;
  }

  // Summary
  if (sections.summary.length > 0) {
    result.summary = sections.summary.join("\n\n");
  } else if (headerLines.length > 3) {
    result.summary = headerLines.slice(3).join(" ");
  }

  // Skills
  const skillsList = [...sections.skills, ...(sections.credentials || [])];
  result.skills = skillsList.join("\n");

  // Experience
  result.experience = sections.experience.join("\n\n");

  // Education
  result.education = sections.education.join("\n\n");

  // Projects
  result.projects = sections.projects.join("\n\n");

  return result;
}

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
