import { platformStore, settingsStore, contactStore, resumeStore, DEFAULT_RESUME, STATUS_ENUM, STATUS_LABELS } from "./storage.js";

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
  settingsGeminiApiKeyInput: document.querySelector("#settingsGeminiApiKeyInput"),

  // Toolbar & Search & View Switcher
  searchInput: document.querySelector("#searchInput"),
  sortBySelect: document.querySelector("#sortBySelect"),
  captureButton: document.querySelector("#captureButton"),
  viewKanbanBtn: document.querySelector("#viewKanbanBtn"),
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

  // Contacts Elements
  viewContacts: document.querySelector("#viewContacts"),
  contactSearchInput: document.querySelector("#contactSearchInput"),
  addContactBtn: document.querySelector("#addContactBtn"),
  contactsGrid: document.querySelector("#contactsGrid"),
  contactDialog: document.querySelector("#contactDialog"),
  contactForm: document.querySelector("#contactForm"),
  closeContactDialogButton: document.querySelector("#closeContactDialogButton"),
  cancelContactButton: document.querySelector("#cancelContactButton"),
  contactDialogTitle: document.querySelector("#contactDialogTitle"),
  contactEditingId: document.querySelector("#contactEditingId"),
  contactNameInput: document.querySelector("#contactNameInput"),
  contactCompanyInput: document.querySelector("#contactCompanyInput"),
  contactRoleInput: document.querySelector("#contactRoleInput"),
  contactEmailInput: document.querySelector("#contactEmailInput"),
  contactLinkedinInput: document.querySelector("#contactLinkedinInput"),
  contactNoteInput: document.querySelector("#contactNoteInput"),
  contactFormError: document.querySelector("#contactFormError"),

  // Board Containers
  kanbanBoard: document.querySelector("#kanbanBoard"),
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

  // Cover Letter Elements
  viewCoverletter: document.querySelector("#viewCoverletter"),
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

  // Resume Builder Elements
  viewResumebuilder: document.querySelector("#viewResumebuilder"),
  rbLoadSampleBtn: document.querySelector("#rbLoadSampleBtn"),
  rbFullName: document.querySelector("#rbFullName"),
  rbTitle: document.querySelector("#rbTitle"),
  rbEmail: document.querySelector("#rbEmail"),
  rbPhone: document.querySelector("#rbPhone"),
  rbLocation: document.querySelector("#rbLocation"),
  rbWebsite: document.querySelector("#rbWebsite"),
  rbSummary: document.querySelector("#rbSummary"),
  rbSkills: document.querySelector("#rbSkills"),
  rbExperience: document.querySelector("#rbExperience"),
  rbEducation: document.querySelector("#rbEducation"),
  rbProjects: document.querySelector("#rbProjects"),
  rbSaveBtn: document.querySelector("#rbSaveBtn"),
  rbCopyMdBtn: document.querySelector("#rbCopyMdBtn"),
  rbDownloadMdBtn: document.querySelector("#rbDownloadMdBtn"),
  rbPrintBtn: document.querySelector("#rbPrintBtn"),
  resumePreviewSheet: document.querySelector("#resumePreviewSheet"),

  // Score My Resume Elements
  viewResumescore: document.querySelector("#viewResumescore"),
  rsJobDescriptionInput: document.querySelector("#rsJobDescriptionInput"),
  rsResumeTextInput: document.querySelector("#rsResumeTextInput"),
  rsLoadJobBtn: document.querySelector("#rsLoadJobBtn"),
  rsLoadMyResumeBtn: document.querySelector("#rsLoadMyResumeBtn"),
  rsScanBtn: document.querySelector("#rsScanBtn"),
  rsMatchScore: document.querySelector("#rsMatchScore"),
  rsVerdictTitle: document.querySelector("#rsVerdictTitle"),
  rsVerdictDesc: document.querySelector("#rsVerdictDesc"),
  rsMatchedCount: document.querySelector("#rsMatchedCount"),
  rsMissingCount: document.querySelector("#rsMissingCount"),
  rsMatchedTags: document.querySelector("#rsMatchedTags"),
  rsMissingTags: document.querySelector("#rsMissingTags"),
  rsCheckMetrics: document.querySelector("#rsCheckMetrics"),
  rsCheckVerbs: document.querySelector("#rsCheckVerbs"),
  rsCheckContact: document.querySelector("#rsCheckContact"),
  rsCheckLength: document.querySelector("#rsCheckLength"),

  // AI Answer Generator Elements
  viewAiAnswer: document.querySelector("#viewAiAnswer"),
  aiQuestionCategory: document.querySelector("#aiQuestionCategory"),
  aiCustomQuestionGroup: document.querySelector("#aiCustomQuestionGroup"),
  aiCustomQuestionInput: document.querySelector("#aiCustomQuestionInput"),
  aiCompanyInput: document.querySelector("#aiCompanyInput"),
  aiRoleInput: document.querySelector("#aiRoleInput"),
  aiFrameworkSelect: document.querySelector("#aiFrameworkSelect"),
  aiDetailsInput: document.querySelector("#aiDetailsInput"),
  aiGenerateBtn: document.querySelector("#aiGenerateBtn"),
  aiCopyBtn: document.querySelector("#aiCopyBtn"),
  aiOutputTextarea: document.querySelector("#aiOutputTextarea"),

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
let boardViewMode = "kanban"; // 'kanban' | 'list'
let searchQuery = "";
let contactSearchQuery = "";
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

