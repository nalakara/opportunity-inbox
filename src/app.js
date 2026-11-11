import { platformStore, settingsStore, portalStore, seedPortalsIfEmpty, PORTAL_STATUS, PORTAL_STATUS_LABELS, cvVaultStore, validateCVFile, createCVRecord, formatFileSize, STATUS_ENUM, STATUS_LABELS } from "./storage.js";

const STAGES_ORDER = [
  STATUS_ENUM.WISHLIST,
  STATUS_ENUM.APPLIED,
  STATUS_ENUM.INTERVIEWING,
  STATUS_ENUM.OFFER,
  STATUS_ENUM.REJECTED,
  STATUS_ENUM.GHOSTED,
  STATUS_ENUM.FOLLOW_UP,
];

const elements = {
  // Navigation & Tabs
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  sidebarBackdrop: document.querySelector("#sidebarBackdrop"),
  navLinks: document.querySelectorAll(".nav-link[data-tab]"),
  mobileNavLinks: document.querySelectorAll(".mobile-nav-link[data-tab]"),
  tabViews: document.querySelectorAll(".tab-view"),
  pageTitle: document.querySelector("#pageTitle"),

  // User Profile & Settings
  userProfileCard: document.querySelector("#userProfileCard"),
  userAvatar: document.querySelector("#userAvatar"),
  sidebarUserName: document.querySelector("#sidebarUserName"),
  sidebarUserGoal: document.querySelector("#sidebarUserGoal"),
  openSettingsBtn: document.querySelector("#openSettingsBtn"),
  homeGreeting: document.querySelector("#homeGreeting"),
  homeGoalPill: document.querySelector("#homeGoalPill"),
  settingsDialog: document.querySelector("#settingsDialog"),
  settingsForm: document.querySelector("#settingsForm"),
  closeSettingsDialogButton: document.querySelector("#closeSettingsDialogButton"),
  cancelSettingsButton: document.querySelector("#cancelSettingsButton"),
  settingsUserNameInput: document.querySelector("#settingsUserNameInput"),
  settingsWeeklyGoalInput: document.querySelector("#settingsWeeklyGoalInput"),
  demoBanner: document.querySelector("#demoBanner"),
  loadDemoBtn: document.querySelector("#loadDemoBtn"),
  clearDemoBtn: document.querySelector("#clearDemoBtn"),

  // Toolbar & Search & View Switcher
  searchInput: document.querySelector("#searchInput"),
  sortBySelect: document.querySelector("#sortBySelect"),
  captureButton: document.querySelector("#captureButton"),
  viewCardsBtn: document.querySelector("#viewCardsBtn"),
  viewListBtn: document.querySelector("#viewListBtn"),

  // Dialog Elements
  captureDialog: document.querySelector("#captureDialog"),
  captureForm: document.querySelector("#captureForm"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelButton: document.querySelector("#cancelButton"),
  dialogTitle: document.querySelector("#dialogTitle"),
  editingId: document.querySelector("#editingId"),
  nameInput: document.querySelector("#nameInput"),
  categoryInput: document.querySelector("#categoryInput"),
  urlInput: document.querySelector("#urlInput"),
  statusSelectInput: document.querySelector("#statusSelectInput"),
  followUpDateInput: document.querySelector("#followUpDateInput"),
  noteInput: document.querySelector("#noteInput"),
  formError: document.querySelector("#formError"),

  // Portals Elements
  viewPortals: document.querySelector("#viewPortals"),
  portalSearchInput: document.querySelector("#portalSearchInput"),
  addPortalBtn: document.querySelector("#addPortalBtn"),
  portalsGrid: document.querySelector("#portalsGrid"),
  portalDialog: document.querySelector("#portalDialog"),
  portalForm: document.querySelector("#portalForm"),
  closePortalDialogButton: document.querySelector("#closePortalDialogButton"),
  cancelPortalButton: document.querySelector("#cancelPortalButton"),
  portalDialogTitle: document.querySelector("#portalDialogTitle"),
  portalEditingId: document.querySelector("#portalEditingId"),
  portalNameInput: document.querySelector("#portalNameInput"),
  portalUrlInput: document.querySelector("#portalUrlInput"),
  portalCategoryInput: document.querySelector("#portalCategoryInput"),
  portalStatusInput: document.querySelector("#portalStatusInput"),
  portalRemarksInput: document.querySelector("#portalRemarksInput"),
  portalFormError: document.querySelector("#portalFormError"),

  // Board Containers
  boardGrid: document.querySelector("#boardGrid"),
  listBoard: document.querySelector("#listBoard"),

  // Home View Containers
  homeWeeklyAppliedCount: document.querySelector("#homeWeeklyAppliedCount"),
  homePipelineSummary: document.querySelector("#homePipelineSummary"),
  gaugeProgressPath: document.querySelector("#gaugeProgressPath"),

  // Statistics View Containers
  kpiTotalApplications: document.querySelector("#kpiTotalApplications"),
  kpiThisWeek: document.querySelector("#kpiThisWeek"),
  kpiThisMonth: document.querySelector("#kpiThisMonth"),
  kpiInterviewConversion: document.querySelector("#kpiInterviewConversion"),
  statsGoalProgressText: document.querySelector("#statsGoalProgressText"),
  conversionAnalysisList: document.querySelector("#conversionAnalysisList"),
  pipelineBreakdownList: document.querySelector("#pipelineBreakdownList"),
  statsApplyTrigger: document.querySelector("#statsApplyTrigger"),
  statsAddMoreTrigger: document.querySelector("#statsAddMoreTrigger"),

  exportBtn: document.querySelector("#exportBtn"),
  importBtn: document.querySelector("#importBtn"),
  importFileInput: document.querySelector("#importFileInput"),

  // Install PWA
  installButton: document.querySelector("#installButton"),

  // Proposal Drafter Elements
  viewProposal: document.querySelector("#viewProposal"),
  clJobSelect: document.querySelector("#clJobSelect"),
  clNameInput: document.querySelector("#clNameInput"),
  clRecipientInput: document.querySelector("#clRecipientInput"),
  clCompanyInput: document.querySelector("#clCompanyInput"),
  clRoleInput: document.querySelector("#clRoleInput"),
  clToneSelect: document.querySelector("#clToneSelect"),
  clHighlightsInput: document.querySelector("#clHighlightsInput"),
  clMotivationInput: document.querySelector("#clMotivationInput"),
  clGenerateBtn: document.querySelector("#clGenerateBtn"),
  clStatsText: document.querySelector("#clStatsText"),
  clCopyBtn: document.querySelector("#clCopyBtn"),
  clDownloadBtn: document.querySelector("#clDownloadBtn"),
  clPrintBtn: document.querySelector("#clPrintBtn"),
  clOutputTextarea: document.querySelector("#clOutputTextarea"),

  // CV Vault Elements
  viewCvvault: document.querySelector("#viewCvvault"),
  cvUploadBtn: document.querySelector("#cvUploadBtn"),
  cvFileInput: document.querySelector("#cvFileInput"),
  cvDropzone: document.querySelector("#cvDropzone"),
  cvGrid: document.querySelector("#cvGrid"),
  cvEmptyState: document.querySelector("#cvEmptyState"),
  cvEditDialog: document.querySelector("#cvEditDialog"),
  cvEditForm: document.querySelector("#cvEditForm"),
  closeCvEditDialogButton: document.querySelector("#closeCvEditDialogButton"),
  cancelCvEditButton: document.querySelector("#cancelCvEditButton"),
  saveCvEditButton: document.querySelector("#saveCvEditButton"),
  cvLabelInput: document.querySelector("#cvLabelInput"),
  cvNoteInput: document.querySelector("#cvNoteInput"),
  cvEditFileMeta: document.querySelector("#cvEditFileMeta"),

  // LinkedIn Tools Elements
  viewLinkedinTools: document.querySelector("#viewLinkedinTools"),
  liOutreachType: document.querySelector("#liOutreachType"),
  liRecipientName: document.querySelector("#liRecipientName"),
  liCompanyName: document.querySelector("#liCompanyName"),
  liTargetRole: document.querySelector("#liTargetRole"),
  liGenerateOutreachBtn: document.querySelector("#liGenerateOutreachBtn"),
  liCopyOutreachBtn: document.querySelector("#liCopyOutreachBtn"),
  liOutreachOutput: document.querySelector("#liOutreachOutput"),
  liHeadlineKeywords: document.querySelector("#liHeadlineKeywords"),
  liGenerateHeadlineBtn: document.querySelector("#liGenerateHeadlineBtn"),
  liHeadlineResults: document.querySelector("#liHeadlineResults"),
  liFormatInput: document.querySelector("#liFormatInput"),
  liBoldBtn: document.querySelector("#liBoldBtn"),
  liItalicBtn: document.querySelector("#liItalicBtn"),
  liMonoBtn: document.querySelector("#liMonoBtn"),
  liCopyFormatBtn: document.querySelector("#liCopyFormatBtn"),
  liFormatOutput: document.querySelector("#liFormatOutput"),
};

let activeTab = "board";
let boardViewMode = "cards"; // 'cards' | 'list'
let searchQuery = "";
let portalSearchQuery = "";
let sortBy = "updatedDesc";
let draggedCardId = null;

function normalizeUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isDateThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  
  // Start of week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return d >= startOfWeek && d <= now;
}

function isDateThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// One definition of "pitches sent this week": an opportunity that moved
// past Lead this week. Movement is read from statusHistory, never from
// createdAt or updatedAt, so editing a note on an old opportunity does
// not inflate the count. Home and Statistics must agree on it.
function countPitchedThisWeek(platforms) {
  return platforms.filter((p) =>
    (p.statusHistory || []).some(
      (entry) => entry.status !== STATUS_ENUM.WISHLIST && isDateThisWeek(entry.at)
    )
  ).length;
}

// True when the opportunity has ever sat in the given stage. The funnel is
// measured from recorded history, never inferred from the current stage.
function hasReachedStage(platform, stage) {
  return (platform.statusHistory || []).some((entry) => entry.status === stage);
}

// A conversion rate, or "n/a" when no opportunity ever entered the stage.
function formatConversion(reached, entered) {
  if (entered === 0) return "n/a";
  return `${Math.round((reached / entered) * 100)}%`;
}

function getFollowUpBadge(followUpDate, status) {
  if (!followUpDate) return "";
  if (status === STATUS_ENUM.OFFER || status === STATUS_ENUM.REJECTED || status === STATUS_ENUM.GHOSTED) {
    return "";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = followUpDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const formattedDate = targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (diffDays < 0) {
    return `<span class="follow-up-badge overdue" title="Follow-up was scheduled for ${followUpDate}">⚠️ Overdue (${formattedDate})</span>`;
  } else if (diffDays === 0) {
    return `<span class="follow-up-badge due-today" title="Follow-up due today!">⏰ Due Today</span>`;
  } else {
    return `<span class="follow-up-badge upcoming" title="Follow-up on ${followUpDate}">📅 Follow-up: ${formattedDate}</span>`;
  }
}

function getProcessedPlatforms() {
  let platforms = platformStore.list();

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    platforms = platforms.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.note && p.note.toLowerCase().includes(q))
    );
  }

  if (sortBy === "nameAsc") {
    platforms.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "category") {
    platforms.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
  } else {
    platforms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return platforms;
}

