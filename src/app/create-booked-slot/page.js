// pages/booked-slots.js
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Script from "next/script";

// --- b64url decode helper to read ?s= param ---
function b64urlDecode(b64url) {
  if (!b64url) return "";
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const base = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  if (typeof window !== "undefined") {
    return atob(base);
  }
  return Buffer.from(base, "base64").toString("utf-8");
}

// dd/mm/yyyy HH:MM (local)
function formatDDMMYYYY_HHMM(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  return `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
}

export default function BookedSlots() {
  const [slots, setSlots] = useState([]);
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  // Parse initial slots from ?s= (set by the bot)
  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const s = qs.get("s");
      if (!s) return;
      const decoded = JSON.parse(b64urlDecode(s));
      const arr = Array.isArray(decoded?.slots) ? decoded.slots : [];
      setSlots(arr);
    } catch (e) {
      console.warn("Failed to parse slots param:", e);
    }
  }, []);

  const tg = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp || null;
  }, []);

  // Setup TG UI
  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
  }, [tg]);

  // --- CREATE ---
  const onCreate = useCallback(
    (e) => {
      e?.preventDefault();
      if (!tg) {
        alert("Open this page from Telegram.");
        return;
      }
      if (!fromVal || !toVal) {
        tg.showAlert("Please fill both dates.");
        return;
      }
      const fromTxt = formatDDMMYYYY_HHMM(fromVal);
      const toTxt = formatDDMMYYYY_HHMM(toVal);
      if (new Date(fromVal) >= new Date(toVal)) {
        tg.showAlert("End time must be after start time.");
        return;
      }
      const payload = {
        kind: "create_booked_slot",
        from: fromTxt,
        to: toTxt,
        name: name?.trim() || null,
      };
      try {
        tg.HapticFeedback?.impactOccurred("medium");
      } catch {}
      tg.sendData(JSON.stringify(payload));
      tg.close(); // close after submit; bot will confirm in chat
    },
    [tg, fromVal, toVal, name]
  );

  // --- DELETE ---
  const onDelete = useCallback(
    (id) => {
      if (!tg) {
        alert("Open this page from Telegram.");
        return;
      }
      const payload = { kind: "delete_booked_slot", id };
      try {
        tg.HapticFeedback?.impactOccurred("light");
      } catch {}
      tg.sendData(JSON.stringify(payload));
      tg.close(); // bot will confirm deletion in chat
    },
    [tg]
  );

  return (
    <>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Head>
        <title>Booked slots</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <div className="mx-auto w-full max-w-lg px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Booked slots
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your blocked periods: create new or delete existing ones.
          </p>

          {/* Existing slots */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-medium text-slate-800">Your slots</h2>
            {slots.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No slots yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {slots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div className="text-sm">
                      <div className="font-medium text-slate-800">
                        {s.name || "—"}
                      </div>
                      <div className="mt-0.5 text-slate-600">
                        {s.from} <span className="text-slate-400">→</span>{" "}
                        {s.to}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        id: {s.id}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="ml-3 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 active:bg-red-100"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Create form */}
          <form
            onSubmit={onCreate}
            className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-base font-medium text-slate-800">
              New booked slot
            </h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                From
              </label>
              <input
                type="datetime-local"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                To
              </label>
              <input
                type="datetime-local"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
              {fromVal && toVal && new Date(fromVal) >= new Date(toVal) && (
                <p className="mt-1 text-xs text-red-600">
                  End time must be after start time.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. School run"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Fallback submit (when opened in a regular browser) */}
            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 active:opacity-80"
            >
              Save booked slot
            </button>

            <p className="pt-1 text-center text-xs text-slate-400">
              The bot will confirm in chat and show the updated menu.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
