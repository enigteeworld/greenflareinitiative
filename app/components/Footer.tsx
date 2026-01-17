import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">GreenFlare Initiative</div>
            <p className="mt-2 text-xs text-white/60 max-w-md leading-relaxed">
              Community-led cleanups, recycling and tree planting — with
              transparent impact tracking on Flare. Built responsibly, step by
              step.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/submit"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Submit Action
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Admin
            </Link>
            <a
              href="https://flare.network/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Flare Network
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs text-white/50">
          <div>© {new Date().getFullYear()} GreenFlare. All rights reserved.</div>
          <div className="flex gap-3">
            <span>🇳🇬 Nigeria</span>
            <span className="text-white/30">•</span>
            <span>Testnet MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

