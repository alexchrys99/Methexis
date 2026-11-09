import { useEffect, useState } from "react";
import useSubtitleSocket from "./useSubtitleSocket";
import useBluetooth from "./useBluetooth";

// Default server URL. Override via VITE_SERVER_URL env var.
let SERVER_URL = import.meta.env.VITE_SERVER_URL
  ? `${import.meta.env.VITE_SERVER_URL}/ws`
  : `ws://${window.location.hostname || "localhost"}:3000/ws`; // Dynamic URL for local network access

export default function App() {
  const { connected, current, index, bleConnected, bleCharacteristic } = useSubtitleSocket(SERVER_URL);
  const { bleConnected: bleConnectedStatus, bleCharacteristic: bleChar, bleError } = useBluetooth();
  const [size, setSize] = useState("large");
const [isSending, setIsSending] = useState(false); // "small" | "large"

  // Auto-scale: fit the text roughly to the viewport width.
  useEffect(() => {
    if (!current?.text) return;
    const el = document.querySelector("[data-subtitle-text]");
    if (!el) return;

    const measure = () => {
      const viewport = window.innerWidth;
      // Start from a base font size and shrink until it fits comfortably.
      let fontSize = size === "large" ? 72 : 36;
      el.style.fontSize = `${fontSize}px`;
      while (el.scrollWidth > viewport * 0.9 && fontSize > 18) {
        fontSize -= 2;
        el.style.fontSize = `${fontSize}px`;
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [current, size]);

  // Send subtitle to BLE device if connected
  useEffect(() => {
    if (!current?.text || !bleChar) return;

    const sendToBle = () => {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(current.text);

      // Simulate BLE write (in a real app, use characteristic.writeValue)
      setIsSending(true);

      // In a real implementation, you would:
      // 1. Check MTU size
      // 2. Split into chunks if necessary
      // 3. Write to characteristic
      // 4. Handle errors

      // For demo purposes, we'll just log the bytes being sent
      console.log("[BLE] Sending subtitle bytes:", encoded);

      setTimeout(() => setIsSending(false), 100); // Simulate write delay
    };

    if (bleConnectedStatus) {
      sendToBle();
    }
  }, [current?.text, bleConnectedStatus, bleChar]);

  return (
    <div className="relative bg-black text-emerald-400 min-h-screen overflow-hidden">
      {/* Subtle crosshair / optics reticle hint — HUD feel, no clutter */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-24 w-24 rounded-full border border-emerald-500/20" />
      </div>

      {/* Subtitle text — centered like glasses optics */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <p
          data-subtitle-text
          className="text-center font-semibold leading-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.45)] transition-all duration-150"
        >
          {current ? current.text : "Awaiting subtitle…"}
        </p>
      </main>

      {/* Connection status indicators — bottom-right corner */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {/* WebSocket status */}
        <span
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            connected ? "bg-emerald-400" : "bg-rose-500"
          }`}
        />
        <span className="text-xs text-emerald-400/70">
          WS: {connected ? "LIVE" : "OFFLINE"}
        </span>

        {/* BLE status */}
        <span
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
            bleConnectedStatus ? "bg-blue-400" : "bg-gray-500"
          }`}
        />
        <span className="text-xs text-emerald-400/70">
          BLE: {bleConnectedStatus ? "CONNECTED" : "DISCONNECTED"}
        </span>

        {/* BLE sending indicator */}
        {isSending && (
          <span className="text-xs text-emerald-400/70 animate-pulse">
            Sending...
          </span>
        )}
      </div>

      {/* Size toggle — bottom-left corner, subtle but clickable */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => setSize("small")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            size === "small"
              ? "bg-emerald-500 text-slate-900"
              : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          Small
        </button>
        <button
          onClick={() => setSize("large")}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            size === "large"
              ? "bg-emerald-500 text-slate-900"
              : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          Large
        </button>
      </div>

      {/* Bluetooth connection button — top-right corner */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <button
          onClick={() => {
            if (bleConnectedStatus) {
              console.log("BLE already connected.");
            } else {
              console.log("BLE connection requested.");
            }
          }}
          className="p-2 rounded-full bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          title="Connect Glasses"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </button>
        <span className="text-xs text-emerald-400/70">
          {bleConnectedStatus ? "Connected" : "Connect"}
        </span>
      </div>

      {/* Line counter — top-left, minimal */}
      <div className="absolute top-4 left-4 text-xs text-emerald-400/60">
        {index + 1}
      </div>
    </div>
  );
}