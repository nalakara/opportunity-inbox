import { platformStore, STATUS_ENUM, STATUS_LABELS } from "./storage.js";

const STATUS_ORDER = [
  STATUS_ENUM.CAPTURED,
  STATUS_ENUM.VISITED,
  STATUS_ENUM.REGISTERED,
  STATUS_ENUM.PROFILE_READY,
  STATUS_ENUM.APPLIED,
  STATUS_ENUM.CLOSED,
];

const elements = {
  contentGrid: document.querySelector("#contentGrid"),
  captureButton: document.querySelector("#captureButton"),
  captureDialog: document.querySelector("#captureDialog"),
  captureForm: document.querySelector("#captureForm"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelButton: document.querySelector("#cancelButton"),
  dialogTitle: document.querySelector("#dialogTitle"),
  editingId: document.querySelector("#editingId"),
  nameInput: document.querySelector("#nameInput"),
  categoryInput: document.querySelector("#categoryInput"),
  urlInput: document.querySelector("#urlInput"),
  noteInput: document.querySelector("#noteInput"),
  formError: document.querySelector("#formError"),
  platformList: document.querySelector("#platformList"),
  detailPanel: document.querySelector("#detailPanel"),
  emptyState: document.querySelector("#emptyState"),
  itemCount: document.querySelector("#itemCount"),
  filters: document.querySelectorAll(".filter"),
};

let activeFilter = "ALL";
let selectedId = null;

function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function normalizeUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function filteredPlatforms() {
  const platforms = platformStore.list();
  if (activeFilter === "ALL") {
    return platforms;
  }
  return platforms.filter((platform) => platform.status === activeFilter);
}

function renderList() {
  const platforms = filteredPlatforms();
  elements.itemCount.textContent = `${platforms.length}`;
  elements.emptyState.classList.toggle("is-visible", platforms.length === 0);

  elements.platformList.replaceChildren(
    ...platforms.map((platform) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.className = `platform-item${platform.id === selectedId ? " is-selected" : ""}`;
      button.type = "button";
      button.dataset.id = platform.id;

      const info = document.createElement("div");
      info.className = "platform-info";

      const name = document.createElement("span");
      name.className = "platform-name";
      name.textContent = platform.name;

      const meta = document.createElement("span");
      meta.className = "platform-meta";
      meta.textContent = platform.category || "Uncategorized";

      info.append(name, meta);

      const status = document.createElement("span");
      status.className = "status-pill";
      status.dataset.status = platform.status;
      status.textContent = statusLabel(platform.status);

      button.append(info, status);
      item.append(button);
      return item;
    }),
  );
}

function renderDetail() {
  const platform = selectedId ? platformStore.get(selectedId) : null;
  
  // Update mobile layout grid class depending on selection state
  elements.contentGrid.classList.toggle("has-selection", Boolean(platform));

  if (!platform) {
    elements.detailPanel.innerHTML = `
      <div class="detail-empty">
        <h2>Select a platform</h2>
        <p>Open an item to update its status, edit notes, or visit the platform.</p>
      </div>
    `;
    return;
  }

  const openUrl = normalizeUrl(platform.url);
  const statusOptions = STATUS_ORDER.map(
    (status) => `<option value="${status}" ${status === platform.status ? "selected" : ""}>${statusLabel(status)}</option>`,
  ).join("");

  elements.detailPanel.innerHTML = `
    <div class="detail-content">
      <div class="detail-top-nav">
        <button class="back-button" id="backToListButton" type="button">← Back to platforms</button>
      </div>

      <div class="detail-header">
        <div>
          <h2 class="detail-title"></h2>
          <p class="detail-category"></p>
        </div>
        <span class="status-pill" data-status="${platform.status}"></span>
      </div>

      <div class="detail-field">
        <label for="statusSelect">Stage / Status</label>
        <select id="statusSelect">${statusOptions}</select>
      </div>

      <div class="detail-field">
        <label>URL</label>
        <p class="detail-value detail-url"></p>
      </div>

      <div class="detail-field">
        <label>Note</label>
        <p class="detail-value detail-note"></p>
      </div>

      <div class="timestamps-grid">
        <div class="timestamp-item">
          <span>Captured</span>
          <span>${formatDate(platform.createdAt)}</span>
        </div>
        <div class="timestamp-item">
          <span>Last Updated</span>
          <span>${formatDate(platform.updatedAt)}</span>
        </div>
      </div>

      <div class="detail-actions">
        <a class="link-action" id="openPlatformLink" target="_blank" rel="noopener">Open Platform ↗</a>
        <button class="secondary-action" id="editButton" type="button">Edit</button>
        <button class="danger-action" id="deleteButton" type="button">Delete</button>
      </div>
    </div>
  `;

  elements.detailPanel.querySelector(".detail-title").textContent = platform.name;
  elements.detailPanel.querySelector(".detail-category").textContent = platform.category || "Uncategorized";
  elements.detailPanel.querySelector(".status-pill").textContent = statusLabel(platform.status);

  const urlEl = elements.detailPanel.querySelector(".detail-url");
  if (platform.url) {
    urlEl.textContent = platform.url;
    urlEl.classList.remove("is-empty");
  } else {
    urlEl.textContent = "No URL provided";
    urlEl.classList.add("is-empty");
  }

  const noteEl = elements.detailPanel.querySelector(".detail-note");
  if (platform.note) {
    noteEl.textContent = platform.note;
    noteEl.classList.remove("is-empty");
  } else {
    noteEl.textContent = "No notes added";
    noteEl.classList.add("is-empty");
  }

  const link = elements.detailPanel.querySelector("#openPlatformLink");
  if (openUrl) {
    link.href = openUrl;
  } else {
    link.setAttribute("aria-disabled", "true");
    link.removeAttribute("href");
  }
}

