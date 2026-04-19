"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsAuthed(!!session?.user);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  const headerStyle: React.CSSProperties = scrolled
    ? {
        background: "rgba(250, 247, 241, 0.94)",
        borderBottom: "1px solid rgba(19,39,29,0.08)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 10px 30px rgba(19,39,29,0.06)",
      }
    : {
        background: "rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(245,243,239,0.10)",
        backdropFilter: "blur(10px)",
      };

  const brandTextColor = scrolled ? "#1F3A2C" : "#F5F3EF";
  const navTextColor = scrolled ? "rgba(19,39,29,0.82)" : "rgba(245,243,239,0.88)";
  const menuButtonStyle: React.CSSProperties = scrolled
    ? {
        background: "#F5F3EF",
        color: "#1F3A2C",
        border: "1px solid rgba(19,39,29,0.10)",
        boxShadow: "0 8px 18px rgba(19,39,29,0.08)",
      }
    : {
        background: "rgba(245,243,239,0.14)",
        color: "#F5F3EF",
        border: "1px solid rgba(245,243,239,0.18)",
        backdropFilter: "blur(10px)",
      };

  const desktopPillStyle: React.CSSProperties = scrolled
    ? {
        background: "#13271D",
        color: "#F5F3EF",
        border: "1px solid rgba(19,39,29,0.08)",
      }
    : {
        background: "rgba(245,243,239,0.08)",
        color: "#F5F3EF",
        border: "1px solid rgba(245,243,239,0.16)",
        backdropFilter: "blur(10px)",
      };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={headerStyle}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                border: scrolled
                  ? "1px solid rgba(19,39,29,0.10)"
                  : "1px solid rgba(245,243,239,0.16)",
                background: scrolled
                  ? "rgba(19,39,29,0.04)"
                  : "rgba(245,243,239,0.06)",
              }}
            >
              <span
                className="text-sm"
                style={{ color: scrolled ? "#1F3A2C" : "#F5F3EF" }}
              >
                ⟲
              </span>
            </div>

            <div
              className="font-serif text-[22px] leading-none tracking-[-0.02em]"
              style={{ color: brandTextColor }}
            >
              GreenFlare
            </div>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            <DesktopTextLink href="#about" color={navTextColor}>
              About
            </DesktopTextLink>
            <DesktopTextLink href="#impact" color={navTextColor}>
              Impact
            </DesktopTextLink>
            <DesktopTextLink href="#how-it-works" color={navTextColor}>
              How It Works
            </DesktopTextLink>
            <DesktopTextLink href="#community" color={navTextColor}>
              Community
            </DesktopTextLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthed ? (
              <>
                <PillLink href="/account" style={desktopPillStyle}>
                  Account
                </PillLink>
                <PillLink href="/submit" style={desktopPillStyle}>
                  Submit Action
                </PillLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02]"
                  style={desktopPillStyle}
                >
                  Log Out
                </button>
              </>
            ) : (
              <PillLink
                href="/auth"
                style={
                  scrolled
                    ? {
                        background: "#13271D",
                        color: "#F5F3EF",
                        border: "1px solid rgba(19,39,29,0.08)",
                      }
                    : {
                        background: "rgba(19,39,29,0.90)",
                        color: "#F5F3EF",
                        border: "1px solid rgba(245,243,239,0.08)",
                      }
                }
              >
                Log In
              </PillLink>
            )}
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 md:hidden"
            style={menuButtonStyle}
          >
            {open ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
          </button>
        </div>
      </header>

      <MobileOverlay
        open={open}
        onClose={() => setOpen(false)}
        isAuthed={isAuthed}
        onLogout={handleLogout}
      />
    </>
  );
}

function DesktopTextLink({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-[16px] font-medium transition-opacity duration-200 hover:opacity-70"
      style={{ color }}
    >
      {children}
    </a>
  );
}

function PillLink({
  href,
  style,
  children,
}: {
  href: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02]"
      style={style}
    >
      {children}
    </Link>
  );
}

function MobileOverlay({
  open,
  onClose,
  isAuthed,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  isAuthed: boolean;
  onLogout: () => void | Promise<void>;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] md:hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,88,61,0.96) 0%, rgba(16,70,52,0.98) 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex h-full flex-col px-8 pb-10 pt-8">
        <div className="mb-12 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: "rgba(245,243,239,0.10)",
              color: "#F5F3EF",
              border: "1px solid rgba(245,243,239,0.16)",
            }}
          >
            <X size={24} strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <MobileMenuLink href="#about" onClick={onClose}>
            About
          </MobileMenuLink>
          <MobileMenuLink href="#impact" onClick={onClose}>
            Impact
          </MobileMenuLink>
          <MobileMenuLink href="#how-it-works" onClick={onClose}>
            How It Works
          </MobileMenuLink>
          <MobileMenuLink href="#community" onClick={onClose}>
            Community
          </MobileMenuLink>
          {isAuthed && (
            <MobileMenuLink href="/account" onClick={onClose}>
              Account
            </MobileMenuLink>
          )}
          <MobileMenuLink href="/leaderboard" onClick={onClose}>
            Leaderboard
          </MobileMenuLink>
        </div>

        <div className="pt-6">
          {isAuthed ? (
            <div className="flex flex-col gap-3">
              <Link
                href="/submit"
                onClick={onClose}
                className="inline-flex h-14 w-full items-center justify-center rounded-full px-8 text-lg font-medium"
                style={{
                  background: "#D9952C",
                  color: "#13271D",
                }}
              >
                Submit Action
              </Link>

              <button
                type="button"
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                className="inline-flex h-14 w-full items-center justify-center rounded-full px-8 text-lg font-medium"
                style={{
                  background: "rgba(245,243,239,0.10)",
                  color: "#F5F3EF",
                  border: "1px solid rgba(245,243,239,0.16)",
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={onClose}
              className="inline-flex h-14 w-full items-center justify-center rounded-full px-8 text-lg font-medium"
              style={{
                background: "#D9952C",
                color: "#13271D",
              }}
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileMenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const isAnchor = href.startsWith("#");

  if (isAnchor) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="font-serif text-[48px] leading-none tracking-[-0.03em] text-[#F5F3EF] transition-opacity duration-200 hover:opacity-80"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-serif text-[48px] leading-none tracking-[-0.03em] text-[#F5F3EF] transition-opacity duration-200 hover:opacity-80"
    >
      {children}
    </Link>
  );
}