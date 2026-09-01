const defaultVideos = [];

const imageByCategory = {
  Propulsion: ["assets/rocket-engine-build.avif", "Rocket engine components being assembled"],
  Flight: ["assets/stealth-clouds.jpeg", "Advanced aircraft above clouds"],
  Speed: ["assets/x59-flight.webp", "NASA X-59 aircraft flying over a coastline"],
  Aerodynamics: ["assets/stealth-clouds.jpeg", "Stealth aircraft flying above clouds"],
  Orbit: ["assets/rocket-launch.avif", "Rocket launching into the sky"],
  Systems: ["assets/digital-jet-network.jpg", "Digital wireframe aircraft network"],
  Materials: ["assets/turbine-closeup.jpg", "Close-up of precision aerospace machinery"]
};

const accentByCategory = {
  Propulsion: "#ffb75d",
  Flight: "#3dd8c5",
  Speed: "#ff6f59",
  Aerodynamics: "#95df72",
  Orbit: "#9b8cff",
  Systems: "#70d6ff",
  Materials: "#a7c957"
};

const timelineSteps = [
  ["Lift", "Aircraft prove controlled flight and make the atmosphere an engineering medium."],
  ["Power", "Engines move from pistons to jets and rockets, unlocking altitude and speed."],
  ["Speed", "Supersonic design forces engineers to solve shock waves, heat, and control."],
  ["Orbit", "Rockets, guidance, and satellites turn aerospace into a planetary network."],
  ["Open House", "Guests choose stations, build a queue, and follow the discoveries in order."]
];

const state = {
  category: "All",
  query: "",
  items: [],
  queue: JSON.parse(localStorage.getItem("taft-aerospace-queue") || "[]"),
  currentQueuePosition: -1,
  queueCollapsed: false
};

const grid = document.querySelector("#videoGrid");
const tabs = document.querySelector("#filterTabs");
const searchInput = document.querySelector("#searchInput");
const modal = document.querySelector("#videoModal");
const playerShell = document.querySelector("#playerShell");
const modalTitle = document.querySelector("#modalTitle");
const modalCategory = document.querySelector("#modalCategory");
const modalDescription = document.querySelector("#modalDescription");
const stationForm = document.querySelector("#manifestForm");
const clearAdded = document.querySelector("#clearLinks");
const randomLaunch = document.querySelector("#randomLaunch");
const timeline = document.querySelector("#timeline");
const queueDock = document.querySelector("#queueDock");
const queueTitle = document.querySelector("#queueTitle");
const queueList = document.querySelector("#queueList");
const queueToggle = document.querySelector("#queueToggle");
const playQueue = document.querySelector("#playQueue");
const clearQueue = document.querySelector("#clearQueue");
const nextQueued = document.querySelector("#nextQueued");
const fullScreenVideo = document.querySelector("#fullScreenVideo");
const openDriveVideo = document.querySelector("#openDriveVideo");

function init() {
  loadItems();
  pruneQueue();
  renderTabs();
  renderGrid();
  renderTimeline();
  renderQueue();
}

function loadItems() {
  const legacyLinks = JSON.parse(localStorage.getItem("taft-aerospace-links") || "{}");
  const customVideos = JSON.parse(localStorage.getItem("taft-aerospace-custom-videos") || "[]");

  state.items = [
    ...defaultVideos.map((video, index) => ({
      ...video,
      id: `default-${index}`,
      tags: video.tags || [],
      url: legacyLinks[video.title] || legacyLinks[index] || video.url
    })),
    ...customVideos
  ];
}

function saveCustomVideos() {
  const customVideos = state.items.filter((video) => video.custom);
  localStorage.setItem("taft-aerospace-custom-videos", JSON.stringify(customVideos));
}

function persistQueue() {
  localStorage.setItem("taft-aerospace-queue", JSON.stringify(state.queue));
}

function pruneQueue() {
  const validIds = new Set(state.items.map((video) => video.id));
  state.queue = state.queue.filter((id) => validIds.has(id));
  persistQueue();
}

