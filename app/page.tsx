"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SubmissionRow = {
  id: string;
  status: string | null;
  points: number | null;
  action_type: string | null;
  location_cell: string | null;
  created_at: string;
};

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

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  // ✅ SAME LOGIC AS YOUR WORKING VERSION
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    points: 0,
  });

  const [recent, setRecent] = useState<
    Pick<SubmissionRow, "id" | "action_type" | "location_cell" | "created_at">[]
  >([]);

  // Derived counters for the premium “Impact Overview” section
  const breakdown = useMemo(() => {
    // counts based on RECENT APPROVED + approved total
    // We’ll compute counts from the last fetched approved rows (recent),
    // plus we can compute counts from all approved via an extra query if you want later.
    const tree = recent.filter((r) => r.action_type === "TREE").length;
    const recycle = recent.filter((r) => r.action_type === "RECYCLE").length;
    const cleanup = recent.filter((r) => r.action_type === "CLEANUP").length;
    return { tree, recycle, cleanup };
  }, [recent]);

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
      const approved = data.filter((d) => d.status === "approved").length;

      // ✅ exactly like your working version (sums points across all rows)
      const points = data.reduce((sum, d) => sum + (d.points || 0), 0);

      setStats({ total, approved, points });
    }

    async function loadRecent() {
      const { data } = await supabase
        .from("submissions")
        .select("id, action_type, location_cell, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!mounted) return;
      setRecent((data || []) as any);
    }

    Promise.all([loadStats(), loadRecent()]).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const milestones = useMemo(() => {
    const targetPoints = 5000;
    const targetActions = 150;

    const pointsPct =
      targetPoints <= 0
        ? 0
        : Math.min(100, (stats.points / targetPoints) * 100);

    const actionsPct =
      targetActions <= 0
        ? 0
        : Math.min(100, (stats.approved / targetActions) * 100);

    return { targetPoints, targetActions, pointsPct, actionsPct };
  }, [stats.points, stats.approved]);

  return (
    <div className="relative">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-40 -left-24 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* HERO */}
        <section className="pt-14 md:pt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
            Building in public • Nigeria-first • Flare-powered
          </div>

          <div className="mt-6 grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Real-world environmental action,
                <span className="text-emerald-300"> verified</span> and
                <span className="text-emerald-300"> rewarded</span>.
              </h1>

              <p className="mt-4 text-white/70 leading-relaxed max-w-xl">
                GreenFlare is a community-led initiative promoting tree planting,
                recycling, and cleanups — with transparent impact tracking on the
                Flare Network. Sponsors see real proof. Communities earn points.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-400 text-black px-5 py-3 text-sm font-semibold hover:bg-emerald-300 transition"
                >
                  Submit an Impact Action
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Admin Panel
                </Link>
              </div>

              {/* Top counters */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat label="Total Points" value={fmt(stats.points)} />
                <Stat label="Verified Actions" value={fmt(stats.approved)} />
                <Stat label="Submissions" value={fmt(stats.total)} />
              </div>
            </div>

            {/* Right side: feature panel */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">How GreenFlare works</div>
                    <div className="mt-1 text-xs text-white/60">
                      MVP now • stronger verification later
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-400/15 border border-emerald-300/20 px-3 py-1 text-xs text-emerald-200">
                    On-chain ready
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <Step
                    n="01"
                    title="Do an action"
                    desc="Plant a tree, recycle, or clean your community."
                  />
                  <Step
                    n="02"
                    title="Submit proof"
                    desc="Upload proof + location notes through the GreenFlare web app."
                  />
                  <Step
                    n="03"
                    title="Verify + reward"
                    desc="Verified actions earn points — recorded on Flare for transparent accountability."
                  />
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-sm font-semibold">Why this matters (Nigeria)</div>
                <p className="mt-2 text-xs text-white/60 leading-relaxed">
                  Environmental projects often struggle with trust and reporting.
                  GreenFlare aims to make impact visible, verifiable, and fundable —
                  so cleanups and climate action can scale sustainably.
                </p>
                <div className="mt-3 text-[11px] text-white/50">
                  MVP running on Flare Coston2 testnet.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Dashcards */}
        <section className="mt-14 md:mt-20 pb-16">
          <div className="grid gap-4 md:grid-cols-12">
            {/* Impact summary */}
            <Card className="md:col-span-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Impact Overview</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Live totals from MVP submissions.
                  </p>
                </div>
                <Link
                  href="/submit"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Add impact
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric
                  title="Tree Planting"
                  value={fmt(breakdown.tree)}
                  sub="(from recent verified)"
                />
                <Metric
                  title="Recycling"
                  value={fmt(breakdown.recycle)}
                  sub="(from recent verified)"
                />
                <Metric
                  title="Cleanups"
                  value={fmt(breakdown.cleanup)}
                  sub="(from recent verified)"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric title="Submissions" value={fmt(stats.total)} sub="total submitted" />
                <Metric title="Verified" value={fmt(stats.approved)} sub="approved actions" />
                <Metric title="Points" value={fmt(stats.points)} sub="impact points awarded" />
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold">Transparent accountability</div>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">
                  We connect verified activities to on-chain records on Flare —
                  so sponsors and partners can audit impact publicly.
                </p>
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="md:col-span-5">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="mt-1 text-sm text-white/60">
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
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    No verified actions yet. Be the first to submit an impact action.
                  </div>
                ) : (
                  recent.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">
                          {actionLabel(r.action_type)}
                        </div>
                        <span className="text-xs text-white/60">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {r.location_cell || "Unknown location"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Milestones */}
            <Card className="md:col-span-12">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <h2 className="text-lg font-semibold">Milestones</h2>
                  <p className="mt-1 text-sm text-white/60">
                    A clear path to scale with partners, sponsors and stronger verification.
                  </p>

                  <div className="mt-4 grid gap-3">
                    <MilestoneLine
                      title="Points Target"
                      now={stats.points}
                      target={milestones.targetPoints}
                      pct={milestones.pointsPct}
                    />
                    <MilestoneLine
                      title="Verified Actions Target"
                      now={stats.approved}
                      target={milestones.targetActions}
                      pct={milestones.actionsPct}
                    />
                  </div>
                </div>

                <div className="md:col-span-7">
                  <div className="grid gap-3 md:grid-cols-3">
                    <PhaseCard
                      title="Phase 1 — MVP"
                      bullets={[
                        "Manual verification",
                        "Proof uploads",
                        "Basic points + tracking",
                      ]}
                      badge="Live"
                    />
                    <PhaseCard
                      title="Phase 2 — Community Verify"
                      bullets={[
                        "Multi-validator checks",
                        "Dispute flow",
                        "Reputation scoring",
                      ]}
                      badge="Next"
                    />
                    <PhaseCard
                      title="Phase 3 — Scale + Partners"
                      bullets={[
                        "Sponsor dashboards",
                        "On-chain rewards pools",
                        "Oracle-assisted verification",
                      ]}
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

/* ----------------- UI COMPONENTS ----------------- */

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-white/40">{hint}</div> : null}
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="w-10 shrink-0">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/70">
          {n}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/60 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

function Metric({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-emerald-200">{value}</div>
      <div className="mt-1 text-xs text-white/60">{sub}</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="mt-2 h-3 w-full rounded bg-white/10" />
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
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-white/60">
          {fmt(now)} / {fmt(target)}
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400/80"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] text-white/50">{Math.round(pct)}% complete</div>
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
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
          {badge}
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-white/60">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

