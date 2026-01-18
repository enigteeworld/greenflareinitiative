"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Row = {
  user_address: string;
  total_points: number;
  approved_actions: number;
  last_action: string | null;
};

function shortAddr(addr: string) {
  if (!addr?.startsWith("0x") || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "🏅";
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const top = useMemo(() => rows.slice(0, 3), [rows]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMsg(null);

      const { data, error } = await supabase.rpc("get_leaderboard", {
        limit_count: 50,
      });

      if (error) {
        setMsg(`❌ ${error.message}`);
        setRows([]);
      } else {
        setRows((data || []) as Row[]);
      }

      setLoading(false);
    }

    load();
  }, []);

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
              Live testnet leaderboard • Approved actions only
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Points Leaderboard
            </h1>
            <p className="mt-2 text-sm md:text-base max-w-2xl" style={{ color: "var(--muted)" }}>
              Rankings update based on verified actions. This is testnet — rewards are not live yet,
              but early contributors will shape the reward model.
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

            <Link
              href="/submit"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              Submit Action
            </Link>
          </div>
        </div>

        {/* Rewards coming soon card */}
        <div
          className="mt-6 rounded-2xl p-6"
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">🎁 Rewards coming soon</div>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                We’re validating the system on testnet first: submission → verification → on-chain proof.
                After pilots, we’ll introduce sponsor-backed rewards and a clear model for distribution.
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                Note: Points on testnet have no monetary value. They exist to test engagement + verification.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/verify"
                className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--panel2)",
                  color: "var(--text)",
                }}
              >
                Verify On-chain
              </Link>
            </div>
          </div>
        </div>

        {msg ? (
          <div
            className="mt-4 rounded-xl p-4 text-sm"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "#ef4444",
            }}
          >
            {msg}
          </div>
        ) : null}

        {/* Top 3 */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {top.map((r, idx) => (
            <div
              key={r.user_address}
              className="rounded-2xl p-6"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="text-2xl">{medal(idx + 1)}</div>
              <div className="mt-2 text-sm font-semibold">{shortAddr(r.user_address)}</div>
              <div className="mt-3 text-3xl font-semibold" style={{ color: "var(--text)" }}>
                {new Intl.NumberFormat().format(r.total_points)}
              </div>
              <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                points • {r.approved_actions} actions
              </div>
              <div className="mt-3 text-xs" style={{ color: "var(--muted2)" }}>
                Last verified:{" "}
                {r.last_action ? new Date(r.last_action).toLocaleDateString() : "—"}
              </div>
            </div>
          ))}
          {top.length === 0 && (
            <div
              className="md:col-span-3 rounded-2xl p-6 text-sm"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--muted)",
              }}
            >
              No verified actions yet — approve a submission to populate the leaderboard.
            </div>
          )}
        </div>

        {/* Table */}
        <div
          className="mt-6 rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="p-4 text-sm font-semibold">All Rankings</div>

          {loading ? (
            <div className="p-4 text-sm" style={{ color: "var(--muted)" }}>
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm" style={{ color: "var(--muted)" }}>
              No data yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--panel2)" }}>
                    <th className="text-left p-3" style={{ color: "var(--muted)" }}>
                      Rank
                    </th>
                    <th className="text-left p-3" style={{ color: "var(--muted)" }}>
                      Wallet
                    </th>
                    <th className="text-left p-3" style={{ color: "var(--muted)" }}>
                      Points
                    </th>
                    <th className="text-left p-3" style={{ color: "var(--muted)" }}>
                      Actions
                    </th>
                    <th className="text-left p-3" style={{ color: "var(--muted)" }}>
                      Last Verified
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.user_address} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3 font-semibold">{shortAddr(r.user_address)}</td>
                      <td className="p-3">{new Intl.NumberFormat().format(r.total_points)}</td>
                      <td className="p-3">{r.approved_actions}</td>
                      <td className="p-3" style={{ color: "var(--muted)" }}>
                        {r.last_action ? new Date(r.last_action).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-xs text-center" style={{ color: "var(--muted2)" }}>
          Leaderboard uses verified (approved) actions only.
        </div>
      </div>
    </div>
  );
}