function renderTabs() {
  const categories = ["All", ...new Set(state.items.map((video) => video.category))];
  tabs.innerHTML = categories
    .map(
      (category) => `
        <button type="button" role="tab" aria-selected="${category === state.category}" data-category="${escapeHtml(category)}">
          ${escapeHtml(category)}
        </button>
      `
    )
    .join("");
}

function renderGrid() {
  const query = state.query.trim().toLowerCase();
  const visible = state.items.filter((video) => {
    const matchesCategory = state.category === "All" || video.category === state.category;
    const haystack =
      `${video.title} ${video.category} ${video.era} ${video.submittedBy} ${video.description} ${(video.tags || []).join(" ")}`.toLowerCase();
    return matchesCategory && haystack.includes(query);
  });

  if (!visible.length) {
    grid.innerHTML = state.items.length
      ? `<div class="empty-state">No stations match that search.</div>`
      : `<div class="empty-state">No presentations yet. Add the first open house station below.</div>`;
    return;
  }

  grid.innerHTML = visible.map((video, index) => renderVideoCard(video, index, query)).join("");
}

function renderVideoCard(video, index, query) {
  const selected = state.queue.includes(video.id);
  const featured = index < 2 && state.category === "All" && !query ? "featured" : "";
  const selectedClass = selected ? "is-selected" : "";

  return `
    <article class="video-card ${featured} ${selectedClass}">
      <div class="thumb" style="--thumb-bg: ${thumbnailBackground(video, index)}">
        <img src="${escapeHtml(video.image)}" alt="${escapeHtml(video.imageAlt)}" loading="lazy">
        <span class="orbit-ring" aria-hidden="true"></span>
        <span class="play-chip"><span class="play-icon" aria-hidden="true"></span>${video.url ? "Ready" : "Queued"}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="tag">${escapeHtml(video.category)}</span>
          <span class="tag">${escapeHtml(video.era)}</span>
          ${(video.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          ${video.url ? `<span class="tag status-live">Drive linked</span>` : ""}
        </div>
        <h3>${escapeHtml(video.title)}</h3>
        <span class="station-owner">Presented by ${escapeHtml(video.submittedBy || "Taft Aerospace")}</span>
        <p>${escapeHtml(video.description)}</p>
        <div class="selection-row">
          <label class="select-station">
            <input type="checkbox" data-select-id="${escapeHtml(video.id)}" ${selected ? "checked" : ""}>
            Select
          </label>
          <button class="card-button" type="button" data-play-id="${escapeHtml(video.id)}">
            ${video.url ? "Play" : "Preview"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function thumbnailBackground(video, index) {
  const angle = 125 + (index % 4) * 12;
  const deep = index % 2 ? "#12161d" : "#11100d";
  return `linear-gradient(${angle}deg, ${deep}, ${video.accent} 125%)`;
}

function renderTimeline() {
  timeline.innerHTML = timelineSteps
    .map(
      ([title, body], index) => `
        <article class="timeline-step" style="--accent: ${defaultVideos[index * 3]?.accent || "#3dd8c5"}">
          <span>${index + 1}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(body)}</p>
        </article>
      `
    )
    .join("");
}

function renderQueue() {
  const queuedVideos = state.queue.map(findVideoById).filter(Boolean);
  queueDock.classList.toggle("is-collapsed", state.queueCollapsed);
  queueToggle.textContent = state.queueCollapsed ? "+" : "-";
  queueToggle.setAttribute("aria-label", state.queueCollapsed ? "Expand queue" : "Collapse queue");
  queueTitle.textContent = `${queuedVideos.length} selected`;
  playQueue.disabled = queuedVideos.length === 0;
  clearQueue.disabled = queuedVideos.length === 0;
  nextQueued.disabled = !hasNextQueued();

  queueList.innerHTML = queuedVideos.length
    ? queuedVideos
        .map(
          (video) => `
            <li>
              ${escapeHtml(video.title)}
              <small>${escapeHtml(video.category)} / ${escapeHtml(video.submittedBy || "Taft Aerospace")}</small>
            </li>
          `
        )
        .join("")
    : `<li class="queue-empty">Select stations to build a route.</li>`;
}

function addToQueue(id) {
  if (!state.queue.includes(id)) {
    state.queue.push(id);
    persistQueue();
  }
  renderGrid();
  renderQueue();
  pulseQueue();
}

function removeFromQueue(id) {
  state.queue = state.queue.filter((queuedId) => queuedId !== id);
  state.currentQueuePosition = Math.min(state.currentQueuePosition, state.queue.length - 1);
  persistQueue();
  renderGrid();
  renderQueue();
}

function openVideoById(id) {
  const video = findVideoById(id);
  if (!video) return;
  const index = state.items.findIndex((item) => item.id === id);
  const embed = getDriveEmbed(video.url);

  playerShell.replaceChildren();
  if (embed) {
    const frame = document.createElement("iframe");
    frame.src = embed;
    frame.allow = "autoplay; fullscreen; picture-in-picture";
    frame.allowFullscreen = true;
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("webkitallowfullscreen", "");
    frame.setAttribute("mozallowfullscreen", "");
    frame.title = video.title;
    playerShell.append(frame);
  } else {
    const preview = document.createElement("img");
    const placeholder = document.createElement("div");
    const number = document.createElement("strong");
    const title = document.createElement("p");

    preview.className = "modal-image";
    preview.src = video.image;
    preview.alt = "";
    placeholder.className = "placeholder-player";
    number.textContent = String(index + 1).padStart(2, "0");
    title.textContent = video.title;
    placeholder.append(number, title);
    playerShell.append(preview, placeholder);
  }

  const queueIndex = state.queue.indexOf(id);
  if (queueIndex >= 0) state.currentQueuePosition = queueIndex;

  modalTitle.textContent = video.title;
  modalCategory.textContent = `${video.category} / ${video.era} / ${video.submittedBy || "Taft Aerospace"}`;
  modalDescription.textContent = video.description;
  updateVideoActions(video);
  renderQueue();
  modal.showModal();
}

function updateVideoActions(video) {
  const canOpen = isUsableUrl(video.url);
  const canFullscreen =
    typeof playerShell.requestFullscreen === "function" ||
    typeof playerShell.webkitRequestFullscreen === "function";
  openDriveVideo.href = canOpen ? video.url : "#";
  openDriveVideo.classList.toggle("is-disabled", !canOpen);
  openDriveVideo.setAttribute("aria-disabled", String(!canOpen));
  fullScreenVideo.disabled = !canFullscreen && !canOpen;
}

async function requestPlayerFullscreen() {
  if (typeof playerShell.webkitRequestFullscreen === "function") {
    playerShell.webkitRequestFullscreen();
    return;
  }

  if (typeof playerShell.requestFullscreen !== "function") {
    if (!openDriveVideo.classList.contains("is-disabled")) {
      window.open(openDriveVideo.href, "_blank", "noopener");
    }
    return;
  }

  try {
    await playerShell.requestFullscreen();
  } catch {
    if (!openDriveVideo.classList.contains("is-disabled")) {
      window.open(openDriveVideo.href, "_blank", "noopener");
    }
  }
}

function playSelectedQueue() {
  if (!state.queue.length) return;
  state.currentQueuePosition = 0;
  openVideoById(state.queue[0]);
}

function playNextQueued() {
  if (!hasNextQueued()) return;
  state.currentQueuePosition += 1;
  openVideoById(state.queue[state.currentQueuePosition]);
}

function hasNextQueued() {
  return (
    state.queue.length > 0 &&
    state.currentQueuePosition >= 0 &&
    state.currentQueuePosition < state.queue.length - 1
  );
}

function buildSurpriseRoute() {
  if (!state.items.length) {
    document.querySelector("#stationTitle").focus();
    document.querySelector("#add-station").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const candidates = shuffle([...state.items]);
  const selected = [];
  const usedCategories = new Set();

  candidates.forEach((video) => {
    if (selected.length >= 5) return;
    if (!usedCategories.has(video.category)) {
      selected.push(video.id);
      usedCategories.add(video.category);
    }
  });

  candidates.forEach((video) => {
    if (selected.length < 5 && !selected.includes(video.id)) selected.push(video.id);
  });

  state.queue = selected;
  state.currentQueuePosition = 0;
  state.queueCollapsed = false;
  persistQueue();
  renderGrid();
  renderQueue();
  pulseQueue();
  openVideoById(state.queue[0]);
}

function addStation(event) {
  event.preventDefault();
  const formData = new FormData(stationForm);
  const submittedBy = String(formData.get("presenterName") || "").trim() || "Guest Presenter";
  const title = String(formData.get("stationTitle") || "").trim();
  const url = String(formData.get("stationLink") || "").trim();
  const category = String(formData.get("stationCategory") || "Flight").trim();
  const tags = String(formData.get("stationTags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
  const [image, imageAlt] = imageByCategory[category] || imageByCategory.Flight;

  if (!title || !isUsableUrl(url)) return;

  state.items.push({
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    category,
    era: "Open house",
    accent: accentByCategory[category] || "#3dd8c5",
    image,
    imageAlt,
    submittedBy,
    tags,
    description: `${submittedBy} added this open house station for guests to watch during Mr. Lim's Aerospace Class showcase.`,
    url,
    custom: true
  });

  saveCustomVideos();
  stationForm.reset();
  renderTabs();
  renderGrid();
}

