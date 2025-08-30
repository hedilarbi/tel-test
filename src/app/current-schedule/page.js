"use client";

import React from "react";

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
  React.useEffect(() => {
    if (!tg) return;
    tg.ready?.();
    // after ready(), initData is definitely available
    setInitDataRaw(tg.initData || "");
  }, [tg]);

  React.useEffect(() => {
    if (!tg) return;
    tg.ready?.();
    tg.expand?.();
    // keep native Close button behavior (don’t register BackButton here)
  }, [tg]);

  React.useEffect(() => {
    if (!initDataRaw) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await fetchJSON("/api/webapp/rides", {
          headers: { "x-telegram-init-data": initDataRaw },
        });
        const list = Array.isArray(data?.results) ? data.results : [];
        setRides(list);
      } catch (e) {
        setErr(e.message || "Failed to load rides");
      } finally {
        setLoading(false);
      }
    })();
  }, [initDataRaw]);

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
          <div className="mt-4 space-y-4">
            {rides.map((it) => {
              const id = it.id || it.bookingNumber;
              const type = (it.rideType || "—").toLowerCase();
              const vclass = (it.vehicleClass || "—").toLowerCase();
              const start = it.pickupTime ? new Date(it.pickupTime) : null;
              const end =
                start && it.estimatedDurationMinutes
                  ? addMinutes(start, Number(it.estimatedDurationMinutes))
                  : null;

              const pu = it.pickupLocation?.address || "—";
              const doAddr = it.dropoffLocation?.address || null;

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
                    <div className="ml-auto flex items-center gap-2">
                      <span className="rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
                        {hm(start)}
                        {end ? ` - ${hm(end)}` : ""}
                      </span>
                      {/* no price in /rides; show a placeholder only if present */}
                      {it.price != null && (
                        <span className="rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
                          {`${it.currency || "USD"} ${Number(it.price).toFixed(
                            2
                          )}`}
                        </span>
                      )}
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
                        {it.distance != null ? `${it.distance} km` : "—"}
                      </div>
                      <div>
                        Duration:{" "}
                        {it.estimatedDurationMinutes != null
                          ? `${it.estimatedDurationMinutes} min`
                          : "—"}
                      </div>
                      <div>Pickup sign: {it.pickupSign || "—"}</div>
                      <div>
                        Guest:{" "}
                        {[
                          it.guest?.title,
                          it.guest?.firstName,
                          it.guest?.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
