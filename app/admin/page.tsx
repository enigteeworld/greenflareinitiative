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

  async function load() {
    setLoading(true);
    setMsg("");

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
    const pointsStr = prompt("How many points to award? (e.g. 10)");
    if (!pointsStr) return;

    const points = Number(pointsStr);
    if (!points || points <= 0) {
      alert("Points must be a number greater than 0");
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

    setMsg(`✅ Approved! Tx hash: ${json.txHash}`);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Admin — Verify Submissions</h1>
      <p className="mt-2 text-sm opacity-70">
        Approving a submission writes the impact permanently on Flare.
      </p>

      {msg && <div className="mt-4 text-sm">{msg}</div>}

      <div className="mt-6">
        {loading ? (
          <p>Loading…</p>
        ) : items.length === 0 ? (
          <p className="opacity-70">No submissions yet.</p>
        ) : (
          <div className="grid gap-4">
            {items.map((s) => (
              <div key={s.id} className="border rounded p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="font-semibold">{s.action_type}</div>
                  <div className="text-xs opacity-70">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="mt-2 text-sm">
                  <div>
                    <span className="opacity-70">User:</span>{" "}
                    {s.user_address}
                  </div>
                  <div>
                    <span className="opacity-70">Location:</span>{" "}
                    {s.location_cell || "-"}
                  </div>
                  <div>
                    <span className="opacity-70">Status:</span>{" "}
                    {s.status}
                  </div>
                  {s.points !== null && (
                    <div>
                      <span className="opacity-70">Points:</span>{" "}
                      {s.points}
                    </div>
                  )}
                </div>

                {s.description && (
                  <div className="mt-2 text-sm">
                    {s.description}
                  </div>
                )}

                {s.proof_url && (
                  <div className="mt-3">
                    <a
                      href={s.proof_url}
                      target="_blank"
                      className="underline text-sm"
                    >
                      View proof
                    </a>
                  </div>
                )}

                {s.tx_hash && (
                  <div className="mt-3 text-xs break-all">
                    <span className="opacity-70">Tx:</span>{" "}
                    {s.tx_hash}
                  </div>
                )}

                {s.status === "pending" && (
                  <button
                    onClick={() => approve(s.id)}
                    className="mt-4 px-4 py-2 rounded bg-black text-white"
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