function renderKanbanBoard() {
  const platforms = getProcessedPlatforms();
  elements.kanbanBoard.innerHTML = "";

  STAGES_ORDER.forEach((stage) => {
    const stageItems = platforms.filter((p) => p.status === stage);
    const stageLabel = STATUS_LABELS[stage] || stage;

    const col = document.createElement("div");
    col.className = "kanban-column";
    col.dataset.stage = stage;

    const header = document.createElement("div");
    header.className = "kanban-column-header";
    header.innerHTML = `
      <div class="kanban-column-title">
        <span>${stageLabel}</span>
      </div>
      <span class="kanban-column-count">${stageItems.length}</span>
    `;

    const cardsContainer = document.createElement("div");
    cardsContainer.className = "kanban-cards-container";
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
          Drop jobs here or + Add
        </div>
      `;
    } else {
      stageItems.forEach((item) => {
        const url = normalizeUrl(item.url);
        const followUpHtml = getFollowUpBadge(item.followUpDate, item.status);
        const card = document.createElement("div");
        card.className = "kanban-card";
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
          document.querySelectorAll(".kanban-cards-container").forEach((c) => c.classList.remove("drag-over"));
        });

        card.innerHTML = `
          <div class="kanban-card-title">${item.name}</div>
          <div class="kanban-card-meta">${item.category ? `📍 ${item.category}` : "Uncategorized"}</div>
          ${followUpHtml ? `<div>${followUpHtml}</div>` : ""}
          <div class="kanban-card-footer">
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
    addBtn.className = "kanban-add-btn stage-add-btn";
    addBtn.type = "button";
    addBtn.dataset.stage = stage;
    addBtn.textContent = "+ Add job";

    col.appendChild(header);
    col.appendChild(cardsContainer);
    col.appendChild(addBtn);
    elements.kanbanBoard.appendChild(col);
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
      <button class="stage-add-btn" type="button" data-stage="${stage}">+ Add job</button>
    `;

    const body = document.createElement("div");
    body.className = "stage-body";

    if (stageItems.length === 0) {
      body.innerHTML = `
        <div style="padding: 16px 20px; color: #64748B; font-size: 0.85rem; font-style: italic;">
          No jobs in ${stageLabel} stage.
        </div>
      `;
    } else {
      const table = document.createElement("table");
      table.className = "stage-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Company / Position</th>
            <th>Location / Tag</th>
            <th>Applied Date</th>
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
  if (boardViewMode === "kanban") {
    elements.kanbanBoard.style.display = "flex";
    elements.listBoard.style.display = "none";
    elements.viewKanbanBtn.classList.add("is-active");
    elements.viewListBtn.classList.remove("is-active");
    renderKanbanBoard();
  } else {
    elements.kanbanBoard.style.display = "none";
    elements.listBoard.style.display = "flex";
    elements.viewKanbanBtn.classList.remove("is-active");
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
  if (elements.homeGoalPill) elements.homeGoalPill.textContent = `Weekly goal: ${goal}`;
}

function renderHome() {
  const allPlatforms = platformStore.list();
  const settings = settingsStore.get();
  const weeklyGoal = settings.weeklyGoal || 10;
  
  // Weekly count: jobs applied/progressed this week
  const weeklyAppliedCount = allPlatforms.filter((p) => {
    const isApplied = p.status !== STATUS_ENUM.WISHLIST;
    return isApplied && (isDateThisWeek(p.createdAt) || isDateThisWeek(p.updatedAt));
  }).length;

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
  const applied = all.filter((p) => p.status === STATUS_ENUM.APPLIED).length;
  const interviewing = all.filter((p) => p.status === STATUS_ENUM.INTERVIEWING).length;
  const offer = all.filter((p) => p.status === STATUS_ENUM.OFFER).length;

  // Real date-based filter for active additions
  const thisWeekCount = all.filter((p) => isDateThisWeek(p.createdAt)).length;
  const thisMonthCount = all.filter((p) => isDateThisMonth(p.createdAt)).length;

  const totalActioned = applied + interviewing + offer;
  const conversionPct = totalActioned > 0 ? Math.round(((interviewing + offer) / totalActioned) * 100) : 0;

  elements.kpiTotalApplications.textContent = total;
  elements.kpiThisWeek.textContent = thisWeekCount;
  elements.kpiThisMonth.textContent = thisMonthCount;
  elements.kpiInterviewConversion.textContent = `${conversionPct}%`;

  const remainingWeekly = Math.max(0, weeklyGoal - thisWeekCount);
  elements.statsGoalProgressText.textContent =
    remainingWeekly > 0
      ? `You need ${remainingWeekly} more applications to reach your weekly goal of ${weeklyGoal}.`
      : `Awesome! You have achieved your weekly goal of ${weeklyGoal} applications!`;

  if (elements.conversionAnalysisList) {
    const appliedOrHigher = applied + interviewing + offer;
    elements.conversionAnalysisList.innerHTML = `
      <div class="breakdown-row"><span>Applied → Interview</span><span>${appliedOrHigher > 0 ? Math.round(((interviewing + offer) / appliedOrHigher) * 100) : 0}%</span></div>
      <div class="breakdown-row"><span>Interview → Offer</span><span>${interviewing > 0 ? Math.round((offer / (interviewing + offer)) * 100) : 0}%</span></div>
      <div class="breakdown-row"><span>Overall Win Rate</span><span>${total > 0 ? Math.round((offer / total) * 100) : 0}%</span></div>
    `;
  }

  if (elements.pipelineBreakdownList) {
    elements.pipelineBreakdownList.innerHTML = STAGES_ORDER.map((stage) => {
      const count = all.filter((p) => p.status === stage).length;
      return `<div class="breakdown-row"><span>${STATUS_LABELS[stage]}</span><span>${count}</span></div>`;
    }).join("");
  }
}

function renderContacts() {
  let contacts = contactStore.list();
  if (contactSearchQuery) {
    const q = contactSearchQuery.toLowerCase();
    contacts = contacts.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      (c.note && c.note.toLowerCase().includes(q))
    );
  }

  if (!elements.contactsGrid) return;
  elements.contactsGrid.innerHTML = "";

  if (contacts.length === 0) {
    elements.contactsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; color: var(--text-muted); background: var(--surface-card); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
        <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">No contacts found</p>
        <p style="font-size: 0.88rem; margin-bottom: 18px;">Track recruiters, referrers, and hiring managers here to build your networking momentum.</p>
        <button class="primary-btn sm" id="emptyAddContactBtn" type="button">+ Add First Contact</button>
      </div>
    `;
    document.querySelector("#emptyAddContactBtn")?.addEventListener("click", () => openContactDialog());
    return;
  }

  contacts.forEach((contact) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.dataset.id = contact.id;

    const emailBtn = contact.email
      ? `<a href="mailto:${contact.email}" class="contact-channel-btn" title="Send email">✉️ ${contact.email}</a>`
      : "";
    const linkedinUrl = normalizeUrl(contact.linkedin);
    const linkedinBtn = linkedinUrl
      ? `<a href="${linkedinUrl}" target="_blank" rel="noopener" class="contact-channel-btn" title="Open profile">💼 Profile ↗</a>`
      : "";

    const dateStr = contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "";

    card.innerHTML = `
      <div class="contact-card-header">
        <div>
          <div class="contact-name">${contact.name}</div>
          ${contact.role ? `<div class="contact-role">${contact.role}</div>` : ""}
        </div>
        ${contact.company ? `<span class="contact-company-badge">🏢 ${contact.company}</span>` : ""}
      </div>

      ${(contact.email || contact.linkedin) ? `<div class="contact-channels">${emailBtn}${linkedinBtn}</div>` : ""}

      ${contact.note ? `<div class="contact-note">${contact.note}</div>` : ""}

      <div class="contact-card-footer">
        <span style="font-size:0.75rem; color:var(--text-light);">${dateStr ? `Added ${dateStr}` : ""}</span>
        <div>
          <button class="action-row-btn edit-contact-btn" data-id="${contact.id}" type="button">✏️ Edit</button>
          <button class="action-row-btn delete-contact-btn" data-id="${contact.id}" type="button">🗑️ Delete</button>
        </div>
      </div>
    `;
    elements.contactsGrid.appendChild(card);
  });
}

