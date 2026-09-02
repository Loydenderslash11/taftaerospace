const defaultVideos = [
  {
    title: "Airships",
    category: "Flight",
    era: "1852",
    yearSort: 1852,
    accent: "#3dd8c5",
    image: "assets/stealth-clouds.jpeg",
    imageAlt: "Advanced aircraft above clouds",
    submittedBy: "Evan Sampson",
    tags: ["airships", "early flight", "lighter-than-air"],
    description: "An open house station about airships and early lighter-than-air flight.",
    url: "https://drive.google.com/file/d/1V4uGF088WQQyAKEudKFCj5993H51BNeh/view"
  },
  {
    title: "Animals in Space",
    category: "Orbit",
    era: "1947",
    yearSort: 1947,
    accent: "#9b8cff",
    image: "assets/rocket-launch.avif",
    imageAlt: "Rocket launching into the sky",
    submittedBy: "Lexi Serna",
    tags: ["animals", "spaceflight", "biology"],
    description: "An open house station about the animals that helped scientists study space travel.",
    url: "https://drive.google.com/file/d/1y1hK3aZ8BIPjy06zj2rSHbqv-Q7DXnOX/view"
  },
  {
    title: "Intercontinental Ballistic Missiles",
    category: "Propulsion",
    era: "1957",
    yearSort: 1957,
    accent: "#ffb75d",
    image: "assets/rocket-engine-build.avif",
    imageAlt: "Rocket engine components being assembled",
    submittedBy: "Shai Delkhah",
    tags: ["ICBM", "missiles", "rocket technology"],
    description: "An open house station about how missile technology shaped long-range aerospace systems.",
    url: "https://drive.google.com/file/d/1jTi-Ftqr2JnWlv1_YzmWoKp0rHcTk74v/view?usp=drivesdk"
  },
  {
    title: "Voyager Missions",
    category: "Orbit",
    era: "1977",
    yearSort: 1977,
    accent: "#70d6ff",
    image: "assets/digital-jet-network.jpg",
    imageAlt: "Digital wireframe aircraft network",
    submittedBy: "Raeesha J",
    tags: ["Voyager", "deep space", "NASA"],
    description: "An open house station about the Voyager missions and deep-space exploration.",
    url: "https://drive.google.com/file/d/1gQXUi3S4gRkLftfeJjOmqIWof2hWsN37/view"
  },
  {
    title: "Reusable Rockets 1980-Present",
    category: "Propulsion",
    era: "1980-Present",
    yearSort: 1980,
    accent: "#2ec4b6",
    image: "assets/rocket-engine-build.avif",
    imageAlt: "Rocket engine construction for reusable spaceflight",
    submittedBy: "Avneesh Koneri",
    tags: ["reusable rockets", "launch systems", "spaceflight"],
    description: "An open house station about the rise of reusable rockets from 1980 to the present.",
    url: "https://drive.google.com/file/u/6/d/1I4XT4QmZ5ZMzsPfIkB47X9OLq3A5jbY0/view?usp=drivesdk"
  },
  {
    title: "Davit Aerospace Station",
    category: "Systems",
    era: "Open house",
    yearSort: 9001,
    accent: "#70d6ff",
    image: "assets/digital-jet-network.jpg",
    imageAlt: "Digital wireframe aircraft network",
    submittedBy: "Davit",
    tags: ["student station", "aerospace"],
    description: "Davit's open house aerospace station.",
    url: "https://drive.google.com/file/d/1V_Fegbq8Qzv7neZHydJWuwXzzYfw2TgO/view"
  },
  {
    title: "Brandon Gerber Aerospace Station",
    category: "Systems",
    era: "Open house",
    yearSort: 9002,
    accent: "#70d6ff",
    image: "assets/blackbird-runway.jpeg",
    imageAlt: "Black stealth aircraft parked on a runway",
    submittedBy: "Brandon Gerber",
    tags: ["student station", "aerospace"],
    description: "Brandon Gerber's open house aerospace station.",
    url: "https://drive.google.com/file/d/1ufzAYir3umP4sJtddgGR9U9aoLI8NXRA/view"
  }
];

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

const STATIONS_API = "/api/stations";
let sharedStoreAvailable = false;

