"use client";

import { useEffect, useMemo, useState } from "react";

export default function CustomFiltersPage() {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);
  const API_BASE = "/api";

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
  }, [tg]);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const r = await fetch(
        `${API_BASE}/webapp/custom-filters?tma=${encodeURIComponent(
          initDataRaw
        )}`,
        { cache: "no-store" }
      );
      const j = await r.json();
      setFilters(j.filters || []);
    } catch (e) {
      setErr(e?.message || "Failed to load filters");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(fid, enabled) {
    try {
      await fetch(`${API_BASE}/webapp/custom-filters/${fid}/toggle`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `tma ${initDataRaw}`,
        },
        body: JSON.stringify({ enabled }),
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to toggle");
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
          These filters are visible only to you.
        </p>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              Loading…
            </div>
          ) : filters.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
              No custom filters yet.
            </div>
          ) : (
            filters.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">{f.name}</div>
                    {f.description ? (
                      <div className="text-sm text-slate-500">
                        {f.description}
                      </div>
                    ) : null}
                    <div className="mt-1 text-xs text-slate-500">
                      {f.rule_kind} · {f.matcher} ·{" "}
                      {(() => {
                        try {
                          const p = JSON.parse(f.params || "{}");
                          return p.term ? `term="${p.term}"` : "";
                        } catch {
                          return "";
                        }
                      })()}
                    </div>
                    {!f.global_enabled && (
                      <div className="mt-1 text-xs text-amber-600">
                        Disabled globally by admin
                      </div>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!f.user_enabled}
                      disabled={!f.global_enabled}
                      onChange={(e) => toggle(f.id, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