function renderCardsBoard() {
  const platforms = getProcessedPlatforms();
  elements.boardGrid.innerHTML = "";

  STAGES_ORDER.forEach((stage) => {
    const stageItems = platforms.filter((p) => p.status === stage);
    const stageLabel = STATUS_LABELS[stage] || stage;

    const col = document.createElement("div");
    col.className = "stage-card";
    col.dataset.stage = stage;

    const header = document.createElement("div");
    header.className = "stage-card-header";
    header.innerHTML = `
      <div class="stage-card-title">
        <span>${stageLabel}</span>
      </div>
      <span class="stage-card-count">${stageItems.length}</span>
    `;

    const cardsContainer = document.createElement("div");
    cardsContainer.className = "stage-cards";
    cardsContainer.dataset.stage = stage;

    // Drag-over visual feedback on drop target
    cardsContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      cardsContainer.classList.add("drag-over");
    });

    cardsContainer.addEventListener("dragleave", (e) => {
      if (!cardsContainer.contains(e.relatedTarget)) {
        cardsContainer.classList.remove("drag-over");
      }
    });

    cardsContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      cardsContainer.classList.remove("drag-over");
      const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
      if (cardId) {
        const currentItem = platformStore.get(cardId);
        if (currentItem && currentItem.status !== stage) {
          platformStore.update(cardId, { status: stage });
          render();
        }
      }
    });

    if (stageItems.length === 0) {
      cardsContainer.innerHTML = `
        <div style="padding: 12px; color: #64748B; font-size: 0.8rem; text-align: center; font-style: italic;">
          Drop opportunities here or + Add
        </div>
      `;
    } else {
      stageItems.forEach((item) => {
        const url = normalizeUrl(item.url);
        const followUpHtml = getFollowUpBadge(item.followUpDate, item.status);
        const card = document.createElement("div");
        card.className = "opportunity-card";
        card.dataset.id = item.id;
        card.draggable = true;

        // Drag start and end events
        card.addEventListener("dragstart", (e) => {
          draggedCardId = item.id;
          card.classList.add("is-dragging");
          e.dataTransfer.setData("text/plain", item.id);
          e.dataTransfer.effectAllowed = "move";
        });

        card.addEventListener("dragend", () => {
          card.classList.remove("is-dragging");
          draggedCardId = null;
          document.querySelectorAll(".stage-cards").forEach((c) => c.classList.remove("drag-over"));
        });

        card.innerHTML = `
          <div class="opportunity-card-title">${item.name}</div>
          <div class="opportunity-card-meta">${item.category ? `📍 ${item.category}` : "Uncategorized"}</div>
          ${followUpHtml ? `<div>${followUpHtml}</div>` : ""}
          <div class="opportunity-card-footer">
            ${
              url
                ? `<a href="${url}" target="_blank" rel="noopener" class="text-link-btn" style="font-size:0.78rem;">Open ↗</a>`
                : `<span></span>`
            }
            <div>
              <button class="action-row-btn edit-job-btn" data-id="${item.id}" type="button">✏️</button>
              <button class="action-row-btn delete-job-btn" data-id="${item.id}" type="button">🗑️</button>
            </div>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }

    const addBtn = document.createElement("button");
    addBtn.className = "stage-card-add-btn stage-add-btn";
    addBtn.type = "button";
    addBtn.dataset.stage = stage;
    addBtn.textContent = "+ Add opportunity";

    col.appendChild(header);
    col.appendChild(cardsContainer);
    col.appendChild(addBtn);
    elements.boardGrid.appendChild(col);
  });
}

function renderListBoard() {
  const platforms = getProcessedPlatforms();
  elements.listBoard.innerHTML = "";

  STAGES_ORDER.forEach((stage) => {
    const stageItems = platforms.filter((p) => p.status === stage);
    const stageLabel = STATUS_LABELS[stage] || stage;

    const accordion = document.createElement("div");
    accordion.className = "stage-accordion";
    accordion.dataset.stage = stage;

    const header = document.createElement("div");
    header.className = "stage-header";
    header.innerHTML = `
      <div class="stage-header-left">
        <span class="stage-toggle-icon">▼</span>
        <span class="stage-title">${stageLabel}</span>
        <span class="stage-badge">${stageItems.length}</span>
      </div>
      <button class="stage-add-btn" type="button" data-stage="${stage}">+ Add opportunity</button>
    `;

    const body = document.createElement("div");
    body.className = "stage-body";

    if (stageItems.length === 0) {
      body.innerHTML = `
        <div style="padding: 16px 20px; color: #64748B; font-size: 0.85rem; font-style: italic;">
          No opportunities in ${stageLabel} stage.
        </div>
      `;
    } else {
      const table = document.createElement("table");
      table.className = "stage-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Client / Project</th>
            <th>Location / Tag</th>
            <th>Added Date</th>
            <th>Follow-up</th>
            <th>URL</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${stageItems
            .map((item) => {
              const url = normalizeUrl(item.url);
              const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-";
              const followUpBadge = getFollowUpBadge(item.followUpDate, item.status);
              return `
                <tr data-id="${item.id}">
                  <td>
                    <div style="font-weight:700;">${item.name}</div>
                  </td>
                  <td><span style="color:var(--text-light); font-size:0.85rem;">${item.category || "-"}</span></td>
                  <td><span style="color:var(--text-light); font-size:0.85rem;">${dateStr}</span></td>
                  <td>${followUpBadge || `<span style="color:var(--text-light); font-size:0.82rem;">-</span>`}</td>
                  <td>
                    ${
                      url
                        ? `<a href="${url}" target="_blank" rel="noopener" class="text-link-btn" style="font-size:0.82rem;">Link ↗</a>`
                        : `<span style="color:var(--text-light); font-size:0.82rem;">-</span>`
                    }
                  </td>
                  <td style="text-align: right;">
                    <button class="action-row-btn edit-job-btn" data-id="${item.id}" type="button">✏️ Edit</button>
                    <button class="action-row-btn delete-job-btn" data-id="${item.id}" type="button">🗑️ Delete</button>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      `;
      body.appendChild(table);
    }

    accordion.appendChild(header);
    accordion.appendChild(body);
    elements.listBoard.appendChild(accordion);
  });
}

function renderBoard() {
  if (boardViewMode === "cards") {
    elements.boardGrid.style.display = "grid";
    elements.listBoard.style.display = "none";
    elements.viewCardsBtn.classList.add("is-active");
    elements.viewListBtn.classList.remove("is-active");
    renderCardsBoard();
  } else {
    elements.boardGrid.style.display = "none";
    elements.listBoard.style.display = "flex";
    elements.viewCardsBtn.classList.remove("is-active");
    elements.viewListBtn.classList.add("is-active");
    renderListBoard();
  }
}

function renderUserProfile() {
  const settings = settingsStore.get();
  const name = settings.userName || "Yudhan";
  const initial = name.charAt(0).toUpperCase() || "Y";
  const goal = settings.weeklyGoal || 10;

  if (elements.userAvatar) elements.userAvatar.textContent = initial;
  if (elements.sidebarUserName) elements.sidebarUserName.textContent = name;
  if (elements.sidebarUserGoal) elements.sidebarUserGoal.textContent = `Goal: ${goal}/wk`;
  if (elements.homeGreeting) elements.homeGreeting.textContent = `Good morning, ${name} 👋`;
  if (elements.homeGoalPill) elements.homeGoalPill.textContent = `Weekly pitch goal: ${goal}`;
}

function renderHome() {
  const allPlatforms = platformStore.list();
  const settings = settingsStore.get();
  const weeklyGoal = settings.weeklyGoal || 10;
  
  // Weekly count: pitches sent/progressed this week (shared definition, see countPitchedThisWeek)
  const weeklyAppliedCount = countPitchedThisWeek(allPlatforms);

  elements.homeWeeklyAppliedCount.textContent = weeklyAppliedCount;
  const progressPercent = Math.min(100, (weeklyAppliedCount / weeklyGoal) * 100);
  const strokeOffset = 126 - (126 * progressPercent) / 100;
  if (elements.gaugeProgressPath) {
    elements.gaugeProgressPath.style.strokeDashoffset = strokeOffset;
  }

  if (elements.homePipelineSummary) {
    elements.homePipelineSummary.innerHTML = STAGES_ORDER.map((stage) => {
      const count = allPlatforms.filter((p) => p.status === stage).length;
      const pct = allPlatforms.length > 0 ? (count / allPlatforms.length) * 100 : 0;
      return `
        <div class="pipeline-bar-item">
          <span class="pipeline-bar-label">${STATUS_LABELS[stage]}</span>
          <div class="pipeline-bar-track">
            <div class="pipeline-bar-fill" style="width: ${pct}%; background: var(--status-${stage.toLowerCase().replace("_", "")});"></div>
          </div>
          <span class="pipeline-bar-count">${count}</span>
        </div>
      `;
    }).join("");
  }
}

function renderStatistics() {
  const all = platformStore.list();
  const settings = settingsStore.get();
  const weeklyGoal = settings.weeklyGoal || 10;

  const total = all.length;

  // "Pitches sent this week" uses the single shared definition: an
  // opportunity that moved past Lead this week (see countPitchedThisWeek).
  const weeklyPitchedCount = countPitchedThisWeek(all);
  const thisMonthCount = all.filter((p) => isDateThisMonth(p.createdAt)).length;

  // Funnel counts come from recorded history: only stages the opportunity
  // actually sat in count as reached. A Deal that skipped Diskusi does not
  // count as a Diskusi conversion.
  const everPitched = all.filter((p) => hasReachedStage(p, STATUS_ENUM.APPLIED)).length;
  const everDiskusi = all.filter((p) => hasReachedStage(p, STATUS_ENUM.INTERVIEWING)).length;
  const everDeal = all.filter((p) => hasReachedStage(p, STATUS_ENUM.OFFER)).length;
  const conversionPct = formatConversion(everDiskusi, everPitched);

  elements.kpiTotalApplications.textContent = total;
  elements.kpiThisWeek.textContent = weeklyPitchedCount;
  elements.kpiThisMonth.textContent = thisMonthCount;
  elements.kpiInterviewConversion.textContent = conversionPct;

  const remainingWeekly = Math.max(0, weeklyGoal - weeklyPitchedCount);
  elements.statsGoalProgressText.textContent =
    remainingWeekly > 0
      ? `You need ${remainingWeekly} more pitches to reach your weekly pitch goal of ${weeklyGoal}.`
      : `Awesome! You have achieved your weekly pitch goal of ${weeklyGoal} pitches!`;

  if (elements.conversionAnalysisList) {
    elements.conversionAnalysisList.innerHTML = `
      <div class="breakdown-row"><span>Pitched → Diskusi</span><span>${formatConversion(everDiskusi, everPitched)}</span></div>
      <div class="breakdown-row"><span>Diskusi → Deal</span><span>${formatConversion(everDeal, everDiskusi)}</span></div>
      <div class="breakdown-row"><span>Overall Win Rate</span><span>${formatConversion(everDeal, everPitched)}</span></div>
    `;
  }

  if (elements.pipelineBreakdownList) {
    elements.pipelineBreakdownList.innerHTML = STAGES_ORDER.map((stage) => {
      const count = all.filter((p) => p.status === stage).length;
      return `<div class="breakdown-row"><span>${STATUS_LABELS[stage]}</span><span>${count}</span></div>`;
    }).join("");
  }
}

function renderPortals() {
  let portals = portalStore.list();
  if (portalSearchQuery) {
    const q = portalSearchQuery.toLowerCase();
    portals = portals.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.remarks && p.remarks.toLowerCase().includes(q)) ||
      PORTAL_STATUS_LABELS[p.status].toLowerCase().includes(q)
    );
  }

  if (!elements.portalsGrid) return;
  elements.portalsGrid.innerHTML = "";

  if (portals.length === 0) {
    elements.portalsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; color: var(--text-muted); background: var(--surface-card); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
        <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">No portals found</p>
        <p style="font-size: 0.88rem; margin-bottom: 18px;">Add the freelance gig portals you use, and note whether you are registered on each one.</p>
        <button class="primary-btn sm" id="emptyAddPortalBtn" type="button">+ Add First Portal</button>
      </div>
    `;
    document.querySelector("#emptyAddPortalBtn")?.addEventListener("click", () => openPortalDialog());
    return;
  }

  const registeredCount = portals.filter((p) => p.status === PORTAL_STATUS.REGISTERED).length;
  const summary = document.createElement("div");
  summary.style.cssText = "grid-column: 1 / -1; font-size: 0.85rem; color: var(--text-muted);";
  summary.textContent = `${portals.length} portal${portals.length === 1 ? "" : "s"} · ${registeredCount} registered · ${portals.length - registeredCount} not registered`;
  elements.portalsGrid.appendChild(summary);

  portals.forEach((portal) => {
    const card = document.createElement("div");
    card.className = "portal-card";
    card.dataset.id = portal.id;

    const isRegistered = portal.status === PORTAL_STATUS.REGISTERED;
    const statusLabel = PORTAL_STATUS_LABELS[portal.status];
    const siteUrl = normalizeUrl(portal.url);
    const siteBtn = siteUrl
      ? `<a href="${siteUrl}" target="_blank" rel="noopener" class="portal-channel-btn" title="Open portal">🔗 Visit site ↗</a>`
      : "";

    const dateStr = portal.createdAt ? new Date(portal.createdAt).toLocaleDateString() : "";

    card.innerHTML = `
      <div class="portal-card-header">
        <div>
          <div class="portal-name">${portal.name}</div>
          ${portal.category ? `<div class="portal-category">${portal.category}</div>` : ""}
        </div>
        <span class="portal-status-badge ${isRegistered ? "is-registered" : "is-not-registered"}">${isRegistered ? "✓ " : ""}${statusLabel}</span>
      </div>

      ${siteBtn ? `<div class="portal-channels">${siteBtn}</div>` : ""}

      ${portal.remarks ? `<div class="portal-remarks">${portal.remarks}</div>` : ""}

      <div class="portal-card-footer">
        <span style="font-size:0.75rem; color:var(--text-light);">${dateStr ? `Added ${dateStr}` : ""}</span>
        <div>
          <button class="action-row-btn edit-portal-btn" data-id="${portal.id}" type="button">✏️ Edit</button>
          <button class="action-row-btn delete-portal-btn" data-id="${portal.id}" type="button">🗑️ Delete</button>
        </div>
      </div>
    `;
    elements.portalsGrid.appendChild(card);
  });
}

function populateClJobSelect() {
  if (!elements.clJobSelect) return;
  const currentVal = elements.clJobSelect.value;
  const platforms = platformStore.list();
  elements.clJobSelect.innerHTML = `<option value="">-- Manual Input / Custom Project --</option>`;

  platforms.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} ${p.category ? `(${p.category})` : ""}`;
    elements.clJobSelect.appendChild(opt);
  });

  if (currentVal) elements.clJobSelect.value = currentVal;

  if (elements.clNameInput && !elements.clNameInput.value) {
    const settings = settingsStore.get();
    elements.clNameInput.value = settings.userName || "Yudhan";
  }
}

function updateClStats() {
  if (!elements.clOutputTextarea || !elements.clStatsText) return;
  const text = elements.clOutputTextarea.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(words / 200));
  elements.clStatsText.textContent = `${words} words • ${readTime} min read`;
}

/* Proposal Drafter: short, tailored freelance proposals (Upwork / Contra /
   direct outreach). Not a corporate cover letter: no date header, no
   "Dear Hiring Team", no invented facts. Empty proof falls back to an
   honest line, never to made-up achievements. */
function generateProposal() {
  const settings = settingsStore.get();
  const name = elements.clNameInput?.value.trim() || settings.userName || "Yudhan";
  const recipient = elements.clRecipientInput?.value.trim();
  const project = elements.clRoleInput?.value.trim() || "[Project]";
  const tone = elements.clToneSelect?.value || "problem";
  const proof = elements.clHighlightsInput?.value.trim();
  const hook = elements.clMotivationInput?.value.trim();

  const greeting = recipient ? `Hi ${recipient},` : "Hi there,";
  const proofLines = proof
    ? proof.split("\n").map((h) => {
        const trimmed = h.trim();
        return trimmed.startsWith("-") || trimmed.startsWith("•") ? trimmed : `• ${trimmed}`;
      }).join("\n")
    : "";

  let opening = "";
  if (tone === "proof") {
    opening = `I've done this kind of work before, and I'd like to do it for you on ${project}. I start from your brief, deliver clean work, and keep you posted along the way.`;
  } else if (tone === "question") {
    opening = `Before I quote on ${project}, one question that shapes the whole job: is there a reference, a must-hit detail, or a "do not do this" I should know about? It changes how I scope the first day.`;
  } else if (tone === "warm") {
    const hookClause = hook ? hook.charAt(0).toLowerCase() + hook.slice(1) : `your ${project} caught my eye`;
    opening = `I'm reaching out because ${hookClause} — and I'd like to help with it.`;
  } else {
    // problem-first (default)
    opening = `I read your brief for ${project}, and the thing that matters most is getting it right, not just getting it done. That's the work I do: I take the brief, handle the details, and deliver something you can use without rework.`;
  }

  const proofBlock = proofLines
    ? `Relevant proof:\n\n${proofLines}`
    : "Happy to share relevant past work on request — just say the word.";

  const hookLine = hook && tone !== "warm"
    ? `What caught my eye about this one: ${hook}.`
    : "";

  const proposal = `${greeting}\n\n${opening}\n\n${proofBlock}\n\n${hookLine ? `${hookLine}\n\n` : ""}If that sounds right, reply here and I'll send a rate and a start date.\n\nBest,\n${name}`;

  if (elements.clOutputTextarea) {
    elements.clOutputTextarea.value = proposal;
    updateClStats();
  }
}