function render() {
  renderList();
  renderDetail();
}

function openCaptureDialog(platform = null) {
  elements.captureForm.reset();
  elements.formError.textContent = "";
  elements.editingId.value = platform?.id ?? "";
  elements.dialogTitle.textContent = platform ? "Edit Platform" : "New Platform";
  elements.nameInput.value = platform?.name ?? "";
  elements.categoryInput.value = platform?.category ?? "";
  elements.urlInput.value = platform?.url ?? "";
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
    elements.formError.textContent = "Platform name is required.";
    elements.nameInput.focus();
    return;
  }

  const input = {
    name,
    category: elements.categoryInput.value,
    url: elements.urlInput.value,
    note: elements.noteInput.value,
  };

  const editingId = elements.editingId.value;
  if (editingId) {
    platformStore.update(editingId, input);
    selectedId = editingId;
  } else {
    const newPlatform = platformStore.create(input);
    selectedId = newPlatform.id;
    activeFilter = "ALL";
    elements.filters.forEach((filter) => {
      filter.classList.toggle("is-active", filter.dataset.filter === "ALL");
    });
  }

  closeCaptureDialog();
  render();
}

/* Event Handlers */
elements.captureButton.addEventListener("click", () => openCaptureDialog());
elements.closeDialogButton.addEventListener("click", closeCaptureDialog);
elements.cancelButton.addEventListener("click", closeCaptureDialog);

elements.captureForm.addEventListener("submit", (event) => {
  event.preventDefault();
  savePlatform();
});

elements.platformList.addEventListener("click", (event) => {
  const button = event.target.closest(".platform-item");
  if (!button) {
    return;
  }
  selectedId = button.dataset.id;
  render();
});

elements.filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    elements.filters.forEach((item) => item.classList.toggle("is-active", item === filter));
    const visibleIds = filteredPlatforms().map((platform) => platform.id);
    if (selectedId && !visibleIds.includes(selectedId)) {
      selectedId = null;
    }
    render();
  });
});

elements.detailPanel.addEventListener("change", (event) => {
  if (event.target.id !== "statusSelect" || !selectedId) {
    return;
  }
  platformStore.update(selectedId, { status: event.target.value });
  render();
});

elements.detailPanel.addEventListener("click", (event) => {
  if (event.target.id === "backToListButton") {
    selectedId = null;
    render();
    return;
  }

  if (!selectedId) {
    return;
  }

  if (event.target.id === "editButton") {
    openCaptureDialog(platformStore.get(selectedId));
  }

  if (event.target.id === "deleteButton") {
    const platform = platformStore.get(selectedId);
    if (confirm(`Are you sure you want to delete "${platform?.name || "this platform"}"?`)) {
      platformStore.remove(selectedId);
      selectedId = null;
      render();
    }
  }
});

// Keyboard Shortcuts: Cmd+K / Ctrl+K to open Capture form
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

render();