function populateClJobSelect() {
  if (!elements.clJobSelect) return;
  const currentVal = elements.clJobSelect.value;
  const platforms = platformStore.list();
  elements.clJobSelect.innerHTML = `<option value="">-- Manual Input / Custom Role --</option>`;

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

function generateCoverLetter() {
  const settings = settingsStore.get();
  const name = elements.clNameInput?.value.trim() || settings.userName || "Yudhan";
  const recipient = elements.clRecipientInput?.value.trim() || "Hiring Team";
  const company = elements.clCompanyInput?.value.trim() || "[Company Name]";
  const role = elements.clRoleInput?.value.trim() || "[Target Role]";
  const tone = elements.clToneSelect?.value || "impact";
  const highlights = elements.clHighlightsInput?.value.trim();
  const motivation = elements.clMotivationInput?.value.trim();

  const todayStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let intro = "";
  let body1 = "";
  let body2 = "";
  let outro = "";

  if (tone === "impact") {
    intro = `I am writing to express my strong enthusiasm for the ${role} position at ${company}. With a track record of driving measurable product outcomes, executing with velocity, and building resilient systems, I am eager to contribute immediately to your team's objectives.`;
    body1 = highlights
      ? `Throughout my recent work, I have focused on delivering high-leverage outcomes:\n\n${highlights.split('\n').map(h => h.trim().startsWith('-') || h.trim().startsWith('•') ? h : `• ${h}`).join('\n')}\n\nI treat problem-solving as an iterative discipline: identifying user friction, shipping high-standard solutions, and optimizing for both performance and team velocity.`
      : `In my career, I have consistently prioritized high-leverage execution: transforming product ambiguity into clean, resilient architectures and delivering impactful user experiences with speed and precision.`;
    body2 = motivation
      ? `What excites me most about ${company} is ${motivation}. Joining a team that values rigorous engineering and thoughtful craftsmanship is the ideal environment where I can make an outsized impact.`
      : `I have followed ${company}'s progress closely and admire your high standard for user experience and engineering rigor. I would love the chance to apply my skills to your upcoming roadmaps.`;
    outro = `I welcome the opportunity to discuss how my execution mindset and experience align with your goals for the ${role} role. Thank you for your time and consideration.`;
  } else if (tone === "mission") {
    intro = `It is with genuine excitement that I submit my application for the ${role} opening at ${company}. ${motivation ? `Having seen how ${motivation}, I` : "I"} have long admired your mission and culture of thoughtful innovation.`;
    body1 = highlights
      ? `My experience has taught me that the best products are built when empathy for users meets relentless craftsmanship. Here are key highlights of what I bring to the table:\n\n${highlights.split('\n').map(h => h.trim().startsWith('-') || h.trim().startsWith('•') ? h : `• ${h}`).join('\n')}`
      : `I thrive in collaborative environments where ownership and empathy guide technical decisions. Whether tackling complex architectural challenges or crafting refined user interactions, I hold myself and my work to the highest standard of quality.`;
    body2 = `At ${company}, I see an opportunity to pour this dedication into a product that genuinely resonates with me. I am eager to collaborate with your team to advance your vision and deliver experiences that users love.`;
    outro = `I would love to learn more about your team's challenges and share how my background can support your mission. Thank you for reviewing my application.`;
  } else if (tone === "technical") {
    intro = `I am writing to apply for the ${role} position at ${company}. As an engineer who values scalable architecture, zero-dependency simplicity, and clean code hygiene, I am excited about the technical challenges your team is addressing.`;
    body1 = highlights
      ? `Over the course of my projects, I have consistently architected robust solutions with an emphasis on maintainability and speed:\n\n${highlights.split('\n').map(h => h.trim().startsWith('-') || h.trim().startsWith('•') ? h : `• ${h}`).join('\n')}\n\nMy development philosophy centers on building resilient abstractions, minimizing unnecessary complexity, and ensuring high runtime reliability.`
      : `My development philosophy focuses on building resilient systems that stand the test of time: clean component separation, high runtime performance, and defensive design that anticipates scale without premature bloat.`;
    body2 = motivation
      ? `I am particularly drawn to ${company} because ${motivation}. I look forward to bringing a disciplined engineering perspective to these initiatives.`
      : `I look forward to contributing to ${company}'s engineering standards and collaborating on complex, high-impact features.`;
    outro = `I would welcome a technical conversation to explore how my skills can contribute to ${company}'s engineering roadmap. Thank you for your consideration.`;
  } else {
    // referral / warm outreach
    intro = `I am reaching out to submit my application for the ${role} opportunity at ${company}. ${motivation ? `Following discussions regarding ${motivation}, I` : "I"} am thrilled to share my background and interest in joining your team.`;
    body1 = highlights
      ? `To give you a concise snapshot of my recent work and core capabilities:\n\n${highlights.split('\n').map(h => h.trim().startsWith('-') || h.trim().startsWith('•') ? h : `• ${h}`).join('\n')}`
      : `I pride myself on being a thoughtful partner who combines technical excellence with clear communication and a proactive, ownership-driven approach.`;
    body2 = `Given ${company}'s current trajectory and ambitious goals, I am confident that my experience and dedication will make me an effective and energetic addition to your organization from day one.`;
    outro = `I would appreciate the chance to connect for a brief introductory conversation at your convenience. Thank you for your time.`;
  }

  const letter = `${todayStr}

Dear ${recipient},

${intro}

${body1}

${body2}

${outro}

Sincerely,
${name}`;

  if (elements.clOutputTextarea) {
    elements.clOutputTextarea.value = letter;
    updateClStats();
  }
}

const TAB_VIEW_MAP = {
  home: "viewHome",
  board: "viewBoard",
  statistics: "viewStatistics",
  contacts: "viewContacts",
  coverletter: "viewCoverletter",
  resumebuilder: "viewResumebuilder",
  resumescore: "viewResumescore",
  aianswer: "viewAiAnswer",
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
    else if (tabName === "contacts") elements.pageTitle.textContent = "Network & Contacts";
    else if (tabName === "coverletter") {
      elements.pageTitle.textContent = "Cover Letter Generator";
      populateClJobSelect();
      if (!elements.clOutputTextarea.value) generateCoverLetter();
    }
    else if (tabName === "resumebuilder") {
      elements.pageTitle.textContent = "ATS Resume Builder";
      renderResumeBuilder();
    }
    else if (tabName === "resumescore") {
      elements.pageTitle.textContent = "Score My Resume";
      if (!elements.rsResumeTextInput.value) loadResumeIntoScanner();
    }
    else if (tabName === "aianswer") {
      elements.pageTitle.textContent = "STAR Interview Responder";
      if (!elements.aiOutputTextarea.value) generateAiAnswer();
    }
    else if (tabName === "linkedintools") {
      elements.pageTitle.textContent = "LinkedIn Optimization Suite";
      if (!elements.liOutreachOutput.value) generateLinkedinOutreach();
      generateLinkedinHeadlines();
    }
  }

  // Auto close mobile drawer on tab switch
  elements.sidebar?.classList.remove("is-open");
  elements.sidebarBackdrop?.classList.remove("is-visible");

  render();
}