const TAB_VIEW_MAP = {
  home: "viewHome",
  board: "viewBoard",
  statistics: "viewStatistics",
  portals: "viewPortals",
  proposal: "viewProposal",
  cvvault: "viewCvvault",
  linkedintools: "viewLinkedinTools",
};

function switchTab(tabName) {
  activeTab = tabName;
  elements.navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tab === tabName);
  });

  elements.mobileNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tab === tabName);
  });

  const targetViewId = TAB_VIEW_MAP[tabName];
  elements.tabViews.forEach((view) => {
    const isMatch =
      view.dataset.tab === tabName ||
      (targetViewId && view.id === targetViewId) ||
      view.id.toLowerCase() === `view${tabName}`.toLowerCase();
    view.style.display = isMatch ? "block" : "none";
  });

  if (elements.pageTitle) {
    if (tabName === "home") elements.pageTitle.textContent = "Home Dashboard";
    else if (tabName === "board") elements.pageTitle.textContent = "Opportunity Board";
    else if (tabName === "statistics") elements.pageTitle.textContent = "Statistics";
    else if (tabName === "portals") elements.pageTitle.textContent = "Freelance Portals";
    else if (tabName === "proposal") {
      elements.pageTitle.textContent = "Proposal Drafter";
      populateClJobSelect();
      if (!elements.clOutputTextarea.value) generateProposal();
    }
    else if (tabName === "cvvault") {
      elements.pageTitle.textContent = "CV Vault";
      refreshCVVault();
    }
    else if (tabName === "linkedintools") {
      elements.pageTitle.textContent = "LinkedIn Outreach for Gigs";
    }
  }

  // Auto close mobile drawer on tab switch
  elements.sidebar?.classList.remove("is-open");
  elements.sidebarBackdrop?.classList.remove("is-visible");

  render();
}

