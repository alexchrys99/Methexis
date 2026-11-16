# Methexis — Subtitle System

Real-time subtitle system for theaters, part of the **Methexis** initiative. This project handles the
**Operator → Server → Client** pipeline:

- **`/server`** — Express + `ws` WebSocket server. Holds mock subtitles in
  `subtitles.json`, tracks the active index in memory, and broadcasts subtitle
  updates to all connected clients.
- **`/client`** — React operator control-room UI (Vite + Tailwind). Lets the
  operator step through subtitles with Next/Prev/Reset and keyboard shortcuts.

## Layout

```
Methexis/
├── server/
│   ├── package.json
│   ├── server.js          # Express HTTP + ws WebSocket server
│   └── subtitles.json     # Mock subtitle data
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx         # Operator UI
        └── useSubtitleSocket.jsx  # WebSocket hook
```

## Run

```bash
# 1. Server
cd server
npm install
npm run start          # http://localhost:3000  (ws at /ws)

# 2. Client (in another terminal)
cd client
npm install
npm run dev            # http://localhost:5173
```

The Vite dev server proxies `/ws` to the backend, so the operator UI connects
to `ws://localhost:3000/ws` automatically.

## Server protocol

All messages are JSON.

**Server → client**
```jsonc
{ "type": "CURRENT",  "subtitle": {...}, "index": 0 }   // on connect
{ "type": "SUBTITLE", "subtitle": {...}, "index": 2 }   // on NEXT/PREV/RESET
```

**Client → server**
```jsonc
{ "type": "NEXT_SUBTITLE" }
{ "type": "PREV_SUBTITLE" }
{ "type": "RESET" }
{ "type": "GET_CURRENT" }
```

## What's intentionally out of scope for Phase 1

- No database — subtitles live in `subtitles.json` + in-memory index.
- No BLE / glasses hardware logic — operator-to-server pipeline only.
- No client display app for the glasses themselves (that's Phase 2).

## Phase 2: Viewer App

Added a `/viewer` app that simulates the smart glasses HUD display:

- Pure black background with high-contrast green text
- Auto-scaling subtitle text to fit the viewport
- Connection status indicator
- Small/Large text toggle
- Minimalist layout with subtle optics reticle

## Phase 3: BLE Integration

Added Web Bluetooth API support to the Viewer app:

- **Bluetooth connection button**: Top-right corner with icon
- **Dual status indicators**: Bottom-right corner showing both WebSocket and BLE status
- **BLE streaming**: Subtitles sent to connected glasses via `characteristic.writeValue()`
- **Fallback HUD mode**: Graceful degradation when BLE unavailable

Run with:
```bash
cd viewer && npm install && npm run dev  # http://localhost:5174
```

The viewer connects to the same WebSocket server as the operator UI, so you can test both simultaneously.

## GitHub Repositories

- Website: https://github.com/alexchrys99/Methexis_website
- Main Project: https://github.com/alexchrys99/Methexis