function render() {
  renderUserProfile();
  if (activeTab === "board") renderBoard();
  if (activeTab === "home") renderHome();
  if (activeTab === "statistics") renderStatistics();
  if (activeTab === "contacts") renderContacts();
  if (activeTab === "resumebuilder") renderResumeBuilder();
}

/* Resume Builder Functions */
function renderResumeBuilder() {
  const resume = resumeStore.get();
  if (elements.rbFullName) elements.rbFullName.value = resume.fullName || "";
  if (elements.rbTitle) elements.rbTitle.value = resume.title || "";
  if (elements.rbEmail) elements.rbEmail.value = resume.email || "";
  if (elements.rbPhone) elements.rbPhone.value = resume.phone || "";
  if (elements.rbLocation) elements.rbLocation.value = resume.location || "";
  if (elements.rbWebsite) elements.rbWebsite.value = resume.website || "";
  if (elements.rbSummary) elements.rbSummary.value = resume.summary || "";
  if (elements.rbSkills) elements.rbSkills.value = resume.skills || "";
  if (elements.rbExperience) elements.rbExperience.value = resume.experience || "";
  if (elements.rbEducation) elements.rbEducation.value = resume.education || "";
  if (elements.rbProjects) elements.rbProjects.value = resume.projects || "";

  renderResumeSheet(resume);
}

