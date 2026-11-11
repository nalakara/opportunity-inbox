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
  buildDemoOpportunities,
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

// 10. Gemini API key removal + LinkedIn reframe (v2.9.0)
console.log("10. Testing Gemini key removal and LinkedIn reframe...");

// A legacy settings record carrying a Gemini key must be migrated on load:
// the key is deleted from storage and never appears in settings or export.
memoryStorage.set(
  "opportunity-inbox.settings.v1",
  JSON.stringify({ userName: "Yudhan Sebastian", weeklyGoal: 15, geminiApiKey: "AIzaSy-legacy-key" })
);
const migratedSettings = settingsStore.get();
assert.equal("geminiApiKey" in migratedSettings, false, "settings must not carry geminiApiKey");
assert.equal(migratedSettings.userName, "Yudhan Sebastian");
assert.equal(migratedSettings.weeklyGoal, 15);
assert.ok(
  !memoryStorage.get("opportunity-inbox.settings.v1").includes("geminiApiKey"),
  "migration must delete the stored key"
);

// Updating settings must not reintroduce the key.
settingsStore.update({ userName: "Yudhan Sebastian", weeklyGoal: 15 });
assert.equal("geminiApiKey" in settingsStore.get(), false);

// The exported JSON must not contain the key anywhere.
const exportedAfterMigration = platformStore.exportJson();
assert.ok(!exportedAfterMigration.includes("geminiApiKey"), "exported JSON must not contain geminiApiKey");

// Source checks: no Gemini references and no invented LinkedIn persona left.
const storageJs = fs.readFileSync(new URL("../src/storage.js", import.meta.url), "utf-8");
// storage.js may only read the key to delete it (one-time migration); it
// must never store it as a field.
assert.ok(!storageJs.includes("geminiApiKey:"), "storage.js must not store geminiApiKey as a field");
assert.ok(storageJs.includes("if (data.geminiApiKey !== undefined)"), "migration check must exist");
const appJs = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf-8");
assert.ok(!appJs.includes("geminiApiKey"), "app.js must not mention geminiApiKey");
assert.ok(!appJs.includes('"Sarah"'), "outreach default Sarah must be gone");
assert.ok(!appJs.includes('"Company"'), "outreach default Company must be gone");
assert.ok(!appJs.includes('"Software Engineer"'), "outreach default Software Engineer must be gone");
assert.ok(!appJs.includes("React, TypeScript, Scalable Architecture, Performance"), "headline default keywords must be gone");
assert.ok(!html.includes("Gemini"), "index.html must not mention Gemini");
assert.ok(!html.includes("settingsGeminiApiKeyInput"), "index.html must not keep the Gemini input");
assert.ok(html.includes("LinkedIn Outreach for Gigs"), "LinkedIn heading must be reframed");
assert.ok(html.includes('value="pitch"') && html.includes("Client pitch"), "pitch type must exist");
assert.ok(html.includes('value="followup"') && html.includes("Proposal follow-up"), "follow-up type must exist");
assert.ok(html.includes('value="enquiry"') && html.includes("Portal / AI-training gig enquiry"), "enquiry type must exist");
assert.ok(html.includes('value="thankyou"') && html.includes("Post-call thank-you"), "thank-you type must exist");
assert.ok(!html.includes("Direct Recruiter Outreach"), "recruiter outreach type must be gone");
assert.ok(html.includes("e.g. Upwork client, Mercor"), "Target Client placeholder must be freelance");
assert.ok(html.includes("e.g. Logo refresh for F&B brands"), "Service / Offer placeholder must be freelance");
assert.ok(html.includes("e.g. Logo design, hospitality & F&B, 13 yrs"), "headline placeholder must be freelance");
console.log("  ✓ Gemini key removed and LinkedIn reframed for freelance gigs.");

// 11. Demo dataset (v2.9.1)
console.log("11. Testing demo dataset...");

// Mirror of the metric definitions in src/app.js (countPitchedThisWeek,
// hasReachedStage, formatConversion) so the test asserts the demo data
// produces the target numbers under the app's own rules.
function testIsDateThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek && d <= now;
}
function testCountPitchedThisWeek(platforms) {
  return platforms.filter((p) =>
    (p.statusHistory || []).some(
      (entry) => entry.status !== STATUS_ENUM.WISHLIST && testIsDateThisWeek(entry.at)
    )
  ).length;
}
function testHasReachedStage(platform, stage) {
  return (platform.statusHistory || []).some((entry) => entry.status === stage);
}
function testFormatConversion(reached, entered) {
  if (entered === 0) return "n/a";
  return `${Math.round((reached / entered) * 100)}%`;
}

const demo = buildDemoOpportunities();
assert.equal(demo.length, 13, "demo must have 13 records");

const demoStageCounts = {};
for (const item of demo) demoStageCounts[item.status] = (demoStageCounts[item.status] || 0) + 1;
assert.deepEqual(demoStageCounts, {
  WISHLIST: 2, APPLIED: 2, INTERVIEWING: 3, OFFER: 3, REJECTED: 1, GHOSTED: 1, FOLLOW_UP: 1,
}, "demo stage counts must match the optimal scenario");

