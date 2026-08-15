import { platformStore, STATUS_ENUM, STATUS_LABELS } from "./storage.js";

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
  noteInput: document.querySelector("#noteInput"),
  formError: document.querySelector("#formError"),

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
};

let activeTab = "board";
let boardViewMode = "kanban"; // 'kanban' | 'list'
let searchQuery = "";
let sortBy = "updatedDesc";

function normalizeUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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

    if (stageItems.length === 0) {
      cardsContainer.innerHTML = `
        <div style="padding: 12px; color: #64748B; font-size: 0.8rem; text-align: center; font-style: italic;">
          No jobs
        </div>
      `;
    } else {
      stageItems.forEach((item) => {
        const url = normalizeUrl(item.url);
        const card = document.createElement("div");
        card.className = "kanban-card";
        card.dataset.id = item.id;
        card.innerHTML = `
          <div class="kanban-card-title">${item.name}</div>
          <div class="kanban-card-meta">${item.category ? `📍 ${item.category}` : "Uncategorized"}</div>
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
            <th>URL</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${stageItems
            .map((item) => {
              const url = normalizeUrl(item.url);
              const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—";
              return `
                <tr data-id="${item.id}">
                  <td>
                    <div style="font-weight:700;">${item.name}</div>
                  </td>
                  <td><span style="color:#94A3B8; font-size:0.85rem;">${item.category || "—"}</span></td>
                  <td><span style="color:#94A3B8; font-size:0.85rem;">${dateStr}</span></td>
                  <td>
                    ${
                      url
                        ? `<a href="${url}" target="_blank" rel="noopener" class="text-link-btn" style="font-size:0.82rem;">Link ↗</a>`
                        : `<span style="color:#64748B; font-size:0.82rem;">—</span>`
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

function renderHome() {
  const allPlatforms = platformStore.list();
  const appliedCount = allPlatforms.filter(
    (p) => p.status === STATUS_ENUM.APPLIED || p.status === STATUS_ENUM.INTERVIEWING || p.status === STATUS_ENUM.OFFER
  ).length;

  elements.homeWeeklyAppliedCount.textContent = appliedCount;
  const progressPercent = Math.min(100, (appliedCount / 10) * 100);
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
  const total = all.length;
  const applied = all.filter((p) => p.status === STATUS_ENUM.APPLIED).length;
  const interviewing = all.filter((p) => p.status === STATUS_ENUM.INTERVIEWING).length;
  const offer = all.filter((p) => p.status === STATUS_ENUM.OFFER).length;

  const conversionPct = applied > 0 ? Math.round(((interviewing + offer) / applied) * 100) : 0;

  elements.kpiTotalApplications.textContent = total;
  elements.kpiThisWeek.textContent = applied;
  elements.kpiThisMonth.textContent = total;
  elements.kpiInterviewConversion.textContent = `${conversionPct}%`;

  const remainingWeekly = Math.max(0, 10 - applied);
  elements.statsGoalProgressText.textContent =
    remainingWeekly > 0
      ? `You need ${remainingWeekly} more applications to reach your weekly goal of 10.`
      : `Awesome! You have achieved your weekly goal of 10 applications!`;

  if (elements.conversionAnalysisList) {
    elements.conversionAnalysisList.innerHTML = `
      <div class="breakdown-row"><span>Applied → Interview</span><span>${applied > 0 ? Math.round((interviewing / applied) * 100) : 0}%</span></div>
      <div class="breakdown-row"><span>Interview → Offer</span><span>${interviewing > 0 ? Math.round((offer / interviewing) * 100) : 0}%</span></div>
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

function switchTab(tabName) {
  activeTab = tabName;
  elements.navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tab === tabName);
  });

  elements.mobileNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tab === tabName);
  });

  elements.tabViews.forEach((view) => {
    view.style.display = view.id === `view${tabName.charAt(0).toUpperCase() + tabName.slice(1)}` ? "block" : "none";
  });

  if (elements.pageTitle) {
    if (tabName === "home") elements.pageTitle.textContent = "Home Dashboard";
    else if (tabName === "board") elements.pageTitle.textContent = "Opportunity Board";
    else if (tabName === "statistics") elements.pageTitle.textContent = "Statistics";
  }

  // Auto close mobile drawer on tab switch
  elements.sidebar?.classList.remove("is-open");
  elements.sidebarBackdrop?.classList.remove("is-visible");

  render();
}

function render() {
  if (activeTab === "board") renderBoard();
  if (activeTab === "home") renderHome();
  if (activeTab === "statistics") renderStatistics();
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

document.querySelectorAll(".future-tool").forEach((btn) => {
  btn.addEventListener("click", () => {
    const toolName = btn.dataset.tool || "This tool";
    alert(`💡 ${toolName} is currently in development for a future release.`);
  });
});

switchTab("board");
