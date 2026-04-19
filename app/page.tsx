"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RecentItem = {
  id: string;
  action_type: string;
  location_cell: string | null;
  created_at: string;
  chain_tx?: string | null;
  chain_network?: string | null;
};

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}

function actionLabel(actionType?: string | null) {
  switch (actionType) {
    case "TREE":
      return "Tree Planting";
    case "RECYCLE":
      return "Recycling";
    case "CLEANUP":
      return "Community Cleanup";
    default:
      return "Impact Action";
  }
}

function iconForAction(actionType?: string | null) {
  switch (actionType) {
    case "TREE":
      return "🌳";
    case "RECYCLE":
      return "♻️";
    case "CLEANUP":
      return "🧹";
    default:
      return "🌱";
  }
}

function explorerTxUrl(tx?: string | null, network?: string | null) {
  if (!tx) return null;
  const n = (network || "").toLowerCase();

  if (n === "coston2") {
    return `https://coston2-explorer.flare.network/tx/${tx}`;
  }

  return null;
}

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0px)" : "translateY(24px)",
      transition: "opacity 700ms ease, transform 700ms ease",
    } as React.CSSProperties,
  };
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    let startTime: number | null = null;

    function tick(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const next = Math.floor(progress * target);

      if (next !== start) {
        start = next;
        setCount(next);
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

const impactCards = [
  {
    title: "Tree Planting",
    image: "/images/tree-planting-thumb.jpg",
    description:
      "Community tree planting actions that improve air quality, restore ecosystems, and create visible local impact.",
    href: "/submit",
  },
  {
    title: "Recycling",
    image: "/images/recycling-thumb.jpg",
    description:
      "Sorting and collection programs with designated bins, starting from UNIBEN Hall 4 and expanding across campuses.",
    href: "/submit",
  },
  {
    title: "Cleanups",
    image: "/images/cleanup-thumb.jpg",
    description:
      "Coordinated waste removal from roadsides, hostels, and public spaces — turning pollution into visible progress.",
    href: "/submit",
  },
  {
    title: "Verification",
    image: "/images/blockchain-thumb.jpg",
    description:
      "Every approved action becomes a trusted proof record that communities, partners, and sponsors can review confidently.",
    href: "/verify",
  },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    points: 0,
  });

  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", "#F5F3EA");
    root.style.setProperty("--bg2", "#ECE6DA");
    root.style.setProperty("--panel", "rgba(255,255,255,0.72)");
    root.style.setProperty("--panel2", "rgba(255,255,255,0.50)");
    root.style.setProperty("--border", "rgba(15,23,42,0.10)");
    root.style.setProperty("--text", "#13271D");
    root.style.setProperty("--muted", "rgba(19,39,29,0.72)");
    root.style.setProperty("--muted2", "rgba(19,39,29,0.52)");
    root.style.setProperty("--accent", "#C58B2A");
    root.style.setProperty("--accent2", "#5D734D");
    root.style.setProperty("--deep", "#1F3A2C");
    root.style.setProperty("--sand", "#D8D0C2");
    root.style.setProperty("--soft", "#FAF7F1");
    root.style.setProperty("--shadow", "0 18px 40px rgba(31,58,44,0.08)");
    root.style.colorScheme = "light";
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
      const approved = data.filter(
        (d: { status: string }) => d.status === "approved"
      ).length;
      const points = data.reduce(
        (sum: number, d: { points: number | null }) => sum + (d.points || 0),
        0
      );

      setStats({ total, approved, points });
    }

    async function loadRecent() {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, action_type, location_cell, created_at, chain_tx, chain_network"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(4);

      if (!mounted) return;

      if (error) {
        const fallback = await supabase
          .from("submissions")
          .select("id, action_type, location_cell, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(4);

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

  const pointsCount = useCountUp(stats.points, 1200);
  const actionsCount = useCountUp(stats.approved, 1200);
  const submissionsCount = useCountUp(stats.total, 1200);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Hero />
      <div className="relative z-[2]">
        <AboutSection />
        <ImpactGridSection />
        <HowItWorksSection
          points={pointsCount}
          actions={actionsCount}
          submissions={submissionsCount}
        />
        <CommunitySection recent={recent} loading={loading} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100svh",
        backgroundColor: "#104634",
      }}
    >
      <div
        className="absolute inset-0 z-[0]"
        style={{
          backgroundImage: "url('/images/aerial-community-event.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          willChange: "auto",
        }}
      />

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,70,52,0.46) 0%, rgba(16,70,52,0.55) 38%, rgba(13,39,29,0.76) 100%)",
        }}
      />

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 50% 36%, rgba(224,184,109,0.10), transparent 28%)",
        }}
      />

      <div className="relative z-[2] mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col justify-center px-5 pb-16 pt-28 md:px-12 md:pb-20 md:pt-32">
        <div className="mx-auto flex w-full max-w-[920px] flex-col items-center text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] md:mb-7 md:px-5 md:py-2.5 md:text-[11px]"
            style={{
              borderColor: "rgba(245,243,239,0.22)",
              background: "rgba(245,243,239,0.06)",
              color: "rgba(245,243,239,0.84)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "#E0B86D" }}
            />
            Building in public • Nigeria-first • verification-first
          </div>

          <h1
            className="max-w-[860px] font-serif text-[52px] leading-[0.95] tracking-[-0.03em] text-[#F5F3EF] sm:text-[72px] md:text-[96px] lg:text-[108px]"
            style={{
              textShadow: "0 10px 34px rgba(0,0,0,0.12)",
            }}
          >
            Environmental action,
            <br />
            made visible.
          </h1>

          <p
            className="mx-auto mt-5 max-w-[690px] text-[16px] leading-relaxed text-[rgba(245,243,239,0.88)] sm:text-[18px] md:mt-6 md:text-[22px]"
            style={{
              textShadow: "0 6px 20px rgba(0,0,0,0.10)",
            }}
          >
            GreenFlare helps communities track, verify, and reward real-world
            actions like tree planting, recycling, and cleanups.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row md:mt-10">
            <Link
              href="/submit"
              className="inline-flex h-12 w-full max-w-[260px] items-center justify-center rounded-full px-8 text-sm font-medium uppercase tracking-[0.08em] transition-all duration-300 hover:scale-[1.03] md:h-14 md:min-w-[224px]"
              style={{
                background: "#F5F3EF",
                color: "#13271D",
                boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
              }}
            >
              Explore Impact
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex h-12 w-full max-w-[260px] items-center justify-center rounded-full border px-8 text-sm font-medium uppercase tracking-[0.08em] transition-all duration-300 hover:scale-[1.03] md:h-14 md:min-w-[224px]"
              style={{
                borderColor: "rgba(245,243,239,0.24)",
                background: "rgba(245,243,239,0.04)",
                color: "#F5F3EF",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            >
              View Leaders
            </Link>
          </div>

          <div className="mt-9 flex flex-col items-center md:mt-10">
            <div className="relative h-12 w-[1px] bg-[rgba(245,243,239,0.34)]">
              <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { ref: textRef, style: textStyle } = useScrollReveal<HTMLElement>();
  const { ref: imageRef, style: imageStyle } = useScrollReveal<HTMLDivElement>();
  const { ref: cardRef, style: cardStyle } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={textRef}
      id="about"
      className="relative py-20 md:py-32"
      style={{ background: "var(--sand)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7" style={textStyle}>
            <span
              className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ color: "var(--accent2)" }}
            >
              About the Initiative
            </span>

            <h2
              className="mb-6 font-serif text-4xl leading-[1.08] md:text-[56px]"
              style={{ color: "var(--deep)" }}
            >
              Real-world environmental action, verified and rewarded.
            </h2>

            <p
              className="max-w-[560px] text-[17px] leading-relaxed"
              style={{ color: "rgba(19,39,29,0.82)" }}
            >
              GreenFlare is a community-led initiative promoting tree planting,
              recycling, and cleanups — with transparent, verifiable impact
              tracking. Sponsors see real proof. Communities earn points.
            </p>
          </div>

          <div className="lg:col-span-5 lg:mt-16" ref={imageRef} style={imageStyle}>
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <img
                  src="/images/community-tree-planting.jpg"
                  alt="Community tree planting"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>

              <div
                ref={cardRef}
                style={cardStyle}
                className="absolute -bottom-6 -left-4 max-w-[240px] rounded-xl p-5 shadow-lg md:-left-8"
                aria-hidden="true"
              >
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "var(--soft)",
                    boxShadow: "0 16px 40px rgba(31,58,44,0.12)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span style={{ color: "var(--deep)" }}>✅</span>
                    <span
                      className="text-[16px] font-medium"
                      style={{ color: "var(--deep)" }}
                    >
                      Verified Impact
                    </span>
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(19,39,29,0.72)" }}
                  >
                    Every approved action becomes a trusted proof record for
                    accountability and reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactGridSection() {
  const { ref: headerRef, style: headerStyle } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="impact"
      className="relative py-20 md:py-32"
      style={{ background: "var(--soft)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <div ref={headerRef} style={headerStyle} className="mb-16 text-center">
          <span
            className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--accent2)" }}
          >
            Impact Areas
          </span>

          <h2
            className="font-serif text-4xl md:text-[36px]"
            style={{ color: "var(--deep)" }}
          >
            Where Change Happens
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {impactCards.map((card, i) => (
            <ImpactCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactCard({
  title,
  image,
  description,
  href,
  index,
}: {
  title: string;
  image: string;
  description: string;
  href: string;
  index: number;
}) {
  const { ref, style } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transitionDelay: `${index * 90}ms`,
      }}
      className="group overflow-hidden rounded-xl"
    >
      <div
        className="overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{
          borderColor: "rgba(19,39,29,0.08)",
          background: "rgba(216,208,194,0.16)",
          boxShadow: "0 8px 22px rgba(19,39,29,0.04)",
        }}
      >
        <div className="overflow-hidden">
          <img
            src={image}
            alt={title}
            className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>

        <div className="p-6">
          <h3
            className="mb-2 text-[22px] font-medium"
            style={{ color: "var(--deep)" }}
          >
            {title}
          </h3>

          <p
            className="mb-4 text-[15px] leading-relaxed"
            style={{ color: "rgba(19,39,29,0.70)" }}
          >
            {description}
          </p>

          <Link
            href={href}
            className="inline-flex items-center gap-1 text-[15px] font-medium transition-all hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Learn More <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function HowItWorksSection({
  points,
  actions,
  submissions,
}: {
  points: number;
  actions: number;
  submissions: number;
}) {
  const { ref: headerRef, style: headerStyle } = useScrollReveal<HTMLDivElement>();
  const { ref: statsRef, style: statsStyle } = useScrollReveal<HTMLDivElement>();

  const steps = [
    {
      num: "01",
      title: "Do an Action",
      desc: "Plant a tree, recycle, or clean your community. Every action counts, no matter how small.",
    },
    {
      num: "02",
      title: "Submit Proof",
      desc: "Upload proof and location notes through the GreenFlare web app. Quick, simple, transparent.",
    },
    {
      num: "03",
      title: "Review + Reward",
      desc: "Verified actions earn points and become trusted impact records for communities, partners, and sponsors.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-20 md:py-32"
      style={{ background: "var(--sand)" }}
    >
      <div className="mx-auto max-w-[960px] px-5 md:px-12">
        <div ref={headerRef} style={headerStyle} className="mb-16 text-center">
          <span
            className="mb-4 inline-block text-[11px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--accent2)" }}
          >
            The Process
          </span>

          <h2
            className="font-serif text-4xl md:text-[36px]"
            style={{ color: "var(--deep)" }}
          >
            Three Steps to Impact
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-[2px] bg-[rgba(197,139,42,0.25)] md:block" />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <StepCard key={step.num} {...step} index={i} />
            ))}
          </div>
        </div>

        <div
          ref={statsRef}
          style={statsStyle}
          className="mt-20 border-t pt-8"
          aria-label="Live stats"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <span
                className="block font-serif text-5xl"
                style={{ color: "var(--deep)" }}
              >
                {fmt(points)}
              </span>
              <span
                className="mt-2 block text-[11px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--accent2)" }}
              >
                Points Awarded
              </span>
            </div>

            <div>
              <span
                className="block font-serif text-5xl"
                style={{ color: "var(--deep)" }}
              >
                {fmt(actions)}
              </span>
              <span
                className="mt-2 block text-[11px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--accent2)" }}
              >
                Verified Actions
              </span>
            </div>

            <div>
              <span
                className="block font-serif text-5xl"
                style={{ color: "var(--deep)" }}
              >
                {fmt(submissions)}
              </span>
              <span
                className="mt-2 block text-[11px] font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--accent2)" }}
              >
                Submissions
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  num,
  title,
  desc,
  index,
}: {
  num: string;
  title: string;
  desc: string;
  index: number;
}) {
  const { ref, style } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transitionDelay: `${index * 120}ms`,
      }}
      className="text-center"
    >
      <span
        className="mb-4 block font-serif text-5xl"
        style={{ color: "rgba(197,139,42,0.30)" }}
      >
        {num}
      </span>

      <h3
        className="mb-3 text-[22px] font-medium"
        style={{ color: "var(--deep)" }}
      >
        {title}
      </h3>

      <p
        className="mx-auto max-w-[280px] text-[15px] leading-relaxed"
        style={{ color: "rgba(19,39,29,0.70)" }}
      >
        {desc}
      </p>
    </div>
  );
}

