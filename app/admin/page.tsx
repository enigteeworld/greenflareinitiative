"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Submission = {
  id: string;
  user_address: string;
  action_type: string;
  description: string | null;
  proof_url: string | null;
  location_cell: string | null;
  status: string;
  points: number | null;
  tx_hash: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  async function authenticate() {
    setMsg("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setAuthenticated(true);
      load();
    } else {
      setMsg("❌ Incorrect password");
    }
  }

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(`❌ ${error.message}`);
      setItems([]);
    } else {
      setItems((data as Submission[]) || []);
    }

    setLoading(false);
  }

  async function approve(submissionId: string) {
    const pointsStr = prompt("How many points to award?");
    if (!pointsStr) return;

    const points = Number(pointsStr);
    if (!points || points <= 0) {
      alert("Points must be greater than 0");
      return;
    }

    setMsg("⏳ Approving on-chain...");

    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, points }),
    });

    const json = await res.json();

    if (!res.ok) {
      setMsg(`❌ ${json.error || "Approval failed"}`);
      return;
    }

    setMsg(`✅ Approved! Tx: ${json.txHash}`);
    load();
  }

  // 🔐 PASSWORD SCREEN
  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold text-center">Admin Access</h1>
        <p className="mt-3 text-sm text-gray-600 text-center">
          Enter admin password to continue
        </p>

        <input
          type="password"
          className="mt-6 w-full border rounded-md p-3"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={authenticate}
          className="w-full mt-4 px-4 py-3 rounded-md bg-black text-white font-semibold"
        >
          Unlock Admin
        </button>

        {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
      </main>
    );
  }

  // ✅ ADMIN PANEL
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Admin — Verify Submissions</h1>

      {msg && <div className="mt-4 text-sm">{msg}</div>}

      <div className="mt-6">
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="grid gap-4">
            {items.map((s) => (
              <div key={s.id} className="border rounded p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{s.action_type}</span>
                  <span className="text-gray-400">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm mt-2">
                  <strong>User:</strong> {s.user_address}
                </p>

                {s.location_cell && (
                  <p className="text-sm">
                    <strong>Location:</strong> {s.location_cell}
                  </p>
                )}

                {s.description && (
                  <p className="mt-2 text-sm">{s.description}</p>
                )}

                {s.proof_url && (
                  <a
                    href={s.proof_url}
                    target="_blank"
                    className="block mt-2 underline text-sm"
                  >
                    View proof
                  </a>
                )}

                <p className="mt-2 text-sm">
                  <strong>Status:</strong> {s.status}
                </p>

                {s.tx_hash && (
                  <p className="text-xs break-all mt-1">
                    Tx: {s.tx_hash}
                  </p>
                )}

                {s.status === "pending" && (
                  <button
                    onClick={() => approve(s.id)}
                    className="mt-4 px-4 py-2 rounded bg-green-600 text-white"
                  >
                    Approve (write on-chain)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

