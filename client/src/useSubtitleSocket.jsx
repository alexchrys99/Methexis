import { useEffect, useRef, useState } from "react";

/**
 * Connects to the subtitle WebSocket server and tracks the active subtitle.
 *
 * Server protocol (JSON):
 *   server -> client:  { type: "CURRENT", subtitle, index }  (on connect)
 *                      { type: "SUBTITLE", subtitle, index } (on NEXT/PREV/RESET)
 *   client -> server:  { type: "NEXT_SUBTITLE" | "PREV_SUBTITLE" | "RESET" | "GET_CURRENT" }
 */
export default function useSubtitleSocket() {
  // Dynamic WebSocket URL based on current hostname
  const url = import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/ws`
    : `ws://${window.location.hostname}:3000/ws`;

  const [connected, setConnected] = useState(false);
  const [current, setCurrent] = useState(null); // { id, text }
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);

  const wsRef = useRef(null);

  // Keep the latest handlers in refs so the stable onmessage can read them.
  const currentRef = useRef(current);
  const indexRef = useRef(index);
  useEffect(() => {
    currentRef.current = current;
    indexRef.current = index;
  });

  // Helper to dynamically fetch total count
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3000`;
    fetch(`${baseUrl}/subtitles`)
      .then((r) => r.json())
      .then((data) => setTotal(data.length))
      .catch(() => setTotal(0));
  }, []);

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
        if (data.subtitle) {
          setCurrent(data.subtitle);
          currentRef.current = data.subtitle;
          indexRef.current = data.index ?? 0;
        }
      }
    };

    return () => {
      ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null;
      ws.close();
    };
  }, [url]);

  function send(type) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type }));
    }
  }

  function next() {
    send("NEXT_SUBTITLE");
  }
  function prev() {
    send("PREV_SUBTITLE");
  }
  function reset() {
    send("RESET");
  }

  return { connected, current, index, total, next, prev, reset };
}