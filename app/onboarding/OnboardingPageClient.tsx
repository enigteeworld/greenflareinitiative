"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingPageClient({
  initialNextPath,
}: {
  initialNextPath: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [campus, setCampus] = useState("University of Benin");
  const [hostel, setHostel] = useState("");

  useEffect(() => {
    async function loadSessionAndProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace(`/auth?next=${encodeURIComponent(initialNextPath)}`);
        return;
      }

      const user = session.user;
      setAuthUserId(user.id);
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setDisplayName(profile.display_name || "");
        setPhone(profile.phone || "");
        setCampus(profile.campus || "University of Benin");
        setHostel(profile.hostel || "");

        if (profile.onboarding_completed) {
          router.replace(initialNextPath);
          return;
        }
      }

      setLoading(false);
    }

    loadSessionAndProfile();
  }, [router, initialNextPath]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!authUserId) {
      setMsg("❌ Missing authenticated user.");
      return;
    }

    if (fullName.trim().length < 2) {
      setMsg("❌ Please enter your full name.");
      return;
    }

    if (displayName.trim().length < 2) {
      setMsg("❌ Please enter a display name.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("profiles").upsert(
        {
          auth_user_id: authUserId,
          email: email.trim(),
          full_name: fullName.trim(),
          display_name: displayName.trim(),
          phone: phone.trim() || null,
          campus: campus.trim() || null,
          hostel: hostel.trim() || null,
          role: "participant",
          trust_score: 0,
          onboarding_completed: true,
        },
        {
          onConflict: "auth_user_id",
        }
      );

      if (error) throw error;

      router.replace(initialNextPath);
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Failed to save profile."}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div
            className="rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="text-lg font-semibold">Loading onboarding…</div>
            <div className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Preparing your GreenFlare profile.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                boxShadow: "var(--shadow)",
              }}
            >
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
                One-time onboarding
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Complete your GreenFlare profile
              </h1>

              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                This profile helps tie your submissions, trust score, and future
                rewards to a real participant record.
              </p>

              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <Field label="Email">
                  <input
                    value={email}
                    disabled
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none opacity-80"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>

                <Field label="Full Name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>

                <Field label="Display Name">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Name shown on leaderboard / dashboard"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Phone (optional)">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--panel2)",
                        color: "var(--text)",
                      }}
                    />
                  </Field>

                  <Field label="Hostel / Hall (optional)">
                    <input
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                      placeholder="Hall 4, Hall 1, Off-campus..."
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--panel2)",
                        color: "var(--text)",
                      }}
                    />
                  </Field>
                </div>

                <Field label="Campus">
                  <input
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    placeholder="University / campus"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accentText)",
                  }}
                >
                  {saving ? "Saving profile..." : "Continue"}
                </button>

                {msg ? (
                  <div
                    className="text-sm"
                    style={{
                      color: msg.startsWith("❌") ? "#ef4444" : "var(--muted)",
                    }}
                  >
                    {msg}
                  </div>
                ) : null}
              </form>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="text-lg font-semibold">What this profile unlocks</div>

              <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
                <li>• Personal dashboard</li>
                <li>• Trust score and reputation tiers</li>
                <li>• Bin-linked submission history</li>
                <li>• Future rewards and sponsor-backed campaigns</li>
              </ul>

              <div className="mt-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}