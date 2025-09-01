"use client";

import { useEffect, useState } from "react";

const API = "/api";

export default function AdminCFPage() {
  const [filters, setFilters] = useState([]);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [matcher, setMatcher] = useState("pickup_contains");
  const [rule, setRule] = useState("reject_if");
  const [term, setTerm] = useState("");
  const [assignId, setAssignId] = useState({}); // {filterId: telegramId}
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const r = await fetch(`${API}/admin/custom-filters`, {
        cache: "no-store",
      });
      const j = await r.json();
      setFilters(j.filters || []);
    } catch (e) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function createFilter(e) {
    e.preventDefault();
    try {
      await fetch(`${API}/admin/custom-filters`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          description: desc,
          rule_kind: rule,
          matcher,
          term,
        }),
      });
      setName("");
      setDesc("");
      setTerm("");
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to create");
    }
  }

  async function assign(filterId) {
    const tel = (assignId[filterId] || "").trim();
    if (!tel) return;
    try {
      await fetch(`${API}/admin/custom-filters/${filterId}/assign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ telegram_id: Number(tel), enabled: true }),
      });
      setAssignId((prev) => ({ ...prev, [filterId]: "" }));
      alert("Assigned.");
    } catch (e) {
      setErr(e?.message || "Failed to assign");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Admin · Custom filters</h1>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Create filter</h2>
          <form
            onSubmit={createFilter}
            className="mt-3 grid grid-cols-2 gap-3 text-sm"
          >
            <div className="col-span-1">
              <label className="block text-xs text-slate-600">Name</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-slate-600">Rule</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={rule}
                onChange={(e) => setRule(e.target.value)}
              >
                <option value="reject_if">reject_if</option>
                {/* accept_if could be added later */}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-slate-600">Matcher</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={matcher}
                onChange={(e) => setMatcher(e.target.value)}
              >
                <option value="pickup_contains">pickup_contains</option>
                <option value="dropoff_contains">dropoff_contains</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-slate-600">Term</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-600">
                Description (optional)
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Create
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">All filters</h2>
          {loading ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading…
            </div>
          ) : filters.length === 0 ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No filters.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {filters.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-base font-semibold">
                    {f.name}{" "}
                    <span className="ml-2 text-xs text-slate-500">#{f.id}</span>
                  </div>
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
                    })()}{" "}
                    · {f.enabled ? "enabled" : "disabled"}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Telegram ID to assign"
                      value={assignId[f.id] || ""}
                      onChange={(e) =>
                        setAssignId((prev) => ({
                          ...prev,
                          [f.id]: e.target.value,
                        }))
                      }
                      className="w-48 rounded-lg border px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => assign(f.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