function render() {
  renderUserProfile();
  updateDemoBanner();
  if (activeTab === "board") renderBoard();
  if (activeTab === "home") renderHome();
  if (activeTab === "statistics") renderStatistics();
  if (activeTab === "portals") renderPortals();
  if (activeTab === "cvvault") renderCVVault();
}

/* CV Vault Functions: finished CVs stored as files (IndexedDB), ready to download */
let cvVaultCache = [];
let editingCvId = null;

async function refreshCVVault() {
  try {
    cvVaultCache = await cvVaultStore.list();
  } catch (err) {
    console.error("CV Vault load failed:", err);
    cvVaultCache = [];
  }
  renderCVVault();
}

function renderCVVault() {
  if (!elements.cvGrid) return;
  const items = cvVaultCache;
  if (elements.cvEmptyState) {
    elements.cvEmptyState.style.display = items.length === 0 ? "block" : "none";
  }
  elements.cvGrid.innerHTML = items
    .map(
      (cv) => `
    <article class="cv-card" data-id="${cv.id}">
      <div class="cv-card-header">
        <div class="cv-card-label">${cv.label}</div>
        <span class="cv-card-size">${formatFileSize(cv.fileSize)}</span>
      </div>
      <div class="cv-card-meta">
        <span>${cv.fileName}</span>
        <span>Uploaded ${cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : ""}</span>
      </div>
      ${cv.note ? `<div class="cv-card-note">${cv.note}</div>` : ""}
      <div class="cv-card-actions">
        <button class="secondary-btn sm cv-open-btn" type="button" data-id="${cv.id}">Open</button>
        <button class="secondary-btn sm cv-download-btn" type="button" data-id="${cv.id}">Download</button>
        <button class="secondary-btn sm cv-edit-btn" type="button" data-id="${cv.id}">Edit</button>
        <button class="secondary-btn sm cv-delete-btn" type="button" data-id="${cv.id}">Delete</button>
      </div>
    </article>`
    )
    .join("");
}

