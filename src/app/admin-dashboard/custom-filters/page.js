"use client";
import { useEffect, useState } from "react";

export default function AdminCustomFilters() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [params, setParams] = useState("{}");
  const [glob, setGlob] = useState(true);

  async function load() {
    try {
      setErr("");
      const r = await fetch("/api/admin/custom-filters", { cache: "no-store" });
      const j = await r.json();
      setItems(j.filters || []);
    } catch (e) {
      setErr(e?.message || "Failed to load.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createFilter(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      let parsed = {};
      if (params.trim()) parsed = JSON.parse(params);
      const r = await fetch("/api/admin/custom-filters", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          name: name.trim(),
          description: desc,
          params: parsed,
          global_enabled: !!glob,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setSlug("");
      setName("");
      setDesc("");
      setParams("{}");
      setGlob(true);
      await load();
    } catch (e) {
      setErr(e?.message || "Create failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Admin · Custom filters</h1>
        <p className="text-sm text-slate-500">Create and list filters</p>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <form
          onSubmit={createFilter}
          className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-4 gap-3 text-sm">
            <label className="col-span-1 pt-2 text-slate-600">Slug</label>
            <input
              className="col-span-3 rounded border border-slate-300 px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="pickup_airport_reject"
              required
            />

            <label className="col-span-1 pt-2 text-slate-600">Name</label>
            <input
              className="col-span-3 rounded border border-slate-300 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pickup from airport"
              required
            />

            <label className="col-span-1 pt-2 text-slate-600">
              Description
            </label>
            <input
              className="col-span-3 rounded border border-slate-300 px-3 py-2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <label className="col-span-1 pt-2 text-slate-600">
              Params (JSON)
            </label>
            <textarea
              className="col-span-3 h-24 rounded border border-slate-300 px-3 py-2 font-mono text-xs"
              value={params}
              onChange={(e) => setParams(e.target.value)}
            />

            <label className="col-span-1 pt-2 text-slate-600">
              Globally enabled
            </label>
            <input
              type="checkbox"
              checked={glob}
              onChange={(e) => setGlob(e.target.checked)}
            />
          </div>

          <button
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Create filter
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Existing filters</h2>
          <div className="mt-3 space-y-2">
            {items.length === 0 ? (
              <div className="text-sm text-slate-500">No filters.</div>
            ) : (
              items.map((f) => (
                <div
                  key={f.slug}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <div className="text-sm">
                    <div className="font-medium">
                      {f.name}{" "}
                      <span className="text-xs text-slate-400">({f.slug})</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {f.description}
                    </div>
                  </div>
                  <div className="text-xs">
                    {f.global_enabled ? "Globally ON" : "OFF"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
