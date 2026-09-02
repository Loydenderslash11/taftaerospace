const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const os = require("os");
const path = require("path");

const root = __dirname;
const dataDirs = [
  process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : null,
  path.join(root, "data"),
  path.join(os.tmpdir(), "taft-aerospace-open-house")
].filter(Boolean);
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4173);
let activeDataFile = null;

const categoryAssets = {
  Propulsion: ["assets/rocket-engine-build.avif", "Rocket engine components being assembled", "#ffb75d"],
  Flight: ["assets/stealth-clouds.jpeg", "Advanced aircraft above clouds", "#3dd8c5"],
  Speed: ["assets/x59-flight.webp", "NASA X-59 aircraft flying over a coastline", "#ff6f59"],
  Aerodynamics: ["assets/stealth-clouds.jpeg", "Stealth aircraft flying above clouds", "#95df72"],
  Orbit: ["assets/rocket-launch.avif", "Rocket launching into the sky", "#9b8cff"],
  Systems: ["assets/digital-jet-network.jpg", "Digital wireframe aircraft network", "#70d6ff"],
  Materials: ["assets/turbine-closeup.jpg", "Close-up of precision aerospace machinery", "#a7c957"]
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif"
};

async function getDataFile() {
  if (activeDataFile) return activeDataFile;

  for (const dataDir of dataDirs) {
    const dataFile = path.join(dataDir, "stations.json");

    try {
      await fsp.mkdir(dataDir, { recursive: true });
      try {
        await fsp.access(dataFile, fs.constants.R_OK | fs.constants.W_OK);
      } catch {
        await fsp.writeFile(dataFile, "[]\n");
      }

      activeDataFile = dataFile;
      return activeDataFile;
    } catch (error) {
      console.warn(`Could not use station data directory ${dataDir}: ${error.code || error.message}`);
    }
  }

  throw new Error("No writable station data directory available.");
}

async function ensureDataFile() {
  const dataFile = await getDataFile();
  try {
    await fsp.access(dataFile, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(dataFile, "[]\n");
  }
}

async function readStations() {
  await ensureDataFile();
  try {
    const dataFile = await getDataFile();
    const raw = await fsp.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStations(stations) {
  await ensureDataFile();
  const dataFile = await getDataFile();
  await fsp.writeFile(dataFile, `${JSON.stringify(stations, null, 2)}\n`);
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 24000) {
        request.destroy();
        reject(new Error("Request too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function cleanText(value, fallback, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, maxLength);
}

function cleanTags(value) {
  const tags = Array.isArray(value) ? value : String(value || "").split(",");
  return tags.map((tag) => cleanText(tag, "", 32)).filter(Boolean).slice(0, 6);
}

function isUsableUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeStation(input) {
  const title = cleanText(input.title, "", 90);
  const url = cleanText(input.url, "", 500);
  const category = categoryAssets[input.category] ? input.category : "Flight";
  const submittedBy = cleanText(input.submittedBy, "Guest Presenter", 70);
  const year = Number(input.yearSort);
  const [image, imageAlt, accent] = categoryAssets[category];

  if (!title || !isUsableUrl(url)) return null;

  return {
    id: `shared-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    title,
    category,
    era: Number.isFinite(year) ? String(year) : "Open house",
    yearSort: Number.isFinite(year) ? year : 9000 + Date.now() / 100000000,
    accent,
    image,
    imageAlt,
    submittedBy,
    tags: cleanTags(input.tags),
    description: `${submittedBy} added this open house station for guests to watch during Mr. Lim's Aerospace Class showcase.`,
    url,
    custom: true,
    shared: true
  };
}

async function handleApi(request, response) {
  if (request.method === "GET") {
    try {
      sendJson(response, 200, { stations: await readStations() });
    } catch {
      sendJson(response, 500, { error: "Could not load shared stations." });
    }
    return;
  }

  if (request.method === "POST") {
    try {
      const input = JSON.parse(await readBody(request));
      const station = normalizeStation(input);
      if (!station) {
        sendJson(response, 400, { error: "Station needs a title and a valid video link." });
        return;
      }
      const stations = await readStations();
      stations.push(station);
      stations.sort((a, b) => Number(a.yearSort || 9999) - Number(b.yearSort || 9999));
      await writeStations(stations);
      sendJson(response, 201, { station });
    } catch {
      sendJson(response, 400, { error: "Could not save that station." });
    }
    return;
  }

  if (request.method === "DELETE") {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const pathId = decodeURIComponent(url.pathname.replace(/^\/api\/stations\/?/, ""));
      const id = cleanText(url.searchParams.get("id") || pathId, "", 160);

      if (!id) {
        sendJson(response, 400, { error: "Station id is required." });
        return;
      }

      const stations = await readStations();
      const nextStations = stations.filter((station) => station.id !== id);

      if (nextStations.length === stations.length) {
        sendJson(response, 404, { error: "Station not found." });
        return;
      }

      await writeStations(nextStations);
      sendJson(response, 200, { removed: true, id });
    } catch {
      sendJson(response, 400, { error: "Could not remove that station." });
    }
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const stat = await fsp.stat(filePath);
    const finalPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const extension = path.extname(finalPath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=3600"
    });
    fs.createReadStream(finalPath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/healthz")) {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.url.startsWith("/api/stations")) {
    handleApi(request, response);
    return;
  }
  serveStatic(request, response);
});

server.listen(port, host, () => {
  console.log(`Taft Aerospace Open House is running at http://localhost:${port}`);
});
