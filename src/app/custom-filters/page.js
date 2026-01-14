"use client";
import { useEffect, useMemo, useState } from "react";

export default function CustomFiltersPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);
  const botId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("bot_id") || "";
  }, []);
  const API_BASE = "/api";
  const withBotId = (url) => {
    if (!botId) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}bot_id=${encodeURIComponent(botId)}`;
  };

  useEffect(() => {
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch {}
    }
  }, [tg]);

  async function load() {
    try {
      setErr("");
      const r = await fetch(
        withBotId(
          `${API_BASE}/webapp/custom-filters?tma=${encodeURIComponent(
            initDataRaw
          )}`
        ),
        { cache: "no-store" }
      );
      const j = await r.json();
      setItems(j.filters || []);
    } catch (e) {
      setErr(e?.message || "Failed to load custom filters.");
      setItems([]);
    }
  }

  async function toggle(slug, next) {
    try {
      setBusy(true);
      await fetch(
        withBotId(`${API_BASE}/webapp/custom-filters/${slug}/toggle`),
        {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `tma ${initDataRaw}`,
        },
        body: JSON.stringify({ enabled: !!next }),
        }
      );
      await load();
    } catch (e) {
      setErr(e?.message || "Toggle failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initDataRaw) load();
  }, [initDataRaw]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="text-2xl font-semibold">Custom filters</h1>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              No custom filters assigned.
            </div>
          ) : (
            items.map((it, index) => {
              if (it.slug === "pickup_airport_reject")
                return (
                  <div key={index} className="border-b border-gray-400 pb-4">
                    <h2 className="font-semibold capitalize text-slate-700">
                      Adding Airport to pickup Blacklist
                    </h2>
                    <p>
                      Active/desactivate keyword &quot;airport&quot; on pickup
                      blacklist (when active - bot will not accept airport
                      pickups)
                    </p>
                    <button
                      className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                      onClick={() => toggle(it.slug, !it.enabled)}
                      disabled={busy}
                    >
                      {it.enabled ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                );
              if (it.slug === "block_baby_seat")
                return (
                  <div key={index} className="border-b border-gray-400 pb-4">
                    <h2 className="font-semibold capitalize text-slate-700">
                      Block baby seat requests
                    </h2>
                    <p>
                      When active, offers that include baby seat requests will
                      be rejected automatically.
                    </p>
                    <button
                      className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                      onClick={() => toggle(it.slug, !it.enabled)}
                      disabled={busy}
                    >
                      {it.enabled ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
}
