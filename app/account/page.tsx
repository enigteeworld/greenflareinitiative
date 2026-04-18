"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  campus: string | null;
  hostel: string | null;
  role: string | null;
  trust_score: number | null;
  onboarding_completed: boolean | null;
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/auth?next=/account");
        return;
      }

      setEmail(session.user.email || null);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!data || !data.onboarding_completed) {
        router.replace("/onboarding?next=/account");
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
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
            <div className="text-lg font-semibold">Loading account…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="text-3xl font-semibold tracking-tight">
                My Account
              </div>

              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Your GreenFlare participant profile.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Info label="Full Name" value={profile?.full_name} />
                <Info label="Display Name" value={profile?.display_name} />
                <Info label="Email" value={profile?.email || email} />
                <Info label="Phone" value={profile?.phone} />
                <Info label="Campus" value={profile?.campus} />
                <Info label="Hostel / Hall" value={profile?.hostel} />
                <Info label="Role" value={profile?.role} />
                <Info
                  label="Trust Score"
                  value={profile?.trust_score?.toString() || "0"}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/submit"
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accentText)",
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

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="text-lg font-semibold">Next layer</div>

              <ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
                <li>• Link submissions to authenticated user IDs</li>
                <li>• Show submission history here</li>
                <li>• Add trust score and reputation tier logic</li>
                <li>• Add sponsor-backed reward visibility later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel2)",
      }}
    >
      <div className="text-xs font-semibold" style={{ color: "var(--muted2)" }}>
        {label}
      </div>
      <div className="mt-2 text-sm" style={{ color: "var(--text)" }}>
        {value || "—"}
      </div>
    </div>
  );
}