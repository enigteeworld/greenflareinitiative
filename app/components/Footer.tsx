import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--panel) 90%, transparent)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--text)" }}
            >
              GreenFlare Initiative
            </div>

            <p
              className="mt-2 max-w-md text-xs leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Community-led cleanups, recycling, and tree planting — with
              transparent, verifiable impact tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/submit"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel2)",
                color: "var(--text)",
              }}
            >
              Submit Action
            </Link>

            <Link
              href="/leaderboard"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel2)",
                color: "var(--text)",
              }}
            >
              Leaderboard
            </Link>

            
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
          <div style={{ color: "var(--muted2)" }}>
            © {new Date().getFullYear()} GreenFlare. All rights reserved.
          </div>

          <div
            className="flex items-center gap-3"
            style={{ color: "var(--muted2)" }}
          >
            <span>🇳🇬 Nigeria</span>
            <span style={{ opacity: 0.6 }}>•</span>
            <span>Pilot-ready MVP..</span>
          </div>
        </div>
      </div>
    </footer>
  );
}