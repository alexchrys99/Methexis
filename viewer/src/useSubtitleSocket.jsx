import { useEffect, useRef, useState } from "react";

/**
 * Viewer-side WebSocket hook.
 *
 * Connects to the subtitle server and tracks the active subtitle.
 * Server protocol (JSON):
 *   server -> client:  { type: "CURRENT",  subtitle, index }  (on connect)
 *                      { type: "SUBTITLE", subtitle, index }  (on NEXT/PREV/RESET)
 */
export default function useSubtitleSocket() {
  // Dynamic WebSocket URL based on current hostname
  const url = import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/ws`
    : `ws://${window.location.hostname}:3000/ws`;

  const [connected, setConnected] = useState(false);
  const [current, setCurrent] = useState(null); // { id, text }
  const [index, setIndex] = useState(0);
  const [bleConnected, setBleConnected] = useState(false);
  const [bleCharacteristic, setBleCharacteristic] = useState(null);

  const wsRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }

      if (data.type === "CURRENT" || data.type === "SUBTITLE") {
        if (typeof data.index === "number") setIndex(data.index);
        if (data.subtitle) setCurrent(data.subtitle);
      }
    };

    return () => {
      ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null;
      ws.close();
    };
  }, [url]);

  return { connected, current, index, bleConnected, bleCharacteristic };
}