"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

  // existing
  tx_hash: string | null;

  // new (if you added them)
  chain_tx?: string | null;
  chain_network?: string | null;

  created_at: string;
};

type Filter = "all" | "pending" | "approved";

function actionLabel(actionType?: string | null) {
  switch (actionType) {
    case "TREE":
      return "🌳 Tree Planting";
    case "RECYCLE":
      return "♻️ Recycling";
    case "CLEANUP":
      return "🧹 Community Cleanup";
    default:
      return "🌱 Impact Action";
  }
}

function explorerTxUrl(tx?: string | null, network?: string | null) {
  if (!tx) return null;
  const n = (network || "coston2").toLowerCase();
  if (n === "coston2") return `https://coston2-explorer.flare.network/tx/${tx}`;
  return `https://coston2-explorer.flare.network/tx/${tx}`;
}

export default function AdminPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // 🔐 lock
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // UI extras
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");

  // per-submission points input
  const [pointsDraft, setPointsDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

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
    setMsg("");

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(`❌ ${error.message}`);
      setItems([]);
    } else {
      const rows = ((data as Submission[]) || []).map((r) => {
        // Initialize points draft for pending rows
        if (r.status === "pending" && !pointsDraft[r.id]) {
          pointsDraft[r.id] = String(r.points ?? 10);
        }
        return r;
      });

      setItems(rows);
      setPointsDraft({ ...pointsDraft });
    }

    setLoading(false);
  }

  async function approve(submissionId: string) {
    const raw = pointsDraft[submissionId] ?? "";
    const pts = Number(raw);

    if (!pts || pts <= 0) {
      setMsg("❌ Points must be greater than 0");
      return;
    }

    setBusyId(submissionId);
    setMsg("⏳ Approving on-chain...");

    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, points: pts }),
    });

    const json = await res.json();

    if (!res.ok) {
      setMsg(`❌ ${json.error || "Approval failed"}`);
      setBusyId(null);
      return;
    }

    setMsg(`✅ Approved! Tx: ${json.txHash}`);
    await load();
    setBusyId(null);
  }

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === "pending").length;
    const approved = items.filter((i) => i.status === "approved").length;
    const points = items.reduce((sum, i) => sum + (i.points || 0), 0);
    return { total, pending, approved, points };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((i) => {
      const matchFilter =
        filter === "all" ? true : i.status === filter;

      if (!matchFilter) return false;

      if (!q) return true;

      const blob = [
        i.user_address,
        i.action_type,
        i.location_cell || "",
        i.description || "",
        i.tx_hash || "",
        i.chain_tx || "",
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [items, filter, search]);

  // 🔐 PASSWORD SCREEN (theme aware)
  if (!authenticated) {
    return (
      <div style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div className="mx-auto max-w-md px-4 py-16">
          <div
            className="rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">Admin Access</h1>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Enter the admin password to continue.
                </p>
              </div>

              <Link
                href="/"
                className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--panel2)",
                  color: "var(--text)",
                }}
              >
                ← Home
              </Link>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold">Admin Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--panel2)",
                  color: "var(--text)",
                }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") authenticate();
                }}
              />

              <button
                onClick={authenticate}
                className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition"
                style={{
                  background: "var(--accent)",
                  color: "var(--accentText)",
                }}
              >
                Unlock Admin
              </button>

              {msg && (
                <p
                  className="mt-3 text-sm text-center"
                  style={{ color: msg.startsWith("❌") ? "#ef4444" : "var(--muted)" }}
                >
                  {msg}
                </p>
              )}

              <p className="mt-4 text-xs text-center" style={{ color: "var(--muted2)" }}>
                Admin approval writes verified impact to Flare Coston2.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ADMIN PANEL (premium + responsive + theme aware)
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: "var(--border)",
                background: "var(--panel2)",
                color: "var(--muted)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 18px rgba(52,211,153,0.45)",
                }}
              />
              Admin verification • Coston2
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Admin — Verify Submissions
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "var(--muted)" }}>
              Review pending submissions, award points, and record approved impact on-chain.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              ← Home
            </Link>

            <button
              onClick={load}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Total" value={stats.total} />
          <MiniStat label="Pending" value={stats.pending} />
          <MiniStat label="Approved" value={stats.approved} />
          <MiniStat label="Points" value={stats.points} />
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <Chip active={filter === "pending"} onClick={() => setFilter("pending")}>
              Pending
            </Chip>
            <Chip active={filter === "approved"} onClick={() => setFilter("approved")}>
              Approved
            </Chip>
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </Chip>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wallet, type, location, tx..."
            className="w-full md:w-[360px] rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          />
        </div>

        {/* Message */}
        {msg && (
          <div
            className="mt-4 rounded-xl p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: msg.startsWith("❌") ? "#ef4444" : "var(--text)",
            }}
          >
            {msg}
          </div>
        )}

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              No submissions found.
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((s) => {
                const tx = s.chain_tx || s.tx_hash || null;
                const txUrl = explorerTxUrl(tx, s.chain_network || "coston2");

                return (
                  <div
                    key={s.id}
                    className="rounded-2xl p-5"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel)",
                      boxShadow: "var(--shadow)",
                    }}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold">
                            {actionLabel(s.action_type)}
                          </div>
                          <span
                            className="text-[11px] rounded-full px-2 py-0.5"
                            style={{
                              border: "1px solid var(--border)",
                              background: "var(--panel2)",
                              color: "var(--muted)",
                            }}
                          >
                            {s.status}
                          </span>
                          {typeof s.points === "number" ? (
                            <span
                              className="text-[11px] rounded-full px-2 py-0.5"
                              style={{
                                border: "1px solid rgba(16,185,129,0.25)",
                                background: "rgba(16,185,129,0.12)",
                                color: "var(--text)",
                              }}
                            >
                              {s.points} pts
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 text-xs break-all" style={{ color: "var(--muted)" }}>
                          <span className="font-semibold" style={{ color: "var(--text)" }}>User:</span>{" "}
                          {s.user_address}
                        </div>

                        <div className="mt-1 text-xs" style={{ color: "var(--muted2)" }}>
                          {new Date(s.created_at).toLocaleString()}
                          {s.location_cell ? ` • ${s.location_cell}` : ""}
                        </div>

                        {s.description ? (
                          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                            {s.description}
                          </p>
                        ) : null}

                        {/* Tx */}
                        {tx ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-[11px]" style={{ color: "var(--muted2)" }}>
                              Tx:
                            </span>
                            <span className="text-[11px] break-all" style={{ color: "var(--muted)" }}>
                              {tx}
                            </span>
                            {txUrl ? (
                              <a
                                href={txUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                                style={{
                                  border: "1px solid var(--border)",
                                  background: "var(--panel2)",
                                  color: "var(--text)",
                                }}
                              >
                                View Tx ↗
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        {s.proof_url ? (
                          <a
                            href={s.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl px-4 py-2 text-sm font-semibold transition text-center"
                            style={{
                              border: "1px solid var(--border)",
                              background: "var(--panel2)",
                              color: "var(--text)",
                            }}
                          >
                            View Proof ↗
                          </a>
                        ) : (
                          <div className="text-xs" style={{ color: "var(--muted2)" }}>
                            No proof file
                          </div>
                        )}

                        {s.status === "pending" ? (
                          <div
                            className="rounded-2xl p-3 w-full md:w-[240px]"
                            style={{
                              border: "1px solid var(--border)",
                              background: "var(--panel2)",
                            }}
                          >
                            <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                              Award points
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                value={pointsDraft[s.id] ?? "10"}
                                onChange={(e) =>
                                  setPointsDraft((p) => ({ ...p, [s.id]: e.target.value }))
                                }
                                className="w-20 rounded-lg px-3 py-2 text-sm outline-none"
                                style={{
                                  border: "1px solid var(--border)",
                                  background: "var(--panel)",
                                  color: "var(--text)",
                                }}
                              />

                              <button
                                onClick={() => approve(s.id)}
                                disabled={busyId === s.id}
                                className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60"
                                style={{
                                  background: "var(--accent)",
                                  color: "var(--accentText)",
                                }}
                              >
                                {busyId === s.id ? "Approving..." : "Approve"}
                              </button>
                            </div>

                            <div className="mt-2 text-[11px]" style={{ color: "var(--muted2)" }}>
                              Writes verified impact to Flare.
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10 text-xs text-center" style={{ color: "var(--muted2)" }}>
          Tip: make sure your approve route saves <span style={{ color: "var(--text)" }}>chain_tx</span> so users can verify on-chain from the homepage.
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI ---------------- */

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="text-[11px]" style={{ color: "var(--muted2)" }}>
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold" style={{ color: "var(--text)" }}>
        {new Intl.NumberFormat().format(value)}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-4 py-2 text-sm font-semibold transition"
      style={{
        border: active ? "1px solid rgba(16,185,129,0.35)" : "1px solid var(--border)",
        background: active ? "rgba(16,185,129,0.14)" : "var(--panel)",
        color: "var(--text)",
      }}
    >
      {children}
    </button>
  );
}

