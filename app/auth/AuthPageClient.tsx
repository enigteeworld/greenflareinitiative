"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AuthMode = "login" | "signup";

const infoItems = [
  "First-time users complete onboarding once.",
  "Returning users go straight to their next page.",
  "QR/bin submissions can now be tied to real user identity.",
  "This unlocks future trust score, dashboard, and reward logic.",
];

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = useMemo(() => searchParams.get("next") || "/account", [searchParams]);

  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (!formData.fullName.trim()) {
          throw new Error("Please enter your full name.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
            },
          },
        });

        if (error) throw error;

        const userId = data.user?.id;

        if (userId) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            auth_user_id: userId,
            full_name: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            onboarding_completed: false,
          });

          if (profileError) throw profileError;
        }

        router.push(`/onboarding?next=${encodeURIComponent(next)}`);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) throw error;

      const userId = data.user?.id;

      if (!userId) {
        router.push(next);
        return;
      }

      let profile:
        | { onboarding_completed?: boolean | null }
        | null = null;

      const byAuthUserId = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (byAuthUserId.error) throw byAuthUserId.error;

      if (byAuthUserId.data) {
        profile = byAuthUserId.data;
      } else {
        const byId = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .maybeSingle();

        if (byId.error) throw byId.error;

        if (byId.data) {
          profile = byId.data;
        }
      }

      const hasCompletedOnboarding = profile?.onboarding_completed === true;

      if (!hasCompletedOnboarding) {
        router.push(`/onboarding?next=${encodeURIComponent(next)}`);
        return;
      }

      router.push(next);
    } catch (error: any) {
      setMsg(error?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="min-h-screen bg-[#f5f3ee]">
        <div className="flex min-h-screen flex-col md:flex-row">
          <div className="relative hidden md:block md:w-1/2">
            <Image
              src="/images/recycling-thumb.jpg"
              alt="Recycling station"
              fill
              priority
              className="object-cover"
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(234,208,138,0.18) 0%, rgba(245,243,238,0.06) 42%, rgba(245,243,238,0.12) 100%)",
              }}
            />

            <div
              className="absolute inset-y-0 right-0 w-[38%]"
              style={{
                background:
                  "linear-gradient(to right, rgba(245,243,238,0) 0%, rgba(245,243,238,0.82) 58%, rgba(245,243,238,0.97) 100%)",
              }}
            />

            <div
              className="absolute inset-x-0 top-0 h-32"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(245,243,238,0.18) 0%, rgba(245,243,238,0) 100%)",
              }}
            />
          </div>

          <div className="flex flex-1 items-start justify-center px-6 pb-10 pt-28 md:items-center md:px-8 md:pb-6 md:pt-24">
            <div
              className="w-full max-w-[560px] md:max-w-[400px]"
              style={{
                animation:
                  "fadeInRight 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.2s both",
              }}
            >
              <div className="mb-10 flex items-center justify-center gap-12">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setMsg("");
                  }}
                  className={`relative pb-3 text-[16px] font-medium transition-all duration-200 sm:text-[17px] ${
                    mode === "login"
                      ? "text-[#0f5132]"
                      : "text-[#0f5132]/45 hover:text-[#0f5132]"
                  }`}
                >
                  Log In
                  {mode === "login" ? (
                    <span className="absolute bottom-0 left-1/2 h-[3px] w-[64px] -translate-x-1/2 rounded-full bg-[#d49333]" />
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setMsg("");
                  }}
                  className={`relative pb-3 text-[16px] font-medium transition-all duration-200 sm:text-[17px] ${
                    mode === "signup"
                      ? "text-[#0f5132]"
                      : "text-[#0f5132]/45 hover:text-[#0f5132]"
                  }`}
                >
                  Sign Up
                  {mode === "signup" ? (
                    <span className="absolute bottom-0 left-1/2 h-[3px] w-[82px] -translate-x-1/2 rounded-full bg-[#d49333]" />
                  ) : null}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" ? (
                  <Field label="Full Name">
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, fullName: e.target.value }))
                      }
                      className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none transition"
                      style={{
                        background: "#ded7ce",
                        borderColor: "#cfc6bc",
                        color: "#173126",
                      }}
                    />
                  </Field>
                ) : null}

                <Field label="Email">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none transition"
                    style={{
                      background: "#dde6f2",
                      borderColor: "#c7cfd8",
                      color: "#173126",
                    }}
                  />
                </Field>

                <Field label="Password">
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, password: e.target.value }))
                    }
                    className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none transition"
                    style={{
                      background: "#dde6f2",
                      borderColor: "#c7cfd8",
                      color: "#173126",
                    }}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-16 w-full items-center justify-center rounded-[18px] text-[18px] font-medium transition disabled:opacity-60"
                  style={{
                    background: "#0b101b",
                    color: "#f5f3ee",
                  }}
                >
                  {submitting
                    ? "Please wait..."
                    : mode === "signup"
                    ? "Create Account"
                    : "Log In"}
                </button>

                {msg ? (
                  <div className="text-center text-sm text-red-600">{msg}</div>
                ) : null}
              </form>

              <div
                className="mt-12 rounded-[24px] border p-8"
                style={{
                  background: "#e7dfd5",
                  borderColor: "#ddd3c8",
                }}
              >
                <h3
                  className="text-[20px] font-medium sm:text-[21px]"
                  style={{ color: "#0f5132" }}
                >
                  What happens after login?
                </h3>

                <ul className="mt-5 space-y-4 text-[16px] leading-relaxed text-[rgba(23,49,38,0.78)]">
                  {infoItems.map((item) => (
                    <li key={item} className="flex gap-4">
                      <span className="mt-[10px] h-3 w-3 shrink-0 rounded-full bg-[#d49333]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
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
    <label className="block">
      <div className="mb-3 text-[18px] font-semibold text-[#1f5a3b]">{label}</div>
      {children}
    </label>
  );
}
