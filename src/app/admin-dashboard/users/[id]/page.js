"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ManageUser() {
  const params = useParams();
  const uid = params.id;

  const [data, setData] = useState({ assigned: [], all: [] });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setErr("");
      const r = await fetch(`/api/admin/users/${uid}/custom-filters`, {
        cache: "no-store",
      });
      const j = await r.json();
      setData(j);
    } catch (e) {
      setErr(e?.message || "Failed to load.");
    }
  }

  useEffect(() => {
    load();
  }, [uid]);

  const assignedSlugs = new Set((data.assigned || []).map((a) => a.slug));

  async function assign(slug) {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${uid}/custom-filters/${slug}`, {
        method: "POST",
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Assign failed.");
    } finally {
      setBusy(false);
    }
  }

  async function unassign(slug) {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${uid}/custom-filters/${slug}`, {
        method: "DELETE",
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Unassign failed.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleUser(slug, next) {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${uid}/custom-filters/${slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !!next }),
      });
      await load();
    } catch (e) {
      setErr(e?.message || "Toggle failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Manage user #{uid}</h1>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Assigned filters</h2>
            <div className="mt-3 space-y-2">
              {(data.assigned || []).length === 0 ? (
                <div className="text-sm text-slate-500">None.</div>
              ) : (
                data.assigned.map((it) => (
                  <div
                    key={it.slug}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {it.name}{" "}
                        <span className="text-xs text-slate-400">
                          ({it.slug})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {it.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">
                        {it.user_enabled ? "On" : "Off"}
                      </label>
                      <input
                        type="checkbox"
                        checked={!!it.user_enabled}
                        disabled={busy}
                        onChange={(e) => toggleUser(it.slug, e.target.checked)}
                      />
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                        disabled={busy}
                        onClick={() => unassign(it.slug)}
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">All filters</h2>
            <div className="mt-3 space-y-2">
              {(data.all || []).length === 0 ? (
                <div className="text-sm text-slate-500">No filters yet.</div>
              ) : (
                data.all.map((f) => (
                  <div
                    key={f.slug}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {f.name}{" "}
                        <span className="text-xs text-slate-400">
                          ({f.slug})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Global: {f.global_enabled ? "ON" : "OFF"}
                      </div>
                    </div>
                    {assignedSlugs.has(f.slug) ? (
                      <span className="text-xs text-slate-500">Assigned</span>
                    ) : (
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                        disabled={busy}
                        onClick={() => assign(f.slug)}
                      >
                        Assign
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
