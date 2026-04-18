"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RecentItem = {
  id: string;
  action_type: string;
  location_cell: string | null;
  created_at: string;
  chain_tx?: string | null;
  chain_network?: string | null;
};

type ThemeMode = "system" | "light" | "dark";

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}

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

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === "system" ? getSystemTheme() : mode;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.style.setProperty("--bg", "#070A0D");
    root.style.setProperty("--bg2", "rgba(16, 185, 129, 0.08)");
    root.style.setProperty("--panel", "rgba(255,255,255,0.05)");
    root.style.setProperty("--panel2", "rgba(0,0,0,0.25)");
    root.style.setProperty("--border", "rgba(255,255,255,0.10)");
    root.style.setProperty("--text", "rgba(255,255,255,0.95)");
    root.style.setProperty("--muted", "rgba(255,255,255,0.65)");
    root.style.setProperty("--muted2", "rgba(255,255,255,0.45)");
    root.style.setProperty("--accent", "#34D399");
    root.style.setProperty("--accentText", "#07120E");
    root.style.setProperty("--glow1", "rgba(52, 211, 153, 0.22)");
    root.style.setProperty("--glow2", "rgba(56, 189, 248, 0.14)");
    root.style.setProperty("--shadow", "0 0 0 1px rgba(255,255,255,0.03)");
    root.style.colorScheme = "dark";
  } else {
    root.style.setProperty("--bg", "#F7FAF9");
    root.style.setProperty("--bg2", "rgba(16, 185, 129, 0.10)");
    root.style.setProperty("--panel", "rgba(255,255,255,0.78)");
    root.style.setProperty("--panel2", "rgba(255,255,255,0.55)");
    root.style.setProperty("--border", "rgba(15, 23, 42, 0.10)");
    root.style.setProperty("--text", "rgba(15, 23, 42, 0.95)");
    root.style.setProperty("--muted", "rgba(15, 23, 42, 0.65)");
    root.style.setProperty("--muted2", "rgba(15, 23, 42, 0.50)");
    root.style.setProperty("--accent", "#059669");
    root.style.setProperty("--accentText", "#F8FAFC");
    root.style.setProperty("--glow1", "rgba(16, 185, 129, 0.18)");
    root.style.setProperty("--glow2", "rgba(59, 130, 246, 0.12)");
    root.style.setProperty("--shadow", "0 12px 30px rgba(2, 6, 23, 0.06)");
    root.style.colorScheme = "light";
  }
}