async function handleCVFiles(fileList) {
  const files = [...(fileList || [])];
  if (files.length === 0) return;
  for (const file of files) {
    const check = validateCVFile(file);
    if (!check.ok) {
      alert(`${file.name}: ${check.error}`);
      continue;
    }
    const record = createCVRecord({ file });
    await cvVaultStore.add(record, file);
  }
  await refreshCVVault();
}

async function downloadCV(id) {
  const cv = cvVaultCache.find((c) => c.id === id);
  const blob = await cvVaultStore.getBlob(id);
  if (!cv || !blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = cv.fileName;
  a.click();
  URL.revokeObjectURL(url);
}

async function openCV(id) {
  const blob = await cvVaultStore.getBlob(id);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function openCVEditDialog(id) {
  const cv = cvVaultCache.find((c) => c.id === id);
  if (!cv || !elements.cvEditDialog) return;
  editingCvId = id;
  if (elements.cvLabelInput) elements.cvLabelInput.value = cv.label || "";
  if (elements.cvNoteInput) elements.cvNoteInput.value = cv.note || "";
  if (elements.cvEditFileMeta) {
    elements.cvEditFileMeta.textContent = `${cv.fileName} · ${formatFileSize(cv.fileSize)} · uploaded ${cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : ""}`;
  }
  elements.cvEditDialog.showModal();
}

function closeCVEditDialog() {
  elements.cvEditDialog?.close();
  editingCvId = null;
}

async function saveCVEdit() {
  if (!editingCvId) return;
  const label = elements.cvLabelInput?.value.trim() || "";
  const note = elements.cvNoteInput?.value.trim() || "";
  const patch = { note };
  if (label) patch.label = label;
  await cvVaultStore.update(editingCvId, patch);
  await refreshCVVault();
}

async function deleteCV(id) {
  const cv = cvVaultCache.find((c) => c.id === id);
  if (!cv) return;
  if (!confirm(`Delete "${cv.label}" from the CV Vault? The file is removed from this browser.`)) return;
  await cvVaultStore.remove(id);
  await refreshCVVault();
}

/* LinkedIn Tools Functions */
function generateLinkedinOutreach() {
  const type = elements.liOutreachType?.value || "pitch";
  const recipient = elements.liRecipientName?.value.trim();
  const client = elements.liCompanyName?.value.trim();
  const service = elements.liTargetRole?.value.trim();
  const myName = settingsStore.get().userName || "Yudhan";

  // No invented facts: every specific claim comes from a field above.
  // Empty fields fall back to neutral wording, never to a made-up
  // person, company, service, or experience claim.
  const greeting = recipient ? `Hi ${recipient},` : "Hi there,";
  const clientName = client || "your team";
  const serviceText = service || "freelance projects";

  let msg = "";
  if (type === "pitch") {
    msg = `${greeting}

I work on ${serviceText} and wanted to reach out to ${clientName} to see if that could be useful for an upcoming project.

If there is something coming up, I would be glad to share a couple of relevant examples and a short note on how I would approach it.

Either way, thanks for your time.

Best regards,
${myName}`;
  } else if (type === "followup") {
    msg = `${greeting}

I wanted to follow up on the proposal I sent to ${clientName} about ${serviceText}.

If it would help, I can answer any questions or adjust the scope. Happy to pick it up again whenever you are ready.

Thanks,
${myName}`;
  } else if (type === "enquiry") {
    msg = `${greeting}

I am interested in the gig work on ${client || "your platform"} and wanted to ask how to get started.

I work on ${serviceText}. If there is a current opening that fits, I would be glad to share my background and take the next step.

Thanks for your time.

Best,
${myName}`;
  } else {
    // Post-call thank-you
    msg = `${greeting}

Thank you for the call about ${serviceText} with ${clientName}.

I enjoyed the conversation and would be glad to continue if the timing works on your side. Please let me know if there is anything else I can share.

Warmly,
${myName}`;
  }

  if (elements.liOutreachOutput) elements.liOutreachOutput.value = msg;
}

function generateLinkedinHeadlines() {
  const kw = elements.liHeadlineKeywords?.value.trim();
  const service = elements.liTargetRole?.value.trim();

  if (!elements.liHeadlineResults) return;

  // No invented persona: without a service or keywords there is nothing
  // honest to headline, so say so instead of generating a fake one.
  if (!kw && !service) {
    elements.liHeadlineResults.innerHTML = `
      <div class="li-headline-card">
        <span class="li-headline-text">Fill in Service / Offer and keywords above, then generate.</span>
      </div>`;
    return;
  }

  const join = (...parts) => parts.filter(Boolean).join(" | ");
  const headlines = [
    join(service, kw, "Open to Opportunities"),
    service && kw ? `${service} • Specializing in ${kw}` : join(service, kw),
    join(kw, service),
    join(service, "Available for freelance work"),
  ];

  elements.liHeadlineResults.innerHTML = headlines
    .map(
      (h) => `
      <div class="li-headline-card">
        <span class="li-headline-text">${h}</span>
        <button class="secondary-btn sm copy-headline-btn" data-text="${h.replace(/"/g, '&quot;')}" type="button">📋</button>
      </div>
    `
    )
    .join("");
}

function convertUnicode(text, style) {
  if (!text) return "";
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bold = "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
  const italic = "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789";
  const mono = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿";

  const targetMap = style === "bold" ? bold : style === "italic" ? italic : mono;
  return Array.from(text)
    .map((char) => {
      const idx = normal.indexOf(char);
      return idx !== -1 ? Array.from(targetMap)[idx] : char;
    })
    .join("");
}

function openCaptureDialog(platform = null, defaultStage = STATUS_ENUM.WISHLIST) {
  elements.captureForm.reset();
  elements.formError.textContent = "";
  elements.editingId.value = platform?.id ?? "";
  elements.dialogTitle.textContent = platform ? "Edit Opportunity" : "Add Opportunity";
  elements.nameInput.value = platform?.name ?? "";
  elements.categoryInput.value = platform?.category ?? "";
  elements.urlInput.value = platform?.url ?? "";
  elements.statusSelectInput.value = platform?.status ?? defaultStage;
  if (elements.followUpDateInput) elements.followUpDateInput.value = platform?.followUpDate ?? "";
  elements.noteInput.value = platform?.note ?? "";
  elements.captureDialog.showModal();
  elements.nameInput.focus();
}

function closeCaptureDialog() {
  elements.captureDialog.close();
}

function savePlatform() {
  const name = elements.nameInput.value.trim();
  if (!name) {
    elements.formError.textContent = "Company or position name is required.";
    elements.nameInput.focus();
    return;
  }

  const input = {
    name,
    category: elements.categoryInput.value,
    url: elements.urlInput.value,
    status: elements.statusSelectInput.value,
    followUpDate: elements.followUpDateInput ? elements.followUpDateInput.value : "",
    note: elements.noteInput.value,
  };

  const editingId = elements.editingId.value;
  if (editingId) {
    platformStore.update(editingId, input);
  } else {
    platformStore.create(input);
  }

  closeCaptureDialog();
  render();
}

/* Portal Dialog Functions */
function openPortalDialog(portal = null) {
  elements.portalForm.reset();
  elements.portalFormError.textContent = "";
  elements.portalEditingId.value = portal?.id ?? "";
  elements.portalDialogTitle.textContent = portal ? "Edit Portal" : "Add Portal";
  elements.portalNameInput.value = portal?.name ?? "";
  elements.portalUrlInput.value = portal?.url ?? "";
  elements.portalCategoryInput.value = portal?.category ?? "Other";
  elements.portalStatusInput.value = portal?.status ?? PORTAL_STATUS.NOT_REGISTERED;
  elements.portalRemarksInput.value = portal?.remarks ?? "";
  elements.portalDialog.showModal();
  elements.portalNameInput.focus();
}

function closePortalDialog() {
  elements.portalDialog.close();
}

function savePortal() {
  const name = elements.portalNameInput.value.trim();
  if (!name) {
    elements.portalFormError.textContent = "Portal name is required.";
    elements.portalNameInput.focus();
    return;
  }

  const input = {
    name,
    url: elements.portalUrlInput.value,
    category: elements.portalCategoryInput.value,
    status: elements.portalStatusInput.value,
    remarks: elements.portalRemarksInput.value,
  };

  const editingId = elements.portalEditingId.value;
  if (editingId) {
    portalStore.update(editingId, input);
  } else {
    portalStore.create(input);
  }

  closePortalDialog();
  renderPortals();
}

/* Settings Dialog Functions */
function openSettingsDialog() {
  const settings = settingsStore.get();
  elements.settingsUserNameInput.value = settings.userName;
  elements.settingsWeeklyGoalInput.value = settings.weeklyGoal;
  updateDemoButtons();
  elements.settingsDialog.showModal();
  elements.settingsUserNameInput.focus();
}

function closeSettingsDialog() {
  elements.settingsDialog.close();
}

function saveSettings() {
  const userName = elements.settingsUserNameInput.value.trim() || "Yudhan";
  const weeklyGoal = Math.max(1, parseInt(elements.settingsWeeklyGoalInput.value, 10) || 10);
  settingsStore.update({ userName, weeklyGoal });
  closeSettingsDialog();
  render();
}

/* Demo data: fictional sample pipeline for evaluation */
function updateDemoBanner() {
  if (!elements.demoBanner) return;
  elements.demoBanner.style.display = platformStore.hasDemoData() ? "block" : "none";
}

function updateDemoButtons() {
  if (!elements.clearDemoBtn) return;
  elements.clearDemoBtn.style.display = platformStore.hasDemoData() ? "inline-flex" : "none";
}

function loadDemoData() {
  if (!confirm("Loading demo data will replace your current opportunities with 13 fictional sample records. Portals, settings, and CVs are not touched. Continue?")) return;
  platformStore.loadDemoData();
  closeSettingsDialog();
  render();
}

function clearDemoData() {
  if (!confirm("Remove all demo opportunities from the board?")) return;
  platformStore.clearDemoData();
  closeSettingsDialog();
  render();
}

/* Event Handlers */
elements.navLinks.forEach((link) => {
  link.addEventListener("click", () => switchTab(link.dataset.tab));
});

elements.mobileNavLinks.forEach((link) => {
  link.addEventListener("click", () => switchTab(link.dataset.tab));
});

elements.viewCardsBtn?.addEventListener("click", () => {
  boardViewMode = "cards";
  renderBoard();
});

elements.viewListBtn?.addEventListener("click", () => {
  boardViewMode = "list";
  renderBoard();
});

elements.captureButton?.addEventListener("click", () => openCaptureDialog());
elements.closeDialogButton?.addEventListener("click", closeCaptureDialog);
elements.cancelButton?.addEventListener("click", closeCaptureDialog);

elements.captureForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  savePlatform();
});

