"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
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

function ThemePill({
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
        border: active
          ? "1px solid rgba(16,185,129,0.28)"
          : "1px solid transparent",
        color: "var(--text)",
      }}
    >
      {children}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved =
      (localStorage.getItem("gf_theme") as ThemeMode | null) ?? "system";
    setTheme(saved);
    applyTheme(saved);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current =
        (localStorage.getItem("gf_theme") as ThemeMode | null) ?? "system";
      if (current === "system") applyTheme("system");
    };
    mq?.addEventListener?.("change", onChange);

    return () => {
      mq?.removeEventListener?.("change", onChange);
    };
  }, []);

  function setThemeAndPersist(mode: ThemeMode) {
    setTheme(mode);
    localStorage.setItem("gf_theme", mode);
    applyTheme(mode);
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
              }}
              aria-hidden="true"
            >
              <span style={{ color: "var(--accent)" }}>🌱</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                GreenFlare
              </div>
              <div className="text-[11px]" style={{ color: "var(--muted2)" }}>
                Flare-powered impact
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {/* ✅ NEW */}
            <NavLink href="/">Home</NavLink>
            <NavLink href="/leaderboard">🏆 Leaderboard</NavLink>

            <NavLink href="/submit">Submit</NavLink>
            <NavLink href="/admin">Admin</NavLink>

            <a
              href="https://flare.network/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-3 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              Flare
            </a>

            {/* Theme */}
            <div
              className="ml-2 inline-flex items-center gap-1 rounded-2xl border p-1"
              style={{ borderColor: "var(--border)", background: "var(--panel)" }}
            >
              <ThemePill
                active={theme === "system"}
                onClick={() => setThemeAndPersist("system")}
              >
                System
              </ThemePill>
              <ThemePill
                active={theme === "light"}
                onClick={() => setThemeAndPersist("light")}
              >
                Light
              </ThemePill>
              <ThemePill
                active={theme === "dark"}
                onClick={() => setThemeAndPersist("dark")}
              >
                Dark
              </ThemePill>
            </div>
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setThemeAndPersist(theme === "dark" ? "light" : "dark")}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
              aria-label="Toggle theme"
            >
              {getSystemTheme() === "dark" ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open ? (
          <div id="mobile-nav" className="md:hidden pb-4">
            <div
              className="rounded-2xl p-3"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
              }}
            >
              <div className="grid gap-2">
                {/* ✅ NEW */}
                <NavLink href="/" onClick={() => setOpen(false)}>Home</NavLink>
                <NavLink href="/leaderboard" onClick={() => setOpen(false)}>
                  🏆 Leaderboard
                </NavLink>

                <NavLink href="/submit" onClick={() => setOpen(false)}>
                  Submit
                </NavLink>
                <NavLink href="/admin" onClick={() => setOpen(false)}>
                  Admin
                </NavLink>

                <a
                  href="https://flare.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl px-3 py-2 text-sm font-semibold transition"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                >
                  Flare Network
                </a>

                <div className="mt-2">
                  <div className="text-xs font-semibold" style={{ color: "var(--muted2)" }}>
                    Theme
                  </div>
                  <div
                    className="mt-2 inline-flex items-center gap-1 rounded-2xl border p-1"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--panel2)",
                    }}
                  >
                    <ThemePill
                      active={theme === "system"}
                      onClick={() => setThemeAndPersist("system")}
                    >
                      System
                    </ThemePill>
                    <ThemePill
                      active={theme === "light"}
                      onClick={() => setThemeAndPersist("light")}
                    >
                      Light
                    </ThemePill>
                    <ThemePill
                      active={theme === "dark"}
                      onClick={() => setThemeAndPersist("dark")}
                    >
                      Dark
                    </ThemePill>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-2 text-sm font-semibold transition"
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel)",
        color: "var(--text)",
      }}
    >
      {children}
    </Link>
  );
}