function renderResumeSheet(resume) {
  if (!elements.resumePreviewSheet) return;
  const contacts = [resume.email, resume.phone, resume.location, resume.website].filter(Boolean).join(" • ");

  elements.resumePreviewSheet.innerHTML = `
    <header class="resume-header">
      <div class="resume-name">${resume.fullName || "Untitled Name"}</div>
      ${resume.title ? `<div class="resume-title">${resume.title}</div>` : ""}
      ${contacts ? `<div class="resume-contacts">${contacts}</div>` : ""}
    </header>

    ${resume.summary ? `
      <section class="resume-section">
        <div class="resume-section-title">Professional Summary</div>
        <div class="resume-body-text">${resume.summary}</div>
      </section>
    ` : ""}

    ${resume.skills ? `
      <section class="resume-section">
        <div class="resume-section-title">Skills & Technologies</div>
        <div class="resume-body-text">${resume.skills}</div>
      </section>
    ` : ""}

    ${resume.experience ? `
      <section class="resume-section">
        <div class="resume-section-title">Professional Experience</div>
        <div class="resume-body-text">${resume.experience}</div>
      </section>
    ` : ""}

    ${resume.projects ? `
      <section class="resume-section">
        <div class="resume-section-title">Key Projects</div>
        <div class="resume-body-text">${resume.projects}</div>
      </section>
    ` : ""}

    ${resume.education ? `
      <section class="resume-section">
        <div class="resume-section-title">Education & Credentials</div>
        <div class="resume-body-text">${resume.education}</div>
      </section>
    ` : ""}
  `;
}

function saveResumeFromInputs() {
  const data = {
    fullName: elements.rbFullName?.value.trim() || "Untitled",
    title: elements.rbTitle?.value.trim() || "",
    email: elements.rbEmail?.value.trim() || "",
    phone: elements.rbPhone?.value.trim() || "",
    location: elements.rbLocation?.value.trim() || "",
    website: elements.rbWebsite?.value.trim() || "",
    summary: elements.rbSummary?.value.trim() || "",
    skills: elements.rbSkills?.value.trim() || "",
    experience: elements.rbExperience?.value.trim() || "",
    education: elements.rbEducation?.value.trim() || "",
    projects: elements.rbProjects?.value.trim() || "",
  };
  resumeStore.save(data);
  renderResumeSheet(data);
  alert("✅ Resume saved successfully!");
}

function getResumeMarkdown() {
  const r = resumeStore.get();
  return `# ${r.fullName}
**${r.title}**
${[r.email, r.phone, r.location, r.website].filter(Boolean).join(" | ")}

## Professional Summary
${r.summary}

## Skills & Technologies
${r.skills}

## Experience
${r.experience}

## Projects
${r.projects}

## Education
${r.education}
`;
}

/* Score My Resume (ATS Scanner) Functions */
const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","aren't","as","at",
  "be","because","been","before","being","below","between","both","but","by","can't","cannot","could",
  "couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for",
  "from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's",
  "her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm",
  "i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't",
  "my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours",
  "ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't",
  "so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there",
  "there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too",
  "under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't",
  "what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's",
  "with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself",
  "yourselves","will","shall","work","working","job","experience","requirements","responsible","team","looking"
]);

function extractKeywords(text) {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freq = new Map();
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map((entry) => entry[0]);
}

function loadResumeIntoScanner() {
  const r = resumeStore.get();
  if (elements.rsResumeTextInput) {
    elements.rsResumeTextInput.value = `${r.fullName} - ${r.title}\n${r.summary}\n\nSKILLS:\n${r.skills}\n\nEXPERIENCE:\n${r.experience}\n\nPROJECTS:\n${r.projects}\n\nEDUCATION:\n${r.education}`;
  }
}

