import { useEffect, useState } from "react";
import useSubtitleSocket from "./useSubtitleSocket";

// Default server URL. Override via VITE_SERVER_URL env var (e.g. for production).
let SERVER_URL = import.meta.env.VITE_SERVER_URL
  ? `${import.meta.env.VITE_SERVER_URL}/ws`
  : `ws://${window.location.hostname || "localhost"}:3000/ws`; // Dynamic URL for local network access

export default function App() {
  const { connected, current, index, total, next, prev, reset } =
    useSubtitleSocket(SERVER_URL);

  const [subtitles, setSubtitles] = useState([]);

  // Fetch the full subtitle list once so we can preview prev/next lines.
  useEffect(() => {
    fetch("/subtitles")
      .then((r) => r.json())
      .then(setSubtitles)
      .catch(() => setSubtitles([]));
  }, []);

  // Keyboard shortcuts: Left/Right arrows, Space, R
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "r":
        case "R":
          e.preventDefault();
          reset();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [connected, index, total, next, prev, reset]);

  const prevLine = subtitles[index - 1] ?? null;
  const nextLine = subtitles[index + 1] ?? null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-semibold tracking-wide">
            Smart Glasses Subtitles
          </h1>
          <p className="text-xs text-slate-400">Operator Control Room</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? "bg-emerald-400" : "bg-rose-500"
            }`}
          />
          <span className="text-sm text-slate-300">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      {/* Main stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8">
        {/* Active subtitle — the big one */}
        <div className="w-full max-w-3xl text-center">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Now Showing
          </div>
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 px-8 py-10 min-h-[140px] flex items-center justify-center">
            {current ? (
              <p className="text-2xl md:text-4xl font-medium leading-snug">
                {current.text}
              </p>
            ) : (
              <p className="text-slate-500 text-lg">No subtitle active</p>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Line {index + 1} of {total || "?"}
          </div>
        </div>

        {/* Previous / Next previews */}
        <div className="w-full max-w-3xl grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-800/40 border border-slate-800 px-5 py-3 text-left">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
              Previous
            </div>
            <p className="text-slate-400 text-sm line-clamp-2">
              {prevLine ? prevLine.text : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/40 border border-slate-800 px-5 py-3 text-left">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
              Next
            </div>
            <p className="text-slate-400 text-sm line-clamp-2">
              {nextLine ? nextLine.text : "—"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            disabled={!connected || index === 0}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Previous (Left Arrow)"
          >
            <span className="text-xl">◀</span>
          </button>

          <button
            onClick={next}
            disabled={!connected || index >= total - 1}
            className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Next (Space / Right Arrow)"
          >
            Next
          </button>

          <button
            onClick={reset}
            disabled={!connected}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Reset"
          >
            <span className="text-xl">↺</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Keyboard: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">◀</kbd> Previous ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Space</kbd> Next ·{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">R</kbd> Reset
        </p>
      </main>
    </div>
  );
}