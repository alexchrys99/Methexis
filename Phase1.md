--- 
name: phase1
description: Phase 1 of the smart glasses subtitle system
metadata:
  type: project
--- 

## Overview

Phase 1 implements the **Operator → Server → Client** pipeline for a real-time subtitle system in theaters. The system uses:
- **Node.js + Express** for the server
- **WebSocket** for real-time subtitle broadcasting
- **React + Tailwind CSS** for the operator control-room UI

## Architecture

### Server (`/server`)
- **HTTP server**: Express endpoints for `/health` and `/subtitles`
- **WebSocket server**: `ws://localhost:3000/ws`
- **State**: In-memory index tracking subtitles via `currentIndex`
- **Mock subtitles**: Loaded from `subtitles.json` (12 lines of Shakespeare)

### Client (`/client`)
- **Operator UI**: React control-room panel with:
  - Connection status indicator
  - Active subtitle display
  - Prev/Next preview cards
  - Keyboard controls (Left/Right arrows, Space, R)
  - Reset button

## Key Features

| Feature               | Implementation
|-----------------------|------------------
| WebSocket protocol    | Server broadcasts `CURRENT`/`SUBTITLE` events
| In-memory index       | `currentIndex` clamped to `[0, length-1]`
| Keyboard controls     | `◀`/`▶`/`Space`/`R` for Next/Prev/Reset
| Prev/Next preview     | Fetched via `/subtitles` endpoint
| Connection status     | Visual dot + label
| Responsive design     | Tailwind CSS classes

## How to Run

```bash
# Server
cd server && npm install && npm run start  # http://localhost:3000

# Client (Operator)
cd client && npm install && npm run dev   # http://localhost:5173
```

The Vite dev server proxies `/ws` to the backend, so the operator UI connects automatically.

## Protocol

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

## Files

- `server/server.js`: Express + WebSocket server
- `server/subtitles.json`: Mock subtitle data
- `client/App.jsx`: Operator UI component
- `client/useSubtitleSocket.jsx`: WebSocket hook
- `client/index.html`: Entry point

## Verification

- Server starts on `http://localhost:3000`
- Subtitles.json contains 12 lines
- WebSocket protocol tested live: connect → `CURRENT`, then `NEXT_SUBTITLE`/`PREV_SUBTITLE`/`RESET`/`GET_CURRENT` all broadcast correctly

## What's Out of Scope

- No database layer (JSON + in-memory only)
- No BLE logic (that's Phase 3)
- No glasses-specific display app (that's Phase 2)

## Next Steps

Phase 2 adds a **Viewer app** simulating smart glasses HUD display with:
- Pure black background (`bg-black`) with high-contrast text
- Auto-scaling subtitle text
- Connection status indicator
- Small/Large text toggle

---