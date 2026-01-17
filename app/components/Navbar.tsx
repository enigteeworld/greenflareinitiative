"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function clsx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // close drawer on route change feel (simple)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50",
        scrolled
          ? "bg-black/40 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/10 border border-white/15">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.55)]" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">
                GreenFlare
              </div>
              <div className="text-[11px] text-white/60 -mt-0.5">
                On-chain impact, real-world change
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/submit">Submit Action</NavLink>
            <NavLink href="/admin">Admin</NavLink>

            <a
              href="https://flare.network/"
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300 transition"
            >
              Built on Flare
            </a>
          </nav>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[86%] max-w-sm bg-[#0B0F14] border-l border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">GreenFlare</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-2">
              <DrawerLink href="/" onClick={() => setOpen(false)}>
                Home
              </DrawerLink>
              <DrawerLink href="/submit" onClick={() => setOpen(false)}>
                Submit Action
              </DrawerLink>
              <DrawerLink href="/admin" onClick={() => setOpen(false)}>
                Admin
              </DrawerLink>

              <a
                href="https://flare.network/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300 transition"
              >
                Built on Flare
              </a>

              <div className="mt-4 text-xs text-white/60 leading-relaxed">
                GreenFlare is in active development. We’re building transparent
                impact tracking and rewards for cleanups, recycling and tree
                planting in Nigeria.
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </Link>
  );
}

function DrawerLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition"
    >
      {children}
    </Link>
  );
}