assert.equal(new Set(demo.map((d) => d.id)).size, 13, "demo ids must be unique");
for (const item of demo) {
  assert.equal(item.demo, true, "every demo record carries demo: true");
  assert.ok(Array.isArray(item.statusHistory) && item.statusHistory.length > 0, "every demo record has history");
  assert.equal(
    item.statusHistory[item.statusHistory.length - 1].status,
    item.status,
    "last history entry must be the current stage"
  );
  for (const entry of item.statusHistory) {
    assert.ok(STATUS_ENUM[entry.status], "history status must be a valid enum");
    assert.ok(entry.at, "history entry must have a timestamp");
  }
  for (let i = 1; i < item.statusHistory.length; i++) {
    assert.ok(
      new Date(item.statusHistory[i].at) >= new Date(item.statusHistory[i - 1].at),
      "history must be chronological"
    );
  }
  assert.ok(item.createdAt && item.updatedAt, "demo record needs createdAt/updatedAt");
}

// No personal identifiers in the demo data.
const demoJson = JSON.stringify(demo);
for (const forbidden of ["Odin", "12499", "350856347375", "Legian"]) {
  assert.ok(!demoJson.includes(forbidden), `demo data must not contain ${forbidden}`);
}

// Target metrics under the app's own definitions.
assert.equal(testCountPitchedThisWeek(demo), 7, "demo gauge must read 7 pitches sent this week");
const demoEverPitched = demo.filter((p) => testHasReachedStage(p, STATUS_ENUM.APPLIED)).length;
const demoEverDiskusi = demo.filter((p) => testHasReachedStage(p, STATUS_ENUM.INTERVIEWING)).length;
const demoEverDeal = demo.filter((p) => testHasReachedStage(p, STATUS_ENUM.OFFER)).length;
assert.equal(demoEverPitched, 11);
assert.equal(demoEverDiskusi, 5);
assert.equal(demoEverDeal, 3);
assert.equal(testFormatConversion(demoEverDiskusi, demoEverPitched), "45%");
assert.equal(testFormatConversion(demoEverDeal, demoEverDiskusi), "60%");
assert.equal(testFormatConversion(demoEverDeal, demoEverPitched), "27%");

// Exactly one Deal record skips Diskusi in its history.
const dealsSkippingDiskusi = demo.filter(
  (p) => p.status === STATUS_ENUM.OFFER && !testHasReachedStage(p, STATUS_ENUM.INTERVIEWING)
);
assert.equal(dealsSkippingDiskusi.length, 1, "exactly one Deal must skip Diskusi");

// Store behaviour: load replaces, is idempotent, clear removes only demo.
memoryStorage.clear();
seedPortalsIfEmpty();
const manualBefore = platformStore.create({ name: "Manual Client", category: "Remote", status: "WISHLIST" });
const portalsBefore = portalStore.list().length;
const settingsBefore = settingsStore.get();

const loadedDemo = platformStore.loadDemoData();
assert.equal(loadedDemo.length, 13);
assert.equal(platformStore.list().length, 13);
assert.ok(platformStore.list().every((p) => p.demo === true), "all loaded records are demo");
assert.equal(platformStore.get(manualBefore.id), null, "loading demo replaces existing opportunities");
assert.equal(portalStore.list().length, portalsBefore, "loading demo must not touch portals");
assert.deepEqual(settingsStore.get(), settingsBefore, "loading demo must not touch settings");
assert.equal(platformStore.hasDemoData(), true);

platformStore.loadDemoData();
assert.equal(platformStore.list().length, 13, "loading demo twice must not duplicate");
assert.equal(new Set(platformStore.list().map((p) => p.id)).size, 13);

const manualAfter = platformStore.create({ name: "Manual Client 2", category: "Remote", status: "WISHLIST" });
assert.equal(platformStore.list().length, 14);
assert.equal(platformStore.clearDemoData(), 13, "clear must remove exactly the demo records");
assert.equal(platformStore.list().length, 1, "clear leaves other opportunities untouched");
assert.equal(platformStore.list()[0].id, manualAfter.id);
assert.equal(platformStore.hasDemoData(), false);

// Demo flag survives an export/import round-trip, so demo records stay
// identifiable (and clearable) after a backup restore.
platformStore.loadDemoData();
const demoExport = platformStore.exportJson();
memoryStorage.clear();
platformStore.importJson(demoExport, "replace");
assert.equal(platformStore.list().length, 13);
assert.ok(platformStore.list().every((p) => p.demo === true), "demo flag must survive export/import");
assert.equal(platformStore.clearDemoData(), 13);
assert.equal(platformStore.list().length, 0);

// Source checks: the Settings UI and wiring exist.
assert.ok(html.includes('id="demoBanner"'), "demo banner element must exist");
assert.ok(html.includes('id="loadDemoBtn"') && html.includes("Load demo data"), "Load demo data button must exist");
assert.ok(html.includes('id="clearDemoBtn"') && html.includes("Clear demo data"), "Clear demo data button must exist");
assert.ok(appJs.includes("loadDemoData") && appJs.includes("clearDemoData"), "app.js must wire demo load/clear");
assert.ok(storageJs.includes("buildDemoOpportunities"), "storage.js must define the demo builder");
assert.ok(storageJs.includes("item.demo === true"), "storage.js must preserve the demo flag on import");
console.log("  ✓ demo dataset (13 records, target metrics, idempotent load, exact clear) passed.");

console.log("\n🎉 ALL SMOKE TESTS PASSED CLEANLY!");

