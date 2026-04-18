"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AuthMode = "login" | "signup";

export default function AuthPageClient({
  initialNextPath,
  initialMode,
}: {
  initialNextPath: string;
  initialMode: AuthMode;
}) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(
    initialMode === "signup" ? "signup" : "login"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passwordOk = useMemo(() => password.trim().length >= 6, [password]);

  async function routeAfterAuth(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (!profile || !profile.onboarding_completed) {
      router.replace(`/onboarding?next=${encodeURIComponent(initialNextPath)}`);
      return;
    }

    router.replace(initialNextPath);
  }

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await routeAfterAuth(session.user.id);
      }
    }

    checkSession();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!emailOk) {
      setMsg("❌ Please enter a valid email address.");
      return;
    }

    if (!passwordOk) {
      setMsg("❌ Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup" && fullName.trim().length < 2) {
      setMsg("❌ Please enter your full name.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.user && data.session) {
          await routeAfterAuth(data.user.id);
          return;
        }

        setMsg(
          "✅ Account created. Check your email to confirm your account before logging in."
        );
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.user) {
        await routeAfterAuth(data.user.id);
      }
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Authentication failed."}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
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
                GreenFlare account access
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                {mode === "login" ? "Log in to continue" : "Create your account"}
              </h1>

              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                Designated bin submissions, trust scoring, dashboard access, and
                future rewards all work better with a real participant account.
              </p>

              <div
                className="mt-5 inline-flex rounded-2xl border p-1"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--panel2)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{
                    background: mode === "login" ? "var(--bg2)" : "transparent",
                    color: "var(--text)",
                  }}
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{
                    background: mode === "signup" ? "var(--bg2)" : "transparent",
                    color: "var(--text)",
                  }}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === "signup" ? (
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
                ) : null}

                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>

                <Field label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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
                  disabled={loading}
                  className="rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accentText)",
                  }}
                >
                  {loading
                    ? mode === "login"
                      ? "Logging in..."
                      : "Creating account..."
                    : mode === "login"
                    ? "Log In"
                    : "Create Account"}
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

          <div className="lg:col-span-6">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="text-lg font-semibold">What happens after login?</div>

              <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
                <li>• First-time users complete onboarding once.</li>
                <li>• Returning users go straight to their next page.</li>
                <li>• QR/bin submissions can now be tied to real user identity.</li>
                <li>• This unlocks future trust score, dashboard, and reward logic.</li>
              </ul>

              <div className="mt-6 flex gap-2">
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

                <Link
                  href="/submit"
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                >
                  Open Submit
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