function clearAddedStations() {
  state.items = state.items.filter((video) => !video.custom);
  localStorage.removeItem("taft-aerospace-custom-videos");
  pruneQueue();
  renderTabs();
  renderGrid();
  renderQueue();
}

function findVideoById(id) {
  return state.items.find((video) => video.id === id);
}

function getDriveEmbed(url) {
  if (!isUsableUrl(url)) return "";
  const trimmed = url.trim();
  const idPatterns = [/\/d\/([^/]+)/, /[?&]id=([^&]+)/, /uc\?export=\w+&id=([^&]+)/];
  const match = idPatterns.map((pattern) => trimmed.match(pattern)).find(Boolean);
  if (match?.[1]) {
    return `https://drive.google.com/file/d/${encodeURIComponent(match[1])}/preview`;
  }
  return trimmed;
}

function isUsableUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function pulseQueue() {
  queueDock.animate(
    [
      { transform: "translateY(0)", borderColor: "rgba(255, 255, 255, 0.18)" },
      { transform: "translateY(-0.35rem)", borderColor: "rgba(255, 183, 93, 0.82)" },
      { transform: "translateY(0)", borderColor: "rgba(255, 255, 255, 0.18)" }
    ],
    { duration: 520, easing: "ease-out" }
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  renderTabs();
  renderGrid();
});

