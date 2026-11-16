import express from "express";
import { WebSocketServer } from "ws";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// --- Load mock subtitles from disk (single source of truth) ---
const subtitlesPath = join(__dirname, "subtitles.json");
let subtitles = JSON.parse(readFileSync(subtitlesPath, "utf-8"));

// --- In-memory state: current active subtitle index ---
let currentIndex = 0;

// --- HTTP server (serves a simple status page + health check) ---
const app = express();
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, total: subtitles.length, currentIndex }));
app.get("/subtitles", (_req, res) => res.json(subtitles));
app.get("/", (_req, res) => res.send("Methexis subtitle server is running."));

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] HTTP listening on http://0.0.0.0:${PORT}`);
});

// --- WebSocket server (operator -> server -> glasses clients) ---
const wss = new WebSocketServer({ server, path: "/ws" });

function activeSubtitle() {
  return subtitles[currentIndex] ?? null;
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  }
}

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[ws] client connected from ${ip} (total: ${wss.clients.size})`);

  // Send the active subtitle to the newly connected client immediately.
  ws.send(JSON.stringify({ type: "CURRENT", subtitle: activeSubtitle(), index: currentIndex }));

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON" }));
    }

    const event = data.type;

    switch (event) {
      case "NEXT_SUBTITLE":
        if (currentIndex < subtitles.length - 1) currentIndex++;
        break;
      case "PREV_SUBTITLE":
        if (currentIndex > 0) currentIndex--;
        break;
      case "RESET":
        currentIndex = 0;
        break;
      case "GET_CURRENT":
        return ws.send(JSON.stringify({ type: "CURRENT", subtitle: activeSubtitle(), index: currentIndex }));
      default:
        return ws.send(JSON.stringify({ type: "ERROR", message: `Unknown event: ${event}` }));
    }

    // Broadcast the updated subtitle to ALL connected clients.
    broadcast({ type: "SUBTITLE", subtitle: activeSubtitle(), index: currentIndex });
  });

  ws.on("close", () => {
    console.log(`[ws] client disconnected from ${ip} (total: ${wss.clients.size})`);
  });
});