elements.searchInput?.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderBoard();
});

elements.sortBySelect?.addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderBoard();
});

// Click delegation for Cards Board and List Board
[elements.boardGrid, elements.listBoard].forEach((container) => {
  container?.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".stage-add-btn");
    if (addBtn) {
      openCaptureDialog(null, addBtn.dataset.stage);
      return;
    }

    const editBtn = e.target.closest(".edit-job-btn");
    if (editBtn) {
      const platform = platformStore.get(editBtn.dataset.id);
      if (platform) openCaptureDialog(platform);
      return;
    }

    const deleteBtn = e.target.closest(".delete-job-btn");
    if (deleteBtn) {
      const platform = platformStore.get(deleteBtn.dataset.id);
      if (platform && confirm(`Are you sure you want to delete "${platform.name}"?`)) {
        platformStore.remove(platform.id);
        renderBoard();
      }
      return;
    }

    const header = e.target.closest(".stage-header");
    if (header) {
      const accordion = header.closest(".stage-accordion");
      if (accordion) accordion.classList.toggle("is-collapsed");
    }
  });
});

elements.sidebarToggle?.addEventListener("click", () => {
  const isOpen = elements.sidebar.classList.toggle("is-open");
  elements.sidebarBackdrop?.classList.toggle("is-visible", isOpen);
});

elements.sidebarBackdrop?.addEventListener("click", () => {
  elements.sidebar?.classList.remove("is-open");
  elements.sidebarBackdrop?.classList.remove("is-visible");
});

elements.statsApplyTrigger?.addEventListener("click", () => switchTab("board"));
elements.statsAddMoreTrigger?.addEventListener("click", () => openCaptureDialog());

// Settings event listeners
elements.openSettingsBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openSettingsDialog();
});
elements.userProfileCard?.addEventListener("click", openSettingsDialog);
elements.closeSettingsDialogButton?.addEventListener("click", closeSettingsDialog);
elements.cancelSettingsButton?.addEventListener("click", closeSettingsDialog);
elements.settingsForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  saveSettings();
});
elements.loadDemoBtn?.addEventListener("click", loadDemoData);
elements.clearDemoBtn?.addEventListener("click", clearDemoData);