function explorerTxUrl(tx?: string | null, network?: string | null) {
  if (!tx) return null;
  const n = (network || "").toLowerCase();

  if (n === "coston2") return `https://coston2-explorer.flare.network/tx/${tx}`;

  return null;
}

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    points: 0,
  });

  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    const saved =
      (typeof window !== "undefined"
        ? (localStorage.getItem("gf_theme") as ThemeMode | null)
        : null) ?? "system";

    setTheme(saved);
    if (typeof window !== "undefined") applyTheme(saved);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current =
        (localStorage.getItem("gf_theme") as ThemeMode | null) ?? "system";
      if (current === "system") applyTheme("system");
    };
    mq?.addEventListener?.("change", onChange);

    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      const { data, error } = await supabase
        .from("submissions")
        .select("status, points");

      if (!mounted) return;

      if (error || !data) {
        setStats({ total: 0, approved: 0, points: 0 });
        return;
      }

      const total = data.length;
      const approved = data.filter((d: { status: string; }) => d.status === "approved").length;
      const points = data.reduce((sum: any, d: { points: any; }) => sum + (d.points || 0), 0);

      setStats({ total, approved, points });
    }

    async function loadRecent() {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, action_type, location_cell, created_at, chain_tx, chain_network")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!mounted) return;

      if (error) {
        const fallback = await supabase
          .from("submissions")
          .select("id, action_type, location_cell, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecent((fallback.data || []) as RecentItem[]);
        return;
      }

      setRecent((data || []) as RecentItem[]);
    }

    Promise.all([loadStats(), loadRecent()]).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const breakdown = useMemo(() => {
    const tree = recent.filter((r) => r.action_type === "TREE").length;
    const recycle = recent.filter((r) => r.action_type === "RECYCLE").length;
    const cleanup = recent.filter((r) => r.action_type === "CLEANUP").length;
    return { tree, recycle, cleanup };
  }, [recent]);

  const milestones = useMemo(() => {
    const targetPoints = 5000;
    const targetActions = 150;

    const pointsPct =
      targetPoints <= 0 ? 0 : Math.min(100, (stats.points / targetPoints) * 100);

    const actionsPct =
      targetActions <= 0 ? 0 : Math.min(100, (stats.approved / targetActions) * 100);

    return { targetPoints, targetActions, pointsPct, actionsPct };
  }, [stats.points, stats.approved]);

  function setThemeAndPersist(mode: ThemeMode) {
    setTheme(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("gf_theme", mode);
      applyTheme(mode);
    }
  }

  return (
    <div className="relative" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "var(--glow1)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{ background: "var(--glow2)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle_at_top, rgba(255,255,255,0.10), transparent 55%)",
            opacity: theme === "dark" ? 0.4 : 0.25,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Top bar with theme toggle */}
        <div className="pt-6 flex items-center justify-between gap-3">
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
            Building in public • Nigeria-first • verification-first
          </div>
        </div>

        {/* HERO */}
        <section className="pt-10 md:pt-14">
          <div className="mt-4 grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Real-world environmental action,
                <span style={{ color: "var(--accent)" }}> verified</span> and
                <span style={{ color: "var(--accent)" }}> rewarded</span>.
              </h1>

              <p className="mt-4 leading-relaxed max-w-xl" style={{ color: "var(--muted)" }}>
                GreenFlare is a community-led initiative promoting tree planting,
                recycling, and cleanups — with transparent, verifiable impact
                tracking. Sponsors see real proof. Communities earn points.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition"
                  style={{ background: "var(--accent)", color: "var(--accentText)" }}
                >
                  Submit an Impact Action
                </Link>

                <Link
                  href="/verify"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition"
                  style={{
                    border: `1px solid var(--border)`,
                    background: "var(--panel)",
                    color: "var(--text)",
                  }}
                >
                  Review Impact
                </Link>

                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition"
                  style={{
                    border: `1px solid rgba(16,185,129,0.28)`,
                    background: "var(--bg2)",
                    color: "var(--text)",
                  }}
                >
                  🏆 Leaderboard
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat label="Total Points" value={fmt(stats.points)} />
                <Stat label="Verified Actions" value={fmt(stats.approved)} />
                <Stat label="Submissions" value={fmt(stats.total)} />
              </div>

              <div className="mt-3 text-xs" style={{ color: "var(--muted2)" }}>
                Pilot-ready environmental action tracking and verification
              </div>
            </div>

            {/* Right: panels */}
            <div className="md:col-span-5">
              <Panel>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">How GreenFlare works</div>
                    <div className="mt-1 text-xs" style={{ color: "var(--muted2)" }}>
                      MVP now • stronger verification later
                    </div>
                  </div>
                  <div
                    className="rounded-xl px-3 py-1 text-xs"
                    style={{
                      background: "rgba(16,185,129,0.14)",
                      border: `1px solid rgba(16,185,129,0.25)`,
                      color: "var(--text)",
                    }}
                  >
                    Pilot-ready
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <Step n="01" title="Do an action" desc="Plant a tree, recycle, or clean your community." />
                  <Step n="02" title="Submit proof" desc="Upload proof + location notes through the GreenFlare web app." />
                  <Step
                    n="03"
                    title="Review + reward"
                    desc="Verified actions earn points and become trusted impact records for communities, partners, and sponsors."
                  />
                </div>
              </Panel>

              <div className="mt-3">
                <Panel>
                  <div className="text-sm font-semibold">Why this matters (Nigeria)</div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                    Environmental projects often struggle with trust and reporting.
                    GreenFlare aims to make impact visible, verifiable, and fundable —
                    so cleanups and climate action can scale sustainably.
                  </p>
                </Panel>
              </div>
            </div>
          </div>
        </section>

        {/* DASH */}
        <section className="mt-14 md:mt-20 pb-16">
          <div className="grid gap-4 md:grid-cols-12">
            {/* Impact Overview */}
            <Card className="md:col-span-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Impact Overview</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Live totals from MVP submissions.
                  </p>
                </div>
                <Link
                  href="/submit"
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{ border: `1px solid var(--border)`, background: "var(--panel)" }}
                >
                  Add impact
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric title="Tree Planting" value={fmt(breakdown.tree)} sub="(from recent verified)" />
                <Metric title="Recycling" value={fmt(breakdown.recycle)} sub="(from recent verified)" />
                <Metric title="Cleanups" value={fmt(breakdown.cleanup)} sub="(from recent verified)" />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric title="Submissions" value={fmt(stats.total)} sub="total submitted" />
                <Metric title="Verified" value={fmt(stats.approved)} sub="approved actions" />
                <Metric title="Points" value={fmt(stats.points)} sub="impact points awarded" />
              </div>

              <div
                className="mt-5 rounded-xl p-4"
                style={{ border: `1px solid var(--border)`, background: "var(--panel2)" }}
              >
                <div className="text-sm font-semibold">Transparent accountability</div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  Approved actions become trusted records that communities, partners,
                  and sponsors can review with confidence.
                </p>
              </div>

              <div className="mt-4">
                <div
                  className="rounded-2xl p-5"
                  style={{
                    border: "1px solid rgba(16,185,129,0.22)",
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(56,189,248,0.10))",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">🏆 Points Leaderboard</div>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                        See top contributors by verified impact. Points help validate the
                        reward model before sponsor-backed rewards go live.
                      </p>
                      <div className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                        Rewards are “coming soon” — current points have no monetary value.
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href="/leaderboard"
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition"
                        style={{ background: "var(--accent)", color: "var(--accentText)" }}
                      >
                        View Leaderboard
                      </Link>

                      <Link
                        href="/submit"
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition"
                        style={{
                          border: "1px solid var(--border)",
                          background: "var(--panel)",
                          color: "var(--text)",
                        }}
                      >
                        Earn Points
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-5">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Latest verified submissions.
              </p>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : recent.length === 0 ? (
                  <div
                    className="rounded-xl p-4 text-sm"
                    style={{
                      border: `1px solid var(--border)`,
                      background: "var(--panel)",
                      color: "var(--muted)",
                    }}
                  >
                    No verified actions yet. Be the first to submit an impact action.
                  </div>
                ) : (
                  recent.map((r) => {
                    const txUrl = explorerTxUrl(r.chain_tx, r.chain_network);

                    return (
                      <div
                        key={r.id}
                        className="rounded-xl p-4"
                        style={{ border: "1px solid var(--border)", background: "var(--panel)" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">{actionLabel(r.action_type)}</div>
                          <span className="text-xs" style={{ color: "var(--muted2)" }}>
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                          {r.location_cell || "Unknown location"}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-[11px]" style={{ color: "var(--muted2)" }}>
                            Proof record:
                          </div>

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
                              View record ↗
                            </a>
                          ) : (
                            <span className="text-[11px]" style={{ color: "var(--muted2)" }}>
                              Verified in-app
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Milestones */}
            <Card className="md:col-span-12">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <h2 className="text-lg font-semibold">Milestones</h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    A clear path to scale with partners, sponsors and stronger verification.
                  </p>

                  <div className="mt-4 grid gap-3">
                    <MilestoneLine
                      title="Points Target"
                      now={stats.points}
                      target={5000}
                      pct={milestones.pointsPct}
                    />
                    <MilestoneLine
                      title="Verified Actions Target"
                      now={stats.approved}
                      target={150}
                      pct={milestones.actionsPct}
                    />
                  </div>
                </div>

                <div className="md:col-span-7">
                  <div className="grid gap-3 md:grid-cols-3">
                    <PhaseCard
                      title="Phase 1 — MVP"
                      bullets={["Manual verification", "Proof uploads", "Basic points + tracking"]}
                      badge="Live"
                    />
                    <PhaseCard
                      title="Phase 2 — Community Verify"
                      bullets={["Multi-validator checks", "Dispute flow", "Reputation scoring"]}
                      badge="Next"
                    />
                    <PhaseCard
                      title="Phase 3 — Scale + Partners"
                      bullets={["Sponsor dashboards", "Rewards pools", "Stronger verification infrastructure"]}
                      badge="Roadmap"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------- UI components ----------------- */

function ThemeBtn({
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
      aria-pressed={active}
      className="px-3 py-1.5 text-xs font-semibold rounded-xl transition"
      style={{
        background: active ? "var(--bg2)" : "transparent",
        border: active ? "1px solid rgba(16,185,129,0.28)" : "1px solid transparent",
        color: "var(--text)",
      }}
    >
      {children}
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel)",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={["rounded-2xl p-6", className].join(" ")}
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel)",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
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
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div
      className="flex gap-3 rounded-xl p-4"
      style={{ border: "1px solid var(--border)", background: "var(--panel2)" }}
    >
      <div className="w-10 shrink-0">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl text-xs font-semibold"
          style={{
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.06)",
            color: "var(--muted)",
          }}
        >
          {n}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ border: "1px solid var(--border)", background: "var(--panel2)" }}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-2xl font-semibold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
        {sub}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--panel)" }}>
      <div className="h-4 w-2/3 rounded" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="mt-2 h-3 w-full rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
    </div>
  );
}

function MilestoneLine({
  title,
  now,
  target,
  pct,
}: {
  title: string;
  now: number;
  target: number;
  pct: number;
}) {
  return (
    <div className="rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--panel2)" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {fmt(now)} / {fmt(target)}
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.10)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
      </div>
      <div className="mt-2 text-[11px]" style={{ color: "var(--muted2)" }}>
        {Math.round(pct)}% complete
      </div>
    </div>
  );
}

function PhaseCard({
  title,
  bullets,
  badge,
}: {
  title: string;
  bullets: string[];
  badge: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ border: "1px solid var(--border)", background: "var(--panel2)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px]"
          style={{
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.06)",
            color: "var(--muted)",
          }}
        >
          {badge}
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}