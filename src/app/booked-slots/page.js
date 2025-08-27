// pages/booked-slots.js
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Head from "next/head";
import Script from "next/script";

function fromQS() {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const s = p.get("s");
  if (!s) return null;
  try {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const json = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function toDDMMYYYY_HHMM(v) {
  if (!v) return "";
  const d = new Date(v);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function BookedSlots() {
  const tg = useMemo(
    () => (typeof window !== "undefined" ? window.Telegram?.WebApp : null),
    []
  );
  const seed = useMemo(() => fromQS(), []);
  const [slots] = useState(() => seed?.slots || []);
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  // --- Init WebApp & BackButton
  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.BackButton.show();
    const onBack = () => tg.close();
    tg.BackButton.onClick(onBack);
    return () => tg.BackButton.offClick(onBack);
  }, [tg]);

  // --- MainButton state
  useEffect(() => {
    if (!tg) return;
    tg.MainButton.setText("Create booked slot");
    const ok = Boolean(fromVal && toVal && new Date(fromVal) < new Date(toVal));
    if (ok) tg.MainButton.show();
    else tg.MainButton.hide();
  }, [tg, fromVal, toVal]);

  // --- Robust sender (no auto-close)
  const sendToBot = useCallback(
    async (payload) => {
      if (!tg) return;
      try {
        tg.HapticFeedback?.impactOccurred("medium");
      } catch {}
      try {
        // extra debug in development
        if (process.env.NODE_ENV !== "production") {
          console.log("[WebApp] sending", payload);
          tg.showToast?.("Sending…");
        }
        tg.sendData(JSON.stringify(payload));
        // show a popup; user can close the webview with the Back button
        tg.showPopup?.({
          title: "Done",
          message: "Sent to bot ✅",
          buttons: [{ id: "ok", type: "close", text: "OK" }],
        });
      } catch (e) {
        tg.showAlert?.("Failed to send data to bot.");
      }
    },
    [tg]
  );

  const onCreate = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (!tg) return alert("Open inside Telegram.");
      if (!fromVal || !toVal) return tg.showAlert("Please fill both dates.");
      if (new Date(fromVal) >= new Date(toVal))
        return tg.showAlert("End must be after start.");
      const payload = {
        kind: "create_booked_slot",
        from: toDDMMYYYY_HHMM(fromVal),
        to: toDDMMYYYY_HHMM(toVal),
        name: (name || "").trim() || null,
      };
      // indicate progress on the MainButton
      tg.MainButton.setText("Submitting…");
      tg.MainButton.showProgress?.();
      sendToBot(payload).finally(() => {
        tg.MainButton.hideProgress?.();
        tg.MainButton.setText("Create booked slot");
      });
    },
    [tg, fromVal, toVal, name, sendToBot]
  );

  useEffect(() => {
    if (!tg) return;
    const handler = () => onCreate();
    tg.MainButton.onClick(handler);
    return () => tg.MainButton.offClick(handler);
  }, [tg, onCreate]);

  const onDelete = (id) => {
    if (!tg) return;
    sendToBot({ kind: "delete_booked_slot", id });
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Head>
        <title>Booked slots</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <div className="mx-auto w-full max-w-md px-4 py-6">
          <h1 className="text-2xl font-semibold">Booked slots</h1>
          <p className="text-sm text-slate-500">
            Manage existing slots and add a new one.
          </p>

          {/* Existing list */}
          <div className="mt-4 space-y-3">
            {slots?.length ? (
              slots.map((s) => (
                <div
                  key={s.id || `${s.from}-${s.to}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                >
                  <div className="text-sm">
                    <div className="font-medium">
                      {s.from} → {s.to}
                    </div>
                    {s.name ? (
                      <div className="text-slate-500">{s.name}</div>
                    ) : null}
                  </div>
                  {s.id ? (
                    <button
                      onClick={() => onDelete(s.id)}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                No booked slots yet.
              </div>
            )}
          </div>

          {/* Create form */}
          <form onSubmit={onCreate} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                From
              </label>
              <input
                type="datetime-local"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
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
              />
              {fromVal && toVal && new Date(fromVal) >= new Date(toVal) && (
                <p className="mt-1 text-xs text-red-600">
                  End time must be after start.
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

            {/* Fallback Submit for desktop testing */}
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
            >
              Create booked slot
            </button>
          </form>

          <div className="pt-4 text-center text-xs text-slate-400">
            Data is sent back to the bot via Telegram WebApp.
          </div>
        </div>
      </div>
    </>
  );
}
