"use client";
import { useEffect, useMemo, useState } from "react";

export default function CustomFiltersPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);
  const API_BASE = "/api";

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
        `${API_BASE}/webapp/custom-filters?tma=${encodeURIComponent(
          initDataRaw
        )}`,
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
      await fetch(`${API_BASE}/webapp/custom-filters/${slug}/toggle`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `tma ${initDataRaw}`,
        },
        body: JSON.stringify({ enabled: !!next }),
      });
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
        <p className="text-sm text-slate-500">
          Only your assigned filters are shown here.
        </p>

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
            items.map((it) => (
              <div
                key={it.slug}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
              >
                <div>
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-slate-500">{it.slug}</div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <span className="text-slate-500">
                    {it.enabled ? "On" : "Off"}
                  </span>
                  <input
                    type="checkbox"
                    checked={it.enabled}
                    disabled={busy}
                    onChange={(e) => toggle(it.slug, e.target.checked)}
                    className="h-5 w-10 accent-slate-900"
                  />
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
