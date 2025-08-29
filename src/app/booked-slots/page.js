// app/booked-slots/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_MINI_API_BASE || "http://localhost:8080";

export default function BookedSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const tg =
    typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const initDataRaw = useMemo(() => tg?.initData ?? "", [tg]);

  async function load() {
    if (!initDataRaw) return;
    setLoading(true);
    setErr(" ");
    try {
      const r = await fetch(`${API_BASE}/webapp/slots`, {
        headers: { Authorization: `tma ${initDataRaw}` },
        cache: "no-store",
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setSlots(j.slots || []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tg, initDataRaw]);

  async function createSlot(form) {
    const start = String(form.get("start") || "");
    const end = String(form.get("end") || "");
    const name = String(form.get("name") || "");
    await fetch(`${API_BASE}/webapp/slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${initDataRaw}`,
      },
      body: JSON.stringify({ start, end, name: name || null }),
    });
    await load();
  }

  async function deleteSlot(id) {
    await fetch(`${API_BASE}/webapp/slots/${id}`, {
      method: "DELETE",
      headers: { Authorization: `tma ${initDataRaw}` },
    });
    await load();
  }

  if (!tg) return <div>Open this page inside Telegram.</div>;
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>📦 Booked slots</h1>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {slots.length === 0 ? (
        <p>No slots yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {slots.map((s) => (
            <li key={s.id} style={{ marginBottom: 8 }}>
              <b>{s.from}</b> → <b>{s.to}</b> {s.name ? `(${s.name})` : ""}
              <button
                style={{ marginLeft: 12 }}
                onClick={() => deleteSlot(s.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "16px 0" }} />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await createSlot(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input name="start" placeholder="dd/mm/yyyy HH:MM" required />
          <input name="end" placeholder="dd/mm/yyyy HH:MM" required />
          <input name="name" placeholder="name (optional)" />
          <button type="submit">➕ Create</button>
        </div>
      </form>
    </div>
  );
}
