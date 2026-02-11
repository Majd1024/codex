const STORAGE_KEY = "website_requests_v1";

const form = document.getElementById("reqForm");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");
const jsonOut = document.getElementById("jsonOut");
const exportStatus = document.getElementById("exportStatus");

// From the updated HTML
const hiddenFrame = document.getElementById("hiddenFrame");
const sendBtn = document.getElementById("sendBtn");

const pagesSelected = document.getElementById("pagesSelected");
const featuresSelected = document.getElementById("featuresSelected");
const logoFileNameHidden = document.getElementById("logoFileName");
const imageFilesNamesHidden = document.getElementById("imageFilesNames");

const logoFileInput = document.getElementById("logoFileInput");
const imageFilesInput = document.getElementById("imageFilesInput");

let isSubmitting = false;

function nowISO() {
  return new Date().toISOString();
}

function getCheckedValues(containerId) {
  const c = document.getElementById(containerId);
  return [...c.querySelectorAll('input[type="checkbox"]:checked')].map(x => x.value);
}

function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRequests(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const items = loadRequests();
  listEl.innerHTML = "";

  if (items.length === 0) {
    listEl.innerHTML = `<div class="muted">No saved requests yet. Submit the form to create the first one.</div>`;
    return;
  }

  items.slice().reverse().forEach(item => {
    const pages = (item.pages || []).map(p => `<span class="pill">${escapeHTML(p)}</span>`).join(" ");
    const feats = (item.features || []).map(f => `<span class="pill">${escapeHTML(f)}</span>`).join(" ");

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${escapeHTML(item.projectName || "Untitled Project")}</strong>
      <div class="muted" style="margin-top:6px;">
        ${escapeHTML(item.fullName)} • ${escapeHTML(item.email)}
      </div>

      <div class="meta">
        <span class="pill">Type: ${escapeHTML(item.websiteType)}</span>
        <span class="pill">Style: ${escapeHTML(item.style)}</span>
        <span class="pill">Dark: ${escapeHTML(item.darkMode)}</span>
        ${item.deadline ? `<span class="pill">Deadline: ${escapeHTML(item.deadline)}</span>` : ""}
      </div>

      ${pages ? `<div class="meta" style="margin-top:10px; gap:6px;">Pages: ${pages}</div>` : ""}
      ${feats ? `<div class="meta" style="margin-top:8px; gap:6px;">Features: ${feats}</div>` : ""}

      <div class="meta" style="margin-top:10px;">
        <span class="pill">Primary: ${escapeHTML(item.primaryColor)}</span>
        <span class="pill">Secondary: ${escapeHTML(item.secondaryColor)}</span>
        <span class="pill">Accent: ${escapeHTML(item.accentColor)}</span>
      </div>

      <div class="small" style="margin-top:10px;">
        <span class="muted">Saved:</span> ${escapeHTML(new Date(item.createdAt).toLocaleString())}
        ${item.logoFileName ? `<br/><span class="muted">Logo:</span> ${escapeHTML(item.logoFileName)}` : ""}
        ${item.imageFileNames?.length ? `<br/><span class="muted">Images:</span> ${escapeHTML(item.imageFileNames.join(", "))}` : ""}
      </div>
    `;
    listEl.appendChild(div);
  });
}

function showStatus(el, text, cls) {
  el.textContent = text;
  el.className = "status " + (cls || "");
}

function getLogoFilename() {
  return logoFileInput?.files?.[0]?.name || "";
}

function getImagesFilenames() {
  const files = imageFilesInput?.files;
  return files && files.length ? [...files].map(f => f.name) : [];
}

// When user submits:
// 1) validate + save locally
// 2) fill hidden fields for Excel
// 3) allow form to submit to iframe (NO preventDefault)
form.addEventListener("submit", () => {
  // Build payload from form fields (no FormData needed)
  const payload = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: nowISO(),

    fullName: form.fullName?.value?.trim(),
    email: form.email?.value?.trim(),
    projectName: form.projectName?.value?.trim(),
    deadline: form.deadline?.value || "",

    websiteType: form.websiteType?.value || "",
    style: form.style?.value || "",

    pages: getCheckedValues("pages"),
    features: getCheckedValues("features"),

    primaryColor: form.primaryColor?.value || "",
    secondaryColor: form.secondaryColor?.value || "",
    accentColor: form.accentColor?.value || "",
    darkMode: form.darkMode?.value || "",
    fonts: form.fonts?.value?.trim() || "",

    logoFileName: getLogoFilename(),
    imageFileNames: getImagesFilenames(),

    aboutText: form.aboutText?.value?.trim() || "",
    services: form.services?.value?.trim() || "",
    contactInfo: form.contactInfo?.value?.trim() || "",
    socialLinks: form.socialLinks?.value?.trim() || "",

    exampleLinks: form.exampleLinks?.value?.trim() || "",
    likes: form.likes?.value?.trim() || "",
    avoid: form.avoid?.value?.trim() || "",
    notes: form.notes?.value?.trim() || ""
  };

  // basic extra validation (in addition to HTML required)
  if (!payload.fullName || !payload.email || !payload.websiteType || !payload.style) {
    showStatus(statusEl, "❌ Please fill required fields.", "bad");
    // block submission
    event.preventDefault();
    return;
  }

  // Save locally
  const items = loadRequests();
  items.push(payload);
  saveRequests(items);
  render();

  // Fill hidden inputs that are sent to Excel / Apps Script
  pagesSelected.value = payload.pages.join(", ");
  featuresSelected.value = payload.features.join(", ");
  logoFileNameHidden.value = payload.logoFileName;
  imageFilesNamesHidden.value = payload.imageFileNames.join(", ");

  // UI: show sending
  isSubmitting = true;
  showStatus(statusEl, "Sending...", "");
  if (sendBtn) sendBtn.disabled = true;
});

// When iframe loads => request finished
hiddenFrame.addEventListener("load", () => {
  // ignore initial iframe load on page open
  if (!isSubmitting) return;

  isSubmitting = false;
  showStatus(statusEl, "✅ Form has been sent", "ok");
  if (sendBtn) sendBtn.disabled = false;

  // Reset the visible form (hidden fields will clear too)
  form.reset();
});

// Clear saved requests
document.getElementById("clearAll").addEventListener("click", () => {
  const ok = confirm("Delete all saved requests from this browser?");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  jsonOut.style.display = "none";
  jsonOut.textContent = "";
  showStatus(statusEl, "Cleared.", "");
  exportStatus.textContent = "";
  render();
});

// Export JSON
document.getElementById("exportJson").addEventListener("click", () => {
  const items = loadRequests();
  const txt = JSON.stringify(items, null, 2);
  jsonOut.textContent = txt;
  jsonOut.style.display = "block";
  exportStatus.textContent = `Exported ${items.length} request(s).`;
});

// Copy JSON
document.getElementById("copyJson").addEventListener("click", async () => {
  const items = loadRequests();
  const txt = JSON.stringify(items, null, 2);

  try {
    await navigator.clipboard.writeText(txt);
    exportStatus.textContent = "✅ Copied JSON to clipboard.";
  } catch {
    exportStatus.textContent = "❌ Copy failed (browser blocked). Use Export JSON and copy manually.";
  }
});

// initial render
render();
