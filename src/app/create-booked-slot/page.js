// pages/create-booked-slot.js
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Script from "next/script";

// Convert <input type="datetime-local"> value to "dd/mm/yyyy HH:MM"
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

export default function CreateBookedSlot() {
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  const tg = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp || null;
  }, []);

  // Configure Telegram UI
  useEffect(() => {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      tg.BackButton.hide();
      tg.MainButton.setText("Save booked slot");
      tg.MainButton.enable();
    } catch {}
  }, [tg]);

  // Toggle MainButton visibility based on validity
  useEffect(() => {
    if (!tg) return;
    const valid =
      fromVal &&
      toVal &&
      !Number.isNaN(new Date(fromVal).getTime()) &&
      !Number.isNaN(new Date(toVal).getTime()) &&
      new Date(fromVal) < new Date(toVal);
    if (valid) tg.MainButton.show();
    else tg.MainButton.hide();
  }, [tg, fromVal, toVal]);

  const onSubmit = useCallback(
    (e) => {
      e?.preventDefault();

      if (!tg) {
        alert("Open this page from Telegram (via the bot) to submit.");
        return;
      }
      if (!fromVal || !toVal) {
        tg.showAlert("Please fill both dates.");
        return;
      }
      if (new Date(fromVal) >= new Date(toVal)) {
        tg.showAlert("End time must be after start time.");
        return;
      }
      const fromTxt = formatDDMMYYYY_HHMM(fromVal);
      const toTxt = formatDDMMYYYY_HHMM(toVal);

      const payload = {
        kind: "create_booked_slot",
        from: fromTxt,
        to: toTxt,
        name: name?.trim() || null,
      };

      try {
        tg.HapticFeedback?.impactOccurred("medium");
      } catch {}
      try {
        tg.sendData(JSON.stringify(payload)); // sends a service message to the bot
      } catch (err) {
        console.error("sendData error", err);
        tg.showAlert("Could not send data to the bot.");
        return;
      }

      // Closing is optional; Telegram will show “sending…” until bot replies.
      try {
        tg.close();
      } catch {}
    },
    [tg, fromVal, toVal, name]
  );

  // Hook MainButton click
  useEffect(() => {
    if (!tg) return;
    const handler = () => onSubmit();
    tg.MainButton.onClick(handler);
    return () => {
      try {
        tg.MainButton.offClick(handler);
      } catch {}
    };
  }, [tg, onSubmit]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
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
            Choose a start and end time for your blocked period. Optionally add
            a name.
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
                placeholder="e.g. Airport run"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Fallback submit button (for direct browser open) */}
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 active:opacity-80"
            >
              Save booked slot
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              You’ll get a confirmation from the bot after saving.
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