function scanResumeScore() {
  const jobText = elements.rsJobDescriptionInput?.value.trim() || "";
  const resumeText = elements.rsResumeTextInput?.value.trim() || "";

  if (!jobText || !resumeText) {
    alert("Please provide both Job Description and Resume text to scan.");
    return;
  }

  const jobKeywords = extractKeywords(jobText);
  const resumeLower = resumeText.toLowerCase();

  const matched = [];
  const missing = [];

  jobKeywords.forEach((kw) => {
    if (resumeLower.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const matchRatio = jobKeywords.length > 0 ? (matched.length / jobKeywords.length) : 0;
  
  const hasNumbers = /\d+%|\$\d+|\b\d+\b/.test(resumeText);
  const ACTION_VERBS = ["led", "engineered", "built", "spearheaded", "developed", "architected", "optimized", "delivered", "mentored", "scaled", "created", "designed", "improved"];
  const actionVerbsFound = ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(resumeText)).length;
  const hasContact = /@.+\..+/.test(resumeText) && /\d{3}/.test(resumeText);
  const words = resumeText.split(/\s+/).length;
  const lengthScore = words >= 250 && words <= 850;

  let score = Math.round(matchRatio * 70);
  if (hasNumbers) score += 10;
  if (actionVerbsFound >= 4) score += 10;
  if (hasContact) score += 5;
  if (lengthScore) score += 5;
  score = Math.min(98, Math.max(25, score));

  if (elements.rsMatchScore) elements.rsMatchScore.textContent = `${score}%`;
  if (elements.rsMatchedCount) elements.rsMatchedCount.textContent = matched.length;
  if (elements.rsMissingCount) elements.rsMissingCount.textContent = missing.length;

  if (elements.rsVerdictTitle) {
    elements.rsVerdictTitle.textContent = score >= 80 ? "🌟 Excellent ATS Match!" : score >= 60 ? "👍 Good Match (Optimization Recommended)" : "⚠️ Low Match Rate";
  }
  if (elements.rsVerdictDesc) {
    elements.rsVerdictDesc.textContent = score >= 80
      ? "Your resume strongly mirrors the keywords and qualifications requested. Be sure to align your bullet points with the missing skills below."
      : "You can significantly improve your odds by adding the missing technical skills and action verbs listed below into your experience bullets.";
  }

  if (elements.rsMatchedTags) {
    elements.rsMatchedTags.innerHTML = matched.length > 0
      ? matched.map((kw) => `<span class="rs-tag matched">✓ ${kw}</span>`).join("")
      : '<span class="empty-tag-note">No exact keyword matches found.</span>';
  }
  if (elements.rsMissingTags) {
    elements.rsMissingTags.innerHTML = missing.length > 0
      ? missing.map((kw) => `<span class="rs-tag missing">✗ ${kw}</span>`).join("")
      : '<span class="empty-tag-note">All top keywords matched!</span>';
  }

  if (elements.rsCheckMetrics) elements.rsCheckMetrics.textContent = hasNumbers ? "✅ Strong (Numbers/% found)" : "⚠️ Needs more quantifiable metrics";
  if (elements.rsCheckVerbs) elements.rsCheckVerbs.textContent = actionVerbsFound >= 4 ? `✅ Strong (${actionVerbsFound} power verbs)` : "⚠️ Use stronger action verbs";
  if (elements.rsCheckContact) elements.rsCheckContact.textContent = hasContact ? "✅ Complete (Email & Phone detected)" : "⚠️ Missing email or phone";
  if (elements.rsCheckLength) elements.rsCheckLength.textContent = `${words} words ${lengthScore ? "(Ideal 1-page length)" : "(Consider trimming or expanding)"}`;
}

/* AI Answer Generator Functions */
function generateAiAnswer() {
  const category = elements.aiQuestionCategory?.value || "conflict";
  const customQuestion = elements.aiCustomQuestionInput?.value.trim();
  const company = elements.aiCompanyInput?.value.trim() || "[Target Company]";
  const role = elements.aiRoleInput?.value.trim() || "[Target Role]";
  const framework = elements.aiFrameworkSelect?.value || "star";
  const details = elements.aiDetailsInput?.value.trim();

  let questionText = "";
  if (category === "conflict") questionText = "Tell me about a time you had a technical disagreement or conflict with a colleague and how you resolved it.";
  else if (category === "failure") questionText = "Describe a significant mistake or failure in a project and what you learned from it.";
  else if (category === "leadership") questionText = "Tell me about a time you took initiative to lead an unassigned project or solve a critical bottleneck.";
  else if (category === "ambiguity") questionText = "How do you handle ambiguous requirements or sudden priority shifts?";
  else if (category === "whyUs") questionText = `Why are you interested in joining ${company} as a ${role}?`;
  else if (category === "salary") questionText = "What are your salary and total compensation expectations for this role?";
  else questionText = customQuestion || "Interview Question";

  let response = "";
  if (framework === "star") {
    response = `QUESTION: "${questionText}"

[SITUATION]
${details ? `In my recent role while working on ${details.slice(0, 100)}...` : `At my previous company, our team encountered a critical challenge when high production traffic exposed an architectural bottleneck that threatened our uptime commitments.`}

[TASK]
I was responsible for diagnosing the root cause, aligning our engineering priorities, and delivering an immediate fix without impacting active customer workflows.

[ACTION]
${details ? `To address this, ${details}` : `I initiated a rapid RCA, established transparent communication across stakeholders, and implemented an iterative, decoupled architecture that minimized blast radius. I also introduced automated safeguards to prevent future regressions.`}

[RESULT]
As a result, we eliminated the bottleneck, improved overall performance by 35%, and established a playbook adopted company-wide. When applying this to ${company}, I bring this same bias for disciplined problem-solving and proactive ownership.`;
  } else if (framework === "car") {
    response = `QUESTION: "${questionText}"

[CONTEXT]
${details ? details : `While developing core user-facing features, we faced strict latency SLAs and complex data dependencies that required high-level architectural precision.`}

[ACTION]
I took full ownership of the pipeline: auditing the critical rendering path, removing legacy bottlenecks, and collaborating directly with product managers to focus strictly on high-impact requirements.

[RESULT]
We shipped the milestone ahead of schedule, cut error rates significantly, and preserved high customer trust. I am excited to apply this high-velocity rigor to the ${role} position at ${company}.`;
  } else {
    // Direct & Concise
    response = `KEY TAKEAWAYS FOR: "${questionText}"

• Core Principle: I approach challenges with extreme ownership, data-driven prioritization, and proactive empathy.
• Concrete Example: ${details ? details : `Led the refactoring of core systems resulting in sub-second response times and zero downtime.`}
• Alignment with ${company}: I am eager to leverage this proven ability to solve complex technical bottlenecks for your ${role} team.`;
  }

  if (elements.aiOutputTextarea) {
    elements.aiOutputTextarea.value = response;
  }
}

/* LinkedIn Tools Functions */
function generateLinkedinOutreach() {
  const type = elements.liOutreachType?.value || "recruiter";
  const recipient = elements.liRecipientName?.value.trim() || "Sarah";
  const company = elements.liCompanyName?.value.trim() || "Company";
  const role = elements.liTargetRole?.value.trim() || "Software Engineer";
  const myName = settingsStore.get().userName || "Yudhan";

  let msg = "";
  if (type === "recruiter") {
    msg = `Hi ${recipient},

I recently applied for the ${role} opening at ${company} and wanted to reach out directly to express my enthusiasm.

With extensive experience building performant, responsive web applications and reliable client-side architectures, I am confident my technical execution aligns closely with what your team is building.

I would love to connect and share a quick snapshot of my work if you have a moment. Either way, appreciate your time!

Best regards,
${myName}`;
  } else if (type === "referral") {
    msg = `Hi ${recipient},

Hope you're having a productive week! I came across your profile and noticed the inspiring work you're doing at ${company}.

I am preparing to submit an application for the ${role} position. Given your firsthand experience there, I would greatly value any quick perspective you might have on the engineering culture. If you feel comfortable, I would also be honored by an internal referral!

Thanks so much for considering,
${myName}`;
  } else if (type === "coffee") {
    msg = `Hi ${recipient},

I've been following ${company}'s recent technical milestones and love the direction you're taking with developer experience.

As an engineer passionate about clean architectures and scalable frontends, I would love to buy you a virtual coffee for 15 minutes to learn more about how your team tackles complex challenges.

No pressure at all, and thank you for your time!

Best,
${myName}`;
  } else {
    // Thank you
    msg = `Hi ${recipient},

Thank you for taking the time to speak with me today about the ${role} position at ${company}.

I really enjoyed our discussion regarding your engineering roadmaps and upcoming features. Our conversation confirmed my strong enthusiasm for joining ${company} and contributing to your team's velocity.

Please let me know if there are any additional details or code samples I can provide. Looking forward to the next steps!

Warmly,
${myName}`;
  }

  if (elements.liOutreachOutput) elements.liOutreachOutput.value = msg;
}

function generateLinkedinHeadlines() {
  const kw = elements.liHeadlineKeywords?.value.trim() || "React, TypeScript, Scalable Architecture, Performance";
  const role = elements.liTargetRole?.value.trim() || "Software Engineer";

  const headlines = [
    `${role} | High-Velocity Web Engineering | ${kw} | Open to Opportunities`,
    `${role} • Specializing in ${kw} • Scalable User Experiences`,
    `${role} | Transforming Ambiguity into Resilient Systems | ${kw}`,
    `Senior ${role} | Zero-Dependency Architecture & Performance | ${kw}`
  ];

  if (elements.liHeadlineResults) {
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
  elements.dialogTitle.textContent = platform ? "Edit Job Application" : "Add Job Application";
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

/* Contacts Dialog Functions */
function openContactDialog(contact = null) {
  elements.contactForm.reset();
  elements.contactFormError.textContent = "";
  elements.contactEditingId.value = contact?.id ?? "";
  elements.contactDialogTitle.textContent = contact ? "Edit Contact" : "Add Network Contact";
  elements.contactNameInput.value = contact?.name ?? "";
  elements.contactCompanyInput.value = contact?.company ?? "";
  elements.contactRoleInput.value = contact?.role ?? "";
  elements.contactEmailInput.value = contact?.email ?? "";
  elements.contactLinkedinInput.value = contact?.linkedin ?? "";
  elements.contactNoteInput.value = contact?.note ?? "";
  elements.contactDialog.showModal();
  elements.contactNameInput.focus();
}

function closeContactDialog() {
  elements.contactDialog.close();
}

function saveContact() {
  const name = elements.contactNameInput.value.trim();
  if (!name) {
    elements.contactFormError.textContent = "Contact name is required.";
    elements.contactNameInput.focus();
    return;
  }

  const input = {
    name,
    company: elements.contactCompanyInput.value,
    role: elements.contactRoleInput.value,
    email: elements.contactEmailInput.value,
    linkedin: elements.contactLinkedinInput.value,
    note: elements.contactNoteInput.value,
  };

  const editingId = elements.contactEditingId.value;
  if (editingId) {
    contactStore.update(editingId, input);
  } else {
    contactStore.create(input);
  }

  closeContactDialog();
  renderContacts();
}

/* Settings Dialog Functions */
function openSettingsDialog() {
  const settings = settingsStore.get();
  elements.settingsUserNameInput.value = settings.userName;
  elements.settingsWeeklyGoalInput.value = settings.weeklyGoal;
  if (elements.settingsGeminiApiKeyInput) elements.settingsGeminiApiKeyInput.value = settings.geminiApiKey || "";
  elements.settingsDialog.showModal();
  elements.settingsUserNameInput.focus();
}

function closeSettingsDialog() {
  elements.settingsDialog.close();
}

function saveSettings() {
  const userName = elements.settingsUserNameInput.value.trim() || "Yudhan";
  const weeklyGoal = Math.max(1, parseInt(elements.settingsWeeklyGoalInput.value, 10) || 10);
  const geminiApiKey = elements.settingsGeminiApiKeyInput ? elements.settingsGeminiApiKeyInput.value.trim() : "";
  settingsStore.update({ userName, weeklyGoal, geminiApiKey });
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

elements.viewKanbanBtn?.addEventListener("click", () => {
  boardViewMode = "kanban";
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

// Click delegation for Kanban Board and List Board
[elements.kanbanBoard, elements.listBoard].forEach((container) => {
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

// Contacts event listeners
elements.addContactBtn?.addEventListener("click", () => openContactDialog());
elements.closeContactDialogButton?.addEventListener("click", closeContactDialog);
elements.cancelContactButton?.addEventListener("click", closeContactDialog);
elements.contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  saveContact();
});
elements.contactSearchInput?.addEventListener("input", (e) => {
  contactSearchQuery = e.target.value;
  renderContacts();
});

elements.contactsGrid?.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-contact-btn");
  if (editBtn) {
    const contact = contactStore.get(editBtn.dataset.id);
    if (contact) openContactDialog(contact);
    return;
  }

  const deleteBtn = e.target.closest(".delete-contact-btn");
  if (deleteBtn) {
    const contact = contactStore.get(deleteBtn.dataset.id);
    if (contact && confirm(`Are you sure you want to delete contact "${contact.name}"?`)) {
      contactStore.remove(contact.id);
      renderContacts();
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

// Cover Letter Event Listeners
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

elements.clGenerateBtn?.addEventListener("click", generateCoverLetter);
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
  a.download = `cover-letter-${company}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

elements.clPrintBtn?.addEventListener("click", () => {
  window.print();
});

// Resume Builder Event Listeners
elements.rbLoadSampleBtn?.addEventListener("click", () => {
  if (confirm("Load sample tech resume? This will overwrite your current draft in the editor.")) {
    resumeStore.reset();
    renderResumeBuilder();
  }
});

elements.rbSaveBtn?.addEventListener("click", saveResumeFromInputs);

elements.rbCopyMdBtn?.addEventListener("click", () => {
  const md = getResumeMarkdown();
  navigator.clipboard.writeText(md).then(() => {
    const orig = elements.rbCopyMdBtn.textContent;
    elements.rbCopyMdBtn.textContent = "✅ Copied!";
    setTimeout(() => { elements.rbCopyMdBtn.textContent = orig; }, 2000);
  });
});

elements.rbDownloadMdBtn?.addEventListener("click", () => {
  const md = getResumeMarkdown();
  const name = (resumeStore.get().fullName || "resume").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume-${name}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

elements.rbPrintBtn?.addEventListener("click", () => {
  window.print();
});

// Score My Resume Event Listeners
elements.rsLoadJobBtn?.addEventListener("click", () => {
  const platforms = platformStore.list();
  if (platforms.length === 0) {
    alert("No saved job applications found on your board.");
    return;
  }
  const jobNames = platforms.slice(0, 5).map((p, idx) => `${idx + 1}. ${p.name} - ${p.category || ""}`).join("\n");
  const choice = prompt(`Select job by number (1-${Math.min(5, platforms.length)}):\n${jobNames}`);
  const idx = parseInt(choice, 10) - 1;
  if (!isNaN(idx) && platforms[idx]) {
    const job = platforms[idx];
    elements.rsJobDescriptionInput.value = `${job.name} - ${job.category || ""}\n${job.note || ""}`;
  }
});

elements.rsLoadMyResumeBtn?.addEventListener("click", loadResumeIntoScanner);
elements.rsScanBtn?.addEventListener("click", scanResumeScore);

// AI Answer Generator Event Listeners
elements.aiQuestionCategory?.addEventListener("change", (e) => {
  if (elements.aiCustomQuestionGroup) {
    elements.aiCustomQuestionGroup.style.display = e.target.value === "custom" ? "block" : "none";
  }
});

elements.aiGenerateBtn?.addEventListener("click", generateAiAnswer);
elements.aiCopyBtn?.addEventListener("click", () => {
  const text = elements.aiOutputTextarea?.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = elements.aiCopyBtn.textContent;
    elements.aiCopyBtn.textContent = "✅ Copied!";
    setTimeout(() => { elements.aiCopyBtn.textContent = orig; }, 2000);
  });
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

switchTab("board");
