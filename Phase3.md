--- 
name: phase3
description: Phase 3 of the Methexis subtitle system - BLE integration
metadata:
  type: project
---

## Methexis Phase 3 Overview

Phase 3 of Methexis adds Web Bluetooth API support to the Viewer app, enabling real-time subtitle streaming to smart glasses hardware. This phase:
- Connects to BLE devices via the browser's Web Bluetooth API
- Streams subtitles to connected glasses
- Maintains fallback software HUD mode when BLE is unavailable

## Architecture

### Viewer (`/viewer`)
- **Web Bluetooth integration**: Added `useBluetooth.jsx` hook
- **Real-time BLE streaming**: Subtitles sent to connected devices
- **Dual status indicators**: Shows both WebSocket and BLE connection status
- **Bluetooth connection button**: Top-right corner for manual connection

## Key Features

| Feature               | Implementation
|-----------------------|------------------
| Web Bluetooth API    | `navigator.bluetooth.requestDevice`
| BLE service discovery | UART service UUIDs
| Subtitle streaming    | `characteristic.writeValue()`
| Dual status indicators | WS (green/red) + BLE (blue/gray)
| BLE connection button | Top-right corner with Bluetooth icon
| Fallback HUD mode     | Graceful degradation when BLE unavailable

## How to Run

```bash
# Viewer (with BLE support)
cd viewer && npm install && npm run dev  # http://localhost:5174
```

## UI Elements

- **Bluetooth connection button**: Top-right corner with Bluetooth icon
- **Dual status indicators**: Bottom-right corner showing both WebSocket and BLE status
- **Sending indicator**: Pulsing "Sending..." when transmitting to BLE device
- **Line counter**: Top-left showing current subtitle index

## Files

- `viewer/useBluetooth.jsx`: Web Bluetooth connection hook
- `viewer/App.jsx`: Updated with BLE integration
- `viewer/useSubtitleSocket.jsx`: Updated to include BLE state

## What's Out of Scope

- No actual smart glasses hardware (testing requires compatible BLE device)
- No complex database operations
- No additional server-side changes

## Next Steps

Phase 3 is complete! The system now supports:
1. Operator control room (`/client`)
2. Smart glasses HUD simulation (`/viewer`)
3. BLE integration for real hardware

---