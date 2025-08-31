"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken") || ""
        : "";
    if (!token) {
      const v = prompt("Enter admin token");
      if (v) localStorage.setItem("adminToken", v);
    }
    const useToken = localStorage.getItem("adminToken") || "";
    try {
      const r = await fetch("/api/admin/users", {
        headers: { "x-admin-token": useToken },
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j?.detail || "Failed to load users");
        setRows([]);
      } else {
        setRows(j.users || []);
      }
    } catch (e) {
      setErr(e?.message || "Network error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage users</p>

        {err && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {String(err)}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Telegram ID</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-3" colSpan={4}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-3" colSpan={4}>
                    No users yet
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.telegram_id} className="border-t">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">{u.telegram_id}</td>
                    <td className="p-2">{u.active ? "✅" : "❌"}</td>
                    <td className="p-2 text-right">
                      <Link
                        href={`/admin-dashboard/users/${u.telegram_id}`}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-50"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-right">
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              load();
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-50"
          >
            Change admin token
          </button>
        </div>
      </div>
    </div>
  );
}