grid.addEventListener("click", (event) => {
  const playButton = event.target.closest("button[data-play-id]");
  if (playButton) openVideoById(playButton.dataset.playId);
});

grid.addEventListener("change", (event) => {
  const checkbox = event.target.closest("input[data-select-id]");
  if (!checkbox) return;
  if (checkbox.checked) {
    addToQueue(checkbox.dataset.selectId);
  } else {
    removeFromQueue(checkbox.dataset.selectId);
  }
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderGrid();
});

document.querySelector("#closeModal").addEventListener("click", () => modal.close());

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

stationForm.addEventListener("submit", addStation);
clearAdded.addEventListener("click", clearAddedStations);
randomLaunch.addEventListener("click", buildSurpriseRoute);
playQueue.addEventListener("click", playSelectedQueue);
clearQueue.addEventListener("click", () => {
  state.queue = [];
  state.currentQueuePosition = -1;
  persistQueue();
  renderGrid();
  renderQueue();
});
nextQueued.addEventListener("click", playNextQueued);
fullScreenVideo.addEventListener("click", requestPlayerFullscreen);
openDriveVideo.addEventListener("click", (event) => {
  if (openDriveVideo.classList.contains("is-disabled")) event.preventDefault();
});
queueToggle.addEventListener("click", () => {
  state.queueCollapsed = !state.queueCollapsed;
  renderQueue();
});

init();
