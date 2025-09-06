"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function ManageUser() {
  const params = useParams();
  const uid = params.id;

  const [data, setData] = useState({ assigned: [], all: [] });
  const [formulas, setFormulas] = useState([]); // ⬅️ new
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadFilters() {
    try {
      setErr("");
      const r = await fetch(`/api/admin/users/${uid}/custom-filters`, {
        cache: "no-store",
      });
      const j = await r.json();
      setData(j);
    } catch (e) {
      setErr(e?.message || "Failed to load filters.");
    }
  }

  async function loadFormulas() {
    try {
      setErr("");
      const r = await fetch(`/api/admin/users/${uid}/endtime-formulas`, {
        cache: "no-store",
      });
      const j = await r.json();
      setFormulas(j?.formulas || []);
    } catch (e) {
      setErr(e?.message || "Failed to load formulas.");
    }
  }

  useEffect(() => {
    loadFilters();
    loadFormulas();
  }, [uid]);

  const assignedSlugs = new Set((data.assigned || []).map((a) => a.slug));
  const hasElse = useMemo(
    () => (formulas || []).some((f) => !f.start && !f.end),
    [formulas]
  );

  async function assign(slug) {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${uid}/custom-filters/${slug}`, {
        method: "POST",
      });
      await loadFilters();
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
      await loadFilters();
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
      await loadFilters();
    } catch (e) {
      setErr(e?.message || "Toggle failed.");
    } finally {
      setBusy(false);
    }
  }

  // ---------- formulas actions ----------
  async function addFormula(payload) {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${uid}/endtime-formulas`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadFormulas();
    } catch (e) {
      setErr(e?.message || "Add formula failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteFormula(fid) {
    setBusy(true);
    try {
      await fetch(`/api/admin/users/${uid}/endtime-formulas/${fid}`, {
        method: "DELETE",
      });
      await loadFormulas();
    } catch (e) {
      setErr(e?.message || "Delete formula failed.");
    } finally {
      setBusy(false);
    }
  }

  function FormulaRow({ f }) {
    const win = f.start && f.end ? `${f.start} – ${f.end}` : "else";
    return (
      <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
        <div className="flex flex-col">
          <div className="font-medium">{win}</div>
          <div className="text-xs text-slate-600">
            speed {Number(f.speed_kmh).toFixed(0)} km/h • bonus{" "}
            {Number(f.bonus_min).toFixed(0)} min
            {typeof f.priority === "number" ? ` • priority ${f.priority}` : ""}
          </div>
        </div>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
          disabled={busy}
          onClick={() => deleteFormula(f.id)}
        >
          Delete
        </button>
      </div>
    );
  }

  function AddFormulaForm() {
    const [isElse, setIsElse] = useState(false);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [speed, setSpeed] = useState("70");
    const [bonus, setBonus] = useState("0");
    const [prio, setPrio] = useState("0");

    function submit(e) {
      e.preventDefault();
      if (!isElse && (!start || !end)) {
        setErr("Please set both start and end, or check Else.");
        return;
      }
      if (isElse && hasElse) {
        setErr("An Else rule already exists. Delete it first.");
        return;
      }
      const payload = {
        start: isElse ? null : start,
        end: isElse ? null : end,
        speed_kmh: Number(speed),
        bonus_min: Number(bonus),
        priority: Number(prio),
      };
      addFormula(payload);
    }

    return (
      <form
        onSubmit={submit}
        className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-6"
      >
        <label className="col-span-6 flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={isElse}
            onChange={(e) => setIsElse(e.target.checked)}
            disabled={busy}
          />
          Else (default rule)
        </label>

        <div className="col-span-3">
          <div className="text-xs text-slate-500 mb-1">Start</div>
          <input
            type="time"
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={busy || isElse}
          />
        </div>
        <div className="col-span-3">
          <div className="text-xs text-slate-500 mb-1">End</div>
          <input
            type="time"
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            disabled={busy || isElse}
          />
        </div>

        <div className="col-span-2">
          <div className="text-xs text-slate-500 mb-1">Speed (km/h)</div>
          <input
            type="number"
            min="1"
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="col-span-2">
          <div className="text-xs text-slate-500 mb-1">Bonus (min)</div>
          <input
            type="number"
            min="0"
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="col-span-2">
          <div className="text-xs text-slate-500 mb-1">Priority</div>
          <input
            type="number"
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={prio}
            onChange={(e) => setPrio(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="col-span-6">
          <button
            type="submit"
            className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-60"
            disabled={busy}
          >
            Add formula
          </button>
        </div>
      </form>
    );
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
          {/* Assigned filters */}
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

          {/* All filters */}
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

        {/* End-time formulas */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">End-time formulas</h2>
          <p className="mt-1 text-xs text-slate-500">
            Transfer “ends at” will be computed from these rules (first matching
            by priority; if none, use “else”). Hourly rides always use pickup +
            duration.
          </p>

          <div className="mt-3 space-y-2">
            {(formulas || []).length === 0 ? (
              <div className="text-sm text-slate-500">No rules yet.</div>
            ) : (
              formulas.map((f) => <FormulaRow key={f.id} f={f} />)
            )}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-medium">Add a rule</h3>
            <AddFormulaForm />
          </div>

          <div className="mt-4">
            <button
              className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-60"
              disabled={busy || formulas.length > 0}
              onClick={async () => {
                // quick-fill example set
                setBusy(true);
                try {
                  await Promise.all([
                    addFormula({
                      start: "06:00",
                      end: "12:00",
                      speed_kmh: 70,
                      bonus_min: 0,
                      priority: 0,
                    }),
                    addFormula({
                      start: "12:00",
                      end: "19:00",
                      speed_kmh: 80,
                      bonus_min: 60,
                      priority: 1,
                    }),
                    addFormula({
                      start: null,
                      end: null,
                      speed_kmh: 70,
                      bonus_min: 60,
                      priority: 9,
                    }),
                  ]);
                } finally {
                  setBusy(false);
                }
              }}
              title="Adds the 3 example rules from your spec"
            >
              Add example 3 rules
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
