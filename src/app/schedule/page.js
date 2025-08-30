"use client";

import React from "react";

const API_BASE = process.env.NEXT_PUBLIC_MINI_API_BASE;

function ddmmyyyy(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const firstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysInMonth = (d) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { ...options, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function SchedulePage() {
  const [initDataRaw, setInitDataRaw] = React.useState("");
  const [viewDate, setViewDate] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [blocked, setBlocked] = React.useState(new Set());
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    const wa =
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp;
    if (wa) {
      setInitDataRaw(wa.initData || "");
      try {
        wa.setHeaderColor && wa.setHeaderColor("#ffffff");
      } catch {}
      try {
        wa.setBackgroundColor && wa.setBackgroundColor("#ffffff");
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    if (!initDataRaw) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const j = await fetchJSON(`/api/webapp/schedule/days`, {
          headers: { "x-telegram-init-data": initDataRaw },
        });
        setBlocked(new Set(j?.days || []));
      } catch (e) {
        setErr(e.message || "Failed to load");
        setBlocked(new Set());
      } finally {
        setLoading(false);
      }
    })();
  }, [initDataRaw]);

  const grid = React.useMemo(() => {
    const first = firstDayOfMonth(viewDate);
    const lead = first.getDay();
    const total = daysInMonth(viewDate);
    const arr = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= total; d++)
      arr.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewDate]);

  const toggleDay = async (d) => {
    if (!initDataRaw) return;
    const key = ddmmyyyy(d);
    const optimistic = new Set(blocked);
    blocked.has(key) ? optimistic.delete(key) : optimistic.add(key);
    setBlocked(optimistic);
    try {
      await fetchJSON(`/api/webapp/schedule/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initDataRaw,
        },
        body: JSON.stringify({ day: key }),
      });
    } catch (e) {
      // revert on failure
      const revert = new Set(blocked);
      setBlocked(revert);
    }
  };
  const today = new Date();
  const sameMonth = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  const monthTitle = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <h1 className="text-3xl font-semibold tracking-tight">Allowed days</h1>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            className="col-span-3 rounded-xl border border-slate-200 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
            onClick={() =>
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
            }
          >
            Today
          </button>
          <button
            className="rounded-xl border border-slate-200 py-2 text-lg shadow-sm hover:bg-slate-50"
            onClick={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
              )
            }
          >
            ‹
          </button>
          <div className="flex items-center justify-center rounded-xl border border-slate-200 py-2 text-sm font-medium shadow-sm bg-white">
            {monthTitle}
          </div>
          <button
            className="rounded-xl border border-slate-200 py-2 text-lg shadow-sm hover:bg-slate-50"
            onClick={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
              )
            }
          >
            ›
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500">
            {wd.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((cell, idx) => {
              if (!cell) return <div key={idx} className="h-10" />;
              const key = ddmmyyyy(cell);
              const isBlocked = blocked.has(key);
              const isToday =
                sameMonth(cell, today) && cell.getDate() === today.getDate();
              return (
                <button
                  key={key}
                  onClick={() => toggleDay(cell)}
                  className={[
                    "h-10 rounded-lg text-sm transition border",
                    isBlocked
                      ? "bg-red-200/80 border-red-300"
                      : "bg-white border-slate-200",
                    "hover:ring-2 hover:ring-slate-300",
                    isToday
                      ? " outline-2 outline-slate-700 bg-amber-200/80"
                      : "",
                  ].join(" ")}
                  title={key}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-red-300" />{" "}
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-slate-300 bg-white" />{" "}
            <span>Allowed</span>
          </div>
          <div className="ml-auto">
            {loading ? (
              "Loading…"
            ) : err ? (
              <span className="text-red-600">{err}</span>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Tap a day to block/unblock. Changes save instantly.
        </p>
      </div>
    </div>
  );
}