// Portals event listeners
elements.addPortalBtn?.addEventListener("click", () => openPortalDialog());
elements.closePortalDialogButton?.addEventListener("click", closePortalDialog);
elements.cancelPortalButton?.addEventListener("click", closePortalDialog);
elements.portalForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  savePortal();
});
elements.portalSearchInput?.addEventListener("input", (e) => {
  portalSearchQuery = e.target.value;
  renderPortals();
});

elements.portalsGrid?.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-portal-btn");
  if (editBtn) {
    const portal = portalStore.get(editBtn.dataset.id);
    if (portal) openPortalDialog(portal);
    return;
  }

  const deleteBtn = e.target.closest(".delete-portal-btn");
  if (deleteBtn) {
    const portal = portalStore.get(deleteBtn.dataset.id);
    if (portal && confirm(`Are you sure you want to delete portal "${portal.name}"?`)) {
      portalStore.remove(portal.id);
      renderPortals();
    }
  }
});

// PWA Install logic
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (elements.installButton) elements.installButton.style.display = "inline-flex";
});

elements.installButton?.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === "accepted") elements.installButton.style.display = "none";
  deferredInstallPrompt = null;
});

// Keyboard Shortcuts: Cmd+K / Ctrl+K
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCaptureDialog();
  }
});

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("ServiceWorker registration failed:", err);
    });
  });
}

elements.exportBtn?.addEventListener("click", () => {
  const jsonStr = platformStore.exportJson();
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `opportunity-inbox-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

elements.importBtn?.addEventListener("click", () => {
  elements.importFileInput?.click();
});

elements.importFileInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const result = platformStore.importJson(event.target.result, "merge");
    if (result.success) {
      alert(`✅ Successfully imported backup data (${result.count} records processed).`);
      render();
    } else {
      alert(`❌ Failed to import backup: ${result.error}`);
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

// Proposal Drafter Event Listeners
elements.clJobSelect?.addEventListener("change", (e) => {
  const selectedId = e.target.value;
  if (selectedId) {
    const job = platformStore.get(selectedId);
    if (job) {
      if (elements.clCompanyInput) elements.clCompanyInput.value = job.name;
      if (elements.clRoleInput) elements.clRoleInput.value = job.category || "";
      if (elements.clHighlightsInput && !elements.clHighlightsInput.value && job.note) {
        elements.clHighlightsInput.value = job.note;
      }
    }
  }
});

elements.clGenerateBtn?.addEventListener("click", generateProposal);
elements.clOutputTextarea?.addEventListener("input", updateClStats);

elements.clCopyBtn?.addEventListener("click", () => {
  const text = elements.clOutputTextarea?.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = elements.clCopyBtn.textContent;
    elements.clCopyBtn.textContent = "✅ Copied!";
    setTimeout(() => {
      elements.clCopyBtn.textContent = originalText;
    }, 2000);
  });
});

elements.clDownloadBtn?.addEventListener("click", () => {
  const text = elements.clOutputTextarea?.value;
  if (!text) return;
  const company = (elements.clCompanyInput?.value || "company").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proposal-${company}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

elements.clPrintBtn?.addEventListener("click", () => {
  window.print();
});

// CV Vault Event Listeners
elements.cvUploadBtn?.addEventListener("click", () => elements.cvFileInput?.click());
elements.cvFileInput?.addEventListener("change", async (e) => {
  await handleCVFiles(e.target.files);
  if (elements.cvFileInput) elements.cvFileInput.value = "";
});
elements.cvDropzone?.addEventListener("click", () => elements.cvFileInput?.click());
elements.cvDropzone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  elements.cvDropzone.classList.add("dragover");
});
elements.cvDropzone?.addEventListener("dragleave", () => {
  elements.cvDropzone.classList.remove("dragover");
});
elements.cvDropzone?.addEventListener("drop", async (e) => {
  e.preventDefault();
  elements.cvDropzone.classList.remove("dragover");
  await handleCVFiles(e.dataTransfer.files);
});
elements.cvGrid?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains("cv-open-btn")) await openCV(id);
  else if (btn.classList.contains("cv-download-btn")) await downloadCV(id);
  else if (btn.classList.contains("cv-edit-btn")) openCVEditDialog(id);
  else if (btn.classList.contains("cv-delete-btn")) await deleteCV(id);
});
elements.closeCvEditDialogButton?.addEventListener("click", closeCVEditDialog);
elements.cancelCvEditButton?.addEventListener("click", closeCVEditDialog);
elements.saveCvEditButton?.addEventListener("click", async () => {
  await saveCVEdit();
  closeCVEditDialog();
});

// LinkedIn Tools Event Listeners
elements.liGenerateOutreachBtn?.addEventListener("click", generateLinkedinOutreach);
elements.liCopyOutreachBtn?.addEventListener("click", () => {
  const text = elements.liOutreachOutput?.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = elements.liCopyOutreachBtn.textContent;
    elements.liCopyOutreachBtn.textContent = "✅ Copied!";
    setTimeout(() => { elements.liCopyOutreachBtn.textContent = orig; }, 2000);
  });
});

elements.liGenerateHeadlineBtn?.addEventListener("click", generateLinkedinHeadlines);

elements.liHeadlineResults?.addEventListener("click", (e) => {
  const btn = e.target.closest(".copy-headline-btn");
  if (btn && btn.dataset.text) {
    navigator.clipboard.writeText(btn.dataset.text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "✅";
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }
});

elements.liBoldBtn?.addEventListener("click", () => {
  const val = elements.liFormatInput?.value || "";
  if (elements.liFormatOutput) elements.liFormatOutput.value = convertUnicode(val, "bold");
});

elements.liItalicBtn?.addEventListener("click", () => {
  const val = elements.liFormatInput?.value || "";
  if (elements.liFormatOutput) elements.liFormatOutput.value = convertUnicode(val, "italic");
});

elements.liMonoBtn?.addEventListener("click", () => {
  const val = elements.liFormatInput?.value || "";
  if (elements.liFormatOutput) elements.liFormatOutput.value = convertUnicode(val, "mono");
});

elements.liCopyFormatBtn?.addEventListener("click", () => {
  const text = elements.liFormatOutput?.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = elements.liCopyFormatBtn.textContent;
    elements.liCopyFormatBtn.textContent = "✅ Copied!";
    setTimeout(() => { elements.liCopyFormatBtn.textContent = orig; }, 1500);
  });
});

seedPortalsIfEmpty();
refreshCVVault();
switchTab("board");