function CommunitySection({
  recent,
  loading,
}: {
  recent: RecentItem[];
  loading: boolean;
}) {
  const { ref: bannerRef, style: bannerStyle } = useScrollReveal<HTMLDivElement>();
  const { ref: textRef, style: textStyle } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="community"
      className="relative py-20 md:py-32"
      style={{ background: "var(--soft)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-12">
        <div
          ref={bannerRef}
          style={bannerStyle}
          className="relative overflow-hidden rounded-2xl"
        >
          <img
            src="/images/aerial-community-event.jpg"
            alt="Community environmental event"
            className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,58,44,0.74)] via-transparent to-transparent" />

          <div
            ref={textRef}
            style={textStyle}
            className="absolute bottom-6 left-6 max-w-md md:bottom-12 md:left-12"
          >
            <h2
              className="mb-3 font-serif text-3xl md:text-[36px]"
              style={{ color: "var(--soft)" }}
            >
              Join a Growing Movement
            </h2>

            <p
              className="mb-6 text-[17px]"
              style={{ color: "rgba(245,243,234,0.88)" }}
            >
              Be part of a more transparent environmental community, starting
              from campuses and scaling outward.
            </p>

            <Link
              href="/leaderboard"
              className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors duration-300"
              style={{
                background: "var(--accent)",
                color: "#13271d",
              }}
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-6">
            <span
              className="inline-block text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ color: "var(--accent2)" }}
            >
              Recent Verified Activity
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <RecentSkeleton />
                <RecentSkeleton />
                <RecentSkeleton />
                <RecentSkeleton />
              </>
            ) : recent.length === 0 ? (
              <div
                className="rounded-xl border p-6 text-sm lg:col-span-4"
                style={{
                  borderColor: "rgba(19,39,29,0.10)",
                  background: "rgba(255,255,255,0.58)",
                  color: "var(--muted)",
                }}
              >
                No verified actions yet. Be the first to submit an impact action.
              </div>
            ) : (
              recent.map((item, i) => (
                <RecentCard key={item.id} item={item} index={i} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentCard({
  item,
  index,
}: {
  item: RecentItem;
  index: number;
}) {
  const { ref, style } = useScrollReveal<HTMLDivElement>();
  const txUrl = explorerTxUrl(item.chain_tx, item.chain_network);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transitionDelay: `${index * 80}ms`,
      }}
      className="text-center"
    >
      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: "rgba(19,39,29,0.10)",
          background: "rgba(255,255,255,0.56)",
          boxShadow: "0 10px 26px rgba(31,58,44,0.05)",
        }}
      >
        <div
          className="text-[16px] font-medium"
          style={{ color: "var(--deep)" }}
        >
          {iconForAction(item.action_type)} {actionLabel(item.action_type)}
        </div>

        <div
          className="mt-2 text-sm"
          style={{ color: "rgba(19,39,29,0.62)" }}
        >
          {item.location_cell || "Unknown location"}
        </div>

        <div
          className="mt-2 text-xs italic"
          style={{ color: "rgba(19,39,29,0.58)" }}
        >
          {new Date(item.created_at).toLocaleDateString()}
        </div>

        <div className="mt-4">
          {txUrl ? (
            <a
              href={txUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              View record →
            </a>
          ) : (
            <span
              className="text-sm"
              style={{ color: "rgba(19,39,29,0.58)" }}
            >
              Verified in-app
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        borderColor: "rgba(19,39,29,0.10)",
        background: "rgba(255,255,255,0.56)",
      }}
    >
      <div
        className="mx-auto h-5 w-2/3 rounded"
        style={{ background: "rgba(19,39,29,0.10)" }}
      />
      <div
        className="mx-auto mt-3 h-4 w-1/2 rounded"
        style={{ background: "rgba(19,39,29,0.08)" }}
      />
      <div
        className="mx-auto mt-4 h-4 w-1/3 rounded"
        style={{ background: "rgba(19,39,29,0.08)" }}
      />
    </div>
  );
}
