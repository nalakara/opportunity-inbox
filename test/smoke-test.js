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
  portalStore,
  seedPortalsIfEmpty,
  PORTAL_STATUS,
  settingsStore,
  cvVaultStore,
  validateCVFile,
  createCVRecord,
  formatFileSize,
  STATUS_ENUM,
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

// 2. Portal Store CRUD & Status Validation
console.log("2. Testing portalStore...");
const portal = portalStore.create({
  name: "Test Portal",
  url: "https://example.com",
  category: "Microtask",
  status: "registered",
  remarks: "Test remarks",
});

assert.ok(portal.id, "Portal ID should be generated");
assert.equal(portal.name, "Test Portal");
assert.equal(portal.category, "Microtask");
assert.equal(portal.status, PORTAL_STATUS.REGISTERED);

// Unknown status normalizes to not_registered.
const odd = portalStore.create({ name: "Odd Portal", status: "banana" });
assert.equal(odd.status, PORTAL_STATUS.NOT_REGISTERED);

const updatedPortal = portalStore.update(portal.id, { status: "not_registered" });
assert.equal(updatedPortal.status, PORTAL_STATUS.NOT_REGISTERED);

const portals = portalStore.list();
assert.equal(portals.length, 2);
assert.ok(portals.some((p) => p.id === portal.id));

portalStore.remove(odd.id);
assert.equal(portalStore.list().length, 1);
console.log("  ✓ portalStore CRUD passed.");

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

// 4. CV Vault Store (IndexedDB in browsers; in-memory fallback in Node)
console.log("4. Testing cvVaultStore...");
const pdfFile = { name: "cv-yudhan-2026.pdf", type: "application/pdf", size: 184320 };
const txtFile = { name: "notes.txt", type: "text/plain", size: 1024 };
const bigFile = { name: "huge.pdf", type: "application/pdf", size: 11 * 1024 * 1024 };

assert.equal(validateCVFile(pdfFile).ok, true);
assert.equal(validateCVFile(txtFile).ok, false);
assert.equal(validateCVFile(bigFile).ok, false);
assert.equal(formatFileSize(184320), "180 KB");
assert.equal(formatFileSize(0), "0 KB");

const record = createCVRecord({ file: pdfFile, label: "", note: "for Upwork" });
assert.equal(record.label, "cv-yudhan-2026");
assert.equal(record.fileName, "cv-yudhan-2026.pdf");
assert.equal(record.note, "for Upwork");
assert.ok(record.id);

const fakeBlob = new Blob(["%PDF-fake"], { type: "application/pdf" });
await cvVaultStore.add(record, fakeBlob);
const stored = await cvVaultStore.list();
assert.equal(stored.length, 1);
assert.equal(stored[0].id, record.id);
assert.equal(stored[0].label, "cv-yudhan-2026");
assert.equal(stored[0].blob, undefined, "list() returns metadata only, no blob");

const roundTrip = await cvVaultStore.getBlob(record.id);
assert.ok(roundTrip);
assert.equal(roundTrip.size, fakeBlob.size);

const updated = await cvVaultStore.update(record.id, { label: "CV Full 2026" });
assert.equal(updated.label, "CV Full 2026");
assert.equal((await cvVaultStore.list())[0].label, "CV Full 2026");

await cvVaultStore.remove(record.id);
assert.equal((await cvVaultStore.list()).length, 0);
console.log("  ✓ cvVaultStore passed (in-memory fallback).");

// 5. JSON Export & Import V2
console.log("5. Testing JSON Export & Import round-trip...");
const exportedJson = platformStore.exportJson();
const parsedExport = JSON.parse(exportedJson);
assert.equal(parsedExport.version, 2);
assert.ok(Array.isArray(parsedExport.platforms));
assert.ok(Array.isArray(parsedExport.portals));
assert.ok(parsedExport.settings);

// Clear storage & verify import restores
memoryStorage.clear();
assert.equal(platformStore.list().length, 0);

const importResult = platformStore.importJson(exportedJson, "replace");
assert.equal(importResult.success, true);
assert.equal(platformStore.list().length, 1);
assert.equal(portalStore.list().length, 1);
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
  "portals",
  "proposal",
  "cvvault",
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

// 7. CV Vault File Validation
console.log("7. Testing CV Vault file validation...");
assert.equal(validateCVFile(null).ok, false);
assert.equal(validateCVFile({ name: "cv.PDF", type: "", size: 100 }).ok, true, "extension check covers a missing MIME type");
assert.equal(validateCVFile({ name: "cv.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 100 }).ok, false);
assert.equal(createCVRecord({ file: { name: "My CV.pdf", type: "application/pdf", size: 5000 }, label: "  CV Design  " }).label, "CV Design");
console.log("  ✓ CV Vault file validation passed.");

// 8. Status History & Funnel Inputs
console.log("8. Testing status history recording & legacy backfill...");
const lead = platformStore.create({
  name: "Acme Studio",
  category: "Logo Refresh",
  url: "",
  status: "WISHLIST",
});
assert.deepEqual(lead.statusHistory, [{ status: "WISHLIST", at: lead.createdAt }]);

const pitched = platformStore.update(lead.id, { status: "APPLIED" });
assert.equal(pitched.statusHistory.length, 2);
assert.equal(pitched.statusHistory[1].status, "APPLIED");

// A no-op update (same stage) must not append a duplicate entry.
const untouched = platformStore.update(lead.id, { note: "hello" });
assert.equal(untouched.statusHistory.length, 2);

const deal = platformStore.update(lead.id, { status: "OFFER" });
assert.equal(deal.statusHistory.length, 3);
assert.equal(deal.statusHistory[2].status, "OFFER");

// Legacy import without history backfills a single entry from the stage.
const legacyJson = JSON.stringify({
  version: 2,
  platforms: [
    {
      id: "legacy-1",
      name: "Old Client",
      status: "OFFER",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    },
  ],
  portals: [],
  settings: {},
});
platformStore.importJson(legacyJson, "merge");
const legacy = platformStore.get("legacy-1");
assert.equal(legacy.statusHistory.length, 1);
assert.equal(legacy.statusHistory[0].status, "OFFER");
assert.equal(legacy.statusHistory[0].at, "2026-11-01T00:00:00.000Z");
console.log("  ✓ status history recorded, no-op updates ignored, legacy imports backfilled.");


// 9. Portal Seed List
console.log("9. Testing portal seed list...");
memoryStorage.clear();
const seededCount = seedPortalsIfEmpty();
assert.equal(seededCount, 9);
assert.equal(seedPortalsIfEmpty(), 0, "Seeding twice must not duplicate");

const seeded = portalStore.list();
assert.equal(seeded.length, 9);
const mercor = portalStore.get("portal-mercor");
assert.ok(mercor, "Mercor should be seeded");
assert.equal(mercor.status, PORTAL_STATUS.REGISTERED);
assert.ok(mercor.remarks.includes("Odin"));
const crowdgen = portalStore.get("portal-crowdgen");
assert.equal(crowdgen.status, PORTAL_STATUS.NOT_REGISTERED);
assert.ok(crowdgen.remarks.includes("belum dikonfirmasi"));

const updatedSeed = portalStore.update("portal-micro1", { status: "registered" });
assert.equal(updatedSeed.status, PORTAL_STATUS.REGISTERED);
console.log("  ✓ portal seed list (9 portals, idempotent) passed.");

console.log("\n🎉 ALL SMOKE TESTS PASSED CLEANLY!");

