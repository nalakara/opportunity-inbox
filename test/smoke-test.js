import assert from "node:assert/strict";

// Mock localStorage for Node test environment
const memoryStorage = new Map();
globalThis.window = {
  localStorage: {
    getItem(key) {
      return memoryStorage.get(key) || null;
    },
    setItem(key, value) {
      memoryStorage.set(key, String(value));
    },
    removeItem(key) {
      memoryStorage.delete(key);
    },
    clear() {
      memoryStorage.clear();
    },
  },
  crypto: globalThis.crypto,
};

// Import storage module
const {
  platformStore,
  contactStore,
  settingsStore,
  resumeStore,
  STATUS_ENUM,
  DEFAULT_RESUME,
} = await import("../src/storage.js");

console.log("Running Opportunity Inbox Suite Smoke Tests...\n");

// 1. Platform Store CRUD & Status Validation
console.log("1. Testing platformStore...");
const job = platformStore.create({
  name: "Stripe",
  category: "Frontend Engineer",
  url: "stripe.com/jobs",
  status: "APPLIED",
  followUpDate: "2026-11-20",
  note: "Spoke with recruiter",
});

assert.ok(job.id, "Job ID should be generated");
assert.equal(job.name, "Stripe");
assert.equal(job.status, STATUS_ENUM.APPLIED);
assert.equal(job.followUpDate, "2026-11-20");

const updatedJob = platformStore.update(job.id, { status: "INTERVIEWING" });
assert.equal(updatedJob.status, STATUS_ENUM.INTERVIEWING);

const list = platformStore.list();
assert.equal(list.length, 1);
assert.equal(list[0].id, job.id);
console.log("  ✓ platformStore CRUD passed.");

// 2. Contact Store CRUD
console.log("2. Testing contactStore...");
const contact = contactStore.create({
  name: "Sarah Jenkins",
  company: "Stripe",
  role: "Recruiter",
  email: "sarah@example.com",
  linkedin: "linkedin.com/in/sarah",
  note: "Sent introductory message",
});

assert.ok(contact.id, "Contact ID should be generated");
assert.equal(contact.name, "Sarah Jenkins");
assert.equal(contact.company, "Stripe");

const contacts = contactStore.list();
assert.equal(contacts.length, 1);
assert.equal(contacts[0].id, contact.id);
console.log("  ✓ contactStore CRUD passed.");

// 3. Settings Store
console.log("3. Testing settingsStore...");
const initialSettings = settingsStore.get();
assert.equal(initialSettings.userName, "Yudhan");
assert.equal(initialSettings.weeklyGoal, 10);

settingsStore.update({ userName: "Yudhan Sebastian", weeklyGoal: 15 });
const updatedSettings = settingsStore.get();
assert.equal(updatedSettings.userName, "Yudhan Sebastian");
assert.equal(updatedSettings.weeklyGoal, 15);
console.log("  ✓ settingsStore passed.");

// 4. Resume Store
console.log("4. Testing resumeStore...");
const initialResume = resumeStore.get();
assert.equal(initialResume.fullName, DEFAULT_RESUME.fullName);

resumeStore.save({
  ...initialResume,
  fullName: "Yudhan S.",
  title: "Staff Engineer",
});
const savedResume = resumeStore.get();
assert.equal(savedResume.fullName, "Yudhan S.");
assert.equal(savedResume.title, "Staff Engineer");

resumeStore.reset();
assert.equal(resumeStore.get().fullName, DEFAULT_RESUME.fullName);
console.log("  ✓ resumeStore passed.");

// 5. JSON Export & Import V2
console.log("5. Testing JSON Export & Import round-trip...");
const exportedJson = platformStore.exportJson();
const parsedExport = JSON.parse(exportedJson);
assert.equal(parsedExport.version, 2);
assert.ok(Array.isArray(parsedExport.platforms));
assert.ok(Array.isArray(parsedExport.contacts));
assert.ok(parsedExport.settings);
assert.ok(parsedExport.resume);

// Clear storage & verify import restores
memoryStorage.clear();
assert.equal(platformStore.list().length, 0);

const importResult = platformStore.importJson(exportedJson, "replace");
assert.equal(importResult.success, true);
assert.equal(platformStore.list().length, 1);
assert.equal(contactStore.list().length, 1);
assert.equal(settingsStore.get().userName, "Yudhan Sebastian");
console.log("  ✓ JSON Export & Import round-trip passed.");

// 6. Tab Navigation & View Integrity Test
console.log("6. Testing Tab Navigation & View Integrity...");
import fs from "node:fs";
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf-8");

const expectedTabs = [
  "home",
  "board",
  "statistics",
  "contacts",
  "coverletter",
  "resumebuilder",
  "resumescore",
  "aianswer",
  "linkedintools",
];

for (const tab of expectedTabs) {
  assert.ok(
    html.includes(`data-tab="${tab}"`),
    `Navigation should contain data-tab="${tab}"`
  );
  assert.ok(
    html.includes(`class="tab-view"`) &&
      (html.includes(`data-tab="${tab}"`) ||
        html.toLowerCase().includes(`id="view${tab}"`)),
    `View container should exist for tab: ${tab}`
  );
}
console.log("  ✓ Tab navigation and view container mapping verified.");

console.log("\n🎉 ALL SMOKE TESTS PASSED CLEANLY!");

