"use client";

import React from "react";

function parseMaybe(dt) {
  if (!dt) return null;
  try {
    return new Date(dt);
  } catch {
    return null;
  }
}
function hm(d) {
  return d
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
}
function addMinutes(date, mins) {
  const d = new Date(date.getTime());
  d.setMinutes(d.getMinutes() + mins);
  return d;
}
function dayHeading(dt) {
  return dt
    ? new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(dt)
    : "—";
}

async function fetchJSON(url, init) {
  const r = await fetch(url, { ...init, cache: "no-store" });
  const txt = await r.text();
  let body;
  try {
    body = JSON.parse(txt);
  } catch {
    body = {};
  }
  if (!r.ok) throw new Error(body?.error || body?.detail || `HTTP ${r.status}`);
  return body;
}

export default function CurrentSchedulePage() {
  const [rides, setRides] = React.useState([]);
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const [initDataRaw, setInitDataRaw] = React.useState("");
  const [botId, setBotId] = React.useState("");
  const [asUser, setAsUser] = React.useState("");

  React.useEffect(() => {
    if (!tg) return;
    tg.ready?.();
    tg.expand?.();
    setInitDataRaw(tg.initData || "");
    try {
      const bid = new URLSearchParams(window.location.search).get("bot_id");
      if (bid) setBotId(bid);
    } catch {}
    try {
      const au = new URLSearchParams(window.location.search).get("as_user");
      if (au) setAsUser(au);
    } catch {}
  }, [tg]);

  React.useEffect(() => {
    if (!initDataRaw) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const qs = new URLSearchParams();
        if (botId) qs.set("bot_id", botId);
        if (asUser) qs.set("as_user", asUser);
        const data = await fetchJSON(
          `/api/webapp/rides${qs.toString() ? `?${qs.toString()}` : ""}`,
          {
          headers: { "x-telegram-init-data": initDataRaw },
          }
        );
        const list = Array.isArray(data?.results) ? data.results : [];
        setRides(list);
      } catch (e) {
        setErr(e.message || "Failed to load rides");
      } finally {
        setLoading(false);
      }
    })();
  }, [initDataRaw, botId]);

  // group by day of pickup
  const grouped = React.useMemo(() => {
    const by = {};
    const sorted = [...rides].sort((a, b) => {
      const sa = parseMaybe(a.pickupTime)?.getTime() ?? 0;
      const sb = parseMaybe(b.pickupTime)?.getTime() ?? 0;
      return sa - sb;
    });
    for (const it of sorted) {
      const start = parseMaybe(it.pickupTime);
      const key = dayHeading(start);
      if (!by[key]) by[key] = [];
      by[key].push(it);
    }
    return by;
  }, [rides]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Current schedule
        </h1>
        <p className="text-sm text-slate-500">Your upcoming rides</p>

        {loading ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Loading…
          </div>
        ) : err ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {err}
          </div>
        ) : rides.length === 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            No rides.
          </div>
        ) : (
          <div className="mt-4 space-y-8">
            {Object.entries(grouped).map(([day, items]) => (
              <section key={day}>
                <h3 className="text-xl font-bold tracking-tight">{day}</h3>
                <div className="mt-3 space-y-3">
                  {items.map((it) => {
                    const id = it.id || it.bookingNumber;
                    const type = (it.rideType || it.type || "—").toLowerCase();
                    const vclass = (it.vehicleClass || "—").toLowerCase();
                    const start = parseMaybe(it.pickupTime);
                    const end = it.endsAt
                      ? parseMaybe(it.endsAt)
                      : start && it.estimatedDurationMinutes
                      ? addMinutes(start, Number(it.estimatedDurationMinutes))
                      : null;

                    const pu =
                      it.pickupLocation?.address ||
                      it.pickupLocation?.name ||
                      "—";
                    const doAddr =
                      it.dropoffLocation?.address ||
                      it.dropoffLocation?.name ||
                      null;

                    return (
                      <div
                        key={id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-slate-700 font-semibold underline">
                            {it.bookingNumber || id}
                          </div>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-[2px] text-xs">
                            {type}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-[2px] text-xs">
                            {vclass}
                          </span>
                          <div className="ml-auto rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
                            {hm(start)}
                            {end ? ` – ${hm(end)}` : ""}
                          </div>
                        </div>

                        <div className="mt-3 space-y-2 text-sm">
                          <div>
                            <span className="font-semibold">Pickup:</span>{" "}
                            <span className="text-slate-700">{pu}</span>
                          </div>
                          {doAddr ? (
                            <div>
                              <span className="font-semibold">Dropoff:</span>{" "}
                              <span className="text-slate-700">{doAddr}</span>
                            </div>
                          ) : null}
                        </div>

                        <details className="mt-3">
                          <summary className="cursor-pointer select-none rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700">
                            More info
                          </summary>
                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            <div>Ride status: {it.rideStatus || "—"}</div>
                            <div>Flight: {it.flight?.number || "—"}</div>
                            <div>
                              Distance:{" "}
                              {it.estimatedDistanceMeters != null
                                ? `${(
                                    Number(it.estimatedDistanceMeters) / 1000
                                  ).toFixed(1)} km`
                                : "—"}
                            </div>
                            <div>
                              Duration:{" "}
                              {it.estimatedDurationMinutes != null
                                ? `${it.estimatedDurationMinutes} min`
                                : "—"}
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
