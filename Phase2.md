--- 
name: phase2
description: Phase 2 of the smart glasses subtitle system - Viewer app
metadata:
  type: project
---

## Overview

Phase 2 implements the **Viewer app** simulating smart glasses optical head-up display (HUD). This app:
- Connects to the existing WebSocket server
- Shows active subtitles with a glasses-optimized HUD interface
- Simulates the look and feel of smart glasses without actual hardware

## Architecture

### Viewer (`/viewer`)
- **React + Vite + Tailwind CSS** for the HUD display
- **WebSocket client** connecting to `ws://localhost:3000/ws`
- **Real-time subtitle updates** from the server
- **HUD-optimized styling** for OLED/simulated transparency

## Key Features

| Feature               | Implementation
|-----------------------|------------------
| Black OLED background | `bg-black` / `#000000`
| High-contrast text     | `text-emerald-400` with glow drop-shadow
| Auto-scaling text     | Fits viewport with large/small toggle
| Connection status     | Dot indicator (green/red)
| Subtle optics reticle | Small central circle for glasses feel
| Minimalist design    | No clutter, just the subtitle

## How to Run

```bash
# Viewer (simulating smart glasses display)
cd viewer && npm install && npm run dev  # http://localhost:5174
```

## UI Elements

- **Main subtitle**: Large centered text, auto-scaling
- **Connection status**: Dot indicator in bottom-right
- **Text size toggle**: Bottom-left controls (Small/Large)
- **Line counter**: Top-left showing current index
- **Optics reticle**: Subtle central circle

## Files

- `viewer/App.jsx`: HUD interface component
- `viewer/useSubtitleSocket.jsx`: WebSocket hook
- `viewer/index.html`: Entry point
- `viewer/vite.config.js`: Vite configuration with proxy

## What's Out of Scope

- No BLE logic (that's Phase 3)
- No actual smart glasses hardware
- No complex database operations

## Next Steps

Phase 3 will add BLE integration for real glasses hardware.

---