const state = {
  category: "All",
  query: "",
  items: [],
  removedIds: JSON.parse(localStorage.getItem("taft-aerospace-removed-stations") || "[]"),
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
const syncStatus = document.querySelector("#syncStatus");
const stationCountMetric = document.querySelector("#stationCountMetric");
const slotCountMetric = document.querySelector("#slotCountMetric");

async function init() {
  await loadItems();
  pruneQueue();
  renderTabs();
  renderGrid();
  renderTimeline();
  renderQueue();
}

async function loadItems() {
  const legacyLinks = JSON.parse(localStorage.getItem("taft-aerospace-links") || "{}");
  const customVideos = JSON.parse(localStorage.getItem("taft-aerospace-custom-videos") || "[]");
  const sharedVideos = await fetchSharedStations();
  const addedVideos = sharedStoreAvailable ? sharedVideos : customVideos;
  const removedIds = new Set(state.removedIds);

  state.items = [
    ...defaultVideos.map((video, index) => ({
      ...video,
      id: `default-${index}`,
      tags: video.tags || [],
      url: legacyLinks[video.title] || legacyLinks[index] || video.url
    })),
    ...addedVideos
  ].filter((video) => !removedIds.has(video.id)).sort(sortChronologically);

  updateSyncStatus();
}

function saveCustomVideos() {
  if (sharedStoreAvailable) return;
  const customVideos = state.items.filter((video) => video.custom);
  localStorage.setItem("taft-aerospace-custom-videos", JSON.stringify(customVideos));
}

function persistQueue() {
  localStorage.setItem("taft-aerospace-queue", JSON.stringify(state.queue));
}

function saveRemovedIds() {
  if (sharedStoreAvailable) return;
  localStorage.setItem("taft-aerospace-removed-stations", JSON.stringify(state.removedIds));
}

function pruneQueue() {
  const validIds = new Set(state.items.map((video) => video.id));
  state.queue = state.queue.filter((id) => validIds.has(id));
  persistQueue();
}

async function fetchSharedStations() {
  if (location.protocol === "file:") {
    sharedStoreAvailable = false;
    return [];
  }

  try {
    const response = await fetch(STATIONS_API, { cache: "no-store" });
    if (!response.ok) throw new Error("Shared station fetch failed");
    const data = await response.json();
    sharedStoreAvailable = true;
    state.removedIds = Array.isArray(data.removedIds) ? data.removedIds : [];
    return Array.isArray(data.stations) ? data.stations : [];
  } catch {
    sharedStoreAvailable = false;
    state.removedIds = JSON.parse(localStorage.getItem("taft-aerospace-removed-stations") || "[]");
    return [];
  }
}

function updateSyncStatus() {
  syncStatus.textContent = sharedStoreAvailable
    ? "Shared mode active: stations added or removed here update for everyone visiting this hosted site."
    : "Private mode: changes stay on this browser unless the site is opened through server.js.";
  clearAdded.disabled = sharedStoreAvailable;
  clearAdded.textContent = sharedStoreAvailable ? "Shared Save On" : "Reset Private Changes";
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
  renderMetrics();

  if (!visible.length) {
    grid.innerHTML = state.items.length
      ? `<div class="empty-state">No stations match that search.</div>`
      : `<div class="empty-state">No presentations yet. Add the first open house station below.</div>`;
    return;
  }

  const stationCards = visible.sort(sortChronologically).map((video, index) => renderVideoCard(video, index, query));
  if (state.category === "All" && !query) stationCards.push(...renderOpenSlots());
  grid.innerHTML = stationCards.join("");
}

function renderMetrics() {
  stationCountMetric.textContent = String(state.items.length);
  slotCountMetric.textContent = String(Math.max(0, Math.min(3, 10 - state.items.length)));
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
          <button class="remove-station" type="button" data-remove-id="${escapeHtml(video.id)}" aria-label="Remove ${escapeHtml(video.title)}">Remove</button>
        </div>
      </div>
    </article>
  `;
}

function renderOpenSlots() {
  const slotCount = Math.max(0, Math.min(3, 10 - state.items.length));
  return Array.from({ length: slotCount }, (_, index) => `
    <article class="video-card slot-card">
      <div class="thumb" style="--thumb-bg: linear-gradient(135deg, #12161d, #3dd8c5 130%)">
        <img src="assets/x59-flight.webp" alt="" loading="lazy">
        <span class="orbit-ring" aria-hidden="true"></span>
        <span class="play-chip"><span class="play-icon" aria-hidden="true"></span>Open Slot</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="tag">Available</span>
          <span class="tag">Open house</span>
        </div>
        <h3>Open Station ${index + 1}</h3>
        <span class="station-owner">Ready for another presenter</span>
        <p>Add a name, title, Drive link, year, and tags to fill this spot.</p>
        <a class="card-button slot-link" href="#add-station">Add Station</a>
      </div>
    </article>
  `);
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
  const queuedVideos = orderedQueueIds().map(findVideoById).filter(Boolean);
  queueDock.classList.toggle("is-collapsed", state.queueCollapsed);
  queueToggle.textContent = state.queueCollapsed ? "+" : "-";
  queueToggle.setAttribute("aria-label", state.queueCollapsed ? "Expand queue" : "Collapse queue");
  queueTitle.textContent = `${queuedVideos.length} chronological`;
  playQueue.disabled = queuedVideos.length === 0;
  clearQueue.disabled = queuedVideos.length === 0;
  nextQueued.disabled = !hasNextQueued();

  queueList.innerHTML = queuedVideos.length
    ? queuedVideos
        .map(
          (video) => `
            <li>
              ${escapeHtml(video.title)}
              <small>${escapeHtml(video.era)} / ${escapeHtml(video.submittedBy || "Taft Aerospace")}</small>
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

  const queueIndex = orderedQueueIds().indexOf(id);
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
  openVideoById(orderedQueueIds()[0]);
}

function playNextQueued() {
  if (!hasNextQueued()) return;
  state.currentQueuePosition += 1;
  openVideoById(orderedQueueIds()[state.currentQueuePosition]);
}

function hasNextQueued() {
  const orderedIds = orderedQueueIds();
  return (
    orderedIds.length > 0 &&
    state.currentQueuePosition >= 0 &&
    state.currentQueuePosition < orderedIds.length - 1
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

  state.queue = selected.sort((a, b) => sortChronologically(findVideoById(a), findVideoById(b)));
  state.currentQueuePosition = 0;
  state.queueCollapsed = false;
  persistQueue();
  renderGrid();
  renderQueue();
  pulseQueue();
  openVideoById(state.queue[0]);
}

async function addStation(event) {
  event.preventDefault();
  const formData = new FormData(stationForm);
  const submittedBy = String(formData.get("presenterName") || "").trim() || "Guest Presenter";
  const title = String(formData.get("stationTitle") || "").trim();
  const url = String(formData.get("stationLink") || "").trim();
  const category = String(formData.get("stationCategory") || "Flight").trim();
  const year = Number(formData.get("stationYear"));
  const tags = String(formData.get("stationTags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
  const [image, imageAlt] = imageByCategory[category] || imageByCategory.Flight;

  if (!title || !isUsableUrl(url)) return;

  const station = {
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    category,
    era: Number.isFinite(year) ? String(year) : "Open house",
    yearSort: Number.isFinite(year) ? year : 9000 + state.items.length,
    accent: accentByCategory[category] || "#3dd8c5",
    image,
    imageAlt,
    submittedBy,
    tags,
    description: `${submittedBy} added this open house station for guests to watch during Mr. Lim's Aerospace Class showcase.`,
    url,
    custom: true
  };

  if (sharedStoreAvailable) {
    const savedStation = await saveSharedStation(station);
    if (!savedStation) return;
    state.items.push(savedStation);
  } else {
    state.items.push(station);
    saveCustomVideos();
  }

  stationForm.reset();
  renderTabs();
  state.items.sort(sortChronologically);
  renderGrid();
  renderQueue();
}

function clearAddedStations() {
  if (sharedStoreAvailable) {
    updateSyncStatus();
    return;
  }

  state.removedIds = [];
  localStorage.removeItem("taft-aerospace-removed-stations");
  state.items = state.items.filter((video) => !video.custom);
  localStorage.removeItem("taft-aerospace-custom-videos");
  loadItems().then(() => {
    pruneQueue();
    renderTabs();
    renderGrid();
    renderQueue();
  });
}

async function saveSharedStation(station) {
  try {
    const response = await fetch(STATIONS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(station)
    });
    if (!response.ok) throw new Error("Shared station save failed");
    const data = await response.json();
    return data.station;
  } catch {
    sharedStoreAvailable = false;
    updateSyncStatus();
    saveCustomVideos();
    return station;
  }
}

async function removeStation(id) {
  const station = findVideoById(id);
  if (!station) return;

  const confirmed = window.confirm(`Remove "${station.title}" from the open house station list?`);
  if (!confirmed) return;

  if (sharedStoreAvailable) {
    const removed = await deleteSharedStation(id);
    if (!removed) return;
  } else if (!state.removedIds.includes(id)) {
    state.removedIds.push(id);
    saveRemovedIds();
  }

  state.items = state.items.filter((video) => video.id !== id);
  state.queue = state.queue.filter((queuedId) => queuedId !== id);
  state.currentQueuePosition = Math.min(state.currentQueuePosition, state.queue.length - 1);
  saveCustomVideos();
  persistQueue();
  renderTabs();
  renderGrid();
  renderQueue();
}

async function deleteSharedStation(id) {
  try {
    const response = await fetch(`${STATIONS_API}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Shared station delete failed");
    return true;
  } catch {
    syncStatus.textContent = "That station could not be removed from the shared list. Try again after the site reconnects.";
    return false;
  }
}

function findVideoById(id) {
  return state.items.find((video) => video.id === id);
}

function orderedQueueIds() {
  return [...state.queue].sort((a, b) => sortChronologically(findVideoById(a), findVideoById(b)));
}

function sortChronologically(a, b) {
  const firstYear = Number.isFinite(Number(a?.yearSort)) ? Number(a.yearSort) : 9999;
  const secondYear = Number.isFinite(Number(b?.yearSort)) ? Number(b.yearSort) : 9999;
  if (firstYear !== secondYear) return firstYear - secondYear;
  return String(a?.title || "").localeCompare(String(b?.title || ""));
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
  const removeButton = event.target.closest("button[data-remove-id]");
  if (removeButton) {
    removeStation(removeButton.dataset.removeId);
    return;
  }

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
