// app/booked-slots/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

// Allow runtime override: /booked-slots?api=https://<ngrok|server>
function getApiBase() {
  if (typeof window !== "undefined") {
    const u = new URL(window.location.href);
    const qp = u.searchParams.get("api");
    if (qp) return qp;
  }
  return process.env.NEXT_PUBLIC_MINI_API_BASE || "http://localhost:8080";
}
const API_BASE = getApiBase();

async function fetchJSON(url, init) {
  const r = await fetch(url, init);
  const ct = r.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  if (!r.ok) {
    const body = isJSON ? await r.json().catch(() => ({})) : await r.text();
    const msg = isJSON
      ? body?.detail
        ? JSON.stringify(body.detail)
        : JSON.stringify(body)
      : body.slice(0, 200);
    throw new Error(`HTTP ${r.status} ${msg}`);
  }
  return isJSON ? r.json() : r.text();
}

export default function BookedSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [fromVal, setFromVal] = useState(""); // HTML datetime-local -> "YYYY-MM-DDTHH:MM"
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
  }, [tg]);
  // replace API_BASE with "/api"
  const API_BASE = "/api";

  async function load() {
    const url = `${API_BASE}/webapp/slots?tma=${encodeURIComponent(
      initDataRaw
    )}`;
    const r = await fetch(url, { cache: "no-store" }); // no headers -> no preflight
    const j = await r.json();
    setSlots(j.slots || []);
    setLoading(false);
  }

  async function onCreate() {
    await fetch(`${API_BASE}/webapp/slots`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `tma ${initDataRaw}`,
      },
      body: JSON.stringify({ start: fromVal, end: toVal, name: name || null }),
    });
    await load();
  }

  async function onDelete(id) {
    await fetch(`${API_BASE}/webapp/slots/${id}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        authorization: `tma ${initDataRaw}`,
      },
    });
    await load();
  }

  useEffect(() => {
    if (!initDataRaw) return; // wait until Telegram provides it
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initDataRaw]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="text-2xl font-semibold">Booked slots</h1>
        <p className="text-sm text-slate-500">
          Manage existing slots and add a new one.
        </p>

        {/* tiny debug line so you always know which API you're hitting */}
        <div className="mt-1 text-[10px] text-slate-400">API: {API_BASE}</div>
        {err && (
          <div className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
            {err}
          </div>
        )}

        {/* Existing list */}
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Loading…
            </div>
          ) : slots?.length ? (
            slots.map((s) => (
              <div
                key={s.id ?? `${s.from}-${s.to}`}
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
                    disabled={submitting}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 disabled:opacity-50"
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

          <button
            type="submit"
            disabled={
              submitting ||
              (fromVal && toVal && new Date(fromVal) >= new Date(toVal))
            }
            className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            Create booked slot
          </button>
        </form>

        <div className="pt-4 text-center text-xs text-slate-400">
          Data is saved via API and (optionally) sent back to the chat with
          Telegram WebApp.
        </div>
      </div>
    </div>
  );
}
