// pages/create-booked-slot.js
"use client";
// pages/create-booked-slot.js
import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";

function formatDDMMYYYY_HHMM(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function CreateBookedSlot() {
  const [tg, setTg] = useState(null);
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      setTg(window.Telegram.WebApp);
    }
  }, []);

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.MainButton.setText("Save booked slot");
    const valid = Boolean(
      fromVal && toVal && new Date(fromVal) < new Date(toVal)
    );
    if (valid) tg.MainButton.show();
    else tg.MainButton.hide();
  }, [tg, fromVal, toVal]);

  const onSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const webapp =
        tg || (typeof window !== "undefined" ? window.Telegram?.WebApp : null);
      if (!webapp) {
        alert("Open this page from Telegram (Mini App).");
        return;
      }
      if (!fromVal || !toVal)
        return webapp.showAlert("Please fill both dates.");
      if (new Date(fromVal) >= new Date(toVal))
        return webapp.showAlert("End time must be after start time.");

      const payload = {
        kind: "create_booked_slot",
        from: formatDDMMYYYY_HHMM(fromVal),
        to: formatDDMMYYYY_HHMM(toVal),
        name: name?.trim() || null,
      };

      // DEBUG feedback so you *see* something even if bot misses the update
      webapp.showAlert("Submitting slot…");
      console.log("Sending web_app_data:", payload);

      try {
        webapp.HapticFeedback?.impactOccurred("medium");
      } catch {}
      webapp.sendData(JSON.stringify(payload));
      setTimeout(() => webapp.close(), 150);
    },
    [tg, fromVal, toVal, name]
  );

  useEffect(() => {
    if (!tg) return;
    const handler = () => onSubmit();
    tg.MainButton.onClick(handler);
    return () => tg.MainButton.offClick(handler);
  }, [tg, onSubmit]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => setTg(window.Telegram?.WebApp ?? null)}
      />
      <Head>
        <title>Create booked slot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <div className="mx-auto w-full max-w-md px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
            Create booked slot
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose a start and end time. Name is optional.
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

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 active:opacity-80"
            >
              Save booked slot
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              You’ll get a confirmation message in the chat.
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
