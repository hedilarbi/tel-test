"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const r = await fetch("/api/admin/users", { cache: "no-store" });
      const j = await r.json();
      setUsers(j.users || []);
    } catch (e) {
      setErr(e?.message || "Failed to load users.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="text-sm text-slate-500">Users overview</p>

        <div className="mt-4">
          <Link
            href="/admin-dashboard/custom-filters"
            className="text-sm underline"
          >
            Manage custom filters
          </Link>
        </div>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left">Bot ID</th>
                <th className="px-3 py-2 text-left">Telegram ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Username</th>

                <th className="px-3 py-2 text-left">First seen</th>
                <th className="px-3 py-2 text-left">Last seen</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const tg = u.tg || {};
                const name =
                  [tg.first_name, tg.last_name].filter(Boolean).join(" ") ||
                  "—";
                const botId = u.bot_id || "";
                const botQuery = botId
                  ? `?bot_id=${encodeURIComponent(botId)}`
                  : "";
                return (
                  <tr key={`${botId}-${u.telegram_id}`} className="border-t">
                    <td className="px-3 py-2">{botId || "—"}</td>
                    <td className="px-3 py-2">{u.telegram_id}</td>
                    <td className="px-3 py-2">{name}</td>
                    <td className="px-3 py-2">
                      {tg.username ? `@${tg.username}` : "—"}
                    </td>

                    <td className="px-3 py-2">{tg.first_seen || "—"}</td>
                    <td className="px-3 py-2">{tg.last_seen || "—"}</td>
                    <td className="px-3 py-2">{u.email || "—"}</td>
                    <td className="px-3 py-2">{u.active ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                        href={`/admin-dashboard/users/${u.telegram_id}${botQuery}`}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
