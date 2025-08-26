// pages/create-booked-slot.js
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Script from "next/script";

// dd/mm/yyyy HH:MM (local)
function formatDDMMYYYY_HHMM(value) {
  // value from <input type="datetime-local"> e.g. "2025-08-19T08:45"
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

export default function CreateBookedSlot() {
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  const tg = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp || null;
  }, []);

  // Toggle Telegram MainButton
  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.MainButton.setText("Save booked slot");
    // Show MainButton only when form is valid
    const canSubmit = Boolean(
      fromVal && toVal && new Date(fromVal) < new Date(toVal)
    );
    if (canSubmit) tg.MainButton.show();
    else tg.MainButton.hide();
  }, [tg, fromVal, toVal]);

  const onSubmit = useCallback(
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

      // a bit of UX
      try {
        tg.HapticFeedback?.impactOccurred("medium");
      } catch {}
      tg.sendData(JSON.stringify(payload));
      tg.close(); // let Telegram close the webview after sending
    },
    [tg, fromVal, toVal, name]
  );

  // Hook MainButton click
  useEffect(() => {
    if (!tg) return;
    const handler = () => onSubmit();
    tg.MainButton.onClick(handler);
    return () => tg.MainButton.offClick(handler);
  }, [tg, onSubmit]);

  return (
    <>
      {/* Telegram WebApp SDK (safe to include) */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Head>
        <title>Create booked slot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* If you use CSP, be sure frame-ancestors allows Telegram domains */}
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <div className="mx-auto w-full max-w-md px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Create booked slot
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose a start and end time for your blocked period. Optional name
            helps you remember it.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
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

            {/* Fallback submit button (when opened in a browser).
                In Telegram, users will usually tap the MainButton instead. */}
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 active:opacity-80"
            >
              Save booked slot
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              The bot will confirm in chat after saving.
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
