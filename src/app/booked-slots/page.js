// app/booked-slots/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------- helpers ---------- */
function parseMaybe(dt) {
  if (!dt) return null;
  if (dt instanceof Date) return new Date(dt.getTime());
  const s = String(dt).trim();

  // ISO / HTML5: 2025-09-01T05:00 or "2025-09-01 05:00"
  if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?$/.test(s)) {
    return new Date(s.replace(" ", "T"));
  }

  // dd/mm/yyyy or dd/mm/yyyy HH:MM
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const HH = Number(m[4] || 0);
    const MM = Number(m[5] || 0);
    return new Date(yyyy, mm - 1, dd, HH, MM, 0, 0);
  }

  // Unknown/ambiguous format → don't guess
  return null;
}

function formatLong(dt) {
  if (!dt) return "—";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dt);
}

function formatDayHeading(dt) {
  if (!dt) return "—";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dt);
}

/* ---------- page ---------- */
export default function BookedSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [fromVal, setFromVal] = useState(""); // "YYYY-MM-DDTHH:MM"
  const [toVal, setToVal] = useState("");
  const [name, setName] = useState("");

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);

  useEffect(() => {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      tg.setBackgroundColor?.("#ffffff");
      tg.setHeaderColor?.("#000000");
    } catch {}
  }, [tg]);

  const API_BASE = "/api";

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const url = `${API_BASE}/webapp/slots?tma=${encodeURIComponent(
        initDataRaw
      )}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      setSlots(j.slots || []);
    } catch (e) {
      setErr(e?.message || "Failed to load.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!fromVal || !toVal) return;
    setSubmitting(true);
    setErr("");
    try {
      await fetch(`${API_BASE}/webapp/slots`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `tma ${initDataRaw}`,
        },
        body: JSON.stringify({
          start: fromVal,
          end: toVal,
          name: name || null,
        }),
      });
      setName("");
      setFromVal("");
      setToVal("");
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to create.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id) {
    if (!id) return;
    setSubmitting(true);
    setErr("");
    try {
      await fetch(`/api/webapp/slots/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `tma ${initDataRaw}`,
        },
        cache: "no-store",
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to delete.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!initDataRaw) return; // wait for Telegram to provide it
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initDataRaw]);

  // group by day (of FROM), like your screenshots
  const grouped = useMemo(() => {
    const byDay = {};
    const sorted = [...slots].sort((a, b) => {
      const da = parseMaybe(a.from)?.getTime() ?? 0;
      const db = parseMaybe(b.from)?.getTime() ?? 0;
      return da - db;
    });
    for (const s of sorted) {
      const d = parseMaybe(s.from);
      const k = formatDayHeading(d);
      if (!byDay[k]) byDay[k] = [];
      byDay[k].push(s);
    }
    return byDay;
  }, [slots]);

  const invalidRange =
    fromVal &&
    toVal &&
    new Date(fromVal).getTime() >= new Date(toVal).getTime();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="text-3xl font-semibold tracking-tight">Booked slots</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a slot and review them grouped by day.
        </p>

        {/* Create card */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold">Add new booked slot</h2>

          <form onSubmit={onCreate} className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="col-span-1 font-semibold tracking-wide text-slate-500">
                FROM:
              </div>
              <div className="col-span-2">
                <input
                  type="datetime-local"
                  value={fromVal}
                  onChange={(e) => setFromVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
              </div>

              <div className="col-span-1 font-semibold tracking-wide text-slate-500">
                TO:
              </div>
              <div className="col-span-2">
                <input
                  type="datetime-local"
                  value={toVal}
                  onChange={(e) => setToVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
                {invalidRange && (
                  <p className="mt-1 text-xs text-red-600">
                    End time must be after start.
                  </p>
                )}
              </div>

              <div className="col-span-3">
                <details className="rounded-lg border border-slate-200 bg-slate-50/60">
                  <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-slate-700">
                    Additional info
                  </summary>
                  <div className="space-y-3 px-3 pb-3 pt-1">
                    <label className="block text-xs font-medium text-slate-600">
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
                </details>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || invalidRange}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Add slot
            </button>
          </form>
        </section>

        {/* Error */}
        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Grouped list like screenshots */}
        <div className="mt-6 space-y-8">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Loading…
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              No booked slots yet.
            </div>
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <section key={day}>
                <h3 className="text-2xl font-bold tracking-tight">{day}</h3>
                <div className="mt-3 space-y-3">
                  {items.map((s) => {
                    const fromD = parseMaybe(s.from);
                    const toD = parseMaybe(s.to);
                    const addedAt = s.added_at
                      ? formatLong(parseMaybe(s.added_at))
                      : null;

                    return (
                      <div
                        key={s.id ?? `${s.from}-${s.to}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-sm">
                          <div className="col-span-1 font-semibold tracking-wide text-slate-500">
                            FROM:
                          </div>
                          <div className="col-span-2">{formatLong(fromD)}</div>

                          <div className="col-span-1 font-semibold tracking-wide text-slate-500">
                            TO:
                          </div>
                          <div className="col-span-2">{formatLong(toD)}</div>

                          <div className="col-span-1 font-semibold tracking-wide text-slate-500">
                            Schedules:
                          </div>
                          <div className="col-span-2">All schedules</div>

                          <div className="col-span-1" />
                          <div className="col-span-2">
                            {s.name ? s.name : "—"}
                          </div>

                          {addedAt && (
                            <>
                              <div className="col-span-1 font-semibold tracking-wide text-slate-500">
                                Added at:
                              </div>
                              <div className="col-span-2">{addedAt}</div>
                            </>
                          )}
                        </div>

                        {s.id && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => onDelete(s.id)}
                              disabled={submitting}
                              className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
